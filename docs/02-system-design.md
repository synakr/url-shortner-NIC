# System Design

## High Level Architecture

```text
User
  │
  ▼
React Frontend
  │ REST API
  ▼
Spring Boot Backend
  │
  ├── PostgreSQL
  │     └── Persistent Storage
  │
  └── Redis
        └── URL Cache
```

## Request Flow

### URL Creation

User → Frontend → Backend → PostgreSQL

### URL Redirect

User → Backend

1. Check Redis
2. If found → Redirect
3. Else query PostgreSQL
4. Store in Redis
5. Redirect

### Analytics Flow

Redirect Request

↓

Analytics Event Recorded

↓

Stored in PostgreSQL

↓

Displayed on Dashboard

```
```
