import { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import toast from './Toast';

export default function ResetPassword({ onDone }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (password !== confirm) {
      toast.error('Les mots de passe ne correspondent pas.');
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success('Mot de passe mis à jour avec succès !');
      onDone();
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la mise à jour du mot de passe.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0a0a19'
    }}>
      <div style={{
        background: '#1e293b', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px', padding: '40px', width: '100%', maxWidth: '400px'
      }}>
        <h2 style={{ color: '#fff', fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>
          Nouveau mot de passe
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '14px', marginBottom: '28px' }}>
          Choisissez un nouveau mot de passe pour votre compte.
        </p>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>
              Nouveau mot de passe
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Au moins 8 caractères"
              required
              minLength={8}
              style={{
                width: '100%', padding: '10px 14px', background: '#0f172a',
                border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px',
                color: '#fff', fontSize: '14px', boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: '#94a3b8', fontSize: '13px', marginBottom: '6px' }}>
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Répétez le mot de passe"
              required
              style={{
                width: '100%', padding: '10px 14px', background: '#0f172a',
                border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px',
                color: '#fff', fontSize: '14px', boxSizing: 'border-box'
              }}
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              width: '100%', padding: '12px', background: isSubmitting ? '#334155' : '#6366f1',
              border: 'none', borderRadius: '8px', color: '#fff', fontSize: '14px',
              fontWeight: '600', cursor: isSubmitting ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
          </button>
        </form>
      </div>
    </div>
  );
}
