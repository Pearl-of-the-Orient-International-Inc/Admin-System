import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { SessionGuard } from "@/components/providers/SessionGuard";
import { HashScrollHandler } from "@/components/blogs/HashScrollHandler";
import { FlickeringGrid } from "@/components/blogs/FlickeringGrid";

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
            <HashScrollHandler />
            <div className="absolute top-0 left-0 z-0 w-full h-50 mask-[linear-gradient(to_top,transparent_25%,black_95%)]">
              <FlickeringGrid
                className="absolute top-0 left-0 size-full"
                squareSize={4}
                gridGap={6}
                color="#6B7280"
                maxOpacity={0.2}
                flickerChance={0.05}
              />
            </div>
            <div className="relative">{children}</div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </SessionGuard>
  );
}
