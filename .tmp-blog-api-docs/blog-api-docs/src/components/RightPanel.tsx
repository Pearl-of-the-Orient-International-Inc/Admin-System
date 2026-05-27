'use client'

import { usePathname } from 'next/navigation'
import { SmilePlus, Meh, Frown } from 'lucide-react'

const pageAnchors: Record<string, { label: string; id: string }[]> = {
  '/': [
    { label: 'Base URL', id: 'base-url' },
    { label: 'Overview', id: 'overview' },
  ],
  '/authentication': [
    { label: 'Register', id: 'register' },
    { label: 'Login', id: 'login' },
    { label: 'Refresh Token', id: 'refresh-token' },
    { label: 'Logout', id: 'logout' },
  ],
  '/guides/rate-limiting': [
    { label: 'Limits', id: 'limits' },
    { label: 'Response', id: 'response' },
  ],
  '/guides/error-handling': [
    { label: 'Error Format', id: 'error-format' },
    { label: 'Common Errors', id: 'common-errors' },
  ],
}

export function RightPanel() {
  const pathname = usePathname()
  const anchors = pageAnchors[pathname] || []

  return (
    <aside className="w-56 shrink-0 py-8 pr-6 hidden lg:block">
      {anchors.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8M4 18h16" />
            </svg>
            On This Page
          </div>
          <ul className="space-y-1">
            {anchors.map((anchor, i) => (
              <li key={anchor.id}>
                <a
                  href={`#${anchor.id}`}
                  className={`block text-sm py-0.5 transition-colors ${
                    i === 0
                      ? 'text-blue-500 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded'
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 px-2'
                  }`}
                >
                  {anchor.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Was this helpful */}
      <div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">Was this helpful?</p>
        <div className="flex gap-1.5">
          {[
            { Icon: SmilePlus, label: 'Yes' },
            { Icon: Meh, label: 'Neutral' },
            { Icon: Frown, label: 'No' },
          ].map(({ Icon, label }) => (
            <button
              key={label}
              title={label}
              className="p-1.5 rounded-md border border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 transition-colors"
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
