# Configuration Supabase pour les Notifications en Temps Réel

Ce guide détaille la configuration nécessaire dans Supabase pour activer les notifications en temps réel.

## 1. Structure de la Table Notification

### Schéma de la table `notification`

```sql
CREATE TABLE notification (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES utilisateur(id) ON DELETE CASCADE,
  titre TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  lu BOOLEAN DEFAULT FALSE,
  lien TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour améliorer les performances
CREATE INDEX idx_notification_user_id ON notification(user_id);
CREATE INDEX idx_notification_lu ON notification(lu);
CREATE INDEX idx_notification_created_at ON notification(created_at DESC);
```

## 2. Politiques RLS (Row Level Security)

### Activer RLS sur la table notification

```sql
ALTER TABLE notification ENABLE ROW LEVEL SECURITY;
```

### Politique de lecture (SELECT)

Les utilisateurs peuvent lire uniquement leurs propres notifications :

```sql
CREATE POLICY "Users can view their own notifications"
ON notification
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);
```

### Politique de mise à jour (UPDATE)

Les utilisateurs peuvent marquer leurs propres notifications comme lues :

```sql
CREATE POLICY "Users can update their own notifications"
ON notification
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

### Politique de suppression (DELETE)

Les utilisateurs peuvent supprimer leurs propres notifications :

```sql
CREATE POLICY "Users can delete their own notifications"
ON notification
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
```

### Politique d'insertion (INSERT)

Seuls les admins et le service peuvent créer des notifications :

```sql
CREATE POLICY "Service role can insert notifications"
ON notification
FOR INSERT
TO service_role
WITH CHECK (true);

-- Optionnel : permettre aux admins de créer des notifications
CREATE POLICY "Admins can insert notifications"
ON notification
FOR INSERT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM utilisateur
    WHERE id = auth.uid()
    AND role = 'admin'
  )
)
WITH CHECK (true);
```

## 3. Activer Supabase Realtime

### Via l'interface Supabase (Méthode recommandée)

1. Allez dans votre projet Supabase
2. Naviguez vers **Database** > **Replication**
3. Trouvez la table `notification` dans la liste
4. Cliquez sur le bouton à côté de la table pour activer la réplication
5. Répétez pour la table `problemes`

### Via SQL (Alternative)

```sql
-- Activer la réplication pour la table notification
ALTER PUBLICATION supabase_realtime ADD TABLE notification;

-- Activer la réplication pour la table problemes
ALTER PUBLICATION supabase_realtime ADD TABLE problemes;
```

## 4. Fonction de Nettoyage Automatique

Créer une fonction pour supprimer les anciennes notifications (optionnel) :

```sql
-- Fonction pour supprimer les notifications de plus de 30 jours
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notification
  WHERE created_at < NOW() - INTERVAL '30 days'
  AND lu = TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Créer un job cron pour exécuter cette fonction chaque jour
-- (Nécessite l'extension pg_cron - disponible uniquement sur les plans payants)
SELECT cron.schedule(
  'cleanup-old-notifications',
  '0 2 * * *', -- Tous les jours à 2h du matin
  'SELECT cleanup_old_notifications();'
);
```

## 5. Trigger pour Updated_at

Créer un trigger pour mettre à jour automatiquement `updated_at` :

```sql
-- Fonction trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Appliquer le trigger à la table notification
CREATE TRIGGER update_notification_updated_at
BEFORE UPDATE ON notification
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

## 6. Vérifier la Configuration

### Tester les permissions RLS

```sql
-- Se connecter en tant qu'utilisateur normal (pas service_role)
-- et vérifier que l'on peut lire seulement ses notifications
SELECT * FROM notification WHERE user_id = auth.uid();

-- Vérifier qu'on ne peut pas lire les notifications d'autres utilisateurs
SELECT * FROM notification WHERE user_id != auth.uid(); -- Devrait retourner 0 résultats
```

### Tester Realtime

Dans la console Supabase SQL Editor, insérez une notification de test :

```sql
INSERT INTO notification (user_id, titre, message, type)
VALUES (
  '<un-user-id-existant>',
  'Test notification',
  'Ceci est un test',
  'info'
);
```

Vérifiez que la notification apparaît en temps réel dans votre application.

## 7. Configurer les Politiques pour la Table Problemes

### Politiques de lecture

```sql
-- Les admins peuvent tout voir
CREATE POLICY "Admins can view all problems"
ON problemes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM utilisateur
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Les agents peuvent voir les problèmes de leur département
CREATE POLICY "Agents can view their department problems"
ON problemes
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM utilisateur
    WHERE id = auth.uid()
    AND role = 'agent_municipal'
    AND id_departement = problemes.id_departement
  )
);

-- Les agents peuvent voir les problèmes qui leur sont assignés
CREATE POLICY "Agents can view assigned problems"
ON problemes
FOR SELECT
TO authenticated
USING (id_utilisateur_affecte = auth.uid());
```

### Politiques de mise à jour

```sql
-- Les admins peuvent tout modifier
CREATE POLICY "Admins can update all problems"
ON problemes
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM utilisateur
    WHERE id = auth.uid()
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM utilisateur
    WHERE id = auth.uid()
    AND role = 'admin'
  )
);

-- Les agents peuvent modifier les problèmes de leur département
CREATE POLICY "Agents can update their department problems"
ON problemes
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM utilisateur
    WHERE id = auth.uid()
    AND role = 'agent_municipal'
    AND id_departement = problemes.id_departement
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM utilisateur
    WHERE id = auth.uid()
    AND role = 'agent_municipal'
    AND id_departement = problemes.id_departement
  )
);
```

## 8. Variables d'Environnement pour Edge Functions

Assurez-vous que ces secrets sont configurés :

```bash
supabase secrets set SUPABASE_URL=https://votre-project-id.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=votre-service-role-key
supabase secrets set SUPABASE_ANON_KEY=votre-anon-key
```

## 9. Monitoring et Logs

### Activer les logs Realtime

Dans Supabase Dashboard :
1. Allez dans **Settings** > **API**
2. Sous "Realtime", vérifiez que le service est actif
3. Consultez les logs dans **Logs** > **Realtime Logs**

### Vérifier les Channels actifs

```sql
SELECT * FROM pg_stat_activity
WHERE application_name LIKE '%realtime%';
```

## 10. Optimisations de Performance

### Index supplémentaires

```sql
-- Index composite pour les requêtes fréquentes
CREATE INDEX idx_notification_user_lu_created
ON notification(user_id, lu, created_at DESC);

-- Index pour le comptage des non-lus
CREATE INDEX idx_notification_unread
ON notification(user_id, lu) WHERE lu = FALSE;
```

### Limiter les événements Realtime

Pour éviter une surcharge, vous pouvez filtrer les événements Realtime côté client :

```typescript
// Dans votre code, spécifiez les événements à écouter
supabase
  .channel('notifications_changes')
  .on(
    'postgres_changes',
    {
      event: 'INSERT', // Écouter uniquement les insertions
      schema: 'public',
      table: 'notification',
      filter: `user_id=eq.${userId}`,
    },
    handleNewNotification
  )
  .subscribe();
```

## Dépannage

### Les notifications ne s'affichent pas en temps réel

1. Vérifiez que Realtime est activé :
   ```sql
   SELECT schemaname, tablename, rowfilter
   FROM pg_publication_tables
   WHERE pubname = 'supabase_realtime';
   ```

2. Vérifiez les politiques RLS :
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'notification';
   ```

3. Vérifiez que l'utilisateur est authentifié et a le bon user_id

### Erreurs de permission

Si vous obtenez des erreurs "new row violates row-level security policy" :

1. Vérifiez que les politiques INSERT permettent l'opération
2. Vérifiez que vous utilisez la bonne clé API (service_role pour les insertions côté serveur)
3. Vérifiez les logs dans Supabase Dashboard

---

Cette configuration permet un système de notifications robuste et sécurisé avec mises à jour en temps réel.
