-- Drop ALL policies from companies table first
DROP POLICY IF EXISTS "Anyone can create companies" ON public.companies;
DROP POLICY IF EXISTS "Allow unauthenticated company creation" ON public.companies;
DROP POLICY IF EXISTS "Users can view their own company" ON public.companies;

-- Temporarily disable RLS to fix the issue
ALTER TABLE public.companies DISABLE ROW LEVEL SECURITY;