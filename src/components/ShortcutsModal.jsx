import { useEffect } from 'react';

export default function ShortcutsModal({ onClose }) {
  
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const shortcuts = [
    { keys: ['Ctrl', 'N'], action: 'Nouvelle session' },
    { keys: ['Ctrl', 'S'], action: 'Sauvegarder' },
    { keys: ['Ctrl', 'F'], action: 'Rechercher' },
    { keys: ['Ctrl', 'H'], action: 'Historique' },
    { keys: ['Ctrl', 'D'], action: 'Dashboard' },
    { keys: ['Ctrl', 'E'], action: 'Exporter' },
    { keys: ['Ctrl', 'M'], action: 'Marquer moment' },
    { keys: ['Ctrl', 'B'], action: 'Backup' },
    { keys: ['Ctrl', 'T'], action: 'Mode sombre' },
    { keys: ['Ctrl', ','], action: 'Paramètres' },
    { keys: ['Espace'], action: 'Pause/Reprendre' },
    { keys: ['Échap'], action: 'Fermer/Retour' },
    { keys: ['Ctrl', '/'], action: 'Afficher raccourcis' },
  ];

  return (
    <div className="shortcuts-overlay" onClick={onClose}>
      <div className="shortcuts-modal" onClick={(e) => e.stopPropagation()}>
        <div className="shortcuts-header">
          <h2>⌨️ Raccourcis Clavier</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="shortcuts-content">
          <div className="shortcuts-grid">
            {shortcuts.map((shortcut, i) => (
              <div key={i} className="shortcut-item">
                <div className="shortcut-keys">
                  {shortcut.keys.map((key, j) => (
                    <span key={j}>
                      <kbd>{key}</kbd>
                      {j < shortcut.keys.length - 1 && <span className="plus">+</span>}
                    </span>
                  ))}
                </div>
                <div className="shortcut-action">{shortcut.action}</div>
              </div>
            ))}
          </div>

          <div className="shortcuts-footer">
            <p><strong>Astuce :</strong> Les raccourcis sont disponibles dans toute l'application</p>
          </div>
        </div>
      </div>
    </div>
  );
}
