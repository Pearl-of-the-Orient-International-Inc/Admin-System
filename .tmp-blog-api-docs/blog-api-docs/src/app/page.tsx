import { PageHeader } from '@/components/PageHeader'
import { CodeBlock } from '@/components/CodeBlock'

export default function IntroductionPage() {
  return (
    <div className="prose max-w-none">
      <PageHeader title="Introduction" />

      {/* Video embed */}
      <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700/60 mb-6 aspect-video">
        <iframe
          className="w-full h-full"
          src="https://www.youtube.com/embed/6_wfq76CG6g"
          title="Backend Mastery: Build & Deploy REST API with NodeJS + JWT + MongoDB"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      <p>
        Welcome to the Blog API documentation! This API provides functionalities for managing blog
        posts, users, comments, and likes.
      </p>

      <h2 id="base-url">Base URL</h2>
      <p>
        All API endpoints are relative to the following base URL:
      </p>

      <CodeBlock
        code="/api/v1"
        language="http"
        title="Base URL"
      />

      <p>
        For example, the user registration endpoint is{' '}
        <code>/api/v1/auth/register</code>.
      </p>

      <h2 id="overview">Overview</h2>

      <ul>
        <li>
          <strong>API Version:</strong> 1.0.0
        </li>
        <li>
          <strong>Authentication:</strong> Uses JWT Bearer tokens for access and JWT refresh tokens
          (via HTTP-only cookies) for session renewal.
        </li>
        <li>
          <strong>Authorization:</strong> Role-based access control (<code>admin</code>,{' '}
          <code>user</code>). Specific roles are required for certain endpoints.
        </li>
        <li>
          <strong>Rate Limiting:</strong> Applied globally (60 requests per minute per IP).
          Exceeding the limit returns a <code>429 Too Many Requests</code> error.
        </li>
        <li>
          <strong>Input Validation:</strong> Uses <code>express-validator</code>. Invalid requests
          return detailed <code>400 Bad Request</code> errors.
        </li>
        <li>
          <strong>Content Format:</strong> Primarily JSON (<code>application/json</code>). File
          uploads use <code>multipart/form-data</code>.
        </li>
      </ul>
    </div>
  )
}
