# Error Handling Standards

## Descripción
Este documento rige estrictamente el manejo de errores y respuestas de API en el frontend. El Agente debe seguir el **Result Pattern** para todo flujo de datos, eliminando el uso de `try/catch` en la capa de UI y garantizando una experiencia de usuario consistente mediante **Sonner** (Toasts) y **React Hook Form**.

## **1. Reglas Absolutas (Hard Rules)**
* **Uso Restringido de `try/catch`:**
    * **Para nuestra API:** **Prohibido** usar `try/catch` al consumir endpoints propios. Se debe confiar en el encapsulamiento de `handleResponse`.
    * **Para Librerías Externas (Excepción):** Se **Permite** `try/catch` dentro de componentes (`.tsx`) únicamente cuando se invocan SDKs de terceros o métodos inestables que lanzan excepciones (ej. Firebase Auth, Stripe Elements, `JSON.parse`).
* **Tipado Estricto:** Toda función asíncrona de lógica de negocio debe retornar `Promise<Result<T>>`.
* **Segregación de Errores:**
    * Errores de **Validación** (Formularios) → UI Inline (Debajo del input).
    * Errores de **Sistema/Red** (API/SDKs) → Toast (Sonner).
* **Logs:** `console.error` solo se permite para depuración interna. Si ocurre un error en un `catch` de UI, se debe notificar al usuario (Toast) y no dejar la UI en un estado "zombie" (loading infinito). Asimismo, el mensaje debe ser amigable, profesional mas no técnico.


## **2. El Result Pattern**
Archivo base: `@/types/result.types.ts`
El Agente debe tipar explícitamente el genérico `<T>` (el dato esperado en caso de éxito).

```ts
export interface Success<T> {
  success: true;
  value: T;
}

export interface Failure {
  success: false;
  error: string; // Mensaje amigable para el usuario
}

export type Result<T> = Success<T> | Failure;
```

## **3. Fetching de Datos (`handleResponse`)**

Archivo base: `@/utils/handle-response.ts`

El Agente **SIEMPRE** debe envolver las llamadas `fetch` o Server Actions con esta utilidad. Esta función ya maneja internamente el `try/catch` y normaliza la salida.

**Patrón de Implementación:**

```ts
// 1. Definir el tipo de retorno esperado
import { User } from "@/types";

// 2. Llamada
const result = await handleResponse<User>("/api/user/profile", {
  method: "GET"
});

// 3. Guard Clause (Manejo de Error)
if (!result.success) {
  toast.error(result.error); // Feedback visual inmediato
  return; // Detener ejecución
}

// 4. Happy Path (TypeScript infiere result.value como User)
setUser(result.value);
```

## **4. Feedback Visual (UI/UX)**

### **A. Errores de Sistema (Toasts)**
Usar `sonner` para errores que impiden continuar un flujo pero no están atados a un input específico (ej. "Error de conexión", "Fallo al guardar").
  * **Import:** `import { toast } from "sonner"`
  * **Sintaxis:** `toast.error(result.error)`
  * **Contenido:** El mensaje (`result.error`) debe venir sanitizado desde el backend o `handleResponse`. No hardcodear textos genéricos como "Error" si la API ya provee un mensaje útil.

### **B. Errores de Validación (Formularios)**
Nunca usar Toasts para decir "El email es inválido". Usar los mensajes de error de React Hook Form.
  * **Estilo:** Texto `text-sm`, color `text-destructive` (variable de shadcn), ubicado inmediatamente debajo del input.

## **5. Formularios (RHF + Arktype)**
El stack de formularios es estricto: **React Hook Form** manejado por **Arktype**.

**Requisitos para el Agente:**
1.  Definir el esquema con `type` (Arktype).
2.  Inferir el tipo TypeScript del esquema.
3.  Usar `arktypeResolver` (de `@hookform/resolvers/arktype`).

**Snippet Maestro para Formularios:**

```tsx
import { useForm } from "react-hook-form";
import { type } from "arktype";
import { arktypeResolver } from "@hookform/resolvers/arktype";
import { toast } from "sonner";

// 1. Definición del Esquema
const schema = type({
    email: "email",
    password: "string >= 8",
});

// 2. Inferencia de Tipos
type FormValues = typeof schema.infer;

export function LoginForm() {
    // 3. Hook con Resolver
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
        resolver: arktypeResolver(schema),
    });

    // 4. Handler
    const onSubmit = async (data: FormValues) => {
        const result = await handleResponse("/api/login", {
            method: "POST",
            body: JSON.stringify(data),
        });

        // Error de API -> Toast
        if (!result.success) {
            toast.error(result.error);
            return;
        }

        toast.success("Bienvenido");
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
                <Input {...register("email")} placeholder="Email" />
                {/* Error de Validación -> Inline */}
                {errors.email && (
                    <p className="text-sm text-destructive">{String(errors.email.message)}</p>
                )}
            </div>
            {/* ... */}
        </form>
    );
}
```

## **6. Excepciones en Backend (Server Actions)**
Aunque el Frontend nunca debe recibir errores crudos, el Backend a veces necesita lanzar excepciones para controlar el flujo de la base de datos (Rollbacks).

**Regla de Transacciones (Prisma):**
Cuando se utilice `db.$transaction`, **es obligatorio lanzar un error (`throw new Error`)** para abortar la operación si una regla de negocio no se cumple. El bloque `try/catch` principal del Server Action se encargará de capturar este error y convertirlo al formato `Failure` del Result Pattern.

**Ejemplo Correcto:**

```typescript
// ✅ CORRECTO: El throw fuerza el Rollback, el catch lo formatea.
export async function myAction() {
  try {
    await db.$transaction(async (tx) => {
      const user = await tx.user.findUnique(...);
      if (!user) {
        // Lanzamos error para cancelar la transacción inmediatamente
        throw new Error("Usuario no encontrado");
      }
      // ... más lógica
    });
    return { success: true, value: ... };
  } catch (error) {
    // Aquí se "sanitiza" el error y se devuelve como valor
    return { success: false, error: error.message };
  }
}
```

**Ejemplo Incorrecto (Anti-patrón):**

```typescript
// ❌ INCORRECTO: El return dentro de la transacción hace COMMIT.
await db.$transaction(async (tx) => {
  if (!user) {
    return { success: false, error: "..." }; // Prisma guarda cambios y sigue
  }
});
```

## **6. Checklist de Verificación**
Antes de generar código, el Agente debe verificar:
1.  ¿Estoy usando `try/catch`? → **Eliminarlo.**
2.  ¿Estoy usando `handleResponse`? → **Mantenerlo.**
3.  ¿Si falla la API, estoy mostrando un Toast? → **Sí.**
4.  ¿Si falla la validación del input, estoy usando el objeto `errors` de RHF? → **Sí.**
5.  ¿Estoy tipando el retorno como `Result<T>`? → **Sí.**