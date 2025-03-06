-- Fonction pour récupérer tous les utilisateurs avec leurs rôles
CREATE OR REPLACE FUNCTION public.get_all_users_with_roles()
RETURNS SETOF public.users
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Vérifier si la table users existe, sinon la créer
  PERFORM create_users_table_if_not_exists();
  
  -- Si la table est vide, essayons de synchroniser les utilisateurs
  IF (SELECT COUNT(*) FROM public.users) = 0 THEN
    -- Insérer les utilisateurs depuis auth.users qui ne sont pas déjà dans la table users
    INSERT INTO public.users (id, email, full_name, role, department, created_at, updated_at)
    SELECT 
      au.id,
      au.email,
      COALESCE(au.raw_user_meta_data->>'full_name', ''),
      COALESCE(au.raw_user_meta_data->>'role', 'ETUDIANT'),
      COALESCE(au.raw_user_meta_data->>'department', ''),
      au.created_at,
      au.updated_at
    FROM 
      auth.users au
    WHERE 
      NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id = au.id);
  END IF;
  
  -- Retourner tous les utilisateurs de la table users
  RETURN QUERY
  SELECT * FROM public.users ORDER BY created_at DESC;
END;
$$; 