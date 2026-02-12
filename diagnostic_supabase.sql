-- =====================================================
-- DIAGNOSTIC COMPLET - Synchronisation Supabase
-- =====================================================
-- À exécuter dans : Supabase Dashboard > SQL Editor
-- =====================================================

-- 1️⃣ Vérifier combien d'utilisateurs dans auth.users
SELECT '1️⃣ UTILISATEURS AUTH' as "Étape";
SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data->>'company_name' as company_name,
  raw_user_meta_data->>'plan' as plan
FROM auth.users
ORDER BY created_at DESC;

-- 2️⃣ Vérifier combien d'utilisateurs dans public.clients
SELECT '2️⃣ UTILISATEURS CLIENTS' as "Étape";
SELECT 
  id,
  email,
  company_name,
  plan,
  created_at
FROM public.clients
ORDER BY created_at DESC;

-- 3️⃣ Trouver les utilisateurs manquants
SELECT '3️⃣ UTILISATEURS MANQUANTS (dans Auth mais pas dans Clients)' as "Étape";
SELECT 
  u.id,
  u.email,
  u.created_at as "Date création Auth"
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.clients c WHERE c.id = u.id
);

-- 4️⃣ Vérifier si le trigger existe
SELECT '4️⃣ TRIGGER INSTALLÉ ?' as "Étape";
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- 5️⃣ Vérifier si la fonction existe
SELECT '5️⃣ FONCTION TRIGGER INSTALLÉE ?' as "Étape";
SELECT 
  proname as "Nom fonction",
  prosrc as "Code fonction"
FROM pg_proc
WHERE proname = 'handle_new_user';

-- =====================================================
-- RÉSULTATS ATTENDUS :
-- =====================================================
-- 1️⃣ Devrait montrer 2 utilisateurs (oscarbrixon + mathieudeloup)
-- 2️⃣ Devrait montrer 2 utilisateurs (oscarbrixon + mathieudeloup)
-- 3️⃣ Devrait être VIDE (aucun utilisateur manquant)
-- 4️⃣ Devrait montrer le trigger "on_auth_user_created"
-- 5️⃣ Devrait montrer la fonction "handle_new_user"
-- =====================================================
