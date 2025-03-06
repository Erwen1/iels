-- Fonction pour synchroniser les utilisateurs existants dans auth.users avec la table users
CREATE OR REPLACE FUNCTION public.sync_existing_users()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  count_before integer;
  count_after integer;
BEGIN
  -- Assurez-vous que la table users existe
  PERFORM create_users_table_if_not_exists();
  
  -- Compter les utilisateurs avant la synchronisation
  SELECT COUNT(*) INTO count_before FROM public.users;
  
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
  
  -- Compter les utilisateurs après la synchronisation
  SELECT COUNT(*) INTO count_after FROM public.users;
  
  -- Retourner le nombre d'utilisateurs ajoutés
  RETURN count_after - count_before;
END;
$$; 