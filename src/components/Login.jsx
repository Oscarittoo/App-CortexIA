import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from './Toast';
import authService from '../services/authService';

export default function Login({ onLogin, onBack }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [companyName, setCompanyName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    if (isRegistering && !companyName) {
      toast.error('Veuillez entrer le nom de votre entreprise');
      return;
    }

    try {
      const userData = isRegistering
        ? await authService.register(email, password, companyName, 'free')
        : await authService.login(email, password);

      toast.success(isRegistering ? 'Compte créé avec succès !' : 'Connexion réussie !');
      onLogin(userData);
    } catch (error) {
      const message = error?.message || 'Erreur de connexion. Vérifiez vos identifiants.';
      toast.error(message);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h2>{isRegistering ? 'Créer un compte' : 'Connexion'}</h2>
            <p>
              {isRegistering 
                ? 'Commencez votre essai gratuit' 
                : 'Connectez-vous pour continuer'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {isRegistering && (
              <div className="form-group">
                <label htmlFor="company">Nom de l'entreprise</label>
                <input
                  id="company"
                  type="text"
                  className="input"
                  placeholder="Acme Inc."
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  autoComplete="organization"
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Adresse email</label>
              <div className="input-with-icon">
                <Mail size={18} className="input-icon" />
                <input
                  id="email"
                  type="email"
                  className="input"
                  placeholder="vous@entreprise.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <div className="input-with-icon">
                <Lock size={18} className="input-icon" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isRegistering ? 'new-password' : 'current-password'}
                />
                <button
                  type="button"
                  className="btn btn-ghost btn-sm toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {!isRegistering && (
              <div className="form-footer">
                <a href="#" className="forgot-password">Mot de passe oublié ?</a>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg">
              {isRegistering ? 'Créer mon compte' : 'Se connecter'}
            </button>
          </form>

          <div className="login-divider">
            <span>ou</span>
          </div>

          <button 
            type="button" 
            className="btn btn-secondary btn-lg"
            onClick={() => setIsRegistering(!isRegistering)}
          >
            {isRegistering 
              ? 'J\'ai déjà un compte' 
              : 'Créer un nouveau compte'}
          </button>

          <button 
            type="button" 
            className="btn btn-ghost"
            onClick={onBack}
          >
            Retour à l'accueil
          </button>
        </div>
      </div>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: var(--space-4);
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .login-container {
          width: 100%;
          max-width: 440px;
        }

        .login-card {
          background: var(--color-bg-primary);
          border-radius: var(--radius-xl);
          padding: var(--space-10);
          box-shadow: var(--shadow-xl);
        }

        .login-header {
          text-align: center;
          margin-bottom: var(--space-8);
        }

        .login-header h2 {
          font-size: var(--font-size-3xl);
          font-weight: var(--font-weight-bold);
          margin-bottom: var(--space-2);
          color: var(--color-text-primary);
        }

        .login-header p {
          color: var(--color-text-secondary);
          font-size: var(--font-size-base);
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-5);
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .form-group label {
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-medium);
          color: var(--color-text-primary);
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: var(--space-3);
          color: var(--color-text-tertiary);
        }

        .input-with-icon .input {
          padding-left: var(--space-10);
          padding-right: var(--space-10);
        }

        .toggle-password {
          position: absolute;
          right: var(--space-2);
        }

        .form-footer {
          display: flex;
          justify-content: flex-end;
          margin-top: calc(var(--space-2) * -1);
        }

        .forgot-password {
          font-size: var(--font-size-sm);
          color: var(--color-primary);
          text-decoration: none;
        }

        .forgot-password:hover {
          text-decoration: underline;
        }

        .login-divider {
          position: relative;
          text-align: center;
          margin: var(--space-6) 0;
        }

        .login-divider::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 1px;
          background: var(--color-border-light);
        }

        .login-divider span {
          position: relative;
          background: var(--color-bg-primary);
          padding: 0 var(--space-3);
          color: var(--color-text-tertiary);
          font-size: var(--font-size-sm);
        }

        .btn-lg {
          width: 100%;
        }
      `}</style>
    </div>
  );
}
