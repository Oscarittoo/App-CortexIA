import { useState } from 'react';
import logo from '../assets/logo_brain_circuit.svg';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '0€',
    period: 'pour toujours',
    icon: '⚡',
    color: '#64748b',
    gradient: 'linear-gradient(135deg, #374151, #1f2937)',
    features: [
      '5 sessions / mois',
      'Transcription basique',
      'Résumés courts',
      'Max 30 min / session',
    ],
    cta: 'Commencer gratuitement',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '29,99€',
    period: '/mois',
    icon: '✨',
    color: '#38bdf8',
    gradient: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
    popular: true,
    features: [
      'Sessions illimitées',
      'Transcription IA avancée',
      'Résumés & comptes-rendus',
      'Export PDF & Word',
      'Zoom, Teams, Meet',
      'Overlay intelligent',
    ],
    cta: 'Choisir Pro',
  },
  {
    id: 'business',
    name: 'Business',
    price: '49,99€',
    period: '/membre/mois',
    icon: '🏢',
    color: '#818cf8',
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    features: [
      'Tout Pro inclus',
      "Jusqu'à 50 membres",
      'Tableau de bord équipe',
      'Accès API complet',
      'Analytics avancés',
      'Support prioritaire',
    ],
    cta: 'Choisir Business',
  },
  {
    id: 'expert',
    name: 'Expert',
    price: '129,99€',
    period: '/membre/mois',
    icon: '👑',
    color: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #ef4444)',
    features: [
      'Tout Business inclus',
      'Membres illimités',
      'Déploiement on-premise',
      'SLA 99.9% garanti',
      'Onboarding dédié',
      'Support 24/7',
    ],
    cta: 'Contacter les ventes',
  },
];

export default function PricingSelection({ onSelectPlan, onLogout, currentUser }) {
  const [hovered, setHovered] = useState(null);
  const firstName = currentUser?.email?.split('@')[0] || '';

  return (
    <div style={{
      minHeight: '100vh',
      background: '#0a0a19',
      padding: '48px 24px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', inset: '-16px', background: 'radial-gradient(circle, rgba(102,126,234,0.15) 0%, transparent 70%)', borderRadius: '50%' }} />
          <img src={logo} alt="Meetizy" width="52" height="52" style={{ position: 'relative' }} />
        </div>
        <span style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: '800', fontSize: '26px', letterSpacing: '2px', color: '#fff' }}>MEETIZY</span>
      </div>

      <div style={{ width: '48px', height: '3px', background: 'linear-gradient(90deg, #667eea, #764ba2)', borderRadius: '2px', marginBottom: '28px' }} />

      <h1 style={{ color: '#e2e8f0', fontSize: '30px', fontWeight: '700', marginBottom: '10px', textAlign: 'center', lineHeight: 1.3 }}>
        Bienvenue{firstName ? `, ${firstName}` : ''} ! 🎉
      </h1>
      <p style={{ color: '#94a3b8', fontSize: '16px', marginBottom: '52px', textAlign: 'center', maxWidth: '520px' }}>
        Votre compte est créé. Choisissez le plan qui correspond à vos besoins pour continuer.
      </p>

      {/* Plans */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
        gap: '20px',
        width: '100%',
        maxWidth: '1080px',
        marginBottom: '40px',
      }}>
        {PLANS.map(plan => (
          <div
            key={plan.id}
            onMouseEnter={() => setHovered(plan.id)}
            onMouseLeave={() => setHovered(null)}
            style={{
              position: 'relative',
              background: hovered === plan.id ? 'rgba(102,126,234,0.08)' : 'rgba(255,255,255,0.03)',
              border: `2px solid ${hovered === plan.id ? plan.color : 'rgba(255,255,255,0.07)'}`,
              borderRadius: '20px',
              padding: '28px 22px',
              transition: 'all 0.22s ease',
              transform: hovered === plan.id ? 'translateY(-5px)' : 'none',
              boxShadow: hovered === plan.id ? `0 16px 48px rgba(0,0,0,0.35)` : 'none',
            }}
          >
            {plan.popular && (
              <div style={{
                position: 'absolute', top: '-13px', left: '50%', transform: 'translateX(-50%)',
                background: plan.gradient, color: '#fff', padding: '4px 18px', borderRadius: '20px',
                fontSize: '11px', fontWeight: '800', letterSpacing: '0.5px', whiteSpace: 'nowrap',
              }}>
                ⭐ POPULAIRE
              </div>
            )}

            <div style={{ fontSize: '30px', marginBottom: '14px' }}>{plan.icon}</div>
            <h3 style={{ color: plan.color, fontSize: '21px', fontWeight: '700', marginBottom: '6px' }}>{plan.name}</h3>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', marginBottom: '4px' }}>
              <span style={{ fontSize: '34px', fontWeight: '800', color: '#fff', lineHeight: 1 }}>{plan.price}</span>
              <span style={{ color: '#64748b', fontSize: '13px', paddingBottom: '5px' }}>{plan.period}</span>
            </div>

            <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '18px 0' }} />

            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px', display: 'flex', flexDirection: 'column', gap: '9px' }}>
              {plan.features.map(f => (
                <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', color: '#cbd5e1', fontSize: '13px', lineHeight: 1.4 }}>
                  <span style={{ color: plan.color, fontWeight: '800', flexShrink: 0, marginTop: '1px' }}>✓</span>
                  {f}
                </li>
              ))}
            </ul>

            <button
              onClick={() => onSelectPlan(plan.id)}
              style={{
                width: '100%',
                padding: '13px',
                background: hovered === plan.id ? plan.gradient : 'rgba(255,255,255,0.05)',
                border: `1px solid ${hovered === plan.id ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
                borderRadius: '12px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {plan.cta} →
            </button>
          </div>
        ))}
      </div>

      <button
        onClick={onLogout}
        style={{ background: 'none', border: 'none', color: '#475569', cursor: 'pointer', fontSize: '13px', textDecoration: 'underline' }}
      >
        Se déconnecter
      </button>
    </div>
  );
}
