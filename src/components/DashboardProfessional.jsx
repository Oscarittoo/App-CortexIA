import { useMemo } from 'react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, CheckCircle, AlertCircle, BarChart3, Calendar } from 'lucide-react';
import { useSessionAnalytics } from '../hooks/useAnalytics';
import { format } from 'date-fns';

export default function DashboardProfessional({ sessions }) {
  const analytics = useSessionAnalytics(sessions);

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#ef4444', '#f59e0b', '#10b981', '#14b8a6', '#06b6d4', '#3b82f6'];

  const tagData = useMemo(() => {
    return Object.entries(analytics.sessionsByTag)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [analytics.sessionsByTag]);

  return (
    <div className="dashboard-professional">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p className="text-secondary">Overview of your meeting activity</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
            <BarChart3 size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Sessions</div>
            <div className="stat-value">{analytics.totalSessions}</div>
            <div className="stat-change positive">
              <TrendingUp size={14} />
              {analytics.sessionsThisMonth} this month
            </div>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--color-success-light)', color: 'var(--color-success)' }}>
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Total Time</div>
            <div className="stat-value">{formatDuration(analytics.totalDuration)}</div>
            <div className="stat-change">
              Avg: {formatDuration(analytics.averageDuration)}
            </div>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--color-info-light)', color: 'var(--color-info)' }}>
            <CheckCircle size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Action Items</div>
            <div className="stat-value">{analytics.totalActions}</div>
            <div className="stat-change">
              Across all sessions
            </div>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--color-warning-light)', color: 'var(--color-warning)' }}>
            <AlertCircle size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">Decisions Made</div>
            <div className="stat-value">{analytics.totalDecisions}</div>
            <div className="stat-change">
              Critical insights
            </div>
          </div>
        </div>

        <div className="stat-card card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
            <Calendar size={24} />
          </div>
          <div className="stat-content">
            <div className="stat-label">This Week</div>
            <div className="stat-value">{analytics.sessionsThisWeek}</div>
            <div className="stat-change">
              Sessions recorded
            </div>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card card">
          <div className="card-header">
            <h3>Activity Over Time</h3>
            <p className="text-secondary text-sm">Last 7 days</p>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.sessionsByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                <XAxis 
                  dataKey="date" 
                  stroke="var(--color-text-tertiary)"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="var(--color-text-tertiary)"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'var(--color-bg-primary)',
                    border: '1px solid var(--color-border-medium)',
                    borderRadius: 'var(--radius-md)',
                  }}
                />
                <Bar dataKey="count" fill="var(--color-primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="chart-card card">
          <div className="card-header">
            <h3>Top Tags</h3>
            <p className="text-secondary text-sm">Most used categories</p>
          </div>
          <div className="card-body">
            {tagData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={tagData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ tag, percent }) => `${tag} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={100}
                    fill="var(--color-primary)"
                    dataKey="count"
                  >
                    {tagData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'var(--color-bg-primary)',
                      border: '1px solid var(--color-border-medium)',
                      borderRadius: 'var(--radius-md)',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="empty-chart">
                <p>No tags data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="recent-activity card">
        <div className="card-header">
          <h3>Recent Sessions</h3>
          <p className="text-secondary text-sm">Latest activity</p>
        </div>
        <div className="card-body">
          {sessions.length > 0 ? (
            <div className="sessions-list">
              {sessions.slice(0, 5).map(session => (
                <div key={session.id} className="session-item">
                  <div className="session-info">
                    <div className="session-title">{session.title}</div>
                    <div className="session-meta">
                      {format(new Date(session.createdAt), 'MMM d, yyyy')} ·{' '}
                      {session.duration ? formatDuration(session.duration) : 'No duration'}
                      {session.tags?.length > 0 && (
                        <>
                          {' · '}
                          {session.tags.map(tag => (
                            <span key={tag} className="badge badge-neutral">{tag}</span>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="session-stats">
                    {session.actions?.length > 0 && (
                      <span className="stat-badge">
                        <CheckCircle size={14} />
                        {session.actions.length}
                      </span>
                    )}
                    {session.decisions?.length > 0 && (
                      <span className="stat-badge">
                        <AlertCircle size={14} />
                        {session.decisions.length}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <p>No sessions yet. Start recording to see analytics.</p>
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .dashboard-professional {
          padding: var(--space-8);
          max-width: 1400px;
          margin: 0 auto;
        }

        .dashboard-header {
          margin-bottom: var(--space-8);
        }

        .dashboard-header h1 {
          font-size: var(--font-size-3xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-text-primary);
          margin-bottom: var(--space-2);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: var(--space-4);
          margin-bottom: var(--space-8);
        }

        .stat-card {
          display: flex;
          gap: var(--space-4);
          padding: var(--space-6);
        }

        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          border-radius: var(--radius-lg);
          flex-shrink: 0;
        }

        .stat-content {
          flex: 1;
        }

        .stat-label {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          margin-bottom: var(--space-1);
        }

        .stat-value {
          font-size: var(--font-size-3xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-text-primary);
          margin-bottom: var(--space-1);
        }

        .stat-change {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          font-size: var(--font-size-xs);
          color: var(--color-text-tertiary);
        }

        .stat-change.positive {
          color: var(--color-success);
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: var(--space-6);
          margin-bottom: var(--space-8);
        }

        .chart-card {
          min-height: 400px;
        }

        .empty-chart {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 300px;
          color: var(--color-text-tertiary);
        }

        .recent-activity {
          width: 100%;
        }

        .sessions-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .session-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: var(--space-4);
          background-color: var(--color-bg-secondary);
          border-radius: var(--radius-md);
          transition: all var(--transition-fast);
        }

        .session-item:hover {
          background-color: var(--color-bg-hover);
        }

        .session-info {
          flex: 1;
        }

        .session-title {
          font-size: var(--font-size-base);
          font-weight: var(--font-weight-medium);
          color: var(--color-text-primary);
          margin-bottom: var(--space-1);
        }

        .session-meta {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          flex-wrap: wrap;
          font-size: var(--font-size-sm);
          color: var(--color-text-tertiary);
        }

        .session-stats {
          display: flex;
          gap: var(--space-3);
        }

        .stat-badge {
          display: flex;
          align-items: center;
          gap: var(--space-1);
          padding: var(--space-1) var(--space-2);
          background-color: var(--color-bg-tertiary);
          border-radius: var(--radius-sm);
          font-size: var(--font-size-xs);
          font-weight: var(--font-weight-medium);
          color: var(--color-text-secondary);
        }

        .empty-state {
          text-align: center;
          padding: var(--space-16);
          color: var(--color-text-tertiary);
        }
      `}</style>
    </div>
  );
}
