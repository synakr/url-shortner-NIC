ALTER TABLE users
ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE users
ALTER COLUMN is_active SET DEFAULT FALSE;

-- optional but good for performance in login flows
CREATE INDEX idx_users_email_verified ON users(email_verified);