-- Function to update user metadata
CREATE OR REPLACE FUNCTION public.update_user_metadata(
  user_id UUID,
  metadata JSONB
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_metadata JSONB;
  updated_metadata JSONB;
BEGIN
  -- Get current metadata
  SELECT raw_user_meta_data INTO current_metadata 
  FROM auth.users 
  WHERE id = user_id;
  
  -- If user not found
  IF current_metadata IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- Merge new metadata with existing metadata
  updated_metadata = current_metadata || metadata;
  
  -- Update the user's metadata
  UPDATE auth.users
  SET raw_user_meta_data = updated_metadata
  WHERE id = user_id;
  
  RETURN TRUE;
END;
$$; 