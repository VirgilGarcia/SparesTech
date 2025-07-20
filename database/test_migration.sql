-- Test de la Migration startup_users
-- Ce script vérifie que la migration s'est bien passée

-- 1. Vérifier que la table startup_users existe
SELECT 
    'startup_users' as table_name,
    count(*) as row_count,
    'Table créée et remplie' as status
FROM startup_users;

-- 2. Vérifier les contraintes et index
SELECT 
    constraint_name,
    constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'startup_users';

-- 3. Vérifier les index
SELECT 
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename = 'startup_users';

-- 4. Vérifier que les RLS policies sont activées
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'startup_users';

-- 5. Comparer les données migrées
SELECT 
    'user_profiles (startup)' as source_table,
    count(*) as count
FROM user_profiles 
WHERE tenant_id IS NULL

UNION ALL

SELECT 
    'startup_users' as source_table,
    count(*) as count
FROM startup_users;

-- 6. Test d'insertion (sera bloqué par RLS sauf si connecté)
-- INSERT INTO startup_users (id, email, first_name, last_name) 
-- VALUES (gen_random_uuid(), 'test@example.com', 'Test', 'User');

-- 7. Échantillon des données migrées
SELECT 
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
LIMIT 3;