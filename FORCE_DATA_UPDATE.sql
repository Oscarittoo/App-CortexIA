-- =====================================================
-- CORRECTION MANUELLE FORCÉE
-- =====================================================
-- Si la récupération automatique échoue, c'est que les
-- métadonnées sont vides. On va les remplir à la main.
-- =====================================================

-- 1. Corriger oscarbrixon@gmail.com (Expert)
UPDATE public.clients
SET 
  plan = 'expert',
  company_name = 'CortexAdmin',
  last_updated = NOW()
WHERE email = 'oscarbrixon@gmail.com';

-- 2. Corriger mathieudeloup@gmail.com (Free)
UPDATE public.clients
SET 
  plan = 'free',
  company_name = NULL,
  last_updated = NOW()
WHERE email = 'mathieudeloup@gmail.com';

-- 3. Mettre 'free' par défaut pour tous ceux qui n'ont rien
UPDATE public.clients
SET 
  plan = 'free',
  last_updated = NOW()
WHERE plan IS NULL OR plan = '';

-- 4. Vérifier le résultat final
SELECT * FROM public.clients ORDER BY created_at DESC;
