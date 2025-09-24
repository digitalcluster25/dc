# 🔐 AUTH_MODULE API Specification

## Overview
REST API для аутентификации и управления пользователями в Railway SaaS Platform.

**Base URL:** `http://localhost:3080/api/auth`

**Authentication:** Bearer Token (JWT)

## Endpoints

### POST /register
Регистрация нового пользователя

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Регистрация успешна! Проверьте email для подтверждения аккаунта.",
  "user": {
    "id": "user_1234567890_abc123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "emailVerified": false,
    "createdAt": "2025-09-22T10:00:00.000Z",
    "updatedAt": "2025-09-22T10:00:00.000Z"
  }
}
```

**Validation Errors (400):**
```json
{
  "success": false,
  "message": "Email и пароль обязательны"
}
```

### POST /login
Вход в систему

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Вход выполнен успешно",
  "user": {
    "id": "user_1234567890_abc123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "emailVerified": false,
    "lastLoginAt": "2025-09-22T10:00:00.000Z",
    "createdAt": "2025-09-22T10:00:00.000Z",
    "updatedAt": "2025-09-22T10:00:00.000Z"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Authentication Error (401):**
```json
{
  "success": false,
  "message": "Неверный email или пароль"
}
```

### POST /logout
Выход из системы

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Выход выполнен успешно"
}
```

### POST /refresh
Обновление access token

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response (200):**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Invalid Token Error (401):**
```json
{
  "success": false,
  "message": "Недействительный refresh token"
}
```

### GET /me
Получить информацию о текущем пользователе

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "user_1234567890_abc123",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "emailVerified": false,
    "lastLoginAt": "2025-09-22T10:00:00.000Z",
    "createdAt": "2025-09-22T10:00:00.000Z",
    "updatedAt": "2025-09-22T10:00:00.000Z"
  }
}
```

**Unauthorized Error (401):**
```json
{
  "success": false,
  "message": "Токен авторизации не предоставлен"
}
```

## Authentication Flow

### 1. Registration
```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Database
    participant Email

    Client->>API: POST /register
    API->>Database: Create user
    API->>Email: Send verification email
    API->>Client: Registration success
```

### 2. Login
```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Database

    Client->>API: POST /login
    API->>Database: Verify credentials
    API->>API: Generate JWT tokens
    API->>Client: Access + Refresh tokens
```

### 3. Token Refresh
```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Database

    Client->>API: POST /refresh
    API->>API: Verify refresh token
    API->>Database: Check token validity
    API->>API: Generate new tokens
    API->>Client: New access + refresh tokens
```

## Security Features

### Password Security
- **Minimum 8 characters**
- **Must contain:** uppercase, lowercase, numbers
- **BCrypt hashing** with salt rounds = 12
- **Rate limiting:** 5 login attempts per 15 minutes

### JWT Tokens
- **Access Token:** 15 minutes TTL
- **Refresh Token:** 7 days TTL
- **Algorithm:** HS256
- **Signature verification** on every request

### Rate Limiting
- **Login attempts:** 5 per IP per 15 minutes
- **Registration:** 3 per IP per hour
- **Token refresh:** 10 per user per minute

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Invalid credentials or token |
| 403 | Forbidden | Email not verified |
| 404 | Not Found | User not found |
| 409 | Conflict | Email already exists |
| 422 | Validation Error | Input validation failed |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

## Testing Examples

### cURL Examples

**Register:**
```bash
curl -X POST http://localhost:3080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123",
    "firstName": "Test",
    "lastName": "User"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:3080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'
```

**Get Current User:**
```bash
curl -X GET http://localhost:3080/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

**Refresh Token:**
```bash
curl -X POST http://localhost:3080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

**Logout:**
```bash
curl -X POST http://localhost:3080/api/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

## Frontend Integration

### Using useAuth Hook
```typescript
import { useAuth } from '../modules/auth/hooks/useAuth';

function LoginComponent() {
  const { login, loading, user } = useAuth();

  const handleLogin = async (email: string, password: string) => {
    const success = await login(email, password);
    if (success) {
      router.push('/dashboard');
    }
  };

  return (
    // Login form JSX
  );
}
```

### Protected Routes
```typescript
import { useRequireAuth } from '../modules/auth/hooks/useAuth';

function ProtectedPage() {
  const { user, loading } = useRequireAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div>Welcome, {user?.firstName}!</div>
  );
}
```

## Environment Variables

```bash
# JWT Secrets
JWT_SECRET=your-super-secret-jwt-key
REFRESH_SECRET=your-super-secret-refresh-key

# App Settings
NEXTAUTH_URL=http://localhost:3080
REQUIRE_EMAIL_VERIFICATION=false

# Development
NODE_ENV=development
```

## Next Steps

1. **Database Integration:** Replace temporary storage with PostgreSQL + Drizzle ORM
2. **Email Service:** Add Resend integration for email verification
3. **Redis Sessions:** Add Redis for refresh token storage
4. **Password Reset:** Implement forgot password flow
5. **Social Login:** Add Google/GitHub OAuth
6. **User Profiles:** Add profile editing functionality
7. **Admin Panel:** Create user management interface

## Status
✅ **Completed:** Core authentication flow, JWT tokens, UI components  
🔄 **In Progress:** Database integration, email verification  
📋 **Planned:** Social login, admin features, audit logging
