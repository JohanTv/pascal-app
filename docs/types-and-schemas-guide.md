# **Types & Schemas Standards (ArkType)**

## **Descripción**
Este documento es la **Fuente de Verdad** para la definición de datos. Utilizamos **ArkType** por su rendimiento y sintaxis.
El Agente debe seguir una política estricta: **Validación exhaustiva para escrituras (Write)** y **Reutilización de tipos de Prisma para lecturas (Read)**.

## **1. Reglas de Oro (Hard Rules)**
  * **Escritura (POST/PUT/PATCH):** Todo input del usuario debe tener un **Schema** definido en ArkType con mensajes de error personalizados y en español.
  * **Lectura (GET):** **NO** definir Schemas ni Tipos manuales para datos que vienen de la base de datos. Usar directamente los tipos generados por **Prisma** (`@prisma/client`).
  * **Sintaxis de Definición:**
      * Para validaciones simples sin mensaje: Usar strings (`"string >= 5"`).
      * Para validaciones con mensaje (Obligatorio en formularios): Usar `type("...").configure(...)`.
  * **Inferencia:** **NUNCA** escribir la interfaz de TypeScript manualmente para un Schema. Siempre usar `typeof schema.infer`.

## **2. Convenciones de Estructura**
  * **Creación:** `CreateXSchema` (Validación estricta con mensajes).
  * **Actualización:** `UpdateXSchema` (Parcial, todos opcionales).
  * **Lectura:** Usar `User`, `Product` (Importados de Prisma).

## **3. Sintaxis y Validaciones (ArkType Cheatsheet)**
### **3.1. Validaciones con Mensajes (Standard)**
Para formularios y datos de entrada, el mensaje es obligatorio.
```ts
// Envolver en type() para configurar el mensaje
age: type("integer >= 18").configure({
    message: "Debes ser mayor de 18 años."
})
```

### **3.2. Strings y Patrones**
```ts
email: "email"
phone: "/^[0-9]{9}$/" // Regex
uuid: "uuid"
```

## **4. Estrategia de Lectura (Prisma Integration)**
Para endpoints `GET` (Listar o Detalle), **no crear esquemas de validación** a menos que sea para validar una API externa. Confiar en la tipología de base de datos.

**Correcto:**
```tsx
import { User } from "@prisma/client"; // ✅ Tipos automáticos

function UserProfile({ user }: { user: User }) {
  return <div>{user.name}</div>;
}
```

**Incorrecto (Redundante):**
```ts
// ❌ No reinventar la rueda
export type UserReadType = {
    id: string;
    name: string;
    // ...
}
```

## **5. Ejemplo Completo: User Entity (Write Operations)**
El Agente debe generar el código siguiendo este patrón. Notar el uso de `.configure` para UX en español.

### **5.1. Definición (users.schema.ts)**
```ts
import { type } from "arktype";

// 1. CREATE SCHEMA (Validación fuerte + Mensajes)
export const CreateUserSchema = type({
    name: type("string >= 2").configure({
        message: "El nombre debe tener al menos 2 caracteres."
    }),
    email: type("email").configure({
        message: "Introduce un correo electrónico válido."
    }),
    // Enums con mensaje
    role: type("'admin' | 'user' | 'viewer'").configure({
        message: "Debes seleccionar un rol válido."
    }),
    // Opcionales también pueden tener validación de formato
    phoneNumber: type("string?").configure({
        message: "El teléfono debe ser texto válido."
    }),
    age: type("integer >= 18").configure({
        message: "Debes ser mayor de edad para registrarte."
    })
});

// 2. UPDATE SCHEMA (Parciales)
export const UpdateUserSchema = type({
    // En update, los campos son opcionales, pero si se envían, deben cumplir la regla
    name: type("string >= 2 | null").configure({
        message: "El nombre debe tener al menos 2 caracteres."
    }),
    role: type("'admin' | 'user' | 'viewer' | null").configure({
        message: "Rol no permitido."
    })
});

// 3. Inferencia de Tipos (Static)
export type CreateUser = typeof CreateUserSchema.infer;
export type UpdateUser = typeof UpdateUserSchema.infer;
```

-----

## **6. Checklist de Verificación**

Antes de aprobar el código:

1.  [ ] **¿Es una operación de Escritura?** → Definir Schema con `type("...").configure({ message: "..." })`.
2.  [ ] **¿Es una operación de Lectura?** → Usar tipo de `@prisma/client`. **NO** crear Schema.
3.  [ ] **¿Están los mensajes en español?** → Verificar ortografía y tono amigable.
4.  [ ] **¿Inferencia correcta?** → Se exporta `typeof X.infer`.