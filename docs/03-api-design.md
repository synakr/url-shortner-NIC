# API Design

## Base URL

```text
/api
```

---

# Authentication

## Register User

### Endpoint

```http
POST /api/auth/register
```

### Request Body

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "StrongPassword123"
}
```

### Success Response

**Status Code:** `201 Created`

```json
{
  "message": "User registered successfully"
}
```

### Error Responses

**Status Code:** `400 Bad Request`

```json
{
  "error": "Invalid request data"
}
```

**Status Code:** `409 Conflict`

```json
{
  "error": "Email already registered"
}
```

---

## Login User

### Endpoint

```http
POST /api/auth/login
```

### Request Body

```json
{
  "email": "john@example.com",
  "password": "StrongPassword123"
}
```

### Success Response

**Status Code:** `200 OK`

```json
{
  "token": "jwt-token",
  "userId": "uuid",
  "name": "John Doe"
}
```

### Error Responses

**Status Code:** `400 Bad Request`

```json
{
  "error": "Invalid request data"
}
```

**Status Code:** `401 Unauthorized`

```json
{
  "error": "Invalid email or password"
}
```

---

# URL Management

## Create Short URL

### Endpoint

```http
POST /api/urls
```

### Authentication

Required (JWT)

### Request Body

```json
{
  "originalUrl": "https://www.example.com/very/long/url",
  "customAlias": "my-link",
  "expirationDate": "2026-12-31T23:59:59Z"
}
```

### Notes

* `customAlias` is optional.
* `expirationDate` is optional.
* If no custom alias is provided, the system generates a unique short code.

### Success Response

**Status Code:** `201 Created`

```json
{
  "id": "uuid",
  "shortCode": "abc123",
  "shortUrl": "https://short.ly/abc123",
  "originalUrl": "https://www.example.com/very/long/url",
  "createdAt": "2026-06-06T10:00:00Z"
}
```

### Error Responses

**Status Code:** `400 Bad Request`

```json
{
  "error": "Invalid URL"
}
```

**Status Code:** `409 Conflict`

```json
{
  "error": "Custom alias already exists"
}
```

---

## Get User URLs

### Endpoint

```http
GET /api/urls
```

### Authentication

Required (JWT)

### Success Response

**Status Code:** `200 OK`

```json
[
  {
    "id": "uuid",
    "shortCode": "abc123",
    "shortUrl": "https://short.ly/abc123",
    "originalUrl": "https://example.com",
    "totalClicks": 15,
    "createdAt": "2026-06-06T10:00:00Z"
  }
]
```

---

## Get URL Details

### Endpoint

```http
GET /api/urls/{id}
```

### Authentication

Required (JWT)

### Success Response

**Status Code:** `200 OK`

```json
{
  "id": "uuid",
  "shortCode": "abc123",
  "shortUrl": "https://short.ly/abc123",
  "originalUrl": "https://example.com",
  "expirationDate": null,
  "totalClicks": 15,
  "createdAt": "2026-06-06T10:00:00Z"
}
```

### Error Response

**Status Code:** `404 Not Found`

```json
{
  "error": "URL not found"
}
```

---

## Delete URL

### Endpoint

```http
DELETE /api/urls/{id}
```

### Authentication

Required (JWT)

### Success Response

**Status Code:** `204 No Content`

---

# Analytics

## Get URL Analytics

### Endpoint

```http
GET /api/analytics/{urlId}
```

### Authentication

Required (JWT)

### Success Response

**Status Code:** `200 OK`

```json
{
  "urlId": "uuid",
  "totalClicks": 150,
  "createdAt": "2026-06-01T10:00:00Z",
  "lastClickedAt": "2026-06-05T18:20:00Z"
}
```

### Error Response

**Status Code:** `404 Not Found`

```json
{
  "error": "Analytics not found"
}
```

---

# Redirect

## Redirect to Original URL

### Endpoint

```http
GET /{shortCode}
```

### Success Response

**Status Code:** `302 Found`

Redirects user to the original URL.

### Error Responses

**Status Code:** `404 Not Found`

```json
{
  "error": "Short URL not found"
}
```

**Status Code:** `410 Gone`

```json
{
  "error": "Link has expired"
}
```

```
```
