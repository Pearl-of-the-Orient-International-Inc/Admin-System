'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'

interface CodeBlockProps {
  code: string
  language?: string
  title?: string
}

export function CodeBlock({ code, language = 'bash', title }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700/60 my-4">
      {title && (
        <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-800/80 border-b border-gray-200 dark:border-gray-700/60">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400 font-mono">{title}</span>
        </div>
      )}
      <div className="relative group bg-[#1C1E26] dark:bg-[#12141A]">
        <button
          onClick={handleCopy}
          className="absolute top-3 right-3 p-1.5 rounded-md bg-gray-700/50 hover:bg-gray-600/50 text-gray-400 hover:text-gray-200 transition-all opacity-0 group-hover:opacity-100"
          title="Copy"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
        <pre className="p-4 text-sm overflow-x-auto leading-relaxed">
          <code className="font-mono text-[13px]">
            <HighlightedCode code={code} language={language} />
          </code>
        </pre>
      </div>
    </div>
  )
}

function HighlightedCode({ code, language }: { code: string; language: string }) {
  if (language === 'http' || language === 'endpoint') {
    const lines = code.split('\n')
    return (
      <>
        {lines.map((line, i) => {
          const method = line.match(/^(GET|POST|PUT|PATCH|DELETE)\s/)
          if (method) {
            const [verb, ...rest] = line.split(' ')
            return (
              <span key={i} className="block">
                <span className="text-[#89DDFF] font-semibold">{verb}</span>
                <span className="text-[#EEFFFF]"> {rest.join(' ')}</span>
                {'\n'}
              </span>
            )
          }
          if (line.startsWith('//') || line.startsWith('#')) {
            return <span key={i} className="block text-[#546E7A]">{line}{'\n'}</span>
          }
          return <span key={i} className="block text-[#CDD3DE]">{line}{'\n'}</span>
        })}
      </>
    )
  }

  if (language === 'json') {
    const highlighted = code
      .replace(/("[\w-]+")\s*:/g, '<span class="text-[#82AAFF]">$1</span>:')
      .replace(/:\s*(".*?")/g, ': <span class="text-[#C3E88D]">$1</span>')
      .replace(/:\s*(\d+\.?\d*)/g, ': <span class="text-[#F78C6C]">$1</span>')
      .replace(/:\s*(true|false|null)/g, ': <span class="text-[#C792EA]">$1</span>')

    return (
      <span
        className="text-[#CDD3DE]"
        dangerouslySetInnerHTML={{ __html: highlighted }}
      />
    )
  }

  // Default
  return <span className="text-[#CDD3DE]">{code}</span>
}

// ---- Inline badge for HTTP methods ----
interface MethodBadgeProps {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  path: string
}

const methodColors: Record<string, string> = {
  GET: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  POST: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  PUT: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  PATCH: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  DELETE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

export function EndpointBadge({ method, path }: MethodBadgeProps) {
  return (
    <div className="flex items-center gap-2 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700/60 bg-[#1C1E26] px-4 py-3 my-4 font-mono text-sm">
      <span className={`text-xs font-bold px-1.5 py-0.5 rounded uppercase ${methodColors[method]}`}>
        {method}
      </span>
      <span className="text-[#EEFFFF]">{path}</span>
    </div>
  )
}
