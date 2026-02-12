-- =====================================================
-- CORRECTION : RÉCUPÉRATION DES PLANS ET ENTREPRISES
-- =====================================================
-- Ce script :
-- 1. Met à jour le trigger pour qu'il enregistre le PLAN et l'ENTREPRISE
-- 2. Remplit les informations manquantes pour les utilisateurs existants
-- =====================================================

-- 1️⃣ Mettre à jour la fonction trigger (pour les futurs utilisateurs)
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
    -- Récupérer le nom de l'entreprise depuis les métadonnées
    COALESCE(NEW.raw_user_meta_data->>'company_name', NULL),
    -- Récupérer le plan (défaut: 'free')
    COALESCE(NEW.raw_user_meta_data->>'plan', 'free'),
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    -- Mettre à jour si l'utilisateur existe déjà
    email = EXCLUDED.email,
    company_name = COALESCE(EXCLUDED.company_name, clients.company_name),
    plan = COALESCE(EXCLUDED.plan, clients.plan),
    last_updated = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2️⃣ Réparer les données existantes (Backfill)
-- Cette requête va chercher les infos dans auth.users et mettre à jour public.clients
UPDATE public.clients c
SET
  company_name = COALESCE(u.raw_user_meta_data->>'company_name', c.company_name),
  plan = COALESCE(u.raw_user_meta_data->>'plan', 'free'),
  last_updated = NOW()
FROM auth.users u
WHERE c.id = u.id;

-- 3️⃣ Vérification
SELECT 
  email,
  plan,
  company_name
FROM public.clients
ORDER BY created_at DESC;

SELECT '✅ Données de plan et entreprise restaurées avec succès' as "Résultat";
