-- Users table for Zenvora role-based authentication.
-- Roles: 'admin' (full CRUD) | 'client' (view only)
-- Guests are unauthenticated visitors; they have no row here.

CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  name          VARCHAR(100)  NOT NULL,
  email         VARCHAR(255)  NOT NULL UNIQUE,
  password_hash TEXT          NOT NULL,
  role          VARCHAR(20)   NOT NULL DEFAULT 'client'
                              CHECK (role IN ('admin', 'client')),
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS users_email_idx ON users (LOWER(email));

