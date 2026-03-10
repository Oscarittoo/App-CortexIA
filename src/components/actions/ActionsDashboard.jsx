import React, { useState, useEffect } from 'react';
import { CheckSquare, Calendar, ArrowRight, Filter, Search } from 'lucide-react';
import storageService from '../../utils/storage';

export default function ActionsDashboard() {
  const [actions, setActions] = useState([]);
  const [filter, setFilter] = useState('all'); // all, pending, completed
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadActions();
  }, []);

  const loadActions = () => {
    const sessions = storageService.getAllSessions() || [];
    const actionStates = storageService.getActionStates();
    const allActions = [];

    sessions.forEach(session => {
      // Actions IA générées (avec deadline/assigné/priorité) — source principale
      if (session.actions && Array.isArray(session.actions)) {
        session.actions.forEach((action, index) => {
          const id = `${session.id}-ai-${index}`;
          allActions.push({
            id,
            text: action.task || action.text || 'Action sans description',
            sessionId: session.id,
            sessionTitle: session.title || 'Session sans titre',
            date: session.createdAt,
            status: actionStates[id]?.status || 'pending',
            responsible: action.responsible || 'À définir',
            deadline: action.deadline || 'À définir',
            priority: action.priority || 'Moyenne',
            source: 'ai'
          });
        });
      }

      // Actions détectées en temps réel (heuristique) — complément si pas d'actions IA
      const hasAiActions = session.actions && session.actions.length > 0;
      if (!hasAiActions && session.detectedActions && Array.isArray(session.detectedActions)) {
        session.detectedActions.forEach((actionText, index) => {
          const text = typeof actionText === 'string' ? actionText :
                       (actionText && actionText.text) ? actionText.text :
                       'Action sans description';
          const id = `${session.id}-rt-${index}`;
          allActions.push({
            id,
            text,
            sessionId: session.id,
            sessionTitle: session.title || 'Session sans titre',
            date: session.createdAt,
            status: actionStates[id]?.status || 'pending',
            responsible: 'À définir',
            deadline: 'À définir',
            priority: 'Moyenne',
            source: 'realtime'
          });
        });
      }
    });

    setActions(allActions.sort((a, b) => b.date - a.date));
  };

  const toggleActionStatus = (id) => {
    setActions(actions.map(action => {
      if (action.id !== id) return action;
      const nextStatus = action.status === 'completed' ? 'pending' : 'completed';
      storageService.setActionState(id, { status: nextStatus, updatedAt: Date.now() });
      return { ...action, status: nextStatus };
    }));
  };

  const filteredActions = actions.filter(action => {
    const matchesFilter = filter === 'all' || action.status === filter;
    const actionText = typeof action.text === 'string' ? action.text : '';
    const sessionTitle = typeof action.sessionTitle === 'string' ? action.sessionTitle : '';
    const matchesSearch = actionText.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         sessionTitle.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="screen actions-dashboard">
      <div className="page-header-simple">
        <div className="header-content">
          <h2>Mes Actions</h2>
          <p>Toutes les tâches identifiées par l'IA lors de vos réunions</p>
        </div>
        <div className="header-actions">
           <div className="search-bar">
             <Search size={16} />
             <input 
               type="text" 
               placeholder="Rechercher une action..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
             />
           </div>
        </div>
      </div>

      <div className="actions-filters">
        <button 
          className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          Tout voir
        </button>
        <button 
          className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
          onClick={() => setFilter('pending')}
        >
          À faire
          <span className="count-badge">{actions.filter(a => a.status === 'pending').length}</span>
        </button>
        <button 
          className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
          onClick={() => setFilter('completed')}
        >
          Terminées
        </button>
      </div>

      <div className="actions-list">
        {filteredActions.length > 0 ? (
          filteredActions.map(action => (
            <div key={action.id} className={`action-item ${action.status}`}>
              <div 
                className={`checkbox ${action.status === 'completed' ? 'checked' : ''}`}
                onClick={() => toggleActionStatus(action.id)}
              >
                {action.status === 'completed' && <CheckSquare size={16} />}
              </div>
              
              <div className="action-content">
                <div className="action-text">{action.text}</div>
                <div className="action-meta">
                  <span className="meta-tag source">
                    <Calendar size={12} />
                    {action.sessionTitle}
                  </span>
                  <span className="meta-tag date">
                    {new Date(action.date).toLocaleDateString()}
                  </span>
                  {action.responsible && action.responsible !== 'À définir' && (
                    <span className="meta-tag assignee">{action.responsible}</span>
                  )}
                  {action.deadline && action.deadline !== 'À définir' && (
                    <span className="meta-tag deadline">📅 {action.deadline}</span>
                  )}
                  {action.priority && action.priority !== 'Moyenne' && (
                    <span className={`meta-tag priority priority-${action.priority.toLowerCase()}`}>
                      {action.priority === 'Haute' ? '🔴' : '🔵'} {action.priority}
                    </span>
                  )}
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>Aucune action trouvée.</p>
          </div>
        )}
      </div>

      <style jsx>{`
        .actions-dashboard {
          padding: 24px;
          height: 100%;
          overflow-y: auto;
        }

        .page-header-simple {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .header-content h2 {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
          font-size: 36px;
          font-weight: 700;
          margin-bottom: 8px;
          color: var(--text-primary);
          letter-spacing: -0.8px;
        }

        .header-content p {
          color: var(--text-secondary);
        }

        .search-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(30, 41, 59, 0.5);
          border: 1px solid var(--border);
          padding: 14px 20px;
          border-radius: 8px;
          width: 320px;
        }
        
        .search-bar input {
          background: transparent;
          border: none;
          color: var(--text-primary);
          outline: none;
          width: 100%;
          font-size: 16px;
        }

        .actions-filters {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 16px;
        }

        .filter-btn {
          padding: 8px 16px;
          border-radius: 6px;
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
        }

        .filter-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          color: var(--text-primary);
        }

        .filter-btn.active {
          background: rgba(14, 165, 233, 0.1);
          color: #0ea5e9;
        }

        .count-badge {
          background: rgba(14, 165, 233, 0.2);
          color: #0ea5e9;
          font-size: 11px;
          padding: 2px 6px;
          border-radius: 10px;
        }

        .actions-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .action-item {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 16px;
          background: var(--bg-secondary);
          border: 1px solid var(--border);
          border-radius: 12px;
          transition: all 0.2s;
        }

        .action-item:hover {
          border-color: var(--accent);
          background: rgba(30, 41, 59, 0.7);
        }

        .action-item.completed .action-text {
          text-decoration: line-through;
          color: var(--text-secondary);
        }

        .checkbox {
          width: 24px;
          height: 24px;
          border: 2px solid var(--border);
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent);
          flex-shrink: 0;
        }

        .checkbox:hover {
          border-color: var(--accent);
        }

        .checkbox.checked {
          background: rgba(14, 165, 233, 0.1);
          border-color: var(--accent);
        }

        .action-content {
          flex: 1;
        }

        .action-text {
          font-size: 15px;
          margin-bottom: 8px;
          color: var(--text-primary);
        }

        .action-meta {
          display: flex;
          gap: 12px;
        }

        .meta-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-secondary);
          background: rgba(255, 255, 255, 0.05);
          padding: 4px 8px;
          border-radius: 4px;
        }

        .btn-icon {
          background: transparent;
          border: none;
          color: var(--text-secondary);
          cursor: pointer;
          padding: 8px;
          border-radius: 6px;
        }

        .btn-icon:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}
