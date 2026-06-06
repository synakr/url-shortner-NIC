# Database Design

## User

| Field         | Type           |
| ------------- | -------------- |
| id            | UUID           |
| name          | VARCHAR        |
| email         | VARCHAR UNIQUE |
| password_hash | VARCHAR        |
| created_at    | TIMESTAMP      |

---

## URL

| Field           | Type           |
| --------------- | -------------- |
| id              | UUID           |
| user_id         | UUID           |
| short_code      | VARCHAR UNIQUE |
| original_url    | TEXT           |
| custom_alias    | VARCHAR UNIQUE |
| expiration_date | TIMESTAMP      |
| created_at      | TIMESTAMP      |
| updated_at      | TIMESTAMP      |

---

## ClickAnalytics

| Field      | Type      |
| ---------- | --------- |
| id         | UUID      |
| url_id     | UUID      |
| clicked_at | TIMESTAMP |

---

## Relationships

User (1) ----< URL (N)

URL (1) ----< ClickAnalytics (N)

```
```
