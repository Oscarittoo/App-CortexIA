import { useState, useEffect } from 'react';
import { X, Save, Plus, Edit2, Trash2, Check } from 'lucide-react';
import storageService from '../utils/storage';
import toast from './Toast';

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
    setEditedSession(prev => ({
      ...prev,
      transcript: prev.transcript.filter(line => line.id !== lineId)
    }));
    toast.success('Segment supprimé');
  };

  const handleSpeakerChange = (lineId, newSpeaker) => {
    setEditedSession(prev => ({
      ...prev,
      transcript: prev.transcript.map(line =>
        line.id === lineId ? { ...line, speaker: newSpeaker } : line
      )
    }));
  };

  const handleSave = () => {
    const updated = {
      ...editedSession,
      tags: selectedTags,
      updatedAt: Date.now()
    };
    storageService.saveSession(updated);
    toast.success('Session sauvegardée avec succès !');
    onSave(updated);
  };

  const handleAddNote = () => {
    const note = prompt('Ajouter une note :');
    if (note && note.trim()) {
      setEditedSession(prev => ({
        ...prev,
        transcript: [
          ...prev.transcript,
          {
            id: Date.now(),
            timestamp: Date.now(),
            text: note.trim(),
            speaker: 'Note',
            isNote: true
          }
        ]
      }));
      toast.success('Note ajoutée');
    }
  };

  const toggleTag = (tagId) => {
    setSelectedTags(prev =>
      prev.includes(tagId)
        ? prev.filter(t => t !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        width: '90%',
        maxWidth: '1200px',
        height: '90vh',
        background: 'var(--card-bg)',
        borderRadius: '20px',
        border: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--hover-bg)'
        }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '700', margin: '0 0 4px 0' }}>
              Éditer la Session
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--muted)', margin: 0 }}>
              Modifiez la transcription et les métadonnées
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              color: 'var(--text)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'var(--hover-bg)';
              e.currentTarget.style.borderColor = 'var(--accent)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'var(--card-bg)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Toolbar */}
        <div style={{
          padding: '24px 32px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          background: 'var(--bg)'
        }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>
             Titre de la session
            </label>
            <input
              type="text"
              value={editedSession.title}
              onChange={(e) => setEditedSession({ ...editedSession, title: e.target.value })}
              placeholder="Titre de la session"
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--card-bg)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                color: 'var(--text)',
                fontSize: '14px',
                outline: 'none',
                transition: 'border-color 0.2s'
              }}
              onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
            />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: '600', color: 'var(--muted)', display: 'block', marginBottom: '8px' }}>
              Tags
            </label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {availableTags.map(tag => (
                <button
                  key={tag.id}
                  onClick={() => toggleTag(tag.id)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: selectedTags.includes(tag.id)
                      ? `${tag.color}30`
                      : 'var(--card-bg)',
                    border: selectedTags.includes(tag.id)
                      ? `2px solid ${tag.color}`
                      : '2px solid var(--border)',
                    color: selectedTags.includes(tag.id) ? tag.color : 'var(--text)',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleAddNote}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text)',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              alignSelf: 'flex-start',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'var(--hover-bg)';
              e.currentTarget.style.borderColor = 'var(--accent)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'var(--card-bg)';
              e.currentTarget.style.borderColor = 'var(--border)';
            }}
          >
            <Plus size={16} />
            Ajouter une note
          </button>
        </div>

        {/* Content */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '24px 32px'
        }}>
          {/* Participants */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: 'var(--muted)' }}>
              Participants détectés
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {participants.map((p, i) => (
                <span
                  key={i}
                  style={{
                    padding: '6px 12px',
                    background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                    border: '1px solid rgba(102, 126, 234, 0.3)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#667eea'
                  }}
                >
                  {p}
                </span>
              ))}
            </div>
          </div>

          {/* Transcript */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {editedSession.transcript?.map((line) => (
              <div
                key={line.id}
                style={{
                  padding: '16px',
                  background: line.isNote
                    ? 'rgba(245, 158, 11, 0.1)'
                    : 'var(--card-bg)',
                  border: line.isNote
                    ? '1px solid rgba(245, 158, 11, 0.3)'
                    : '1px solid var(--border)',
                  borderRadius: '12px',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      {new Date(line.timestamp).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </span>
                    <select
                      value={line.speaker}
                      onChange={(e) => handleSpeakerChange(line.id, e.target.value)}
                      style={{
                        padding: '4px 8px',
                        background: 'var(--hover-bg)',
                        border: '1px solid var(--border)',
                        borderRadius: '6px',
                        color: 'var(--text)',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        outline: 'none'
                      }}
                    >
                      {participants.map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                      <option value="Note">Note</option>
                      <option value="Système">Système</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setEditingLineId(line.id)}
                      style={{
                        padding: '6px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--muted)',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'var(--hover-bg)';
                        e.currentTarget.style.color = 'var(--accent)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--muted)';
                      }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteLine(line.id)}
                      style={{
                        padding: '6px',
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--muted)',
                        cursor: 'pointer',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                        e.currentTarget.style.color = '#ef4444';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--muted)';
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {editingLineId === line.id ? (
                  <div>
                    <textarea
                      value={line.text}
                      onChange={(e) => handleLineEdit(line.id, e.target.value)}
                      autoFocus
                      rows={3}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: 'var(--hover-bg)',
                        border: '1px solid var(--accent)',
                        borderRadius: '8px',
                        color: 'var(--text)',
                        fontSize: '14px',
                        fontFamily: 'inherit',
                        resize: 'vertical',
                        outline: 'none',
                        marginBottom: '8px'
                      }}
                    />
                    <button
                      onClick={() => setEditingLineId(null)}
                      style={{
                        padding: '8px 16px',
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: '8px',
                        color: 'white',
                        fontSize: '14px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        transition: 'all 0.2s'
                      }}
                      onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
                      onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <Check size={14} />
                      Valider
                    </button>
                  </div>
                ) : (
                  <p style={{
                    fontSize: '14px',
                    lineHeight: '1.6',
                    color: 'var(--text)',
                    margin: 0
                  }}>
                    {line.text}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 32px',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
          background: 'var(--hover-bg)'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '12px 24px',
              background: 'var(--card-bg)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              color: 'var(--text)',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
            onMouseOut={(e) => e.currentTarget.style.background = 'var(--card-bg)'}
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '12px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'all 0.2s'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <Save size={16} />
            Sauvegarder
          </button>
        </div>
      </div>
    </div>
  );
}
