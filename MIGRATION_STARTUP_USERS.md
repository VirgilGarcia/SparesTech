# Guide de Migration - Utilisateurs Startup vers startup_users

## 📋 Résumé de la Migration

Cette migration sépare les utilisateurs du site startup de la table `user_profiles` (qui était partagée avec les utilisateurs SaaS) vers une nouvelle table dédiée `startup_users`.

## 🚀 Étapes d'Exécution

### 1. Créer la table startup_users

Exécuter dans Supabase SQL Editor :

```sql
-- Copier le contenu de database/001_create_startup_users.sql
```

### 2. Migrer les données

Exécuter dans Supabase SQL Editor :

```sql  
-- Copier le contenu de database/002_migrate_startup_users_data.sql
```

### 3. Vérifier la migration

La migration affichera automatiquement :
- Nombre d'utilisateurs startup dans user_profiles
- Nombre d'utilisateurs migrés vers startup_users
- Un échantillon des données migrées

### 4. Déployer le code

Le code TypeScript a été adapté pour :
- ✅ Utiliser la table `startup_users` pour les profils startup
- ✅ Maintenir `user_profiles` pour les utilisateurs SaaS avec tenant
- ✅ Créer les deux profils lors de la création de marketplace

## 📊 Changements Structurels

### Table startup_users

| Champ | Type | Description |
|-------|------|-------------|
| id | UUID | Référence auth.users(id) |
| email | TEXT | Email unique |
| first_name | TEXT | Prénom (nouveau) |
| last_name | TEXT | Nom (nouveau) |
| company_name | TEXT | Nom d'entreprise |
| phone | TEXT | Téléphone |
| address | TEXT | Adresse |
| city | TEXT | Ville |
| postal_code | TEXT | Code postal |
| country | TEXT | Pays (défaut: France) |
| is_active | BOOLEAN | Statut actif |
| created_at | TIMESTAMPTZ | Date création |
| updated_at | TIMESTAMPTZ | Date MAJ |

## 🔄 Services Adaptés

### startup/services/userProfileService.ts
- ✅ `getStartupUserProfile()` - Récupère depuis startup_users
- ✅ `createStartupUserProfile()` - Crée dans startup_users
- ✅ `updateStartupUserProfile()` - Met à jour startup_users
- ✅ `updateStartupUserEmail()` - Met à jour email auth + startup_users
- ✅ `getOrCreateStartupUserProfile()` - Récupère ou crée

### startup/services/marketplaceService.ts
- ✅ Crée un profil startup_users pour l'utilisateur
- ✅ Crée un profil user_profiles pour le tenant SaaS
- ✅ Double création pour supporter les deux contextes

## 🎨 Composants Adaptés

### startup/pages/Profile.tsx
- ✅ Utilise les nouveaux services startup
- ✅ Gère first_name/last_name séparément
- ✅ Types StartupUser au lieu de UserProfile

### startup/components/profile/PersonalInfoSection.tsx
- ✅ Champs first_name/last_name ajoutés
- ✅ Interface PersonalData mise à jour

## 🛡️ Sécurité RLS

La table `startup_users` utilise Row Level Security :
- ✅ Utilisateurs peuvent voir/modifier leur propre profil uniquement
- ✅ Pas de suppression autorisée (soft delete avec is_active)
- ✅ Insertion limitée à son propre profil

## 🔄 Rollback si Nécessaire

Si problème avec la migration :

```sql
-- Exécuter database/002_rollback_startup_users_data.sql
-- Restaure l'état initial en vidant startup_users
```

## ✅ Tests à Effectuer

1. **Authentification startup** - Vérifier que les utilisateurs peuvent se connecter
2. **Profil utilisateur** - Tester modification des informations personnelles
3. **Création marketplace** - Vérifier que les profils startup + tenant sont créés
4. **Migration des données** - Comparer les données avant/après migration

## 🎯 Points d'Attention

- **Pas de suppression automatique** des anciennes données dans user_profiles
- **Double profil** pour les admins de marketplace (startup_users + user_profiles)
- **Migration idempotente** - Peut être relancée sans problème
- **Données sauvegardées** automatiquement en cas de rollback

## 📞 Support

En cas de problème :
1. Vérifier les logs de migration dans Supabase
2. Contrôler que les fonctions RLS sont activées
3. Tester manuellement les requêtes de service
4. Utiliser le rollback si nécessaire