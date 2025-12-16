# 🧪 Guide de Test des Notifications en Temps Réel

Ce guide vous aide à tester et vérifier le bon fonctionnement du système de notifications en temps réel.

## 📋 Checklist de Test

- [ ] Connexion et authentification
- [ ] Réception des notifications en temps réel
- [ ] Badge de compteur de notifications
- [ ] Marquer comme lu
- [ ] Supprimer une notification
- [ ] Notifications navigateur
- [ ] Notifications multi-utilisateurs
- [ ] Filtrage par rôle

## 🔍 Tests Fonctionnels

### Test 1 : Notification de Changement de Statut

**Objectif :** Vérifier qu'un changement de statut génère une notification

**Étapes :**
1. Connectez-vous avec un compte **admin**
2. Ouvrez le centre de notifications (icône 🔔)
3. Notez le nombre de notifications non lues
4. Ouvrez un problème et changez son statut (ex: "Nouveau" → "En cours")
5. Cliquez sur "Enregistrer"

**Résultat attendu :**
- ✅ Une nouvelle notification apparaît instantanément
- ✅ Le badge du compteur augmente de 1
- ✅ La notification contient le bon message
- ✅ Le type de notification est "info" (ou "success" si résolu)

**Vérification dans la console :**
```javascript
// Devrait afficher :
// "Nouvelle notification reçue: { new: {...} }"
```

---

### Test 2 : Notification d'Assignation

**Objectif :** Vérifier qu'une assignation génère une notification pour l'agent concerné

**Configuration :**
- Compte 1 : Admin
- Compte 2 : Agent municipal d'un département

**Étapes :**
1. Connectez-vous avec le compte **Admin**
2. Assignez un problème à un agent ou à un département
3. Dans une autre fenêtre/navigateur, connectez-vous avec le compte **Agent**
4. Observez le centre de notifications de l'agent

**Résultat attendu :**
- ✅ L'agent reçoit une notification d'assignation
- ✅ La notification apparaît en temps réel (sans rechargement)
- ✅ Le message indique le type de problème et le département

---

### Test 3 : Notification de Priorité

**Objectif :** Vérifier qu'un changement de priorité génère les bonnes notifications

**Étapes :**
1. Créez ou sélectionnez un problème
2. Changez sa priorité vers "urgent"
3. Vérifiez les notifications des utilisateurs concernés

**Résultat attendu :**
- ✅ Notification de type "warning" pour priorité urgente
- ✅ Notification de type "info" pour priorité normale
- ✅ Admins et agents du département sont notifiés

---

### Test 4 : Badge et Compteur

**Objectif :** Vérifier que le compteur de notifications fonctionne correctement

**Étapes :**
1. Notez le nombre actuel de notifications non lues
2. Créez 3 nouvelles notifications (changez 3 statuts différents)
3. Observez le badge

**Résultat attendu :**
- ✅ Le compteur augmente à chaque nouvelle notification
- ✅ Le badge affiche le bon nombre (max 99+)
- ✅ Le badge disparaît quand il n'y a plus de notifications non lues

---

### Test 5 : Marquer comme Lu

**Objectif :** Vérifier la fonctionnalité "marquer comme lu"

**Étapes :**
1. Ouvrez le centre de notifications
2. Cliquez sur "Marquer comme lu" sur une notification non lue
3. Observez les changements

**Résultat attendu :**
- ✅ La notification change de style (fond blanc au lieu de coloré)
- ✅ Le compteur diminue de 1
- ✅ Le texte de la notification reste visible

**Test "Tout marquer comme lu" :**
1. Cliquez sur "Tout marquer comme lu"
2. Toutes les notifications deviennent lues
3. Le compteur tombe à 0

---

### Test 6 : Suppression de Notification

**Objectif :** Vérifier qu'on peut supprimer une notification

**Étapes :**
1. Ouvrez le centre de notifications
2. Cliquez sur l'icône ❌ d'une notification
3. Observez le comportement

**Résultat attendu :**
- ✅ La notification disparaît de la liste
- ✅ Le compteur diminue (si elle était non lue)
- ✅ Pas d'erreur dans la console

---

### Test 7 : Notifications Navigateur

**Objectif :** Vérifier les notifications système du navigateur

**Étapes :**
1. Autorisez les notifications dans votre navigateur
2. Minimisez ou changez d'onglet
3. Générez une nouvelle notification (changez un statut)

**Résultat attendu :**
- ✅ Une notification système apparaît (Windows/Mac/Linux)
- ✅ La notification contient le titre et le message
- ✅ Cliquer sur la notification ramène à l'application

**Si les notifications sont bloquées :**
- Chrome : chrome://settings/content/notifications
- Firefox : about:preferences#privacy → Notifications
- Safari : Préférences → Sites web → Notifications

---

### Test 8 : Multi-Utilisateurs Temps Réel

**Objectif :** Vérifier que plusieurs utilisateurs reçoivent les notifications simultanément

**Configuration :**
- Ouvrez 2-3 navigateurs/fenêtres avec des comptes différents
- Admin, Agent1, Agent2

**Étapes :**
1. Avec Admin : Changez le statut d'un problème
2. Observez les autres fenêtres

**Résultat attendu :**
- ✅ Tous les utilisateurs concernés reçoivent la notification
- ✅ Les notifications apparaissent en moins de 2 secondes
- ✅ Chaque utilisateur ne voit que ses propres notifications

---

### Test 9 : Filtrage par Rôle

**Objectif :** Vérifier que les notifications respectent les rôles

**Scénario 1 - Admin :**
- Doit recevoir : Toutes les notifications importantes
- Doit recevoir : Changements de statut, assignations, priorités

**Scénario 2 - Agent Municipal :**
- Doit recevoir : Notifications de son département uniquement
- Doit recevoir : Assignations qui le concernent
- NE doit PAS recevoir : Notifications d'autres départements

**Étapes de test :**
1. Créez un problème pour Département A
2. Assignez-le à Département A
3. Vérifiez que seuls Admin et Agent de Dép. A sont notifiés

---

### Test 10 : Performance et Charge

**Objectif :** Tester le système avec beaucoup de notifications

**Étapes :**
1. Créez 20+ notifications rapidement
2. Observez la réactivité de l'interface
3. Scrollez dans la liste des notifications

**Résultat attendu :**
- ✅ L'interface reste fluide
- ✅ Toutes les notifications sont reçues
- ✅ Pas de ralentissement notable
- ✅ Le compteur est correct (99+ si > 99)

---

## 🔧 Tests Techniques

### Test API - Création Manuelle de Notification

```bash
# Endpoint : /make-server-cf7452f1/notifications
curl -X POST \
  'https://VOTRE_PROJECT_ID.supabase.co/functions/v1/make-server-cf7452f1/notifications' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer VOTRE_ANON_KEY' \
  -d '{
    "user_id": "UUID_UTILISATEUR",
    "titre": "Test notification",
    "message": "Ceci est un test",
    "type": "info"
  }'
```

**Résultat attendu :**
```json
{
  "success": true,
  "notification": { ... }
}
```

---

### Test API - Notification de Changement

```bash
curl -X POST \
  'https://VOTRE_PROJECT_ID.supabase.co/functions/v1/make-server-cf7452f1/notify-problem-change' \
  -H 'Content-Type: application/json' \
  -H 'Authorization: Bearer VOTRE_ANON_KEY' \
  -d '{
    "problem_id": "UUID_PROBLEME",
    "change_type": "status_changed",
    "changed_by_id": "UUID_UTILISATEUR"
  }'
```

**Résultat attendu :**
```json
{
  "success": true,
  "notifications_created": 3,
  "users_notified": 3
}
```

---

### Test Supabase Realtime

**Console du navigateur (F12) :**

```javascript
// Vérifier les connexions Realtime
supabase
  .channel('test')
  .on('presence', { event: 'sync' }, () => {
    console.log('Connected to Realtime');
  })
  .subscribe();
```

---

### Test SQL - Vérifier les Notifications

```sql
-- Voir toutes les notifications d'un utilisateur
SELECT * FROM notification 
WHERE user_id = 'UUID_UTILISATEUR' 
ORDER BY created_at DESC;

-- Compter les notifications non lues
SELECT COUNT(*) FROM notification 
WHERE user_id = 'UUID_UTILISATEUR' 
AND lu = false;

-- Vérifier la réplication Realtime
SELECT * FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime';
```

---

## 📊 Métriques de Performance

### Temps de Réponse Acceptables

| Action | Temps Max | Optimal |
|--------|-----------|---------|
| Réception notification | 2s | < 500ms |
| Marquer comme lu | 1s | < 300ms |
| Supprimer | 1s | < 300ms |
| Charger la liste | 2s | < 1s |

### Indicateurs de Santé

- ✅ Taux de livraison : > 99%
- ✅ Latence Realtime : < 500ms
- ✅ Taux d'erreur : < 1%

---

## 🐛 Problèmes Courants et Solutions

### Problème : Notifications non reçues

**Diagnostic :**
```javascript
// Console navigateur
console.log('User ID:', user.id);
console.log('Supabase connected:', supabase);

// Vérifier les subscriptions
supabase.getChannels().forEach(channel => {
  console.log('Channel:', channel.topic, 'State:', channel.state);
});
```

**Solutions :**
1. Vérifier que Realtime est activé dans Supabase
2. Vérifier les politiques RLS
3. Vérifier la connexion réseau
4. Recharger la page (Ctrl+Shift+R)

---

### Problème : Compteur incorrect

**Solution :**
```sql
-- Recalculer le nombre de non-lus
SELECT COUNT(*) FROM notification 
WHERE user_id = 'UUID' 
AND lu = false;
```

---

### Problème : Notifications dupliquées

**Cause possible :** Double subscription aux channels

**Solution :**
```javascript
// Assurer la désabonnement lors du démontage
useEffect(() => {
  const channel = supabase.channel('notifications');
  // ... setup
  
  return () => {
    supabase.removeChannel(channel);
  };
}, []);
```

---

## ✅ Checklist de Validation Finale

Avant de considérer le système comme prêt pour la production :

- [ ] Tous les tests fonctionnels passent
- [ ] Les performances sont acceptables
- [ ] Les notifications navigateur fonctionnent
- [ ] Le filtrage par rôle est correct
- [ ] Aucune erreur dans la console
- [ ] Les Edge Functions sont déployées
- [ ] Les politiques RLS sont configurées
- [ ] Realtime est activé pour les bonnes tables
- [ ] Les secrets sont configurés
- [ ] La documentation est à jour

---

## 📞 Support

Si un test échoue :
1. Consultez les logs : `supabase functions logs server`
2. Vérifiez la console navigateur (F12)
3. Consultez [SUPABASE_SETUP.md](./SUPABASE_SETUP.md)
4. Vérifiez les politiques RLS dans Supabase Dashboard

---

**Bon testing ! 🎉**
