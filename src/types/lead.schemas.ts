import { type } from "arktype";

// ===================================================================
// LEAD SCHEMAS - For managing lead data
// ===================================================================

// Schema for creating a new lead
export const CreateLeadSchema = type({
  id: type("string | undefined").configure({
    message: "ID de lead inválido.",
  }),
  name: type("string >= 2").configure({
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  email: type("string.email").configure({
    message: "Introduce un correo electrónico válido.",
  }),
  phone: type("string >= 9").configure({
    message: "El teléfono debe tener al menos 9 dígitos.",
  }),
});

// Schema for updating an existing lead (all fields optional)
export const UpdateLeadSchema = type({
  name: type("string >= 2 | undefined").configure({
    message: "El nombre debe tener al menos 2 caracteres.",
  }),
  email: type("string.email | undefined").configure({
    message: "Introduce un correo electrónico válido.",
  }),
  phone: type("string >= 9 | undefined").configure({
    message: "El teléfono debe tener al menos 9 dígitos.",
  }),
});

// ===================================================================
// TYPE INFERENCE - Use these types in your code
// ===================================================================

export type CreateLead = typeof CreateLeadSchema.infer;
export type UpdateLead = typeof UpdateLeadSchema.infer;
