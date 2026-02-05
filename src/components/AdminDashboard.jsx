import { useState, useEffect } from 'react';
import { Users, Mail, Building, Calendar, TrendingUp } from 'lucide-react';
import authService from '../services/authService';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadClients = async () => {
      const allClients = await authService.getAllClients();
      setClients(allClients);

      const statistics = await authService.getClientStats();
      setStats(statistics);
    };

    loadClients();
  }, []);

  const filteredClients = clients.filter(client =>
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="screen admin-dashboard">
      <div className="admin-header">
        <h1>Administration - Base de données clients</h1>
        <p>Vue d'ensemble des clients et abonnements</p>
      </div>

      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <Users size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">Total Clients</div>
              <div className="stat-value">{stats.totalClients}</div>
            </div>
          </div>

          {Object.entries(stats.planDistribution).map(([plan, count]) => (
            <div key={plan} className="stat-card">
              <div className="stat-icon">
                <TrendingUp size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-label">Plan {plan}</div>
                <div className="stat-value">{count}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="search-section">
        <div className="search-bar">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
          </svg>
          <input
            type="text"
            placeholder="Rechercher par email ou entreprise..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="clients-table-container">
        <table className="clients-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Entreprise</th>
              <th>Plan</th>
              <th>Date d'inscription</th>
              <th>Dernière mise à jour</th>
              <th>ID Stripe</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.length === 0 ? (
              <tr>
                <td colSpan="6" className="empty-state">
                  Aucun client trouvé
                </td>
              </tr>
            ) : (
              filteredClients.map((client) => (
                <tr key={client.id || client.email}>
                  <td>
                    <div className="cell-with-icon">
                      <Mail size={16} />
                      {client.email}
                    </div>
                  </td>
                  <td>
                    <div className="cell-with-icon">
                      <Building size={16} />
                      {client.company_name || '-'}
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${client.plan === 'pro' ? 'primary' : client.plan === 'enterprise' ? 'success' : 'neutral'}`}>
                      {client.plan}
                    </span>
                  </td>
                  <td>
                    <div className="cell-with-icon">
                      <Calendar size={16} />
                      {client.created_at ? format(new Date(client.created_at), 'dd/MM/yyyy HH:mm') : '-'}
                    </div>
                  </td>
                  <td>
                    {client.last_updated ? format(new Date(client.last_updated), 'dd/MM/yyyy HH:mm') : '-'}
                  </td>
                  <td>
                    <code className="stripe-id">{client.stripe_subscription_id || '-'}</code>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .admin-dashboard {
          padding-bottom: 80px;
          margin: 0 auto;
          max-width: 1600px;
        }

        .admin-header {
          margin-bottom: 32px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 16px;
        }

        .admin-header h1 {
          font-size: 36px;
          margin-bottom: 8px;
          color: var(--text);
          font-weight: 700;
          font-family: 'Orbitron', sans-serif;
        }
        
        .admin-header p {
          color: var(--muted);
          font-size: 16px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 24px;
          margin-bottom: 32px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 24px;
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 16px;
          backdrop-filter: blur(12px);
          transition: all 0.2s;
        }
        
        .stat-card:hover {
          border-color: var(--accent);
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }

        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 56px;
          height: 56px;
          background: rgba(56, 189, 248, 0.1);
          color: var(--accent);
          border-radius: 12px;
          flex-shrink: 0;
        }

        .stat-label {
          font-size: 13px;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 4px;
          font-weight: 600;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: var(--text);
          line-height: 1;
        }

        .search-section {
          margin-bottom: 24px;
        }
        
        .search-bar {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 16px 20px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .search-bar svg {
           color: var(--muted);
        }
        
        .search-bar input {
           background: transparent !important;
           border: none !important;
           box-shadow: none !important;
           color: var(--text) !important;
           width: 100%;
           font-size: 18px;
           padding: 0;
           height: auto;
        }
        
        .search-bar input:focus {
           box-shadow: none !important;
        }

        .clients-table-container {
          background: var(--panel);
          border: 1px solid var(--border);
          border-radius: 16px;
          overflow: hidden;
        }

        .clients-table {
          width: 100%;
          border-collapse: collapse;
        }

        thead {
          background: rgba(0, 0, 0, 0.2);
        }

        th {
          padding: 16px 24px;
          text-align: left;
          font-size: 13px;
          font-weight: 700;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 1px solid var(--border);
        }

        td {
          padding: 16px 24px;
          font-size: 14px;
          color: var(--text);
          border-bottom: 1px solid var(--border);
        }
        
        tr:last-child td {
           border-bottom: none;
        }

        tbody tr:hover {
          background: rgba(255, 255, 255, 0.03);
        }

        .cell-with-icon {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .cell-with-icon svg {
           color: var(--muted);
        }

        .stripe-id {
          font-family: monospace;
          font-size: 12px;
          background: rgba(0, 0, 0, 0.3);
          padding: 4px 8px;
          border-radius: 4px;
          color: var(--muted);
          border: 1px solid var(--border);
        }

        .empty-state {
          text-align: center;
          padding: 60px;
          color: var(--muted);
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
