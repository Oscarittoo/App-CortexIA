-- =====================================================
-- TRIGGER SUPABASE : Synchronisation Auth → Table Clients
-- =====================================================
-- 
-- Ce script crée un trigger automatique qui synchronise
-- tous les nouveaux utilisateurs de auth.users vers
-- la table public.clients
--
-- À exécuter dans : Supabase Dashboard > SQL Editor
-- =====================================================

-- =====================================================
-- ÉTAPE 1 : Créer la fonction trigger
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insérer ou mettre à jour l'utilisateur dans la table clients
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

-- =====================================================
-- ÉTAPE 2 : Créer le trigger
-- =====================================================

-- Supprimer le trigger existant s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Créer le nouveau trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- ÉTAPE 3 : Synchroniser les utilisateurs existants
-- =====================================================

-- Cette requête ajout tous les utilisateurs existants
-- qui ne sont pas encore dans la table clients
INSERT INTO public.clients (id, email, company_name, plan, created_at, last_updated)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'company_name', NULL) as company_name,
  COALESCE(u.raw_user_meta_data->>'plan', 'free') as plan,
  u.created_at,
  NOW()
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.clients c WHERE c.id = u.id
)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- ÉTAPE 4 : Vérification
-- =====================================================

-- Exécuter cette requête pour vérifier que tout est synchronisé
SELECT 
  COUNT(*) FILTER (WHERE c.id IS NOT NULL) as "Utilisateurs synchronisés",
  COUNT(*) FILTER (WHERE c.id IS NULL) as "Utilisateurs manquants",
  COUNT(*) as "Total utilisateurs Auth"
FROM auth.users u
LEFT JOIN public.clients c ON u.id = c.id;

-- =====================================================
-- RÉSULTAT ATTENDU
-- =====================================================
-- 
-- Vous devriez voir :
-- - "Utilisateurs synchronisés" = nombre total d'utilisateurs
-- - "Utilisateurs manquants" = 0
-- 
-- Si "Utilisateurs manquants" > 0, ré-exécutez l'ÉTAPE 3
-- =====================================================

-- =====================================================
-- TEST DU TRIGGER
-- =====================================================
--
-- Pour tester, créez un nouveau compte depuis l'application
-- puis exécutez la requête de vérification ci-dessus.
-- Le nouveau compte devrait apparaître immédiatement dans
-- la table clients.
-- =====================================================
