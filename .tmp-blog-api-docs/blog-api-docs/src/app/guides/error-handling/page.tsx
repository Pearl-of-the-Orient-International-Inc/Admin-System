import { PageHeader } from '@/components/PageHeader'
import { CodeBlock } from '@/components/CodeBlock'

const errors = [
  { code: '400', name: 'Bad Request', description: 'Invalid input or validation failed.' },
  { code: '401', name: 'Unauthorized', description: 'Missing or invalid authentication token.' },
  { code: '403', name: 'Forbidden', description: 'Insufficient permissions for this action.' },
  { code: '404', name: 'Not Found', description: 'The requested resource does not exist.' },
  { code: '409', name: 'Conflict', description: 'Resource already exists (e.g., duplicate email).' },
  { code: '429', name: 'Too Many Requests', description: 'Rate limit exceeded.' },
  { code: '500', name: 'Internal Server Error', description: 'Unexpected server-side error.' },
]

const codeColors: Record<string, string> = {
  '4': 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20',
  '5': 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
}

export default function ErrorHandlingPage() {
  return (
    <div className="prose max-w-none">
      <PageHeader title="Error Handling" />

      <p>
        The Blog API uses conventional HTTP response codes to indicate the success or failure of a
        request. All errors follow a consistent JSON structure.
      </p>

      <h2 id="error-format">Error Format</h2>
      <p>
        All error responses follow this structure:
      </p>

      <CodeBlock
        language="json"
        code={`{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Must be a valid email address"
    },
    {
      "field": "password",
      "message": "Must be at least 8 characters"
    }
  ]
}`}
      />

      <p>
        For non-validation errors, the <code>errors</code> array may be omitted:
      </p>

      <CodeBlock
        language="json"
        code={`{
  "success": false,
  "message": "Resource not found"
}`}
      />

      <h2 id="common-errors">Common HTTP Status Codes</h2>

      <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700/60 my-4 not-prose">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/60">
              <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700/60 w-20">
                Code
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700/60 w-44">
                Name
              </th>
              <th className="text-left px-4 py-3 font-medium text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700/60">
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {errors.map((err, i) => {
              const colorClass = codeColors[err.code[0]] || ''
              return (
                <tr
                  key={err.code}
                  className={i < errors.length - 1 ? 'border-b border-gray-100 dark:border-gray-700/40' : ''}
                >
                  <td className="px-4 py-3">
                    <span className={`font-mono font-semibold text-xs px-1.5 py-0.5 rounded ${colorClass}`}>
                      {err.code}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{err.name}</td>
                  <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{err.description}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-xl p-4 my-4 not-prose">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>Tip:</strong> Always check the <code>success</code> field first. A value of{' '}
          <code>false</code> indicates an error, even if the HTTP status is <code>200</code>.
        </p>
      </div>
    </div>
  )
}
