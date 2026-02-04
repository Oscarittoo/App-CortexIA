import { Check } from 'lucide-react';

export default function Pricing({ onSelectPlan }) {
  const plans = [
    {
      id: 'free',
      name: 'Gratuit',
      price: '0',
      description: 'Parfait pour découvrir CORTEXIA',
      features: [
        '3 réunions par mois',
        'Transcription temps réel',
        'Résumé automatique',
        'Export PDF',
        'Stockage 7 jours'
      ],
      limitations: [
        'Pas d\'accès à l\'IA avancée',
        'Support communautaire'
      ],
      cta: 'Commencer gratuitement',
      popular: false
    },
    {
      id: 'pro',
      name: 'Professionnel',
      price: '29',
      description: 'Pour les professionnels et équipes',
      features: [
        'Réunions illimitées',
        'IA avancée pour extraction',
        'Actions et décisions automatiques',
        'Intégrations (Slack, Teams)',
        'Stockage illimité',
        'Export multi-formats',
        'Analyse et statistiques',
        'Support prioritaire'
      ],
      limitations: [],
      cta: 'Choisir Pro',
      popular: true
    },
    {
      id: 'business',
      name: 'Business',
      price: '49',
      description: 'Pour les équipes en croissance',
      features: [
        'Tout du plan Pro',
        'Espaces d\'équipe',
        'Rôles & permissions',
        'Rapports avancés',
        'Intégrations premium',
        'Support prioritaire renforcé'
      ],
      limitations: [],
      cta: 'Passer Business',
      popular: false
    },
    {
      id: 'enterprise',
      name: 'Entreprise',
      price: 'Sur demande',
      description: 'Pour les grandes organisations',
      features: [
        'Tout du plan Business',
        'API personnalisée',
        'Déploiement on-premise',
        'SSO et sécurité avancée',
        'Base de données dédiée',
        'Formation équipe',
        'Account manager dédié',
        'SLA garanti 99.9%'
      ],
      limitations: [],
      cta: 'Nous contacter',
      popular: false
    }
  ];

  return (
    <div className="pricing-page">
      <div className="pricing-header">
        <h1>Choisissez votre plan</h1>
        <p>Commencez gratuitement, passez Pro quand vous êtes prêt</p>
      </div>

      <div className="pricing-grid">
        {plans.map(plan => (
          <div 
            key={plan.id} 
            className={`pricing-card ${plan.popular ? 'popular' : ''}`}
          >
            {plan.popular && (
              <div className="popular-badge">
                Plus populaire
              </div>
            )}
            
            <div className="plan-header">
              <h3>{plan.name}</h3>
              <div className="plan-price">
                {plan.price === 'Sur mesure' || plan.price === 'Sur demande' ? (
                  <span className="price-custom">{plan.price}</span>
                ) : (
                  <>
                    <span className="price-amount">{plan.price}€</span>
                    <span className="price-period">/mois</span>
                  </>
                )}
              </div>
              <p className="plan-description">{plan.description}</p>
            </div>

            <button 
              className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'} btn-lg`}
              onClick={() => onSelectPlan(plan.id)}
            >
              {plan.cta}
            </button>

            <div className="plan-features">
              <ul>
                {plan.features.map((feature, index) => (
                  <li key={index}>
                    <Check size={14} strokeWidth={2} className="feature-icon" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .pricing-page {
          max-width: 1400px;
          margin: 0 auto;
          padding: var(--space-16) var(--space-8);
        }

        .pricing-header {
          text-align: center;
          margin-bottom: var(--space-16);
        }

        .pricing-header h1 {
          font-size: var(--font-size-4xl);
          font-weight: var(--font-weight-bold);
          margin-bottom: var(--space-4);
          color: var(--color-text-primary);
        }

        .pricing-header p {
          font-size: var(--font-size-xl);
          color: var(--color-text-secondary);
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(240px, 1fr));
          gap: var(--space-6);
          margin-bottom: var(--space-16);
          align-items: stretch;
        }

        .pricing-card {
          position: relative;
          background: var(--color-bg-primary);
          border: 2px solid var(--color-border-light);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
          transition: all var(--transition-base);
          display: flex;
          flex-direction: column;
        }

        .pricing-card:hover {
          transform: translateY(-4px);
          box-shadow: var(--shadow-xl);
          border-color: var(--color-primary);
        }

        .pricing-card.popular {
          border-color: var(--color-primary);
          box-shadow: var(--shadow-lg);
          transform: scale(1.05);
        }

        .pricing-card.popular:hover {
          transform: scale(1.05) translateY(-4px);
        }

        @media (max-width: 1200px) {
          .pricing-grid {
            grid-template-columns: repeat(2, minmax(260px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .pricing-grid {
            grid-template-columns: 1fr;
          }
        }

        .popular-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: linear-gradient(135deg, var(--color-primary), var(--color-primary-hover));
          color: white;
          padding: var(--space-1) var(--space-4);
          border-radius: var(--radius-full);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-semibold);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .plan-header {
          text-align: center;
          margin-bottom: var(--space-4);
        }

        .plan-header h3 {
          font-size: var(--font-size-2xl);
          font-weight: var(--font-weight-bold);
          margin-bottom: var(--space-4);
          color: var(--color-text-primary);
        }

        .plan-price {
          margin-bottom: var(--space-3);
        }

        .price-amount {
          font-size: 3.5rem;
          font-weight: var(--font-weight-bold);
          color: var(--color-primary);
        }

        .price-period {
          font-size: var(--font-size-lg);
          color: var(--color-text-tertiary);
        }

        .price-custom {
          font-size: var(--font-size-2xl);
          font-weight: var(--font-weight-semibold);
          color: var(--color-primary);
        }

        .plan-description {
          color: var(--color-text-secondary);
          font-size: var(--font-size-base);
        }

        .plan-features {
          margin-top: var(--space-4);
          flex: 1;
        }

        .plan-features ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .plan-features li {
          display: flex;
          align-items: flex-start;
          gap: var(--space-2);
          padding: var(--space-2) 0;
          color: var(--color-text-primary);
          font-size: var(--font-size-xs);
        }

        .feature-icon {
          width: 14px;
          height: 14px;
          color: var(--color-success);
          flex-shrink: 0;
          margin-top: 3px;
        }

        .btn-lg {
          width: 100%;
          margin-bottom: var(--space-3);
        }
      `}</style>
    </div>
  );
}
