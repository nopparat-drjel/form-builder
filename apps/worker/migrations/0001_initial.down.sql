-- Rollback: 0001_initial.down.sql

DROP INDEX IF EXISTS idx_share_form;
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_forms_tenant;
DROP INDEX IF EXISTS idx_responses_tenant;
DROP INDEX IF EXISTS idx_responses_form;

DROP TABLE IF EXISTS file_uploads;
DROP TABLE IF EXISTS responses;
DROP TABLE IF EXISTS share_tokens;
DROP TABLE IF EXISTS forms;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS tenants;
