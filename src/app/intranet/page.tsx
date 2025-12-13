import { headers } from "next/headers";
import { redirect } from "next/navigation";
import AnimatedLogo from "@/components/intranet/AnimatedLogo";
import LoginForm from "@/components/intranet/LoginForm";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { auth } from "@/lib/auth";
import { ROLES, ROUTES } from "@/lib/constants";

type Props = {
  searchParams: Promise<{
    error?: string | string[]; // Puede ser string, array o undefined
  }>;
};

export default async function IntranetLoginPage(props: Props) {
  const searchParams = await props.searchParams;
  const rawError = searchParams.error;
  const error = Array.isArray(rawError) ? rawError[0] : rawError;
  // Server-side session check
  const session = await auth.api.getSession({ headers: await headers() });

  if (session?.user) {
    if (session.user.role === ROLES.ADMIN) {
      redirect(ROUTES.INTRANET.ADMIN.DASHBOARD);
    } else {
      redirect(ROUTES.INTRANET.SALES_AGENT.DASHBOARD);
    }
  }

  let serverErrorMessage = "";
  if (error === "signup_disabled") {
    serverErrorMessage = "Usuario no autorizado. Contacte al administrador.";
  } else if (error) {
    serverErrorMessage =
      "No se pudo iniciar sesión. Por favor, inténtalo de nuevo.";
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-[#052651] to-[#214ec3] dark:from-[#010d1a] dark:via-[#021b39] dark:to-[#0a2a70]">
      {/* Mode Toggle - Top Right */}
      <div className="absolute top-10 right-10 z-20">
        <ModeToggle />
      </div>
      {/* Mobile: vertical stack, Desktop: horizontal two-column */}
      <div className="flex min-h-screen flex-col items-center justify-center gap-8 p-4 md:flex-row md:gap-12 lg:gap-16">
        {/* Left Column - Animated Logo - Hidden on small mobile, visible on larger screens */}
        <div className="hidden w-full items-center justify-center md:flex md:w-1/2">
          <AnimatedLogo />
        </div>

        {/* Right Column - Login Form */}
        <div className="w-full max-w-md md:w-1/2">
          <LoginForm serverErrorMessage={serverErrorMessage} />
        </div>
      </div>
    </div>
  );
}
