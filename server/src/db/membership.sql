-- Memberships table for Zenvora luxury privilege program.
-- 1:1 relationship with users table.

CREATE TABLE IF NOT EXISTS memberships (
    id              SERIAL PRIMARY KEY,
    user_id         INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    membership_id   VARCHAR(50) NOT NULL UNIQUE,
    membership_type VARCHAR(50) NOT NULL DEFAULT 'Privilege Royal',
    status          VARCHAR(30) NOT NULL DEFAULT 'Active',
    joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS memberships_user_id_idx ON memberships (user_id);

