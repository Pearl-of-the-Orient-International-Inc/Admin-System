'use client'

import { useState } from 'react'
import { Search, FileText, Code2 } from 'lucide-react'

export function Header() {
  const [activeTab, setActiveTab] = useState<'docs' | 'api'>('docs')

  return (
    <header className="flex items-center h-14 border-b border-gray-200 dark:border-gray-700/60 bg-white dark:bg-[#1A1D23] px-4 gap-4 shrink-0 z-10">
      {/* Logo */}
      <div className="flex items-center gap-2.5 w-[260px] shrink-0">
        <div className="w-7 h-7 bg-blue-500 rounded-md flex items-center justify-center">
          <FileText className="w-4 h-4 text-white" />
        </div>
        <span className="font-semibold text-gray-900 dark:text-white text-sm">Blog API</span>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-transparent -mb-px">
        <button
          onClick={() => setActiveTab('docs')}
          className={`flex items-center gap-1.5 px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'docs'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          Documentation
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`flex items-center gap-1.5 px-3 py-4 text-sm font-medium border-b-2 transition-colors ${
            activeTab === 'api'
              ? 'border-blue-500 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
          }`}
        >
          <Code2 className="w-3.5 h-3.5" />
          API References
        </button>
      </div>

      {/* Search */}
      <div className="flex-1 max-w-md ml-auto">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
          <Search className="w-3.5 h-3.5 shrink-0" />
          <span className="text-sm flex-1">Ask or search...</span>
          <kbd className="text-xs bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded px-1.5 py-0.5 font-mono text-gray-400 dark:text-gray-400">
            Ctrl K
          </kbd>
        </div>
      </div>
    </header>
  )
}
