-- ═══════════════════════════════════════════════════════════════
-- DIAGNOSTIC COMPLET + CORRECTION AUTOMATIQUE
-- ═══════════════════════════════════════════════════════════════
-- Ce script fait TOUT :
-- 1. Diagnostic complet de la situation
-- 2. Création des utilisateurs manquants
-- 3. Correction du plan admin
-- 4. Synchronisation complète
-- ═══════════════════════════════════════════════════════════════

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ÉTAPE 1 : DIAGNOSTIC - Voir TOUS les utilisateurs Auth
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT '═══════════════════════════════════════════════════════════' as "═══════";
SELECT '            1️⃣ UTILISATEURS DANS AUTH.USERS                ' as "DIAGNOSTIC";
SELECT '═══════════════════════════════════════════════════════════' as "═══════";

SELECT 
  email as "📧 Email",
  id as "🆔 ID",
  created_at as "📅 Créé le",
  confirmed_at as "✅ Confirmé le",
  raw_user_meta_data->>'plan' as "📊 Plan (metadata)",
  raw_user_meta_data->>'company_name' as "🏢 Entreprise (metadata)"
FROM auth.users
ORDER BY created_at DESC;

-- Compter le total
SELECT 
  '📊 TOTAL' as "Stat",
  COUNT(*) as "Nombre d'utilisateurs dans auth.users"
FROM auth.users;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ÉTAPE 2 : DIAGNOSTIC - Voir TOUS les utilisateurs dans Clients
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT '═══════════════════════════════════════════════════════════' as "═══════";
SELECT '          2️⃣ UTILISATEURS DANS PUBLIC.CLIENTS             ' as "DIAGNOSTIC";
SELECT '═══════════════════════════════════════════════════════════' as "═══════";

SELECT 
  email as "📧 Email",
  id as "🆔 ID",
  plan as "📊 Plan",
  company_name as "🏢 Entreprise",
  created_at as "📅 Créé le"
FROM public.clients
ORDER BY created_at DESC;

-- Compter le total
SELECT 
  '📊 TOTAL' as "Stat",
  COUNT(*) as "Nombre d'utilisateurs dans public.clients"
FROM public.clients;

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ÉTAPE 3 : TROUVER LES UTILISATEURS MANQUANTS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT '═══════════════════════════════════════════════════════════' as "═══════";
SELECT '     3️⃣ UTILISATEURS MANQUANTS (Auth mais pas Clients)    ' as "DIAGNOSTIC";
SELECT '═══════════════════════════════════════════════════════════' as "═══════";

SELECT 
  u.email as "📧 Email manquant",
  u.id as "🆔 ID",
  u.created_at as "📅 Créé le",
  COALESCE(u.raw_user_meta_data->>'plan', 'free') as "📊 Plan prévu"
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.clients c WHERE c.id = u.id
);

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ÉTAPE 4 : FORCER LA SYNCHRONISATION DE TOUS LES UTILISATEURS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT '═══════════════════════════════════════════════════════════' as "═══════";
SELECT '        4️⃣ SYNCHRONISATION DE TOUS LES UTILISATEURS       ' as "ACTION";
SELECT '═══════════════════════════════════════════════════════════' as "═══════";

-- Insérer ou mettre à jour TOUS les utilisateurs de auth.users vers clients
INSERT INTO public.clients (
  id, 
  email, 
  company_name, 
  plan, 
  created_at, 
  last_updated
)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'company_name', NULL),
  COALESCE(u.raw_user_meta_data->>'plan', 'free'),
  u.created_at,
  NOW()
FROM auth.users u
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  company_name = COALESCE(EXCLUDED.company_name, clients.company_name),
  plan = COALESCE(EXCLUDED.plan, clients.plan),
  last_updated = NOW();

SELECT '✅ Synchronisation terminée' as "Statut";

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ÉTAPE 5 : FORCER LE PLAN ADMIN sur oscarbrixon@gmail.com
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT '═══════════════════════════════════════════════════════════' as "═══════";
SELECT '       5️⃣ MISE À JOUR DU PLAN ADMIN À "expert"            ' as "ACTION";
SELECT '═══════════════════════════════════════════════════════════' as "═══════";

-- Vérifier le plan AVANT
SELECT 
  'AVANT' as "Moment",
  email,
  plan as "Plan actuel"
FROM public.clients
WHERE email = 'oscarbrixon@gmail.com';

-- Mettre à jour le plan à 'expert'
UPDATE public.clients
SET 
  plan = 'expert',
  company_name = COALESCE(company_name, 'CortexAdmin'),
  last_updated = NOW()
WHERE email = 'oscarbrixon@gmail.com';

-- Vérifier le plan APRÈS
SELECT 
  'APRÈS' as "Moment",
  email,
  plan as "Plan actuel"
FROM public.clients
WHERE email = 'oscarbrixon@gmail.com';

SELECT '✅ Plan admin mis à jour à "expert"' as "Statut";

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ÉTAPE 6 : INSTALLER LE TRIGGER AUTOMATIQUE
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT '═══════════════════════════════════════════════════════════' as "═══════";
SELECT '     6️⃣ INSTALLATION DU TRIGGER AUTOMATIQUE              ' as "ACTION";
SELECT '═══════════════════════════════════════════════════════════' as "═══════";

-- Créer la fonction trigger
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

-- Supprimer l'ancien trigger s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Créer le nouveau trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

SELECT '✅ Trigger automatique installé' as "Statut";

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ÉTAPE 7 : CORRIGER LES PERMISSIONS RLS
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT '═══════════════════════════════════════════════════════════' as "═══════";
SELECT '         7️⃣ CONFIGURATION DES PERMISSIONS RLS             ' as "ACTION";
SELECT '═══════════════════════════════════════════════════════════' as "═══════";

-- Supprimer toutes les anciennes politiques
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leur propre profil" ON public.clients;
DROP POLICY IF EXISTS "Les administrateurs peuvent tout voir" ON public.clients;
DROP POLICY IF EXISTS "admin_read_all" ON public.clients;
DROP POLICY IF EXISTS "user_read_own" ON public.clients;
DROP POLICY IF EXISTS "clients_select_policy" ON public.clients;
DROP POLICY IF EXISTS "clients_insert_policy" ON public.clients;
DROP POLICY IF EXISTS "clients_update_policy" ON public.clients;

-- Politique SELECT : voir sa propre ligne OU tout si admin
CREATE POLICY "clients_select_policy"
ON public.clients
FOR SELECT
TO authenticated
USING (
  auth.uid() = id
  OR
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE id = auth.uid() AND plan = 'expert'
  )
);

-- Politique INSERT : créer son propre compte
CREATE POLICY "clients_insert_policy"
ON public.clients
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);

-- Politique UPDATE : modifier son propre profil OU tout si admin
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

SELECT '✅ Permissions RLS configurées' as "Statut";

-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
-- ÉTAPE 8 : RÉSULTAT FINAL ET VÉRIFICATION
-- ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SELECT '═══════════════════════════════════════════════════════════' as "═══════";
SELECT '                  ✅ RÉSULTAT FINAL                        ' as "RÉSULTAT";
SELECT '═══════════════════════════════════════════════════════════' as "═══════";

-- Nombre total dans auth.users
SELECT 
  '🔐 Auth' as "Source",
  COUNT(*) as "Total utilisateurs"
FROM auth.users;

-- Nombre total dans clients
SELECT 
  '💾 Clients' as "Source",
  COUNT(*) as "Total utilisateurs"
FROM public.clients;

-- Liste complète des utilisateurs avec leur plan
SELECT 
  '📋 LISTE COMPLÈTE DES UTILISATEURS' as "Info";

SELECT 
  email as "📧 Email",
  plan as "📊 Plan",
  company_name as "🏢 Entreprise",
  CASE 
    WHEN plan = 'expert' THEN '🔥 ADMIN - Peut tout voir'
    WHEN plan = 'free' THEN '👤 Utilisateur normal'
    ELSE '❓ Plan inconnu'
  END as "🎯 Accès",
  created_at as "📅 Créé le"
FROM public.clients
ORDER BY 
  CASE WHEN plan = 'expert' THEN 0 ELSE 1 END,
  created_at DESC;

-- Vérifier que tout est synchronisé
SELECT 
  CASE 
    WHEN (SELECT COUNT(*) FROM auth.users) = (SELECT COUNT(*) FROM public.clients) 
    THEN '✅ SYNCHRONISATION PARFAITE'
    ELSE '⚠️ PROBLÈME DE SYNCHRONISATION'
  END as "Statut synchronisation";

-- Vérifier que l'admin a le bon plan
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM public.clients WHERE email = 'oscarbrixon@gmail.com' AND plan = 'expert')
    THEN '✅ oscarbrixon@gmail.com a le plan EXPERT'
    ELSE '❌ oscarbrixon@gmail.com N''A PAS le plan expert'
  END as "Statut admin";

SELECT '═══════════════════════════════════════════════════════════' as "═══════";
SELECT '              🎉 CONFIGURATION TERMINÉE !                  ' as "SUCCÈS";
SELECT '═══════════════════════════════════════════════════════════' as "═══════";
SELECT '                                                            ' as " ";
SELECT '  ➡️  Retournez dans Meetizy                               ' as "PROCHAINES ÉTAPES";
SELECT '  ➡️  Allez dans Admin                                      ' as " ";
SELECT '  ➡️  Cliquez sur "Actualiser" 🔄                           ' as " ";
SELECT '  ➡️  Vous devriez voir TOUS les utilisateurs !            ' as " ";
SELECT '                                                            ' as " ";
SELECT '═══════════════════════════════════════════════════════════' as "═══════";
