import { useState } from 'react';

export default function Home({ onGetStarted, onViewDemo }) {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 100 14A7 7 0 008 1zM7 4h2v5H7V4zm0 6h2v2H7v-2z"/>
            </svg>
            <span>Intelligence de Réunion Alimentée par l'IA</span>
          </div>
          
          <h1 className="hero-title">
            Transformez vos réunions en
            <span className="gradient-text"> actions concrètes</span>
          </h1>
          
          <p className="hero-description">
            MEETIZY transcrit, résume et extrait automatiquement les tâches de vos réunions en temps réel. 
            Concentrez-vous sur la conversation pendant que l'IA s'occupe du reste.
          </p>
          
          <div className="hero-actions">
            <button className="btn-hero-primary" onClick={onGetStarted}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
              </svg>
              Démarrer gratuitement
            </button>
            <button className="btn-hero-secondary" onClick={onViewDemo}>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd"/>
              </svg>
              Voir la démo
            </button>
          </div>
          
          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-number">95%</div>
              <div className="stat-label">Taux de précision</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">2 Heures</div>
              <div className="stat-label">Temps économisé moy.</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-number">10+</div>
              <div className="stat-label">Langues</div>
            </div>
          </div>
        </div>
        
        <div className="hero-visual">
          <div className="floating-card card-1">
            <div className="card-header">
              <div className="card-dot"></div>
              <div className="card-dot"></div>
              <div className="card-dot"></div>
            </div>
            <div className="card-content">
              <div className="card-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <div className="card-text">
                <div className="card-title">Action détectée</div>
                <div className="card-description">Faire le suivi avec l'équipe design</div>
              </div>
            </div>
          </div>
          
          <div className="floating-card card-2">
            <div className="card-header">
              <div className="card-dot"></div>
              <div className="card-dot"></div>
              <div className="card-dot"></div>
            </div>
            <div className="card-content">
              <div className="card-icon transcription">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                  <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                </svg>
              </div>
              <div className="card-text">
                <div className="card-title">Transcription en temps réel</div>
                <div className="typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Process Section - Replacing duplicated Features */}
      <section className="process-section">
        <div className="section-header">
          <h2>Comment ça marche ?</h2>
          <p>Une intelligence artificielle qui s'intègre parfaitement à votre flux de travail</p>
        </div>
        
        <div className="process-steps">
          <div className="process-step">
            <div className="step-number">01</div>
            <div className="step-content">
              <h3>Participez</h3>
              <p>Connectez votre calendrier. MEETIZY rejoint automatiquement vos appels Zoom, Teams ou Meet.</p>
            </div>
          </div>
          <div className="process-connector"></div>
          <div className="process-step">
            <div className="step-number">02</div>
            <div className="step-content">
              <h3>Oubliez la prise de notes</h3>
              <p>L'IA transcrit en temps réel et identifie les locuteurs, même dans les discussions techniques.</p>
            </div>
          </div>
          <div className="process-connector"></div>
          <div className="process-step">
            <div className="step-number">03</div>
            <div className="step-content">
              <h3>Recevez le plan d'action</h3>
              <p>Un rapport structuré avec décisions et to-do list est envoyé à votre équipe instantanément.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits / Impact Section */}
      <section className="benefits-section">
        <div className="benefit-card glass-panel">
          <div className="benefit-value">2h</div>
          <div className="benefit-label">Gagnées par jour</div>
          <p>Ne rédigez plus jamais de compte-rendu manuellement.</p>
        </div>
        <div className="benefit-card glass-panel">
          <div className="benefit-value">100%</div>
          <div className="benefit-label">Information capturée</div>
          <p>Plus aucun détail important perdu ou oublié.</p>
        </div>
        <div className="benefit-card glass-panel">
          <div className="benefit-value">x3</div>
          <div className="benefit-label">Exécution rapide</div>
          <p>Les équipes alignées livrent plus vite.</p>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2>Prêt à transformer vos réunions ?</h2>
          <p>Rejoignez des milliers d'équipes qui économisent déjà du temps avec MEETIZY</p>
          <button className="btn-cta" onClick={onGetStarted}>
            Commencer gratuitement
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>
      </section>
      <style jsx>{`
        /* Global Home Overrides */
        .home-page {
           padding-bottom: 80px;
        }

        .section-header {
           text-align: center;
           margin-bottom: 60px;
        }
        
        .section-header h2 {
           font-size: 36px;
           font-weight: 700;
           margin-bottom: 16px;
           color: var(--text);
        }
        
        .section-header p {
           color: var(--muted);
           font-size: 18px;
        }

        .process-section {
           padding: 100px 24px;
           max-width: 1200px;
           margin: 0 auto;
        }

        .process-steps {
           display: flex;
           justify-content: space-between;
           align-items: flex-start;
           position: relative;
           margin-top: 60px;
        }
        
        @media (max-width: 768px) {
           .process-steps {
              flex-direction: column;
              gap: 40px;
           }
           .process-connector {
              display: none;
           }
        }

        .process-step {
           flex: 1;
           display: flex;
           flex-direction: column;
           gap: 20px;
           position: relative;
           z-index: 2;
           padding-right: 20px;
        }
        
        .process-connector {
           flex: 0.5;
           height: 2px;
           background: linear-gradient(to right, var(--accent), transparent);
           margin-top: 24px;
           opacity: 0.3;
        }
        
        .step-number {
           font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
           font-size: 48px;
           font-weight: 700;
           color: rgba(56, 189, 248, 0.2);
           margin-bottom: -20px;
        }
        
        .step-content h3 {
           font-size: 24px;
           font-weight: 600;
           margin-bottom: 12px;
           color: var(--text);
        }
        
        .step-content p {
           color: var(--muted);
           line-height: 1.6;
           font-size: 16px;
        }

        .benefits-section {
           display: grid;
           grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
           gap: 32px;
           max-width: 1200px;
           margin: 0 auto 100px;
           padding: 0 24px;
        }
        
        .benefit-card {
           padding: 40px;
           text-align: center;
           border-radius: 24px;
           background: var(--panel); 
           border: 1px solid var(--border);
           transition: transform 0.3s ease;
           backdrop-filter: blur(10px);
        }
        
        .benefit-card:hover {
           transform: translateY(-5px);
           border-color: var(--accent);
           box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        
        .benefit-value {
           font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
           font-size: 48px;
           font-weight: 700;
           color: var(--accent);
           margin-bottom: 8px;
           line-height: 1;
        }
        
        .benefit-label {
           font-size: 14px;
           text-transform: uppercase;
           letter-spacing: 2px;
           color: var(--text);
           margin-bottom: 16px;
           font-weight: 600;
        }
        
        .benefit-card p {
           color: var(--muted);
           font-size: 16px;
        }
        
        /* CTA overrides */
        .cta-section {
           padding: 80px 24px;
           text-align: center;
           background: radial-gradient(circle at center, rgba(56, 189, 248, 0.1), transparent 70%);
        }
        
        .cta-content h2 {
           font-size: 42px;
           margin-bottom: 16px;
        }
        
        .btn-cta {
           display: inline-flex;
           align-items: center;
           gap: 12px;
           padding: 16px 32px;
           background: var(--primary);
           color: white;
           border: none;
           border-radius: 100px;
           font-size: 18px;
           font-weight: 600;
           cursor: pointer;
           margin-top: 32px;
           transition: all 0.2s;
           box-shadow: 0 0 20px rgba(56, 189, 248, 0.3);
        }
        
        .btn-cta:hover {
           transform: scale(1.05);
           box-shadow: 0 0 40px rgba(56, 189, 248, 0.5);
        }
      `}</style>
    </div>
  );
}
