-- Fonction pour récupérer tous les utilisateurs avec leurs rôles
CREATE OR REPLACE FUNCTION public.get_all_users_with_roles()
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  role TEXT,
  department TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Récupère les utilisateurs depuis auth.users, rejoints avec les user_profiles et les rôles
  RETURN QUERY
  SELECT 
    au.id,
    au.email,
    COALESCE(up.full_name, au.raw_user_meta_data->>'full_name') as full_name,
    COALESCE(r.name, au.raw_user_meta_data->>'role', 'ETUDIANT') as role,
    d.name as department,
    au.created_at,
    COALESCE(up.updated_at, au.updated_at) as updated_at
  FROM 
    auth.users au
  LEFT JOIN 
    public.user_profiles up ON au.id = up.id
  LEFT JOIN 
    public.roles r ON up.role_id = r.id
  LEFT JOIN 
    public.departments d ON up.department_id = d.id
  ORDER BY 
    au.email ASC;
END;
$$; 