-- =====================================================
-- DIAGNOSTIC DES DONNÉES BRUTES (RAW DATA)
-- =====================================================
-- Ce script va afficher EXACTEMENT ce qui est stocké
-- dans la colonne cachée "raw_user_meta_data"
-- =====================================================

SELECT 
  id,
  email,
  created_at,
  -- Afficher tout le JSON brut pour voir ce qu'il contient
  raw_user_meta_data,
  -- Essayer d'extraire le plan
  raw_user_meta_data->>'plan' as extracted_plan,
  -- Essayer d'extraire le nom de l'entreprise
  raw_user_meta_data->>'company_name' as extracted_company,
  -- Vérifier s'il y a d'autres clés (comme companyName ou subscription_plan)
  raw_user_meta_data->>'companyName' as alt_company,
  raw_user_meta_data->>'full_name' as full_name
FROM auth.users
ORDER BY created_at DESC;
