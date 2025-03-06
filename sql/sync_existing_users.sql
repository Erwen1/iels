-- Script pour synchroniser les utilisateurs existants dans auth.users avec la table users
-- Exécuter ce script après avoir créé la table users

-- Assurez-vous que la table users existe
SELECT create_users_table_if_not_exists();

-- Insérer les utilisateurs qui n'existent pas encore dans la table users
INSERT INTO public.users (
  id,
  email,
  full_name,
  role,
  department,
  created_at,
  updated_at
)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', '') as full_name,
  COALESCE(au.raw_user_meta_data->>'role', 'ETUDIANT') as role,
  COALESCE(au.raw_user_meta_data->>'department', '') as department,
  au.created_at,
  au.updated_at
FROM 
  auth.users au
LEFT JOIN 
  public.users u ON au.id = u.id
WHERE 
  u.id IS NULL;

-- Afficher le nombre d'utilisateurs synchronisés
DO $$
DECLARE
  count_users INT;
BEGIN
  SELECT COUNT(*) INTO count_users FROM public.users;
  RAISE NOTICE 'Synchronisation terminée. Nombre d''utilisateurs dans la table: %', count_users;
END $$; 