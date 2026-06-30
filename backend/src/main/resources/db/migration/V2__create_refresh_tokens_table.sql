CREATE TABLE refresh_tokens (

    id BIGSERIAL PRIMARY KEY,

    token VARCHAR(512) NOT NULL UNIQUE,

    user_id BIGINT NOT NULL,

    expires_at TIMESTAMP NOT NULL,

    revoked BOOLEAN NOT NULL DEFAULT FALSE,

    created_at TIMESTAMP NOT NULL,

    updated_at TIMESTAMP NOT NULL,

    device_id VARCHAR(100),

    user_agent VARCHAR(500),

    ip_address VARCHAR(100),

    CONSTRAINT fk_refresh_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_refresh_user
ON refresh_tokens(user_id);

CREATE INDEX idx_refresh_token
ON refresh_tokens(token);