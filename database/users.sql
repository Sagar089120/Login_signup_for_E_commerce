-- iSteer E-Commerce Database Schema
-- SQLite-compatible

CREATE TABLE IF NOT EXISTS users (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name     TEXT    NOT NULL,
    last_name      TEXT    NOT NULL,
    email          TEXT    NOT NULL UNIQUE COLLATE NOCASE,
    password_hash  TEXT    NOT NULL,
    salt           TEXT    NOT NULL,
    phone          TEXT,
    newsletter     INTEGER NOT NULL DEFAULT 0,   -- 0 = false, 1 = true
    is_active      INTEGER NOT NULL DEFAULT 1,
    is_admin       INTEGER NOT NULL DEFAULT 0,
    created_at     TEXT    NOT NULL,
    last_login     TEXT,
    profile_pic    TEXT
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- ── Sample admin seed (password: Admin@1234) ──────────────
-- INSERT OR IGNORE INTO users
--   (first_name, last_name, email, password_hash, salt, newsletter, is_admin, created_at)
-- VALUES
--   ('iSteer', 'Admin', 'admin@isteer.com',
--    '<hash>', '<salt>', 0, 1, datetime('now'));