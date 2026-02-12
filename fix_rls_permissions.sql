-- =====================================================
-- VÉRIFIER ET CORRIGER LES PERMISSIONS RLS
-- =====================================================
-- Certaines politiques RLS peuvent empêcher de voir
-- tous les utilisateurs dans AdminDashboard
-- =====================================================

-- 1️⃣ Vérifier si RLS est activé sur la table clients
SELECT '1️⃣ RLS ACTIVÉ SUR LA TABLE CLIENTS ?' as "Étape";
SELECT 
  schemaname,
  tablename,
  rowsecurity as "RLS activé ?"
FROM pg_tables
WHERE tablename = 'clients' AND schemaname = 'public';

-- 2️⃣ Voir toutes les politiques RLS existantes
SELECT '2️⃣ POLITIQUES RLS EXISTANTES' as "Étape";
SELECT 
  policyname as "Nom politique",
  cmd as "Commande (SELECT/INSERT/UPDATE/DELETE)",
  qual as "Condition"
FROM pg_policies
WHERE tablename = 'clients' AND schemaname = 'public';

-- 3️⃣ DÉSACTIVER temporairement RLS pour tester (⚠️ À utiliser avec précaution)
-- Décommentez ces lignes si vous voulez tester sans RLS :
-- ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;

-- 4️⃣ OU ajouter une politique pour permettre à tout utilisateur authentifié de voir tous les clients
-- (Recommandé pour l'AdminDashboard)

-- Supprimer l'ancienne politique si elle existe
DROP POLICY IF EXISTS "Les administrateurs peuvent tout voir" ON public.clients;

-- Créer une nouvelle politique pour permettre aux admins de tout voir
CREATE POLICY "Les administrateurs peuvent tout voir"
ON public.clients
FOR SELECT
TO authenticated
USING (
  -- Soit l'utilisateur est le propriétaire de la ligne
  auth.uid() = id
  OR
  -- Soit l'utilisateur a un plan 'expert' (admin)
  EXISTS (
    SELECT 1 FROM public.clients
    WHERE id = auth.uid() AND plan = 'expert'
  )
);

-- 5️⃣ Vérifier que la nouvelle politique est créée
SELECT '5️⃣ NOUVELLE POLITIQUE CRÉÉE' as "Étape";
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'clients' AND schemaname = 'public';

-- 6️⃣ TESTER : Afficher tous les clients (devrait maintenant montrer 2 utilisateurs)
SELECT '6️⃣ TEST FINAL - TOUS LES CLIENTS VISIBLES' as "Étape";
SELECT 
  id,
  email,
  company_name,
  plan,
  created_at
FROM public.clients
ORDER BY created_at DESC;

-- =====================================================
-- RÉSULTAT ATTENDU :
-- =====================================================
-- Vous devriez maintenant voir 2 utilisateurs :
-- - oscarbrixon@gmail.com (plan: expert)
-- - mathieudeloup@gmail.com (plan: free)
-- =====================================================
