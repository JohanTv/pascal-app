import { inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react"; // make sure to import from better-auth/react
import type { Result } from "@/types/result.types";
import type { auth } from "./auth";
import { ROUTES } from "./constants";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
  plugins: [inferAdditionalFields<typeof auth>()],
});

export const { signIn, signUp, signOut, useSession, resetPassword } =
  authClient;

// Helper function for Google authentication
// OAuth requiere redirección del navegador, no se puede usar Result Pattern
export const signInWithGoogle = () => {
  return authClient.signIn.social({
    provider: "google",
    callbackURL: ROUTES.INTRANET.LOGIN, // Después del OAuth, regresa a /intranet
    errorCallbackURL: ROUTES.INTRANET.LOGIN, // En caso de error, también regresa a /intranet
  });
};

export const signInWithEmail = async (
  email: string,
  password: string,
): Promise<Result<void>> => {
  const result = await authClient.signIn.email({
    email,
    password,
  });

  if (result?.error) {
    return {
      success: false,
      error: "Email o contraseña incorrectos.",
    };
  }

  return { success: true, value: undefined };
};
