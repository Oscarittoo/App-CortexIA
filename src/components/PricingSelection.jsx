import { Check, Zap, Star, Shield, Layers } from 'lucide-react';
import logo from '../assets/logo_brain_circuit.svg';

const PLANS = [
  {
    id: 'free',
    name: 'Free',
    price: '0',
    priceUnit: '€',
    period: '',
    description: "Pour découvrir l'assistant IA",
    icon: Star,
    highlight: false,
    features: [
      '5 sessions par mois',
      'Transcription standard',
      'Résumés automatiques',
      'Durée max 30 min / session',
    ],
    cta: 'Commencer gratuitement',
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '29,99',
    priceUnit: '€',
    period: '/ mois',
    description: 'Pour les freelances et managers',
    icon: Zap,
    highlight: true,
    badge: 'POPULAIRE',
    features: [
      'Sessions illimitées',
      'Transcription IA avancée',
      'Résumés et comptes-rendus',
      'Export PDF et Word',
      'Intégrations Zoom, Teams, Meet',
      'Overlay assistant intelligent',
    ],
    cta: 'Choisir Pro',
  },
  {
    id: 'business',
    name: 'Business',
    price: '49,99',
    priceUnit: '€',
    period: '/ membre / mois',
    description: 'Pour les équipes',
    icon: Shield,
    highlight: false,
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
    price: '129,99',
    priceUnit: '€',
    period: '/ membre / mois',
    description: 'Pour les organisations',
    icon: Layers,
    highlight: false,
    features: [
      'Tout Business inclus',
      'Membres illimités',
      'Déploiement on-premise',
      'SLA 99,9 % garanti',
      'Onboarding dédié',
      'Support 24/7',
    ],
    cta: 'Choisir Expert',
  },
];

export default function PricingSelection({ onSelectPlan, onLogout, currentUser }) {
  return (
    <div className="screen pricing-selection-page">
      {/* En-tête */}
      <div style={{ textAlign: 'center', marginBottom: '64px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginBottom: '36px' }}>
          <img src={logo} alt="Meetizy" width="40" height="40" />
          <span style={{ fontFamily: 'Orbitron, sans-serif', fontWeight: '700', fontSize: '20px', letterSpacing: '1px', color: '#ffffff' }}>MEETIZY</span>
        </div>
        <h1 className="ps-title">Choisissez votre formule</h1>
        <p className="ps-subtitle">
          Sélectionnez le plan adapté à vos besoins pour finaliser la configuration de votre espace.
        </p>
      </div>

      {/* Grille des plans */}
      <div className="ps-grid">
        {PLANS.map(plan => {
          const Icon = plan.icon;
          return (
            <div key={plan.id} className={`pricing-card${plan.highlight ? ' highlight' : ''}`}>
              {plan.highlight && <div className="glow-effect" />}
              {plan.badge && <div className="popular-badge">{plan.badge}</div>}

              <div className="plan-header">
                <div className="plan-icon-box"><Icon size={20} /></div>
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-price">
                  <span className="amount">{plan.price}{plan.priceUnit}</span>
                  {plan.period && <span className="period">{plan.period}</span>}
                </div>
                <p className="plan-desc">{plan.description}</p>
              </div>

              <div className="plan-features">
                {plan.features.map((feat, i) => (
                  <div key={i} className="feature-row">
                    <div className="check-circle"><Check size={12} strokeWidth={3} /></div>
                    <span>{feat}</span>
                  </div>
                ))}
              </div>

              <div className="plan-footer">
                <button
                  className={`btn-plan${plan.highlight ? ' btn-primary' : ' btn-outline'}`}
                  onClick={() => onSelectPlan(plan.id)}
                >
                  {plan.cta}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button
          onClick={onLogout}
          style={{ background: 'none', border: 'none', color: 'var(--muted)', cursor: 'pointer', fontSize: '14px', textDecoration: 'underline' }}
        >
          Se déconnecter
        </button>
      </div>

      <style jsx>{`
        .pricing-selection-page {
          max-width: 1280px;
          margin: 0 auto;
          padding: 80px 24px;
        }

        .ps-title {
          font-size: 40px;
          font-weight: 800;
          color: #ffffff;
          margin-bottom: 16px;
          line-height: 1.2;
        }

        .ps-subtitle {
          font-size: 17px;
          color: var(--muted);
          max-width: 540px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .ps-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-bottom: 60px;
          align-items: stretch;
        }

        @media (max-width: 1100px) {
          .ps-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 600px) {
          .ps-grid { grid-template-columns: 1fr; }
          .pricing-selection-page { padding: 48px 16px; }
          .ps-title { font-size: 28px; }
        }

        .pricing-card {
          background: rgba(30, 41, 59, 0.4);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 20px;
          padding: 32px;
          display: flex;
          flex-direction: column;
          position: relative;
          transition: transform 0.3s, border-color 0.3s;
        }

        .pricing-card:hover {
          transform: translateY(-8px);
          border-color: rgba(255,255,255,0.1);
        }

        .pricing-card.highlight {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(14, 165, 233, 0.5);
          box-shadow: 0 0 40px -10px rgba(14, 165, 233, 0.3);
          z-index: 10;
          transform: scale(1.03);
        }

        .pricing-card.highlight:hover {
          transform: scale(1.03) translateY(-8px);
        }

        .popular-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(90deg, #0ea5e9, #6366f1);
          color: #fff;
          font-size: 11px;
          font-weight: 800;
          padding: 6px 16px;
          border-radius: 20px;
          letter-spacing: 1px;
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.4);
          white-space: nowrap;
        }

        .plan-header {
          text-align: center;
          margin-bottom: 24px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          padding-bottom: 24px;
        }

        .plan-icon-box {
          width: 48px;
          height: 48px;
          margin: 0 auto 16px;
          border-radius: 12px;
          background: rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--muted);
        }

        .highlight .plan-icon-box {
          background: rgba(14, 165, 233, 0.1);
          color: #0ea5e9;
        }

        .plan-name {
          font-size: 18px;
          color: #fff;
          margin-bottom: 10px;
        }

        .plan-price {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 6px;
        }

        .plan-price .amount {
          font-size: 32px;
          font-weight: 700;
          color: #fff;
        }

        .highlight .plan-price .amount {
          color: #0ea5e9;
        }

        .plan-price .period {
          color: var(--muted);
          font-size: 13px;
        }

        .plan-desc {
          color: var(--muted);
          font-size: 13px;
          margin-top: 8px;
          min-height: 36px;
        }

        .plan-features {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 32px;
        }

        .feature-row {
          display: flex;
          gap: 10px;
          font-size: 13px;
          color: var(--text);
          align-items: flex-start;
        }

        .check-circle {
          min-width: 16px;
          height: 16px;
          border-radius: 50%;
          background: rgba(16, 185, 129, 0.1);
          color: #10b981;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-top: 2px;
          flex-shrink: 0;
        }

        .plan-footer .btn-plan {
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          font-weight: 600;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
          border: none;
        }

        .btn-primary {
          background: linear-gradient(90deg, #0ea5e9, #6366f1);
          color: white;
          box-shadow: 0 4px 12px rgba(14, 165, 233, 0.3);
        }

        .btn-primary:hover {
          box-shadow: 0 6px 16px rgba(14, 165, 233, 0.5);
          transform: translateY(-1px);
        }

        .btn-outline {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.2) !important;
          color: white;
        }

        .btn-outline:hover {
          border-color: rgba(255,255,255,0.5) !important;
          background: rgba(255,255,255,0.05);
        }

        .glow-effect {
          position: absolute;
          inset: -1px;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(14,165,233,0.08), rgba(99,102,241,0.08));
          pointer-events: none;
          z-index: -1;
        }
      `}</style>
    </div>
  );
}

