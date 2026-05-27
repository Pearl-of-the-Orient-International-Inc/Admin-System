'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen } from 'lucide-react'

const navItems = [
  { label: 'Introduction', href: '/' },
  { label: 'Authentication', href: '/authentication' },
]

const guideItems = [
  { label: 'Rate Limiting', href: '/guides/rate-limiting' },
  { label: 'Error Handling', href: '/guides/error-handling' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-[260px] shrink-0 border-r border-gray-200 dark:border-gray-700/60 bg-[#F8F9FB] dark:bg-[#1A1D23] overflow-y-auto flex flex-col">
      <nav className="flex-1 p-3 pt-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-1.5 rounded-md text-sm mb-0.5 transition-colors ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {item.label}
            </Link>
          )
        })}

        <div className="mt-5 mb-2 px-3">
          <span className="text-xs font-semibold tracking-wider text-gray-400 dark:text-gray-500 uppercase">
            Guides
          </span>
        </div>

        {guideItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-1.5 rounded-md text-sm mb-0.5 transition-colors ${
                isActive
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 dark:border-gray-700/60">
        <div className="flex items-center gap-2 px-2 py-1">
          <BookOpen className="w-4 h-4 text-gray-400" />
          <span className="text-xs text-gray-400 dark:text-gray-500">Powered by GitBook</span>
        </div>
      </div>
    </aside>
  )
}
