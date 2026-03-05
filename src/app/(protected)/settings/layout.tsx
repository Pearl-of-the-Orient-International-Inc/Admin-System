import { ReactNode } from "react";
import { SettingSidebar } from "./_components/SettingSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { SessionGuard } from "@/components/providers/SessionGuard";
import { HashScrollHandler } from "@/components/blogs/HashScrollHandler";
import { FlickeringGrid } from "@/components/blogs/FlickeringGrid";

const SettingsLayout = ({ children }: { children: ReactNode }) => {
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
        {/* Setting Sidebar */}
        <SettingSidebar variant="sidebar" />
        <SidebarInset>
          <div className="w-full min-h-screen">
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
          </div>
        </SidebarInset>
      </SidebarProvider>
    </SessionGuard>
  );
};

export default SettingsLayout;
