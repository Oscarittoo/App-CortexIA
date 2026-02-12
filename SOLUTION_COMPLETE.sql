-- =====================================================
-- SOLUTION COMPLÈTE - TOUT EN UN
-- =====================================================
-- Ce script fait TOUT en une seule exécution:
-- 1. Crée le trigger automatique
-- 2. Synchronise tous les utilisateurs existants  
-- 3. Corrige les permissions RLS
-- 4. Affiche un diagnostic final
--
-- À exécuter dans : Supabase Dashboard > SQL Editor
-- =====================================================

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PARTIE 1 : CRÉER LA FONCTION TRIGGER
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.clients (
    id, 
    email, 
    company_name, 
    plan, 
    created_at, 
    last_updated
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'company_name', NULL),
    COALESCE(NEW.raw_user_meta_data->>'plan', 'free'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    company_name = COALESCE(EXCLUDED.company_name, clients.company_name),
    plan = COALESCE(EXCLUDED.plan, clients.plan),
    last_updated = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PARTIE 2 : CRÉER LE TRIGGER
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PARTIE 3 : SYNCHRONISER TOUS LES UTILISATEURS EXISTANTS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSERT INTO public.clients (id, email, company_name, plan, stripe_customer_id, stripe_subscription_id, created_at, last_updated)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'company_name', NULL),
  COALESCE(u.raw_user_meta_data->>'plan', 'free'),
  NULL,
  NULL,
  u.created_at,
  NOW()
FROM auth.users u
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  company_name = COALESCE(EXCLUDED.company_name, clients.company_name),
  plan = COALESCE(EXCLUDED.plan, clients.plan),
  last_updated = NOW();

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PARTIE 3B : METTRE À JOUR LE PLAN ADMIN (oscarbrixon@gmail.com)
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Mettre à jour le plan de oscarbrixon@gmail.com à 'expert'
UPDATE public.clients
SET 
  plan = 'expert',
  company_name = COALESCE(company_name, 'CortexAdmin'),
  last_updated = NOW()
WHERE email = 'oscarbrixon@gmail.com';

-- Vérification
SELECT 
  'Mise à jour du plan admin' as "Action",
  email,
  plan,
  company_name
FROM public.clients
WHERE email = 'oscarbrixon@gmail.com';

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PARTIE 4 : CORRIGER LES PERMISSIONS RLS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

-- Supprimer toutes les anciennes politiques
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leur propre profil" ON public.clients;
DROP POLICY IF EXISTS "Les administrateurs peuvent tout voir" ON public.clients;
DROP POLICY IF EXISTS "admin_read_all" ON public.clients;
DROP POLICY IF EXISTS "user_read_own" ON public.clients;

-- Créer une politique qui permet:
-- 1. Aux utilisateurs de voir leur propre ligne
-- 2. Aux admins (plan = 'expert') de voir toutes les lignes

CREATE POLICY "clients_select_policy"
ON public.clients
FOR SELECT
TO authenticated
USING (
  -- L'utilisateur peut voir sa propre ligne
  auth.uid() = id
  OR
  -- OU l'utilisateur est un admin (a le plan 'expert')
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE id = auth.uid() 
    AND plan = 'expert'
  )
);

-- Politique pour INSERT (création de compte)
DROP POLICY IF EXISTS "clients_insert_policy" ON public.clients;
CREATE POLICY "clients_insert_policy"
ON public.clients
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Politique pour UPDATE (modification de son propre profil)
DROP POLICY IF EXISTS "clients_update_policy" ON public.clients;
CREATE POLICY "clients_update_policy"
ON public.clients
FOR UPDATE
TO authenticated
USING (
  auth.uid() = id
  OR
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE id = auth.uid() AND plan = 'expert'
  )
)
WITH CHECK (
  auth.uid() = id
  OR
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE id = auth.uid() AND plan = 'expert'
  )
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- PARTIE 5 : DIAGNOSTIC FINAL
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT '═══════════════════════════════════════════════════════════' as "═══════════════════════════════════";
SELECT '                     RÉSULTAT FINAL                        ' as "                                   ";
SELECT '═══════════════════════════════════════════════════════════' as "═══════════════════════════════════";

-- Nombre total d'utilisateurs dans Auth
SELECT 
  '1️⃣ UTILISATEURS DANS AUTH' as "Étape",
  COUNT(*) as "Nombre"
FROM auth.users;

-- Nombre total d'utilisateurs dans Clients
SELECT 
  '2️⃣ UTILISATEURS DANS CLIENTS' as "Étape",
  COUNT(*) as "Nombre"
FROM public.clients;

-- Liste détaillée des utilisateurs
SELECT 
  '3️⃣ LISTE DES UTILISATEURS' as "Étape";
  
SELECT 
  email as "Email",
  plan as "Plan",
  company_name as "Entreprise",
  created_at as "Créé le"
FROM public.clients
ORDER BY created_at DESC;

-- Vérification des politiques RLS
SELECT 
  '4️⃣ POLITIQUES RLS ACTIVES' as "Étape";

SELECT 
  policyname as "Nom de la politique",
  cmd as "Commande",
  CASE 
    WHEN qual IS NOT NULL THEN 'Avec conditions'
    ELSE 'Sans conditions'
  END as "Type"
FROM pg_policies
WHERE tablename = 'clients' AND schemaname = 'public';

-- Vérification du trigger
SELECT 
  '5️⃣ TRIGGER INSTALLÉ' as "Étape";

SELECT 
  trigger_name as "Nom",
  event_manipulation as "Événement",
  'Actif' as "Statut"
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

SELECT '═══════════════════════════════════════════════════════════' as "═══════════════════════════════════";
SELECT '                    ✅ CONFIGURATION TERMINÉE                ' as "                                   ";
SELECT '═══════════════════════════════════════════════════════════' as "═══════════════════════════════════";
SELECT '  Retournez dans Meetizy et cliquez sur "Actualiser" 🔄   ' as "                                   ";
SELECT '═══════════════════════════════════════════════════════════' as "═══════════════════════════════════";
