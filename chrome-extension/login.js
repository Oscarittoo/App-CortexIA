// Script de connexion/inscription pour l'extension Meetizy
import authService from './auth-service.js';

// Éléments DOM
const tabs = document.querySelectorAll('.tab');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');
const loading = document.getElementById('loading');

// Gestion des onglets
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const tabName = tab.dataset.tab;
    
    // Mettre à jour les onglets actifs
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    // Afficher le bon formulaire
    if (tabName === 'login') {
      loginForm.classList.add('active');
      registerForm.classList.remove('active');
    } else {
      registerForm.classList.add('active');
      loginForm.classList.remove('active');
    }
    
    // Réinitialiser les messages
    hideMessages();
  });
});

// Soumission du formulaire de connexion
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  hideMessages();
  showLoading(true);
  
  try {
    const result = await authService.login(email, password);
    
    if (result.success) {
      showSuccess('Connexion réussie ! Redirection...');
      
      // Rediriger vers le popup après 1 seconde
      setTimeout(() => {
        window.location.href = 'popup.html';
      }, 1000);
    } else {
      showError(result.error || 'Erreur de connexion');
    }
  } catch (error) {
    showError('Impossible de se connecter au serveur Meetizy');
  } finally {
    showLoading(false);
  }
});

// Soumission du formulaire d'inscription
registerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const name = document.getElementById('registerName').value;
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  
  // Validation
  if (password.length < 6) {
    showError('Le mot de passe doit contenir au moins 6 caractères');
    return;
  }
  
  hideMessages();
  showLoading(true);
  
  try {
    const result = await authService.register(name, email, password);
    
    if (result.success) {
      showSuccess('Compte créé avec succès ! Redirection...');
      
      // Rediriger vers le popup après 1 seconde
      setTimeout(() => {
        window.location.href = 'popup.html';
      }, 1000);
    } else {
      showError(result.error || 'Erreur lors de la création du compte');
    }
  } catch (error) {
    showError('Impossible de se connecter au serveur Meetizy');
  } finally {
    showLoading(false);
  }
});

// Fonctions utilitaires
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.classList.add('show');
}

function showSuccess(message) {
  successMessage.textContent = message;
  successMessage.classList.add('show');
}

function hideMessages() {
  errorMessage.classList.remove('show');
  successMessage.classList.remove('show');
}

function showLoading(show) {
  if (show) {
    loading.classList.add('show');
    loginForm.style.display = 'none';
    registerForm.style.display = 'none';
  } else {
    loading.classList.remove('show');
    const activeTab = document.querySelector('.tab.active').dataset.tab;
    if (activeTab === 'login') {
      loginForm.style.display = 'flex';
    } else {
      registerForm.style.display = 'flex';
    }
  }
}

// Vérifier si déjà connecté au chargement
document.addEventListener('DOMContentLoaded', async () => {
  await authService.loadToken();
  
  if (authService.isAuthenticated()) {
    // Déjà connecté, rediriger vers le popup
    window.location.href = 'popup.html';
  }
});
