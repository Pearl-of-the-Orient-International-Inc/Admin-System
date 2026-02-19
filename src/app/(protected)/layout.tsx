
import { ThemeProvider } from '@/components/providers/Theme';

export default function MainAdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
	<ThemeProvider
	  attribute="class"
	  defaultTheme="system"
	  enableSystem
	  disableTransitionOnChange
	>
	  {children}
	</ThemeProvider>
  );
}
