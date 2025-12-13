Actúa como un desarrollador Fullstack experto en Next.js. Vamos a completar el CRUD de Users (panel de administrador).

**Stack Técnico Obligatorio:**
- Validación de esquemas: **Arktype**.
- Manejo de formularios: **React Hook Form**.
- Backend/Mutaciones: **Server Actions**.
- Estrategia de Caché: El Server Action debe encargarse de hacer `revalidatePath` para actualizar la UI automáticamente tras una mutación exitosa.

### 1. Visualización (Lista de Usuarios)
- **Vista:** Mostrar los usuarios en tarjetas (Cards).
- **Filtrado:**
  - Por defecto: Mostrar usuarios activos (`banned === false`).
  - Botón/Toggle: "Ver usuarios baneados" (filtra `banned === true`).
- **UI:** Renderizar datos básicos. Si el usuario está baneado, mostrar algún indicador visual (icono o borde rojo).

### 2. Creación de Usuario (Create)
- **UX:** Botón "Crear Usuario" -> Abre un **Dialog (Modal)**.
- **Formulario (RHF + Arktype):**
  - Campos: Nombre, Email, etc.
  - **Rol:** Valor por defecto `sales_agent` (oculto o readonly si no se puede cambiar al crear).
  - **Generador de Contraseña:**
    - Input `type="password"`.
    - Botón "Generar y Copiar": Genera un string seguro, lo setea en el formulario y lo copia al clipboard.
- **Envío:** Server Action que crea el usuario y revalida la ruta. Al éxito, cerrar dialog y resetear form.

### 3. Detalle y Edición (Update)
- **UX:** Clic en tarjeta -> Abre un **Drawer (Slide-over)** lateral derecho.
  - *Nota:* Usamos Drawer en vez de Dialog para tener más espacio vertical y no perder contexto de la lista.
- **Formulario:**
  - Usa `react-hook-form` con `defaultValues` cargados del usuario seleccionado.
  - **NO** implementar edición "campo por campo" (lápiz por input).
  - Usar un enfoque estándar: El usuario edita lo que quiera y presiona un único botón "Guardar Cambios".
  - **Validación:** El esquema de Arktype debe validar los datos antes de enviar al Server Action.

### 4. Eliminación Lógica (Ban System)
- **UX:** Botón dentro de la tarjeta o del Drawer.
- **Lógica:** Campo `banned` (boolean). No borrar físicamente.
- **Flujo de Baneo (si `!banned`):**
  - Abrir Dialog de confirmación.
  - Formulario opcional:
    - `banReason` (text area).
    - `banExpires` (Date input): Fecha futura.
  - Server Action: Actualiza el usuario y revalida.
- **Flujo de Reactivación (si `banned`):**
  - Botón "Reactivar Usuario".
  - Server Action: Setea `banned = false`, `banReason = null`, `banExpires = null` y revalida.

### Instrucciones de Código
- Define los esquemas de validación usando `type` de **Arktype**.
- Asegúrate de tipar los props y los formularios correctamente.
- Maneja el estado `isSubmitting` de RHF para deshabilitar botones durante la llamada al Server Action.