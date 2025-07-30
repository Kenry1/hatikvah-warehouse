-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Allow unauthenticated company creation" ON public.companies;
DROP POLICY IF EXISTS "Users can view their own company" ON public.companies;

-- Create a policy that allows unauthenticated users to insert companies
CREATE POLICY "Allow unauthenticated company creation" ON public.companies
FOR INSERT 
WITH CHECK (true);

-- Create a policy that allows users to view their own company
CREATE POLICY "Users can view their own company" ON public.companies
FOR SELECT 
USING (id = get_user_company_id());