import React, { useState } from 'react';
import { Book, Shield, Server, FileText, Activity, ArrowLeft, Cpu, Globe, Lock, Code } from 'lucide-react';

export default function ApiDocs({ onBack }) {
  const [activeTab, setActiveTab] = useState('overview');

  const menuItems = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: <Book size={18} /> },
    { id: 'capabilities', label: 'Capacités IA & Core', icon: <Cpu size={18} /> },
    { id: 'authentication', label: 'Authentification', icon: <Shield size={18} /> },
    { id: 'reference', label: 'Référence API', icon: <Code size={18} /> },
    { id: 'webhooks', label: 'Webhooks & Events', icon: <Globe size={18} /> }
  ];

  const renderContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <>
            <h1 className="doc-title">Plateforme Cortexia API</h1>
            <p className="doc-lead">
              L'API Cortexia expose toute la puissance de notre moteur d'intelligence artificielle conversationnelle aux développeurs et intégrateurs d'entreprise.
            </p>

            <section className="doc-section">
              <h2>Introduction</h2>
              <p>
                Cortexia n'est pas simplement un outil de transcription. C'est une plateforme d'analyse sémantique complète conçue pour transformer des flux audio non structurés (réunions, appels, conférences) en données structurées et exploitables par les systèmes d'information (ERP, CRM, GED).
              </p>
              <p>
                Cette documentation technique s'adresse aux DSI, architectes logiciels et développeurs souhaitant intégrer ces capacités d'analyse au cœur de leurs processus métier, garantissant ainsi une continuité de la donnée entre la parole et l'écrit.
              </p>
            </section>

            <section className="doc-section">
              <h2>Architecture de la Solution</h2>
              <p>
                L'infrastructure Cortexia est bâtie sur une architecture micro-services résiliente, permettant de traiter des volumes massifs de données audio en quasi temps réel.
              </p>
              <div className="features-grid">
                <div className="feature-card">
                  <h3>Ingestion</h3>
                  <p>Support des flux audio (WebSocket) et upload de fichiers asynchrones (WAV, MP3, M4A).</p>
                </div>
                <div className="feature-card">
                  <h3>Traitement (NLP/NLU)</h3>
                  <p>Pipelines de traitement IA : Diarisation (qui parle), Analyse de sentiment, Extraction d'entités nommées.</p>
                </div>
                <div className="feature-card">
                  <h3>Restitution</h3>
                  <p>API REST pour la récupération des métadonnées, résumés structurés et plans d'action.</p>
                </div>
              </div>
            </section>

            <section className="doc-section">
              <h2>Standards Techniques</h2>
              <p>
                Nous respectons les standards de l'industrie pour faciliter l'intégration :
              </p>
              <ul className="spec-list">
                <li><strong>API Architecture :</strong> RESTful (Representational State Transfer).</li>
                <li><strong>Format de données :</strong> JSON (application/json) pour toutes les requêtes et réponses.</li>
                <li><strong>Sécurité :</strong> TLS 1.3 obligatoire. Chiffrement AES-256 au repos.</li>
                <li><strong>Versioning :</strong> Les endpoints sont versionnés (e.g., <code>/v1/</code>) pour garantir la rétrocompatibilité.</li>
              </ul>
            </section>
          </>
        );

      case 'capabilities':
        return (
          <>
            <h1 className="doc-title">Capacités du Moteur IA</h1>
            <p className="doc-lead">Détail des traitements appliqués aux données par le moteur Cortexia.</p>

            <section className="doc-section">
              <h2>Diarisation & Identification</h2>
              <p>
                Le moteur est capable de distinguer les différents locuteurs dans un flux audio unique (Speaker Diarization).
                Couplé à votre annuaire d'entreprise, il peut réattribuer chaque phrase à un collaborateur précis.
              </p>
              <div className="technical-box">
                <div className="tech-label">Modèle de Donnée (Snippet)</div>
                <pre>{`{
  "speaker_id": "spk_01",
  "identity": "Jean Dupont",
  "confidence": 0.98,
  "segments": [ ... ]
}`}</pre>
              </div>
            </section>

            <section className="doc-section">
              <h2>Analyse Sémantique</h2>
              <p>
                Au-delà de la transcription littérale, Cortexia analyse le sens :
              </p>
              <ul className="data-list">
                <li><strong>Synthèse Contextuelle :</strong> Génération de résumé exécutif mettant en avant les décisions clés.</li>
                <li><strong>Analyse de Tonalité :</strong> Détection de l'ambiance de la réunion (Positive, Neutre, Tendue) basée sur la prosodie et le vocabulaire.</li>
                <li><strong>Détection de Sujets :</strong> Classification automatique des segments de discussion par thématique (Budget, RH, Technique, Commercial).</li>
              </ul>
            </section>

            <section className="doc-section">
              <h2>Extraction d'Actions (Task Mining)</h2>
              <p>
                L'IA identifie les engagements pris oralement ("Je vais envoyer le devis avant mardi").
                Ces éléments sont transformés en objets <code>Task</code> structurés contenant : un verbe d'action, un responsable, une échéance et un contexte.
              </p>
            </section>
          </>
        );

      case 'authentication':
        return (
          <>
            <h1 className="doc-title">Authentification</h1>
            <p className="doc-lead">Sécurisation des échanges via API Keys.</p>

            <section className="doc-section">
              <h2>Provisionning des Clés</h2>
              <p>
                L'authentification repose sur des jetons opaques (Bearer Tokens) à longue durée de vie, gérés directement depuis l'interface d'administration de votre instance Cortexia Enterprise.
                Ces clés disposent des droits "Scope:All" sur votre périmètre organisationnel.
              </p>
              <div className="warning-box">
                <Lock size={16} />
                <span>Les clés API donnent un accès administrateur à vos données. Elles doivent être stockées dans vos gestionnaires de secrets (Vault, AWS Secrets Manager, etc.).</span>
              </div>
            </section>

            <section className="doc-section">
              <h2>En-têtes HTTP</h2>
              <p>Toutes les requêtes doivent inclure l'en-tête suivant :</p>
              <div className="technical-box">
                <code>Authorization: Bearer sk_live_8932409...</code>
              </div>
            </section>
          </>
        );

      case 'reference':
        return (
          <>
            <h1 className="doc-title">Référence des Endpoints</h1>
            <p className="doc-lead">Catalogue des routes disponibles sur l'environnement de production.</p>

            <div className="endpoint-group">
              <h3>Sessions (Réunions)</h3>
              <div className="endpoint-card">
                <div className="endpoint-header">
                  <span className="method get">GET</span>
                  <span className="url">/v1/sessions</span>
                </div>
                <p>Récupère la liste paginée des sessions de l'organisation. Filtres disponibles par date, tags, et participants.</p>
              </div>
              <div className="endpoint-card">
                <div className="endpoint-header">
                  <span className="method get">GET</span>
                  <span className="url">/v1/sessions/:id/transcript</span>
                </div>
                <p>Télécharge la transcription brute au format JSON ou Text, avec horodatage à la milliseconde.</p>
              </div>
            </div>

            <div className="endpoint-group">
              <h3>Templates & Rapports</h3>
              <div className="endpoint-card">
                <div className="endpoint-header">
                  <span className="method post">POST</span>
                  <span className="url">/v1/reports/generate</span>
                </div>
                <p>Force la régénération d'un rapport PDF ou DOCX basé sur un template spécifique.</p>
              </div>
            </div>

            <div className="endpoint-group">
              <h3>Entités Organisationnelles</h3>
              <div className="endpoint-card">
                <div className="endpoint-header">
                  <span className="method get">GET</span>
                  <span className="url">/v1/org/members</span>
                </div>
                <p>Synchronisation de l'annuaire interne pour l'identification des locuteurs.</p>
              </div>
            </div>
          </>
        );
      
      case 'webhooks':
        return (
          <>
            <h1 className="doc-title">Webhooks (Event Driven)</h1>
            <p className="doc-lead">Notification push vers votre système d'information.</p>

            <section className="doc-section">
              <h2>Principe de fonctionnement</h2>
              <p>
                Plutôt que de solliciter l'API en boucle (Polling), configurez des Webhooks pour recevoir les données dès qu'elles sont disponibles.
                Cortexia effectuera une requête <code>POST</code> vers votre URL de callback configurée.
              </p>
            </section>

            <section className="doc-section">
              <h2>Événements Disponibles</h2>
              <table className="dark-table">
                <thead><tr><th>Event Name</th><th>Description</th></tr></thead>
                <tbody>
                  <tr>
                    <td><code>session.completed</code></td>
                    <td>Déclenché lorsque le traitement audio est terminé et que les données sont prêtes.</td>
                  </tr>
                  <tr>
                    <td><code>action.assigned</code></td>
                    <td>Déclenché lorsqu'une tâche est extraite et assignée à un utilisateur connu.</td>
                  </tr>
                  <tr>
                    <td><code>alert.compliance</code></td>
                    <td>Déclenché si des mots-clés sensibles définis dans vos règles de conformité sont détectés.</td>
                  </tr>
                </tbody>
              </table>
            </section>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="screen api-docs-dark">
      <div className="docs-layout">
        
        {/* SIDEBAR NAVIGATION */}
        <aside className="docs-nav">
           <div className="nav-header">
             CORTEXIA <span className="highlight">DEV</span>
           </div>
           <ul>
             {menuItems.map(item => (
                <li 
                  key={item.id} 
                  className={activeTab === item.id ? 'active' : ''}
                  onClick={() => setActiveTab(item.id)}
                >
                  {item.icon} 
                  <span>{item.label}</span>
                </li>
             ))}
           </ul>
           <div className="nav-footer">
             <button className="back-link" onClick={onBack}>
               <ArrowLeft size={14} /> Retour App
             </button>
           </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="docs-main">
           <div className="content-wrapper content-fade-in">
              {renderContent()}
           </div>
        </main>

      </div>

      <style jsx>{`
        .api-docs-dark {
          background: #0f172a; /* Slate 900 - Dark Base */
          min-height: 100vh;
          color: #e2e8f0;
          font-family: 'Inter', system-ui, sans-serif;
        }

        .docs-layout {
           display: flex;
           height: 100vh;
        }

        /* --- SIDEBAR --- */
        .docs-nav {
           width: 260px;
           background: #1e293b; /* Slate 800 */
           border-right: 1px solid #334155;
           display: flex;
           flex-direction: column;
           flex-shrink: 0;
           position: sticky;
           top: 0;
           height: 100vh;
        }

        .nav-header {
           padding: 24px;
           font-family: 'Orbitron';
           font-size: 14px;
           letter-spacing: 2px;
           color: #fff;
           border-bottom: 1px solid #334155;
        }
        .highlight { color: #38bdf8; }

        .docs-nav ul {
           list-style: none;
           padding: 20px 0;
           margin: 0;
           flex: 1;
        }

        .docs-nav li {
           padding: 14px 24px;
           cursor: pointer;
           display: flex;
           align-items: center;
           gap: 12px;
           font-size: 14px;
           color: #94a3b8;
           transition: all 0.2s;
           border-left: 2px solid transparent;
        }
        .docs-nav li:hover {
           background: rgba(56, 189, 248, 0.05);
           color: #fff;
        }
        .docs-nav li.active {
           background: rgba(56, 189, 248, 0.1);
           color: #38bdf8;
           border-left-color: #38bdf8;
           font-weight: 500;
        }

        .nav-footer {
           padding: 20px;
           border-top: 1px solid #334155;
        }
        .back-link {
           background: none;
           border: none;
           color: #64748b;
           font-size: 13px;
           cursor: pointer;
           display: flex;
           align-items: center;
           gap: 8px;
           transition: color 0.2s;
           padding: 0;
        }
        .back-link:hover { color: #fff; }

        /* --- MAIN CONTENT --- */
        .docs-main {
           flex: 1;
           height: 100vh;
           overflow-y: auto;
           background: #0f172a;
           padding: 0;
        }
        
        .content-wrapper {
           max-width: 960px;
           margin: 0 auto;
           padding: 60px 40px;
           padding-bottom: 100px;
        }

        h1.doc-title { 
           font-family: 'Orbitron'; 
           font-size: 32px; 
           margin-bottom: 16px; 
           color: #fff;
           text-shadow: 0 0 10px rgba(56, 189, 248, 0.3);
        }
        
        .doc-lead { 
           font-size: 18px; 
           color: #94a3b8; 
           line-height: 1.6; 
           margin-bottom: 48px; 
           border-bottom: 1px solid #334155; 
           padding-bottom: 24px; 
        }
        
        h2 { 
           font-size: 22px; 
           margin: 40px 0 24px; 
           color: #f1f5f9; 
           display: flex; 
           align-items: center; 
           gap: 12px;
           border-left: 4px solid #38bdf8;
           padding-left: 16px;
        }
        
        h3 { font-size: 16px; color: #38bdf8; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; }
        
        p { line-height: 1.7; color: #cbd5e1; margin-bottom: 16px; font-size: 15px; }
        strong { color: #fff; font-weight: 600; }

        /* -- CARDS -- */
        .features-grid {
           display: grid;
           grid-template-columns: repeat(3, 1fr);
           gap: 24px;
           margin-top: 24px;
        }
        .feature-card {
           background: #1e293b;
           padding: 20px;
           border-radius: 8px;
           border: 1px solid #334155;
        }
        .feature-card h3 { color: #fff; font-size: 16px; margin-bottom: 8px; text-transform: none; letter-spacing: 0; }
        .feature-card p { font-size: 14px; margin: 0; color: #94a3b8; }

        .spec-list, .data-list { margin-left: 20px; }
        .spec-list li, .data-list li { margin-bottom: 10px; color: #cbd5e1; }

        /* -- TECHNICAL BOXES -- */
        .technical-box {
           background: #020617;
           border: 1px solid #334155;
           border-radius: 6px;
           padding: 20px;
           margin: 20px 0;
           font-family: 'Fira Code', monospace;
           color: #a5b4fc;
           font-size: 14px;
        }
        .tech-label {
           color: #64748b; font-size: 11px; text-transform: uppercase; margin-bottom: 8px; font-family: sans-serif; font-weight: 700;
        }
        pre { white-space: pre-wrap; margin: 0; }
        code { color: #38bdf8; }

        /* -- ENDPOINTS -- */
        .endpoint-group { margin-bottom: 40px; }
        .endpoint-card {
           background: #1e293b;
           border-radius: 8px;
           border: 1px solid #334155;
           margin-bottom: 16px;
           overflow: hidden;
        }
        .endpoint-header {
           background: rgba(0,0,0,0.2);
           padding: 12px 20px;
           display: flex;
           align-items: center;
           gap: 16px;
           border-bottom: 1px solid #334155;
        }
        .endpoint-card p { padding: 16px 20px; margin: 0; font-size: 14px; color: #cbd5e1; }
        
        .method {
           font-size: 12px; font-weight: 800; padding: 4px 8px; border-radius: 4px; text-transform: uppercase; min-width: 60px; text-align: center;
        }
        .method.get { background: rgba(56, 189, 248, 0.2); color: #38bdf8; }
        .method.post { background: rgba(34, 197, 94, 0.2); color: #22c55e; }
        
        .url { font-family: 'Fira Code'; color: #fff; font-size: 14px; }

        /* -- WARNING BOX -- */
        .warning-box {
           background: rgba(234, 179, 8, 0.1);
           border: 1px solid rgba(234, 179, 8, 0.2);
           color: #fcd34d;
           padding: 16px;
           border-radius: 6px;
           display: flex;
           gap: 12px;
           align-items: flex-start;
           font-size: 14px;
        }

        /* -- TABLES -- */
        .dark-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
        .dark-table th { text-align: left; padding: 12px; border-bottom: 1px solid #475569; color: #94a3b8; font-size: 12px; text-transform: uppercase; }
        .dark-table td { padding: 16px 12px; border-bottom: 1px solid #334155; color: #e2e8f0; font-size: 14px; }
        .dark-table tr:last-child td { border-bottom: none; }
        .dark-table code { background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px; color: #fff; font-size: 13px; }

        .content-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
}
