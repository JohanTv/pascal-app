El plan de implementación está **muy sólido y bien estructurado**. Has capturado perfectamente la arquitectura de Next.js (Server Actions + Server Components), la validación robusta (Arktype) y la UX moderna (Drawer/Dialog).

Sin embargo, tengo **4 sugerencias críticas** y **2 mejoras de UX** que deberías considerar añadir para evitar deuda técnica y problemas de usabilidad futuros.

### 1. Arquitectura: Filtrado por URL (Critical)
El plan menciona un "Toggle" para filtrar baneados/activos y el uso de `Suspense`.
* **El Problema:** Si usas un estado local de React (`useState`) para el filtro, el *Server Component* (`page.tsx`) no se enterará del cambio y no volverá a hacer el `fetch` de datos filtrados.
* **La Solución:** El filtro debe funcionar a través de **URL Search Params**.
    * Al hacer clic en "Ver baneados", se debe hacer un `router.push('?status=banned')`.
    * El `page.tsx` recibe `searchParams`, se los pasa al `UserService.getAll`, y así la UI se actualiza manteniendo el renderizado en el servidor.
    * **Acción:** Añadir en `[MODIFY] page.tsx`: *"Manage filter state via URL Search Params (?status=active|banned) to ensure Server Component re-rendering and shareable URLs."*

### 2. Integración Better-Auth (Critical)
El plan dice: *"Create user with Better-Auth password hashing"*.
* **El Riesgo:** Insertar manualmente el hash en la base de datos (usando `prisma.create`) puede ser arriesgado si no replicas exactamente la lógica de salting/hashing de Better-Auth. Además, Better-Auth maneja tablas auxiliares (Account, Session, User).
* **La Solución:** Usar explícitamente la **API de administración de Better-Auth** (si existe en tu versión) o el SDK del servidor para crear el usuario.
* **Acción:** Aclarar en `user.service.ts`: *"Use Better-Auth's server-side API/SDK to create the user and account properly, ensuring password hashing and schema integrity match the auth provider's standards."*

### 3. Escalabilidad: Paginación y Búsqueda
El plan menciona `getAll` y renderizar tarjetas.
* **El Problema:** Si tienes 50 usuarios, está bien. Si tienes 500, la página será inusable y lenta.
* **La Solución:** Aunque sea una versión 1.0, añadir una barra de búsqueda simple (Search Input) es vital para un panel administrativo.
* **Acción:** Añadir un Input de búsqueda en el header que actualice la URL (`?q=juan`). Añadir soporte en `getAll` para filtrar por nombre/email. (La paginación puede esperar a una v2 si son pocos usuarios, pero la búsqueda es indispensable).

### 4. Manejo de Fechas (Timezones)
Para el `banExpires` (Datepicker).
* **El Problema:** El navegador enviará la fecha en hora local del admin. El servidor guardará en UTC.
* **La Solución:** Definir claramente que la comparación de expiración se hace en UTC.
* **Acción:** En `user.schemas.ts`, especificar que la fecha recibida se transformará/normalizará a UTC start/end of day para evitar que un usuario se desbanee horas antes o después de lo previsto.

---

### Mejoras de UX (Opcionales pero recomendadas)

* **Copy to Clipboard Feedback:** En el `create-user-dialog.tsx`, especifica que al copiar la contraseña, el icono debe cambiar temporalmente (ej: de `Copy` a `Check`) durante 2 segundos para dar feedback visual de que se copió con éxito.
* **Role Management:** En el `user-detail-drawer.tsx`, mencionas "Role (editable)". Asegúrate de especificar que debe ser un **Select/Combobox** con los roles disponibles (Admin, Sales Agent, etc.), no un input de texto libre, para evitar errores de tipeo en los roles.

Aquí tienes el **Plan de Implementación Final y Consolidado**. He integrado todas tus correcciones: la arquitectura basada en URL (`searchParams`) para filtros/búsqueda/paginación, la seguridad con Better-Auth, el manejo de fechas UTC y el uso de componentes específicos como el de paginación.

Copia y pega este bloque completo en tu chat con el agente.

***

# User CRUD Implementation Plan
Este plan detalla la implementación completa de la gestión de usuarios para el panel de administración.

**Objetivos Clave:**
1.  **Seguridad:** Creación de usuarios vía API de **Better-Auth** (no inserción directa).
2.  **Estado en URL:** Filtros, búsqueda y paginación manejados exclusivamente por `URL Search Params`.
3.  **UX Moderna:** Dialog para crear, Drawer (Sheet) para editar, validación con Arktype.

---

## 1. Backend Layer & Business Logic

### [NEW] `user.schemas.ts`
Crear esquemas de validación con **Arktype**:
* **CreateUserSchema**: Valida nombre (min 2 chars), email (formato válido) y password (min 8 chars).
* **UpdateUserSchema**: Esquema parcial.
* **BanUserSchema**:
    * `banReason` (string, opcional).
    * `banExpires` (date, opcional). **Nota:** Asegurar que la fecha se transforme/normalice a UTC start/end of day para consistencia.

### [NEW] `user.service.ts`
Implementar lógica de negocio con directiva `'server-only'`.

**Funciones:**
* `getAll(options)`:
    * **Params:** `{ page: number, pageSize: number, filter: 'active' | 'banned', search?: string }`.
    * **Lógica:**
        * Calcular `skip` y `take` basado en la página (default `pageSize` = 3).
        * Filtrar por `banned` (true/false) y `OR` condition para búsqueda en nombre/email.
        * Ejecutar transacción para obtener `data` y `count` total.
    * **Retorno:** `Promise<Result<{ users: User[], total: number, totalPages: number }>>`.
* `create(data)`: **CRÍTICO:** Usar la API/SDK de servidor de **Better-Auth** para crear el usuario. **NO** usar `prisma.user.create` manualmente para la contraseña, para asegurar que el hashing y salting coincidan con la autenticación.
* `update(id, data)`: Actualización estándar.
* `ban(id, reason, expires)`: Setea `banned=true` y metadatos.
* `reactivate(id)`: Setea `banned=false`, limpia metadatos.

### [NEW] `user.actions.ts`
Server Actions con `'use server'`.
* Todas las acciones de escritura (`createUserAction`, `updateUserAction`, `banUserAction`) deben ejecutar `revalidatePath('/intranet/admin/users')` tras el éxito.
* Manejo de errores retornando `Result<T>`.

---

## 2. Frontend Layer: Components

### [NEW] `components/ui/pagination-with-links.tsx`
Componente reutilizable basado en URLs (template `shadcn-next-link-pagination`).
* **Props:** `page` (actual), `pageSize` (items por pág), `totalCount` (total items), `pageSizeSelectOptions`.
* **Comportamiento:**
    * Renderiza navegación (Prev, 1, 2... Next).
    * Al hacer click, **NO** usa estado local. Usa `Link` o `router.push` para actualizar el parámetro `?page=X` en la URL, preservando otros params como `status` o `q`.

### [NEW] `create-user-dialog.tsx` (Dialog)
* **Formulario:** React Hook Form + Arktype Resolver.
* **Generador de Password:**
    * Input `type="password"`.
    * Botón "Generar y Copiar".
    * **UX:** Al copiar, mostrar toast o cambiar icono temporalmente (ej: check) por 2s para feedback visual.
* **Rol:** Predeterminado a `sales_agent` (oculto).

### [NEW] `user-detail-drawer.tsx` (Sheet/Drawer)
* **UX:** Se abre al hacer clic en una tarjeta. Slide-over desde la derecha.
* **Formulario de Edición:**
    * Carga datos con `defaultValues`.
    * **Edición Global:** No usar "lápiz por campo". Un solo formulario editable con un botón "Guardar Cambios" al final.
    * **Rol:** Usar un componente **Select/Combobox** para evitar errores de tipeo (no input de texto).
* **Zona de Peligro:**
    * Si activo: Botón "Banear Usuario" (abre `ban-user-dialog`).
    * Si baneado: Mostrar detalles del ban y botón "Reactivar" (acción directa con confirmación).

### [NEW] `user-card.tsx`
* Visualización en Grid.
* Muestra Avatar (si hay), Nombre, Email, Badge de Rol.
* **Estado Baneado:** Si `banned=true`, la tarjeta debe tener un borde rojo o indicador visual claro "BANNED".

---

## 3. Frontend Layer: Page Logic

### [MODIFY] `app/(admin)/users/page.tsx`
Refactorizar para usar **Server Components** y **URL Search Params**.

1.  **Props:** Recibe `searchParams` (que es una promesa o objeto según versión de Next.js).
2.  **Extracción de Params:**
    * `page`: `Number(searchParams.page) || 1`.
    * `pageSize`: `3` (Requisito fijo por defecto).
    * `status`: `searchParams.status` (default 'active').
    * `q`: `searchParams.q` (default '').
3.  **Fetching:**
    * Llamar a `UserService.getAll({ page, pageSize, filter: status, search: q })`.
4.  **Renderizado:**
    * **Header:**
        * Input de Búsqueda (actualiza URL `?q=...` con debounce).
        * Tabs/Toggle: "Activos" vs "Baneados" (actualiza URL `?status=...`).
        * Botón "Nuevo Usuario" (abre Dialog).
    * **Grid:** Mapear usuarios a `<UserCard />`.
    * **Footer:** Renderizar `<PaginationWithLinks totalCount={data.total} pageSize={3} page={page} />`.

---

