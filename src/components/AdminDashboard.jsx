import { useState, useEffect } from 'react';
import { Users, Mail, Building, Calendar, TrendingUp } from 'lucide-react';
import authService from '../services/authService';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadClients();
  }, []);

  const loadClients = () => {
    const allClients = authService.getAllClients();
    setClients(allClients);
    
    const statistics = authService.getClientStats();
    setStats(statistics);
  };

  const filteredClients = clients.filter(client =>
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.companyName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Administration - Base de données clients</h1>
        <p className="text-secondary">Vue d'ensemble des clients et abonnements</p>
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
        <input
          type="text"
          className="input"
          placeholder="Rechercher par email ou entreprise..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="clients-table">
        <table>
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
                      {client.companyName || '-'}
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
                      {client.createdAt ? format(new Date(client.createdAt), 'dd/MM/yyyy HH:mm') : '-'}
                    </div>
                  </td>
                  <td>
                    {client.lastUpdated ? format(new Date(client.lastUpdated), 'dd/MM/yyyy HH:mm') : '-'}
                  </td>
                  <td>
                    <code className="stripe-id">{client.stripeSubscriptionId || '-'}</code>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <style jsx>{`
        .admin-dashboard {
          max-width: 1600px;
          margin: 0 auto;
          padding: var(--space-8);
        }

        .admin-header {
          margin-bottom: var(--space-8);
        }

        .admin-header h1 {
          font-size: var(--font-size-3xl);
          font-weight: var(--font-weight-bold);
          margin-bottom: var(--space-2);
          color: var(--color-text-primary);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: var(--space-4);
          margin-bottom: var(--space-8);
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-6);
          background: var(--color-bg-primary);
          border: 1px solid var(--color-border-light);
          border-radius: var(--radius-lg);
        }

        .stat-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 48px;
          height: 48px;
          background: var(--color-primary-light);
          color: var(--color-primary);
          border-radius: var(--radius-md);
        }

        .stat-label {
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          margin-bottom: var(--space-1);
        }

        .stat-value {
          font-size: var(--font-size-2xl);
          font-weight: var(--font-weight-bold);
          color: var(--color-text-primary);
        }

        .search-section {
          margin-bottom: var(--space-6);
        }

        .clients-table {
          background: var(--color-bg-primary);
          border: 1px solid var(--color-border-light);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        thead {
          background: var(--color-bg-secondary);
        }

        th {
          padding: var(--space-4);
          text-align: left;
          font-size: var(--font-size-sm);
          font-weight: var(--font-weight-semibold);
          color: var(--color-text-primary);
          border-bottom: 1px solid var(--color-border-light);
        }

        td {
          padding: var(--space-4);
          font-size: var(--font-size-sm);
          color: var(--color-text-secondary);
          border-bottom: 1px solid var(--color-border-light);
        }

        tbody tr:hover {
          background: var(--color-bg-hover);
        }

        .cell-with-icon {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .stripe-id {
          font-family: var(--font-mono);
          font-size: var(--font-size-xs);
          background: var(--color-bg-tertiary);
          padding: 2px 6px;
          border-radius: var(--radius-sm);
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
