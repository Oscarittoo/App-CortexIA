import { useState, useEffect } from 'react';
import exportService from '../utils/export';

export default function SessionReport({ data, onNewSession, onEdit }) {
  const [summary, setSummary] = useState('');
  const [actions, setActions] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [followUpEmail, setFollowUpEmail] = useState('');
  const [isGenerating, setIsGenerating] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    generateReport();
  }, []);

  const generateReport = async () => {
    setIsGenerating(true);
    
    setTimeout(() => {
      // Récupérer la transcription complète
      const fullTranscript = data.transcript
        ?.map(t => t.text)
        .join(' ') || '';
      
      // Extraire actions et décisions depuis la transcription
      const extractedActions = extractActions(fullTranscript);
      const extractedDecisions = extractDecisions(fullTranscript);
      
      setSummary(`Résumé de la réunion du ${new Date().toLocaleDateString('fr-FR')}

Durée : ${formatDuration(data.duration)}
Langue : ${data.language === 'fr' ? 'Français' : 'English'}

## Transcription complète

${fullTranscript || 'Aucune transcription disponible'}

## Points clés

${extractKeyPoints(fullTranscript)}`);

      setActions(extractedActions);
      setDecisions(extractedDecisions);

      setFollowUpEmail(`Objet : Compte-rendu - ${data.title || 'Réunion'}

Bonjour,

Voici le récapitulatif de notre réunion du ${new Date().toLocaleDateString('fr-FR')}.

TRANSCRIPTION
${fullTranscript.substring(0, 500)}${fullTranscript.length > 500 ? '...' : ''}

DÉCISIONS
${extractedDecisions.map(d => `• ${d.text}`).join('\n')}

ACTIONS
${extractedActions.map(a => `• ${a.task} - ${a.responsible} (${new Date(a.deadline).toLocaleDateString('fr-FR')})`).join('\n')}

Cordialement`);

      setIsGenerating(false);
    }, 2000);
  };

  const extractKeyPoints = (text) => {
    if (!text) return '• Aucun point clé détecté';
    
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20);
    return sentences.slice(0, 5).map(s => `• ${s.trim()}`).join('\n') || '• Aucun point clé détecté';
  };

  const extractActions = (text) => {
    if (!text) return [];
    
    const actionWords = ['doit', 'va', 'devra', 'faut', 'il faut', 'besoin', 'action', 'faire', 'réaliser', 'tâche'];
    const sentences = text.toLowerCase().split(/[.!?]+/);
    const actions = [];
    
    sentences.forEach((sentence, idx) => {
      if (actionWords.some(word => sentence.includes(word))) {
        actions.push({
          id: idx,
          task: sentence.trim().substring(0, 80),
          responsible: 'À définir',
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +7 jours
          priority: 'Moyenne'
        });
      }
    });
    
    return actions.length > 0 ? actions.slice(0, 5) : [
      { id: 1, task: 'Aucune action détectée dans la transcription', responsible: 'À définir', deadline: new Date().toISOString().split('T')[0], priority: 'Basse' }
    ];
  };

  const extractDecisions = (text) => {
    if (!text) return [];
    
    const decisionWords = ['décidé', 'décision', 'choisi', 'validé', 'approuvé', 'accord', 'convenu', 'retenu'];
    const sentences = text.toLowerCase().split(/[.!?]+/);
    const decisions = [];
    
    sentences.forEach((sentence, idx) => {
      if (decisionWords.some(word => sentence.includes(word))) {
        decisions.push({
          id: idx,
          text: sentence.trim().substring(0, 100),
          impact: 'Général'
        });
      }
    });
    
    return decisions.length > 0 ? decisions.slice(0, 5) : [
      { id: 1, text: 'Aucune décision détectée dans la transcription', impact: 'Général' }
    ];
  };

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}min`;
    return `${mins} minutes`;
  };

  const handleExportMd = () => {
    const content = `# Compte-rendu de réunion
${new Date().toLocaleDateString('fr-FR')}

${summary}

## Décisions

${decisions.map(d => `- **${d.text}** (Impact: ${d.impact})`).join('\n')}

## Actions à suivre

${actions.map(a => `- [ ] **${a.task}**\n  - Responsable: ${a.responsible}\n  - Échéance: ${a.deadline}\n  - Priorité: ${a.priority}`).join('\n\n')}

---
*Généré par CORTEXIA*`;

    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reunion-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(followUpEmail);
    alert('✅ Email copié dans le presse-papier !');
  };

  const handleExportTranscript = () => {
    const content = data.transcript.filter(t => t.isFinal || t.marked).map(t => `[${new Date(t.timestamp).toLocaleTimeString()}] ${t.speaker}: ${t.text}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `transcription-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isGenerating) {
    return (
      <div className="screen session-report">
        <div className="loading">
          <div className="spinner"></div>
          <p>🤖 Analyse de la transcription en cours...</p>
          <small>Génération du résumé, extraction des actions et décisions</small>
        </div>
      </div>
    );
  }

  return (
    <div className="screen session-report">
      <div className="report-header">
        <h2>Compte-rendu de session</h2>
        <div className="report-meta">
          <span>{formatDuration(data.duration)}</span>
          <span>{data.transcript.filter(t => t.isFinal).length} segments</span>
          <span>{data.language === 'fr' ? 'Français' : 'English'}</span>
        </div>
      </div>

      <div className="tabs">
        <button className={`tab ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')}>Résumé</button>
        <button className={`tab ${activeTab === 'actions' ? 'active' : ''}`} onClick={() => setActiveTab('actions')}>Actions ({actions.length})</button>
        <button className={`tab ${activeTab === 'decisions' ? 'active' : ''}`} onClick={() => setActiveTab('decisions')}>Décisions ({decisions.length})</button>
        <button className={`tab ${activeTab === 'email' ? 'active' : ''}`} onClick={() => setActiveTab('email')}>Email</button>
      </div>

      <div className="tab-content">
        {activeTab === 'summary' && (
          <section className="report-section">
            <div className="report-content">{summary}</div>
          </section>
        )}

        {activeTab === 'actions' && (
          <section className="report-section">
            <table className="actions-table">
              <thead>
                <tr><th>Tâche</th><th>Responsable</th><th>Échéance</th><th>Priorité</th></tr>
              </thead>
              <tbody>
                {actions.map((action) => (
                  <tr key={action.id}>
                    <td>{action.task}</td>
                    <td>{action.responsible}</td>
                    <td>{new Date(action.deadline).toLocaleDateString('fr-FR')}</td>
                    <td><span className={`priority priority-${action.priority.toLowerCase()}`}>{action.priority}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {activeTab === 'decisions' && (
          <section className="report-section">
            <div className="decisions-list">
              {decisions.map((decision) => (
                <div key={decision.id} className="decision-item">
                  <span className="decision-icon">D</span>
                  <div className="decision-content">
                    <p className="decision-text">{decision.text}</p>
                    <span className="decision-impact">Impact : {decision.impact}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeTab === 'email' && (
          <section className="report-section">
            <textarea className="email-preview" value={followUpEmail} onChange={(e) => setFollowUpEmail(e.target.value)} rows={15} />
            <button onClick={handleCopyEmail} className="btn-secondary btn-icon">Copier l'email</button>
          </section>
        )}
      </div>

      <div className="report-actions">
        <div className="export-group">
          <button onClick={() => exportService.exportMarkdown(data)} className="btn-secondary">Markdown</button>
          <button onClick={() => exportService.exportJSON(data)} className="btn-secondary">JSON</button>
          <button onClick={() => exportService.exportHTML(data)} className="btn-secondary">HTML</button>
          <button onClick={() => exportService.exportSRT(data)} className="btn-secondary">SRT</button>
          <button onClick={() => exportService.exportTXT(data)} className="btn-secondary">TXT</button>
          <button onClick={() => exportService.exportCSV(data)} className="btn-secondary">CSV</button>
        </div>
        <div className="main-actions">
          <button onClick={onEdit} className="btn-secondary">Éditer</button>
          <button onClick={onNewSession} className="btn-primary">Nouvelle session</button>
        </div>
      </div>
    </div>
  );
}
