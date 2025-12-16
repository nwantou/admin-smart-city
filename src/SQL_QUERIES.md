# 📊 Requêtes SQL Utiles pour les Notifications

Collection de requêtes SQL pratiques pour gérer et analyser les notifications.

## 📋 Table des Matières

- [Statistiques](#-statistiques)
- [Nettoyage](#-nettoyage)
- [Monitoring](#-monitoring)
- [Debugging](#-debugging)
- [Optimisation](#-optimisation)

## 📈 Statistiques

### Compter les notifications par utilisateur

```sql
SELECT 
    u.nom,
    u.email,
    COUNT(*) as total_notifications,
    COUNT(CASE WHEN n.lu = false THEN 1 END) as non_lues
FROM notification n
JOIN utilisateur u ON n.user_id = u.id
GROUP BY u.id, u.nom, u.email
ORDER BY total_notifications DESC;
```

### Notifications par type

```sql
SELECT 
    type,
    COUNT(*) as nombre,
    COUNT(CASE WHEN lu = false THEN 1 END) as non_lues
FROM notification
GROUP BY type
ORDER BY nombre DESC;
```

### Notifications des dernières 24h

```sql
SELECT 
    COUNT(*) as total,
    COUNT(CASE WHEN lu = true THEN 1 END) as lues,
    COUNT(CASE WHEN lu = false THEN 1 END) as non_lues,
    ROUND(
        COUNT(CASE WHEN lu = true THEN 1 END)::NUMERIC / 
        COUNT(*)::NUMERIC * 100, 
        2
    ) as taux_lecture_pct
FROM notification
WHERE created_at > NOW() - INTERVAL '24 hours';
```

### Top 10 utilisateurs avec le plus de notifications non lues

```sql
SELECT 
    u.nom,
    u.email,
    u.role,
    COUNT(*) as notifications_non_lues
FROM notification n
JOIN utilisateur u ON n.user_id = u.id
WHERE n.lu = false
GROUP BY u.id, u.nom, u.email, u.role
ORDER BY notifications_non_lues DESC
LIMIT 10;
```

### Notifications par jour (7 derniers jours)

```sql
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total,
    COUNT(CASE WHEN type = 'info' THEN 1 END) as info,
    COUNT(CASE WHEN type = 'success' THEN 1 END) as success,
    COUNT(CASE WHEN type = 'warning' THEN 1 END) as warning,
    COUNT(CASE WHEN type = 'error' THEN 1 END) as error
FROM notification
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

## 🧹 Nettoyage

### Supprimer les notifications lues de plus de 30 jours

```sql
DELETE FROM notification
WHERE lu = true 
AND created_at < NOW() - INTERVAL '30 days';
```

### Supprimer toutes les notifications d'un utilisateur

```sql
DELETE FROM notification
WHERE user_id = 'UUID_UTILISATEUR';
```

### Marquer toutes les notifications comme lues pour un utilisateur

```sql
UPDATE notification
SET lu = true, updated_at = NOW()
WHERE user_id = 'UUID_UTILISATEUR'
AND lu = false;
```

### Supprimer les notifications orphelines (utilisateur supprimé)

```sql
DELETE FROM notification
WHERE NOT EXISTS (
    SELECT 1 FROM utilisateur 
    WHERE utilisateur.id = notification.user_id
);
```

### Archiver les anciennes notifications (créer une table d'archive)

```sql
-- Créer la table d'archive
CREATE TABLE notification_archive (LIKE notification INCLUDING ALL);

-- Déplacer les anciennes notifications
INSERT INTO notification_archive
SELECT * FROM notification
WHERE created_at < NOW() - INTERVAL '90 days';

-- Supprimer de la table principale
DELETE FROM notification
WHERE created_at < NOW() - INTERVAL '90 days';
```

## 📊 Monitoring

### Vérifier la santé du système de notifications

```sql
SELECT 
    'Total notifications' as metric,
    COUNT(*)::TEXT as value
FROM notification
UNION ALL
SELECT 
    'Notifications 24h',
    COUNT(*)::TEXT
FROM notification
WHERE created_at > NOW() - INTERVAL '24 hours'
UNION ALL
SELECT 
    'Taux de lecture global',
    ROUND(
        COUNT(CASE WHEN lu = true THEN 1 END)::NUMERIC / 
        COUNT(*)::NUMERIC * 100, 
        2
    )::TEXT || '%'
FROM notification
UNION ALL
SELECT 
    'Utilisateurs actifs (notifications 7j)',
    COUNT(DISTINCT user_id)::TEXT
FROM notification
WHERE created_at > NOW() - INTERVAL '7 days';
```

### Temps moyen de lecture des notifications

```sql
SELECT 
    AVG(updated_at - created_at) as temps_moyen_lecture,
    MIN(updated_at - created_at) as temps_min,
    MAX(updated_at - created_at) as temps_max
FROM notification
WHERE lu = true
AND updated_at > created_at;
```

### Notifications par heure de la journée

```sql
SELECT 
    EXTRACT(HOUR FROM created_at) as heure,
    COUNT(*) as nombre_notifications
FROM notification
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY heure
ORDER BY heure;
```

### Utilisateurs sans notifications

```sql
SELECT 
    u.nom,
    u.email,
    u.role,
    u.date_creation
FROM utilisateur u
LEFT JOIN notification n ON u.id = n.user_id
WHERE n.id IS NULL
AND u.role IN ('admin', 'agent_municipal')
ORDER BY u.date_creation DESC;
```

## 🐛 Debugging

### Dernières notifications créées

```sql
SELECT 
    n.*,
    u.nom as destinataire,
    u.email
FROM notification n
JOIN utilisateur u ON n.user_id = u.id
ORDER BY n.created_at DESC
LIMIT 20;
```

### Vérifier les politiques RLS

```sql
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'notification';
```

### Vérifier la réplication Realtime

```sql
SELECT 
    schemaname,
    tablename,
    rowfilter
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
AND tablename IN ('notification', 'problemes');
```

### Notifications d'un problème spécifique

```sql
-- Si vous avez un lien vers le problème dans la notification
SELECT 
    n.*,
    u.nom as destinataire
FROM notification n
JOIN utilisateur u ON n.user_id = u.id
WHERE n.message LIKE '%#PROBLEM_ID%'
ORDER BY n.created_at DESC;
```

### Notifications non lues depuis plus de 7 jours

```sql
SELECT 
    n.*,
    u.nom,
    u.email,
    NOW() - n.created_at as age
FROM notification n
JOIN utilisateur u ON n.user_id = u.id
WHERE n.lu = false
AND n.created_at < NOW() - INTERVAL '7 days'
ORDER BY n.created_at ASC;
```

## ⚡ Optimisation

### Créer des index pour améliorer les performances

```sql
-- Index composite pour les requêtes fréquentes
CREATE INDEX IF NOT EXISTS idx_notification_user_lu_created 
ON notification(user_id, lu, created_at DESC);

-- Index pour le comptage des non-lus
CREATE INDEX IF NOT EXISTS idx_notification_unread 
ON notification(user_id, lu) 
WHERE lu = false;

-- Index pour les recherches par type
CREATE INDEX IF NOT EXISTS idx_notification_type 
ON notification(type);

-- Index pour les requêtes temporelles
CREATE INDEX IF NOT EXISTS idx_notification_created_at 
ON notification(created_at DESC);
```

### Analyser les performances des index

```sql
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan as scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes
WHERE tablename = 'notification'
ORDER BY idx_scan DESC;
```

### Statistiques de la table

```sql
SELECT 
    schemaname,
    tablename,
    n_tup_ins as inserts,
    n_tup_upd as updates,
    n_tup_del as deletes,
    n_live_tup as live_tuples,
    n_dead_tup as dead_tuples,
    last_vacuum,
    last_autovacuum
FROM pg_stat_user_tables
WHERE tablename = 'notification';
```

### Vacuum et Analyze

```sql
-- Nettoyer et analyser la table
VACUUM ANALYZE notification;

-- Vacuum complet (plus lourd)
VACUUM FULL notification;
```

## 🔧 Maintenance

### Réinitialiser les compteurs de notifications

```sql
-- Marquer toutes comme lues
UPDATE notification SET lu = true, updated_at = NOW();
```

### Créer une notification de test

```sql
INSERT INTO notification (user_id, titre, message, type, lu)
VALUES (
    'UUID_UTILISATEUR',
    'Test notification',
    'Ceci est une notification de test',
    'info',
    false
);
```

### Dupliquer une notification vers plusieurs utilisateurs

```sql
INSERT INTO notification (user_id, titre, message, type, lu)
SELECT 
    u.id,
    'Notification importante',
    'Message important pour tous les admins',
    'warning',
    false
FROM utilisateur u
WHERE u.role = 'admin';
```

### Mettre à jour les timestamps

```sql
-- Forcer la mise à jour de updated_at pour toutes les notifications
UPDATE notification 
SET updated_at = NOW()
WHERE updated_at IS NULL;
```

## 📝 Triggers Utiles

### Trigger pour auto-nettoyer les anciennes notifications

```sql
CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM notification
    WHERE lu = true 
    AND created_at < NOW() - INTERVAL '60 days';
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger (s'exécute après chaque insertion)
CREATE TRIGGER trigger_cleanup_notifications
AFTER INSERT ON notification
FOR EACH STATEMENT
EXECUTE FUNCTION cleanup_old_notifications();
```

### Trigger pour logger les suppressions

```sql
-- Table de log
CREATE TABLE notification_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    notification_id UUID,
    user_id UUID,
    action TEXT,
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fonction de log
CREATE OR REPLACE FUNCTION log_notification_deletion()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO notification_log (notification_id, user_id, action)
    VALUES (OLD.id, OLD.user_id, 'deleted');
    
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger
CREATE TRIGGER trigger_log_notification_deletion
BEFORE DELETE ON notification
FOR EACH ROW
EXECUTE FUNCTION log_notification_deletion();
```

## 🔐 Sécurité

### Vérifier les permissions d'un utilisateur

```sql
-- En tant qu'utilisateur connecté
SELECT * FROM notification WHERE user_id = auth.uid();
```

### Auditer les accès aux notifications

```sql
-- Créer une table d'audit
CREATE TABLE notification_audit (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    notification_id UUID,
    user_id UUID,
    action TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 💡 Requêtes Avancées

### Notifications groupées par semaine

```sql
SELECT 
    DATE_TRUNC('week', created_at) as semaine,
    COUNT(*) as total,
    COUNT(CASE WHEN lu = true THEN 1 END) as lues,
    ROUND(
        COUNT(CASE WHEN lu = true THEN 1 END)::NUMERIC / 
        COUNT(*)::NUMERIC * 100, 
        2
    ) as taux_lecture_pct
FROM notification
WHERE created_at > NOW() - INTERVAL '3 months'
GROUP BY semaine
ORDER BY semaine DESC;
```

### Trouver les utilisateurs les plus actifs

```sql
SELECT 
    u.nom,
    u.email,
    u.role,
    COUNT(n.id) as notifications_recues,
    COUNT(CASE WHEN n.lu = true THEN 1 END) as notifications_lues,
    ROUND(
        COUNT(CASE WHEN n.lu = true THEN 1 END)::NUMERIC / 
        NULLIF(COUNT(n.id), 0)::NUMERIC * 100, 
        2
    ) as taux_lecture_pct,
    AVG(EXTRACT(EPOCH FROM (n.updated_at - n.created_at))) / 60 as temps_moyen_lecture_minutes
FROM utilisateur u
LEFT JOIN notification n ON u.id = n.user_id
WHERE n.created_at > NOW() - INTERVAL '30 days'
GROUP BY u.id, u.nom, u.email, u.role
HAVING COUNT(n.id) > 0
ORDER BY notifications_recues DESC;
```

---

## 🎯 Tips et Bonnes Pratiques

1. **Indexation** : Toujours créer des index sur `user_id`, `lu`, et `created_at`
2. **Nettoyage** : Automatiser le nettoyage des anciennes notifications
3. **Monitoring** : Surveiller le nombre de notifications par utilisateur
4. **Performance** : Limiter les résultats avec `LIMIT` dans les requêtes fréquentes
5. **Archivage** : Archiver les anciennes données plutôt que de les supprimer

---

**Note:** Testez toutes les requêtes sur un environnement de développement avant de les exécuter en production !
