import { ThemeProvider } from "@/components/providers/Theme";
import { MemberImportProvider } from "@/components/providers/MemberImport";
import { Toaster } from "@/components/ui/toaster";
import { ReactNode } from "react";

export const GeneralProvider = ({ children }: { children: ReactNode }) => {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <MemberImportProvider>
        {children}
        <Toaster />
      </MemberImportProvider>
    </ThemeProvider>
  );
};
