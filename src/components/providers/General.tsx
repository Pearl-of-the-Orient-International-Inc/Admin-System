import QueryProvider from "@/components/providers/Query";
import { ThemeProvider } from "@/components/providers/Theme";
import { ReactNode } from "react";

export const GeneralProvider = ({ children }: { children: ReactNode }) => {
  return (
    <QueryProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </QueryProvider>
  );
};
