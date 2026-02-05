import { Check, Star, Shield, Zap, Globe, Lock } from 'lucide-react';
import { useState } from 'react';

export default function Pricing({ onSelectPlan }) {
  const [billingCycle, setBillingCycle] = useState('monthly');

  const plans = [
    {
      id: 'free',
      name: 'Starter',
      price: '0',
      description: 'Pour découvrir la puissance de l\'IA',
      features: [
        '3 réunions / mois',
        'Transcription temps réel',
        'Résumé simple',
        'Export PDF',
        'Stockage 7 jours'
      ],
      highlight: false,
      icon: <Star size={20} />
    },
    {
      id: 'pro',
      name: 'Professionnel',
      price: billingCycle === 'monthly' ? '29' : '24',
      period: '/ mois',
      description: 'Pour les freelances et managers',
      features: [
        'Réunions illimitées',
        'IA Avancée (GPT-4o)',
        'Détection des actions',
        'Intégration Notion & Slack',
        'Recherche sémantique',
        'Support prioritaire'
      ],
      highlight: true,
      badge: 'POPULAIRE',
      icon: <Zap size={20} />
    },
    {
      id: 'business',
      name: 'Business',
      price: billingCycle === 'monthly' ? '49' : '39',
      period: '/ membre',
      description: 'Pour les équipes qui collaborent',
      features: [
        'Tout du plan Pro',
        'Espaces d\'équipe partagés',
        'Analytiques d\'équipe',
        'Intégration CRM (Salesforce)',
        'Gestion des rôles',
        'Onboarding dédié'
      ],
      highlight: false,
      icon: <Shield size={20} />
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 'Sur demande',
      period: '',
      description: 'Pour les grandes organisations',
      features: [
        'Tout illimité',
        'Déploiement sur site (On-premise)',
        'SSO & SAML',
        'API dédiée',
        'Audit logs',
        'Gestionnaire de compte dédié'
      ],
      highlight: false,
      icon: <Globe size={20} />
    }
  ];

  return (
    <div className="screen pricing-page">
      <div className="page-header">
         <div className="badge-new">OFFRE DE LANCEMENT</div>
        <h1>Un Investissement <br/> <span className="text-gradient">Rentable dès la 1ère heure</span></h1>
        <p>Ne payez pas pour des réunions improductives. Investissez dans leur résultat.</p>
        
        {/* Toggle Switch */}
        <div className="billing-toggle">
           <span className={billingCycle === 'monthly' ? 'active' : ''} onClick={() => setBillingCycle('monthly')}>Mensuel</span>
           <div className="toggle-pill" onClick={() => setBillingCycle(c => c === 'monthly' ? 'yearly' : 'monthly')}>
              <div className={`pill-circle ${billingCycle}`}></div>
           </div>
           <span className={billingCycle === 'yearly' ? 'active' : ''} onClick={() => setBillingCycle('yearly')}>
              Annuel <span className="discount">-20%</span>
           </span>
        </div>
      </div>

      <div className="pricing-grid">
        {plans.map((plan) => (
          <div key={plan.id} className={`pricing-card ${plan.highlight ? 'highlight' : ''}`}>
             {plan.highlight && <div className="glow-effect"></div>}
             {plan.highlight && <div className="popular-badge">{plan.badge}</div>}
             
             <div className="plan-header">
                <div className="plan-icon-box">{plan.icon}</div>
                <h3 className="plan-name">{plan.name}</h3>
                <div className="plan-price">
                   <span className="amount">{plan.price}{plan.id !== 'enterprise' && '€'}</span>
                   {plan.period && <span className="period">{plan.period}</span>}
                </div>
                <p className="plan-desc">{plan.description}</p>
             </div>
             
             <div className="plan-features">
                {plan.features.map((feat, i) => (
                   <div key={i} className="feature-row">
                      <div className="check-circle">
                         <Check size={12} strokeWidth={3} />
                      </div>
                      <span>{feat}</span>
                   </div>
                ))}
             </div>
             
             <div className="plan-footer">
                <button 
                  className={`btn-plan ${plan.highlight ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => onSelectPlan(plan.id)}
                >
                  {plan.id === 'enterprise' ? 'Nous contacter' : 'Choisir ce plan'}
                </button>
             </div>
          </div>
        ))}
      </div>
      
      <div className="enterprise-contact">
         <p>Vous avez des besoins spécifiques ? <a href="#">Parlez à un expert</a></p>
      </div>

      <style jsx>{`
        .pricing-page {
          max-width: 1400px;
          margin: 0 auto;
          padding: 80px 24px;
        }

        .page-header {
          text-align: center;
          margin-bottom: 80px;
        }
        
        .badge-new {
          display: inline-block;
          background: rgba(14, 165, 233, 0.1);
          color: #0ea5e9;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1px;
          border: 1px solid rgba(14, 165, 233, 0.3);
          margin-bottom: 24px;
        }

        .page-header h1 {
          font-family: 'Orbitron', sans-serif;
          font-size: 48px;
          font-weight: 800;
          line-height: 1.2;
          color: #ffffff;
          margin-bottom: 24px;
        }
        
        .text-gradient {
          background: linear-gradient(135deg, #0ea5e9 0%, #e11d48 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .page-header p {
          font-size: 20px;
          color: var(--color-text-secondary);
          max-width: 600px;
          margin: 0 auto 40px;
        }
        
        /* TOGGLE */
        .billing-toggle {
           display: flex;
           align-items: center;
           justify-content: center;
           gap: 16px;
           margin-bottom: 40px;
           color: var(--muted);
           font-weight: 600;
        }
        
        .billing-toggle span.active { color: #fff; }
        .billing-toggle span { cursor: pointer; transition: color 0.3s; }
        
        .discount {
           background: #e11d48;
           color: #fff;
           font-size: 10px;
           padding: 2px 6px;
           border-radius: 10px;
           margin-left: 5px;
        }
        
        .toggle-pill {
           width: 50px;
           height: 28px;
           background: #1e293b;
           border-radius: 14px;
           padding: 2px;
           cursor: pointer;
           border: 1px solid rgba(255,255,255,0.1);
           position: relative;
        }
        
        .pill-circle {
           width: 22px;
           height: 22px;
           background: #fff;
           border-radius: 50%;
           position: absolute;
           top: 2px;
           transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .pill-circle.monthly { left: 2px; }
        .pill-circle.yearly { left: 24px; background: #0ea5e9; }

        /* GRID */
        .pricing-grid {
           display: grid;
           grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
           gap: 24px;
           margin-bottom: 60px;
           align-items: stretch;
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
           transform: translateY(-10px);
           border-color: rgba(255,255,255,0.1);
        }
        
        .pricing-card.highlight {
           background: rgba(15, 23, 42, 0.8);
           border: 1px solid rgba(14, 165, 233, 0.5);
           box-shadow: 0 0 40px -10px rgba(14, 165, 233, 0.3);
           z-index: 10;
           transform: scale(1.05);
        }
        .pricing-card.highlight:hover {
           transform: scale(1.05) translateY(-10px);
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
        .highlight .plan-icon-box { background: rgba(14, 165, 233, 0.1); color: #0ea5e9; }
        
        .plan-name { font-family: 'Orbitron'; font-size: 18px; color: #fff; margin-bottom: 10px; }
        
        .plan-price .amount { font-family: 'Orbitron'; font-size: 32px; font-weight: 700; color: #fff; }
        .highlight .plan-price .amount { color: #0ea5e9; }
        .plan-price .period { color: var(--muted); font-size: 13px; }
        
        .plan-desc { color: var(--color-text-secondary); font-size: 13px; margin-top: 8px; min-height: 40px; }
        
        .plan-features { flex: 1; display: flex; flex-direction: column; gap: 12px; margin-bottom: 32px; }
        
        .feature-row { display: flex; gap: 10px; font-size: 13px; color: var(--text); align-items: flex-start; }
        
        .check-circle {
           min-width: 16px; height: 16px;
           border-radius: 50%;
           background: rgba(16, 185, 129, 0.1);
           color: #10b981;
           display: flex; align-items: center; justify-content: center;
           margin-top: 2px;
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
           border: 1px solid rgba(255,255,255,0.2);
           color: white;
        }
        .btn-outline:hover {
           border-color: #fff;
           background: rgba(255,255,255,0.05);
        }
        
        .enterprise-contact {
           text-align: center;
           color: var(--muted);
           margin-top: 40px;
        }
        .enterprise-contact a {
           color: #0ea5e9;
           text-decoration: none;
           margin-left: 8px;
        }
        .enterprise-contact a:hover {
           text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
