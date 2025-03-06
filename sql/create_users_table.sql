-- Fonction pour mettre à jour le timestamp
CREATE OR REPLACE FUNCTION public.set_updated_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour créer la table users si elle n'existe pas
CREATE OR REPLACE FUNCTION public.create_users_table_if_not_exists()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Vérifier si la table users existe
  IF NOT EXISTS (
    SELECT FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'users'
  ) THEN
    -- Créer la table users
    CREATE TABLE public.users (
      id UUID PRIMARY KEY REFERENCES auth.users(id),
      email VARCHAR(255) NOT NULL UNIQUE,
      full_name VARCHAR(255),
      role VARCHAR(50) NOT NULL,
      department VARCHAR(100),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Ajouter des index pour améliorer les performances
    CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
    
    -- Ajouter un trigger pour mettre à jour updated_at
    CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_timestamp();
    
    RAISE NOTICE 'Table users créée avec succès';
  ELSE
    RAISE NOTICE 'La table users existe déjà';
  END IF;
END;
$$; 