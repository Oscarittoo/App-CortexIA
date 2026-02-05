import { 
  Video, 
  Calendar, 
  MessageSquare, 
  Database, 
  Layout, 
  CheckSquare, 
  ArrowRight,
  RefreshCw,
  Workflow
} from 'lucide-react';

export default function Integrations({ onGetStarted, onViewDocs }) {
  return (
    <div className="screen integrations-page">
      {/* HERO SECTION */}
      <div className="page-header">
        <div className="badge-new">ECOSYSTÈME UNIFIÉ</div>
        <h1>Connectez CORTEXIA <br/> <span className="text-gradient">À Votre Flux de Travail</span></h1>
        <p>Ne changez pas vos outils. CORTEXIA s'y greffe intelligemment pour enrichir vos données existantes.</p>
      </div>

      {/* CATEGORY 1: VIDEO CONFERENCING */}
      <div className="feature-block">
        <div className="feature-content">
          <div className="feature-icon-lg cyan">
            <Video size={32} />
          </div>
          <h2>Visio-Conférence Universelle</h2>
          <p>Que vous soyez sur Zoom, Teams ou Google Meet, CORTEXIA est là. Notre bot rejoint vos réunions en un clic.</p>
          <ul className="feature-list">
             <li><div className="logo-pill zoom">Zoom</div> Intégration native</li>
             <li><div className="logo-pill teams">Teams</div> Bot certifié Microsoft</li>
             <li><div className="logo-pill google">Meet</div> Extension Chrome</li>
          </ul>
        </div>
        <div className="feature-visual">
           <div className="visual-card-glass">
             <div className="connection-diagram">
                <div className="central-node"><div className="brain-pulse"></div></div>
                <div className="satellite sat-1"><Video size={20}/></div>
                <div className="satellite sat-2"><Video size={20}/></div>
                <div className="satellite sat-3"><Video size={20}/></div>
                <div className="orbit-line"></div>
             </div>
             <div className="status-label">Synchro Active</div>
           </div>
        </div>
      </div>

      {/* CATEGORY 2: PRODUCTIVITY & DOCS */}
      <div className="feature-block reverse">
        <div className="feature-content">
          <div className="feature-icon-lg purple">
            <Database size={32} />
          </div>
          <h2>Votre Knowledge Base, Enrichie</h2>
          <p>Les comptes-rendus ne meurent plus dans une boîte mail. Ils alimentent directement votre documentation d'entreprise.</p>
          <ul className="feature-list">
             <li><div className="logo-pill notion">Notion</div> Création de pages auto</li>
             <li><div className="logo-pill linear">Linear</div> Création de tickets</li>
             <li><div className="logo-pill slack">Slack</div> Résumés dans les channels</li>
          </ul>
        </div>
        <div className="feature-visual">
           <div className="visual-card-glass">
              <div className="pipeline-anim">
                 <div className="pipe-box source">Meeting</div>
                 <div className="pipe-line"><div className="data-packet"></div></div>
                 <div className="pipe-box dest">Notion</div>
              </div>
              <div className="pipeline-anim delay-1">
                 <div className="pipe-box source">Action</div>
                 <div className="pipe-line"><div className="data-packet"></div></div>
                 <div className="pipe-box dest">Jira</div>
              </div>
           </div>
        </div>
      </div>

      {/* CATEGORY 3: CALENDAR & CRM */}
      <div className="feature-block">
        <div className="feature-content">
          <div className="feature-icon-lg pink">
            <Calendar size={32} />
          </div>
          <h2>Calendrier & CRM Intelligent</h2>
          <p>Préparez vos réunions client avec le contexte complet. CORTEXIA remonte l'historique avant même que vous ne disiez bonjour.</p>
           <ul className="feature-list">
             <li><div className="logo-pill hubspot">HubSpot</div> Notes dans les fiches contacts</li>
             <li><div className="logo-pill salesforce">Salesforce</div> Mise à jour des opportunités</li>
             <li><div className="logo-pill outlook">Outlook</div> Préparation de réunion auto</li>
          </ul>
        </div>
        <div className="feature-visual">
           <div className="visual-card-glass">
              <div className="crm-card">
                 <div className="crm-header"></div>
                 <div className="crm-body">
                    <div className="crm-row"></div>
                    <div className="crm-row highlight"><div className="pulse-dot"></div> + Note ajoutée</div>
                    <div className="crm-row"></div>
                 </div>
              </div>
           </div>
        </div>
      </div>
      
       <div className="cta-section">
        <div className="cta-card">
          <h2>Plus de 50 intégrations disponibles</h2>
          <p style={{marginBottom: '30px', color: '#94a3b8'}}>Et une API ouverte pour vos outils maison.</p>
          <div className="api-preview">
             <code>POST /api/v1/webhooks/meeting-end</code>
          </div>
          <button className="btn-primary" onClick={onViewDocs} style={{marginTop: '30px'}}>
            Explorer la documentation API <Workflow size={18} style={{marginLeft: 8}}/>
          </button>
        </div>
      </div>

      <style jsx>{`
        .integrations-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 24px;
        }

        .page-header {
          text-align: center;
          margin-bottom: 120px;
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
          font-size: 42px;
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
          max-width: 700px;
          margin: 0 auto;
          line-height: 1.6;
        }

        /* FEATURE BLOCKS */
        .feature-block {
          display: flex;
          align-items: center;
          gap: 80px;
          margin-bottom: 160px;
        }

        .feature-block.reverse {
          flex-direction: row-reverse;
        }

        .feature-content {
          flex: 1;
        }

        .feature-icon-lg {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 32px;
          box-shadow: 0 0 40px rgba(0,0,0,0.2);
        }

        .feature-icon-lg.cyan { background: rgba(14, 165, 233, 0.1); border: 1px solid rgba(14, 165, 233, 0.3); color: #0ea5e9; }
        .feature-icon-lg.purple { background: rgba(139, 92, 246, 0.1); border: 1px solid rgba(139, 92, 246, 0.3); color: #8b5cf6; }
        .feature-icon-lg.pink { background: rgba(225, 29, 72, 0.1); border: 1px solid rgba(225, 29, 72, 0.3); color: #e11d48; }

        .feature-content h2 {
          font-family: 'Orbitron', sans-serif;
          font-size: 36px;
          color: #ffffff;
          margin-bottom: 20px;
        }

        .feature-content p {
          font-size: 18px;
          color: var(--color-text-secondary);
          line-height: 1.6;
          margin-bottom: 32px;
        }

        .feature-list {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .feature-list li {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 16px;
          color: var(--color-text-primary);
          font-size: 16px;
        }

        .logo-pill {
            padding: 4px 10px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 700;
            width: 80px;
            text-align: center;
        }
        .logo-pill.zoom { background: #2D8CFF; color: white; }
        .logo-pill.teams { background: #6264A7; color: white; }
        .logo-pill.google { background: #EA4335; color: white; }
        .logo-pill.notion { background: #000000; color: white; border: 1px solid #333; }
        .logo-pill.linear { background: #5E6AD2; color: white; }
        .logo-pill.slack { background: #4A154B; color: white; }
        .logo-pill.hubspot { background: #FF7A59; color: white; }
        .logo-pill.salesforce { background: #00A1E0; color: white; }
        .logo-pill.outlook { background: #0078D4; color: white; }


        .feature-visual {
          flex: 1;
          display: flex;
          justify-content: center;
        }

        .visual-card-glass {
          width: 100%;
          max-width: 500px;
          aspect-ratio: 4/3;
          background: linear-gradient(145deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
          border: 1px solid rgba(255,255,255,0.05);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 40px;
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          overflow: hidden;
        }

        /* ORBIT ANIMATION */
        .connection-diagram { position: relative; width: 200px; height: 200px; display: flex; justify-content: center; align-items: center; }
        .central-node { width: 60px; height: 60px; background: rgba(14, 165, 233, 0.2); border-radius: 50%; position: relative; z-index: 2; border: 1px solid #0ea5e9; }
        .orbit-line { position: absolute; width: 100%; height: 100%; border: 1px dashed rgba(255,255,255,0.1); border-radius: 50%; opacity: 0.5; }
        
        .satellite { 
            position: absolute; 
            width: 40px; 
            height: 40px; 
            background: rgba(255,255,255,0.05); 
            border-radius: 50%; 
            display: flex; 
            align-items: center; 
            justify-content: center;
            border: 1px solid rgba(255,255,255,0.1);
            color: #ccc;
        }
        .sat-1 { top: 0; left: 50%; transform: translate(-50%, -50%); animation: orbit 10s linear infinite; transform-origin: 50% 100px; }
        .sat-2 { top: 75%; left: 93%; transform: translate(-50%, -50%); animation: orbit 10s linear infinite; animation-delay: -3.3s; transform-origin: -75px -35px; } /* Simplifed Orbit Visual just specifically placed for static look or basic css anim */
        
        /* Simpler pulse animation for central node */
        .brain-pulse { width: 100%; height: 100%; border-radius: 50%; box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.7); animation: pulse 2s infinite; }

        .status-label { margin-top: 20px; font-family: 'Orbitron'; font-size: 14px; color: #0ea5e9; letter-spacing: 2px; }

        /* PIPELINE ANIMATION */
        .pipeline-anim { width: 100%; display: flex; align-items: center; gap: 10px; margin-bottom: 20px; }
        .pipe-box { padding: 10px 20px; background: rgba(255,255,255,0.05); border-radius: 8px; font-size: 14px; border: 1px solid rgba(255,255,255,0.1); width: 80px; text-align: center; }
        .pipe-line { flex: 1; height: 2px; background: rgba(255,255,255,0.1); position: relative; }
        .data-packet { width: 20px; height: 4px; background: #8b5cf6; position: absolute; top: -1px; animation: flow 2s infinite ease-in-out; border-radius: 2px; }
        .delay-1 .data-packet { animation-delay: 1s; }

        @keyframes flow {
            0% { left: 0; width: 0; opacity: 0; }
            20% { width: 20px; opacity: 1; }
            80% { width: 20px; opacity: 1; }
            100% { left: 100%; width: 0; opacity: 0; }
        }

        /* CRM CARD */
        .crm-card { width: 100%; padding: 20px; background: rgba(0,0,0,0.2); border-radius: 12px; }
        .crm-header { height: 10px; width: 30%; background: rgba(255,255,255,0.1); border-radius: 5px; margin-bottom: 20px; }
        .crm-row { height: 40px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; align-items: center; padding-left: 10px; font-size: 12px; color: rgba(255,255,255,0.5); }
        .crm-row.highlight { background: rgba(225, 29, 72, 0.1); border: 1px solid rgba(225, 29, 72, 0.3); border-radius: 6px; color: #fff; border-bottom: none; }
        .pulse-dot { width: 8px; height: 8px; background: #e11d48; border-radius: 50%; margin-right: 10px; box-shadow: 0 0 10px #e11d48; }


        .cta-card {
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          border-radius: 32px;
          padding: 80px;
          text-align: center;
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1);
        }
        
        .cta-card h2 {
           font-family: 'Orbitron', sans-serif;
           font-size: 36px;
           color: #fff;
           margin-bottom: 20px;
        }

        .api-preview {
            background: #000;
            padding: 15px 30px;
            border-radius: 8px;
            display: inline-block;
            border: 1px solid #333;
            font-family: 'Courier New', monospace;
            color: #10b981;
        }

        @media (max-width: 1000px) {
          .feature-block, .feature-block.reverse {
            flex-direction: column;
            gap: 40px;
            text-align: center;
          }
          .visual-card-glass { aspect-ratio: 16/9; }
        }
      `}</style>
    </div>
  );
}
