### Contexto del Proyecto

Estás trabajando en **PASCAL**, un Real Estate OS (Sistema Operativo Inmobiliario) construido con Next.js, Prisma, PostgreSQL, Pusher y Better-Auth. El proyecto sigue una arquitectura dual con una zona pública para Leads y una zona privada (Intranet) para Agentes y Administradores.

### Instrucciones Específicas para Esta Implementación

**Objetivo**: Implementar un módulo de análisis automático de conversaciones usando IA (OpenAI GPT-4o-mini) que extraiga resumen, tags y prioridad en tiempo real.

**Requisitos NO Negociables:**

1. **Análisis Automático Después de Cada Mensaje**
   - La función `analyzeConversation` debe ejecutarse automáticamente **después de cada mensaje enviado o recibido**
   - Ejecución asíncrona (Fire-and-Forget): **sin bloquear** la respuesta al usuario
   - El Service `analyzeConversation` debe usar `await` internamente y retornar `Promise<Result<T>>`
   - En la Action que envía mensajes, llama al Service sin `await` para ejecución en segundo plano
   - Todos los errores deben encapsularse en el `Result<T>` (nunca lanzar excepciones)
   - El summary debe actualizarse automáticamente tras cada interacción

2. **Prompt del Sistema (LLM)**
   - Usa el rol: "You are an expert Real Estate Lead Analyst"
   - Analiza el historial completo de la conversación
   - Output JSON con: `summary`, `tags`, `priority`
   - Tags permitidos (máximo 3): `hot-lead`, `schedule-request`, `pricing-query`, `location-query`, `objection`, `competitor-mention`, `follow-up-needed`
   - Prioridad según reglas de negocio:
     - `HIGH`: Intent to visit, discusses payment, budget ready, high urgency
     - `MEDIUM`: Asking about price, location, photos, exploring phase
     - `LOW`: Unresponsive, greeting only, no interest

3. **Persistencia y Real-time**
   - Actualiza el modelo `Conversation` con: `aiSummary`, `aiTags`, `priority`
   - **IMPORTANTE**: Emite evento Pusher `conversation:updated` tras guardar para actualización en tiempo real en la UI
   - Esto permite que los agentes vean los cambios inmediatamente sin refrescar la página

4. **Manejo de Errores**
   - Si OpenAI falla, registra `console.error` pero no crashes
   - Retorna `{ success: false, error: "..." }` sin romper el flujo
   - La UI debe seguir funcionando aunque el análisis falle

5. **Trigger de Ejecución**
   - Integra en la Server Action existente que crea mensajes (`sendMessage` o similar)
   - Ejecuta **después** de guardar el mensaje en BD
   - No bloquees la respuesta al usuario
   - Aplica tanto para mensajes del Lead como del Agente

6. **UI para Agentes de Ventas**
   - El AI Summary debe mostrarse en el panel de información del Lead (Lead Information Panel)
   - Los AI Tags deben ser visibles y usables como filtros en la lista de conversaciones
   - La Priority debe mostrarse visualmente (ej: badge con colores: rojo=HIGH, amarillo=MEDIUM, gris=LOW)
   - Actualización en tiempo real vía Pusher cuando el análisis se complete

### Checklist de Implementación

Antes de aprobar tu código, verifica:

**Services:**
- [ ] Tiene `import 'server-only'`
- [ ] Usa `try/catch` explícito
- [ ] Retorna `Promise<Result<T>>`
- [ ] Valida inputs con ArkType (si es escritura)

**Actions:**
- [ ] Tiene `'use server'`
- [ ] Ejecuta `revalidatePath()` tras mutaciones exitosas
- [ ] Actúa como puente (no duplica lógica de Services)

**UI/UX:**
- [ ] Usa `<Suspense>` para carga asíncrona
- [ ] Guard clauses: `if (!result.success)` antes de acceder a `result.value`
- [ ] Toasts para errores de sistema
- [ ] Mensajes inline para validación de formularios

**Schemas:**
- [ ] Esquemas solo para operaciones de escritura
- [ ] Mensajes en español con `.configure()`
- [ ] Tipos inferidos con `typeof Schema.infer`
- [ ] Lecturas usan tipos de Prisma directamente

**Real-time:**
- [ ] Eventos Pusher emitidos tras actualizar BD
- [ ] Nombres de eventos descriptivos (`conversation:updated`)

---

### Instrucciones de Implementación: Módulo de Análisis de Conversación con IA

#### PASO 1: Actualización del Schema de Base de Datos

Por favor, modifica el archivo `schema.prisma`. Necesitamos agregar campos al modelo `Conversation` para almacenar el output de la IA.

Añade los siguientes campos al modelo `Conversation`:

```prisma
model Conversation {
  // ... campos existentes (id, status, priority, etc.)

  // Nuevos campos para IA
  aiSummary   String?   @db.Text
  aiTags      String[]  @default([]) // Array de strings nativo de Postgres

  // Nota: El campo 'priority' ya existe en el modelo, lo reutilizaremos.
}
```

*Acción requerida:* Una vez editado el archivo, ejecuta el comando de migración/push necesario para sincronizar la base de datos local.

#### PASO 2: Implementación de la Lógica de Análisis (Server Action / Service)

Crea una nueva función asíncrona (preferiblemente en `src/actions/ai.ts` o un servicio similar) llamada `analyzeConversation(conversationId: string)`.

**Requerimientos de la Función:**
1.  **Recuperación de Datos:**
  * Busca la conversación por `id` usando Prisma.
  * Incluye la relación `messages`.
  * Ordena los mensajes por `createdAt` ascendente.

2.  **Pre-procesamiento del Historial:**
  * Itera sobre los mensajes y construye un string de texto plano formateado.
  * Usa el enum `SenderType` para identificar el rol:
    * Si `SenderType.LEAD` → Prefijo "Prospecto: "
    * Si `SenderType.AGENT` → Prefijo "Agente: "
    * Si `SenderType.SYSTEM` → Ignorar.

3.  **Interacción con LLM (OpenAI):**
  * Modelo: `gpt-4o-mini` (o `gpt-3.5-turbo`).
  * Formato de respuesta: **JSON Object** (`response_format: { type: "json_object" }`).
  * Temperatura: 0.3 (para consistencia).

4.  **Prompt del Sistema (System Prompt):**
  Configura el rol del modelo con las siguientes instrucciones exactas de negocio:

```text
Role: You are an expert Real Estate Lead Analyst.
Task: Analyze the chat history between a "Agente" (Sales Rep) and a "Prospecto" (Lead).

Output JSON Schema:
{
  "summary": "String. Concise business summary (max 2 sentences). Focus on needs: budget, location, type, timeline.",
  "tags": "String Array. Select max 3 from allowed list.",
  "priority": "String. Enum: 'HIGH', 'MEDIUM', 'LOW'."
}

Business Rules:
1. PRIORITY:
    - 'HIGH': Intent to visit/tour, discusses contract/payment, specific budget ready, or high urgency.
    - 'MEDIUM': Asking about price, location, photos, or amenities. Exploring phase.
    - 'LOW': Unresponsive, greeting only, just looking, or stated lack of interest.

2. ALLOWED TAGS (Strict):
    - 'hot-lead' (Ready to buy/rent)
    - 'schedule-request' (Wants to visit)
    - 'pricing-query' (Asking about cost)
    - 'location-query' (Asking about area)
    - 'objection' (Price too high, doesn't like feature)
    - 'competitor-mention'
    - 'follow-up-needed'

3. SUMMARY:
    - Provide actionable info. Example: "Looking for 2BR in Downtown, budget $150k. Wants to visit Monday."
```

5.  **Persistencia:**
  * Toma el JSON devuelto por OpenAI que debería ser validado con ArkType para una mayor seguridad.
  * Actualiza la `Conversation` en la base de datos con los valores: `aiSummary`, `aiTags` y `priority`.

6.  **Manejo de Errores:**
    * Implementa un bloque `try/catch`. Si la llamada falla, registra el error en consola (`console.error`) pero no lances una excepción que rompa el flujo de la aplicación principal.