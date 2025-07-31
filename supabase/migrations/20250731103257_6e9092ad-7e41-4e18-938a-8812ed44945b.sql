-- Create a function to find user for login (bypasses RLS)
CREATE OR REPLACE FUNCTION public.find_user_for_login(
  p_username text,
  p_company_id uuid
)
RETURNS TABLE (
  id uuid,
  email text,
  username text,
  company_id uuid
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT p.id, p.email, p.username, p.company_id
  FROM public.profiles p
  WHERE p.username = p_username 
  AND p.company_id = p_company_id;
$$;