import { PageHeader } from '@/components/PageHeader'
import { CodeBlock } from '@/components/CodeBlock'

export default function RateLimitingPage() {
  return (
    <div className="prose max-w-none">
      <PageHeader title="Rate Limiting" />

      <p>
        The Blog API implements rate limiting to protect against abuse and ensure fair usage for
        all consumers.
      </p>

      <h2 id="limits">Limits</h2>

      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700/60 my-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/60">
              <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700/60">
                Scope
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700/60">
                Limit
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700/60">
                Window
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-100 dark:border-gray-700/40">
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Global (per IP)</td>
              <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">60 requests</td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Per minute</td>
            </tr>
            <tr>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Auth endpoints</td>
              <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">10 requests</td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-400">Per minute</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2 id="response">Response When Exceeded</h2>
      <p>
        When the rate limit is exceeded, the API returns a <code>429 Too Many Requests</code>{' '}
        status with the following response:
      </p>

      <CodeBlock
        language="json"
        code={`{
  "success": false,
  "message": "Too many requests, please try again later.",
  "retryAfter": 60
}`}
      />

      <p>
        The response also includes the following headers to help clients handle rate limiting:
      </p>

      <CodeBlock
        language="http"
        code={`X-RateLimit-Limit: 60
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1705314600
Retry-After: 60`}
      />

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-4 my-4">
        <p className="text-sm text-amber-700 dark:text-amber-300 m-0">
          <strong>Best Practice:</strong> Implement exponential backoff in your client when
          encountering <code>429</code> errors. Use the <code>Retry-After</code> header value
          to determine when to retry.
        </p>
      </div>
    </div>
  )
}
