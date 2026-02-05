import { Shield, Lock, Server, FileCheck, Eye, Key } from 'lucide-react';

export default function Security({ onGetStarted }) {
  return (
    <div className="screen security-page">
      {/* HERO */}
      <div className="page-header">
         <div className="badge-new" style={{color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)', background: 'rgba(16, 185, 129, 0.1)'}}>
            INFRASTRUCTURE CERTIFIÉE
         </div>
        <h1>Vos Données, <br/> <span className="text-gradient">Notre Priorité Absolue</span></h1>
        <p>Une architecture Zero-Trust conçue pour les entreprises les plus exigeantes.</p>
      </div>

      <div className="security-visual">
         <div className="shield-container">
            <div className="shield-ring"></div>
            <div className="shield-core">
               <Shield size={64} color="#10b981" fill="rgba(16, 185, 129, 0.2)" />
            </div>
            <div className="data-particles">
               <div className="particle p1"></div>
               <div className="particle p2"></div>
               <div className="particle p3"></div>
               <div className="particle p4"></div>
            </div>
         </div>
      </div>

      <div className="security-grid">
        <div className="sec-card">
          <div className="sec-icon"><Lock size={24} /></div>
          <h3>Chiffrement Militaire</h3>
          <p>AES-256 au repos et TLS 1.3 en transit. Vos clés sont gérées via HSM dédié.</p>
        </div>

        <div className="sec-card">
          <div className="sec-icon"><FileCheck size={24} /></div>
          <h3>Conformité RGPD</h3>
          <p>Hébergement 100% européen (Paris/Francfort). Droit à l\'oubli natif.</p>
        </div>

        <div className="sec-card">
          <div className="sec-icon"><Eye size={24} /></div>
          <h3>Confidentialité IA</h3>
          <p>Nos modèles ne s\'entraînent PAS sur vos données. Isolation stricte des contextes.</p>
        </div>

        <div className="sec-card">
          <div className="sec-icon"><Key size={24} /></div>
          <h3>Auth & SSO</h3>
          <p>Support SAML 2.0, Okta, et Azure AD. MFA forcée pour les administrateurs.</p>
        </div>

        <div className="sec-card">
          <div className="sec-icon"><Server size={24} /></div>
          <h3>SOC 2 Type II</h3>
          <p>Audités annuellement. Rapports de pénétration disponibles sur demande NDA.</p>
        </div>
      </div>

      <div className="cta-section">
         <div className="trust-badges">
            <div className="badge">ISO 27001</div>
            <div className="badge">GDPR Ready</div>
            <div className="badge">SOC 2</div>
         </div>
         <p className="dpo-contact">Une question pour notre DPO ? <a href="#">privacy@cortexia.ai</a></p>
      </div>

      <style jsx>{`${css}`}</style>
    </div>
  );
}
