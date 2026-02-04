import { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import storageService from '../utils/storage';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [period, setPeriod] = useState('month'); // week | month | year | all

  useEffect(() => {
    loadData();
  }, [period]);

  const loadData = () => {
    try {
      const allSessions = storageService.getAllSessions() || [];
      setSessions(filterByPeriod(allSessions));
      setStats(storageService.getStats() || {
        totalSessions: 0,
        totalDuration: 0,
        averageDuration: 0,
        platformUsage: {},
        weeklyGrowth: 0
      });
    } catch (error) {
      console.error('Erreur chargement données:', error);
      setSessions([]);
      setStats({
        totalSessions: 0,
        totalDuration: 0,
        averageDuration: 0,
        platformUsage: {},
        weeklyGrowth: 0
      });
    }
  };

  const filterByPeriod = (allSessions) => {
    const now = Date.now();
    const periods = {
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      year: 365 * 24 * 60 * 60 * 1000,
      all: Infinity
    };
    
    const cutoff = now - periods[period];
    return allSessions.filter(s => s.createdAt >= cutoff);
  };

  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hrs > 0) return `${hrs}h ${mins}min`;
    return `${mins}min`;
  };

  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    if (hrs > 0) return `${hrs.toFixed(1)}h`;
    return `${Math.round(seconds / 60)}min`;
  };

  // Données pour les graphiques
  const sessionsPerDayData = {
    labels: getLast7Days(),
    datasets: [{
      label: 'Sessions par jour',
      data: getSessionsPerDay(),
      backgroundColor: 'rgba(99, 102, 241, 0.8)',
      borderColor: 'rgba(99, 102, 241, 1)',
      borderWidth: 1.5,
    }]
  };

  const platformData = {
    labels: Object.keys(stats?.platformUsage || {}),
    datasets: [{
      data: Object.values(stats?.platformUsage || {}),
      backgroundColor: [
        '#6366f1',
        '#8b5cf6',
        '#a855f7',
        '#c084fc',
        '#d8b4fe',
        '#e9d5ff'
      ],
      borderWidth: 0,
    }]
  };

  const durationTrendData = {
    labels: getLast7Days(),
    datasets: [{
      label: 'Durée (minutes)',
      data: getDurationTrend(),
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139, 92, 246, 0.08)',
      tension: 0.3,
      fill: true,
      borderWidth: 2,
      pointRadius: 3,
      pointBackgroundColor: '#8b5cf6',
    }]
  };

  function getLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      days.push(date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' }));
    }
    return days;
  }

  function getSessionsPerDay() {
    const counts = new Array(7).fill(0);
    const now = new Date();
    
    sessions.forEach(session => {
      const sessionDate = new Date(session.createdAt);
      const daysDiff = Math.floor((now - sessionDate) / (1000 * 60 * 60 * 24));
      if (daysDiff < 7) {
        counts[6 - daysDiff]++;
      }
    });
    
    return counts;
  }

  function getDurationTrend() {
    const durations = new Array(7).fill(0);
    const counts = new Array(7).fill(0);
    const now = new Date();
    
    sessions.forEach(session => {
      const sessionDate = new Date(session.createdAt);
      const daysDiff = Math.floor((now - sessionDate) / (1000 * 60 * 60 * 24));
      if (daysDiff < 7) {
        durations[6 - daysDiff] += (session.duration || 0);
        counts[6 - daysDiff]++;
      }
    });
    
    return durations.map((d, i) => counts[i] > 0 ? Math.round(d / counts[i] / 60) : 0);
  }

  function getPlatformName(platform) {
    const names = {
      local: 'Local',
      zoom: 'Zoom',
      'google-meet': 'Meet',
      teams: 'Teams',
      webex: 'Webex',
      slack: 'Slack',
      discord: 'Discord'
    };
    return names[platform] || 'Local';
  }

  if (!stats) return <div className="loading">Chargement...</div>;

  // Si aucune session n'existe
  if (sessions.length === 0) {
    return (
      <div className="screen dashboard">
        <div className="dashboard-header">
          <h2>Tableau de Bord</h2>
        </div>
        <div className="empty-state" style={{
          textAlign: 'center',
          padding: '80px 40px',
          maxWidth: '600px',
          margin: '0 auto'
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
            <BarChart3 size={56} strokeWidth={1.5} />
          </div>
          <h3 style={{
            fontSize: '24px',
            fontWeight: '600',
            color: 'var(--color-text-primary)',
            marginBottom: '12px'
          }}>Commencez votre première session</h3>
          <p style={{
            fontSize: '15px',
            color: 'var(--color-text-secondary)',
            lineHeight: '1.6',
            marginBottom: '32px'
          }}>Créez une session de réunion pour voir vos statistiques, graphiques et analyses apparaître ici.</p>
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
    );
  }

  const totalDurationHours = ((stats.totalDuration || 0) / 3600).toFixed(1);
  const avgDurationMins = Math.round((stats.averageDuration || 0) / 60);
  const totalWords = stats.totalWords || 0;

  return (
    <div className="screen dashboard">
      <div className="dashboard-header">
        <h2>Tableau de Bord</h2>
        
        <div className="period-selector">
          <button
            className={period === 'week' ? 'active' : ''}
            onClick={() => setPeriod('week')}
          >
            7 jours
          </button>
          <button
            className={period === 'month' ? 'active' : ''}
            onClick={() => setPeriod('month')}
          >
            30 jours
          </button>
          <button
            className={period === 'year' ? 'active' : ''}
            onClick={() => setPeriod('year')}
          >
            1 an
          </button>
          <button
            className={period === 'all' ? 'active' : ''}
            onClick={() => setPeriod('all')}
          >
            Tout
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Sessions</div>
          <div className="stat-value">{sessions.length}</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Temps total</div>
          <div className="stat-value">{totalDurationHours}h</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Durée moyenne</div>
          <div className="stat-value">{avgDurationMins}min</div>
        </div>

        <div className="stat-card">
          <div className="stat-label">Mots transcrits</div>
          <div className="stat-value">{totalWords.toLocaleString()}</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Sessions par jour (7 derniers jours)</h3>
          <Bar
            data={sessionsPerDayData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    precision: 0,
                    font: { size: 11 }
                  },
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                  }
                },
                x: {
                  ticks: {
                    font: { size: 11 }
                  },
                  grid: {
                    display: false
                  }
                }
              }
            }}
          />
        </div>

        <div className="chart-card">
          <h3>Plateformes utilisées</h3>
          {Object.keys(stats?.platformUsage || {}).length > 0 ? (
            <Pie
              data={platformData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { 
                    position: 'bottom',
                    labels: {
                      padding: 12,
                      font: { size: 11 },
                      boxWidth: 12,
                      boxHeight: 12
                    }
                  }
                }
              }}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              Aucune donnée de plateforme
            </div>
          )}
        </div>

        <div className="chart-card full-width">
          <h3>Tendance de durée (moyenne par jour)</h3>
          <Line
            data={durationTrendData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    font: { size: 11 }
                  },
                  grid: {
                    color: 'rgba(0, 0, 0, 0.05)'
                  }
                },
                x: {
                  ticks: {
                    font: { size: 11 }
                  },
                  grid: {
                    display: false
                  }
                }
              }
            }}
          />
        </div>
      </div>

      <div className="insights-section">
        <h3>Statistiques</h3>
        <div className="insights-grid">
          <div className="insight-card">
            <div className="insight-text">
              <strong>Streak actuel :</strong> {stats.sessionsThisWeek} sessions cette semaine
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-text">
              <strong>Le plus productif :</strong> {stats.sessionsThisMonth} sessions ce mois-ci
            </div>
          </div>

          {stats.mostUsedTags && stats.mostUsedTags.length > 0 && (
            <div className="insight-card">
              <div className="insight-text">
                <strong>Tag favori :</strong> {stats.mostUsedTags[0].tag} ({stats.mostUsedTags[0].count} sessions)
              </div>
            </div>
          )}

          <div className="insight-card">
            <div className="insight-text">
              <strong>Temps économisé :</strong> ~{Math.round(stats.totalDuration / 60 * 0.3)}min de prise de notes évitées
            </div>
          </div>
        </div>
      </div>

      <div className="recent-sessions">
        <h3>Dernières sessions</h3>
        <div className="sessions-list">
          {sessions.slice(0, 5).map(session => (
            <div key={session.id} className="session-item">
              <div className="session-info">
                <div className="session-title">{session.title || 'Sans titre'}</div>
                <div className="session-meta">
                  {new Date(session.createdAt).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })} · {formatTime(session.duration)}
                </div>
              </div>
              <div className="session-platform">
                {getPlatformName(session.platform)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
