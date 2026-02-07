import { 
  Mic, 
  BrainCircuit, 
  ListTodo, 
  Search, 
  Share2, 
  Shield, 
  Zap, 
  BarChart3,
  CheckCircle2,
  Cpu
} from 'lucide-react';

export default function Features({ onGetStarted }) {
  return (
    <div className="screen features-page">
      {/* HERO SECTION */}
      <div className="page-header">
        <div className="badge-new">NOUVELLE GÉNÉRATION</div>
        <h1>L'Intelligence Artificielle <br/> <span className="text-gradient">Au Cœur de Vos Échanges</span></h1>
        <p>MEETIZY ne se contente pas d'écouter. Elle comprend, analyse et organise votre mémoire collective.</p>
      </div>
      
      {/* FEATURE 1: TRANSCRIPTION */}
      <div className="feature-block reverse">
        <div className="feature-content">
          <div className="feature-icon-lg cyan">
            <Mic size={32} />
          </div>
          <h2>Transcription Ultra-Précise</h2>
          <p>Notre moteur neural 'Whisper-High-Fidelity' capture chaque nuance de voix, même dans les environnements bruyants.</p>
          <ul className="feature-list">
            <li><CheckCircle2 size={16} /> Identification automatique des locuteurs</li>
            <li><CheckCircle2 size={16} /> Support de +50 langues et accents</li>
            <li><CheckCircle2 size={16} /> Ponctuation et grammaire corrigées</li>
          </ul>
        </div>
        <div className="feature-visual">
          <div className="visual-card-glass">
            <div className="wave-animation">
              {[...Array(20)].map((_, i) => (
                <div key={i} className="wave-bar" style={{ animationDelay: `${i * 0.1}s`, height: `${Math.random() * 60 + 20}%` }}></div>
              ))}
            </div>
            <div className="transcript-preview">
              <div className="msg msg-1">
                <div className="avatar">A</div>
                <div className="bubble">On valide le budget pour Q4 ?</div>
              </div>
              <div className="msg msg-2">
                <div className="avatar">B</div>
                <div className="bubble">Oui, proceed avec l'option B.</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURE 2: ANALYSE */}
      <div className="feature-block">
        <div className="feature-content">
          <div className="feature-icon-lg purple">
            <BrainCircuit size={32} />
          </div>
          <h2>Synthèse Cognitive</h2>
          <p>Ne relisez plus des heures de transcripts. Obtenez l'essence de vos réunions en quelques secondes.</p>
          <ul className="feature-list">
            <li><CheckCircle2 size={16} /> Résumés exécutifs structurés</li>
            <li><CheckCircle2 size={16} /> Détection de l'ambiance et du sentiment</li>
            <li><CheckCircle2 size={16} /> Extraction des décisions clés</li>
          </ul>
        </div>
        <div className="feature-visual">
          <div className="visual-card-glass" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div className="summary-line title"></div>
            <div className="summary-line full"></div>
            <div className="summary-line full"></div>
            <div className="summary-line part"></div>
            <div className="tags-row">
              <span className="tag-pill cyan">#Budget</span>
              <span className="tag-pill purple">#Marketing</span>
              <span className="tag-pill pink">#Q4</span>
            </div>
          </div>
        </div>
      </div>

      {/* FEATURE 3: ACTIONS */}
      <div className="feature-block reverse">
        <div className="feature-content">
          <div className="feature-icon-lg pink">
            <ListTodo size={32} />
          </div>
          <h2>Plan d'Action Automatisé</h2>
          <p>Transformez les parole en actes. MEETIZY détecte les engagements et crée vos tickets automatiquement.</p>
          <ul className="feature-list">
            <li><CheckCircle2 size={16} /> Extraction intelligente des tâches</li>
            <li><CheckCircle2 size={16} /> Assignation automatique aux membres</li>
            <li><CheckCircle2 size={16} /> Synchronisation Notion / Jira / Linear</li>
          </ul>
        </div>
        <div className="feature-visual">
          <div className="visual-card-glass">
            <div className="todo-item checked">
              <div className="checkbox"></div>
              <span>Envoyer le devis final</span>
            </div>
            <div className="todo-item">
              <div className="checkbox"></div>
              <span>Réserver la salle de conf</span>
            </div>
            <div className="todo-item">
              <div className="checkbox"></div>
              <span>Mettre à jour la roadmap</span>
            </div>
          </div>
        </div>
      </div>

      {/* ADDITIONAL GRID */}
      <h2 className="section-title">Tout ce dont vous avez besoin</h2>
      <div className="features-grid-mini">
        <div className="feature-mini">
           <Search className="mini-icon" />
           <h3>Recherche Sémantique</h3>
           <p>Retrouvez n'importe quel concept discuté, pas juste des mots-clés.</p>
        </div>
        <div className="feature-mini">
           <Share2 className="mini-icon" />
           <h3>Partage Facile</h3>
           <p>Envoyez des rapports par email ou lien public sécurisé en un clic.</p>
        </div>
        <div className="feature-mini">
           <Shield className="mini-icon" />
           <h3>Sécurité Bancaire</h3>
           <p>Chiffrement bout-en-bout et conformité RGPD par défaut.</p>
        </div>
         <div className="feature-mini">
           <BarChart3 className="mini-icon" />
           <h3>Analytics</h3>
           <p>Mesurez le temps de parole et l'efficacité de vos réunions.</p>
        </div>
      </div>
      
      <div className="cta-section">
        <div className="cta-card">
          <h2>Prêt à upgrader votre cerveau collectif ?</h2>
          <button className="btn-primary" onClick={onGetStarted}>
            Démarrer l'essai gratuit <Zap size={18} style={{marginLeft: 8}}/>
          </button>
        </div>
      </div>

      <style jsx>{`
        .features-page {
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
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
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
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
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
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          overflow: hidden;
        }

        /* ANIMATIONS & DECORS */
        .wave-animation {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          height: 60px;
          margin-bottom: 30px;
        }

        .wave-bar {
          width: 6px;
          background: #0ea5e9;
          border-radius: 4px;
          animation: wave 1s ease-in-out infinite;
        }

        @keyframes wave {
          0%, 100% { height: 20%; opacity: 0.5; }
          50% { height: 100%; opacity: 1; }
        }

        .transcript-preview .msg {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }
        .transcript-preview .avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #333;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: bold;
        }
        .transcript-preview .bubble {
          background: rgba(255,255,255,0.05);
          padding: 8px 16px;
          border-radius: 0 12px 12px 12px;
          font-size: 14px;
        }
        
        .todo-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: rgba(255,255,255,0.03);
          border-radius: 12px;
          margin-bottom: 12px;
        }
        .todo-item.checked {
          opacity: 0.5;
        }
        .todo-item .checkbox {
          width: 20px;
          height: 20px;
          border: 2px solid #e11d48;
          border-radius: 6px;
        }
        .todo-item.checked .checkbox {
          background: #e11d48;
        }

        .summary-line { height: 12px; background: rgba(255,255,255,0.1); border-radius: 6px; margin-bottom: 10px; }
        .summary-line.title { width: 60%; height: 20px; background: rgba(139, 92, 246, 0.4); margin-bottom: 20px; }
        .summary-line.full { width: 100%; }
        .summary-line.part { width: 80%; }
        
        .tags-row { display: flex; gap: 8px; margin-top: 20px; }
        .tag-pill { font-size: 12px; padding: 4px 12px; border-radius: 12px; }
        .tag-pill.cyan { background: rgba(14, 165, 233, 0.2); color: #0ea5e9; }
        .tag-pill.purple { background: rgba(139, 92, 246, 0.2); color: #8b5cf6; }
        .tag-pill.pink { background: rgba(225, 29, 72, 0.2); color: #e11d48; }

        /* MINI GRID */
        .section-title {
           text-align: center;
           font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
           font-size: 32px;
           margin-bottom: 60px;
           color: #fff;
        }

        .features-grid-mini {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 32px;
          margin-bottom: 120px;
        }

        .feature-mini {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          padding: 32px;
          border-radius: 20px;
          transition: all 0.3s;
        }
        .feature-mini:hover {
          background: rgba(255,255,255,0.05);
          transform: translateY(-5px);
        }
        
        .mini-icon {
          color: var(--color-text-tertiary);
          margin-bottom: 20px;
          width: 32px;
          height: 32px;
        }

        .feature-mini h3 { font-size: 18px; margin-bottom: 10px; color: #fff; }
        .feature-mini p { font-size: 14px; color: var(--color-text-secondary); line-height: 1.5; }

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
           font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
           font-size: 36px;
           color: #fff;
           margin-bottom: 32px;
        }

        @media (max-width: 1000px) {
          .feature-block, .feature-block.reverse {
            flex-direction: column;
            gap: 40px;
            text-align: center;
          }
          .feature-content h2, .feature-content p { text-align: center; }
          .feature-list { display: inline-block; text-align: left; }
          .feature-icon-lg { margin: 0 auto 32px; }
        }
      `}</style>
    </div>
  );
}
