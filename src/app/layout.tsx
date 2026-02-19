import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { GeneralProvider } from '@/components/providers/General';
import "./globals.css";

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
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
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
         <GeneralProvider>
          {children}
         </GeneralProvider>
      </body>
    </html>
  );
}
