### 📋 Contexto de Proyecto: PASCAL (Real Estate OS)

**Stack:** Next.js (App Router), Prisma (PostgreSQL), Pusher (Real-time), Better-Auth, Shadcn/UI.
**Objetivo:** Plataforma dual con Chat Inmobiliario Público (Leads) y Dashboard Privado (Agentes/Admin).

#### 1. Arquitectura "Dual World"
* **Zona Pública (`/src/app/public`):**
    * Acceso sin login (Guest).
    * Persistencia de sesión: `localStorage` (UUID) + Reconciliación por email en servidor.
    * Layout minimalista.
* **Zona Intranet (`/src/app/intranet`):**
    * **Admin:** `/admin` (Dashboard, CRUD Usuarios, Supervisión).
    * **Sales Agent:** `/sales-agent` (Cola de Leads, "Mis Chats").
    * **Auth:** Better-Auth (Session Cookies). Paginas `force-dynamic`.

#### 2. Esquema de Datos (Prisma)
* `User`: Agentes/Admins.
* `Lead`: Visitantes (ID = UUID generado en cliente o `cuid` si existe email). Campo `lastSeen`.
* `Conversation`: Estados `QUEUED`, `IN_PROGRESS`, `RESOLVED`.
* `Message`: Sender `LEAD`, `AGENT`, `SYSTEM`.

#### 3. Lógica Crítica Implementada (Reglas de Oro)
* **Identidad del Lead (Client-First):**
    * El `leadId` nace en `localStorage`.
    * **Smart Handshake:** Al enviar mensaje (`startConversation`), se busca el email en DB. Si existe, se descarta el ID temporal del navegador y se usa el ID histórico (Merge).
    * **Lazy Creation:** Solo se crea registro en DB al enviar el primer mensaje.
* **Real-time (Pusher):**
    * Canales de Presencia para estado Online (sin `isOnline` en DB).
    * Auth Endpoint híbrido: Valida sesión (Agente) O firma `socketId` con datos de localStorage (Lead).
* **Asignación de Chats (Concurrency):**
    * Acción `assignConversationToAgent`: Usa `prisma.$transaction`.
    * Verifica que `agentId` sea `null` antes de escribir para evitar condiciones de carrera entre agentes.

#### 4. Estructura de Carpetas Clave
* `src/components/chat-workspace`: Componente reutilizable para Admin/Agent.
* `src/actions/chat.ts`: Lógica de inicio de chat y reconciliación de identidad.
* `src/actions/agent-chat.ts`: Lógica transaccional para tomar leads.
* `src/lib/pusher.ts` (Server) & `pusher-client.tsx` (Client).

#### 5. Documentación Técnica (`/docs`)
* **`design-standars.md`**: Estándares de diseño UI/UX. Define principios de diseño (claridad > creatividad), uso de Shadcn/UI, sistema de tokens semánticos CSS, responsividad mobile-first, manejo de estados loading/error y convenciones de código.
* **`error-handling.md`**: Patrón Result para manejo de errores. Elimina `try/catch` en UI, usa `handleResponse` para APIs propias, implementa feedback visual (Toasts con Sonner para errores de sistema, inline para validación). Incluye snippet maestro para formularios con React Hook Form + Arktype.
* **`project.md`**: Arquitectura y estructura de directorios del proyecto. Documenta el Tech Stack (Next.js, Prisma, Better-Auth, Pusher, Zustand) y organización de carpetas (`/app`, `/components`, `/lib`, `/services`, `/actions`, `/types`, etc.) con convenciones de imports.
* **`services-guide.md`**: Arquitectura monolítica modular sin API REST interna. Define capas Services (lógica de negocio con `'server-only'`), Actions (controladores con `'use server'`) y UI (Server Components con Suspense). Incluye patrones de implementación y checklist de aprobación.
* **`types-and-schemas-guide.md`**: Validación exhaustiva con ArkType. Esquemas con mensajes en español para escrituras (Create/Update), reutilización de tipos Prisma para lecturas. Define convenciones, sintaxis de validaciones, y estrategia de integración con Prisma.

> **Nota:** Si es necesario profundizar en algún tema específico según el requerimiento, analizar el documento correspondiente en detalle. Estos archivos son la fuente de verdad y deben ser consultados rigurosamente para garantizar el cumplimiento de los estándares del proyecto.
