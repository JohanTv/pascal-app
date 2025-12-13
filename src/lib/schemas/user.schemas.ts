import { type } from "arktype";

// ===================================================================
// USER SCHEMAS - For user CRUD operations
// ===================================================================

// Schema for creating a new user
export const CreateUserSchema = type({
  name: type("string >= 2").configure({
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  email: type("string.email").configure({
    message: "Introduce un correo electrónico válido.",
  }),
  password: type("string >= 8").configure({
    message: "La contraseña debe tener al menos 8 caracteres.",
  }),
  role: type("'admin' | 'sales_agent' | 'user'").configure({
    message: "Rol inválido.",
  }),
});

// Schema for updating a user (all fields optional except id)
export const UpdateUserSchema = type({
  id: type("string >= 1").configure({
    message: "ID de usuario requerido.",
  }),
  name: type("string >= 2 | undefined").configure({
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  email: type("string.email | undefined").configure({
    message: "Introduce un correo electrónico válido.",
  }),
  role: type("'admin' | 'sales_agent' | 'user' | undefined").configure({
    message: "Rol inválido.",
  }),
});

// Schema for banning a user
export const BanUserSchema = type({
  id: type("string >= 1").configure({
    message: "ID de usuario requerido.",
  }),
  banReason: type("string | undefined").configure({
    message: "Razón de baneo inválida.",
  }),
  banExpires: type("Date | undefined").configure({
    message: "Fecha de expiración inválida.",
  }),
});

// Schema for reactivating a user
export const ReactivateUserSchema = type({
  id: type("string >= 1").configure({
    message: "ID de usuario requerido.",
  }),
});

// Form-specific schemas (without id field for use in React Hook Form)
export const BanUserFormSchema = type({
  banReason: type("string | undefined").configure({
    message: "Razón de baneo inválida.",
  }),
  banExpires: type("Date | undefined").configure({
    message: "Fecha de expiración inválida.",
  }),
});

export const UpdateUserFormSchema = type({
  name: type("string >= 2 | undefined").configure({
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  email: type("string.email | undefined").configure({
    message: "Introduce un correo electrónico válido.",
  }),
  role: type("'admin' | 'sales_agent' | 'user' | undefined").configure({
    message: "Rol inválido.",
  }),
});

// ===================================================================
// TYPE INFERENCE - Use these types in your code
// ===================================================================

export type CreateUser = typeof CreateUserSchema.infer;
export type UpdateUser = typeof UpdateUserSchema.infer;
export type BanUser = typeof BanUserSchema.infer;
export type ReactivateUser = typeof ReactivateUserSchema.infer;

// Form types
export type BanUserForm = typeof BanUserFormSchema.infer;
export type UpdateUserForm = typeof UpdateUserFormSchema.infer;
