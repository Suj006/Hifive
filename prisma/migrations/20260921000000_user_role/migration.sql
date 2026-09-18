-- Adds a role to each account so a second login type ("Viewer") can be
-- granted read-only access. Existing accounts (just "Jia" so far) default to
-- ADMIN so nothing changes for the current login.
ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'ADMIN';
