export default function Demo({ onGetStarted }) {
  return (
    <div className="screen demo-page">
      {/* HERO SECTION */}
      <div className="page-header">
        <div className="badge-new">DÉMONSTRATION INTERACTIVE</div>
        <h1>Voyez l'IA en Action <br/> <span className="text-gradient">Avant de l'Adopter</span></h1>
        <p>Découvrez comment CORTEXIA transforme une heure de réunion en 2 minutes de lecture.</p>
      </div>

      <div className="demo-layout">
        {/* VIDEO / MOCKUP AREA */}
        <div className="demo-showcase">
           <div className="mac-window">
              <div className="mac-header">
                <div className="dots">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>
                <div className="address-bar">cortexia.ai/dashboard/meeting-report/1239</div>
              </div>
              <div className="mockup-content">
                 <div className="mock-grid">
                    <div className="mock-sidebar">
                       <div className="mock-item active"></div>
                       <div className="mock-item"></div>
                       <div className="mock-item"></div>
                    </div>
                    <div className="mock-main">
                       <div className="mock-hero">
                          <div className="mock-avatar-group">
                             <div className="mock-av" style={{background: '#e11d48'}}>A</div>
                             <div className="mock-av" style={{background: '#0ea5e9'}}>B</div>
                             <div className="mock-av" style={{background: '#8b5cf6'}}>C</div>
                          </div>
                          <div className="mock-title">Strategy Q4 - Review</div>
                       </div>
                       <div className="mock-transcript">
                          <div className="mock-bubble left">
                             <div className="mock-line" style={{width: '90%'}}></div>
                             <div className="mock-line" style={{width: '60%'}}></div>
                          </div>
                          <div className="mock-bubble right">
                             <div className="mock-line" style={{width: '80%'}}></div>
                             <div className="mock-highlight">Action: Update the budget for Marketing</div>
                          </div>
                       </div>
                       <div className="mock-summary-card">
                          <div className="mock-card-title">Résumé Exécutif</div>
                          <div className="mock-line" style={{width: '100%', marginBottom: 8}}></div>
                          <div className="mock-line" style={{width: '95%', marginBottom: 8}}></div>
                          <div className="mock-line" style={{width: '80%'}}></div>
                       </div>
                    </div>
                 </div>
                 
                 {/* Play Overlay */}
                 <div className="play-overlay">
                    <button className="play-btn-pulse">
                      <svg width="30" height="30" viewBox="0 0 24 24" fill="white" stroke="none">
                        <path d="M5 3l14 9-14 9V3z"/>
                      </svg>
                    </button>
                    <span>Lancer la visite guidée (2 min)</span>
                 </div>
              </div>
           </div>
        </div>
        
        {/* INTERACTIVE STEPS */}
        <div className="demo-steps">
           <div className="step-card active">
              <div className="step-number">01</div>
              <div className="step-content">
                <h3>CORTEXIA rejoint l'appel</h3>
                <p>Pas de logiciel à installer. Notre bot rejoint vos Zooms comme un participant silencieux.</p>
              </div>
              <div className="step-status">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                   <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                   <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
           </div>
           
           <div className="step-card">
              <div className="step-number">02</div>
              <div className="step-content">
                <h3>Analyse en Temps Réel</h3>
                <p>Transcription, identification des voix et prise de notes se font en live.</p>
              </div>
           </div>
           
           <div className="step-card">
              <div className="step-number">03</div>
              <div className="step-content">
                <h3>Livraison Instantanée</h3>
                <p>Le rapport arrive dans votre boite mail et sur Notion 10 secondes après la fin.</p>
              </div>
           </div>
        </div>
      </div>
      
      {/* SOCIAL PROOF */}
      <div className="stats-strip">
         <div className="stat-box">
            <div className="stat-val">2.5h</div>
            <div className="stat-lbl">Gagnées par jour</div>
         </div>
         <div className="stat-divider"></div>
         <div className="stat-box">
            <div className="stat-val">99%</div>
            <div className="stat-lbl">Précision Transcript</div>
         </div>
         <div className="stat-divider"></div>
         <div className="stat-box">
            <div className="stat-val">GDPR</div>
            <div className="stat-lbl">Conforme & Sécurisé</div>
         </div>
      </div>

      <div className="cta-section">
        <div className="cta-card">
          <h2>Prêt à voir vos propres données ?</h2>
          <button className="btn-primary" onClick={onGetStarted}>
            Réserver une démo personnalisée 
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{marginLeft: 8}}>
               <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
               <line x1="16" y1="2" x2="16" y2="6"></line>
               <line x1="8" y1="2" x2="8" y2="6"></line>
               <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </button>
        </div>
      </div>

      <style jsx>{`
        .demo-page {
          max-width: 1200px;
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

        /* LAYOUT */
        .demo-layout {
           display: grid;
           grid-template-columns: 1.5fr 1fr;
           gap: 60px;
           margin-bottom: 100px;
           align-items: center;
        }

        /* MAC WINDOW MOCKUP */
        .mac-window {
           background: #0f172a;
           border: 1px solid rgba(255,255,255,0.1);
           border-radius: 12px;
           box-shadow: 0 50px 100px -20px rgba(0,0,0,0.5);
           overflow: hidden;
           position: relative;
        }
        
        .mac-header {
           background: rgba(255,255,255,0.05);
           padding: 12px 16px;
           display: flex;
           align-items: center;
           border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        
        .dots { display: flex; gap: 8px; }
        .dot { width: 12px; height: 12px; border-radius: 50%; }
        .red { background: #ff5f56; }
        .yellow { background: #ffbd2e; }
        .green { background: #27c93f; }
        
        .address-bar {
           flex: 1;
           margin: 0 20px;
           background: rgba(0,0,0,0.3);
           padding: 4px 12px;
           border-radius: 6px;
           font-size: 12px;
           color: #94a3b8;
           text-align: center;
        }

        .mock-grid { display: flex; height: 400px; }
        .mock-sidebar { width: 60px; border-right: 1px solid rgba(255,255,255,0.05); padding: 20px 0; display: flex; flex-direction: column; align-items: center; gap: 15px; }
        .mock-item { width: 32px; height: 32px; background: rgba(255,255,255,0.1); border-radius: 8px; }
        .mock-item.active { background: #0ea5e9; }
        
        .mock-main { flex: 1; padding: 20px; background: #0b1120; }
        
        .mock-hero { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .mock-avatar-group { display: flex; }
        .mock-av { width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold; border: 2px solid #0b1120; margin-left: -10px; color: white; }
        .mock-av:first-child { margin-left: 0; }
        .mock-title { font-family: 'Orbitron'; font-size: 14px; color: #fff; }
        
        .mock-transcript { margin-bottom: 30px; }
        .mock-bubble { background: rgba(255,255,255,0.05); padding: 15px; border-radius: 12px; margin-bottom: 10px; max-width: 80%; }
        .mock-bubble.right { background: rgba(14, 165, 233, 0.1); margin-left: auto; }
        .mock-line { height: 8px; background: rgba(255,255,255,0.1); border-radius: 4px; margin-bottom: 8px; }
        .mock-highlight { font-size: 12px; color: #0ea5e9; font-weight: bold; background: rgba(14, 165, 233, 0.1); padding: 4px 8px; border-radius: 4px; display: inline-block; }
        
        .mock-summary-card { background: rgba(139, 92, 246, 0.05); border: 1px solid rgba(139, 92, 246, 0.2); padding: 20px; border-radius: 12px; }
        .mock-card-title { font-size: 12px; color: #8b5cf6; font-weight: bold; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; }

        .play-overlay {
           position: absolute;
           top: 0; left: 0; width: 100%; height: 100%;
           background: rgba(15, 23, 42, 0.6);
           backdrop-filter: blur(4px);
           display: flex;
           flex-direction: column;
           align-items: center;
           justify-content: center;
           gap: 20px;
           transition: all 0.3s;
           cursor: pointer;
        }
        .play-overlay:hover { background: rgba(15, 23, 42, 0.4); }
        .play-overlay:hover .play-btn-pulse { transform: scale(1.1); }
        
        .play-btn-pulse {
           width: 80px; height: 80px;
           border-radius: 50%;
           background: linear-gradient(135deg, #0ea5e9, #e11d48);
           border: none;
           display: flex;
           align-items: center;
           justify-content: center;
           box-shadow: 0 0 0 0 rgba(225, 29, 72, 0.7);
           animation: pulse-red 2s infinite;
           cursor: pointer;
           transition: transform 0.3s;
        }
        .play-icon { margin-left: 5px; }

        @keyframes pulse-red {
          0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(225, 29, 72, 0.7); }
          70% { transform: scale(1); box-shadow: 0 0 0 20px rgba(225, 29, 72, 0); }
          100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(225, 29, 72, 0); }
        }

        /* STEPS */
        .demo-steps { display: flex; flex-direction: column; gap: 20px; }
        
        .step-card {
           background: var(--panel);
           border: 1px solid var(--border);
           padding: 24px;
           border-radius: 16px;
           display: flex;
           gap: 20px;
           align-items: flex-start;
           transition: all 0.3s;
           position: relative;
           overflow: hidden;
        }
        
        .step-card.active {
           border-color: #0ea5e9;
           background: rgba(14, 165, 233, 0.05);
        }
        
        .step-number {
           font-family: 'Orbitron';
           font-size: 24px;
           font-weight: bold;
           color: var(--muted);
           opacity: 0.3;
        }
        .step-card.active .step-number { color: #0ea5e9; opacity: 1; }
        
        .step-content h3 { font-size: 18px; color: #fff; margin-bottom: 8px; }
        .step-content p { font-size: 14px; color: var(--color-text-secondary); margin: 0; line-height: 1.5; }
        
        .step-status { margin-left: auto; color: #0ea5e9; }

        /* STATS STRIP */
        .stats-strip {
           display: flex;
           justify-content: space-between;
           background: #1e293b;
           border-radius: 20px;
           padding: 40px;
           margin-bottom: 100px;
           border: 1px solid rgba(255,255,255,0.05);
        }
        
        .stat-box { text-align: center; flex: 1; }
        .stat-val { font-family: 'Orbitron'; font-size: 48px; font-weight: 700; color: #fff; margin-bottom: 8px; }
        .stat-lbl { color: #94a3b8; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; }
        
        .stat-divider { width: 1px; background: rgba(255,255,255,0.1); height: 80px; }

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

        @media (max-width: 1000px) {
           .demo-layout { grid-template-columns: 1fr; }
           .stats-strip { flex-direction: column; gap: 40px; }
           .stat-divider { height: 1px; width: 100%; }
        }
      `}</style>
    </div>
  );
}
