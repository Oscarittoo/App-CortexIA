import { useState, useEffect } from 'react';
import { Users, Mail, Building, Calendar, TrendingUp, RefreshCw, Database, UserPlus } from 'lucide-react';
import authService from '../services/authService';
import storageService from '../utils/storage';
import { format } from 'date-fns';
import toast from './Toast';

export default function AdminDashboard() {
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [orphanSessions, setOrphanSessions] = useState([]);
  const [selectedUserForOrphans, setSelectedUserForOrphans] = useState('');

  const loadClients = async () => {
    setIsRefreshing(true);
    try {
      const allClients = await authService.getAllClients();
      setClients(allClients);

      const statistics = await authService.getClientStats();
      setStats(statistics);
      
      // Charger les sessions orphelines
      const orphans = storageService.getOrphanSessions();
      setOrphanSessions(orphans);
      
      toast.success('Données rafraîchies');
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Erreur lors du rafraîchissement');
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAssignOrphans = () => {
    if (!selectedUserForOrphans) {
      toast.error('Sélectionnez un utilisateur');
      return;
    }
    
    const count = storageService.assignOrphanSessions(selectedUserForOrphans);
    toast.success(`${count} sessions attribuées avec succès`);
    loadClients(); // Recharger pour mettre à jour
  };

  const handleSyncUsers = async () => {
    console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║              CONFIGURATION DE LA SYNCHRONISATION AUTOMATIQUE              ║
╚════════════════════════════════════════════════════════════════════════════╝

  INSTRUCTIONS COMPLETES :

  1. Ouvrez le fichier : GUIDE_SYNC_RAPIDE.md (dans le dossier du projet)
  2. Suivez les 4 étapes décrites dans le guide
  3. Revenez ici et cliquez sur "Actualiser"

  Fichiers disponibles :
    - GUIDE_SYNC_RAPIDE.md        ← Commencez par ici (guide visuel)
    - supabase_trigger_sync.sql   ← Script à copier dans Supabase
    - ADMIN_DASHBOARD_SYNC.md     ← Documentation technique complète

  Lien direct Supabase : https://supabase.com/dashboard

════════════════════════════════════════════════════════════════════════════
    `);
    
    toast.info(
      'Ouvrez GUIDE_SYNC_RAPIDE.md pour suivre le tutoriel complet.',
      { duration: 8000 }
    );
  };

  useEffect(() => {
    loadClients();
  }, []);

  const filteredClients = clients.filter(client =>
    client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="screen admin-dashboard">
      <div className="admin-header">
        <div>
          <h1>Administration - Base de données clients</h1>
          <p>Vue d'ensemble des clients et abonnements</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            onClick={handleSyncUsers} 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: '0.2s',
              fontWeight: '600'
            }}
            title="Afficher les instructions pour créer un trigger SQL dans Supabase"
          >
            <UserPlus size={16} />
            Configuration de la synchronisation
          </button>
          <button 
            onClick={loadClients} 
            disabled={isRefreshing}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isRefreshing ? 'not-allowed' : 'pointer',
              opacity: isRefreshing ? 0.6 : 1,
              transition: '0.2s',
              fontWeight: '600'
            }}
          >
            <RefreshCw size={16} style={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
            {isRefreshing ? 'Actualisation...' : 'Actualiser'}
          </button>
        </div>
      </div>

      {/* Bannière d'aide pour la synchronisation */}
      {clients.length <= 1 && (
        <div style={{
          background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
          border: '2px solid rgba(102, 126, 234, 0.3)',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '20px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: '12px',
            padding: '12px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: '48px',
            height: '48px'
          }}>
            <UserPlus size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#667eea', fontSize: '18px', fontWeight: '700' }}>
              Configurez la synchronisation automatique des utilisateurs
            </h3>
            <p style={{ color: 'var(--muted)', marginBottom: '16px', lineHeight: '1.6' }}>
              Les nouveaux comptes créés ne s'affichent pas automatiquement ici. Vous devez configurer un trigger SQL dans Supabase (une seule fois, 3 minutes).
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => {
                  handleSyncUsers();
                  window.open('GUIDE_SYNC_RAPIDE.md', '_blank');
                }}
                style={{
                  padding: '10px 20px',
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                Voir le guide étape par étape
              </button>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  padding: '10px 20px',
                  background: 'rgba(102, 126, 234, 0.1)',
                  color: '#667eea',
                  border: '1px solid rgba(102, 126, 234, 0.3)',
                  borderRadius: '8px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  fontSize: '14px',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                Ouvrir Supabase Dashboard
              </a>
            </div>
            <div style={{
              marginTop: '16px',
              padding: '12px',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: '8px',
              fontSize: '13px',
              color: 'var(--muted)',
              lineHeight: '1.5'
            }}>
              <strong style={{ color: 'var(--text)' }}>Étapes rapides :</strong><br/>
              1. Ouvrez <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>GUIDE_SYNC_RAPIDE.md</code> dans VS Code<br/>
              2. Copiez le contenu de <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px' }}>supabase_trigger_sync.sql</code><br/>
              3. Collez dans Supabase SQL Editor et cliquez sur "Run"<br/>
              4. Revenez ici et cliquez sur "Actualiser"
            </div>
          </div>
        </div>
      )}

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

      {/* SESSIONS ORPHELINES */}
      {orphanSessions.length > 0 && (
        <div style={{
          background: 'var(--panel)',
          border: '1px solid rgba(251, 191, 36, 0.3)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '32px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <Database size={20} style={{ color: '#fbbf24' }} />
            <h3 style={{ margin: 0, color: '#fbbf24' }}>Sessions orphelines détectées</h3>
          </div>
          <p style={{ color: 'var(--muted)', marginBottom: '16px' }}>
            {orphanSessions.length} session(s) sans utilisateur assigné. Attribuez-les à un utilisateur pour les rendre accessibles.
          </p>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <select 
              value={selectedUserForOrphans}
              onChange={(e) => setSelectedUserForOrphans(e.target.value)}
              style={{
                padding: '10px 16px',
                background: 'var(--bg)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                color: 'var(--text)',
                flex: 1
              }}
            >
              <option value="">Sélectionnez un utilisateur...</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.email} ({client.company_name || 'Sans entreprise'})
                </option>
              ))}
            </select>
            <button
              onClick={handleAssignOrphans}
              style={{
                padding: '10px 20px',
                background: '#fbbf24',
                color: '#000',
                border: 'none',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Attribuer les sessions
            </button>
          </div>
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
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .admin-header h1 {
          font-size: 36px;
          margin-bottom: 8px;
          color: var(--text);
          font-weight: 700;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif;
        }
        
        .admin-header p {
          color: var(--muted);
          font-size: 16px;
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
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
