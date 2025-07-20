-- Rollback: Drop startup_users table and associated elements
-- Date: 2025-07-20
-- Description: Script pour annuler la création de la table startup_users

-- 1. DROP POLICIES
DROP POLICY IF EXISTS "Users can view own profile" ON startup_users;
DROP POLICY IF EXISTS "Users can update own profile" ON startup_users;
DROP POLICY IF EXISTS "Users can insert own profile" ON startup_users;
DROP POLICY IF EXISTS "No delete allowed" ON startup_users;

-- 2. DROP TRIGGER
DROP TRIGGER IF EXISTS update_startup_users_updated_at ON startup_users;

-- 3. DROP INDEXES
DROP INDEX IF EXISTS idx_startup_users_email;
DROP INDEX IF EXISTS idx_startup_users_active;

-- 4. DROP TABLE
DROP TABLE IF EXISTS startup_users;

-- 5. DROP FUNCTION (only if not used by other tables)
-- DROP FUNCTION IF EXISTS update_updated_at_column();
-- Note: Ne pas supprimer la fonction si elle est utilisée par d'autres tables