import { headers } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ROLES, ROUTES } from "@/lib/constants";

export async function proxy(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  // Require authentication for protected routes
  if (!session) {
    return NextResponse.redirect(new URL(ROUTES.INTRANET.LOGIN, request.url));
  }

  const pathname = request.nextUrl.pathname;
  const userRole = session.user?.role;

  // Admin routes - only for admin users
  if (
    pathname.startsWith(ROUTES.INTRANET.ADMIN.BASE) &&
    userRole !== ROLES.ADMIN
  ) {
    return NextResponse.redirect(
      new URL(ROUTES.INTRANET.SALES_AGENT.DASHBOARD, request.url),
    );
  }

  // Sales agent routes - for sales_agent users (admins can access too if needed)
  if (
    pathname.startsWith(ROUTES.INTRANET.SALES_AGENT.BASE) &&
    userRole !== ROLES.SALES_AGENT &&
    userRole !== ROLES.ADMIN
  ) {
    return NextResponse.redirect(new URL(ROUTES.INTRANET.LOGIN, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/intranet/admin/:path*", "/intranet/sales-agent/:path*"],
};
