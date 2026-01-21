// Hook pour gérer les raccourcis clavier
import { useEffect } from 'react';

const useKeyboardShortcuts = (callbacks, enabled = true) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e) => {
      // Ctrl+N : Nouvelle session
      if (e.ctrlKey && e.key === 'n') {
        e.preventDefault();
        callbacks.onNewSession?.();
      }

      // Ctrl+S : Sauvegarder
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        callbacks.onSave?.();
      }

      // Ctrl+F : Rechercher
      if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        callbacks.onSearch?.();
      }

      // Ctrl+E : Export
      if (e.ctrlKey && e.key === 'e') {
        e.preventDefault();
        callbacks.onExport?.();
      }

      // Espace : Pause/Reprendre (uniquement si en session active)
      if (e.key === ' ' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        callbacks.onTogglePause?.();
      }

      // Ctrl+M : Marquer moment important
      if (e.ctrlKey && e.key === 'm') {
        e.preventDefault();
        callbacks.onMarkMoment?.();
      }

      // Ctrl+H : Historique
      if (e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        callbacks.onHistory?.();
      }

      // Ctrl+D : Dashboard
      if (e.ctrlKey && e.key === 'd') {
        e.preventDefault();
        callbacks.onDashboard?.();
      }

      // Ctrl+, : Paramètres
      if (e.ctrlKey && e.key === ',') {
        e.preventDefault();
        callbacks.onSettings?.();
      }

      // Escape : Fermer modal/retour
      if (e.key === 'Escape') {
        callbacks.onClose?.();
      }

      // Ctrl+B : Backup
      if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        callbacks.onBackup?.();
      }

      // Ctrl+T : Toggle theme (mode sombre)
      if (e.ctrlKey && e.key === 't') {
        e.preventDefault();
        callbacks.onToggleTheme?.();
      }

      // Ctrl+/ : Afficher les raccourcis
      if (e.ctrlKey && e.key === '/') {
        e.preventDefault();
        callbacks.onShowShortcuts?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [callbacks, enabled]);
};

export default useKeyboardShortcuts;
