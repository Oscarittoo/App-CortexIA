import { Download, Chrome, Monitor, CheckCircle2, ExternalLink, ArrowLeft, Shield } from 'lucide-react';

export default function PluginInstall({ onBack }) {
  const handleDownloadPlugin = () => {
    // Créer un fichier manifest.json dynamiquement pour l'extension Chrome
    const manifest = {
      manifest_version: 3,
      name: "Meetizy Agent IA",
      version: "1.0.0",
      description: "Agent interactif IA pour assister vos réunions avec l'intelligence artificielle ChatGPT-4",
      permissions: [
        "activeTab",
        "storage",
        "tabs"
      ],
      host_permissions: [
        "https://meet.google.com/*",
        "https://teams.microsoft.com/*",
        "https://zoom.us/*"
      ],
      action: {
        default_popup: "popup.html",
        default_icon: {
          "16": "icon16.png",
          "48": "icon48.png",
          "128": "icon128.png"
        }
      },
      background: {
        service_worker: "background.js"
      },
      content_scripts: [
        {
          matches: [
            "https://meet.google.com/*",
            "https://teams.microsoft.com/*",
            "https://zoom.us/*"
          ],
          js: ["content.js"],
          css: ["content.css"]
        }
      ],
      icons: {
        "16": "icon16.png",
        "48": "icon48.png",
        "128": "icon128.png"
      }
    };

    const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'meetizy-plugin-manifest.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="screen plugin-install-page">
      {/* Header */}
      <div className="page-header">
        <button className="back-button" onClick={onBack}>
          <ArrowLeft size={20} />
          Retour
        </button>
        <div className="badge-new">AGENT IA INTERACTIF</div>
        <h1>Installez l'Agent <span className="text-gradient">Meetizy IA</span></h1>
        <p className="subtitle">
          Votre assistant intelligent qui transforme chaque réunion en une expérience augmentée par l'IA.
        </p>
      </div>

      {/* Installation Steps */}
      <div className="install-container">
        <div className="install-card main-card">
          <div className="card-icon">
            <Chrome size={48} />
          </div>
          <h2>Extension Navigateur (Recommandé)</h2>
          <p>Intégrez l'agent IA directement dans vos outils de visioconférence préférés.</p>
          
          <div className="features-list">
            <div className="feature-item">
              <CheckCircle2 size={20} className="check-icon" />
              <span>Compatible Google Meet, Microsoft Teams, Zoom</span>
            </div>
            <div className="feature-item">
              <CheckCircle2 size={20} className="check-icon" />
              <span>Transcription en temps réel pendant vos appels</span>
            </div>
            <div className="feature-item">
              <CheckCircle2 size={20} className="check-icon" />
              <span>Suggestions intelligentes avec ChatGPT-4</span>
            </div>
            <div className="feature-item">
              <CheckCircle2 size={20} className="check-icon" />
              <span>Synchronisation automatique avec Meetizy</span>
            </div>
          </div>

          <button className="btn-install" onClick={handleDownloadPlugin}>
            <Download size={20} />
            Télécharger l'extension Chrome
          </button>

          <div className="install-badge">
            <Shield size={16} />
            <span>100% sécurisé · RGPD conforme</span>
          </div>
        </div>

        {/* Installation Guide */}
        <div className="steps-section">
          <h3>Guide d'Installation</h3>
          
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h4>Télécharger l'extension</h4>
              <p>Cliquez sur le bouton ci-dessus pour télécharger le fichier manifest de l'extension.</p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h4>Ouvrir Chrome Extensions</h4>
              <p>Accédez à <code>chrome://extensions</code> dans votre navigateur Chrome ou Edge.</p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h4>Activer le Mode Développeur</h4>
              <p>Activez le commutateur "Mode développeur" en haut à droite de la page.</p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h4>Charger l'extension</h4>
              <p>Cliquez sur "Charger l'extension non empaquetée" et sélectionnez le dossier contenant les fichiers téléchargés.</p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">5</div>
            <div className="step-content">
              <h4>Connexion à Meetizy</h4>
              <p>L'extension se connectera automatiquement à votre compte Meetizy lors de votre prochaine réunion.</p>
            </div>
          </div>
        </div>

        {/* Alternative: Desktop App */}
        <div className="install-card secondary-card">
          <div className="card-icon secondary">
            <Monitor size={40} />
          </div>
          <h3>Application de Bureau</h3>
          <p>Utilisez Meetizy comme application autonome avec toutes les fonctionnalités.</p>
          
          <div className="download-options">
            <button className="btn-outline" disabled>
              <Download size={18} />
              Windows (Bientôt)
            </button>
            <button className="btn-outline" disabled>
              <Download size={18} />
              macOS (Bientôt)
            </button>
            <button className="btn-outline" disabled>
              <Download size={18} />
              Linux (Bientôt)
            </button>
          </div>
        </div>

        {/* Chrome Web Store */}
        <div className="webstore-card">
          <div className="webstore-content">
            <Chrome size={32} />
            <div>
              <h4>Chrome Web Store</h4>
              <p>L'extension sera bientôt disponible sur le Chrome Web Store pour une installation en un clic.</p>
            </div>
          </div>
          <button className="btn-link" disabled>
            <ExternalLink size={18} />
            Voir sur le Store (Bientôt)
          </button>
        </div>
      </div>

      <style jsx>{`
        .plugin-install-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 40px 24px 80px;
        }

        .page-header {
          text-align: center;
          margin-bottom: 80px;
        }

        .back-button {
          position: absolute;
          top: 100px;
          left: 40px;
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: var(--color-text-secondary);
          padding: 10px 20px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
        }

        .back-button:hover {
          background: rgba(255,255,255,0.1);
          color: var(--color-text-primary);
          transform: translateX(-4px);
        }

        .badge-new {
          display: inline-block;
          background: linear-gradient(135deg, #38bdf8, #0ea5e9);
          color: #000;
          padding: 6px 16px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1px;
          margin-bottom: 24px;
        }

        .page-header h1 {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
          font-size: 48px;
          font-weight: 700;
          color: #fff;
          margin-bottom: 16px;
          line-height: 1.2;
        }

        .text-gradient {
          background: linear-gradient(135deg, #38bdf8, #0ea5e9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .subtitle {
          font-size: 18px;
          color: var(--color-text-secondary);
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .install-container {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .install-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 24px;
          padding: 48px;
          transition: all 0.3s;
        }

        .main-card {
          border: 2px solid #38bdf8;
          box-shadow: 0 0 60px rgba(56, 189, 248, 0.2);
        }

        .secondary-card {
          padding: 32px;
        }

        .card-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #38bdf8, #0ea5e9);
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000;
          margin-bottom: 24px;
        }

        .card-icon.secondary {
          width: 60px;
          height: 60px;
          background: rgba(139, 92, 246, 0.2);
          color: #8b5cf6;
        }

        .install-card h2 {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
          font-size: 32px;
          color: #fff;
          margin-bottom: 12px;
        }

        .install-card h3 {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
          font-size: 24px;
          color: #fff;
          margin-bottom: 12px;
        }

        .install-card p {
          font-size: 16px;
          color: var(--color-text-secondary);
          line-height: 1.6;
          margin-bottom: 32px;
        }

        .features-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 32px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 15px;
          color: var(--color-text-primary);
        }

        .check-icon {
          color: #38bdf8;
          flex-shrink: 0;
        }

        .btn-install {
          background: linear-gradient(135deg, #38bdf8, #0ea5e9);
          color: #000;
          border: none;
          padding: 16px 32px;
          border-radius: 12px;
          font-size: 16px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 12px;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          width: 100%;
          max-width: 400px;
          margin: 0 auto 20px;
        }

        .btn-install:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(56, 189, 248, 0.4);
        }

        .install-badge {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: var(--color-text-secondary);
          font-size: 13px;
        }

        .steps-section {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 20px;
          padding: 40px;
        }

        .steps-section h3 {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
          font-size: 24px;
          color: #fff;
          margin-bottom: 32px;
          text-align: center;
        }

        .step {
          display: flex;
          gap: 20px;
          margin-bottom: 32px;
        }

        .step:last-child {
          margin-bottom: 0;
        }

        .step-number {
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #38bdf8, #0ea5e9);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #000;
          font-weight: 700;
          font-size: 18px;
          flex-shrink: 0;
        }

        .step-content h4 {
          font-size: 18px;
          color: #fff;
          margin-bottom: 8px;
        }

        .step-content p {
          font-size: 14px;
          color: var(--color-text-secondary);
          line-height: 1.6;
          margin: 0;
        }

        .step-content code {
          background: rgba(56, 189, 248, 0.1);
          color: #38bdf8;
          padding: 2px 8px;
          border-radius: 4px;
          font-family: 'SF Mono', monospace;
          font-size: 13px;
        }

        .download-options {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }

        .btn-outline {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.2);
          color: var(--color-text-secondary);
          padding: 12px 24px;
          border-radius: 10px;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: not-allowed;
          opacity: 0.5;
        }

        .webstore-card {
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.1), rgba(14, 165, 233, 0.05));
          border: 1px solid rgba(56, 189, 248, 0.2);
          border-radius: 16px;
          padding: 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
        }

        .webstore-content {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .webstore-content h4 {
          font-size: 18px;
          color: #fff;
          margin-bottom: 4px;
        }

        .webstore-content p {
          font-size: 14px;
          color: var(--color-text-secondary);
          margin: 0;
        }

        .btn-link {
          background: transparent;
          border: 1px solid rgba(56, 189, 248, 0.3);
          color: #38bdf8;
          padding: 10px 20px;
          border-radius: 8px;
          font-size: 14px;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: not-allowed;
          opacity: 0.6;
          white-space: nowrap;
        }

        @media (max-width: 768px) {
          .back-button {
            position: static;
            margin-bottom: 20px;
          }

          .page-header h1 {
            font-size: 36px;
          }

          .install-card, .secondary-card {
            padding: 32px 24px;
          }

          .steps-section {
            padding: 32px 20px;
          }

          .webstore-card {
            flex-direction: column;
            text-align: center;
          }

          .webstore-content {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}
