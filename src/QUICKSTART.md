# 🚀 Guide de Démarrage Rapide

Guide express pour déployer votre application de gestion urbaine avec notifications en temps réel.

## ⚡ Déploiement Rapide (5 minutes)

### 1. Préparer Supabase

```bash
# 1. Créez un compte sur https://supabase.com
# 2. Créez un nouveau projet
# 3. Notez votre URL et vos clés API
```

### 2. Configurer Realtime

Dans Supabase Dashboard :
- **Database** → **Replication** 
- Activez pour : `notification` et `problemes`

### 3. Configurer les Politiques RLS

Copiez-collez dans SQL Editor (Supabase) :

```sql
-- Activer RLS
ALTER TABLE notification ENABLE ROW LEVEL SECURITY;

-- Lecture
CREATE POLICY "Users view own notifications" ON notification
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- Mise à jour
CREATE POLICY "Users update own notifications" ON notification
FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Suppression
CREATE POLICY "Users delete own notifications" ON notification
FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Insertion (service uniquement)
CREATE POLICY "Service inserts notifications" ON notification
FOR INSERT TO service_role WITH CHECK (true);
```

### 4. Déployer sur Vercel

```bash
# Installer Vercel CLI
npm i -g vercel

# Se connecter
vercel login

# Déployer
vercel --prod
```

**Lors du déploiement, ajoutez ces variables d'environnement :**

| Variable | Valeur |
|----------|--------|
| `VITE_SUPABASE_URL` | Votre URL Supabase |
| `VITE_SUPABASE_ANON_KEY` | Votre clé publique |

### 5. Déployer les Edge Functions

```bash
# Installer Supabase CLI
npm i -g supabase

# Se connecter
supabase login

# Lier le projet
supabase link --project-ref VOTRE_PROJECT_ID

# Configurer les secrets
supabase secrets set SUPABASE_URL=https://VOTRE_PROJECT_ID.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=VOTRE_SERVICE_ROLE_KEY
supabase secrets set SUPABASE_ANON_KEY=VOTRE_ANON_KEY

# Déployer
supabase functions deploy server
```

## ✅ Vérification

### Tester les notifications

1. Ouvrez votre application déployée
2. Connectez-vous avec un compte admin
3. Modifiez le statut d'un problème
4. Vérifiez que la notification apparaît en temps réel

### Activer les notifications navigateur

Lorsque l'application demande la permission, cliquez sur **Autoriser**.

## 🔧 Configuration Avancée

Pour une configuration détaillée, consultez :
- [DEPLOY.md](./DEPLOY.md) - Guide de déploiement complet
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Configuration Supabase détaillée

## 📊 Structure de la Table Notification

```sql
CREATE TABLE notification (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES utilisateur(id),
  titre TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('info', 'success', 'warning', 'error')),
  lu BOOLEAN DEFAULT FALSE,
  lien TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_notification_user_id ON notification(user_id);
CREATE INDEX idx_notification_lu ON notification(lu);
CREATE INDEX idx_notification_created_at ON notification(created_at DESC);
```

## 🎯 Fonctionnalités des Notifications

### Types de notifications automatiques

1. **Changement de statut** (`status_changed`)
   - Notifie les admins et agents du département
   - Type : `success` si résolu, sinon `info`

2. **Nouvelle assignation** (`assigned`)
   - Notifie les agents du département assigné
   - Type : `info`

3. **Changement de priorité** (`priority_changed`)
   - Notifie les admins et agents concernés
   - Type : `warning` si urgent, sinon `info`

### Notifications en temps réel

- ✅ Mise à jour instantanée sans rechargement
- ✅ Compteur de notifications non lues
- ✅ Badge visuel sur l'icône de notification
- ✅ Notifications navigateur (si autorisées)
- ✅ Tri par date (plus récent en premier)

## 🔐 Sécurité

- Les utilisateurs voient uniquement leurs propres notifications
- Les Edge Functions utilisent la `service_role` key pour créer des notifications
- RLS (Row Level Security) activé sur toutes les tables
- Les clés sensibles sont stockées comme secrets côté serveur

## 📱 Compatibilité

- ✅ Desktop (Chrome, Firefox, Safari, Edge)
- ✅ Mobile responsive
- ✅ Notifications navigateur (nécessite HTTPS)
- ✅ Sidebar rétractable sur desktop
- ✅ Menu hamburger sur mobile

## 🐛 Dépannage Rapide

### Les notifications ne s'affichent pas

```bash
# Vérifier que Realtime est actif
psql -h YOUR_DB_HOST -U postgres -d postgres -c "SELECT * FROM pg_publication_tables WHERE pubname = 'supabase_realtime';"
```

### Erreurs d'authentification

- Vérifiez que les variables d'environnement sont correctes dans Vercel
- Vérifiez que les politiques RLS sont bien configurées
- Consultez les logs : `supabase functions logs server`

### Notifications navigateur bloquées

- Vérifiez les paramètres de notification du navigateur
- Le site doit être en HTTPS (Vercel le fait automatiquement)
- Testez dans une fenêtre de navigation privée

## 📞 Support

Pour plus d'informations :
- 📖 [Documentation Supabase](https://supabase.com/docs)
- 📖 [Documentation Vercel](https://vercel.com/docs)
- 💬 Console du navigateur (F12) pour voir les logs

---

**Prochaines étapes recommandées :**
1. Personnaliser les types de notifications
2. Ajouter des filtres dans le centre de notifications
3. Configurer le nettoyage automatique des anciennes notifications
4. Ajouter des sons pour les notifications importantes

Bon déploiement ! 🎉
