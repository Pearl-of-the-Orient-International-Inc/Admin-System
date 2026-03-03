import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { SessionGuard } from "@/components/providers/SessionGuard";

export default function AdminRouteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionGuard>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 70)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        {/* Sidebar */}
        <AppSidebar variant="sidebar" />
        <SidebarInset>
          <main className="w-full min-h-screen">
            <div className="max-w-5xl mx-auto py-10">{children}</div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </SessionGuard>
  );
}
