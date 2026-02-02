# API Documentation

This document describes Portal's REST API endpoints, request/response formats, and authentication requirements.

## Base URL

All API endpoints are prefixed with `/api`:

```
https://portal.atl.dev/api
```

## Authentication

Most endpoints require authentication. Portal uses BetterAuth for session management.

### Authentication Methods

1. **Session Cookie** (Browser)
   - Automatically sent with requests from the browser
   - Set via `/api/auth/sign-in` endpoint

2. **API Key** (Programmatic)
   - Include in `Authorization` header: `Authorization: Bearer <api-key>`
   - Create API keys via admin panel or API

### Auth Guards

- **`requireAuth()`**: Requires any authenticated user
- **`requireAdmin()`**: Requires admin role
- **`requireAdminOrStaff()`**: Requires admin or staff role

## Response Format

### Success Response

```json
{
  "ok": true,
  "data": { ... }
}
```

Some endpoints may return data directly without the `ok` wrapper:

```json
{
  "user": { ... }
}
```

### Error Response

```json
{
  "ok": false,
  "error": "Error message description",
  "details": {
    "issues": [
      {
        "code": "too_small",
        "minimum": 3,
        "type": "string",
        "inclusive": true,
        "exact": false,
        "message": "String must contain at least 3 character(s)",
        "path": ["name"]
      }
    ],
    "flattened": {
      "formErrors": [],
      "fieldErrors": {
        "name": ["String must contain at least 3 character(s)"]
      }
    }
  }
}
```
**Example with zod-validation-error:**
```json
{
  "ok": false,
  "error": "Validation error: Name must contain at least 3 character(s) at 'name'",
  "details": { ... }
}
```
**Note:** The `details` field is optional and typically populated for 400 Bad Request (Validation) errors.

### HTTP Status Codes

- `200 OK` - Successful request
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request parameters
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Endpoints

### Authentication

#### `POST /api/auth/[...all]`

BetterAuth catch-all endpoint for authentication operations.

**Endpoints handled:**

- `/api/auth/sign-in` - Sign in
- `/api/auth/sign-up` - Sign up
- `/api/auth/sign-out` - Sign out
- `/api/auth/session` - Get session
- `/api/auth/forgot-password` - Request password reset
- `/api/auth/reset-password` - Reset password
- `/api/auth/verify-email` - Verify email address

See [BetterAuth Documentation](https://www.better-auth.com/docs) for detailed request/response formats.

---

### User Endpoints

#### `GET /api/user/me`

Get current authenticated user's profile.

**Authentication:** Required (`requireAuth`)

**Response:**

```json
{
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "image": "string | null",
    "role": "user" | "staff" | "admin",
    "emailVerified": boolean,
    "createdAt": "ISO 8601 date"
  }
}
```

#### `PATCH /api/user/me`

Update current authenticated user's profile.

**Authentication:** Required (`requireAuth`)

**Request Body:**

```json
{
  "name": "string",
  "image": "string (url)"
}
```

**Response:**

```json
{
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "image": "string | null",
    "role": "user" | "staff" | "admin",
    "emailVerified": boolean,
    "createdAt": "ISO 8601 date"
  }
}
```

#### `GET /api/user/sessions`

Get current authenticated user's sessions.

**Authentication:** Required (`requireAuth`)

**Query Parameters:**

- `active` (optional): Filter active sessions (`true`/`false`)
- `limit` (optional): Maximum results (default: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response:**

```json
{
  "sessions": [
    {
      "id": "string",
      "userId": "string",
      "expiresAt": "ISO 8601 date",
      "ipAddress": "string | null",
      "userAgent": "string | null",
      "createdAt": "ISO 8601 date"
    }
  ]
}
```

---

### Admin Endpoints

All admin endpoints require admin or staff role (`requireAdminOrStaff`).

#### `GET /api/admin/users`

List users with filtering and pagination.

**Authentication:** Required (`requireAdminOrStaff`)

**Query Parameters:**

- `role` (optional): Filter by role (`user`, `staff`, `admin`)
- `banned` (optional): Filter by banned status (`true`/`false`)
- `search` (optional): Search by email or name
- `limit` (optional): Maximum results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response:**

```json
{
  "users": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "role": "user" | "staff" | "admin",
      "banned": boolean,
      "emailVerified": boolean,
      "createdAt": "ISO 8601 date",
      "updatedAt": "ISO 8601 date"
    }
  ],
  "pagination": {
    "total": number,
    "limit": number,
    "offset": number,
    "hasMore": boolean
  }
}
```

#### `GET /api/admin/users/[id]`

Get a specific user by ID.

**Authentication:** Required (`requireAdminOrStaff`)

**Response:**

```json
{
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "user" | "staff" | "admin",
    "banned": boolean,
    "emailVerified": boolean,
    "createdAt": "ISO 8601 date",
    "updatedAt": "ISO 8601 date"
  }
}
```

#### `PATCH /api/admin/users/[id]`

Update a user by ID.

**Authentication:** Required (`requireAdminOrStaff`)

**Request Body:**

```json
{
  "name": "string",
  "role": "user" | "staff" | "admin",
  "banned": boolean,
  "banReason": "string",
  "banExpires": "ISO 8601 date"
}
```

**Response:**

```json
{
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "user" | "staff" | "admin",
    "banned": boolean,
    "emailVerified": boolean,
    "createdAt": "ISO 8601 date",
    "updatedAt": "ISO 8601 date"
  }
}
```

#### `GET /api/admin/sessions`

List all sessions with filtering.

**Authentication:** Required (`requireAdminOrStaff`)

**Query Parameters:**

- `userId` (optional): Filter by user ID
- `active` (optional): Filter active sessions (`true`/`false`)
- `limit` (optional): Maximum results (default: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response:**

```json
{
  "sessions": [
    {
      "id": "string",
      "userId": "string",
      "expiresAt": "ISO 8601 date",
      "ipAddress": "string | null",
      "userAgent": "string | null",
      "createdAt": "ISO 8601 date"
    }
  ]
}
```

#### `GET /api/admin/sessions/[id]`

Get a specific session by ID.

**Authentication:** Required (`requireAdminOrStaff`)

**Response:**

```json
{
  "session": {
    "id": "string",
    "userId": "string",
    "expiresAt": "ISO 8601 date",
    "ipAddress": "string | null",
    "userAgent": "string | null",
    "createdAt": "ISO 8601 date"
  }
}
```

#### `DELETE /api/admin/sessions/[id]`

Revoke a session by ID.

**Authentication:** Required (`requireAdminOrStaff`)

**Response:**

```json
{
  "ok": true
}
```

#### `GET /api/admin/api-keys`

List API keys with filtering.

**Authentication:** Required (`requireAdminOrStaff`)

**Query Parameters:**

- `userId` (optional): Filter by user ID
- `enabled` (optional): Filter by enabled status (`true`/`false`)
- `limit` (optional): Maximum results (default: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response:**

```json
{
  "apiKeys": [
    {
      "id": "string",
      "userId": "string",
      "name": "string",
      "enabled": boolean,
      "lastUsedAt": "ISO 8601 date | null",
      "createdAt": "ISO 8601 date",
      "user": {
        "id": "string",
        "email": "string",
        "name": "string"
      }
    }
  ]
}
```

#### `GET /api/admin/api-keys/[id]`

Get a specific API key by ID.

**Authentication:** Required (`requireAdminOrStaff`)

**Response:**

```json
{
  "apiKey": {
    "id": "string",
    "userId": "string",
    "name": "string",
    "enabled": boolean,
    "lastUsedAt": "ISO 8601 date | null",
    "createdAt": "ISO 8601 date",
    "user": {
      "id": "string",
      "email": "string",
      "name": "string"
    }
  }
}
```

#### `DELETE /api/admin/api-keys/[id]`

Delete an API key by ID.

**Authentication:** Required (`requireAdminOrStaff`)

**Response:**

```json
{
  "ok": true
}
```

#### `GET /api/admin/oauth-clients`

List OAuth clients.

**Authentication:** Required (`requireAdminOrStaff`)

**Query Parameters:**

- `limit` (optional): Maximum results (default: 100)
- `offset` (optional): Pagination offset (default: 0)

**Response:**

```json
{
  "oauthClients": [
    {
      "id": "string",
      "name": "string",
      "clientId": "string",
      "redirectUris": ["string"],
      "disabled": boolean,
      "createdAt": "ISO 8601 date"
    }
  ]
}
```

#### `GET /api/admin/oauth-clients/[id]`

Get a specific OAuth client by ID.

**Authentication:** Required (`requireAdminOrStaff`)

**Response:**

```json
{
  "oauthClient": {
    "id": "string",
    "name": "string",
    "clientId": "string",
    "redirectUris": ["string"],
    "disabled": boolean,
    "createdAt": "ISO 8601 date"
  }
}
```

#### `GET /api/admin/stats`

Get admin dashboard statistics.

**Authentication:** Required (`requireAdminOrStaff`)

**Response:**

```json
{
  "users": {
    "total": number,
    "admins": number,
    "staff": number,
    "banned": number,
    "regular": number
  },
  "sessions": {
    "total": number,
    "active": number
  },
  "apiKeys": {
    "total": number,
    "enabled": number
  },
  "oauthClients": {
    "total": number,
    "disabled": number
  }
}
```

---

### Integration Endpoints

#### `GET /api/integrations`

List available integrations.

**Authentication:** Required (`requireAuth`)

**Response:**

```json
{
  "ok": true,
  "integrations": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "enabled": boolean,
      "icon": "string | null"
    }
  ]
}
```

#### `GET /api/integrations/[integration]/accounts`

List integration accounts for the current user.

**Authentication:** Required (`requireAuth`)

**Response:**

```json
{
  "ok": true,
  "accounts": [
    {
      "id": "string",
      "userId": "string",
      "integrationId": "string",
      "data": {},
      "createdAt": "ISO 8601 date"
    }
  ]
}
```

#### `POST /api/integrations/[integration]/accounts`

Create an integration account for the current user.

**Authentication:** Required (`requireAuth`)

**Request Body:**

```json
{
  "key1": "value1",
  "key2": "value2"
}
```

**Response:**

```json
{
  "ok": true,
  "account": {
    "id": "string",
    "userId": "string",
    "integrationId": "string",
    "data": {},
    "createdAt": "ISO 8601 date"
  }
}
```

**Status Code:** `201 Created`

#### `GET /api/integrations/[integration]/accounts/[id]`

Get a specific integration account.

**Authentication:** Required (`requireAuth` - owner or admin)

**Response:**

```json
{
  "ok": true,
  "account": {
    "id": "string",
    "userId": "string",
    "integrationId": "string",
    "data": {},
    "createdAt": "ISO 8601 date"
  }
}
```

#### `PATCH /api/integrations/[integration]/accounts/[id]`

Update an integration account.

**Authentication:** Required (`requireAuth` - owner or admin)

**Request Body:**

```json
{
  "key1": "new-value1"
}
```

**Response:**

```json
{
  "ok": true,
  "account": {
    "id": "string",
    "userId": "string",
    "integrationId": "string",
    "data": {},
    "createdAt": "ISO 8601 date"
  }
}
```

#### `DELETE /api/integrations/[integration]/accounts/[id]`

Delete an integration account.

**Authentication:** Required (`requireAuth` - owner or admin)

**Response:**

```json
{
  "ok": true
}
```

---

### Monitoring Endpoints

#### `POST /api/monitoring`

Sentry tunnel endpoint for forwarding error reports.

**Authentication:** Not required (public endpoint)

**Request:** Sentry envelope format

**Response:** Forwarded Sentry response

#### `GET /api/monitoring`

Health check endpoint.

**Authentication:** Not required

**Response:**

```json
{
  "status": "ok",
  "service": "sentry-tunnel"
}
```

---

## Error Handling

### Error Codes

Common error messages:

- `"Unauthorized"` (401) - Authentication required
- `"Forbidden - Admin access required"` (403) - Admin role required
- `"Forbidden - Admin or Staff access required"` (403) - Admin or staff role required
- `"User not found"` (404) - User does not exist
- `"Unknown integration"` (404) - Integration not found
- `"Integration is disabled"` (403) - Integration not available
- `"Invalid request body"` (400) - Request validation failed
- `"Internal server error"` (500) - Server error (details logged to Sentry)

### Error Response Format

```json
{
  "ok": false,
  "error": "Error message",
  "details": { ... } // Optional Zod validation issues
}
```

### Route parameters

Dynamic segments (`[id]`, `[integration]`) are user input and are validated before use:

- **`[id]`**: Validated with `parseRouteId()` from `@/shared/api/utils`. Invalid format (empty, oversize, or non-string) returns `400` with error `"Invalid id format"`.
- **`[integration]`**: Validated via the integration registry; unknown or disabled integration returns `404` or `403` as appropriate.

## Rate Limiting

Rate limiting may be applied to prevent abuse. Check response headers:

- `X-RateLimit-Limit`: Maximum requests per window
- `X-RateLimit-Remaining`: Remaining requests in current window
- `X-RateLimit-Reset`: Unix timestamp when limit resets

## Pagination

Many list endpoints support pagination via query parameters:

- `limit`: Maximum number of results (default varies by endpoint)
- `offset`: Number of results to skip (default: 0)

**Example:**

```
GET /api/admin/users?limit=20&offset=40
```

## Best Practices

1. **Always check response status codes** before processing data
2. **Handle errors gracefully** - show user-friendly messages
3. **Use pagination** for large datasets
4. **Cache responses** when appropriate (respect cache headers)
5. **Include proper authentication** headers for protected endpoints
6. **Validate request data** before sending
7. **Handle rate limiting** with exponential backoff

## Examples

### Fetching User Profile

```typescript
const response = await fetch('/api/user/me', {
  credentials: 'include', // Include session cookie
});

if (!response.ok) {
  const error = await response.json();
  throw new Error(error.error);
}

const data = await response.json();
console.log(data.user);
```

### Creating Integration Account

```typescript
const response = await fetch('/api/integrations/xmpp/accounts', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    username: 'user@atl.chat',
    password: 'secure-password',
  }),
});

if (!response.ok) {
  const error = await response.json();
  throw new Error(error.error);
}

const data = await response.json();
console.log(data.account);
```

### Admin API with API Key

```typescript
const response = await fetch('/api/admin/stats', {
  headers: {
    'Authorization': `Bearer ${apiKey}`,
  },
});

const data = await response.json();
console.log(data.users.total);
```
