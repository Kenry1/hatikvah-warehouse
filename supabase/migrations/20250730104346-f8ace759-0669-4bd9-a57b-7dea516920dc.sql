-- Re-enable RLS on companies table
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Create policies that properly allow company creation
-- Allow anonymous users to create companies (needed for signup)
CREATE POLICY "Allow anonymous company creation" ON public.companies
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Allow authenticated users to view their own company
CREATE POLICY "Users can view their own company" ON public.companies
FOR SELECT 
TO authenticated
USING (id = get_user_company_id());