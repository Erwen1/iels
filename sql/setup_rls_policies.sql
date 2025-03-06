-- Configuration des politiques RLS (Row Level Security)

-- 1. Activer RLS sur la table users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 2. Politique pour permettre à tous les utilisateurs authentifiés de voir la table users
CREATE POLICY users_select_policy ON public.users
FOR SELECT 
USING (auth.role() = 'authenticated');

-- 3. Politique pour permettre uniquement aux administrateurs de modifier la table users
CREATE POLICY users_all_admin_policy ON public.users
FOR ALL
USING (
  auth.role() = 'authenticated' AND 
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
);

-- 4. Créer une vue publique pour auth.users (disponible uniquement pour les administrateurs)
CREATE OR REPLACE VIEW public.auth_users AS
SELECT 
  id,
  email,
  raw_user_meta_data,
  created_at,
  updated_at
FROM 
  auth.users;

-- 5. Activer RLS sur la vue auth_users
ALTER VIEW public.auth_users ENABLE ROW LEVEL SECURITY;

-- 6. Politique pour permettre uniquement aux administrateurs de voir auth_users
CREATE POLICY auth_users_select_admin_policy ON public.auth_users
FOR SELECT 
USING (
  auth.role() = 'authenticated' AND 
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() AND role = 'ADMIN'
  )
); 