import { useState, useEffect } from 'react';
import { ClipboardList, Video, Mic, Monitor, MessageSquare, Gamepad2, Calendar } from 'lucide-react';
import storageService from '../utils/storage';

export default function SessionsHistory({ onViewSession }) {
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // grid | list
  const [sortBy, setSortBy] = useState('date-desc'); // date-desc, date-asc, duration-desc, title
  const [filters, setFilters] = useState({
    dateFrom: null,
    dateTo: null,
    tags: [],
    platform: '',
    language: '',
  });
  const [tags, setTags] = useState([]);

  useEffect(() => {
    loadSessions();
    setTags(storageService.getAllTags());
  }, []);

  useEffect(() => {
    applyFilters();
  }, [sessions, searchQuery, sortBy, filters]);

  const loadSessions = () => {
    const allSessions = storageService.getAllSessions();
    setSessions(allSessions);
  };

  const applyFilters = () => {
    let result = [...sessions];

    // Recherche textuelle
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(session =>
        session.title?.toLowerCase().includes(query) ||
        session.transcript?.some(t => t.text.toLowerCase().includes(query))
      );
    }

    // Filtres avancés
    if (filters.dateFrom) {
      result = result.filter(s => s.createdAt >= new Date(filters.dateFrom).getTime());
    }
    if (filters.dateTo) {
      result = result.filter(s => s.createdAt <= new Date(filters.dateTo).getTime());
    }
    if (filters.tags.length > 0) {
      result = result.filter(s => s.tags?.some(tag => filters.tags.includes(tag)));
    }
    if (filters.platform) {
      result = result.filter(s => s.platform === filters.platform);
    }
    if (filters.language) {
      result = result.filter(s => s.language === filters.language);
    }

    // Tri
    result.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return b.createdAt - a.createdAt;
        case 'date-asc':
          return a.createdAt - b.createdAt;
        case 'duration-desc':
          return (b.duration || 0) - (a.duration || 0);
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
        default:
          return 0;
      }
    });

    setFilteredSessions(result);
  };

  const handleDelete = (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette session ?')) {
      storageService.deleteSession(id);
      loadSessions();
    }
  };

  const handleExport = () => {
    storageService.createBackup();
  };

  const toggleTag = (tagId) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tagId)
        ? prev.tags.filter(t => t !== tagId)
        : [...prev.tags, tagId]
    }));
  };

  const clearFilters = () => {
    setFilters({
      dateFrom: null,
      dateTo: null,
      tags: [],
      platform: '',
      language: '',
    });
    setSearchQuery('');
  };

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}min`;
    return `${mins} min`;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      local: <Mic size={16} />,
      zoom: <Video size={16} />,
      'google-meet': <Video size={16} />,
      teams: <Monitor size={16} />,
      webex: <Monitor size={16} />,
      slack: <MessageSquare size={16} />,
      discord: <Gamepad2 size={16} />
    };
    return icons[platform] || <Mic size={16} />;
  };

  return (
    <div className="screen sessions-history">
      {sessions.length === 0 ? (
        // Page vide élégante sans filtres
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: 'calc(100vh - 120px)',
          padding: '40px'
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '500px'
          }}>
            <div style={{
              width: '140px',
              height: '140px',
              margin: '0 auto 40px',
              background: 'var(--color-bg-secondary)',
              border: '2px solid var(--color-border-medium)',
              borderRadius: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-tertiary)',
            }}>
              <ClipboardList size={64} strokeWidth={1.5} />
            </div>
            <h2 style={{
              fontSize: '28px',
              fontWeight: '600',
              color: 'var(--color-text-primary)',
              marginBottom: '12px',
              letterSpacing: '-0.01em'
            }}>Aucune session enregistrée</h2>
            <p style={{
              fontSize: '16px',
              color: 'var(--color-text-secondary)',
              lineHeight: '1.6',
              marginBottom: '32px',
              fontWeight: '400'
            }}>
              Commencez par créer votre première réunion pour construire votre historique et accéder à des statistiques détaillées.
            </p>
            <button 
              onClick={() => window.location.hash = '#new'}
              className="btn-primary"
              style={{
                padding: '12px 32px',
                fontSize: '15px',
              }}
            >
              Créer ma première session
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="sessions-header">
        <div className="header-top">
          <h2>Historique des Sessions</h2>
          <div className="header-actions">
            <button className="btn-secondary" onClick={handleExport}>
              Exporter tout
            </button>
          </div>
        </div>

        <div className="search-bar">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
          </svg>
          <input
            type="text"
            placeholder="Rechercher dans les sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="btn-clear" onClick={() => setSearchQuery('')}>×</button>
          )}
        </div>

        <div className="filters-bar">
          <div className="filters-left">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="date-desc">Plus récent</option>
              <option value="date-asc">Plus ancien</option>
              <option value="duration-desc">Durée</option>
              <option value="title">Titre (A-Z)</option>
            </select>

            <select value={filters.platform} onChange={(e) => setFilters({...filters, platform: e.target.value})}>
              <option value="">Toutes plateformes</option>
              <option value="local">Local</option>
              <option value="zoom">Zoom</option>
              <option value="google-meet">Google Meet</option>
              <option value="teams">Teams</option>
              <option value="webex">Webex</option>
            </select>

            <select value={filters.language} onChange={(e) => setFilters({...filters, language: e.target.value})}>
              <option value="">Toutes langues</option>
              <option value="fr">Français</option>
              <option value="en">Anglais</option>
            </select>

            <div className="date-filters">
              <div className="date-input-wrapper">
                <Calendar size={16} strokeWidth={2} />
                <input
                  type="date"
                  value={filters.dateFrom || ''}
                  onChange={(e) => setFilters({...filters, dateFrom: e.target.value})}
                  placeholder="De"
                />
              </div>
              <span>→</span>
              <div className="date-input-wrapper">
                <Calendar size={16} strokeWidth={2} />
                <input
                  type="date"
                  value={filters.dateTo || ''}
                  onChange={(e) => setFilters({...filters, dateTo: e.target.value})}
                  placeholder="À"
                />
              </div>
            </div>

            {(searchQuery || filters.tags.length > 0 || filters.platform || filters.language || filters.dateFrom) && (
              <button className="btn-link" onClick={clearFilters}>
                Effacer les filtres
              </button>
            )}
          </div>

          <div className="view-toggle">
            <button
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
              title="Vue grille"
            >
              ⊞
            </button>
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
              title="Vue liste"
            >
              ☰
            </button>
          </div>
        </div>

        <div className="tags-filter">
          {tags.map(tag => (
            <button
              key={tag.id}
              className={`tag-chip ${filters.tags.includes(tag.id) ? 'active' : ''}`}
              onClick={() => toggleTag(tag.id)}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>

      <div className="sessions-stats">
        <div className="stat">
          <span className="stat-number">{filteredSessions.length}</span>
          <span className="stat-label">Sessions</span>
        </div>
        <div className="stat">
          <span className="stat-number">
            {formatDuration(filteredSessions.reduce((sum, s) => sum + (s.duration || 0), 0))}
          </span>
          <span className="stat-label">Temps total</span>
        </div>
      </div>

      {filteredSessions.length === 0 ? (
        <div className="empty-state" style={{
          textAlign: 'center',
          padding: '80px 40px',
          maxWidth: '600px',
          margin: '40px auto'
        }}>
          <div style={{
            width: '120px',
            height: '120px',
            margin: '0 auto 32px',
            background: 'var(--color-bg-secondary)',
            border: '2px solid var(--color-border-medium)',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-tertiary)',
          }}>
            <ClipboardList size={56} strokeWidth={1.5} />
          </div>
          <h3 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: '#1e293b',
            marginBottom: '12px'
          }}>
            {sessions.length === 0 ? 'Aucune session enregistrée' : 'Aucun résultat'}
          </h3>
          <p style={{
            fontSize: '16px',
            color: '#64748b',
            lineHeight: '1.6',
            marginBottom: '32px'
          }}>
            {sessions.length === 0 
              ? 'Lancez votre première réunion pour commencer à construire votre historique de sessions.'
              : 'Aucune session ne correspond à vos critères de recherche. Essayez d\'ajuster vos filtres.'
            }
          </p>
          {sessions.length === 0 ? (
            <button 
              onClick={() => window.location.hash = '#new'}
              className="btn-primary"
            >
              Créer une session
            </button>
          ) : (
            <button 
              onClick={clearFilters}
              className="btn-secondary"
            >
              Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : (
        <div className={`sessions-${viewMode}`}>
          {filteredSessions.map(session => (
            <div key={session.id} className="session-card">
              <div className="session-card-header">
                <div className="session-platform">
                  {getPlatformIcon(session.platform)}
                </div>
                <h3>{session.title || 'Session sans titre'}</h3>
              </div>

              <div className="session-card-meta">
                <span className="meta-item">
                  {formatDate(session.createdAt)}
                </span>
                <span className="meta-item">
                  {formatDuration(session.duration || 0)}
                </span>
                <span className="meta-item">
                  {session.transcript?.length || 0} segments
                </span>
              </div>

              {session.tags && session.tags.length > 0 && (
                <div className="session-tags">
                  {session.tags.map(tagId => {
                    const tag = tags.find(t => t.id === tagId);
                    return tag ? (
                      <span key={tagId} className="tag-small">
                        {tag.name}
                      </span>
                    ) : null;
                  })}
                </div>
              )}

              <div className="session-card-actions">
                <button
                  className="btn-secondary btn-sm"
                  onClick={() => onViewSession(session)}
                >
                  Voir
                </button>
                <button
                  className="btn-secondary btn-sm"
                  onClick={() => handleDelete(session.id)}
                >
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
        </>
      )}
    </div>
  );
}
