# 🏙️ Application de Gestion des Signalements Urbains

Application Next.js moderne avec intégration Supabase pour la gestion des signalements urbains destinée aux administrateurs municipaux, avec notifications en temps réel.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 📋 Table des Matières

- [Fonctionnalités](#-fonctionnalités)
- [Technologies](#-technologies)
- [Démarrage Rapide](#-démarrage-rapide)
- [Installation](#-installation)
- [Déploiement](#-déploiement)
- [Structure du Projet](#-structure-du-projet)
- [Configuration](#-configuration)
- [Documentation](#-documentation)

## ✨ Fonctionnalités

### Gestion des Signalements
- 📊 Tableau de bord centralisé avec tous les signalements
- 🗺️ Visualisation sur carte interactive
- 🏷️ Catégorisation et filtrage avancés
- 📍 Géolocalisation précise des problèmes
- 🖼️ Support des images pour chaque signalement

### Assignation et Workflow
- 👥 Assignation automatique ou manuelle aux départements
- 🎯 Priorisation selon la gravité et l'impact
- 📝 Modification des statuts avec commentaires
- ⏱️ Suivi des temps de résolution

### Notifications en Temps Réel ⚡ (NOUVEAU)
- 🔔 Notifications instantanées sans rechargement
- 💬 Alertes pour les changements de statut
- 👤 Notifications d'assignation personnalisées
- 🔴 Badge avec compteur de non-lus
- 🌐 Support des notifications navigateur
- 📱 Centre de notifications dédié

### Analytics et Rapports
- 📈 Statistiques sur les types de problèmes
- 🗺️ Analyse des zones affectées
- ⏳ Mesure des temps de résolution par département
- 📊 Graphiques et visualisations interactifs

### Sécurité et Authentification
- 🔐 Authentification sécurisée avec Supabase
- 👨‍💼 Gestion des rôles RBAC (client, admin, agent_municipal)
- 🛡️ Row Level Security (RLS)
- 🔑 Tokens JWT sécurisés

### Interface Utilisateur
- 🎨 Design moderne et responsive
- 📱 Sidebar rétractable sur desktop
- 🍔 Menu hamburger sur mobile
- 🌓 Interface claire et intuitive
- ⚡ Transitions fluides

## 🛠️ Technologies

### Frontend
- **React** - Bibliothèque UI
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS
- **Vite** - Build tool
- **Lucide React** - Icônes
- **Recharts** - Graphiques
- **Sonner** - Notifications toast

### Backend
- **Supabase** - Base de données PostgreSQL
- **Supabase Auth** - Authentification
- **Supabase Realtime** - Notifications en temps réel
- **Supabase Edge Functions** - API serverless
- **Hono** - Web framework pour Edge Functions

### Déploiement
- **Vercel** - Hébergement frontend
- **Supabase Cloud** - Backend et base de données

## 🚀 Démarrage Rapide

### Prérequis

- Node.js 18+ et npm
- Un compte [Supabase](https://supabase.com)
- Un compte [Vercel](https://vercel.com) (pour le déploiement)

### Installation Locale

```bash
# Cloner le repository
git clone <votre-repo>
cd gestion-urbaine

# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env

# Éditer .env avec vos vraies clés Supabase
nano .env

# Lancer le serveur de développement
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 📦 Installation

### 1. Configuration Supabase

Créez les tables nécessaires dans votre projet Supabase :

```sql
-- Voir SUPABASE_SETUP.md pour le schéma complet
```

### 2. Activer Realtime

Dans Supabase Dashboard :
1. Database → Replication
2. Activer pour : `notification` et `problemes`

### 3. Configurer les Variables d'Environnement

```bash
# Fichier .env
VITE_SUPABASE_URL=https://votre-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=votre-anon-key
```

### 4. Déployer les Edge Functions

```bash
# Installer Supabase CLI
npm install -g supabase

# Se connecter et lier le projet
supabase login
supabase link --project-ref VOTRE_PROJECT_ID

# Configurer les secrets
supabase secrets set SUPABASE_URL=https://votre-project-id.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key
supabase secrets set SUPABASE_ANON_KEY=votre-anon-key

# Déployer
supabase functions deploy server
```

## 🌐 Déploiement

### Déploiement sur Vercel

```bash
# Installer Vercel CLI
npm install -g vercel

# Se connecter
vercel login

# Déployer
vercel --prod
```

**N'oubliez pas d'ajouter les variables d'environnement dans Vercel !**

Pour un guide complet, consultez [DEPLOY.md](./DEPLOY.md)

### Démarrage Ultra-Rapide

Pour un déploiement en 5 minutes, suivez [QUICKSTART.md](./QUICKSTART.md)

## 📁 Structure du Projet

```
├── components/
│   ├── AdminDashboard.tsx      # Dashboard principal avec sidebar
│   ├── DashboardOverview.tsx   # Vue d'ensemble
│   ├── LoginPage.tsx           # Page de connexion
│   ├── NotificationCenter.tsx  # Centre de notifications (NOUVEAU)
│   ├── ProblemDetailsModal.tsx # Détails d'un signalement
│   ├── ProblemsList.tsx        # Liste des signalements
│   ├── ProblemsMap.tsx         # Carte interactive
│   ├── ReportsAnalytics.tsx    # Analytics et rapports
│   └── ui/                     # Composants UI réutilisables
├── supabase/
│   └── functions/
│       └── server/
│           ├── index.tsx       # Edge Functions API
│           └── kv_store.tsx    # Utilitaires KV store
├── utils/
│   └── supabase/
│       └── info.tsx            # Configuration Supabase
├── styles/
│   └── globals.css             # Styles globaux
├── App.tsx                     # Point d'entrée de l'app
├── vercel.json                 # Configuration Vercel
├── .env.example                # Template des variables d'env
└── README.md                   # Ce fichier
```

## ⚙️ Configuration

### Tables Supabase Requises

- `utilisateur` - Utilisateurs et agents
- `problemes` - Signalements urbains
- `categorie_pb` - Catégories de problèmes
- `statut_pb` - Statuts des problèmes
- `departement` - Départements municipaux
- `media_url` - URLs des médias
- `notification` - Notifications en temps réel (NOUVEAU)

### Rôles Utilisateurs

1. **admin** - Accès complet, peut tout voir et modifier
2. **agent_municipal** - Peut gérer les problèmes de son département
3. **client** - Utilisateur final (non autorisé dans cette interface)

## 📚 Documentation

- [QUICKSTART.md](./QUICKSTART.md) - Guide de démarrage en 5 minutes
- [DEPLOY.md](./DEPLOY.md) - Guide de déploiement complet
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Configuration Supabase détaillée

## 🔔 Notifications en Temps Réel

### Types de Notifications Automatiques

| Type | Déclencheur | Destinataires |
|------|------------|---------------|
| **status_changed** | Changement de statut | Admins + Agents du département |
| **assigned** | Nouvelle assignation | Agents du département assigné |
| **priority_changed** | Modification de priorité | Admins + Agents concernés |

### Fonctionnalités du Centre de Notifications

- ✅ Notifications en temps réel via Supabase Realtime
- ✅ Badge avec compteur de non-lus
- ✅ Marquer comme lu / Tout marquer comme lu
- ✅ Supprimer individuellement
- ✅ Types visuels (info, success, warning, error)
- ✅ Timestamps intelligents ("Il y a 5 min")
- ✅ Notifications navigateur (si autorisées)

## 🔧 Scripts Disponibles

```bash
# Développement
npm run dev          # Démarrer le serveur de développement

# Build
npm run build        # Créer un build de production
npm run preview      # Prévisualiser le build

# Supabase
supabase functions serve  # Tester les Edge Functions localement
supabase functions deploy # Déployer les Edge Functions

# Vercel
vercel dev           # Tester localement avec Vercel
vercel --prod        # Déployer en production
```

## 🐛 Dépannage

### Les notifications ne s'affichent pas

1. Vérifiez que Realtime est activé dans Supabase
2. Consultez la console navigateur (F12) pour les erreurs
3. Vérifiez les politiques RLS sur la table `notification`
4. Testez avec `supabase functions logs server`

### Erreurs d'authentification

1. Vérifiez vos variables d'environnement
2. Vérifiez que les politiques RLS sont correctes
3. Assurez-vous que l'utilisateur a le bon rôle

### Problèmes de build

1. Supprimez `node_modules` et réinstallez : `rm -rf node_modules && npm install`
2. Videz le cache : `npm cache clean --force`
3. Vérifiez la version de Node : `node --version` (doit être 18+)

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Fork le projet
2. Créez une branche (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 👥 Auteurs

- Votre équipe de développement

## 🙏 Remerciements

- [Supabase](https://supabase.com) pour l'infrastructure backend
- [Vercel](https://vercel.com) pour l'hébergement
- [Tailwind CSS](https://tailwindcss.com) pour le framework CSS
- [Lucide](https://lucide.dev) pour les icônes

## 📞 Support

Pour toute question ou problème :
- 📧 Email : support@votre-domaine.com
- 💬 Ouvrir une issue sur GitHub
- 📖 Consulter la [documentation](./DEPLOY.md)

---

Développé avec ❤️ pour améliorer la gestion urbaine

**Version:** 1.0.0 avec Notifications en Temps Réel  
**Dernière mise à jour:** Décembre 2024
