import { AppSidebar } from "@/components/public_components/app-sidebar"
import { SiteHeader } from "@/components/public_components/site-header"
import { NotificationProvider } from "@/components/public_components/notification-context"
import { NotificationWrapper } from "@/components/public_components/notification-wrapper"
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";


export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Ensure user is authenticated
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect('/login');
  }

  // If user is admin, redirect them to admin dashboard
  if (session.user.role === "admin") {
    return redirect("/admin");
  }

  return (
    <NotificationProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" user={session.user} />
        <SidebarInset>
          <SiteHeader />
          {children}
        </SidebarInset>
        <NotificationWrapper />
      </SidebarProvider>
    </NotificationProvider>
  )
}
