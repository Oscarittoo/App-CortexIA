import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, Trash2, Clock, Users, MapPin, Video, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from './Toast';
import authService from '../services/authService';
import teamService from '../services/teamService';

/**
 * Composant Calendar - Gestion des réunions futures avec vue calendrier
 * Avec partage d'équipe via Supabase
 */
export default function Calendar() {
  const [meetings, setMeetings] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isInTeam, setIsInTeam] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
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
      try {
        // Vérifier si l'utilisateur fait partie d'une équipe
        const inTeam = await teamService.isInTeam();
        setIsInTeam(inTeam);

        if (inTeam) {
          // Charger les réunions partagées de l'équipe
          const teamMeetings = await teamService.getTeamMeetings();
          setMeetings(teamMeetings);
        } else {
          // Fallback localStorage pour utilisateurs sans équipe
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
      } catch (error) {
        console.error('Erreur chargement:', error);
        // Fallback localStorage
        const stored = localStorage.getItem(`meetizy_meetings_${user.id}`);
        if (stored) {
          setMeetings(JSON.parse(stored));
        }
      }
    }
  };

  const saveMeetings = () => {
    // Ne plus sauvegarder dans localStorage si l'utilisateur est dans une équipe
    // Les données sont automatiquement sauvegardées dans Supabase
    if (currentUser && !isInTeam) {
      localStorage.setItem(`meetizy_meetings_${currentUser.id}`, JSON.stringify(meetings));
    }
  };

  const handleAddMeeting = async () => {
    if (!newMeeting.title || !newMeeting.date || !newMeeting.time) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const meeting = {
      id: Date.now(),
      ...newMeeting,
      participants: parseInt(newMeeting.participants) || 1
    };

    try {
      if (isInTeam) {
        // Sauvegarder dans Supabase (partagé avec l'équipe)
        await teamService.saveSharedMeeting(meeting);
        // Recharger les réunions
        await loadUserAndMeetings();
      } else {
        // Mode local (localStorage)
        setMeetings([...meetings, meeting]);
      }
      
      setNewMeeting({ title: '', date: '', time: '', duration: '60', participants: '', type: 'video', location: '' });
      setShowAddForm(false);
      toast.success(isInTeam ? 'Réunion ajoutée et partagée avec l\'équipe' : 'Réunion ajoutée au calendrier');
    } catch (error) {
      console.error('Erreur ajout réunion:', error);
      toast.error('Erreur lors de l\'ajout de la réunion');
    }
  };

  const handleDeleteMeeting = async (id) => {
    try {
      if (isInTeam) {
        // Supprimer dans Supabase
        await teamService.deleteMeeting(id);
        // Recharger
        await loadUserAndMeetings();
      } else {
        // Mode local
        setMeetings(meetings.filter(m => m.id !== id));
      }
      toast.success('Réunion supprimée');
    } catch (error) {
      console.error('Erreur suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
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

  // Fonctions pour le calendrier
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    // Jours du mois précédent
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      days.push({ date: prevDate, isCurrentMonth: false });
    }
    // Jours du mois actuel
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({ date: new Date(year, month, i), isCurrentMonth: true });
    }
    // Jours du mois suivant pour compléter la grille
    const remainingDays = 42 - days.length; // 6 semaines * 7 jours
    for (let i = 1; i <= remainingDays; i++) {
      days.push({ date: new Date(year, month + 1, i), isCurrentMonth: false });
    }
    return days;
  };

  const getMeetingsForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0];
    return meetings.filter(m => m.date === dateStr);
  };

  const handleDayClick = (day) => {
    if (!day.isCurrentMonth) return;
    const dateStr = day.date.toISOString().split('T')[0];
    setSelectedDate(dateStr);
    setNewMeeting({ ...newMeeting, date: dateStr });
    setShowAddForm(true);
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const days = getDaysInMonth(currentMonth);
  const weekDays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const upcoming = getUpcomingMeetings();

  return (
    <div className="calendar-container" style={{ padding: '32px', maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <CalendarIcon size={32} />
            Calendrier des Réunions
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '16px' }}>
            {upcoming.length} réunion(s) à venir
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedDate(new Date().toISOString().split('T')[0]);
            setNewMeeting({ ...newMeeting, date: new Date().toISOString().split('T')[0] });
            setShowAddForm(true);
          }}
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

      {/* Vue Calendrier Mensuel */}
      <div style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '16px',
        padding: '24px',
        marginBottom: '32px'
      }}>
        {/* Navigation mois */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <button onClick={prevMonth} className="btn-icon-premium">
            <ChevronLeft size={20} />
          </button>
          <h2 style={{ fontSize: '20px', fontWeight: '600', textTransform: 'capitalize' }}>
            {currentMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={nextMonth} className="btn-icon-premium">
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Jours de la semaine */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginBottom: '8px' }}>
          {weekDays.map(day => (
            <div key={day} style={{ textAlign: 'center', fontSize: '13px', fontWeight: '600', color: 'var(--muted)', padding: '8px 0' }}>
              {day}
            </div>
          ))}
        </div>

        {/* Grille des jours */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
          {days.map((day, index) => {
            const dayMeetings = getMeetingsForDate(day.date);
            const isTodayDate = isToday(day.date);
            
            return (
              <div
                key={index}
                onClick={() => handleDayClick(day)}
                style={{
                  minHeight: '80px',
                  padding: '8px',
                  border: `1px solid ${isTodayDate ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: '8px',
                  background: day.isCurrentMonth ? 'var(--bg)' : 'transparent',
                  opacity: day.isCurrentMonth ? 1 : 0.3,
                  cursor: day.isCurrentMonth ? 'pointer' : 'default',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  if (day.isCurrentMonth) {
                    e.currentTarget.style.background = 'rgba(56, 189, 248, 0.05)';
                    e.currentTarget.style.borderColor = 'var(--accent)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (day.isCurrentMonth) {
                    e.currentTarget.style.background = 'var(--bg)';
                    e.currentTarget.style.borderColor = isTodayDate ? 'var(--accent)' : 'var(--border)';
                  }
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: isTodayDate ? '700' : '500', color: isTodayDate ? 'var(--accent)' : 'var(--text)', marginBottom: '4px' }}>
                  {day.date.getDate()}
                </div>
                {dayMeetings.length > 0 && (
                  <div style={{ marginTop: '4px' }}>
                    {dayMeetings.slice(0, 2).map(meeting => (
                      <div 
                        key={meeting.id}
                        style={{
                          fontSize: '10px',
                          padding: '2px 4px',
                          background: 'rgba(56, 189, 248, 0.2)',
                          borderRadius: '4px',
                          marginBottom: '2px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          color: 'var(--accent)'
                        }}
                        title={`${meeting.time} - ${meeting.title}`}
                      >
                        {meeting.time} {meeting.title}
                      </div>
                    ))}
                    {dayMeetings.length > 2 && (
                      <div style={{ fontSize: '10px', color: 'var(--muted)', textAlign: 'center' }}>
                        +{dayMeetings.length - 2}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

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
    </div>
  );
}
