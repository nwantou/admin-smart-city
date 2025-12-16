# ❓ Foire Aux Questions (FAQ)

Questions fréquemment posées sur le système de notifications en temps réel.

## 📋 Table des Matières

- [Général](#-général)
- [Installation et Configuration](#-installation-et-configuration)
- [Notifications en Temps Réel](#-notifications-en-temps-réel)
- [Déploiement](#-déploiement)
- [Dépannage](#-dépannage)
- [Performance](#-performance)
- [Sécurité](#-sécurité)

---

## 🌟 Général

### Q: Qu'est-ce que ce système de gestion urbaine ?

**R:** C'est une application web complète pour les administrateurs municipaux permettant de gérer les signalements urbains (nids-de-poule, éclairage défectueux, etc.) avec un système de notifications en temps réel pour suivre l'état des problèmes.

### Q: Quelles sont les principales fonctionnalités ?

**R:** 
- 📊 Tableau de bord centralisé
- 🗺️ Carte interactive des signalements
- 👥 Assignation automatique/manuelle
- 🔔 **Notifications en temps réel** (NOUVEAU)
- 📈 Analytics et rapports
- 🔐 Authentification sécurisée avec gestion des rôles

### Q: Quels sont les différents rôles utilisateurs ?

**R:**
- **Admin** : Accès complet, peut tout voir et modifier
- **Agent Municipal** : Peut gérer les problèmes de son département
- **Client** : Utilisateur final (non autorisé dans cette interface admin)

### Q: Est-ce que l'application est gratuite ?

**R:** L'application elle-même est open-source, mais vous devez avoir :
- Un compte Supabase (gratuit jusqu'à certaines limites)
- Un compte Vercel pour l'hébergement (gratuit pour les projets hobby)

---

## ⚙️ Installation et Configuration

### Q: Quels sont les prérequis pour installer l'application ?

**R:**
- Node.js 18+ et npm
- Un compte Supabase
- Un compte Vercel (pour le déploiement)
- Git

### Q: Comment obtenir mes clés API Supabase ?

**R:** 
1. Connectez-vous à [Supabase](https://supabase.com)
2. Sélectionnez votre projet
3. Allez dans **Settings** > **API**
4. Copiez :
   - `Project URL` → `SUPABASE_URL`
   - `anon public` key → `SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **Important :** Ne partagez JAMAIS votre `service_role` key publiquement !

### Q: Comment créer la base de données ?

**R:** Suivez le guide [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) qui contient tous les scripts SQL nécessaires pour :
- Créer les tables
- Configurer les politiques RLS
- Activer Realtime
- Créer les index

### Q: Pourquoi mes variables d'environnement ne fonctionnent pas ?

**R:** Vérifiez que :
1. Le fichier `.env` est à la racine du projet
2. Les variables commencent par `VITE_` (requis par Vite)
3. Vous avez redémarré le serveur de développement après modification
4. Dans Vercel, les variables sont ajoutées dans **Settings** > **Environment Variables**

---

## 🔔 Notifications en Temps Réel

### Q: Comment fonctionnent les notifications en temps réel ?

**R:** Le système utilise **Supabase Realtime** qui s'appuie sur PostgreSQL et WebSocket :
1. Un changement est effectué (ex: statut modifié)
2. L'API backend crée une notification dans la table `notification`
3. Supabase Realtime détecte l'insertion
4. Le frontend (connecté via WebSocket) reçoit la notification instantanément
5. L'interface se met à jour automatiquement

### Q: Quels types de notifications existent ?

**R:** 4 types avec des couleurs distinctes :
- **Info** (🔵 Bleu) : Changements généraux
- **Success** (🟢 Vert) : Actions réussies (ex: problème résolu)
- **Warning** (🟡 Jaune) : Alertes importantes (ex: priorité urgente)
- **Error** (🔴 Rouge) : Erreurs ou problèmes critiques

### Q: Qui reçoit les notifications ?

**R:** Cela dépend du type d'événement :

| Événement | Destinataires |
|-----------|---------------|
| Changement de statut | Admins + Agents du département |
| Nouvelle assignation | Agents du département assigné |
| Changement de priorité | Admins + Agents concernés |

### Q: Puis-je personnaliser les notifications ?

**R:** Oui ! Vous pouvez :
- Modifier les messages dans `/supabase/functions/server/index.tsx`
- Ajouter de nouveaux types de notifications
- Personnaliser les règles de distribution
- Créer vos propres endpoints

### Q: Les notifications persistent-elles après fermeture du navigateur ?

**R:** Oui ! Les notifications sont stockées dans la base de données et restent disponibles même après fermeture/réouverture de l'application.

### Q: Comment activer les notifications navigateur ?

**R:** 
1. L'application demandera automatiquement la permission au premier chargement
2. Cliquez sur **Autoriser** dans la popup du navigateur
3. Si vous avez refusé, allez dans les paramètres de votre navigateur :
   - Chrome : `chrome://settings/content/notifications`
   - Firefox : `about:preferences#privacy` → Notifications
   - Safari : Préférences → Sites web → Notifications

### Q: Puis-je désactiver les notifications navigateur ?

**R:** Oui, bloquez les notifications dans les paramètres de votre navigateur. Les notifications dans l'application continueront de fonctionner.

---

## 🚀 Déploiement

### Q: Où puis-je héberger l'application ?

**R:** Nous recommandons :
- **Frontend** : Vercel (guide complet dans [DEPLOY.md](./DEPLOY.md))
- **Backend** : Supabase Edge Functions
- **Base de données** : Supabase PostgreSQL

Autres options possibles : Netlify, Railway, Render

### Q: Combien coûte le déploiement ?

**R:**
- **Vercel** : Gratuit pour hobby (bande passante limitée)
- **Supabase** : Gratuit jusqu'à 500 Mo de base de données et 2 Go de bande passante

Pour une utilisation en production, envisagez les plans payants.

### Q: Comment déployer sur Vercel ?

**R:** Guide rapide :
```bash
npm i -g vercel
vercel login
vercel --prod
```

Consultez [QUICKSTART.md](./QUICKSTART.md) pour un guide détaillé.

### Q: Mes Edge Functions ne se déploient pas

**R:** Vérifiez que :
1. Supabase CLI est installé : `npm i -g supabase`
2. Vous êtes connecté : `supabase login`
3. Le projet est lié : `supabase link --project-ref VOTRE_ID`
4. Les secrets sont configurés : `supabase secrets list`

### Q: Comment mettre à jour l'application après modification ?

**R:**
- **Frontend** : `git push` suffit, Vercel redéploie automatiquement
- **Edge Functions** : `supabase functions deploy server`

---

## 🐛 Dépannage

### Q: Les notifications ne s'affichent pas en temps réel

**R:** Checklist de diagnostic :

1. **Vérifier Supabase Realtime**
   ```sql
   SELECT * FROM pg_publication_tables 
   WHERE pubname = 'supabase_realtime' 
   AND tablename = 'notification';
   ```
   Si vide, activez Realtime : Database → Replication

2. **Vérifier les politiques RLS**
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'notification';
   ```

3. **Vérifier la console navigateur (F12)**
   - Cherchez des erreurs WebSocket
   - Vérifiez les logs de connexion

4. **Vérifier les Edge Functions**
   ```bash
   supabase functions logs server
   ```

### Q: Erreur "new row violates row-level security policy"

**R:** Vos politiques RLS sont trop restrictives. Pour les notifications :
```sql
-- Permettre au service_role d'insérer
CREATE POLICY "Service inserts notifications" 
ON notification FOR INSERT 
TO service_role 
WITH CHECK (true);
```

### Q: Le compteur de notifications est incorrect

**R:** Essayez de recharger les notifications :
```javascript
// Dans la console navigateur (F12)
window.location.reload();
```

Ou vérifiez dans la base :
```sql
SELECT COUNT(*) FROM notification 
WHERE user_id = 'VOTRE_UUID' AND lu = false;
```

### Q: Erreur "Failed to fetch" lors de l'envoi de notification

**R:** Vérifiez :
1. Les Edge Functions sont déployées
2. Les URLs sont correctes (projectId)
3. L'anon key est valide
4. CORS est activé dans les Edge Functions

### Q: Les notifications navigateur ne fonctionnent pas

**R:** Vérifications :
1. Le site est en HTTPS (requis pour Web Push API)
2. Les permissions sont accordées
3. Le navigateur supporte les notifications
4. Testez en navigation privée pour éliminer les extensions

---

## ⚡ Performance

### Q: L'application est lente avec beaucoup de notifications

**R:** Optimisations recommandées :

1. **Nettoyer les anciennes notifications**
   ```sql
   DELETE FROM notification 
   WHERE lu = true 
   AND created_at < NOW() - INTERVAL '30 days';
   ```

2. **Limiter le nombre affiché**
   ```typescript
   .limit(50) // Dans la requête Supabase
   ```

3. **Ajouter la pagination**
   ```typescript
   .range(0, 49) // Page 1
   .range(50, 99) // Page 2
   ```

### Q: Trop de notifications WebSocket

**R:** Filtrez côté client :
```typescript
supabase
  .channel('notifications')
  .on('postgres_changes', {
    event: 'INSERT', // Écouter uniquement les insertions
    schema: 'public',
    table: 'notification',
    filter: `user_id=eq.${userId}`,
  }, handleNotification)
  .subscribe();
```

### Q: Comment réduire la consommation de bande passante ?

**R:**
1. Utilisez des index sur la table notification
2. Limitez les résultats avec `.limit()`
3. Utilisez `.select('id, titre, message, type, lu, created_at')` au lieu de `*`
4. Activez la compression dans Vercel (automatique)

---

## 🔐 Sécurité

### Q: Les notifications sont-elles sécurisées ?

**R:** Oui, plusieurs niveaux de sécurité :
- **RLS (Row Level Security)** : Les utilisateurs ne voient que leurs notifications
- **JWT Tokens** : Authentification via Supabase Auth
- **HTTPS** : Chiffrement de bout en bout (Vercel)
- **Service Role** : Isolée du frontend

### Q: Un utilisateur peut-il voir les notifications des autres ?

**R:** Non ! Les politiques RLS empêchent cela :
```sql
USING (auth.uid() = user_id)
```
Un utilisateur ne peut voir QUE ses propres notifications.

### Q: Comment protéger ma service_role key ?

**R:**
1. ❌ Ne la commitez JAMAIS dans Git
2. ✅ Utilisez des secrets Supabase : `supabase secrets set`
3. ✅ Ne l'utilisez QUE dans les Edge Functions
4. ❌ Ne l'exposez JAMAIS au frontend

### Q: Les Edge Functions sont-elles sécurisées ?

**R:** Oui :
- Exécutées côté serveur (Deno runtime isolé)
- Variables d'environnement protégées
- CORS configuré correctement
- Rate limiting automatique

### Q: Puis-je auditer les accès aux notifications ?

**R:** Oui, créez une table d'audit :
```sql
CREATE TABLE notification_audit (
  id UUID PRIMARY KEY,
  notification_id UUID,
  user_id UUID,
  action TEXT,
  created_at TIMESTAMP
);
```

Et ajoutez un trigger pour logger les actions.

---

## 💡 Conseils et Astuces

### Q: Comment tester les notifications en local ?

**R:** Utilisez le fichier `test-notifications.html` inclus :
1. Ouvrez-le dans un navigateur
2. Entrez vos credentials Supabase
3. Créez des notifications de test

### Q: Comment débugger les notifications ?

**R:** Utilisez la console navigateur (F12) :
```javascript
// Voir toutes les notifications
console.table(notifications);

// Voir les channels actifs
supabase.getChannels().forEach(c => console.log(c));

// Tester la connexion Realtime
supabase.channel('test').subscribe(console.log);
```

### Q: Bonnes pratiques pour les notifications ?

**R:**
1. ✅ Soyez concis dans les messages
2. ✅ Utilisez le bon type (info/success/warning/error)
3. ✅ Nettoyez les anciennes notifications
4. ✅ Ne spammez pas les utilisateurs
5. ✅ Groupez les notifications similaires

### Q: Comment créer une notification personnalisée ?

**R:**
```typescript
await fetch(`${API_URL}/notifications`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${anonKey}`,
  },
  body: JSON.stringify({
    user_id: userId,
    titre: 'Mon titre',
    message: 'Mon message',
    type: 'info',
  }),
});
```

---

## 📞 Besoin d'Aide ?

### Q: Où trouver plus d'informations ?

**R:** Documentation disponible :
- [README.md](./README.md) - Vue d'ensemble
- [QUICKSTART.md](./QUICKSTART.md) - Démarrage rapide
- [DEPLOY.md](./DEPLOY.md) - Guide de déploiement
- [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) - Configuration Supabase
- [TESTING_NOTIFICATIONS.md](./TESTING_NOTIFICATIONS.md) - Guide de test
- [SQL_QUERIES.md](./SQL_QUERIES.md) - Requêtes SQL utiles

### Q: J'ai trouvé un bug, que faire ?

**R:**
1. Vérifiez la console navigateur (F12)
2. Consultez les logs : `supabase functions logs server`
3. Vérifiez la FAQ (ce document)
4. Ouvrez une issue sur GitHub avec :
   - Description du problème
   - Étapes pour reproduire
   - Logs d'erreur
   - Version du navigateur

### Q: Je veux contribuer, comment faire ?

**R:**
1. Fork le projet
2. Créez une branche : `git checkout -b feature/ma-fonctionnalite`
3. Committez : `git commit -m 'Ajout de ma fonctionnalité'`
4. Push : `git push origin feature/ma-fonctionnalite`
5. Ouvrez une Pull Request

---

**Dernière mise à jour:** 15 décembre 2024

**Cette FAQ n'a pas répondu à votre question ?** Ouvrez une issue sur GitHub !
