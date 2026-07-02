CREATE TABLE audit_logs (
    id BIGSERIAL PRIMARY KEY,

    username VARCHAR(100),
    email VARCHAR(255),

    event VARCHAR(50) NOT NULL,

    ip_address VARCHAR(100),
    user_agent TEXT,

    details TEXT,

    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_username ON audit_logs(username);
CREATE INDEX idx_audit_event ON audit_logs(event);
CREATE INDEX idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX idx_audit_email ON audit_logs(email);
