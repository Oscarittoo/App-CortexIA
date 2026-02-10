// Meetizy Agent IA - Content Script
// Ce script s'exécute dans le contexte des pages de visioconférence

(function() {
  'use strict';

  console.log('Meetizy Agent IA - Content Script chargé');

  let isTranscribing = false;
  let recognitionInstance = null;
  let meetizyWidget = null;

  // Détecter la plateforme
  const platform = detectCurrentPlatform();
  console.log('Plateforme détectée:', platform);

  // Initialiser l'interface Meetizy
  initializeMeetizyWidget();

  // Écouter les messages du popup
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message reçu dans content script:', request);

    switch (request.action) {
      case 'startTranscription':
        startTranscription();
        sendResponse({ success: true });
        break;
        
      case 'stopTranscription':
        stopTranscription();
        sendResponse({ success: true });
        break;
        
      default:
        sendResponse({ success: false });
    }
  });

  // Détecter la plateforme de visioconférence
  function detectCurrentPlatform() {
    const url = window.location.href;
    if (url.includes('meet.google.com')) return 'Google Meet';
    if (url.includes('teams.microsoft.com')) return 'Microsoft Teams';
    if (url.includes('zoom.us')) return 'Zoom';
    return 'Unknown';
  }

  // Créer le widget Meetizy flottant
  function initializeMeetizyWidget() {
    // Créer le conteneur du widget
    meetizyWidget = document.createElement('div');
    meetizyWidget.id = 'meetizy-widget';
    meetizyWidget.innerHTML = `
      <div class="meetizy-widget-container">
        <div class="meetizy-header">
          <span class="meetizy-logo">🎯</span>
          <span class="meetizy-title">Meetizy IA</span>
          <button class="meetizy-close" id="meetizy-minimize">−</button>
        </div>
        <div class="meetizy-body">
          <div class="meetizy-status">
            <span class="status-indicator" id="status-indicator"></span>
            <span id="status-text">Prêt</span>
          </div>
          <div class="meetizy-transcript" id="meetizy-transcript">
            <p class="transcript-empty">Aucune transcription en cours</p>
          </div>
          <div class="meetizy-actions">
            <button class="btn-meetizy" id="meetizy-start">▶ Démarrer</button>
          </div>
        </div>
      </div>
    `;

    // Ajouter au DOM
    document.body.appendChild(meetizyWidget);

    // Ajouter les styles
    injectStyles();

    // Attacher les événements
    attachWidgetEvents();
  }

  // Injecter les styles CSS
  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #meetizy-widget {
        position: fixed;
        bottom: 20px;
        right: 20px;
        z-index: 999999;
        font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
      }

      .meetizy-widget-container {
        width: 320px;
        background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
        border-radius: 16px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
        border: 1px solid rgba(56, 189, 248, 0.3);
        overflow: hidden;
      }

      .meetizy-header {
        background: linear-gradient(135deg, #38bdf8, #0ea5e9);
        padding: 12px 16px;
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: move;
      }

      .meetizy-logo {
        font-size: 20px;
      }

      .meetizy-title {
        flex: 1;
        font-weight: 600;
        color: #000;
        font-size: 14px;
      }

      .meetizy-close {
        background: rgba(0, 0, 0, 0.1);
        border: none;
        color: #000;
        width: 24px;
        height: 24px;
        border-radius: 6px;
        cursor: pointer;
        font-size: 18px;
        line-height: 1;
      }

      .meetizy-close:hover {
        background: rgba(0, 0, 0, 0.2);
      }

      .meetizy-body {
        padding: 16px;
      }

      .meetizy-status {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 12px;
        padding: 8px 12px;
        background: rgba(255, 255, 255, 0.05);
        border-radius: 8px;
      }

      .status-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #10b981;
      }

      .status-indicator.recording {
        background: #ef4444;
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }

      #status-text {
        color: #fff;
        font-size: 13px;
        font-weight: 500;
      }

      .meetizy-transcript {
        min-height: 120px;
        max-height: 200px;
        overflow-y: auto;
        background: rgba(255, 255, 255, 0.03);
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 12px;
        font-size: 13px;
        line-height: 1.6;
        color: #e2e8f0;
      }

      .transcript-empty {
        color: #64748b;
        font-style: italic;
        text-align: center;
        margin: 40px 0;
      }

      .transcript-line {
        margin-bottom: 8px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }

      .transcript-line:last-child {
        border-bottom: none;
        margin-bottom: 0;
        padding-bottom: 0;
      }

      .transcript-speaker {
        color: #38bdf8;
        font-weight: 600;
        margin-right: 4px;
      }

      .btn-meetizy {
        width: 100%;
        padding: 10px;
        background: linear-gradient(135deg, #38bdf8, #0ea5e9);
        border: none;
        border-radius: 8px;
        color: #000;
        font-weight: 600;
        font-size: 13px;
        cursor: pointer;
        transition: transform 0.2s;
      }

      .btn-meetizy:hover {
        transform: translateY(-2px);
      }

      .btn-meetizy.stop {
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: #fff;
      }
    `;
    document.head.appendChild(style);
  }

  // Attacher les événements au widget
  function attachWidgetEvents() {
    // Bouton minimiser
    document.getElementById('meetizy-minimize').addEventListener('click', () => {
      meetizyWidget.style.display = 'none';
    });

    // Bouton démarrer/arrêter
    document.getElementById('meetizy-start').addEventListener('click', () => {
      if (isTranscribing) {
        stopTranscription();
      } else {
        startTranscription();
      }
    });

    // Rendre le widget déplaçable
    makeDraggable(meetizyWidget);
  }

  // Rendre le widget déplaçable
  function makeDraggable(element) {
    const header = element.querySelector('.meetizy-header');
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;

    header.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
      e.preventDefault();
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      element.style.top = (element.offsetTop - pos2) + 'px';
      element.style.left = (element.offsetLeft - pos1) + 'px';
      element.style.bottom = 'auto';
      element.style.right = 'auto';
    }

    function closeDragElement() {
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  // Démarrer la transcription
  function startTranscription() {
    if (!('webkitSpeechRecognition' in window)) {
      alert('La reconnaissance vocale n\'est pas supportée par votre navigateur.');
      return;
    }

    isTranscribing = true;
    
    // Mettre à jour l'interface
    document.getElementById('status-text').textContent = 'Transcription en cours...';
    document.getElementById('status-indicator').classList.add('recording');
    document.getElementById('meetizy-start').textContent = '⏸ Arrêter';
    document.getElementById('meetizy-start').classList.add('stop');
    document.querySelector('.transcript-empty')?.remove();

    // Initialiser la reconnaissance vocale
    recognitionInstance = new webkitSpeechRecognition();
    recognitionInstance.continuous = true;
    recognitionInstance.interimResults = true;
    recognitionInstance.lang = 'fr-FR';

    recognitionInstance.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        } else {
          interimTranscript += transcript;
        }
      }

      if (finalTranscript) {
        addTranscriptLine(finalTranscript);
        
        // Sauvegarder dans le background
        chrome.runtime.sendMessage({
          action: 'saveTranscript',
          data: {
            text: finalTranscript,
            speaker: 'Utilisateur',
            timestamp: new Date().toISOString()
          }
        });
      }
    };

    recognitionInstance.onerror = (event) => {
      console.error('Erreur de reconnaissance vocale:', event.error);
    };

    recognitionInstance.onend = () => {
      if (isTranscribing) {
        recognitionInstance.start(); // Redémarrer si toujours en cours
      }
    };

    recognitionInstance.start();

    // Notifier le background
    chrome.runtime.sendMessage({
      action: 'startSession',
      data: {
        platform: platform,
        title: document.title
      }
    });
  }

  // Arrêter la transcription
  function stopTranscription() {
    isTranscribing = false;
    
    if (recognitionInstance) {
      recognitionInstance.stop();
      recognitionInstance = null;
    }

    // Mettre à jour l'interface
    document.getElementById('status-text').textContent = 'Prêt';
    document.getElementById('status-indicator').classList.remove('recording');
    document.getElementById('meetizy-start').textContent = '▶ Démarrer';
    document.getElementById('meetizy-start').classList.remove('stop');

    // Notifier le background
    chrome.runtime.sendMessage({
      action: 'stopSession',
      data: {}
    });
  }

  // Ajouter une ligne de transcription
  function addTranscriptLine(text) {
    const transcriptDiv = document.getElementById('meetizy-transcript');
    const line = document.createElement('div');
    line.className = 'transcript-line';
    line.innerHTML = `<span class="transcript-speaker">Moi:</span>${text}`;
    transcriptDiv.appendChild(line);
    
    // Scroll vers le bas
    transcriptDiv.scrollTop = transcriptDiv.scrollHeight;
  }

})();
