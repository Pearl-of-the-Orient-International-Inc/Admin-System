import type { Metadata } from "next";
import { Inter, Lora, Roboto_Mono } from "next/font/google";
import QueryProvider from "@/components/providers/Query";
import { GeneralProvider } from "@/components/providers/General";
import "./globals.css";

const fontSans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = Lora({
  subsets: ["latin"],
  variable: "--font-serif",
});

const fontMono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title:
    "Admin - Pearl of the Orient International Auxiliary Chaplain Values Educators Inc.",
  description:
    "Bring national-transformation and nation-building through bible-based values education to different sectors of our society.",
  icons: {
    icon: "/main/logo.png",
  },
  authors: {
    name: "Kyle Andre Lim",
    url: "https://www.facebook.com/kyleandre.lim29/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} antialiased`}
      >
        <QueryProvider>
          <GeneralProvider>{children}</GeneralProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
