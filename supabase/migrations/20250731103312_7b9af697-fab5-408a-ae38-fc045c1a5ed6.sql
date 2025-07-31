-- Re-enable RLS on companies table and fix policies
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read companies for the dropdown
CREATE POLICY "Anyone can view companies" 
ON public.companies 
FOR SELECT 
USING (true);

-- Allow anonymous company creation during registration
CREATE POLICY "Allow company creation during registration" 
ON public.companies 
FOR INSERT 
WITH CHECK (true);