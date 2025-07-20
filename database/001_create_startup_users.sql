-- Migration: Create startup_users table
-- Date: 2025-07-20
-- Description: Table pour gérer les utilisateurs du site startup (non-SaaS)

-- 1. CREATE TABLE startup_users
CREATE TABLE startup_users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT DEFAULT 'France',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CREATE INDEX for performance
CREATE INDEX idx_startup_users_email ON startup_users(email);
CREATE INDEX idx_startup_users_active ON startup_users(is_active);

-- 3. CREATE TRIGGER for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_startup_users_updated_at 
    BEFORE UPDATE ON startup_users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- 4. ENABLE ROW LEVEL SECURITY
ALTER TABLE startup_users ENABLE ROW LEVEL SECURITY;

-- 5. CREATE RLS POLICIES
-- Policy: Users can only see and modify their own profile
CREATE POLICY "Users can view own profile" ON startup_users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON startup_users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON startup_users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Policy: No delete allowed (soft delete with is_active)
CREATE POLICY "No delete allowed" ON startup_users
    FOR DELETE USING (false);

-- 6. GRANT PERMISSIONS
-- Grant permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON startup_users TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- Comments for documentation
COMMENT ON TABLE startup_users IS 'Table des utilisateurs pour le site startup (non-SaaS)';
COMMENT ON COLUMN startup_users.id IS 'UUID référençant auth.users(id)';
COMMENT ON COLUMN startup_users.email IS 'Email de l''utilisateur (unique)';
COMMENT ON COLUMN startup_users.is_active IS 'Statut actif/inactif (soft delete)';