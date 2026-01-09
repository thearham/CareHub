# Authentication API Documentation

## Base URL
```
http://localhost:8000/api
```

## Authentication
All endpoints (except registration and login) require JWT authentication.

### Headers
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

---

## 1. Login (Get JWT Token)

**Endpoint:** `POST /token/`  
**Authentication:** None (Public)  
**Description:** Authenticate user and receive JWT tokens

### Request Body
```json
{
  "username": "string",
  "password": "string"
}
```

### Success Response (200 OK)
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Error Responses

**401 Unauthorized**
```json
{
  "detail": "No active account found with the given credentials"
}
```

**400 Bad Request**
```json
{
  "username": ["This field is required."],
  "password": ["This field is required."]
}
```

### Validation Rules
- `username`: Required, string
- `password`: Required, string

---

## 2. Refresh Token

**Endpoint:** `POST /token/refresh/`  
**Authentication:** None  
**Description:** Get new access token using refresh token

### Request Body
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Success Response (200 OK)
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc..."
}
```

### Error Responses

**401 Unauthorized**
```json
{
  "detail": "Token is invalid or expired",
  "code": "token_not_valid"
}
```

### Validation Rules
- `refresh`: Required, valid JWT refresh token

---

## Token Expiry
- **Access Token:** 60 minutes (configurable via `JWT_ACCESS_TOKEN_LIFETIME_MINUTES`)
- **Refresh Token:** 7 days (configurable via `JWT_REFRESH_TOKEN_LIFETIME_DAYS`)

## Notes for Frontend Integration
1. Store tokens securely (httpOnly cookies or secure storage)
2. Include access token in Authorization header for all authenticated requests
3. Implement token refresh logic before access token expires
4. Handle 401 errors by refreshing token or redirecting to login
5. Clear tokens on logout
