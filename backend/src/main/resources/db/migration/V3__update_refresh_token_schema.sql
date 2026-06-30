-- Rename token column
ALTER TABLE refresh_tokens
RENAME COLUMN token TO token_hash;

-- Change column size
ALTER TABLE refresh_tokens
ALTER COLUMN token_hash TYPE VARCHAR(64);

-- Rename index (optional but recommended)
ALTER INDEX idx_refresh_token
RENAME TO idx_refresh_token_hash;