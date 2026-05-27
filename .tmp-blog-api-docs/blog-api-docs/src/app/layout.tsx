import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'
import { Header } from '@/components/Header'
import { RightPanel } from '@/components/RightPanel'

export const metadata: Metadata = {
  title: 'Blog API Documentation',
  description: 'Documentation for the Blog API — manage posts, users, comments, and likes.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <div className="flex flex-col h-screen overflow-hidden bg-white dark:bg-[#1A1D23]">
          <Header />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto">
              <div className="flex">
                <div className="flex-1 min-w-0 px-8 py-8 max-w-3xl">
                  {children}
                </div>
                <RightPanel />
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  )
}
