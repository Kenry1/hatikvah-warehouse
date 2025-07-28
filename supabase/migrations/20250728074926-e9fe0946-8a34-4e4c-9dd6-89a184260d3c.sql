-- Create enum types
CREATE TYPE public.user_role AS ENUM (
  'ICT', 'Finance', 'Health and Safety', 'Employee', 'HR', 
  'Implementation Manager', 'Logistics', 'Operations Manager', 
  'Planning', 'Project Manager', 'Site Engineer', 'Warehouse', 
  'Admin', 'Procurement', 'Management'
);

CREATE TYPE public.request_status AS ENUM ('pending', 'approved', 'rejected', 'completed');
CREATE TYPE public.vehicle_status AS ENUM ('available', 'assigned', 'maintenance', 'out_of_service');
CREATE TYPE public.leave_type AS ENUM ('annual', 'sick', 'maternity', 'emergency', 'study');

-- Companies table (multi-tenant)
CREATE TABLE public.companies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Profiles table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  email TEXT NOT NULL,
  role public.user_role NOT NULL DEFAULT 'Employee',
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, username),
  UNIQUE(company_id, email)
);

-- Vehicles table
CREATE TABLE public.vehicles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  plate_number TEXT NOT NULL,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  status public.vehicle_status NOT NULL DEFAULT 'available',
  assigned_to UUID REFERENCES public.profiles(id),
  last_service_date DATE,
  next_service_date DATE,
  insurance_expiry DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(company_id, plate_number)
);

-- Projects table
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  start_date DATE,
  end_date DATE,
  status public.request_status NOT NULL DEFAULT 'pending',
  project_manager_id UUID REFERENCES public.profiles(id),
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Leave requests table
CREATE TABLE public.leave_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  leave_type public.leave_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status public.request_status NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Finance requests table
CREATE TABLE public.finance_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  amount DECIMAL(12,2) NOT NULL,
  category TEXT,
  project_id UUID REFERENCES public.projects(id),
  status public.request_status NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- IT tickets table
CREATE TABLE public.it_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'medium',
  category TEXT,
  status public.request_status NOT NULL DEFAULT 'pending',
  assigned_to UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Safety reports table
CREATE TABLE public.safety_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  reported_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  incident_date DATE NOT NULL,
  location TEXT,
  severity TEXT NOT NULL DEFAULT 'low',
  status public.request_status NOT NULL DEFAULT 'pending',
  investigated_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Materials table
CREATE TABLE public.materials (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- Safety, FTTH, FTTX, Company Assets
  description TEXT,
  unit TEXT NOT NULL,
  unit_price DECIMAL(10,2),
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  minimum_stock INTEGER NOT NULL DEFAULT 0,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Material requests table
CREATE TABLE public.material_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  requested_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES public.materials(id),
  project_id UUID REFERENCES public.projects(id),
  quantity INTEGER NOT NULL,
  reason TEXT,
  status public.request_status NOT NULL DEFAULT 'pending',
  approved_by UUID REFERENCES public.profiles(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Suppliers table
CREATE TABLE public.suppliers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finance_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.it_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.safety_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.material_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- Create function to get user's company_id
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create function to check user role
CREATE OR REPLACE FUNCTION public.has_role(required_role public.user_role)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = required_role
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for companies
CREATE POLICY "Users can view their own company" ON public.companies
  FOR SELECT USING (id = public.get_user_company_id());

-- RLS Policies for profiles
CREATE POLICY "Users can view profiles in their company" ON public.profiles
  FOR SELECT USING (company_id = public.get_user_company_id());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "ICT and Admin can manage all profiles in company" ON public.profiles
  FOR ALL USING (
    company_id = public.get_user_company_id() AND 
    (public.has_role('ICT') OR public.has_role('Admin'))
  );

-- RLS Policies for vehicles
CREATE POLICY "Users can view vehicles in their company" ON public.vehicles
  FOR SELECT USING (company_id = public.get_user_company_id());

CREATE POLICY "Logistics can manage vehicles" ON public.vehicles
  FOR ALL USING (
    company_id = public.get_user_company_id() AND 
    (public.has_role('Logistics') OR public.has_role('Admin'))
  );

-- RLS Policies for projects
CREATE POLICY "Users can view projects in their company" ON public.projects
  FOR SELECT USING (company_id = public.get_user_company_id());

CREATE POLICY "Project Managers can manage projects" ON public.projects
  FOR ALL USING (
    company_id = public.get_user_company_id() AND 
    (public.has_role('Project Manager') OR public.has_role('Admin'))
  );

-- RLS Policies for leave requests
CREATE POLICY "Users can view leave requests in their company" ON public.leave_requests
  FOR SELECT USING (company_id = public.get_user_company_id());

CREATE POLICY "Users can create their own leave requests" ON public.leave_requests
  FOR INSERT WITH CHECK (
    company_id = public.get_user_company_id() AND employee_id = auth.uid()
  );

CREATE POLICY "HR can manage leave requests" ON public.leave_requests
  FOR ALL USING (
    company_id = public.get_user_company_id() AND 
    (public.has_role('HR') OR public.has_role('Admin'))
  );

-- RLS Policies for finance requests
CREATE POLICY "Users can view finance requests in their company" ON public.finance_requests
  FOR SELECT USING (company_id = public.get_user_company_id());

CREATE POLICY "Users can create finance requests" ON public.finance_requests
  FOR INSERT WITH CHECK (
    company_id = public.get_user_company_id() AND requested_by = auth.uid()
  );

CREATE POLICY "Finance can manage finance requests" ON public.finance_requests
  FOR ALL USING (
    company_id = public.get_user_company_id() AND 
    (public.has_role('Finance') OR public.has_role('Admin'))
  );

-- RLS Policies for IT tickets
CREATE POLICY "Users can view IT tickets in their company" ON public.it_tickets
  FOR SELECT USING (company_id = public.get_user_company_id());

CREATE POLICY "Users can create IT tickets" ON public.it_tickets
  FOR INSERT WITH CHECK (
    company_id = public.get_user_company_id() AND reported_by = auth.uid()
  );

CREATE POLICY "ICT can manage IT tickets" ON public.it_tickets
  FOR ALL USING (
    company_id = public.get_user_company_id() AND 
    (public.has_role('ICT') OR public.has_role('Admin'))
  );

-- RLS Policies for safety reports
CREATE POLICY "Users can view safety reports in their company" ON public.safety_reports
  FOR SELECT USING (company_id = public.get_user_company_id());

CREATE POLICY "Users can create safety reports" ON public.safety_reports
  FOR INSERT WITH CHECK (
    company_id = public.get_user_company_id() AND reported_by = auth.uid()
  );

CREATE POLICY "Safety officers can manage safety reports" ON public.safety_reports
  FOR ALL USING (
    company_id = public.get_user_company_id() AND 
    (public.has_role('Health and Safety') OR public.has_role('Admin'))
  );

-- RLS Policies for materials
CREATE POLICY "Users can view materials in their company" ON public.materials
  FOR SELECT USING (company_id = public.get_user_company_id());

CREATE POLICY "Warehouse can manage materials" ON public.materials
  FOR ALL USING (
    company_id = public.get_user_company_id() AND 
    (public.has_role('Warehouse') OR public.has_role('Admin'))
  );

-- RLS Policies for material requests
CREATE POLICY "Users can view material requests in their company" ON public.material_requests
  FOR SELECT USING (company_id = public.get_user_company_id());

CREATE POLICY "Users can create material requests" ON public.material_requests
  FOR INSERT WITH CHECK (
    company_id = public.get_user_company_id() AND requested_by = auth.uid()
  );

CREATE POLICY "Warehouse can manage material requests" ON public.material_requests
  FOR ALL USING (
    company_id = public.get_user_company_id() AND 
    (public.has_role('Warehouse') OR public.has_role('Admin'))
  );

-- RLS Policies for suppliers
CREATE POLICY "Users can view suppliers in their company" ON public.suppliers
  FOR SELECT USING (company_id = public.get_user_company_id());

CREATE POLICY "Procurement can manage suppliers" ON public.suppliers
  FOR ALL USING (
    company_id = public.get_user_company_id() AND 
    (public.has_role('Procurement') OR public.has_role('Admin'))
  );

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON public.vehicles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON public.projects FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_leave_requests_updated_at BEFORE UPDATE ON public.leave_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_finance_requests_updated_at BEFORE UPDATE ON public.finance_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_it_tickets_updated_at BEFORE UPDATE ON public.it_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_safety_reports_updated_at BEFORE UPDATE ON public.safety_reports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON public.materials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_material_requests_updated_at BEFORE UPDATE ON public.material_requests FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, 
    company_id, 
    username, 
    email, 
    role,
    first_name,
    last_name
  )
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data ->> 'company_id')::UUID,
    NEW.raw_user_meta_data ->> 'username',
    NEW.email,
    (NEW.raw_user_meta_data ->> 'role')::public.user_role,
    NEW.raw_user_meta_data ->> 'first_name',
    NEW.raw_user_meta_data ->> 'last_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();