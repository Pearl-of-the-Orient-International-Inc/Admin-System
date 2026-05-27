import { SessionGuard } from "@/components/providers/SessionGuard";
import { DocumentationHeader } from "./_components/DocumentationHeader";
import { DocumentationSidebar } from "./_components/DocumentationSidebar";
import { DocumentationRightPanel } from "./_components/DocumentationRightPanel";

export default function DocumentationLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SessionGuard>
      <div className="flex h-screen flex-col bg-white">
        <DocumentationHeader />
        <div className="flex min-h-0 flex-1 overflow-hidden">
          <DocumentationSidebar />
          <main className="min-w-0 flex-1 overflow-y-auto bg-white">
            <div className="mx-auto flex max-w-350 gap-10 px-6 py-10">
              <div className="min-w-0 flex-1">{children}</div>
              <DocumentationRightPanel />
            </div>
          </main>
        </div>
      </div>
    </SessionGuard>
  );
}
