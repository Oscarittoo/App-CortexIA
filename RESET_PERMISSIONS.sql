-- =====================================================
-- RESET TOTAL - RETOUR À LA NORMALE
-- =====================================================
-- Ce script va :
-- 1. Supprimer toutes les configurations complexes
-- 2. Restaurer les permissions de base (chacun voit ses données)
-- 3. Réparer l'accès à votre compte immédiatemment
-- =====================================================

-- 1️⃣ Supprimer les politiques compliquées
DROP POLICY IF EXISTS "clients_select_policy" ON public.clients;
DROP POLICY IF EXISTS "clients_insert_policy" ON public.clients;
DROP POLICY IF EXISTS "clients_update_policy" ON public.clients;
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leur propre profil" ON public.clients;
DROP POLICY IF EXISTS "Les administrateurs peuvent tout voir" ON public.clients;
DROP POLICY IF EXISTS "admin_read_all" ON public.clients;
DROP POLICY IF EXISTS "user_read_own" ON public.clients;

-- 2️⃣ Restaurer les permissions STANDARD (Sécurité maximale)
-- Chacun ne voit QUE ses propres données
CREATE POLICY "Voir ses propres données"
ON public.clients FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Modifier ses propres données"
ON public.clients FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Créer ses propres données"
ON public.clients FOR INSERT
WITH CHECK (auth.uid() = id);

-- 3️⃣ Garder le trigger (C'est la BDD qui gère la création !)
-- Comme demandé : "laisser la bdd s'en charger"
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.clients (id, email, created_at, last_updated)
  VALUES (NEW.id, NEW.email, NOW(), NOW())
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4️⃣ Vérification immédiate
SELECT '✅ Permissions remises à zéro. Vous devriez revoir votre compte.' as "Statut";
