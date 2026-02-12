-- =====================================================
-- MEETIZY - Schéma de partage d'équipe
-- Permet aux membres d'une équipe de partager:
-- - Sessions/réunions
-- - Calendrier
-- - Actions
-- - Historique
-- =====================================================

-- =====================================================
-- ÉTAPE 1: Créer TOUTES les tables d'abord
-- =====================================================

-- Table: teams
CREATE TABLE IF NOT EXISTS public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- Table: team_members
CREATE TABLE IF NOT EXISTS public.team_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member', -- 'owner', 'admin', 'member'
  invited_at timestamptz NOT NULL DEFAULT NOW(),
  joined_at timestamptz,
  UNIQUE(team_id, user_id)
);

-- Table: shared_sessions
CREATE TABLE IF NOT EXISTS public.shared_sessions (
  id text PRIMARY KEY,
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title text NOT NULL,
  language text NOT NULL DEFAULT 'fr',
  duration integer NOT NULL DEFAULT 0,
  transcript jsonb NOT NULL DEFAULT '[]',
  summary text,
  actions jsonb DEFAULT '[]',
  decisions jsonb DEFAULT '[]',
  detected_actions jsonb DEFAULT '[]',
  detected_decisions jsonb DEFAULT '[]',
  ai_generated boolean DEFAULT false,
  ai_meta jsonb,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- Table: shared_meetings
CREATE TABLE IF NOT EXISTS public.shared_meetings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  title text NOT NULL,
  date date NOT NULL,
  time time NOT NULL,
  duration integer NOT NULL DEFAULT 60,
  participants text,
  type text NOT NULL DEFAULT 'video',
  location text,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- Table: shared_actions
CREATE TABLE IF NOT EXISTS public.shared_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  session_id text REFERENCES public.shared_sessions(id) ON DELETE CASCADE,
  created_by uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  task text NOT NULL,
  responsible text,
  deadline text,
  priority text NOT NULL DEFAULT 'Moyenne',
  completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

-- =====================================================
-- ÉTAPE 2: Activer RLS sur toutes les tables
-- =====================================================

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_actions ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- ÉTAPE 3: Créer les POLICIES
-- =====================================================

-- Policies pour teams
CREATE POLICY "Team members can read their team"
  ON public.teams FOR SELECT
  USING (
    auth.uid() = owner_id OR
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = id AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Only owner can update team"
  ON public.teams FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Authenticated users can create teams"
  ON public.teams FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Only owner can delete team"
  ON public.teams FOR DELETE
  USING (auth.uid() = owner_id);

-- Policies pour team_members
CREATE POLICY "Team members can read their team members"
  ON public.team_members FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_id AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can invite members"
  ON public.team_members FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_id 
        AND tm.user_id = auth.uid() 
        AND tm.role IN ('owner', 'admin')
    ) OR
    EXISTS (
      SELECT 1 FROM public.teams t
      WHERE t.id = team_id AND t.owner_id = auth.uid()
    )
  );

CREATE POLICY "Team admins can remove members"
  ON public.team_members FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_id 
        AND tm.user_id = auth.uid() 
        AND tm.role IN ('owner', 'admin')
    ) OR
    auth.uid() = user_id -- Members can leave themselves
  );

-- Policies pour shared_sessions
CREATE POLICY "Team members can read sessions"
  ON public.shared_sessions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_id AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create sessions"
  ON public.shared_sessions FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_id AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Session creator can update"
  ON public.shared_sessions FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Session creator can delete"
  ON public.shared_sessions FOR DELETE
  USING (auth.uid() = created_by);

-- Policies pour shared_meetings
CREATE POLICY "Team members can read meetings"
  ON public.shared_meetings FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_id AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create meetings"
  ON public.shared_meetings FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_id AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Meeting creator can update"
  ON public.shared_meetings FOR UPDATE
  USING (auth.uid() = created_by);

CREATE POLICY "Meeting creator can delete"
  ON public.shared_meetings FOR DELETE
  USING (auth.uid() = created_by);

-- Policies pour shared_actions
CREATE POLICY "Team members can read actions"
  ON public.shared_actions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_id AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can create actions"
  ON public.shared_actions FOR INSERT
  WITH CHECK (
    auth.uid() = created_by AND
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_id AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Team members can update actions"
  ON public.shared_actions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_id AND tm.user_id = auth.uid()
    )
  );

CREATE POLICY "Action creator can delete"
  ON public.shared_actions FOR DELETE
  USING (auth.uid() = created_by);

-- =====================================================
-- ÉTAPE 4: Créer les indexes pour performance
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_sessions_team_id ON public.shared_sessions(team_id);
CREATE INDEX IF NOT EXISTS idx_shared_sessions_created_by ON public.shared_sessions(created_by);
CREATE INDEX IF NOT EXISTS idx_shared_meetings_team_id ON public.shared_meetings(team_id);
CREATE INDEX IF NOT EXISTS idx_shared_meetings_date ON public.shared_meetings(date);
CREATE INDEX IF NOT EXISTS idx_shared_actions_team_id ON public.shared_actions(team_id);
CREATE INDEX IF NOT EXISTS idx_shared_actions_session_id ON public.shared_actions(session_id);

-- =====================================================
-- ÉTAPE 5: Fonctions et vues helper
-- =====================================================

-- Fonction helper: obtenir l'équipe d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_team_id(user_uuid uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  team_uuid uuid;
BEGIN
  SELECT team_id INTO team_uuid
  FROM public.team_members
  WHERE user_id = user_uuid
  LIMIT 1;
  
  RETURN team_uuid;
END;
$$;

-- Vue helper: sessions avec info créateur
CREATE OR REPLACE VIEW public.sessions_with_creator AS
SELECT 
  s.*,
  c.email as creator_email,
  c.company_name as creator_company
FROM public.shared_sessions s
LEFT JOIN public.clients c ON s.created_by = c.id;

-- =====================================================
-- Instructions d'utilisation
-- =====================================================
-- 
-- 1. Exécuter ce script dans Supabase SQL Editor
-- 2. Les utilisateurs créent une équipe via l'interface
-- 3. Ils invitent des membres par email
-- 4. Toutes les sessions/meetings/actions créées sont
--    automatiquement partagées avec l'équipe
-- 
-- =====================================================
