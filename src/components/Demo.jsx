export default function Demo({ onGetStarted }) {
  return (
    <div className="screen demo-page">
      {/* HERO SECTION */}
      <div className="page-header">
        <div className="badge-new">DÉMONSTRATION INTERACTIVE</div>
        <h1>Voyez l'IA en Action <br/> <span className="text-gradient">Avant de l'Adopter</span></h1>
        <p>Découvrez comment MEETIZY transforme une heure de réunion en 2 minutes de lecture.</p>
      </div>

      <div className="demo-layout">
        {/* VIDEO AREA */}
        <div className="demo-showcase">
           <div className="video-container">
              {/* Option 1: Vidéo YouTube - Remplacez VIDEO_ID par votre ID YouTube */}
              <div className="video-wrapper">
                <iframe 
                  width="100%" 
                  height="100%" 
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?controls=1&modestbranding=1&rel=0"
                  title="Meetizy Demo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{
                    borderRadius: '12px',
                    boxShadow: '0 50px 100px -20px rgba(0,0,0,0.7)',
                    border: '1px solid rgba(56, 189, 248, 0.2)'
                  }}
                ></iframe>
              </div>
              
              {/* Alternative: Vidéo Locale (décommentez pour utiliser) */}
              {/* 
              <video 
                controls 
                poster="/path/to/thumbnail.jpg"
                style={{
                  width: '100%',
                  borderRadius: '12px',
                  boxShadow: '0 50px 100px -20px rgba(0,0,0,0.7)',
                  border: '1px solid rgba(56, 189, 248, 0.2)'
                }}
              >
                <source src="/path/to/demo-video.mp4" type="video/mp4" />
                Votre navigateur ne supporte pas la vidéo HTML5.
              </video>
              */}
           </div>
           
           {/* Video Info */}
           <div className="video-info">
              <div className="info-badge">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span>2 min de démo</span>
              </div>
              <p>Découvrez comment Meetizy transforme vos réunions en rapports exploitables</p>
           </div>
        </div>
        
        {/* INTERACTIVE STEPS */}
        <div className="demo-steps">
           <div className="step-card active">
              <div className="step-number">01</div>
              <div className="step-content">
                <h3>MEETIZY rejoint l'appel</h3>
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

        /* LAYOUT */
        .demo-layout {
           display: grid;
           grid-template-columns: 1.5fr 1fr;
           gap: 60px;
           margin-bottom: 100px;
           align-items: center;
        }

        /* VIDEO CONTAINER */
        .video-container {
           position: relative;
        }
        
        .video-wrapper {
           position: relative;
           padding-bottom: 56.25%; /* 16:9 aspect ratio */
           height: 0;
           overflow: hidden;
           border-radius: 12px;
           background: #0f172a;
        }
        
        .video-wrapper iframe {
           position: absolute;
           top: 0;
           left: 0;
           width: 100%;
           height: 100%;
        }
        
        .video-wrapper video {
           width: 100%;
           height: auto;
        }
        
        .video-info {
           margin-top: 24px;
           display: flex;
           flex-direction: column;
           gap: 12px;
        }
        
        .info-badge {
           display: inline-flex;
           align-items: center;
           gap: 8px;
           padding: 8px 16px;
           background: rgba(56, 189, 248, 0.1);
           border: 1px solid rgba(56, 189, 248, 0.3);
           border-radius: 20px;
           color: #38bdf8;
           font-size: 14px;
           font-weight: 600;
           width: fit-content;
        }
        
        .info-badge svg {
           flex-shrink: 0;
        }
        
        .video-info p {
           color: var(--muted);
           line-height: 1.6;
           font-size: 15px;
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
           font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display';
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
        .stat-val { font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display'; font-size: 48px; font-weight: 700; color: #fff; margin-bottom: 8px; }
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
           font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
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
