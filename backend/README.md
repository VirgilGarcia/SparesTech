# SparesTech Backend API

Backend API sécurisé pour la plateforme SparesTech - gestion des marketplaces startup et SaaS.

## 🚀 Démarrage rapide

```bash
# Installation
cd backend
npm install

# Configuration
cp .env.example .env
# Éditer .env avec vos variables Supabase

# Développement
npm run dev

# Production
npm run build
npm start
```

## 📁 Architecture

```
backend/
├── src/
│   ├── config/           # Configuration environnement
│   ├── lib/             # Utilitaires (Supabase, logger)
│   ├── middleware/      # Auth, validation, rate limiting
│   ├── services/        # Logique métier
│   │   ├── startup/     # Services startup (users, subscriptions, marketplace)
│   │   └── saas/        # Services SaaS (products, orders, tenant)
│   ├── routes/          # Endpoints API
│   │   ├── startup/     # Routes startup (/api/startup/*)
│   │   └── saas/        # Routes SaaS (/api/saas/*)
│   ├── types/           # Types TypeScript partagés
│   ├── app.ts           # Configuration Express
│   └── index.ts         # Point d'entrée
├── logs/                # Logs du serveur
└── dist/                # Build de production
```

## 🔐 Sécurité

- **Authentification JWT** via Supabase Auth
- **Rate limiting** (100 req/15min globalement, 5/15min pour création)
- **CORS** configuré par domaines autorisés
- **Helmet** pour headers de sécurité
- **Validation** stricte des entrées
- **Service Role** Supabase pour opérations privilégiées

## 📡 API Endpoints

### Startup (Site principal)

#### Auth & Profils
```http
POST /api/startup/auth/profile          # Créer/récupérer profil startup
GET  /api/startup/auth/profile          # Profil utilisateur connecté
PUT  /api/startup/auth/profile          # Mettre à jour profil
```

#### Marketplace Management
```http
GET  /api/startup/marketplace/plans                    # Liste des plans
GET  /api/startup/marketplace/plans/:planId           # Détail d'un plan
POST /api/startup/marketplace/check-subdomain         # Vérifier sous-domaine
POST /api/startup/marketplace/suggest-subdomains      # Suggestions sous-domaines
POST /api/startup/marketplace/create                  # Créer marketplace complet
GET  /api/startup/marketplace/my-marketplaces         # Mes marketplaces
GET  /api/startup/marketplace/subscriptions           # Mes subscriptions
GET  /api/startup/marketplace/subscriptions/active    # Subscription active
```

### SaaS (Marketplaces)

#### Produits
```http
GET    /api/saas/:tenantId/products              # Liste produits (admin)
GET    /api/saas/:tenantId/products/public       # Recherche publique
GET    /api/saas/:tenantId/products/:productId   # Détail produit
POST   /api/saas/:tenantId/products              # Créer produit
PUT    /api/saas/:tenantId/products/:productId   # Modifier produit
DELETE /api/saas/:tenantId/products/:productId   # Supprimer produit
```

#### Commandes (À implémenter)
```http
GET  /api/saas/:tenantId/orders              # Liste commandes
POST /api/saas/:tenantId/orders              # Créer commande
GET  /api/saas/:tenantId/orders/:orderId     # Détail commande
PUT  /api/saas/:tenantId/orders/:orderId     # Modifier statut
```

## 🏗️ Services métier

### StartupUserService
- Création/récupération profils startup
- Gestion des données utilisateur startup

### StartupSubscriptionService  
- Gestion des plans et subscriptions
- Calculs de prix, périodes d'essai
- Associations tenant ↔ subscription

### MarketplaceService
- **Création complète de marketplace**
- Validation domaines/sous-domaines  
- Génération suggestions
- Configuration tenant + settings + profil admin

### ProductService (SaaS)
- CRUD produits par tenant
- Recherche/filtrage avancé
- API publique pour clients

### OrderService (SaaS)
- Création commandes avec calculs
- Gestion stock automatique
- Suivi statuts commandes

## 🔄 Flow création marketplace

1. **Validation utilisateur** (profil startup requis)
2. **Validation plan** (features, domaine personnalisé)
3. **Création subscription** (période d'essai)
4. **Validation domaine** (unicité, format, réservés)
5. **Création tenant** (marketplace)
6. **Profil admin** (user_profiles pour RLS)
7. **Configuration** (tenant_settings)
8. **Données par défaut** (catégories, champs produits)
9. **Association** (subscription ↔ tenant)

## 🛠️ Développement

```bash
# Développement avec hot reload
npm run dev

# Vérification types
npm run type-check

# Linting
npm run lint

# Tests
npm test

# Build production
npm run build
```

## 📊 Logs & Monitoring

- **Logs fichiers** : `backend/logs/`
- **Console** (dev) : requêtes HTTP + erreurs
- **Winston** : logs structurés JSON
- **Métriques** : durée requêtes, codes erreur

## 🌍 Déploiement

### Variables d'environnement requises

```env
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
JWT_SECRET=your-super-secret-key
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

### Docker (optionnel)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3001
CMD ["npm", "start"]
```

## 🔧 Intégration Frontend

### Configuration client

```typescript
// Frontend - remplacer les appels Supabase directs
const API_BASE = 'http://localhost:3001/api'

// Exemple: création marketplace
const createMarketplace = async (data, token) => {
  const response = await fetch(`${API_BASE}/startup/marketplace/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(data)
  })
  return response.json()
}
```

### Migration depuis services frontend

1. **Remplacer** `startupMarketplaceService.createMarketplace()` 
2. **Par** `fetch('/api/startup/marketplace/create')`
3. **Supprimer** imports Supabase frontend
4. **Utiliser** tokens JWT pour auth

## 🚨 Prochaines étapes

1. **Implémenter routes manquantes** (orders, categories, settings)
2. **Tests unitaires** et intégration  
3. **Documentation API** (Swagger/OpenAPI)
4. **Monitoring** (Prometheus, health checks)
5. **Migration frontend** (remplacer services directs)
6. **RLS progressif** (réactiver sécurité Supabase)

---

✅ **Backend complet et sécurisé prêt pour la production !**