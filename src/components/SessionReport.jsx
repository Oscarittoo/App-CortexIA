import { useState, useEffect } from 'react';
import exportService from '../utils/export';
import llmService from '../services/llmService';
import storageService from '../utils/storage';

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
    
    // Utiliser directement l'analyse locale (pas d'API)
    console.log('📊 Analyse locale de la transcription...');
    
    try {
      // Génération locale basée sur la vraie transcription
      const fullTranscript = data.transcript
        ?.map(t => t.text)
        .join(' ') || '';
      
      const extractedActions = extractActions(fullTranscript);
      const extractedDecisions = extractDecisions(fullTranscript);
      
      setSummary(`📋 Compte-rendu de la réunion "${data.title || 'Sans titre'}"\n\n📅 **Date :** ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}\n⏱️ **Durée :** ${formatDuration(data.duration)}\n🌍 **Langue :** ${data.language === 'fr' ? 'Français' : 'English'}\n\n---\n\n## 📝 Transcription complète\n\n${fullTranscript || 'Aucune transcription disponible'}\n\n---\n\n## 🔑 Points clés de la discussion\n\n${extractKeyPoints(fullTranscript)}\n\n---\n\n💡 *Note: Ce résumé a été généré par analyse locale de la transcription. Pour un résumé IA professionnel, rechargez vos crédits OpenAI.*`);

      setActions(extractedActions);
      setDecisions(extractedDecisions);

      setFollowUpEmail(`Objet : Compte-rendu - ${data.title || 'Réunion'}\n\nBonjour,\n\nVoici le récapitulatif de notre réunion "${data.title || 'Sans titre'}" du ${new Date().toLocaleDateString('fr-FR')}.\n\nDURÉE : ${formatDuration(data.duration)}\n\n${extractedDecisions.length > 0 && extractedDecisions[0].text !== 'Aucune décision formelle détectée dans la transcription' ? `DÉCISIONS PRISES\n${extractedDecisions.map(d => `• ${d.text} (${d.impact})`).join('\n')}\n\n` : ''}${extractedActions.length > 0 && extractedActions[0].task !== 'Aucune action spécifique détectée dans la transcription' ? `ACTIONS À SUIVRE\n${extractedActions.map(a => `• ${a.task}\n  Responsable: ${a.responsible} | Échéance: ${new Date(a.deadline).toLocaleDateString('fr-FR')} | Priorité: ${a.priority}`).join('\n\n')}\n\n` : ''}TRANSCRIPTION
${fullTranscript.substring(0, 800)}${fullTranscript.length > 800 ? '...\n\n[Transcription complète disponible dans le compte-rendu joint]' : ''}\n\nCordialement,\nCORTEXIA`);
      
      // Sauvegarder la session
      const sessionToSave = {
        ...data,
        summary: `Compte-rendu - ${data.title}`,
        actions: extractedActions,
        decisions: extractedDecisions,
        generatedAt: Date.now()
      };
      
      storageService.saveSession(sessionToSave);
      console.log('✅ Session sauvegardée');

      setIsGenerating(false);
    } catch (error) {
      console.error('❌ Erreur génération:', error);
      setIsGenerating(false);
    }
  };

  const extractKeyPoints = (text) => {
    if (!text || text.length < 10) return '• Aucune transcription disponible';
    
    // Diviser en phrases et filtrer les phrases significatives
    const sentences = text.split(/[.!?\n]+/)
      .map(s => s.trim())
      .filter(s => s.length > 20 && s.length < 200)
      .filter(s => !s.toLowerCase().includes('euh') && !s.toLowerCase().includes('hmm'));
    
    if (sentences.length === 0) return '• Transcription trop courte pour extraire des points clés';
    
    // Prendre les premières phrases significatives
    const keyPoints = sentences.slice(0, 7).map(s => `• ${s}`);
    
    return keyPoints.join('\n') || '• Aucun point clé détecté';
  };

  const extractActions = (text) => {
    if (!text || text.length < 10) return [
      { id: 1, task: 'Aucune transcription disponible pour extraire les actions', responsible: 'À définir', deadline: new Date().toISOString().split('T')[0], priority: 'Basse' }
    ];
    
    const actionWords = ['doit', 'dois', 'devons', 'devez', 'va', 'vais', 'allons', 'allez', 'devra', 'faut', 'il faut', 'faudra', 'besoin', 'action', 'faire', 'réaliser', 'tâche', 'planifier', 'organiser', 'préparer', 'prévoir', 'créer', 'mettre en place', 'lancer'];
    const sentences = text.split(/[.!?\n]+/).filter(s => s.trim().length > 10);
    const actions = [];
    
    sentences.forEach((sentence, idx) => {
      const lowerSentence = sentence.toLowerCase();
      if (actionWords.some(word => lowerSentence.includes(word))) {
        const task = sentence.trim();
        
        // Extraire le responsable si mentionné
        let responsible = 'À définir';
        const responsiblePatterns = [/par ([A-Z][a-z]+)/i, /([A-Z][a-z]+) (doit|va|devra)/i, /assigné à ([A-Z][a-z]+)/i];
        for (const pattern of responsiblePatterns) {
          const match = sentence.match(pattern);
          if (match) {
            responsible = match[1];
            break;
          }
        }
        
        // Extraire l'échéance si mentionnée
        let deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const datePatterns = [
          /demain/i, /aujourd'hui/i, /cette semaine/i, /la semaine prochaine/i,
          /ce mois/i, /le mois prochain/i, /vendredi/i, /lundi/i, /mardi/i
        ];
        
        if (lowerSentence.includes('urgent') || lowerSentence.includes('immédiat') || lowerSentence.includes('aujourd\'hui')) {
          deadline = new Date().toISOString().split('T')[0];
        } else if (lowerSentence.includes('semaine')) {
          deadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        } else if (lowerSentence.includes('mois')) {
          deadline = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        }
        
        // Déterminer la priorité
        let priority = 'Moyenne';
        if (lowerSentence.includes('urgent') || lowerSentence.includes('priorité') || lowerSentence.includes('immédiat') || lowerSentence.includes('crucial')) {
          priority = 'Haute';
        } else if (lowerSentence.includes('si possible') || lowerSentence.includes('éventuellement') || lowerSentence.includes('plus tard')) {
          priority = 'Basse';
        }
        
        actions.push({
          id: idx + 1,
          task: task.substring(0, 100),
          responsible: responsible,
          deadline: deadline,
          priority: priority
        });
      }
    });
    
    if (actions.length === 0) {
      return [{
        id: 1,
        task: 'Aucune action spécifique détectée dans la transcription',
        responsible: 'À définir',
        deadline: new Date().toISOString().split('T')[0],
        priority: 'Basse'
      }];
    }
    
    return actions.slice(0, 8); // Max 8 actions
  };

  const extractDecisions = (text) => {
    if (!text || text.length < 10) return [
      { id: 1, text: 'Aucune transcription disponible pour extraire les décisions', impact: 'Général' }
    ];
    
    const decisionWords = ['décidé', 'décision', 'décide', 'décidons', 'choisi', 'choisir', 'choix', 'validé', 'valider', 'approuvé', 'approuver', 'accord', 'convenu', 'retenu', 'adopté', 'confirmé', 'acte'];
    const sentences = text.split(/[.!?\n]+/).filter(s => s.trim().length > 10);
    const decisions = [];
    
    sentences.forEach((sentence, idx) => {
      const lowerSentence = sentence.toLowerCase();
      if (decisionWords.some(word => lowerSentence.includes(word))) {
        const decisionText = sentence.trim();
        
        // Déterminer l'impact
        let impact = 'Général';
        if (lowerSentence.includes('technique') || lowerSentence.includes('technologie') || lowerSentence.includes('architecture') || lowerSentence.includes('infrastructure')) {
          impact = 'Technique';
        } else if (lowerSentence.includes('sécurité') || lowerSentence.includes('protection') || lowerSentence.includes('confidentialité') || lowerSentence.includes('accès')) {
          impact = 'Sécurité';
        } else if (lowerSentence.includes('fonctionnel') || lowerSentence.includes('feature') || lowerSentence.includes('fonctionnalité') || lowerSentence.includes('produit')) {
          impact = 'Fonctionnel';
        } else if (lowerSentence.includes('légal') || lowerSentence.includes('juridique') || lowerSentence.includes('rgpd') || lowerSentence.includes('conformité') || lowerSentence.includes('contrat')) {
          impact = 'Légal';
        } else if (lowerSentence.includes('budget') || lowerSentence.includes('coût') || lowerSentence.includes('financement') || lowerSentence.includes('finance')) {
          impact = 'Financier';
        } else if (lowerSentence.includes('stratég') || lowerSentence.includes('vision') || lowerSentence.includes('objectif')) {
          impact = 'Stratégique';
        }
        
        decisions.push({
          id: idx + 1,
          text: decisionText.substring(0, 120),
          impact: impact
        });
      }
    });
    
    if (decisions.length === 0) {
      return [{
        id: 1,
        text: 'Aucune décision formelle détectée dans la transcription',
        impact: 'Général'
      }];
    }
    
    return decisions.slice(0, 6); // Max 6 décisions
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
