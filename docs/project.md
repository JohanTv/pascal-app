# Arquitectura del Proyecto & Estructura de Directorios
Este documento detalla la organización del código fuente para el Pascal Real Estate OS.

## Tech Stack
- **Runtime**: Bun
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4, Shadcn UI, Motion
- **Database**: Prisma, PostgreSQL
- **Auth**: Better-Auth
- **Realtime**: Pusher
- **Tools**: Biome
- **State Management**: Zustand (Cuando llegue el momento)

## Estructura de Carpetas (`/src`)

### `/app` (Next.js App Router)
Contiene las rutas, páginas y layouts de la aplicación.
- **/api**: Endpoints de backend (Auth, Webhooks, Pusher Auth).
- **/dashboard**: Rutas protegidas para el Sales Agent.
- **/ (root)**: Landing page y rutas públicas para Leads.

### `/components`
Componentes de React reutilizables.
- **/ui**: Componentes base de diseño (Atomic Design / Shadcn UI). Botones, inputs, modales.
- **/ui/icons**: Iconos personalizados.
- **/home**: Componentes específicos de la Landing Page.
- **/feature-name**: Componentes específicos de un feature o entidad particular (ej. `user/create`, `user/update`, `user/showUserDetail.tsx`).

### `/lib`
Configuraciones de servicios externos y singletons. Aquí reside la lógica "core".
- `db.ts`: Instancia de Prisma Client.
- `pusher.ts`: Instancia de servidor de Pusher (Triggers).
- `pusher-client.ts`: Instancia de cliente de Pusher (Listeners).
- `auth.ts`: Configuración de Better-Auth para el servidor.
- `auth-client.ts`: Configuración de Better-Auth para el cliente.

### `/utils`
Funciones auxiliares puras (Helpers).
- Formateo de fechas, manejo de errores genéricos, validaciones simples.
- `handle-db-error.ts`: Manejo de errores de base de datos.
- `handle-response.ts`: Normalización de respuestas.

### `/types`
Definiciones de tipos TypeScript globales o compartidos entre frontend y backend.

### `/prisma`
- `schema.prisma`: La fuente de la verdad para el modelo de datos.

### `proxy.ts`
- `proxy.ts`: Utilizado por Better-Auth para la protección de rutas.

### `/services`
- `services/`: Lógica de negocio pura y acceso a BD. **NUNCA** accesible por el cliente.

### `/generated`
- Tipos y clientes generados automáticamente (ej. Prisma).

### `/actions`
- `actions/`: Controladores. Exponen mutaciones y lecturas específicas al cliente.

### `/hooks`
- `hooks/`: Hooks personalizados.

### `/providers`
- Proveedores de contexto de React (ej. `theme-provider.tsx`).

## Convenciones
1. **Server vs Client**: Los archivos en `lib` que usan secretos deben separarse de los que usa el cliente.
2. **Imports**: Usar alias `@/` para imports limpios (ej: `@/components/ui/button`).