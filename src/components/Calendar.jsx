import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, Trash2, Clock, Users, MapPin, Video } from 'lucide-react';
import toast from './Toast';
import authService from '../services/authService';

/**
 * Composant Calendar - Gestion des réunions futures
 * Avec persistance dans localStorage
 */
export default function Calendar() {
  const [meetings, setMeetings] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMeeting, setNewMeeting] = useState({
    title: '',
    date: '',
    time: '',
    duration: '60',
    participants: '',
    type: 'video',
    location: ''
  });

  // Charger les réunions au montage du composant
  useEffect(() => {
    loadUserAndMeetings();
  }, []);

  // Sauvegarder les réunions à chaque modification
  useEffect(() => {
    if (currentUser) {
      saveMeetings();
    }
  }, [meetings, currentUser]);

  const loadUserAndMeetings = async () => {
    const user = await authService.getCurrentUser();
    setCurrentUser(user);

    if (user) {
      const stored = localStorage.getItem(`meetizy_meetings_${user.id}`);
      if (stored) {
        try {
          setMeetings(JSON.parse(stored));
        } catch (error) {
          console.error('Erreur chargement réunions:', error);
          setMeetings([]);
        }
      }
    }
  };

  const saveMeetings = () => {
    if (currentUser) {
      localStorage.setItem(`meetizy_meetings_${currentUser.id}`, JSON.stringify(meetings));
    }
  };

  const handleAddMeeting = () => {
    if (!newMeeting.title || !newMeeting.date || !newMeeting.time) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const meeting = {
      id: Date.now(),
      ...newMeeting,
      participants: parseInt(newMeeting.participants) || 1
    };

    setMeetings([...meetings, meeting]);
    setNewMeeting({ title: '', date: '', time: '', duration: '60', participants: '', type: 'video', location: '' });
    setShowAddForm(false);
    toast.success('Réunion ajoutée au calendrier');
  };

  const handleDeleteMeeting = (id) => {
    setMeetings(meetings.filter(m => m.id !== id));
    toast.success('Réunion supprimée');
  };

  const sortedMeetings = [...meetings].sort((a, b) => {
    const dateA = new Date(a.date + ' ' + a.time);
    const dateB = new Date(b.date + ' ' + b.time);
    return dateA - dateB;
  });

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const getUpcomingMeetings = () => {
    const now = new Date();
    return sortedMeetings.filter(m => new Date(m.date + ' ' + m.time) >= now);
  };

  const getPastMeetings = () => {
    const now = new Date();
    return sortedMeetings.filter(m => new Date(m.date + ' ' + m.time) < now);
  };

  const upcoming = getUpcomingMeetings();
  const past = getPastMeetings();

  return (
    <div className="calendar-container" style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CalendarIcon size={32} />
            Calendrier des Réunions
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '16px' }}>
            Planifiez et gérez vos futures réunions
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Plus size={20} />
          Nouvelle réunion
        </button>
      </div>

      {/* Add Meeting Form */}
      {showAddForm && (
        <div style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px' }}>
            Ajouter une réunion
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Titre de la réunion *
              </label>
              <input
                type="text"
                placeholder="Ex: Réunion d'équipe hebdomadaire"
                value={newMeeting.title}
                onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Date *
              </label>
              <input
                type="date"
                value={newMeeting.date}
                onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Heure *
              </label>
              <input
                type="time"
                value={newMeeting.time}
                onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Durée (minutes)
              </label>
              <input
                type="number"
                min="15"
                step="15"
                value={newMeeting.duration}
                onChange={(e) => setNewMeeting({ ...newMeeting, duration: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                  fontSize: '14px'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Nombre de participants
              </label>
              <input
                type="number"
                min="1"
                placeholder="Ex: 5"
                value={newMeeting.participants}
                onChange={(e) => setNewMeeting({ ...newMeeting, participants: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                  fontSize: '14px'
                }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', fontWeight: '500' }}>
                Lieu / Lien de la réunion
              </label>
              <input
                type="text"
                placeholder="Ex: Salle A3 ou https://meet.google.com/xxx"
                value={newMeeting.location}
                onChange={(e) => setNewMeeting({ ...newMeeting, location: e.target.value })}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'var(--input-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                  fontSize: '14px'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '20px', justifyContent: 'flex-end' }}>
            <button
              onClick={() => setShowAddForm(false)}
              className="btn btn-secondary"
            >
              Annuler
            </button>
            <button
              onClick={handleAddMeeting}
              className="btn btn-primary"
            >
              Ajouter
            </button>
          </div>
        </div>
      )}

      {/* Upcoming Meetings */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: '#10b981' }}>
          À venir ({upcoming.length})
        </h2>

        {upcoming.length === 0 ? (
          <div style={{
            background: 'var(--card-bg)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            padding: '48px',
            textAlign: 'center',
            color: 'var(--muted)'
          }}>
            <CalendarIcon size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p>Aucune réunion planifiée</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {upcoming.map(meeting => (
              <div
                key={meeting.id}
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '12px' }}>
                    {meeting.title}
                  </h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '14px', color: 'var(--muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CalendarIcon size={16} />
                      {formatDate(meeting.date)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={16} />
                      {meeting.time} ({meeting.duration} min)
                    </div>
                    {meeting.participants && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Users size={16} />
                        {meeting.participants} participants
                      </div>
                    )}
                    {meeting.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {meeting.type === 'video' ? <Video size={16} /> : <MapPin size={16} />}
                        {meeting.location}
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteMeeting(meeting.id)}
                  className="btn-icon-premium"
                  title="Supprimer"
                  style={{ color: '#ef4444' }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Meetings */}
      {past.length > 0 && (
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '16px', color: 'var(--muted)' }}>
            Réunions passées ({past.length})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', opacity: 0.6 }}>
            {past.map(meeting => (
              <div
                key={meeting.id}
                style={{
                  background: 'var(--card-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: '500', marginBottom: '8px' }}>
                    {meeting.title}
                  </h3>
                  <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
                    {formatDate(meeting.date)} à {meeting.time}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteMeeting(meeting.id)}
                  className="btn-icon-premium"
                  title="Supprimer"
                  style={{ color: '#ef4444' }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
