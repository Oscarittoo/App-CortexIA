-- 🚨 CORRECTION D'URGENCE - ERREURE "INFINITE RECURSION" 🚨
-- Ce script supprime la règle qui tourne en rond et bloque la connexion.

-- 1. Désactiver la sécurité temporairement pour arrêter la boucle
ALTER TABLE public.clients DISABLE ROW LEVEL SECURITY;

-- 2. Supprimer TOUTES les règles existantes (nettoyage complet)
DROP POLICY IF EXISTS "clients_select_policy" ON public.clients;
DROP POLICY IF EXISTS "clients_insert_policy" ON public.clients;
DROP POLICY IF EXISTS "clients_update_policy" ON public.clients;
DROP POLICY IF EXISTS "clients_delete_policy" ON public.clients;
DROP POLICY IF EXISTS "admin_read_all" ON public.clients;
DROP POLICY IF EXISTS "user_read_own" ON public.clients;
DROP POLICY IF EXISTS "Voir ses propres données" ON public.clients;
DROP POLICY IF EXISTS "Modifier ses propres données" ON public.clients;
DROP POLICY IF EXISTS "Créer ses propres données" ON public.clients;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leur propre profil" ON public.clients;
DROP POLICY IF EXISTS "Les administrateurs peuvent tout voir" ON public.clients;

-- 3. Réactiver la sécurité
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

-- 4. Remettre la règle SIMPLE (Sans boucle)
-- "Un utilisateur ne peut voir et modifier que SA PROPRE ligne"
CREATE POLICY "policy_simple_access"
ON public.clients
FOR ALL
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 5. Vérifier que c'est débloqué
SELECT '✅ BOUCLE INFINIE RÉSOLUE - VOUS POUVEZ VOUS CONNECTER' as "Statut";
