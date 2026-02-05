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
              <label htmlFor="password">MOT DE PASSE</label>
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
                  className="toggle-password"
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
              {isRegistering ? 'CRÉER MON COMPTE' : 'SE CONNECTER'}
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
            className="btn btn-ghost btn-links"
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
          /* Global background is handled by body check style below */
          position: relative;
        }

        /* Ambient glow background for login */
        .login-page::before {
            content: '';
            position: absolute;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(circle at 50% 50%, rgba(79, 140, 255, 0.20) 0%, transparent 60%),
                radial-gradient(circle at 80% 20%, rgba(6, 182, 212, 0.15) 0%, transparent 50%);
            pointer-events: none;
            z-index: 0;
        }
        
        /* Remove the purple gradient override */
        :global(body) {
           /* Ensure generic body background if not already set */
        }

        .login-container {
          width: 100%;
          max-width: 440px;
          perspective: 1000px;
          z-index: 1;
        }

        .login-card {
          background: rgba(13, 17, 23, 0.6); 
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 24px;
          padding: 40px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          position: relative;
          overflow: hidden;
        }
        
        /* Cyber accent top border */
        .login-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 2px;
            background: linear-gradient(90deg, transparent, var(--accent), var(--accent2), transparent);
        }

        .login-header {
          text-align: center;
          margin-bottom: 32px;
        }

        .login-header h2 {
          font-size: 36px;
          font-family: var(--font-display);
          font-weight: 700;
          color: var(--text);
          margin-bottom: 8px;
          text-shadow: 0 0 20px rgba(79, 140, 255, 0.3);
          letter-spacing: 2px;
        }

        .login-header p {
          color: var(--muted);
          font-size: 15px;
        }

        .form-group {
          margin-bottom: 24px;
        }

        .form-group label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: var(--faint);
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          color: var(--muted);
          pointer-events: none;
          z-index: 2;
        }

        .input {
          width: 100%;
          height: 52px;
          padding: 0 16px 0 44px;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid var(--border);
          border-radius: 12px;
          color: var(--text);
          font-size: 16px;
          transition: all 0.3s;
          font-family: var(--font-body);
        }

        .input:focus {
          outline: none;
          border-color: var(--accent);
          background: rgba(79, 140, 255, 0.05);
          box-shadow: 0 0 0 1px var(--accent), 0 0 20px rgba(79, 140, 255, 0.15);
        }
        
        /* Specific fix for inputs without icons if any */
        input:not(.input-with-icon .input) {
            padding-left: 16px;
        }

        .toggle-password {
          position: absolute;
          right: 12px;
          color: var(--muted);
          padding: 8px;
          background: transparent;
          border: none;
          cursor: pointer;
          border-radius: 50%;
          transition: 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .toggle-password:hover {
          color: var(--text);
          background: rgba(255,255,255,0.05);
        }

        .form-footer {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 24px;
        }

        .forgot-password {
          font-size: 13px;
          color: var(--muted);
          text-decoration: none;
          font-weight: 500;
          transition: 0.2s;
        }

        .forgot-password:hover {
          color: var(--accent);
          text-decoration: none;
        }

        /* BTN LG OVERRIDE */
        .btn-lg {
          width: 100%;
          height: 52px;
          font-size: 14px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .login-divider {
          display: flex;
          align-items: center;
          margin: 24px 0;
          color: var(--faint);
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        .login-divider::before,
        .login-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--border);
        }

        .login-divider span {
          padding: 0 16px;
        }
        
        .btn-links {
           margin-top: 20px;
           width: 100%;
           color: var(--muted);
           font-size: 13px;
        }
        
        .btn-links:hover {
           color: var(--text);
           background: transparent;
           transform: translateY(-1px);
        }

        @media (max-width: 480px) {
          .login-card {
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
}
