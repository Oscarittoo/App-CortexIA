import { Bot, Download, Monitor, Keyboard, Mic, FileText, CheckCircle, Layers } from 'lucide-react';
import toast from './Toast';

const OS_LINKS = {
  windows: { label: 'Windows (.exe)', href: '#' },
  mac: { label: 'macOS (.dmg)', href: '#' },
  linux: { label: 'Linux (.AppImage)', href: '#' },
};

const installSteps = [
  {
    title: 'TÃ©lÃ©charger l\'agent MEETIZY',
    description: 'Un seul fichier Ã  installer pour Windows, macOS ou Linux. L\'agent tient en arriÃ¨re-plan et ne consomme presque aucune ressource.',
    icon: Download,
    color: '#667eea',
  },
  {
    title: 'Lancer l\'application',
    description: 'Double-cliquez sur le fichier installÃ©. Une icÃ´ne MEETIZY apparaÃ®t dans votre barre des tÃ¢ches (Windows) ou la barre de menus (Mac). L\'agent est prÃªt.',
    icon: Monitor,
    color: '#10b981',
  },
  {
    title: 'Rejoignez votre rÃ©union normalement',
    description: 'Ouvrez Teams, Zoom, Google Meet ou n\'importe quel autre outil. L\'agent fonctionne en parallÃ¨le, sans interfÃ©rer.',
    icon: Layers,
    color: '#3b82f6',
  },
  {
    title: 'Activez l\'overlay avec Ctrl + Shift + M',
    description: 'Pendant la rÃ©union, appuyez sur ce raccourci. Une petite fenÃªtre flottante s\'affiche par-dessus votre rÃ©union avec un bouton Start / Pause / Stop.',
    icon: Keyboard,
    color: '#f59e0b',
  },
  {
    title: 'Enregistrement et transcription automatique',
    description: 'Le micro est activÃ© dÃ¨s que vous cliquez sur Start. La transcription s\'affiche en direct dans l\'overlay.',
    icon: Mic,
    color: '#8b5cf6',
  },
  {
    title: 'Compte-rendu dans votre espace Meetizy',
    description: 'Cliquez sur Â« Ouvrir Meetizy Â» depuis l\'overlay pour retrouver la transcription complÃ¨te, le rÃ©sumÃ© IA et les action items dans votre tableau de bord.',
    icon: FileText,
    color: '#ec4899',
  },
];

export default function AgentInstall() {
  const detectedOS = navigator.platform.toLowerCase().includes('win')
    ? 'windows'
    : navigator.platform.toLowerCase().includes('mac')
    ? 'mac'
    : 'linux';

  return (
    <div style={{ padding: '32px', maxWidth: '900px', margin: '0 auto' }}>

      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '48px' }}>
        <div style={{
          width: '80px', height: '80px', margin: '0 auto 24px',
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Bot size={40} color="white" />
        </div>
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '12px' }}>
          Agent MEETIZY â€” icÃ´ne dans la barre des tÃ¢ches
        </h1>
        <p style={{ fontSize: '16px', color: 'var(--muted)', maxWidth: '580px', margin: '0 auto', lineHeight: '1.6' }}>
          Installez l'agent une seule fois. Il reste discret dans votre barre des tÃ¢ches et s'active d'un raccourci clavier pendant vos rÃ©unions Teams, Zoom ou Google Meet.
        </p>
      </div>

      {/* Download buttons */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(102,126,234,0.12) 0%, rgba(118,75,162,0.12) 100%)',
        border: '1px solid rgba(102,126,234,0.3)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: '48px',
        textAlign: 'center'
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '24px' }}>
          TÃ©lÃ©charger l'agent
        </h2>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {Object.entries(OS_LINKS).map(([os, { label, href }]) => (
            <button
              key={os}
              className={`btn ${os === detectedOS ? 'btn-primary' : 'btn-secondary'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '180px' }}
              onClick={() => toast.info('Build en cours â€” disponible lors du lancement officiel')}
            >
              <Download size={16} />
              {label}
              {os === detectedOS && (
                <span style={{
                  fontSize: '10px', fontWeight: '700', padding: '2px 6px',
                  background: 'rgba(255,255,255,0.25)', borderRadius: '999px', marginLeft: '4px'
                }}>RecommandÃ©</span>
              )}
            </button>
          ))}
        </div>
        <p style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '16px' }}>
          Aucune extension navigateur ni droit administrateur requis
        </p>
      </div>

      {/* Steps */}
      <h2 style={{ fontSize: '22px', fontWeight: '600', marginBottom: '24px' }}>
        Comment Ã§a marche
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '48px' }}>
        {installSteps.map((step, i) => {
          const Icon = step.icon;
          return (
            <div key={i} style={{
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              padding: '20px 24px',
              display: 'flex',
              gap: '20px',
              alignItems: 'flex-start'
            }}>
              <div style={{
                width: '44px', height: '44px', flexShrink: 0,
                borderRadius: '12px',
                background: `${step.color}20`,
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <Icon size={22} color={step.color} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                  <span style={{
                    width: '22px', height: '22px', borderRadius: '50%',
                    background: step.color, color: 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '12px', fontWeight: '700', flexShrink: 0
                  }}>{i + 1}</span>
                  <h3 style={{ fontSize: '16px', fontWeight: '600' }}>{step.title}</h3>
                </div>
                <p style={{ color: 'var(--muted)', fontSize: '14px', lineHeight: '1.55', marginLeft: '32px' }}>
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Keyboard shortcut callout */}
      <div style={{
        background: 'rgba(245,158,11,0.1)',
        border: '1px solid rgba(245,158,11,0.35)',
        borderRadius: '12px',
        padding: '20px 24px',
        marginBottom: '32px',
        display: 'flex', alignItems: 'center', gap: '16px'
      }}>
        <Keyboard size={28} color="#f59e0b" style={{ flexShrink: 0 }} />
        <div>
          <strong style={{ color: '#f59e0b' }}>Raccourci global : Ctrl + Shift + M</strong>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '4px' }}>
            Fonctionne mÃªme quand Meetizy est rÃ©duit. Sur macOS : Cmd + Shift + M.
            L'overlay apparaÃ®t par-dessus votre rÃ©union en bas Ã  droite de l'Ã©cran.
          </p>
        </div>
      </div>

      {/* Compatible with */}
      <div style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '32px'
      }}>
        <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={18} color="#10b981" /> Compatible avec tous vos outils de rÃ©union
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          {['Microsoft Teams', 'Zoom', 'Google Meet', 'Webex', 'Slack Huddle', 'Discord', 'Tout autre outil'].map(tool => (
            <span key={tool} style={{
              padding: '6px 14px',
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: '999px',
              fontSize: '13px',
              color: '#10b981',
              fontWeight: '500'
            }}>{tool}</span>
          ))}
        </div>
      </div>

      {/* Help */}
      <div style={{ textAlign: 'center', padding: '24px' }}>
        <p style={{ color: 'var(--muted)', marginBottom: '16px', fontSize: '14px' }}>
          Un problÃ¨me d'installation ? Notre support rÃ©pond en moins de 2h.
        </p>
        <button className="btn btn-secondary" onClick={() => toast.info('Support disponible lors du lancement')}>
          Contacter le support
        </button>
      </div>

    </div>
  );
}
