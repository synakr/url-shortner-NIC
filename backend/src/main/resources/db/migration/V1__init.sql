-- =========================
-- USERS TABLE
-- =========================
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    role VARCHAR(20) NOT NULL DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);



-- =========================
-- URLS TABLE
-- =========================
CREATE TABLE urls (
    id BIGSERIAL PRIMARY KEY,
    original_url VARCHAR(2048) NOT NULL,
    short_code VARCHAR(10) NOT NULL UNIQUE,
    click_count BIGINT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    expires_at TIMESTAMP NOT NULL,
    expired_at TIMESTAMP,
    user_id BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,

    CONSTRAINT fk_urls_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_urls_user_id ON urls(user_id);


-- =========================
-- CLICK_ANALYTICS TABLE
-- =========================
CREATE TABLE click_analytics (
    id BIGSERIAL PRIMARY KEY,
    url_id BIGINT NOT NULL,
    ip_address VARCHAR(45),
    user_agent VARCHAR(512),
    country VARCHAR(100),
    city VARCHAR(100),
    referer VARCHAR(2048),
    clicked_at TIMESTAMP NOT NULL,

    CONSTRAINT fk_click_analytics_url
        FOREIGN KEY (url_id)
        REFERENCES urls(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_click_url_id ON click_analytics(url_id);
CREATE INDEX idx_click_clicked_at ON click_analytics(clicked_at);

CREATE INDEX idx_click_url_time
ON click_analytics(url_id, clicked_at DESC);