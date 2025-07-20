-- Rollback: Migration des données startup_users
-- Date: 2025-07-20
-- Description: Annule la migration des données vers startup_users

-- ATTENTION: Ce script supprime toutes les données de startup_users
-- Assurez-vous que les données source dans user_profiles sont toujours disponibles

-- 1. SAUVEGARDER LES DONNÉES AVANT SUPPRESSION (optionnel)
-- Créer une table temporaire avec les données actuelles
CREATE TABLE IF NOT EXISTS startup_users_backup AS 
SELECT * FROM startup_users;

-- 2. VIDER LA TABLE startup_users
DELETE FROM startup_users;

-- 3. VÉRIFICATION
DO $$
DECLARE
    remaining_count INTEGER;
    backup_count INTEGER;
BEGIN
    -- Compter les enregistrements restants
    SELECT COUNT(*) INTO remaining_count FROM startup_users;
    
    -- Compter les enregistrements sauvegardés
    SELECT COUNT(*) INTO backup_count FROM startup_users_backup;
    
    RAISE NOTICE 'Rollback terminé:';
    RAISE NOTICE '- Enregistrements restants dans startup_users: %', remaining_count;
    RAISE NOTICE '- Enregistrements sauvegardés dans startup_users_backup: %', backup_count;
    
    IF remaining_count = 0 THEN
        RAISE NOTICE '✅ Rollback réussi - startup_users vidée';
        RAISE NOTICE 'ℹ️  Données sauvegardées dans startup_users_backup';
    ELSE
        RAISE WARNING '⚠️  Rollback incomplet - vérifier les données';
    END IF;
END $$;

-- 4. INSTRUCTIONS POUR RESTAURER LES DONNÉES
-- Si vous voulez restaurer les données depuis la sauvegarde:
-- INSERT INTO startup_users SELECT * FROM startup_users_backup;

-- 5. NETTOYER LA SAUVEGARDE (à exécuter manuellement si souhaité)
-- DROP TABLE startup_users_backup;