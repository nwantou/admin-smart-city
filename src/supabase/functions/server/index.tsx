import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';

const app = new Hono();

// Middleware
app.use('*', cors());
app.use('*', logger(console.log));

// Créer le client Supabase avec la clé service role
const getSupabaseAdmin = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );
};

// Route d'inscription pour les administrateurs
app.post('/make-server-cf7452f1/signup', async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, nom, role, id_departement } = body;

    // Validation
    if (!email || !password) {
      return c.json({ error: 'Email et mot de passe requis' }, 400);
    }

    if (!role || !['admin', 'agent_municipal'].includes(role)) {
      return c.json({ error: 'Rôle invalide. Doit être admin ou agent_municipal' }, 400);
    }

    const supabase = getSupabaseAdmin();

    // Créer l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirmer l'email car pas de serveur email configuré
      user_metadata: { nom, role }
    });

    if (authError) {
      console.error('Erreur création auth user:', authError);
      return c.json({ error: `Erreur lors de la création de l'utilisateur: ${authError.message}` }, 400);
    }

    // Créer l'utilisateur dans la table utilisateur
    const { data: userData, error: userError } = await supabase
      .from('utilisateur')
      .insert({
        id: authData.user.id,
        email,
        password: 'hashed', // On ne stocke pas le vrai password, c'est géré par Supabase Auth
        nom: nom || email,
        role,
        id_departement: id_departement || null,
        date_creation: new Date().toISOString()
      })
      .select()
      .single();

    if (userError) {
      console.error('Erreur création utilisateur table:', userError);
      // Supprimer l'utilisateur auth si échec
      await supabase.auth.admin.deleteUser(authData.user.id);
      return c.json({ error: `Erreur lors de la création du profil: ${userError.message}` }, 400);
    }

    return c.json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        nom: userData.nom,
        role: userData.role
      }
    });

  } catch (error: any) {
    console.error('Erreur signup:', error);
    return c.json({ error: `Erreur serveur: ${error.message}` }, 500);
  }
});

// Route pour obtenir les départements (pour l'inscription)
app.get('/make-server-cf7452f1/departments', async (c) => {
  try {
    const supabase = getSupabaseAdmin();
    
    const { data, error } = await supabase
      .from('departement')
      .select('*')
      .order('nom');

    if (error) {
      console.error('Erreur récupération départements:', error);
      return c.json({ error: error.message }, 400);
    }

    return c.json({ departments: data });
  } catch (error: any) {
    console.error('Erreur departments:', error);
    return c.json({ error: error.message }, 500);
  }
});

// Route pour vérifier la santé du serveur
app.get('/make-server-cf7452f1/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Route pour créer une notification
app.post('/make-server-cf7452f1/notifications', async (c) => {
  try {
    const body = await c.req.json();
    const { user_id, titre, message, type, lien } = body;

    // Validation
    if (!user_id || !titre || !message) {
      return c.json({ error: 'user_id, titre et message sont requis' }, 400);
    }

    if (!['info', 'success', 'warning', 'error'].includes(type || 'info')) {
      return c.json({ error: 'Type de notification invalide' }, 400);
    }

    const supabase = getSupabaseAdmin();

    // Créer la notification
    const { data, error } = await supabase
      .from('notification')
      .insert({
        user_id,
        titre,
        message,
        type: type || 'info',
        lien: lien || null,
        lu: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur création notification:', error);
      return c.json({ error: `Erreur lors de la création de la notification: ${error.message}` }, 400);
    }

    return c.json({ success: true, notification: data });
  } catch (error: any) {
    console.error('Erreur création notification:', error);
    return c.json({ error: `Erreur serveur: ${error.message}` }, 500);
  }
});

// Route pour notifier les changements de statut d'un problème
app.post('/make-server-cf7452f1/notify-problem-change', async (c) => {
  try {
    const body = await c.req.json();
    const { problem_id, change_type, changed_by_id } = body;

    if (!problem_id || !change_type) {
      return c.json({ error: 'problem_id et change_type sont requis' }, 400);
    }

    const supabase = getSupabaseAdmin();

    // Récupérer les informations du problème
    const { data: problem, error: problemError } = await supabase
      .from('problemes')
      .select('*, statut_pb(*), departement(*), categorie_pb(*)')
      .eq('id', problem_id)
      .single();

    if (problemError || !problem) {
      console.error('Erreur récupération problème:', problemError);
      return c.json({ error: 'Problème non trouvé' }, 404);
    }

    // Déterminer qui doit être notifié
    let usersToNotify: string[] = [];
    let titre = '';
    let message = '';
    let type: 'info' | 'success' | 'warning' | 'error' = 'info';

    switch (change_type) {
      case 'status_changed':
        titre = 'Changement de statut';
        message = `Le problème #${problem_id} a changé de statut vers "${problem.statut_pb?.nom || 'Inconnu'}"`;
        type = problem.statut_pb?.nom === 'Résolu' ? 'success' : 'info';
        
        // Notifier tous les admins et les agents du département concerné
        const { data: admins } = await supabase
          .from('utilisateur')
          .select('id')
          .eq('role', 'admin');
        
        if (admins) {
          usersToNotify = admins.map((a: any) => a.id);
        }
        
        if (problem.id_departement) {
          const { data: agents } = await supabase
            .from('utilisateur')
            .select('id')
            .eq('id_departement', problem.id_departement)
            .eq('role', 'agent_municipal');
          
          if (agents) {
            usersToNotify = [...usersToNotify, ...agents.map((a: any) => a.id)];
          }
        }
        break;

      case 'assigned':
        titre = 'Nouveau problème assigné';
        message = `Un nouveau problème (#${problem_id}) de type "${problem.categorie_pb?.nom || 'Inconnu'}" a été assigné au département ${problem.departement?.nom || 'Inconnu'}`;
        type = 'info';
        
        // Notifier les agents du département assigné
        if (problem.id_departement) {
          const { data: agents } = await supabase
            .from('utilisateur')
            .select('id')
            .eq('id_departement', problem.id_departement);
          
          if (agents) {
            usersToNotify = agents.map((a: any) => a.id);
          }
        }
        break;

      case 'priority_changed':
        titre = 'Priorité modifiée';
        message = `La priorité du problème #${problem_id} a été modifiée vers "${problem.priorite}"`;
        type = problem.priorite === 'urgent' ? 'warning' : 'info';
        
        // Notifier les admins et agents du département
        const { data: allUsers } = await supabase
          .from('utilisateur')
          .select('id')
          .or(`role.eq.admin,id_departement.eq.${problem.id_departement}`);
        
        if (allUsers) {
          usersToNotify = allUsers.map((u: any) => u.id);
        }
        break;

      default:
        return c.json({ error: 'Type de changement non reconnu' }, 400);
    }

    // Filtrer l'utilisateur qui a fait le changement pour ne pas se notifier soi-même
    if (changed_by_id) {
      usersToNotify = usersToNotify.filter((id) => id !== changed_by_id);
    }

    // Supprimer les doublons
    usersToNotify = [...new Set(usersToNotify)];

    // Créer les notifications
    const notifications = usersToNotify.map((user_id) => ({
      user_id,
      titre,
      message,
      type,
      lu: false,
      created_at: new Date().toISOString()
    }));

    if (notifications.length > 0) {
      const { error: notifError } = await supabase
        .from('notification')
        .insert(notifications);

      if (notifError) {
        console.error('Erreur création notifications:', notifError);
        return c.json({ error: `Erreur lors de la création des notifications: ${notifError.message}` }, 400);
      }
    }

    return c.json({ 
      success: true, 
      notifications_created: notifications.length,
      users_notified: usersToNotify.length 
    });
  } catch (error: any) {
    console.error('Erreur notification changement problème:', error);
    return c.json({ error: `Erreur serveur: ${error.message}` }, 500);
  }
});

Deno.serve(app.fetch);