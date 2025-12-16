import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './utils/supabase/info';
import { Toaster } from 'sonner';
import { LoginPage } from './components/LoginPage';
import { AdminDashboard } from './components/AdminDashboard';

// Créer le client Supabase
const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// Application principale de gestion urbaine
export default function App() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Vérifier la session existante
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Écouter les changements d'authentification
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('utilisateur')
        .select('*, departement(*)')
        .eq('id', userId)
        .single();

      if (error) throw error;

      // Vérifier que l'utilisateur a le rôle admin ou agent_municipal
      if (data.role !== 'admin' && data.role !== 'agent_municipal') {
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
      } else {
        setUser(data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du profil utilisateur:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setUser(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />
      {!session || !user ? (
        <LoginPage supabase={supabase} />
      ) : (
        <AdminDashboard supabase={supabase} user={user} onSignOut={handleSignOut} />
      )}
    </>
  );
}