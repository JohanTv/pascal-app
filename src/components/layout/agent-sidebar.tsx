"use client";

import { LayoutDashboard, LogOut, MessageSquare } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { signOut } from "@/lib/auth-client";
import { ROUTES } from "@/lib/constants";

const agentNavItems = [
  {
    title: "Dashboard",
    href: ROUTES.INTRANET.SALES_AGENT.DASHBOARD,
    icon: LayoutDashboard,
  },
  {
    title: "Mis Chats",
    href: ROUTES.INTRANET.SALES_AGENT.CHATS,
    icon: MessageSquare,
  },
];

export function AgentSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    toast.success("Sesión cerrada correctamente.");
    router.push(ROUTES.INTRANET.LOGIN);
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-bold px-4 py-2">
            Sales Agent
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {agentNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={pathname === item.href}>
                    <Link href={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Button
          onClick={handleSignOut}
          variant="ghost"
          className="w-full justify-start"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
