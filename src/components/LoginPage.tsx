import { useState } from 'react';
import { Lock, Mail, AlertCircle, MapPin, Search } from 'lucide-react';

interface LoginPageProps {
  supabase: any;
}

export default function LoginPage({ supabase }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password 
      });

      if (error) throw error;

      // Success handled by parent component
    } catch (error: any) {
      console.error('Erreur de connexion:', error);
      setError(error.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleLogin();
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'row',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      {/* Left Panel - Branding & Info */}
      <div style={{
        width: '50%',
        background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
        padding: '4rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '24rem',
          height: '24rem',
          background: '#60a5fa',
          borderRadius: '50%',
          opacity: 0.2,
          marginRight: '-12rem',
          marginTop: '-12rem'
        }}></div>
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '16rem',
          height: '16rem',
          background: '#1d4ed8',
          borderRadius: '50%',
          opacity: 0.2,
          marginLeft: '-8rem',
          marginBottom: '-8rem'
        }}></div>
        
        <div style={{ 
          position: 'relative', 
          zIndex: 10, 
          maxWidth: '32rem', 
          margin: '0 auto' 
        }}>
          {/* Logo */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            marginBottom: '3rem' 
          }}>
            <div style={{
              width: '3.5rem',
              height: '3.5rem',
              background: 'white',
              borderRadius: '0.75rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
            }}>
              <MapPin style={{ width: '2rem', height: '2rem', color: '#2563eb' }} />
            </div>
            <span style={{ 
              fontSize: '1.875rem', 
              fontWeight: 'bold', 
              color: 'white' 
            }}>UrbanFix</span>
          </div>
          
          {/* Titre */}
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            color: 'white', 
            marginBottom: '1.5rem', 
            lineHeight: '1.2' 
          }}>
            Gérez vos signalements urbains efficacement
          </h1>
          
          {/* Paragraphe explicatif */}
          <div style={{ marginBottom: '3rem' }}>
            <p style={{ 
              color: 'white', 
              fontSize: '1.125rem', 
              lineHeight: '1.75', 
              marginBottom: '1rem' 
            }}>
              Bienvenue sur votre plateforme de gestion des signalements urbains. 
              Votre Outil de gestion des signalements urbains.
            </p>
          </div>

          {/* Illustration */}
          <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
            <div style={{ position: 'relative' }}>
              {/* Folder illustration */}
              <div style={{
                width: '14rem',
                height: '10rem',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(10px)',
                borderRadius: '1rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                transform: 'rotate(-3deg)',
                position: 'relative',
                overflow: 'hidden',
                border: '1px solid rgba(255, 255, 255, 0.3)'
              }}>
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '2.5rem',
                  background: 'rgba(255, 255, 255, 0.3)'
                }}></div>
                <div style={{
                  position: 'absolute',
                  top: '3rem',
                  left: '1.5rem',
                  right: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem'
                }}>
                  <div style={{
                    background: 'white',
                    borderRadius: '0.5rem',
                    padding: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '1.5rem', height: '1.5rem', background: '#60a5fa', borderRadius: '0.25rem' }}></div>
                      <div style={{ flex: 1, height: '0.5rem', background: '#e5e7eb', borderRadius: '0.25rem' }}></div>
                    </div>
                  </div>
                  <div style={{
                    background: 'white',
                    borderRadius: '0.5rem',
                    padding: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: '1.5rem', height: '1.5rem', background: '#4ade80', borderRadius: '0.25rem' }}></div>
                      <div style={{ flex: 1, height: '0.5rem', background: '#e5e7eb', borderRadius: '0.25rem' }}></div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Magnifying glass */}
              <div style={{
                position: 'absolute',
                bottom: '-0.75rem',
                right: '-0.75rem',
                width: '5rem',
                height: '5rem',
                background: 'linear-gradient(135deg, #fbbf24 0%, #fb923c 100%)',
                borderRadius: '50%',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transform: 'rotate(12deg)'
              }}>
                <Search style={{ width: '2.5rem', height: '2.5rem', color: 'white' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div style={{
        width: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '4rem',
        background: '#f9fafb'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '28rem',
          background: 'white',
          borderRadius: '1.5rem',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          padding: '2.5rem'
        }}>
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ 
              fontSize: '1.875rem', 
              fontWeight: 'bold', 
              color: '#111827', 
              marginBottom: '0.5rem' 
            }}>Connexion</h2>
            <p style={{ color: '#6b7280' }}>Connectez-vous pour accéder à votre tableau de bord</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {error && (
              <div style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '0.75rem',
                padding: '1rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.75rem'
              }}>
                <AlertCircle style={{ width: '1.25rem', height: '1.25rem', color: '#dc2626', flexShrink: 0, marginTop: '0.125rem' }} />
                <p style={{ fontSize: '0.875rem', color: '#991b1b' }}>{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: 600, 
                color: '#374151', 
                marginBottom: '0.5rem' 
              }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  outline: 'none',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
                placeholder="admin@ville.fr"
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <div>
              <label htmlFor="password" style={{ 
                display: 'block', 
                fontSize: '0.875rem', 
                fontWeight: 600, 
                color: '#374151', 
                marginBottom: '0.5rem' 
              }}>
                Mot de passe
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={handleKeyPress}
                required
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: '#f9fafb',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.75rem',
                  outline: 'none',
                  fontSize: '1rem',
                  transition: 'all 0.2s'
                }}
                placeholder="••••••••"
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              style={{
                width: '100%',
                background: loading ? '#93c5fd' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: 'white',
                fontWeight: 600,
                padding: '0.875rem',
                borderRadius: '0.75rem',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                fontSize: '1rem'
              }}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
              }}
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </div>

          <div style={{ 
            marginTop: '2rem', 
            paddingTop: '1.5rem', 
            borderTop: '1px solid #e5e7eb' 
          }}>
            <p style={{ 
              textAlign: 'center', 
              fontSize: '0.875rem', 
              color: '#6b7280', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.5rem' 
            }}>
              <Lock style={{ width: '1rem', height: '1rem' }} />
              Accès réservé aux administrateurs municipaux
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}