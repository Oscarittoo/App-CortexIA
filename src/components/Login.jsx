import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import toast from './Toast';
import authService from '../services/authService';

export default function Login({ onLogin, onBack, selectedPlan = 'free' }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [plan, setPlan] = useState(selectedPlan);
  const [resetSent, setResetSent] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const plans = [
    { id: 'free', name: 'Free', price: '0€' },
    { id: 'pro', name: 'Pro', price: '29,99€/mois' },
    { id: 'business', name: 'Business', price: '49,99€/membre' },
    { id: 'expert', name: 'Expert', price: '129,99€/membre' }
  ];

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

    if (isRegistering) {
      if (password.length < 8) {
        setPasswordError('Le mot de passe doit contenir au moins 8 caractères');
        return;
      }
      if (!/[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
        setPasswordError('Ajoutez au moins un chiffre ou caractère spécial (!@#...)');
        return;
      }
      setPasswordError('');
    }

    try {
      setIsSubmitting(true);
      if (isRegistering) {
        await authService.register(email, password, companyName, plan);
        setRegistrationSuccess(true);
        return;
      }
      const userData = await authService.login(email, password);
      toast.success('Connexion réussie !');
      onLogin(userData);
    } catch (error) {
      const message = error?.message || 'Erreur de connexion. Vérifiez vos identifiants.';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Veuillez entrer votre adresse email');
      return;
    }
    try {
      await authService.resetPassword(email);
      setResetSent(true);
    } catch (error) {
      toast.error(error?.message || 'Erreur lors de l\'envoi du lien');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">

          {/* VUE SUCCÈS INSCRIPTION */}
          {registrationSuccess ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✉️</div>
              <h2 style={{ marginBottom: '8px' }}>Vérifiez votre boîte mail</h2>
              <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>
                Un email de confirmation a été envoyé à <strong>{email}</strong>.<br/>
                Cliquez sur le lien pour activer votre compte, puis connectez-vous.
              </p>
              <button
                className="btn btn-primary btn-lg"
                onClick={() => { setRegistrationSuccess(false); setIsRegistering(false); }}
              >
                Aller à la connexion
              </button>
            </div>
          ) : /* VUE RÉINITIALISATION MOT DE PASSE */
          isForgotPassword ? (
            <>
              <div className="login-header">
                <h2>Mot de passe oublié</h2>
                <p>{resetSent ? 'Email envoyé !' : 'Un lien de réinitialisation vous sera envoyé'}</p>
              </div>
              {resetSent ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>✉️</div>
                  <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>
                    Un email a été envoyé à <strong>{email}</strong>.<br/>Vérifiez votre boîte mail et cliquez sur le lien.
                  </p>
                  <button className="btn btn-secondary btn-lg" onClick={() => { setIsForgotPassword(false); setResetSent(false); }}>
                    Retour à la connexion
                  </button>
                </div>
              ) : (
                <form onSubmit={handleResetPassword} className="login-form">
                  <div className="form-group">
                    <label htmlFor="reset-email">Adresse email</label>
                    <div className="input-with-icon">
                      <Mail size={18} className="input-icon" />
                      <input
                        id="reset-email"
                        type="email"
                        className="input"
                        placeholder="vous@entreprise.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        autoFocus
                      />
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg">ENVOYER LE LIEN</button>
                  <button type="button" className="btn btn-ghost btn-links" onClick={() => setIsForgotPassword(false)}>
                    <ArrowLeft size={16} style={{ marginRight: '6px' }} /> Retour à la connexion
                  </button>
                </form>
              )}
            </>
          ) : (
          <>
          <div className="login-header">
            <h2>{isRegistering ? 'Créer un compte' : 'Connexion'}</h2>
            <p>
              {isRegistering 
                ? 'Commencez votre essai gratuit' 
                : 'Connectez-vous pour continuer'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="login-form" autoComplete={isRegistering ? 'off' : 'on'}>
            {isRegistering && (
              <>
                <div className="form-group">
                  <label htmlFor="company">Nom de l'entreprise</label>
                  <input
                    id="company"
                    type="text"
                    className="input"
                    placeholder="Acme Inc."
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    autoComplete="off"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="plan">Choisissez votre plan</label>
                  <select
                    id="plan"
                    className="input"
                    value={plan}
                    onChange={(e) => setPlan(e.target.value)}
                    style={{ paddingLeft: '16px' }}
                  >
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} - {p.price}
                      </option>
                    ))}
                  </select>
                  <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
                    Vous pourrez modifier votre plan plus tard depuis les paramètres
                  </p>
                </div>
              </>
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
                  autoComplete={isRegistering ? 'off' : 'email'}
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
                  onChange={(e) => { setPassword(e.target.value); if (passwordError) setPasswordError(''); }}
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {isRegistering && passwordError && (
                <p style={{ color: 'var(--error, #f87171)', fontSize: '13px', marginTop: '6px' }}>{passwordError}</p>
              )}
            </div>

            {!isRegistering && (
              <div className="form-footer">
                <button
                  type="button"
                  className="forgot-password"
                  onClick={() => { setIsForgotPassword(true); setResetSent(false); }}
                >
                  Mot de passe oublié ?
                </button>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '16px', height: '16px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} />
                  {isRegistering ? 'Création...' : 'Connexion...'}
                  <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                </span>
              ) : (
                isRegistering ? 'CRÉER MON COMPTE' : 'SE CONNECTER'
              )}
            </button>
          </form>

          <div className="login-divider">
            <span>ou</span>
          </div>

          <button 
            type="button" 
            className="btn btn-secondary btn-lg"
            onClick={() => {
              setIsRegistering(!isRegistering);
              setEmail('');
              setPassword('');
              setCompanyName('');
              setPasswordError('');
            }}
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
          </>
          )}
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
          background: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
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
