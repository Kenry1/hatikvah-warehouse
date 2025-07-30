-- Check current policies on companies table
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'companies';

-- Let's completely disable RLS temporarily to test, then set it up properly
ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;

-- Re-enable RLS
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow unauthenticated company creation" ON public.companies;
DROP POLICY IF EXISTS "Users can view their own company" ON public.companies;

-- Create a simple policy that allows anyone to insert companies (for signup process)
CREATE POLICY "Anyone can create companies" ON public.companies
FOR INSERT 
TO public, anon
WITH CHECK (true);

-- Create a policy that allows authenticated users to view their own company
CREATE POLICY "Users can view their own company" ON public.companies
FOR SELECT 
TO authenticated
USING (id = get_user_company_id());