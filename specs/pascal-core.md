### 1. ARQUITECTURA "DUAL WORLD"
La aplicación debe dividirse lógicamente en dos zonas. Usa **Route Groups** de Next.js para separar layouts y protecciones:

A. ZONA PÚBLICA (Lead):
- Accesible sin login tradicional.
- El usuario es un "Visitante" o "Lead".
- Persistencia de sesión basada en `localStorage` (para recuperar chats si recarga).
- Layout minimalista (sin sidebars complejos).

B. ZONA INTRANET (Sales Agent & Admin):
- **Estrategia de Login Simplificada:** La ruta `/intranet` (root) servirá como Login. Solo las subrutas `/admin` y `/sales-agent` estarán protegidas.

### 2. REGLAS DE NEGOCIO Y FLUJOS

#### A. Flujo del Lead (Guest User)
1. **Inicialización:** Al abrir el widget/página, verificar `localStorage`.
   - Si existe `leadToken` o `conversationId` activo: Reconectar automáticamente y cargar historial.
   - Si no existe: Mostrar UI de bienvenida.
2. **Creación:** Al enviar el primer mensaje:
   - Se genera una intención de chat.
   - El Lead entra en una "Cola Virtual" (Estado lógico: WAITING).
   - Se guarda la identidad en el navegador.
3. **Feedback Visual:** Mostrar claramente "Esperando a un asesor..." mientras nadie tome el chat.

#### B. Flujo del Agente (Admin User)
1. **Dashboard:** Debe visualizar dos listas en tiempo real:
   - "Leads en Cola" (Nuevos, sin asignar).
   - "Mis Conversaciones" (Asignados a mí).
2. **Acción "Tomar Lead":**
   - Al seleccionar un chat de la cola, el Agente se asigna como propietario.
   - El estado del chat cambia a IN_PROGRESS.
   - El Lead recibe notificación inmediata de "Agente X se ha unido".

### 2. INFRAESTRUCTURA REAL-TIME (PUSHER)
Implementa la comunicación en tiempo real utilizando estrictamente los siguientes archivos de configuración existentes o por crear:
- **Server-Side:** Usa `src/lib/pusher.ts` para la instancia del servidor (`pusher`).
- **Client-Side:** Usa `src/lib/pusher-client.tsx` para la instancia del cliente (`pusher-js`).
- **Auth Endpoint:** El endpoint `/api/pusher/auth/route.ts` debe manejar la lógica híbrida:
    - Si hay sesión (Agente) -> Autentica con datos del usuario (`session.user`).
    - Si NO hay sesión (Lead) -> Autentica usando el `userId` enviado por el cliente (desde localStorage) sin crear registro en DB todavía.
    - Dicho archivo está blindado y listo para producción. Cumple con los criterios de seguridad de "Whitelisting" (solo canales permitidos) y "Ownership" (solo tu propio ID), cerrando la brecha de espionaje.
- **Presence Channels:** Usa canales de presencia para detectar el estado online/offline sin pings manuales.
- **Detección de Estado:** Necesito saber si el Lead sigue en la web o cerró la pestaña sin usar `setInterval` o pings manuales. Confía en los eventos de `member_added` / `member_removed` del canal de presencia.
- **Concurrencia:** Si el Lead tiene 3 pestañas abiertas, el mensaje debe llegar a las 3, pero el input debe sincronizarse (opcional en MVP, pero tenlo en cuenta).

---

### 3. ESTRUCTURA DE RUTAS Y CARPETAS
Implementa estrictamente el siguiente árbol en `src/app`. Nota que `intranet` es una carpeta normal (afecta la URL), actuando como barrera de autenticación inicial.

/src
  /app
    /public               # Acceso público (Leads)
      /chat/page.tsx      # Widget/Pantalla completa del chat cliente
      /layout.tsx         # Layout limpio (sin sidebar)

    /intranet # Acceso publico para no complicarnos
      page.tsx            # Login
      /admin              # Rol: Super Admin
        /dashboard/page.tsx # Dashboard
        /users            # CRUD Usuarios
          /page.tsx
          /new/page.tsx
          /[userId]/page.tsx # Editar usuario específico
        /chats            # Supervisión de chats
          /page.tsx       # Ver todos los chats (activos e históricos)
          /[conversationId]/page.tsx # Entrar a observar/intervenir

      /sales-agent        # Rol: Vendedor
        /dashboard/page.tsx # Dashboard
        /chats            # Espacio de trabajo del vendedor
          /page.tsx       # Tabs: "En Cola" vs "Mis Chats"
          /[conversationId]/page.tsx # Sala de chat activa

### ESTRATEGIA DE COMPONENTES (REUTILIZACIÓN)
No dupliques código entre el chat del Admin y el del Agente.
Crea una carpeta `src/components/chat-workspace`.
- El componente principal debe ser `<ChatWorkspace conversationId={...} mode="admin|agent" />`.
- `mode="agent"`: Permite tomar chats de la cola, enviar mensajes como "Asesor".
- `mode="admin"`: Permite ver chats de otros, forzar cierre, reasignar (features futuras).
- Prioriza código limpio y fácil reutilización.

### Protección de rutas
Apoyate del archivo existente `src/proxy.ts` en el que usamos el framework de better-auth

### CONSISTENCIA DE DATOS Y CACHÉ
- Asegúrate de que las páginas bajo `/intranet` sean **Dynamic Server Components**, ya sea /intranet/sales-agent/dashboard donde cada sales-agent vería diferente informacion. Incluso si habría más administradores tendrían diferentes datos que se mostrarían en su dashboard.
- Dado que usamos autenticación por cookies/headers, Next.js no debe cachear estáticamente las vistas privadas del Dashboard.
- Si es necesario, añade `export const dynamic = 'force-dynamic'` en las páginas de dashboard para garantizar datos frescos de la DB.

### ESTRATEGIA DE UI/UX (SIDEBARS & LAYOUTS)
Implementa layouts diferenciados por rol utilizando componentes de **shadcn/ui**.
- **Admin Layout:** En `/intranet/admin/layout.tsx`, renderiza un `<AdminSidebar />` que contenga navegación a: Dashboard, Usuarios, Supervisión de Chats.
- **Agent Layout:** En `/intranet/sales-agent/layout.tsx`, renderiza un `<AgentSidebar />` que contenga navegación a: Dashboard, Mis Chats.
- **Implementación:** Crea estos sidebars en `src/components/layout/`. Deben ser responsive (Sheet para mobile, Sidebar fijo para desktop) siguiendo los estándares de diseño del proyecto.


### 1\. DETALLE DE LA LANDING PAGE (`/page.tsx`)
**Propósito:** Vender la visión de "Pascal" (El OS inmobiliario del futuro) y capturar leads.
**Contenido & UI:**
  * **Hero Section:** Título impactante: *"Pascal: El sistema operativo que mueve el Real Estate"*. Subtítulo sobre inteligencia artificial y velocidad.
  * **Showcase de Proyectos (Peruvian Context):** Muestra una grilla con 3 tarjetas de proyectos inmobiliarios "Demo" (Hardcoded por ahora):
    1.  *Torre Begonias Luxury* (San Isidro) - Inmobiliaria "Platinum". Precio: Desde $250,000.
    2.  *Residencial Barranco Vibe* (Barranco) - Inmobiliaria "Urbana". Precio: Desde $140,000.
    3.  *Eco-Condominio El Olivar* (Jesus María) - Inmobiliaria "Vida Verde". Precio: Desde $110,000.
  * **Chat Widget (Floating Action Button):**
      * Ubicación: Esquina inferior derecha.
      * Estado Inicial: Cerrado (Icono de mensaje).
      * Estado Abierto: **FORMULARIO DE CAPTURA (Bloqueante).**
  * Asimismo, en la página actual estamos usando colores que serían parte de la paleta de colores de la empresa, asimismo hemos definido un color amarillo en global.css

### LÓGICA DE UX: "SMART HANDSHAKE" (CAPTURA VS. REANUDACIÓN)
El widget de chat debe comportarse de manera inteligente para reducir la fricción. No debe pedir datos si el usuario ya es conocido.

**1. Fase de Verificación (Al cargar la página/abrir widget):**
   - El frontend lee el `leadId` del `localStorage`.
   - **Server Action Check:** Ejecuta una consulta ligera al servidor (`getLeadStatus(leadId)`).
   - **El Servidor responde:**
     - `exists`: Boolean (¿Está en la tabla Lead?).
     - `activeConversationId`: String | null (¿Tiene un chat en estado QUEUED o IN_PROGRESS?).

**2. Escenario A: Usuario Nuevo (o ID no encontrado)**
   - **UI:** Mostrar el **"Micro-Formulario de Captura"**.
   - **Campos (Baja Fricción):**
     1. Nombre (Input simple).
     2. WhatsApp/Teléfono (Input numérico).
     3. Email (Input simple).
     4. Proyecto de Interés (Dropdown preseleccionado si está en la página de un proyecto, o general).
   - **Acción:** Al enviar, se hace el `UPSERT` en DB, se guarda el `leadId` y se inicia la conversación.

**3. Escenario B: Usuario Recurrente (Reconexión)**
   - Si `exists === true`, **SALTAR el formulario**.
   - **UI:** Mostrar directamente la interfaz de chat.
   - **Estado:**
     - Si hay `activeConversationId`: Cargar ese historial y reconectar al canal de Pusher existente.
     - Si NO hay chat activo (ej: sus chats anteriores están RESOLVED): Crear una nueva conversación transparente ("Bienvenido de nuevo, Juan. ¿En qué te ayudamos hoy?") y conectar.

**4. Manejo de Identidad en Tiempo Real:**
   - La conexión al socket (Pusher) se realiza usando el `leadId`.
   - Si el usuario refresca la página, la lógica del paso 1 detecta la sesión activa y restaura el chat sin parpadeos ni formularios repetidos.

### DETALLE DE LA INTRANET (`/intranet/page.tsx`)
**Propósito:** Acceso exclusivo para empleados.

**UI de Login:**
  * Título: "CRM PASCAL - Acceso Corporativo".
  * Botones:
      * "Iniciar Sesión con Email" (Formulario).
      * "Acceder con Google" (Botón Social).

**Reglas de Autenticación (SECURITY HARDENING):**
  * **Registro Desactivado:** No debe existir botón de "Registrarse" o "Crear cuenta".
  * **Lógica de Login con Google:**
      * Al recibir el callback de Google, buscar el email en la tabla `User`.
      * **SI el email existe:** Permitir acceso.
      * **SI el email NO existe:** BLOQUEAR acceso y mostrar error: *"Acceso denegado. Contacte al administrador para ser dado de alta."*
  * **Admin Seeding:** El primer administrador o el usuario cero será insertado mediante un seed o directo a DB

### ARQUITECTURA DE DATOS
```prisma
// ENUMS ------------------------------------------------

enum ChatStatus {
  QUEUED       // Lead escribió, nadie ha respondido (Aparece en "En Cola")
  IN_PROGRESS  // Un agente tomó el chat (Aparece en "Mis Conversaciones")
  RESOLVED     // Finalizado (Historial)
}

enum SenderType {
  LEAD
  AGENT
  SYSTEM       // Para mensajes como: "El agente Juan se ha unido al chat"
}

// MODELS -----------------------------------------------

// 1. El Agente/Admin (Tu tabla de usuarios existente)
model User {
  id        String   @id
  name      String
  email     String
  role      String?     @default("sales_agent")

  // Relación: Un agente atiende muchas conversaciones
  conversations Conversation[]

  // ... otros campos de tu auth (image, password, etc)
}

// 2. El Visitante (Lead)
// Se crea automáticamente cuando el usuario anónimo manda el primer mensaje.
model Lead {
  id        String   @id @default(uuid()) // Este UUID se guarda en localStorage del cliente
  name      String?
  email     String?  @unique
  phone     String?

  createdAt DateTime @default(now())
  lastSeen  DateTime @default(now()) // Para purgar leads fantasmas si fuera necesario

  conversations Conversation[]
  @@index([email])
}

// 3. La Conversación (La "Sala")
model Conversation {
  id        String      @id @default(cuid())

  // Gestión de Estado y Cola
  status    ChatStatus  @default(QUEUED)
  priority  String?     @default("NORMAL") // "HIGH" si viene de una propiedad cara (futuro)

  // Tiempos para métricas
  createdAt DateTime    @default(now()) // Hora de entrada a la cola
  assignedAt DateTime?  // Hora en que el agente lo tomó (Para medir tiempo de respuesta)
  closedAt  DateTime?   // Hora de cierre

  // Relaciones
  leadId    String
  lead      Lead        @relation(fields: [leadId], references: [id])

  agentId   String?     // Es NULL mientras está en QUEUED
  agent     User?       @relation(fields: [agentId], references: [id])

  messages  Message[]

  // Índices para que el Dashboard de "Cola" cargue rápido
  @@index([status, createdAt])
  @@index([agentId, status])
}

// 4. Los Mensajes
model Message {
  id             String      @id @default(cuid())
  content        String      @db.Text

  // Saber quién lo mandó es vital para pintar la burbuja a la derecha o izquierda
  senderType     SenderType

  // Metadatos de lectura
  isRead         Boolean     @default(false)
  readAt         DateTime?

  // Relaciones
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id], onDelete: Cascade)

  createdAt      DateTime    @default(now())

  // Opcional: Si quieres soportar adjuntos o "Product Cards" en el futuro
  attachmentUrl  String?
  metadata       Json?       // Ej: { "type": "property_card", "propertyId": "123" }

  @@index([conversationId])
}
```

### ESTRATEGIA DE GESTIÓN DE IDENTIDAD DEL LEAD (CLIENT-FIRST)

Para evitar llenar la base de datos de registros "fantasma" y garantizar la persistencia de la conversación tras recargas de página, implementaremos la siguiente lógica:

1.  **Origen de la Verdad (Frontend):**
    * La identidad del Lead **nace en el cliente**, no en el servidor.
    * Al cargar la aplicación pública, se verifica el `localStorage`.
    * Si no existe un ID, el navegador genera un UUID v4 y lo almacena localmente. Este ID será la "cédula de identidad" del visitante.

2.  **Autenticación WebSocket (Stateless):**
    * Al conectarse a Pusher, el cliente envía este UUID almacenado.
    * El endpoint de autenticación **NO crea registros en la base de datos**. Simplemente firma el token permitiendo al usuario conectarse al canal de presencia con esa identidad temporal.
    * *Beneficio:* Si el usuario refresca la página, reutiliza el mismo ID y Pusher reconoce que es la misma persona (evitando duplicados visuales).

3.  **Momento de Creación en DB (Lazy Creation):**
    * El registro en la tabla `Lead` de la base de datos **SOLO** se crea cuando el usuario realiza una acción de valor: **Enviar su primer mensaje**.
    * El Server Action de `sendMessage` recibe el UUID del cliente y ejecuta una operación **UPSERT** (Buscar si existe; si no, crear).
    * *Beneficio:* Mantenemos la base de datos limpia de visitantes curiosos que nunca interactúan.

4.  **Estado de Conexión (Presencia):**
    * No almacenaremos un campo `isOnline` en la base de datos ni en el token de usuario.
    * El estado "En Línea" se determina exclusivamente en tiempo real consultando la lista de miembros (`members`) del canal de presencia de Pusher.

#### Server Action: "Handshake & Send" (`src/actions/chat.ts`)

Maneja la lógica atómica de crear Lead + Conversación + Mensaje.
- Antes de confiar ciegamente en el `leadId` que manda el navegador, preguntamos: *"¿Ya conozco este email?"*.

```typescript
'use server'

import { db } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";

interface StartChatParams {
  leadId: string; // UUID temporal generado por el navegador
  name: string;
  phone: string;
  email: string;  // AHORA ES OBLIGATORIO PARA LA RECONCILIACIÓN
  projectId?: string;
  message: string;
}

export async function startConversation(data: StartChatParams) {
  let finalLeadId = data.leadId;

  // ---------------------------------------------------------
  // 1. RECONCILIACIÓN DE IDENTIDAD (Punto 3 corregido)
  // ---------------------------------------------------------

  // Paso A: Buscamos si el email ya existe en nuestra DB
  const existingLeadByEmail = await db.lead.findUnique({
    where: { email: data.email } // Asegúrate de que en schema.prisma email tenga @unique o @@index
  });

  if (existingLeadByEmail) {
    // CASO: Usuario recurrente que borró cookies o cambió de dispositivo.
    // Ignoramos el 'data.leadId' nuevo que generó el navegador y usamos el histórico.
    finalLeadId = existingLeadByEmail.id;

    // Actualizamos sus datos recientes
    await db.lead.update({
      where: { id: finalLeadId },
      data: {
        name: data.name,
        phone: data.phone,
        lastSeen: new Date(),
      }
    });
  } else {
    // CASO: Usuario totalmente nuevo o email no registrado.
    // Usamos el ID que generó el navegador (upsert por seguridad si llega a haber colisión rara)
    const newLead = await db.lead.upsert({
      where: { id: finalLeadId },
      update: {
        email: data.email,
        name: data.name,
        phone: data.phone,
        lastSeen: new Date(),
      },
      create: {
        id: finalLeadId,
        email: data.email,
        name: data.name,
        phone: data.phone,
      }
    });
    finalLeadId = newLead.id;
  }

  // ---------------------------------------------------------
  // 2. GESTIÓN DE LA CONVERSACIÓN
  // ---------------------------------------------------------

  // Buscamos conversación activa usando el ID DEFINITIVO (finalLeadId)
  let conversation = await db.conversation.findFirst({
    where: {
      leadId: finalLeadId,
      status: { in: ['QUEUED', 'IN_PROGRESS'] }
    }
  });

  if (!conversation) {
    conversation = await db.conversation.create({
      data: {
        leadId: finalLeadId,
        status: 'QUEUED',
        priority: 'NORMAL'
      }
    });

    // Notificamos al Dashboard de Agentes
    await pusherServer.trigger('agents-dashboard', 'new-lead', {
      conversationId: conversation.id,
      leadName: data.name,
      projectName: data.projectId,
      timestamp: new Date()
    });
  }

  // ---------------------------------------------------------
  // 3. ENVIAR MENSAJE
  // ---------------------------------------------------------
  const newMessage = await db.message.create({
    data: {
      conversationId: conversation.id,
      content: data.message,
      senderType: 'LEAD'
    }
  });

  await pusherServer.trigger(`private-chat-${conversation.id}`, 'new-message', newMessage);

  // IMPORTANTE: Devolvemos el finalLeadId.
  // Si el servidor detectó que el usuario ya existía, el frontend debe
  // actualizar su localStorage con este ID real para futuras sesiones.
  return {
    conversationId: conversation.id,
    status: conversation.status,
    confirmedLeadId: finalLeadId
  };
}
```

### ¿Qué cambia esto en tu Frontend?

Ahora, cuando llames a esta Server Action desde tu componente de Chat, debes manejar la respuesta para "corregir" la identidad local si es necesario.

**En tu `ChatWidget.tsx` (Lógica conceptual):**

```javascript
const handleSubmit = async (formData) => {
   // 1. ID temporal actual
   const localLeadId = localStorage.getItem('pascal_lead_id');

   // 2. Llamada al Server Action
   const response = await startConversation({
      leadId: localLeadId,
      email: formData.email,
      // ... otros datos
   });

   // 3. AJUSTE DE IDENTIDAD (El "Merge")
   // Si el servidor dice "Oye, este usuario en realidad es ID-ANTIGUO",
   // actualizamos el navegador para que no pierda su historial real.
   if (response.confirmedLeadId !== localLeadId) {
      localStorage.setItem('pascal_lead_id', response.confirmedLeadId);
      // Opcional: Recargar o reconectar sockets con el nuevo ID
   }

   // 4. Abrir chat...
}
```

### **Condición de Carrera en "Tomar Lead":**
  * *Riesgo:* Dos agentes hacen click en "Tomar Chat" al mismo tiempo. Ambos reciben éxito en UI, pero la DB queda inconsistente.
  * *Solución:* Uso obligatorio de `prisma.$transaction`. Verificamos que `agentId` sea `null` dentro de la misma transacción que actualiza. Si ya no es null, lanzamos error y el segundo agente recibe un toast: *"Otro agente ya tomó este chat"*.

Tener en cuenta la siguiente solución, valídalo, y añadelo al proyecto `src/actions/agent-chat.ts`:
```typescript
'use server'

import { db } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Conversation } from "@prisma/client"; // Tipado de Prisma
import { Result } from "@/types/result.types"; // Tu tipo Result Pattern

export async function assignConversationToAgent(conversationId: string): Promise<Result<Conversation>> {
  try {
    // 1. Verificación de Sesión
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session?.user) {
      return { success: false, error: "No autorizado. Debes iniciar sesión." };
    }

    const agentId = session.user.id;
    const agentName = session.user.name || "Agente";

    // 2. Transacción de Base de Datos
    const updatedConversation = await db.$transaction(async (tx) => {
      // A. Verificación Pesimista (Lock lógico)
      const currentChat = await tx.conversation.findUnique({
        where: { id: conversationId }
      });

      if (!currentChat) {
        throw new Error("La conversación no existe o fue eliminada.");
      }

      // B. EL GUARDIA: Si ya tiene agente y no soy yo
      if (currentChat.agentId && currentChat.agentId !== agentId) {
        throw new Error("Este chat ya fue tomado por otro agente.");
      }

      // C. Actualización Atómica
      const updated = await tx.conversation.update({
        where: { id: conversationId },
        data: {
          agentId: agentId,
          status: 'IN_PROGRESS',
          assignedAt: new Date()
        },
        include: { lead: true } // Incluimos datos para devolver el objeto completo
      });

      // D. Mensaje de Sistema
      await tx.message.create({
        data: {
          conversationId,
          content: `${agentName} se ha unido al chat.`,
          senderType: 'SYSTEM'
        }
      });

      return updated;
    });

    // 3. Efectos Secundarios (Fuera de transacción para no bloquear DB)

    // Notificar al Lead (Canal Privado)
    await pusherServer.trigger(`private-chat-${conversationId}`, 'agent-joined', {
       agentName: agentName,
       agentId: agentId
    });

    // Actualizar Dashboard Global
    await pusherServer.trigger('agents-dashboard', 'conversation-assigned', {
       conversationId: conversationId,
       agentId: agentId
    });

    // 4. Retorno Exitoso (Happy Path)
    return { success: true, value: updatedConversation };

  } catch (error: unknown) {
    // 5. Manejo de Errores Seguro (Sin 'any')
    console.error("[ASSIGN_AGENT_ERROR]", error); // Log interno permitido

    let message = "Ocurrió un error inesperado al asignar el chat.";

    if (error instanceof Error) {
      message = error.message;
    } else if (typeof error === "string") {
      message = error;
    }

    return { success: false, error: message };
  }
}
```