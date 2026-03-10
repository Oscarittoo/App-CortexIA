import { useState, useEffect, useRef } from 'react';
import { 
  FileText, 
  CheckSquare, 
  AlertTriangle, 
  Mail, 
  Download, 
  ArrowLeft, 
  Clock, 
  Calendar,
  Share2,
  Copy,
  Edit,
  PlusCircle,
  Target
} from 'lucide-react';
import pdfExportService from '../services/pdfExportService';
import llmService from '../services/llmService';
import storageService from '../utils/storage';
import authService from '../services/authService';
import { PLAN_LIMITS } from '../config/featureFlags';
import toast from './Toast';

export default function SessionReport({ data, onNewSession, onEdit, isSidebarCollapsed = false }) {
  const [summary, setSummary] = useState('');
  const [actions, setActions] = useState([]);
  const [decisions, setDecisions] = useState([]);
  const [followUpEmail, setFollowUpEmail] = useState('');
  const [isGenerating, setIsGenerating] = useState(true);
  const [activeTab, setActiveTab] = useState('summary');
  const [aiMeta, setAiMeta] = useState(null);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [userSettings, setUserSettings] = useState(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const exportRef = useRef(null);

  // Fermer le dropdown export au clic en dehors
  useEffect(() => {
    if (!isExportOpen) return;
    const handler = (e) => {
      if (exportRef.current && !exportRef.current.contains(e.target)) {
        setIsExportOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isExportOpen]);

  useEffect(() => {
    // Charger les settings utilisateur
    const settings = storageService.getSettings();
    setUserSettings(settings);
    // Si le rapport IA a déjà été généré et sauvegardé, utiliser les données sauvegardées
    if (data.aiGenerated && data.summary) {
      loadSavedReport(settings);
    } else {
      generateReport(settings);
    }
  }, []);

  const loadSavedReport = (settings) => {
    // Reconstruire le résumé complet affiché (comme generateReport le fait)
    const savedSummary = `COMPTE-RENDU DE RÉUNION

Titre: ${data.title || 'Sans titre'}
Date: ${data.date ? new Date(data.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : new Date(data.generatedAt || Date.now()).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
Durée: ${formatDuration(data.duration)}
Langue: ${data.language === 'fr' ? 'Français' : 'English'}

---

## SYNTHÈSE

${data.summary}

---

*Ce rapport a été généré automatiquement par IA*`;

    setSummary(savedSummary);
    setActions(data.actions || []);
    setDecisions(data.decisions || []);

    // Restaurer l'email sauvegardé ou reconstruire avec signature
    let email = data.email || '';
    if (email && settings) {
      const { fullName, position, company } = settings;
      let signature = '\n\nCordialement,';
      if (fullName && fullName !== 'Jean Dupont') signature += `\n${fullName}`;
      if (position && position !== 'Directeur Commercial') signature += `\n${position}`;
      if (company && company !== 'Entreprise SAS') signature += `\n${company}`;
      if (signature !== '\n\nCordialement,') {
        email = email.replace(/Cordialement,\s*(CORTEXA|Meetizy|Cortexa)/gi, signature);
      }
    }
    setFollowUpEmail(email);

    setAiMeta(data.aiMeta || null);
    setIsGenerating(false);
  };

  const getEmailSignature = (settingsOverride = null) => {
    const s = settingsOverride || userSettings;
    if (!s) return '\n\nCordialement,\nCortexa';
    
    const { fullName, position, company } = s;
    let signature = '\n\nCordialement,';
    
    if (fullName && fullName !== 'Jean Dupont') {
      signature += `\n${fullName}`;
    }
    
    if (position && position !== 'Directeur Commercial') {
      signature += `\n${position}`;
    }
    
    if (company && company !== 'Entreprise SAS') {
      signature += `\n${company}`;
    }
    
    return signature || '\n\nCordialement,\nCortexa';
  };

  const generateReport = async (settingsOverride = null) => {
    setIsGenerating(true);
    
    console.log(`Génération du rapport avec IA (${import.meta.env?.VITE_LLM_PROVIDER || 'openai'})...`);
    
    try {
      // Préparer les données de la session
      const sessionInfo = {
        title: data.title || 'Sans titre',
        language: data.language || 'fr',
        duration: data.duration || 0,
        template: data.template || null
      };
      
      // Appeler le service LLM pour générer le rapport complet
      const aiReport = await llmService.generateReport(data.transcript || [], sessionInfo);
      
      console.log('Rapport IA généré avec succès');
      console.log('Actions détectées en temps réel:', data.detectedActions);
      console.log('Décisions détectées en temps réel:', data.detectedDecisions);
      
      // Fusionner les actions détectées en temps réel avec celles de l'IA
      const realtimeActions = (data.detectedActions || []).map((action, index) => ({
        id: index + 1,
        task: action.text,
        responsible: 'À définir',
        deadline: 'À définir',
        priority: action.priority || 'Moyenne'
      }));
      
      const aiActions = aiReport.actions || [];
      
      // Fusionner et dédoublonné les actions
      const allActions = [...realtimeActions, ...aiActions];
      const uniqueActions = allActions.reduce((acc, action) => {
        const duplicate = acc.find(a => 
          a.task.toLowerCase().trim() === action.task.toLowerCase().trim()
        );
        if (!duplicate) {
          acc.push(action);
        }
        return acc;
      }, []).map((action, index) => ({ ...action, id: index + 1 }));
      
      // Fusionner les décisions détectées en temps réel avec celles de l'IA
      const realtimeDecisions = (data.detectedDecisions || []).map((decision, index) => ({
        id: index + 1,
        text: decision.text,
        impact: decision.impact || 'Fonctionnel'
      }));
      
      const aiDecisions = aiReport.decisions || [];
      
      // Fusionner et dédoublonné les décisions
      const allDecisions = [...realtimeDecisions, ...aiDecisions];
      const uniqueDecisions = allDecisions.reduce((acc, decision) => {
        const duplicate = acc.find(d => 
          d.text.toLowerCase().trim() === decision.text.toLowerCase().trim()
        );
        if (!duplicate) {
          acc.push(decision);
        }
        return acc;
      }, []).map((decision, index) => ({ ...decision, id: index + 1 }));
      
      // Mettre à jour l'UI avec les résultats de l'IA
      const fullTranscript = data.transcript
        ?.map(t => (typeof t === 'string' ? t : t?.text))
        .filter(text => text && text.trim())
        .join(' ') || '';
      
      setSummary(`COMPTE-RENDU DE RÉUNION

Titre: ${data.title || 'Sans titre'}
Date: ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
Durée: ${formatDuration(data.duration)}
Langue: ${data.language === 'fr' ? 'Français' : 'English'}

---

## SYNTHÈSE

${aiReport.summary}

---

*Ce rapport a été généré automatiquement par IA*`);

      setActions(uniqueActions.length > 0 ? uniqueActions : []);
      setDecisions(uniqueDecisions.length > 0 ? uniqueDecisions : []);
      
      // Personnaliser l'email avec signature utilisateur
      let customEmail = aiReport.email || '';
      if (customEmail) {
        // Remplacer la signature générique par la signature personnalisée
        customEmail = customEmail.replace(/Cordialement,\s*(CORTEXA|Meetizy|Cortexa)/gi, getEmailSignature());
      }
      setFollowUpEmail(customEmail);
      
      setAiMeta(aiReport.meta || null);
      
      // Sauvegarder la session avec le rapport IA et les données fusionnées
      const sessionToSave = {
        ...data,
        summary: aiReport.summary,
        actions: uniqueActions,
        decisions: uniqueDecisions,
        email: aiReport.email,
        generatedAt: Date.now(),
        aiGenerated: true,
        aiMeta: aiReport.meta || null
      };
      
      storageService.saveSession(sessionToSave);
      console.log('Session sauvegardée avec rapport IA');

      setIsGenerating(false);
      
    } catch (error) {
      console.error('Erreur génération IA:', error);
      const errorMessage = error?.message || 'Erreur inconnue';
      toast.error(`Génération IA impossible: ${errorMessage}`);
      console.log('Fallback sur analyse locale...');
      
      // Fallback sur extraction manuelle si l'IA échoue
      const fullTranscript = data.transcript
        ?.map(t => (typeof t === 'string' ? t : t?.text))
        .join(' ') || '';
      
      const extractedActions = extractActions(fullTranscript);
      const extractedDecisions = extractDecisions(fullTranscript);
      
      setSummary(`COMPTE-RENDU DE RÉUNION

Titre: ${data.title || 'Sans titre'}
Date: ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
Durée: ${formatDuration(data.duration)}
Langue: ${data.language === 'fr' ? 'Français' : 'English'}

---

## ERREUR IA

${errorMessage}

## TRANSCRIPTION COMPLÈTE

${fullTranscript || 'Aucune transcription disponible'}

---

## POINTS CLÉS DE LA DISCUSSION

${extractKeyPoints(fullTranscript)}

---

*Note: L'IA n'a pas pu générer le résumé (${error.message}). Analyse locale utilisée.*`);

      setActions(extractedActions);
      setDecisions(extractedDecisions);
      setAiMeta({ provider: 'local', model: 'local-heuristics', source: 'fallback' });

      setFollowUpEmail(`Objet : Compte-rendu - ${data.title || 'Réunion'}\n\nBonjour,\n\nVoici le récapitulatif de notre réunion "${data.title || 'Sans titre'}" du ${new Date().toLocaleDateString('fr-FR')}.\n\nDURÉE : ${formatDuration(data.duration)}\n\n${extractedDecisions.length > 0 && extractedDecisions[0].text !== 'Aucune décision formelle détectée dans la transcription' ? `DÉCISIONS PRISES\n${extractedDecisions.map(d => `• ${d.text} (${d.impact})`).join('\n')}\n\n` : ''}${extractedActions.length > 0 && extractedActions[0].task !== 'Aucune action spécifique détectée dans la transcription' ? `ACTIONS À SUIVRE\n${extractedActions.map(a => `• ${a.task}\n  Responsable: ${a.responsible} | Échéance: ${new Date(a.deadline).toLocaleDateString('fr-FR')} | Priorité: ${a.priority}`).join('\n\n')}\n\n` : ''}TRANSCRIPTION\n${fullTranscript.substring(0, 800)}${fullTranscript.length > 800 ? '...\n\n[Transcription complète disponible dans le compte-rendu joint]' : ''}${getEmailSignature(settingsOverride)}`);
      
      const sessionToSave = {
        ...data,
        summary: `Compte-rendu - ${data.title}`,
        actions: extractedActions,
        decisions: extractedDecisions,
        generatedAt: Date.now(),
        aiGenerated: false,
        aiMeta: { provider: 'local', model: 'local-heuristics', source: 'fallback' }
      };
      
      storageService.saveSession(sessionToSave);
      console.log('Session sauvegardée (mode local)');

      setIsGenerating(false);
    }
  };

  const extractKeyPoints = (text) => {
    if (!text || text.length < 10) return '- Aucune transcription disponible';
    
    // Diviser en phrases et filtrer les phrases significatives
    const sentences = text.split(/[.!?\n]+/)
      .map(s => s.trim())
      .filter(s => s.length > 20 && s.length < 200)
      .filter(s => !s.toLowerCase().includes('euh') && !s.toLowerCase().includes('hmm'));
    
    if (sentences.length === 0) return '- Transcription trop courte pour extraire des points clés';
    
    // Prendre les premières phrases significatives
    const keyPoints = sentences.slice(0, 7).map(s => `- ${s}`);
    
    return keyPoints.join('\n') || '- Aucun point clé détecté';
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
    const lines = [];
    lines.push(`# ${data.title || 'Compte-rendu de réunion'}`);
    lines.push('');
    lines.push(`**Date :** ${data.date ? new Date(data.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : new Date(data.generatedAt || Date.now()).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}`);
    lines.push(`**Durée :** ${formatDuration(data.duration)}`);
    lines.push('');
    lines.push('---');
    lines.push('');

    if (summary) {
      lines.push('## Synthèse');
      lines.push('');
      // Extraire juste la partie synthèse du bloc composé
      const summaryOnly = summary.replace(/^COMPTE-RENDU[\s\S]*?---\n\n## SYNTHÈSE\n\n/, '').replace(/\n\n---[\s\S]*$/, '');
      lines.push(summaryOnly.trim());
      lines.push('');
    }

    if (actions.length > 0) {
      lines.push('## Actions');
      lines.push('');
      lines.push('| Tâche | Responsable | Échéance | Priorité |');
      lines.push('|-------|-------------|---------|----------|');
      actions.forEach(a => {
        lines.push(`| ${a.task || ''} | ${a.responsible || 'À définir'} | ${a.deadline || 'À définir'} | ${a.priority || 'Moyenne'} |`);
      });
      lines.push('');
    }

    if (decisions.length > 0) {
      lines.push('## Décisions');
      lines.push('');
      decisions.forEach(d => {
        lines.push(`- **${d.text || ''}** _(${d.impact || 'Général'})_`);
      });
      lines.push('');
    }

    if (followUpEmail) {
      lines.push('## Email de suivi');
      lines.push('');
      lines.push('```');
      lines.push(followUpEmail);
      lines.push('```');
      lines.push('');
    }

    lines.push('---');
    lines.push('*Généré par CORTEXA*');

    const content = lines.join('\n');
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(data.title || 'compte-rendu').replace(/[^a-z0-9]/gi, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Fichier Markdown téléchargé !');
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(followUpEmail)
      .then(() => toast.success('Email copié dans le presse-papiers !'))
      .catch(() => toast.error('Impossible de copier'));
  };

  if (isGenerating) {
    return (
      <div className="screen session-report" style={{ position: 'fixed', top: '18px', left: isSidebarCollapsed ? '96px' : '296px', right: '18px', bottom: '18px', background: '#0f172a', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden', transition: 'left 0.3s ease' }}>
        <div style={{ textAlign: 'center', padding: '40px', background: '#1e293b', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div className="spinner" style={{ margin: '0 auto 20px auto', border: '3px solid rgba(255,255,255,0.1)', borderTop: '3px solid #38bdf8', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite' }}></div>
          <h3 style={{ fontSize: '18px', marginBottom: '8px', color: 'white' }}>Génération du rapport IA en cours...</h3>
          <p style={{ color: '#94a3b8', fontSize: '14px', maxWidth: '400px' }}>
            Notre intelligence artificielle analyse votre conversation pour en extraire les points clés.
          </p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <div className="screen session-report" style={{ position: 'fixed', top: '18px', left: isSidebarCollapsed ? '96px' : '296px', right: '18px', bottom: '18px', background: '#0f172a', zIndex: 100, display: 'flex', flexDirection: 'column', borderRadius: '16px', border: '1px solid var(--border)', overflow: 'hidden', transition: 'left 0.3s ease' }}>
      <style>{`
        .report-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 24px 40px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          background: #1e293b;
        }
        .header-title-group h2 {
          font-size: 24px;
          font-weight: 700;
          color: white;
          margin: 0 0 8px 0;
          width: 550px;
        }
        .header-meta {
          display: flex;
          gap: 16px;
          color: #94a3b8;
          font-size: 14px;
        }
        .header-actions {
          display: flex;
          gap: 12px;
        }
        .btn-header {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
          border: 1px solid rgba(255,255,255,0.1);
          background: rgba(255,255,255,0.05);
          color: white;
        }
        .btn-header:hover {
          background: rgba(255,255,255,0.1);
        }
        .btn-primary {
          background: #38bdf8;
          color: #0f172a;
          border-color: #38bdf8;
        }
        .btn-primary:hover {
          background: #0ea5e9;
          border-color: #0ea5e9;
        }
        
        .report-content-wrapper {
          display: flex;
          flex-direction: column;
          flex: 1;
          overflow: hidden;
          max-width: 1200px;
          width: 100%;
          margin: 0 auto;
          padding: 32px 40px;
        }
        
        .tabs-header {
          display: flex;
          gap: 32px;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          margin-bottom: 32px;
        }
        .tab-item {
          padding-bottom: 16px;
          color: #94a3b8;
          font-weight: 500;
          cursor: pointer;
          position: relative;
          transition: color 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .tab-item:hover {
          color: white;
        }
        .tab-item.active {
          color: #38bdf8;
        }
        .tab-item.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background: #38bdf8;
        }
        
        .tab-content {
          flex: 1;
          overflow-y: auto;
          padding-right: 16px;
        }
        
        /* content styles */
        .summary-block h3 {
           color: #38bdf8; 
           margin-top: 24px; 
           margin-bottom: 12px;
           font-size: 18px;
        }
        .summary-block p, .summary-block li {
           color: #cbd5e1;
           line-height: 1.7;
           margin-bottom: 12px;
           font-size: 15px;
        }
        
        .action-row {
           display: flex;
           background: rgba(255,255,255,0.03);
           padding: 16px;
           border-radius: 8px;
           border: 1px solid rgba(255,255,255,0.05);
           margin-bottom: 12px;
           align-items: center;
        }
      `}</style>
      
      {/* Top Header */}
      <div className="report-header">
        <div className="header-title-group">
          <h2>{data.title || 'Synthèse de réunion'}</h2>
          <div className="header-meta">
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Clock size={14} /> {formatDuration(data.duration)}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FileText size={14} /> {(data.transcript || []).filter(t => t.isFinal).length} segments</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Target size={14} /> {data.language === 'fr' ? 'Français' : 'English'}</span>
            {aiMeta && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={14} /> IA: {aiMeta.provider} ({aiMeta.model})
              </span>
            )}
          </div>
        </div>
        
        <div className="header-actions">
          <button className="btn-action" onClick={onEdit} title="Modifier la transcription">
            <Edit size={18} />
            <span>Éditer</span>
          </button>
          
          <div className="export-dropdown" ref={exportRef} style={{ position: 'relative', display: 'inline-block' }}>
            <button 
              className="btn-action btn-export" 
              onClick={() => setIsExportOpen(v => !v)}
              title="Options d'export"
            >
              <Download size={18} />
              <span>Exporter</span>
            </button>
            {isExportOpen && (
            <div className="export-menu" style={{ 
              position: 'absolute',
              top: '100%',
              right: 0,
              marginTop: '8px',
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
              overflow: 'hidden',
              minWidth: '200px',
              zIndex: 100
            }}>
              <div 
                onClick={() => {
                  const plan = authService.currentUser?.plan || 'free';
                  if (!(PLAN_LIMITS[plan] || PLAN_LIMITS.free).pdfExport) {
                    toast.error('🔒 Export PDF disponible à partir du plan Pro. Mettez à niveau votre abonnement dans Paramètres → Abonnement.');
                    setIsExportOpen(false);
                    return;
                  }
                  try {
                    pdfExportService.exportSession(data);
                    toast.success('Rapport exporté en PDF avec succès !');
                  } catch (error) {
                    toast.error('Erreur lors de l\'export PDF');
                    console.error(error);
                  }
                  setIsExportOpen(false);
                }}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <FileText size={16} />
                <span>Exporter en PDF</span>
              </div>
              <div 
                onClick={() => {
                  const markdown = `# ${data.title}\n\n${summary}\n\n## Actions\n${actions.map(a => `- ${a.task}`).join('\n')}\n\n## Décisions\n${decisions.map(d => `- ${d.text}`).join('\n')}`;
                  const blob = new Blob([markdown], { type: 'text/markdown' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${data.title || 'rapport'}.md`;
                  a.click();
                  URL.revokeObjectURL(url);
                  toast.success('Rapport exporté en Markdown avec succès !');
                  setIsExportOpen(false);
                }}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <FileText size={16} />
                <span>Exporter en Markdown</span>
              </div>
              <div 
                onClick={() => {
                  if (followUpEmail) {
                    navigator.clipboard.writeText(followUpEmail);
                    toast.success('Email copié dans le presse-papier !');
                  } else {
                    toast.info('Aucun email de suivi généré');
                  }
                  setIsExportOpen(false);
                }}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  borderTop: '1px solid var(--border)',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Mail size={16} />
                <span>Copier l'email de suivi</span>
              </div>
            </div>
            )}
          </div>
          
          <button className="btn-action btn-new-session" onClick={() => onNewSession()}>
            <PlusCircle size={18} />
            <span>Nouvelle session</span>
          </button>
        </div>
      </div>

      <div className="report-content-wrapper">
        {/* Horizontal Tabs */}
        <div className="tabs-header">
          <div className={`tab-item ${activeTab === 'summary' ? 'active' : ''}`} onClick={() => setActiveTab('summary')}>
            <FileText size={18} /> Synthèse
          </div>
          <div className={`tab-item ${activeTab === 'actions' ? 'active' : ''}`} onClick={() => setActiveTab('actions')}>
            <CheckSquare size={18} /> Actions ({actions.length})
          </div>
          <div className={`tab-item ${activeTab === 'decisions' ? 'active' : ''}`} onClick={() => setActiveTab('decisions')}>
            <Target size={18} /> Décisions ({decisions.length})
          </div>
          <div className={`tab-item ${activeTab === 'email' ? 'active' : ''}`} onClick={() => setActiveTab('email')}>
            <Mail size={18} /> Email de suivi
          </div>
        </div>

        {/* Tab Content */}
        <div className="tab-content">
          {activeTab === 'summary' && (
            <div className="summary-block">
               {summary ? (
                 <div style={{ whiteSpace: 'pre-wrap' }}>
                   {summary.split('---')[1] ? (
                     <div dangerouslySetInnerHTML={{ 
                        __html: summary.split('---')[1]
                        .replace(/^## (.*$)/gim, '<h3>$1</h3>')
                        .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #e2e8f0;">$1</strong>')
                        .replace(/\n/g, '<br/>')
                     }} />
                   ) : summary}
                 </div>
               ) : (
                 <p>Analyse en cours...</p>
               )}
            </div>
          )}

          {activeTab === 'actions' && (
            <div>
               {actions.map((action, idx) => (
                 <div key={idx} className="action-row">
                    <div style={{ flex: 1 }}>
                       <div style={{ color: 'white', fontWeight: 500, marginBottom: 4 }}>{action.task}</div>
                       <div style={{ color: '#94a3b8', fontSize: 13 }}>Responsable: {action.responsible} • Échéance: {action.deadline}</div>
                    </div>
                    <div style={{ 
                       padding: '4px 12px', 
                       borderRadius: 100, 
                       fontSize: 12, 
                       background: action.priority === 'Haute' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.1)',
                       color: action.priority === 'Haute' ? '#fca5a5' : '#7dd3fc'
                    }}>
                       {action.priority}
                    </div>
                 </div>
               ))}
            </div>
          )}

          {activeTab === 'decisions' && (
            <div>
              {decisions.map((decision, idx) => (
                <div key={idx} style={{ 
                  background: 'rgba(255,255,255,0.03)', 
                  borderLeft: '4px solid #fbbf24', 
                  padding: '20px', 
                  marginBottom: '16px',
                  borderRadius: '0 8px 8px 0'
                }}>
                  <div style={{ color: '#fbbf24', fontSize: 12, fontWeight: 700, marginBottom: 8, textTransform: 'uppercase' }}>Décision validée</div>
                  <div style={{ color: 'white', fontSize: 16 }}>{decision.text}</div>
                  <div style={{ color: '#94a3b8', fontSize: 13, marginTop: 8 }}>Impact: {decision.impact}</div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'email' && (
             <div style={{ background: '#1e293b', padding: 32, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)' }}>
               <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginBottom: 16 }}>
                 <button 
                   onClick={() => setIsEditingEmail(!isEditingEmail)} 
                   style={{ 
                     display: 'flex', 
                     gap: 8, 
                     background: isEditingEmail ? 'rgba(34, 197, 94, 0.2)' : 'transparent', 
                     border: '1px solid ' + (isEditingEmail ? 'rgba(34, 197, 94, 0.5)' : 'rgba(255,255,255,0.2)'), 
                     color: 'white', 
                     padding: '8px 16px', 
                     borderRadius: 6, 
                     cursor: 'pointer' 
                   }}
                 >
                   <Edit size={16} /> {isEditingEmail ? 'Terminé' : 'Éditer'}
                 </button>
                 <button 
                   onClick={() => {
                     // Extraire l'objet et le corps de l'email
                     const emailLines = followUpEmail.split('\n');
                     const subjectLine = emailLines.find(line => line.startsWith('Objet :'));
                     const subject = subjectLine ? subjectLine.replace('Objet :', '').trim() : `Compte-rendu - ${data.title || 'Réunion'}`;
                     const body = followUpEmail.replace(subjectLine, '').trim();
                     
                     // Encoder pour mailto URL
                     const mailtoUrl = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                     window.location.href = mailtoUrl;
                     toast.success('Application mail ouverte');
                   }}
                   style={{ 
                     display: 'flex', 
                     gap: 8, 
                     background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                     border: 'none', 
                     color: 'white', 
                     padding: '8px 16px', 
                     borderRadius: 6, 
                     cursor: 'pointer',
                     fontWeight: 600
                   }}
                 >
                   <Mail size={16} /> Envoyer le mail
                 </button>
                 <button onClick={handleCopyEmail} style={{ display: 'flex', gap: 8, background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '8px 16px', borderRadius: 6, cursor: 'pointer' }}>
                   <Copy size={16} /> Copier
                 </button>
               </div>
               {isEditingEmail ? (
                 <textarea
                   value={followUpEmail}
                   onChange={(e) => setFollowUpEmail(e.target.value)}
                   style={{
                     width: '100%',
                     minHeight: '400px',
                     fontFamily: 'monospace',
                     fontSize: '14px',
                     color: '#e2e8f0',
                     background: '#0f172a',
                     border: '1px solid rgba(255,255,255,0.2)',
                     borderRadius: '6px',
                     padding: '16px',
                     resize: 'vertical'
                   }}
                 />
               ) : (
                 <div style={{ fontFamily: 'monospace', color: '#e2e8f0', whiteSpace: 'pre-wrap' }}>
                   {followUpEmail}
                 </div>
               )}
             </div>
          )}
        </div>
      </div>
      
      <style jsx>{`
        .btn-action {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: var(--card-bg);
          border: 1px solid var(--border);
          border-radius: 10px;
          color: var(--text);
          fontSize: 14px;
          fontWeight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        
        .btn-action:hover {
          background: var(--hover-bg);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }
        
        .btn-action svg {
          transition: transform 0.2s ease;
        }
        
        .btn-action:hover svg {
          transform: scale(1.1);
        }
        
        .btn-export {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border: none;
          color: white;
        }
        
        .btn-export:hover {
          box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
        }
        
        .btn-new-session {
          background: linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%);
          border: none;
          color: white;
        }
        
        .btn-new-session:hover {
          box-shadow: 0 4px 20px rgba(56, 189, 248, 0.4);
        }
        
        .export-menu > div {
          font-size: 14px;
          color: var(--text);
          font-weight: 500;
        }
      `}</style>
    </div>
  );
}

