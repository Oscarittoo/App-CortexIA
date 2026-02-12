import { supabase } from './supabaseClient';
import authService from './authService';

/**
 * Service de gestion des équipes et partage de données
 * Permet aux membres d'une équipe de partager sessions, calendrier, actions
 */
class TeamService {
  /**
   * Créer une nouvelle équipe
   */
  async createTeam(teamName) {
    const user = await authService.getCurrentUser();
    if (!user) throw new Error('Utilisateur non connecté');

    const { data, error } = await supabase
      .from('teams')
      .insert([
        {
          name: teamName,
          owner_id: user.id
        }
      ])
      .select()
      .single();

    if (error) throw error;

    // Ajouter le créateur comme membre owner
    await supabase
      .from('team_members')
      .insert([
        {
          team_id: data.id,
          user_id: user.id,
          role: 'owner',
          joined_at: new Date().toISOString()
        }
      ]);

    return data;
  }

  /**
   * Obtenir l'équipe de l'utilisateur actuel
   */
  async getUserTeam() {
    const user = await authService.getCurrentUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('team_members')
      .select('team_id, role, teams(*)')
      .eq('user_id', user.id)
      .single();

    if (error || !data) return null;

    return {
      id: data.team_id,
      role: data.role,
      ...data.teams
    };
  }

  /**
   * Obtenir les membres de l'équipe
   */
  async getTeamMembers(teamId) {
    const { data, error } = await supabase
      .from('team_members')
      .select('*, clients(email, company_name, plan)')
      .eq('team_id', teamId);

    if (error) throw error;
    return data || [];
  }

  /**
   * Inviter un membre à l'équipe
   */
  async inviteTeamMember(teamId, email) {
    // Chercher l'utilisateur par email
    const { data: userData, error: userError } = await supabase
      .from('clients')
      .select('id')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      throw new Error('Utilisateur non trouvé avec cet email');
    }

    // Ajouter à l'équipe
    const { data, error } = await supabase
      .from('team_members')
      .insert([
        {
          team_id: teamId,
          user_id: userData.id,
          role: 'member'
        }
      ])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Retirer un membre de l'équipe
   */
  async removeTeamMember(teamId, userId) {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('team_id', teamId)
      .eq('user_id', userId);

    if (error) throw error;
  }

  /**
   * Sauvegarder une session partagée
   */
  async saveSharedSession(session) {
    const user = await authService.getCurrentUser();
    const team = await this.getUserTeam();
    
    if (!user || !team) {
      throw new Error('Utilisateur non connecté ou pas d\'équipe');
    }

    const sessionData = {
      id: session.id,
      team_id: team.id,
      created_by: user.id,
      title: session.title || 'Sans titre',
      language: session.language || 'fr',
      duration: session.duration || 0,
      transcript: session.transcript || [],
      summary: session.summary || null,
      actions: session.actions || [],
      decisions: session.decisions || [],
      detected_actions: session.detectedActions || [],
      detected_decisions: session.detectedDecisions || [],
      ai_generated: session.aiGenerated || false,
      ai_meta: session.aiMeta || null
    };

    const { data, error } = await supabase
      .from('shared_sessions')
      .upsert([sessionData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Obtenir toutes les sessions de l'équipe
   */
  async getTeamSessions() {
    const team = await this.getUserTeam();
    if (!team) return [];

    const { data, error } = await supabase
      .from('shared_sessions')
      .select('*, clients(email)')
      .eq('team_id', team.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Sauvegarder une réunion partagée
   */
  async saveSharedMeeting(meeting) {
    const user = await authService.getCurrentUser();
    const team = await this.getUserTeam();
    
    if (!user || !team) {
      throw new Error('Utilisateur non connecté ou pas d\'équipe');
    }

    const meetingData = {
      id: meeting.id,
      team_id: team.id,
      created_by: user.id,
      title: meeting.title,
      date: meeting.date,
      time: meeting.time,
      duration: meeting.duration || 60,
      participants: meeting.participants || '',
      type: meeting.type || 'video',
      location: meeting.location || ''
    };

    const { data, error } = await supabase
      .from('shared_meetings')
      .upsert([meetingData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Obtenir toutes les réunions de l'équipe
   */
  async getTeamMeetings() {
    const team = await this.getUserTeam();
    if (!team) return [];

    const { data, error } = await supabase
      .from('shared_meetings')
      .select('*')
      .eq('team_id', team.id)
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  /**
   * Supprimer une réunion
   */
  async deleteMeeting(meetingId) {
    const { error } = await supabase
      .from('shared_meetings')
      .delete()
      .eq('id', meetingId);

    if (error) throw error;
  }

  /**
   * Sauvegarder une action partagée
   */
  async saveSharedAction(action, sessionId = null) {
    const user = await authService.getCurrentUser();
    const team = await this.getUserTeam();
    
    if (!user || !team) {
      throw new Error('Utilisateur non connecté ou pas d\'équipe');
    }

    const actionData = {
      team_id: team.id,
      session_id: sessionId,
      created_by: user.id,
      task: action.task,
      responsible: action.responsible || 'À définir',
      deadline: action.deadline || 'À définir',
      priority: action.priority || 'Moyenne',
      completed: action.completed || false
    };

    const { data, error } = await supabase
      .from('shared_actions')
      .insert([actionData])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Obtenir toutes les actions de l'équipe
   */
  async getTeamActions() {
    const team = await this.getUserTeam();
    if (!team) return [];

    const { data, error } = await supabase
      .from('shared_actions')
      .select('*')
      .eq('team_id', team.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  /**
   * Mettre à jour le statut d'une action
   */
  async updateActionStatus(actionId, completed) {
    const { data, error } = await supabase
      .from('shared_actions')
      .update({ completed, updated_at: new Date().toISOString() })
      .eq('id', actionId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Vérifier si l'utilisateur fait partie d'une équipe
   */
  async isInTeam() {
    const team = await this.getUserTeam();
    return !!team;
  }
}

const teamService = new TeamService();
export default teamService;
