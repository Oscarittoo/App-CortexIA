-- =====================================================
-- SYNCHRONISATION INVERSE : CLIENTS → AUTHENTICATION
-- =====================================================
-- Ce script va :
-- 1. Corriger les valeurs (Expert -> expert, Gratuit -> free)
--    car l'app ne comprend que l'anglais minuscule !
-- 2. Copier ces infos vers "Authentication" (auth.users)
-- =====================================================

-- ÉTAPE 1 : Corriger les majuscules et le français
-- L'application a besoin de codes précis : 'expert', 'free'
UPDATE public.clients SET plan = 'expert' WHERE plan ILIKE 'Expert';
UPDATE public.clients SET plan = 'free' WHERE plan ILIKE 'Gratuit';
UPDATE public.clients SET plan = 'pro' WHERE plan ILIKE 'Pro';
UPDATE public.clients SET plan = 'business' WHERE plan ILIKE 'Business';

-- ÉTAPE 2 : Copier les infos de Clients vers Auth (Metadonnées)
UPDATE auth.users u
SET raw_user_meta_data = 
  COALESCE(u.raw_user_meta_data, '{}'::jsonb) || 
  jsonb_build_object(
    'plan', c.plan,
    'company_name', c.company_name
  )
FROM public.clients c
WHERE u.id = c.id;

-- ÉTAPE 3 : Vérification
SELECT 
  email,
  raw_user_meta_data->>'plan' as "Plan dans Auth",
  raw_user_meta_data->>'company_name' as "Entreprise dans Auth"
FROM auth.users
ORDER BY created_at DESC;

SELECT '✅ Les données sont maintenant identiques dans les deux tables' as "Résultat";
