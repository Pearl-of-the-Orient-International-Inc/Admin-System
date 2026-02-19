import { ReactNode } from "react";
import { SettingSidebar } from "./_components/SettingSidebar";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";

const SettingsLayout = ({ children }: { children: ReactNode }) => {
  return (
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
          <div className="max-w-5xl mx-auto py-10">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default SettingsLayout;
