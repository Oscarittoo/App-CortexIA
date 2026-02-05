const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/components/Security.jsx');

const css = `
        .security-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 24px;
        }

        .page-header {
          text-align: center;
          margin-bottom: 60px;
        }

        .badge-new {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1px;
          border: 1px solid;
          margin-bottom: 24px;
        }

        .page-header h1 {
          font-family: 'Orbitron', sans-serif;
          font-size: 56px;
          font-weight: 800;
          line-height: 1.2;
          color: #ffffff;
          margin-bottom: 24px;
        }
        
        .text-gradient {
          background: linear-gradient(135deg, #10b981 0%, #3b82f6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .page-header p {
          font-size: 20px;
          color: var(--color-text-secondary);
          max-width: 700px;
          margin: 0 auto;
        }

        /* VISUAL */
        .security-visual {
           height: 300px;
           display: flex;
           justify-content: center;
           align-items: center;
           margin-bottom: 80px;
           position: relative;
        }
        
        .shield-container {
           position: relative;
           width: 120px;
           height: 120px;
           display: flex;
           align-items: center;
           justify-content: center;
        }
        
        .shield-ring {
           position: absolute;
           top: -20px; left: -20px; right: -20px; bottom: -20px;
           border: 2px dashed rgba(16, 185, 129, 0.3);
           border-radius: 50%;
           animation: spin 10s linear infinite;
        }
        
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        
        .shield-core {
           z-index: 2;
           filter: drop-shadow(0 0 20px rgba(16, 185, 129, 0.5));
        }
        
        .data-particles .particle {
           position: absolute;
           width: 8px; height: 8px;
           background: #10b981;
           border-radius: 50%;
           opacity: 0;
        }
        
        .p1 { animation: particle-in 2s infinite; top: -50px; left: 50%; }
        .p2 { animation: particle-in 2s infinite 0.5s; bottom: -50px; left: 20%; }
        .p3 { animation: particle-in 2s infinite 1s; top: 20%; right: -50px; }
        .p4 { animation: particle-in 2s infinite 1.5s; bottom: 20%; left: -60px; }
        
        @keyframes particle-in {
           0% { transform: scale(0); opacity: 0; }
           50% { opacity: 1; }
           100% { transform: scale(1) translate(0, 0); opacity: 0; }
        }

        /* GRID */
        .security-grid {
           display: grid;
           grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
           gap: 24px;
           margin-bottom: 80px;
        }
        
        .sec-card {
           background: #111827;
           border: 1px solid rgba(255,255,255,0.05);
           padding: 32px;
           border-radius: 16px;
           transition: all 0.3s;
        }
        
        .sec-card:hover {
           border-color: #10b981;
           transform: translateY(-5px);
           box-shadow: 0 10px 30px -10px rgba(16, 185, 129, 0.1);
        }
        
        .sec-icon {
           width: 48px; height: 48px;
           background: rgba(16, 185, 129, 0.1);
           border-radius: 12px;
           display: flex;
           align-items: center;
           justify-content: center;
           color: #10b981;
           margin-bottom: 20px;
        }
        
        .sec-card h3 {
           font-family: 'Orbitron';
           font-size: 18px;
           color: #fff;
           margin-bottom: 8px;
        }
        
        .sec-card p {
           color: #94a3b8;
           font-size: 14px;
           line-height: 1.6;
        }

        .cta-section { text-align: center; }
        
        .trust-badges {
           display: flex;
           justify-content: center;
           gap: 20px;
           margin-bottom: 40px;
           flex-wrap: wrap;
        }
        
        .badge {
           border: 1px solid #334155;
           padding: 12px 24px;
           border-radius: 8px;
           color: #cbd5e1;
           font-weight: 600;
           font-family: 'Orbitron';
        }
        
        .dpo-contact { color: #64748b; }
        .dpo-contact a { color: #10b981; text-decoration: none; }
`;

const jsxContent = `import { Shield, Lock, Server, FileCheck, Eye, Key } from 'lucide-react';

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
          <p>Hébergement 100% européen (Paris/Francfort). Droit à l'oubli natif.</p>
        </div>
        
        <div className="sec-card">
          <div className="sec-icon"><Eye size={24} /></div>
          <h3>Confidentialité IA</h3>
          <p>Nos modèles ne s'entraînent PAS sur vos données. Isolation stricte des contextes.</p>
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
         <p className="dpo-contact">Une question pour notre DPO ? <a href="#">privacy@meetizy.ai</a></p>
      </div>

      <style jsx>{\`\${css}\`}</style>
    </div>
  );
}
`;

fs.writeFileSync(filePath, jsxContent, 'utf8');
console.log('File written successfully');
