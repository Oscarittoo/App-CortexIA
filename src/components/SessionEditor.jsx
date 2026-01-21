import { useState, useEffect } from 'react';
import storageService from '../utils/storage';

export default function SessionEditor({ session, onSave, onClose }) {
  const [editedSession, setEditedSession] = useState(session);
  const [editingLineId, setEditingLineId] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [selectedTags, setSelectedTags] = useState(session.tags || []);
  const [availableTags, setAvailableTags] = useState([]);

  useEffect(() => {
    setAvailableTags(storageService.getAllTags());
    
    // Extraire les participants uniques
    const uniqueParticipants = [...new Set(
      session.transcript?.map(t => t.speaker).filter(Boolean) || []
    )];
    setParticipants(uniqueParticipants);
  }, []);

  const handleLineEdit = (lineId, newText) => {
    setEditedSession(prev => ({
      ...prev,
      transcript: prev.transcript.map(line =>
        line.id === lineId ? { ...line, text: newText } : line
      )
    }));
  };

  const handleDeleteLine = (lineId) => {
    if (confirm('Supprimer ce segment ?')) {
      setEditedSession(prev => ({
        ...prev,
        transcript: prev.transcript.filter(line => line.id !== lineId)
      }));
    }
  };

  const handleSpeakerChange = (lineId, newSpeaker) => {
    setEditedSession(prev => ({
      ...prev,
      transcript: prev.transcript.map(line =>
        line.id === lineId ? { ...line, speaker: newSpeaker } : line
      )
    }));
  };

  const handleAddNote = () => {
    const note = prompt('Ajouter une note :');
    if (note) {
      setEditedSession(prev => ({
        ...prev,
        transcript: [
          ...prev.transcript,
          {
            id: Date.now(),
            timestamp: Date.now(),
            text: note,
            speaker: 'Note',
            isNote: true
          }
        ]
      }));
    }
  };

  const handleSave = () => {
    const updated = {
      ...editedSession,
      tags: selectedTags,
      updatedAt: Date.now()
    };
    storageService.saveSession(updated);
    onSave(updated);
  };

  const toggleTag = (tagId) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <div className="editor-overlay">
      <div className="editor-modal">
        <div className="editor-header">
          <h2>Éditer la Session</h2>
          <button className="btn-close" onClick={onClose}>✕</button>
        </div>

        <div className="editor-toolbar">
          <input
            type="text"
            value={editedSession.title}
            onChange={(e) => setEditedSession({ ...editedSession, title: e.target.value })}
            className="title-input"
            placeholder="Titre de la session"
          />

          <div className="tags-section">
            <label>Tags :</label>
            <div className="tags-list">
              {availableTags.map(tag => (
                <button
                  key={tag.id}
                  className={`tag-chip ${selectedTags.includes(tag.id) ? 'active' : ''}`}
                  style={{ '--tag-color': tag.color }}
                  onClick={() => toggleTag(tag.id)}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          <button className="btn-secondary" onClick={handleAddNote}>
            Ajouter une note
          </button>
        </div>

        <div className="editor-content">
          <div className="participants-list">
            <h4>Participants détectés :</h4>
            {participants.map((p, i) => (
              <span key={i} className="participant-badge">{p}</span>
            ))}
          </div>

          <div className="transcript-editor">
            {editedSession.transcript?.map((line) => (
              <div
                key={line.id}
                className={`transcript-line-editor ${line.isNote ? 'note' : ''} ${line.marked ? 'marked' : ''}`}
              >
                <div className="line-meta">
                  <span className="timestamp">
                    {new Date(line.timestamp).toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit'
                    })}
                  </span>
                  <select
                    value={line.speaker}
                    onChange={(e) => handleSpeakerChange(line.id, e.target.value)}
                    className="speaker-select"
                  >
                    {participants.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                    <option value="Note">Note</option>
                    <option value="Système">Système</option>
                  </select>
                </div>

                {editingLineId === line.id ? (
                  <div className="line-edit">
                    <textarea
                      value={line.text}
                      onChange={(e) => handleLineEdit(line.id, e.target.value)}
                      autoFocus
                      rows={3}
                    />
                    <div className="edit-actions">
                      <button
                        className="btn-primary btn-sm"
                        onClick={() => setEditingLineId(null)}
                      >
                        ✓ Valider
                      </button>
                      <button
                        className="btn-secondary btn-sm"
                        onClick={() => setEditingLineId(null)}
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="line-display">
                    <p>{line.text}</p>
                    <div className="line-actions">
                      <button onClick={() => setEditingLineId(line.id)}>Éditer</button>
                      <button onClick={() => handleDeleteLine(line.id)}>🗑️</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="editor-footer">
          <button className="btn-secondary" onClick={onClose}>
            Annuler
          </button>
          <button className="btn-primary" onClick={handleSave}>
            💾 Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}
