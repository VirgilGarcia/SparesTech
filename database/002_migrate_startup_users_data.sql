-- Migration des données: user_profiles vers startup_users
-- Date: 2025-07-20
-- Description: Migre les données de user_profiles (tenant_id IS NULL) vers startup_users

-- 1. CRÉER LA TABLE startup_users SI ELLE N'EXISTE PAS
-- (Exécuter d'abord 001_create_startup_users.sql si pas fait)

-- 2. MIGRER LES DONNÉES
-- Insérer les utilisateurs startup depuis user_profiles
INSERT INTO startup_users (
    id, 
    email, 
    first_name,
    last_name,
    company_name,
    phone, 
    address, 
    city, 
    postal_code, 
    country,
    is_active,
    created_at, 
    updated_at
)
SELECT 
    up.id, 
    up.email, 
    -- Diviser company_name en first_name/last_name si nécessaire
    CASE 
        WHEN up.company_name IS NOT NULL AND position(' ' in up.company_name) > 0 
        THEN split_part(up.company_name, ' ', 1)
        ELSE COALESCE(up.company_name, '')
    END as first_name,
    CASE 
        WHEN up.company_name IS NOT NULL AND position(' ' in up.company_name) > 0 
        THEN substring(up.company_name from position(' ' in up.company_name) + 1)
        ELSE ''
    END as last_name,
    up.company_name,
    up.phone, 
    up.address, 
    up.city, 
    up.postal_code, 
    COALESCE(up.country, 'France') as country,
    COALESCE(up.is_active, true) as is_active,
    up.created_at, 
    up.updated_at
FROM user_profiles up
WHERE up.tenant_id IS NULL
AND NOT EXISTS (
    -- Éviter les doublons si la migration a déjà été exécutée
    SELECT 1 FROM startup_users su WHERE su.id = up.id
);

-- 3. VÉRIFICATION DE LA MIGRATION
-- Compter les enregistrements migrés
DO $$
DECLARE
    source_count INTEGER;
    target_count INTEGER;
BEGIN
    -- Compter les utilisateurs startup dans user_profiles
    SELECT COUNT(*) INTO source_count 
    FROM user_profiles 
    WHERE tenant_id IS NULL;
    
    -- Compter les utilisateurs dans startup_users
    SELECT COUNT(*) INTO target_count 
    FROM startup_users;
    
    RAISE NOTICE 'Migration terminée:';
    RAISE NOTICE '- Utilisateurs startup dans user_profiles: %', source_count;
    RAISE NOTICE '- Utilisateurs dans startup_users: %', target_count;
    
    IF target_count >= source_count THEN
        RAISE NOTICE '✅ Migration réussie';
    ELSE
        RAISE WARNING '⚠️  Migration incomplète - vérifier les données';
    END IF;
END $$;

-- 4. AFFICHER UN ÉCHANTILLON DES DONNÉES MIGRÉES
SELECT 
    'ÉCHANTILLON - startup_users' as table_name,
    id,
    email,
    first_name,
    last_name,
    company_name,
    country,
    is_active,
    created_at
FROM startup_users
ORDER BY created_at DESC
LIMIT 5;

-- 5. COMMENTAIRES POUR LA DOCUMENTATION
COMMENT ON TABLE startup_users IS 'Table des utilisateurs startup migrée depuis user_profiles (tenant_id IS NULL)';

-- NOTE: Après cette migration, les données dans user_profiles avec tenant_id IS NULL
-- peuvent être conservées pour référence ou supprimées selon les besoins.
-- Pour supprimer (ATTENTION - action irréversible):
-- DELETE FROM user_profiles WHERE tenant_id IS NULL;