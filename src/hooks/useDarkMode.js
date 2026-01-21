// Hook pour gérer le mode sombre
import { useEffect, useState } from 'react';
import storageService from '../utils/storage';

const useDarkMode = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const settings = storageService.getSettings();
    return settings.darkMode || false;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }

    // Sauvegarder la préférence
    const settings = storageService.getSettings();
    storageService.saveSettings({ ...settings, darkMode });
  }, [darkMode]);

  const toggle = () => setDarkMode(!darkMode);

  return [darkMode, toggle];
};

export default useDarkMode;
