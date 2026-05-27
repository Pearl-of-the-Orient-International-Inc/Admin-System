import { PageHeader } from '@/components/PageHeader'
import { CodeBlock, EndpointBadge } from '@/components/CodeBlock'

export default function AuthenticationPage() {
  return (
    <div className="prose max-w-none">
      <PageHeader title="Authentication" />

      <p>
        The Blog API uses JWT (JSON Web Token) based authentication. Access tokens are sent
        via the <code>Authorization</code> header and refresh tokens are stored in HTTP-only
        cookies.
      </p>

      {/* Register */}
      <h2 id="register">Register</h2>
      <p>Create a new user account.</p>
      <EndpointBadge method="POST" path="/api/v1/auth/register" />

      <h3>Request Body</h3>
      <CodeBlock
        language="json"
        code={`{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}`}
      />

      <h3>Response</h3>
      <CodeBlock
        language="json"
        code={`{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "64abc123def456",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}`}
      />

      {/* Login */}
      <h2 id="login">Login</h2>
      <p>
        Authenticate with email and password. Returns an access token and sets a refresh token
        cookie.
      </p>
      <EndpointBadge method="POST" path="/api/v1/auth/login" />

      <h3>Request Body</h3>
      <CodeBlock
        language="json"
        code={`{
  "email": "john@example.com",
  "password": "securePassword123"
}`}
      />

      <h3>Response</h3>
      <CodeBlock
        language="json"
        code={`{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "64abc123def456",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}`}
      />

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40 rounded-xl p-4 my-4">
        <p className="text-sm text-blue-700 dark:text-blue-300 m-0">
          <strong>Note:</strong> Include the access token in subsequent requests via the{' '}
          <code>Authorization: Bearer &lt;token&gt;</code> header.
        </p>
      </div>

      {/* Refresh Token */}
      <h2 id="refresh-token">Refresh Token</h2>
      <p>
        Use the refresh token (stored in HTTP-only cookie) to obtain a new access token without
        requiring the user to log in again.
      </p>
      <EndpointBadge method="POST" path="/api/v1/auth/refresh-token" />

      <h3>Response</h3>
      <CodeBlock
        language="json"
        code={`{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}`}
      />

      {/* Logout */}
      <h2 id="logout">Logout</h2>
      <p>Invalidates the refresh token and clears the cookie.</p>
      <EndpointBadge method="POST" path="/api/v1/auth/logout" />

      <h3>Headers</h3>
      <CodeBlock
        language="http"
        code={`Authorization: Bearer <access_token>`}
      />

      <h3>Response</h3>
      <CodeBlock
        language="json"
        code={`{
  "success": true,
  "message": "Logged out successfully"
}`}
      />
    </div>
  )
}
