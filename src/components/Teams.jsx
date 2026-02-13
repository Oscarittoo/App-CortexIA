import { useState, useEffect } from 'react';
import { Users, UserPlus, Mail, Trash2, Crown, AlertCircle } from 'lucide-react';
import toast from './Toast';
import teamService from '../services/teamService';

/**
 * Composant Teams - Gestion des équipes et invitations
 * Limites par plan : Free=5, Pro=10, Business=25, Expert=50
 */
export default function Teams({ currentUser }) {
  const [teamMembers, setTeamMembers] = useState([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentTeam, setCurrentTeam] = useState(null);

  useEffect(() => {
    loadTeamData();
  }, []);

  const loadTeamData = async () => {
    try {
      const team = await teamService.getUserTeam();
      setCurrentTeam(team);
      
      if (team) {
        const members = await teamService.getTeamMembers(team.id);
        setTeamMembers(members);
      }
    } catch (error) {
      console.error('Erreur chargement équipe:', error);
    }
  };

  // Limites selon le plan
  const planLimits = {
    free: 3,
    pro: 5,
    business: 15,
    expert: 30
  };

  const userPlan = currentUser?.plan || 'free';
  const maxMembers = planLimits[userPlan];
  const canInvite = teamMembers.length < maxMembers;

  const handleInvite = async () => {
    if (!inviteEmail || !inviteEmail.includes('@')) {
      toast.error('Email invalide');
      return;
    }

    if (!canInvite) {
      toast.error(`Limite atteinte pour le plan ${userPlan.toUpperCase()} (${maxMembers} membres)`);
      return;
    }

    setIsLoading(true);

    try {
      let team = currentTeam;
      
      // Si pas d'équipe, en créer une
      if (!team) {
        team = await teamService.createTeam(`Équipe de ${currentUser?.email || 'Utilisateur'}`);
        setCurrentTeam(team);
        toast.success('Équipe créée !');
      }

      // Inviter le membre via Supabase
      try {
        await teamService.inviteTeamMember(team.id, inviteEmail);
        toast.success(`${inviteEmail} a été ajouté à l'équipe !`);
        
        // Recharger les membres
        await loadTeamData();
        setInviteEmail('');
      } catch (inviteError) {
        // Si l'utilisateur n'existe pas encore, envoyer un email d'invitation
        console.log('Utilisateur pas encore inscrit, envoi email...');
        
        const subject = encodeURIComponent(`Invitation à rejoindre l'équipe sur Meetizy`);
        const body = encodeURIComponent(`Bonjour,

Vous avez été invité(e) à rejoindre notre équipe sur Meetizy par ${currentUser?.name || currentUser?.email || 'un collègue'}.

Meetizy est une plateforme collaborative de gestion de réunions avec transcription en temps réel et intelligence artificielle.

Pour accepter l'invitation et créer votre compte :
1. Rendez-vous sur : https://app.meetizy.com
2. Créez un compte avec cet email : ${inviteEmail}
3. Vous serez automatiquement ajouté à l'équipe

À très bientôt !

---
L'équipe Meetizy`);

        window.location.href = `mailto:${inviteEmail}?subject=${subject}&body=${body}`;
        setInviteEmail('');
        toast.info(`Email d'invitation envoyé à ${inviteEmail}`);
      }
    } catch (error) {
      console.error('Erreur invitation:', error);
      toast.error(error.message || 'Erreur lors de l\'invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!currentTeam) return;
    
    try {
      await teamService.removeTeamMember(currentTeam.id, memberId);
      await loadTeamData();
      toast.success('Membre retiré de l\'équipe');
    } catch (error) {
      toast.error('Erreur lors du retrait');
    }
  };

  return (
    <div className="teams-container" style={{ padding: '32px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Users size={32} />
          Gestion des Équipes
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: '16px' }}>
          Invitez vos collègues à rejoindre votre espace de travail
        </p>
      </div>

      {/* Plan Info Card */}
      <div style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Crown size={24} color="white" />
          </div>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
              Plan {userPlan.charAt(0).toUpperCase() + userPlan.slice(1)}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
              {teamMembers.length} / {maxMembers} membres utilisés
            </div>
          </div>
        </div>
        <div style={{
          fontSize: '28px',
          fontWeight: '700',
          color: teamMembers.length >= maxMembers ? '#ef4444' : '#10b981'
        }}>
          {teamMembers.length}/{maxMembers}
        </div>
      </div>

      {/* Invite Form */}
      <div style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '24px',
        marginBottom: '32px'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserPlus size={20} />
          Inviter un nouveau membre
        </h2>

        {!canInvite && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 16px',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <AlertCircle size={20} color="#ef4444" />
            <span style={{ color: '#ef4444', fontSize: '14px' }}>
              Limite atteinte. Passez à un plan supérieur pour inviter plus de membres.
            </span>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <input
            type="email"
            placeholder="email@exemple.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            disabled={!canInvite || isLoading}
            style={{
              flex: 1,
              padding: '12px 16px',
              background: 'var(--input-bg)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              color: 'var(--text)',
              fontSize: '14px'
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleInvite();
            }}
          />
          <button
            onClick={handleInvite}
            disabled={!canInvite || isLoading || !inviteEmail}
            className="btn btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 24px',
              opacity: (!canInvite || isLoading || !inviteEmail) ? 0.5 : 1
            }}
          >
            <Mail size={18} />
            {isLoading ? 'Envoi...' : 'Inviter'}
          </button>
        </div>
      </div>

      {/* Members List */}
      <div style={{
        background: 'var(--card-bg)',
        border: '1px solid var(--border)',
        borderRadius: '12px',
        padding: '24px'
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          Membres de l'équipe ({teamMembers.length})
        </h2>

        {teamMembers.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '48px',
            color: 'var(--muted)'
          }}>
            <Users size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
            <p>Aucun membre invité pour le moment</p>
            <p style={{ fontSize: '14px', marginTop: '8px' }}>
              Commencez par inviter un collègue pour collaborer
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {teamMembers.map(member => (
              <div
                key={member.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px',
                  background: 'var(--hover-bg)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: '600'
                  }}>
                    {member.email.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: '500' }}>{member.email}</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)' }}>
                      {member.status === 'pending' ? '⏳ Invitation en attente' : '✓ Actif'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => handleRemoveMember(member.id)}
                  className="btn-icon-premium"
                  title="Retirer"
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
