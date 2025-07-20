# Migrations Database - SparesTech

## Migration 001: Table startup_users

### Description
Cette migration crée la table `startup_users` pour gérer les utilisateurs du site startup (non-SaaS), remplaçant l'ancienne table `user_profiles` pour les utilisateurs startup.

### Contenu de la migration

#### 1. Table startup_users
- **id**: UUID (clé primaire, référence auth.users)
- **email**: TEXT (unique, obligatoire)
- **first_name**: TEXT (optionnel)
- **last_name**: TEXT (optionnel) 
- **company_name**: TEXT (optionnel)
- **phone**: TEXT (optionnel)
- **address**: TEXT (optionnel)
- **city**: TEXT (optionnel)
- **postal_code**: TEXT (optionnel)
- **country**: TEXT (défaut: 'France')
- **is_active**: BOOLEAN (défaut: true)
- **created_at**: TIMESTAMPTZ (auto)
- **updated_at**: TIMESTAMPTZ (auto)

#### 2. Sécurité RLS (Row Level Security)
- **Policy SELECT**: Les utilisateurs peuvent voir leur propre profil uniquement
- **Policy UPDATE**: Les utilisateurs peuvent modifier leur propre profil uniquement
- **Policy INSERT**: Les utilisateurs peuvent créer leur propre profil uniquement
- **Policy DELETE**: Suppression interdite (soft delete avec is_active)

#### 3. Performance
- **Index sur email**: Pour les recherches rapides
- **Index sur is_active**: Pour filtrer les utilisateurs actifs
- **Trigger updated_at**: Mise à jour automatique du timestamp

### Comment exécuter la migration

#### Dans Supabase Dashboard (SQL Editor)
```sql
-- Copier et exécuter le contenu de 001_create_startup_users.sql
```

#### Via Supabase CLI (si configuré)
```bash
# Placer le fichier dans supabase/migrations/
# Puis exécuter
supabase db push
```

### Comment annuler la migration
```sql
-- Exécuter le script de rollback
-- Contenu dans 001_rollback_startup_users.sql
```

### Types TypeScript
Les types ont été ajoutés dans `src/shared/types/user.ts`:
- `StartupUser`: Interface complète
- `CreateStartupUser`: Pour la création (sans id/timestamps)
- `UpdateStartupUser`: Pour les mises à jour (champs optionnels)

### Service TypeScript
Le service a été mis à jour dans `src/startup/services/userProfileService.ts`:
- `getStartupUserProfile()`: Récupérer un profil
- `createStartupUserProfile()`: Créer un profil
- `updateStartupUserProfile()`: Mettre à jour un profil
- `updateStartupUserEmail()`: Changer l'email
- `getOrCreateStartupUserProfile()`: Récupérer ou créer
- `deactivateStartupUser()`: Désactiver (soft delete)
- `reactivateStartupUser()`: Réactiver

### Différences avec user_profiles (SaaS)
- **Pas de tenant_id**: Les utilisateurs startup ne sont pas liés à un tenant
- **Pas de role**: Pas de système de rôles pour les utilisateurs startup
- **first_name/last_name**: Séparation du nom complet
- **Sécurité simplifiée**: RLS basique pour les profils individuels

### Prochaines étapes
1. ✅ Exécuter la migration dans Supabase
2. ✅ Tester les fonctions du service
3. ✅ Mettre à jour les composants React pour utiliser les nouveaux types
4. ✅ Migrer les données existantes

### Migration Data Réalisée - Migration 002
Les données des utilisateurs startup ont été migrées de `user_profiles` vers `startup_users`.
Voir les scripts :
- `002_migrate_startup_users_data.sql` : Migration des données
- `002_rollback_startup_users_data.sql` : Rollback si nécessaire

### Code TypeScript Adapté
- ✅ Services mis à jour pour utiliser `startup_users`
- ✅ Pages startup adaptées pour les nouveaux types
- ✅ Composants de profil mis à jour avec first_name/last_name
- ✅ MarketplaceService adapté pour créer les deux profils (startup + tenant)

### Test de la migration
```sql
-- Test d'insertion
INSERT INTO startup_users (id, email, first_name, last_name) 
VALUES (gen_random_uuid(), 'test@example.com', 'John', 'Doe');

-- Test de sélection
SELECT * FROM startup_users WHERE email = 'test@example.com';

-- Test de mise à jour
UPDATE startup_users SET company_name = 'Test Corp' WHERE email = 'test@example.com';
```