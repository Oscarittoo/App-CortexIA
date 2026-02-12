import { Bot, Download, Chrome, Copy, CheckCircle, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import toast from './Toast';

/**
 * Composant AgentInstall - Instructions d'installation de l'agent IA
 */
export default function AgentInstall() {
  const [copiedStep, setCopiedStep] = useState(null);

  const copyToClipboard = (text, step) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(step);
    toast.success('Copié dans le presse-papier');
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const installSteps = [
    {
      title: 'Télécharger l\'extension Chrome',
      description: 'L\'agent IA est disponible sous forme d\'extension Chrome pour s\'intégrer à votre navigateur',
      action: 'Télécharger l\'extension',
      icon: Chrome,
      color: '#4285f4'
    },
    {
      title: 'Installer l\'extension',
      description: 'Ouvrez le fichier téléchargé et suivez les instructions d\'installation',
      icon: Download,
      color: '#10b981'
    },
    {
      title: 'Connectez-vous avec votre compte',
      description: 'L\'agent IA utilise les clés API fournies automatiquement avec votre abonnement Meetizy',
      icon: Bot,
      color: '#8b5cf6'
    }
  ];

  return (
    <div className="agent-install-container" style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '48px', textAlign: 'center' }}>
        <div style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 24px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Bot size={40} color="white" />
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: '700', marginBottom: '12px' }}>
          Installer l'Agent IA
        </h1>
        <p style={{ fontSize: '18px', color: 'var(--muted)', maxWidth: '600px', margin: '0 auto' }}>
          Transformez votre navigateur en assistant intelligent avec notre agent IA interactif
        </p>
      </div>

      {/* Features Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '48px'
      }}>
        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            margin: '0 auto 16px',
            borderRadius: '12px',
            background: 'rgba(16, 185, 129, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bot size={24} color="#10b981" />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
            Chatbot Intelligent
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
            Posez des questions et obtenez des réponses instantanées
          </p>
        </div>

        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            margin: '0 auto 16px',
            borderRadius: '12px',
            background: 'rgba(139, 92, 246, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle size={24} color="#8b5cf6" />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
            Analyse en Temps Réel
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
            Analyse automatique de vos réunions et conversations
          </p>
        </div>

        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            margin: '0 auto 16px',
            borderRadius: '12px',
            background: 'rgba(66, 133, 244, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <ExternalLink size={24} color="#4285f4" />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
            Intégration Transparente
          </h3>
          <p style={{ fontSize: '14px', color: 'var(--muted)' }}>
            Compatible avec toutes vos applications web préférées
          </p>
        </div>
      </div>

      {/* Installation Steps */}
      <div style={{ marginBottom: '48px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '24px' }}>
          Étapes d'installation
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {installSteps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '24px',
                  display: 'flex',
                  gap: '20px',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{
                  width: '48px',
                  height: '48px',
                  flexShrink: 0,
                  borderRadius: '12px',
                  background: `${step.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Icon size={24} color={step.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: step.color,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '12px',
                      fontWeight: '700'
                    }}>
                      {index + 1}
                    </span>
                    <h3 style={{ fontSize: '18px', fontWeight: '600' }}>
                      {step.title}
                    </h3>
                  </div>
                  <p style={{ color: 'var(--muted)', marginBottom: '16px' }}>
                    {step.description}
                  </p>
                  {step.action && (
                    <button
                      className="btn btn-primary"
                      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                      onClick={() => toast.info('Fonctionnalité bientôt disponible')}
                    >
                      <Download size={18} />
                      {step.action}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* API Information */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
        border: '1px solid rgba(102, 126, 234, 0.3)',
        borderRadius: '12px',
        padding: '32px',
        marginBottom: '32px'
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Bot size={28} color="#667eea" />
          Clés API fournies automatiquement
        </h2>
        <p style={{ color: 'var(--text)', marginBottom: '20px', fontSize: '16px', lineHeight: '1.6' }}>
          <strong>🎉 Bonne nouvelle !</strong> Vous n'avez pas besoin de configurer de clés API manuellement. 
          Les clés API (OpenAI GPT-4, Anthropic Claude, Whisper) sont <strong>automatiquement fournies et configurées</strong> selon votre plan d'abonnement.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '24px' }}>
          <div style={{
            padding: '16px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '4px' }}>Plan Free</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#6b7280' }}>Limité</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>10 requêtes/jour</div>
          </div>

          <div style={{
            padding: '16px',
            background: 'rgba(139, 92, 246, 0.15)',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid rgba(139, 92, 246, 0.3)'
          }}>
            <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '4px' }}>Plan Pro</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#8b5cf6' }}>100/jour</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>+ GPT-4 & Claude</div>
          </div>

          <div style={{
            padding: '16px',
            background: 'rgba(59, 130, 246, 0.15)',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '4px' }}>Plan Business</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#3b82f6' }}>500/jour</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>+ API prioritaire</div>
          </div>

          <div style={{
            padding: '16px',
            background: 'rgba(245, 158, 11, 0.15)',
            borderRadius: '8px',
            textAlign: 'center',
            border: '1px solid rgba(245, 158, 11, 0.3)'
          }}>
            <div style={{ fontSize: '14px', color: 'var(--muted)', marginBottom: '4px' }}>Plan Expert</div>
            <div style={{ fontSize: '18px', fontWeight: '700', color: '#f59e0b' }}>Illimité</div>
            <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '4px' }}>+ Support dédié</div>
          </div>
        </div>

        <div style={{
          marginTop: '24px',
          padding: '16px',
          background: 'rgba(16, 185, 129, 0.1)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: '8px',
          fontSize: '14px',
          lineHeight: '1.6'
        }}>
          <strong style={{ color: '#10b981' }}>✓ Avantages :</strong>
          <ul style={{ marginTop: '8px', marginLeft: '20px', color: 'var(--text)' }}>
            <li>Aucune configuration technique requise</li>
            <li>Mise à jour automatique des clés</li>
            <li>Sécurité renforcée (clés côté serveur)</li>
            <li>Support multi-modèles (GPT-4, Claude, Whisper)</li>
          </ul>
        </div>
      </div>

      {/* Need Help */}
      <div style={{
        marginTop: '32px',
        textAlign: 'center',
        padding: '32px',
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '12px'
      }}>
        <h3 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '12px' }}>
          Besoin d'aide ?
        </h3>
        <p style={{ color: 'var(--muted)', marginBottom: '20px' }}>
          Consultez notre documentation complète ou contactez le support
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button className="btn btn-secondary">
            Documentation
          </button>
          <button className="btn btn-primary">
            Contacter le support
          </button>
        </div>
      </div>
    </div>
  );
}
