import { useState, useEffect } from 'react';
import { Download, Edit, Trash2, FileText, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import AdvancedSearch from './AdvancedSearch';
import { useSearchSessions } from '../hooks/useAnalytics';
import storageService from '../utils/storage';
import pdfExportService from '../services/pdfExportService';
import toast from './Toast';

export default function SessionsHistoryV2({ onViewSession, onEditSession }) {
  const [sessions, setSessions] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilters, setSearchFilters] = useState({});
  
  const { results: filteredSessions, isSearching } = useSearchSessions(
    sessions,
    searchQuery,
    searchFilters
  );

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = () => {
    const loadedSessions = storageService.getAllSessions();
    setSessions(loadedSessions);
    
    const tags = new Set();
    loadedSessions.forEach(session => {
      session.tags?.forEach(tag => tags.add(tag));
    });
    setAvailableTags(Array.from(tags));
  };

  const handleSearch = (query, filters) => {
    setSearchQuery(query);
    setSearchFilters(filters);
  };

  const handleDelete = (sessionId) => {
    if (confirm('Are you sure you want to delete this session?')) {
      storageService.deleteSession(sessionId);
      toast.success('Session deleted successfully');
      loadSessions();
    }
  };

  const handleExportPDF = (session) => {
    try {
      const fileName = pdfExportService.exportSession(session);
      toast.success(`Exported as ${fileName}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export PDF');
    }
  };

  const handleExportAllPDF = () => {
    try {
      const fileName = pdfExportService.exportMultipleSessions(filteredSessions);
      toast.success(`Exported ${filteredSessions.length} sessions as ${fileName}`);
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export PDF');
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return 'N/A';
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="sessions-history-v2">
      <div className="history-header">
        <div>
          <h1>Sessions History</h1>
          <p className="text-secondary">{filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''} found</p>
        </div>
        
        {filteredSessions.length > 0 && (
          <button className="btn btn-secondary" onClick={handleExportAllPDF}>
            <Download size={18} />
            Export All to PDF
          </button>
        )}
      </div>

      <AdvancedSearch
        onSearch={handleSearch}
        availableTags={availableTags}
      />

      {isSearching && (
        <div className="loading-state">
          <p>Searching...</p>
        </div>
      )}

      {!isSearching && filteredSessions.length === 0 && (
        <div className="empty-state card">
          <FileText size={64} className="text-tertiary" />
          <h3>No sessions found</h3>
          <p className="text-secondary">
            {sessions.length === 0
              ? 'Start recording your first session to see it here'
              : 'Try adjusting your search filters'}
          </p>
        </div>
      )}

      {!isSearching && filteredSessions.length > 0 && (
        <div className="sessions-grid">
          {filteredSessions.map(session => (
            <div key={session.id} className="session-card card">
              <div className="session-card-header">
                <div className="session-title-row">
                  <h3 className="session-title">{session.title}</h3>
                  {session.tags && session.tags.length > 0 && (
                    <div className="session-tags">
                      {session.tags.map(tag => (
                        <span key={tag} className="badge badge-neutral">{tag}</span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="session-meta">
                  <span className="meta-item">
                    <Calendar size={14} />
                    {format(new Date(session.createdAt), 'MMM d, yyyy · HH:mm')}
                  </span>
                  <span className="meta-item">
                    {formatDuration(session.duration)}
                  </span>
                  {session.transcriptCount && (
                    <span className="meta-item">
                      {session.transcriptCount} segments
                    </span>
                  )}
                </div>
              </div>

              {session.summary && (
                <div className="session-summary">
                  {session.summary.substring(0, 150)}
                  {session.summary.length > 150 ? '...' : ''}
                </div>
              )}

              <div className="session-stats">
                {session.actions && session.actions.length > 0 && (
                  <div className="stat-badge">
                    <span className="stat-value">{session.actions.length}</span>
                    <span className="stat-label">Actions</span>
                  </div>
                )}
                {session.decisions && session.decisions.length > 0 && (
                  <div className="stat-badge">
                    <span className="stat-value">{session.decisions.length}</span>
                    <span className="stat-label">Decisions</span>
                  </div>
                )}
                {session.keyPoints && session.keyPoints.length > 0 && (
                  <div className="stat-badge">
                    <span className="stat-value">{session.keyPoints.length}</span>
                    <span className="stat-label">Key Points</span>
                  </div>
                )}
              </div>

              <div className="session-actions">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => onViewSession(session)}
                >
                  View
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => onEditSession(session)}
                >
                  <Edit size={14} />
                  Edit
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleExportPDF(session)}
                >
                  <Download size={14} />
                  PDF
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleDelete(session.id)}
                >
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .sessions-history-v2 {
          max-width: 1400px;
          margin: 0 auto;
          padding: var(--space-8);
        }

        .history-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: var(--space-6);
        }

        .history-header h1 {
          font-size: var(--font-size-3xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-text-primary);
          margin-bottom: var(--space-1);
        }

        .loading-state,
        .empty-state {
          text-align: center;
          padding: var(--space-16);
        }

        .empty-state h3 {
          margin: var(--space-4) 0 var(--space-2);
          color: var(--color-text-primary);
        }

        .sessions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
          gap: var(--space-6);
        }

        .session-card {
          display: flex;
          flex-direction: column;
          transition: all var(--transition-base);
        }

        .session-card:hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-lg);
        }

        .session-card-header {
          padding: var(--space-6);
          border-bottom: 1px solid var(--color-border-light);
        }

        .session-title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: var(--space-3);
          margin-bottom: var(--space-3);
        }

        .session-title {
          font-size: var(--font-size-lg);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-primary);
          flex: 1;
        }

        .session-tags {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-1);
        }

        .session-meta {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-3);
          font-size: var(--font-size-sm);
          color: var(--color-text-tertiary);
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: var(--space-1);
        }

        .session-summary {
          padding: var(--space-4) var(--space-6);
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          line-height: var(--line-height-relaxed);
        }

        .session-stats {
          display: flex;
          gap: var(--space-4);
          padding: var(--space-4) var(--space-6);
          border-top: 1px solid var(--color-border-light);
          border-bottom: 1px solid var(--color-border-light);
        }

        .stat-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--space-1);
        }

        .stat-value {
          font-size: var(--font-size-xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-primary);
        }

        .stat-label {
          font-size: var(--font-size-xs);
          color: var(--color-text-tertiary);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .session-actions {
          display: flex;
          gap: var(--space-2);
          padding: var(--space-4) var(--space-6);
        }
      `}</style>
    </div>
  );
}
