-- HR FormKit initial schema
-- Migration: 0001_initial.sql

CREATE TABLE tenants (
  id         TEXT    PRIMARY KEY,
  name       TEXT    NOT NULL,
  plan       TEXT    DEFAULT 'starter',
  created_at INTEGER NOT NULL
);

CREATE TABLE users (
  id         TEXT    PRIMARY KEY,
  tenant_id  TEXT    NOT NULL REFERENCES tenants(id),
  email      TEXT    NOT NULL UNIQUE,
  password   TEXT    NOT NULL,
  role       TEXT    DEFAULT 'hr_admin',
  created_at INTEGER NOT NULL
);

CREATE TABLE forms (
  id          TEXT    PRIMARY KEY,
  tenant_id   TEXT    NOT NULL REFERENCES tenants(id),
  title       TEXT    NOT NULL,
  description TEXT,
  blocks      TEXT    NOT NULL DEFAULT '[]',
  logo_url    TEXT,
  active      INTEGER DEFAULT 1,
  created_at  INTEGER NOT NULL,
  updated_at  INTEGER NOT NULL
);

CREATE TABLE share_tokens (
  token       TEXT    PRIMARY KEY,
  form_id     TEXT    NOT NULL REFERENCES forms(id) ON DELETE CASCADE,
  expires_at  INTEGER,
  created_at  INTEGER NOT NULL,
  share_count INTEGER DEFAULT 0
);

CREATE TABLE responses (
  id           TEXT    PRIMARY KEY,
  form_id      TEXT    NOT NULL REFERENCES forms(id),
  tenant_id    TEXT    NOT NULL,
  applicant    TEXT    NOT NULL DEFAULT '{}',
  data         TEXT    NOT NULL DEFAULT '{}',
  status       TEXT    DEFAULT 'new',
  starred      INTEGER DEFAULT 0,
  submitted_at INTEGER NOT NULL,
  reviewed_at  INTEGER,
  approved_at  INTEGER
);

CREATE TABLE file_uploads (
  id          TEXT    PRIMARY KEY,
  response_id TEXT    REFERENCES responses(id),
  r2_key      TEXT    NOT NULL,
  mime_type   TEXT,
  size_bytes  INTEGER,
  uploaded_at INTEGER NOT NULL
);

-- Indexes
CREATE INDEX idx_responses_form   ON responses(form_id, status);
CREATE INDEX idx_responses_tenant ON responses(tenant_id, submitted_at DESC);
CREATE INDEX idx_forms_tenant     ON forms(tenant_id, active);
CREATE INDEX idx_users_email      ON users(email);
CREATE INDEX idx_share_form       ON share_tokens(form_id);
