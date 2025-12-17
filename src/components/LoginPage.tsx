import { useState } from 'react';
import { Lock, Mail, AlertCircle, UserPlus } from 'lucide-react';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface LoginPageProps {
  supabase: any;
}

export function LoginPage({ supabase }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSignup, setShowSignup] = useState(false);

  // États pour l'inscription
  const [signupData, setSignupData] = useState({
    email: '',
    password: '',
    nom: '',
    role: 'admin' as 'admin' | 'agent_municipal',
  });
  const [signupLoading, setSignupLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password 
      });

      if (error) throw error;

      toast.success('Connexion réussie !');
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      setError(error.message || 'Identifiants incorrects');
      toast.error('Identifiants incorrects. Créez d\'abord un compte administrateur.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-cf7452f1/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`,
          },
          body: JSON.stringify(signupData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de l\'inscription');
      }

      toast.success('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
      setShowSignup(false);
      setEmail(signupData.email);
      setPassword('');
      setSignupData({ email: '', password: '', nom: '', role: 'admin' });
    } catch (error: any) {
      console.error('Erreur inscription:', error);
      setError(error.message);
      toast.error(error.message);
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              {showSignup ? <UserPlus className="w-8 h-8 text-white" /> : <Lock className="w-8 h-8 text-white" />}
            </div>
            <h1 className="text-gray-900 mb-2">
              {showSignup ? 'Créer un compte' : 'Portail Administrateur'}
            </h1>
            <p className="text-gray-600">Gestion des signalements urbains</p>
          </div>

          {!showSignup ? (
            // Formulaire de connexion
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="admin@ville.fr"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-gray-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>
          ) : (
            // Formulaire d'inscription
            <form onSubmit={handleSignup} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-800">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="signup-nom" className="block text-gray-700 mb-2">
                  Nom complet
                </label>
                <input
                  id="signup-nom"
                  type="text"
                  value={signupData.nom}
                  onChange={(e) => setSignupData({ ...signupData, nom: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Jean Dupont"
                />
              </div>

              <div>
                <label htmlFor="signup-email" className="block text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="signup-email"
                    type="email"
                    value={signupData.email}
                    onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="admin@ville.fr"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="signup-password" className="block text-gray-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="signup-password"
                    type="password"
                    value={signupData.password}
                    onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                    required
                    minLength={6}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="••••••••"
                  />
                </div>
                <p className="text-gray-600 mt-1">Minimum 6 caractères</p>
              </div>

              <div>
                <label htmlFor="signup-role" className="block text-gray-700 mb-2">
                  Rôle
                </label>
                <select
                  id="signup-role"
                  value={signupData.role}
                  onChange={(e) => setSignupData({ ...signupData, role: e.target.value as 'admin' | 'agent_municipal' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="admin">Administrateur</option>
                  <option value="agent_municipal">Agent Municipal</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={signupLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {signupLoading ? 'Création...' : 'Créer le compte'}
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            /*
            <button
              onClick={() => {
                setShowSignup(!showSignup);
                setError('');
              }}
              className="w-full text-blue-600 hover:text-blue-700 transition-colors"
            >
              {showSignup ? '← Retour à la connexion' : 'Créer un compte administrateur'}
            </button>
            */
            <p className="text-gray-600 text-center mt-3">
              Accès réservé aux administrateurs municipaux
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
