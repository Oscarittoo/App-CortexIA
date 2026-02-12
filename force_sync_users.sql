-- =====================================================
-- FORCER LA SYNCHRONISATION DES UTILISATEURS
-- =====================================================
-- ⚠️ Exécutez ce script SI le diagnostic montre
--    des utilisateurs manquants dans public.clients
-- =====================================================

-- Synchroniser TOUS les utilisateurs de auth.users vers public.clients
INSERT INTO public.clients (
  id, 
  email, 
  company_name, 
  plan, 
  stripe_customer_id,
  stripe_subscription_id,
  created_at, 
  last_updated
)
SELECT 
  u.id,
  u.email,
  COALESCE(u.raw_user_meta_data->>'company_name', NULL) as company_name,
  COALESCE(u.raw_user_meta_data->>'plan', 'free') as plan,
  NULL as stripe_customer_id,
  NULL as stripe_subscription_id,
  u.created_at,
  NOW() as last_updated
FROM auth.users u
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  company_name = COALESCE(EXCLUDED.company_name, clients.company_name),
  plan = COALESCE(EXCLUDED.plan, clients.plan),
  last_updated = NOW();

-- Vérifier le résultat
SELECT 
  COUNT(*) as "Total utilisateurs synchronisés"
FROM public.clients;

SELECT 
  id,
  email,
  company_name,
  plan,
  created_at
FROM public.clients
ORDER BY created_at DESC;
