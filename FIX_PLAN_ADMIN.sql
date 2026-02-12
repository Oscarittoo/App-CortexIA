-- =====================================================
-- CORRECTION PLAN ADMIN - oscarbrixon@gmail.com
-- =====================================================
-- Ce script met à jour le plan de votre compte admin
-- pour qu'il puisse voir tous les utilisateurs
-- =====================================================

-- 1️⃣ Vérifier le plan actuel de oscarbrixon@gmail.com
SELECT 
  '1️⃣ PLAN ACTUEL' as "Étape",
  email,
  plan,
  id
FROM public.clients
WHERE email = 'oscarbrixon@gmail.com';

-- 2️⃣ Mettre à jour le plan à 'expert'
UPDATE public.clients
SET 
  plan = 'expert',
  last_updated = NOW()
WHERE email = 'oscarbrixon@gmail.com';

-- 3️⃣ Vérifier la mise à jour
SELECT 
  '3️⃣ PLAN APRÈS MISE À JOUR' as "Étape",
  email,
  plan,
  id
FROM public.clients
WHERE email = 'oscarbrixon@gmail.com';

-- 4️⃣ Vérifier tous les utilisateurs maintenant visibles
SELECT 
  '4️⃣ TOUS LES UTILISATEURS (devrait montrer 2)' as "Étape";

SELECT 
  email,
  plan,
  company_name,
  created_at
FROM public.clients
ORDER BY created_at DESC;

-- =====================================================
-- RÉSULTAT ATTENDU
-- =====================================================
-- Après cette mise à jour, oscarbrixon@gmail.com aura
-- le plan 'expert' et pourra voir tous les utilisateurs
-- dans l'AdminDashboard
-- =====================================================
