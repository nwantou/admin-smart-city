# Guide de Déploiement sur Vercel

Ce guide vous explique comment déployer votre application de gestion urbaine sur Vercel avec intégration Supabase.

## Prérequis

- Un compte [Vercel](https://vercel.com)
- Un compte [Supabase](https://supabase.com) avec un projet configuré
- Git installé sur votre machine
- Un dépôt Git (GitHub, GitLab ou Bitbucket)

## Étape 1 : Préparer votre projet Supabase

### 1.1 Configurer les tables dans Supabase

Assurez-vous que votre base de données Supabase contient les tables suivantes :

- `utilisateur`
- `problemes`
- `categorie_pb`
- `statut_pb`
- `departement`
- `media_url`
- `notification`

### 1.2 Activer Supabase Realtime

1. Allez dans votre projet Supabase
2. Naviguez vers **Database** > **Replication**
3. Activez la réplication pour les tables `notification` et `problemes`
4. Cliquez sur **Enable** pour chaque table

### 1.3 Récupérer vos clés API

Dans votre projet Supabase, allez dans **Settings** > **API** et notez :
- `Project URL` (SUPABASE_URL)
- `anon public` key (SUPABASE_ANON_KEY)
- `service_role` key (SUPABASE_SERVICE_ROLE_KEY)

## Étape 2 : Préparer votre dépôt Git

### 2.1 Initialiser un dépôt Git (si ce n'est pas déjà fait)

```bash
git init
git add .
git commit -m "Initial commit - Application de gestion urbaine"
```

### 2.2 Créer un dépôt distant

Créez un nouveau dépôt sur GitHub, GitLab ou Bitbucket, puis :

```bash
git remote add origin <votre-url-repo>
git branch -M main
git push -u origin main
```

### 2.3 Créer un fichier vercel.json

Créez un fichier `vercel.json` à la racine de votre projet :

```json
{
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "devCommand": "npm run dev"
}
```

### 2.4 Créer un fichier .env.example

Créez un fichier `.env.example` pour documenter les variables d'environnement :

```
VITE_SUPABASE_URL=votre_supabase_url
VITE_SUPABASE_ANON_KEY=votre_supabase_anon_key
```

**Important :** Ne commitez JAMAIS votre fichier `.env` avec les vraies valeurs !

## Étape 3 : Déployer sur Vercel

### 3.1 Créer un nouveau projet sur Vercel

1. Allez sur [Vercel](https://vercel.com)
2. Cliquez sur **Add New** > **Project**
3. Importez votre dépôt Git
4. Sélectionnez votre projet

### 3.2 Configurer le projet

1. **Framework Preset:** Sélectionnez "Vite" ou "Other"
2. **Root Directory:** Laissez vide (`.`)
3. **Build Command:** `npm run build` ou `vite build`
4. **Output Directory:** `dist`
5. **Install Command:** `npm install`

### 3.3 Ajouter les variables d'environnement

Dans la section **Environment Variables**, ajoutez :

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | Votre URL Supabase |
| `VITE_SUPABASE_ANON_KEY` | Votre clé publique Supabase |

**Note :** Ces variables doivent correspondre à celles utilisées dans `/utils/supabase/info.tsx`

### 3.4 Déployer

Cliquez sur **Deploy** et attendez que le build se termine.

## Étape 4 : Déployer les Edge Functions Supabase

### 4.1 Installer Supabase CLI

```bash
npm install -g supabase
```

### 4.2 Vous connecter à Supabase

```bash
supabase login
```

### 4.3 Lier votre projet

```bash
supabase link --project-ref <votre-project-id>
```

### 4.4 Déployer les fonctions

```bash
supabase functions deploy server
```

### 4.5 Configurer les secrets pour les Edge Functions

```bash
supabase secrets set SUPABASE_URL=<votre-url>
supabase secrets set SUPABASE_ANON_KEY=<votre-anon-key>
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<votre-service-role-key>
```

## Étape 5 : Configuration post-déploiement

### 5.1 Vérifier le déploiement

1. Visitez l'URL fournie par Vercel
2. Testez la connexion
3. Vérifiez que les notifications en temps réel fonctionnent

### 5.2 Configurer le domaine personnalisé (Optionnel)

1. Dans votre projet Vercel, allez dans **Settings** > **Domains**
2. Ajoutez votre domaine personnalisé
3. Suivez les instructions pour configurer vos DNS

### 5.3 Activer les notifications navigateur

Assurez-vous que votre site est servi en HTTPS (Vercel le fait automatiquement) pour que les notifications navigateur fonctionnent.

## Étape 6 : Tester les notifications en temps réel

### 6.1 Créer un compte test

1. Utilisez la page d'inscription pour créer un compte admin
2. Créez également un compte agent_municipal

### 6.2 Tester les notifications

1. Connectez-vous avec le compte admin
2. Modifiez le statut d'un problème
3. Vérifiez que les notifications apparaissent en temps réel dans le centre de notifications

### 6.3 Vérifier les permissions navigateur

Si les notifications ne s'affichent pas :
1. Vérifiez que vous avez autorisé les notifications dans votre navigateur
2. Ouvrez la console (F12) et cherchez d'éventuelles erreurs
3. Vérifiez que Supabase Realtime est activé pour les tables concernées

## Dépannage

### Les notifications ne fonctionnent pas

1. Vérifiez que Realtime est activé dans Supabase pour les tables `notification` et `problemes`
2. Vérifiez les logs des Edge Functions : `supabase functions logs server`
3. Vérifiez que les clés API sont correctement configurées

### Erreur de build sur Vercel

1. Vérifiez que toutes les dépendances sont dans `package.json`
2. Vérifiez que les variables d'environnement sont correctement définies
3. Consultez les logs de build dans Vercel

### Problèmes d'authentification

1. Vérifiez que SUPABASE_URL et SUPABASE_ANON_KEY sont corrects
2. Vérifiez que les politiques RLS (Row Level Security) sont correctement configurées dans Supabase
3. Vérifiez les logs dans la console navigateur

## Commandes utiles

```bash
# Déployer manuellement depuis Vercel CLI
vercel --prod

# Voir les logs des Edge Functions
supabase functions logs server --project-ref <project-id>

# Redéployer une Edge Function
supabase functions deploy server

# Lister les secrets configurés
supabase secrets list
```

## Ressources

- [Documentation Vercel](https://vercel.com/docs)
- [Documentation Supabase](https://supabase.com/docs)
- [Documentation Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [Documentation Supabase Edge Functions](https://supabase.com/docs/guides/functions)

## Support

Pour toute question ou problème :
1. Consultez les logs dans Vercel et Supabase
2. Vérifiez la console du navigateur (F12)
3. Consultez la documentation officielle

---

Bonne chance avec votre déploiement ! 🚀
