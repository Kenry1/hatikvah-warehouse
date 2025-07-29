-- Insert demo companies
INSERT INTO public.companies (id, name) VALUES 
('11111111-1111-1111-1111-111111111111', 'TechCorp Solutions'),
('22222222-2222-2222-2222-222222222222', 'BuildMaster Construction'),
('33333333-3333-3333-3333-333333333333', 'GlobalNet Services');

-- Insert demo materials
INSERT INTO public.materials (id, company_id, name, category, description, unit, unit_price, stock_quantity, minimum_stock, created_by) VALUES 
-- TechCorp materials
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Safety Helmet', 'Safety', 'Standard safety helmet with chin strap', 'piece', 25.50, 50, 10, '11111111-1111-1111-1111-111111111111'),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Fiber Optic Cable', 'FTTH', 'Single mode fiber optic cable 9/125', 'meter', 2.75, 1000, 100, '11111111-1111-1111-1111-111111111111'),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Network Switch', 'FTTX', '24-port gigabit ethernet switch', 'piece', 150.00, 20, 5, '11111111-1111-1111-1111-111111111111'),
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Company Vehicle', 'Company Assets', 'Fleet vehicle for company operations', 'piece', 25000.00, 5, 1, '11111111-1111-1111-1111-111111111111'),

-- BuildMaster materials  
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Safety Vest', 'Safety', 'High visibility safety vest', 'piece', 15.00, 100, 20, '22222222-2222-2222-2222-222222222222'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Concrete Mixer', 'Company Assets', 'Industrial concrete mixer', 'piece', 5000.00, 3, 1, '22222222-2222-2222-2222-222222222222'),

-- GlobalNet materials
(gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Server Rack', 'Company Assets', '42U server rack with cooling', 'piece', 800.00, 10, 2, '33333333-3333-3333-3333-333333333333');

-- Insert demo vehicles
INSERT INTO public.vehicles (id, company_id, plate_number, make, model, year, status) VALUES 
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'TC-001', 'Toyota', 'Hilux', 2022, 'available'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'TC-002', 'Ford', 'Ranger', 2021, 'assigned'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'BM-101', 'Isuzu', 'D-Max', 2023, 'available'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', 'GN-201', 'Nissan', 'Navara', 2022, 'maintenance');

-- Insert demo projects
INSERT INTO public.projects (id, company_id, name, description, start_date, end_date, status, created_by) VALUES 
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Network Infrastructure Upgrade', 'Upgrade company network infrastructure', '2024-01-15', '2024-06-30', 'pending', '11111111-1111-1111-1111-111111111111'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'Office Building Construction', 'New office building project', '2024-02-01', '2024-12-31', 'approved', '22222222-2222-2222-2222-222222222222'),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Data Center Expansion', 'Expand existing data center capacity', '2024-03-01', '2024-09-30', 'pending', '33333333-3333-3333-3333-333333333333');

-- Insert demo suppliers
INSERT INTO public.suppliers (id, company_id, name, contact_person, email, phone, address, created_by) VALUES 
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', 'Tech Supplies Ltd', 'John Smith', 'john@techsupplies.com', '+1234567890', '123 Tech Street, Tech City', '11111111-1111-1111-1111-111111111111'),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', 'BuildPro Materials', 'Sarah Johnson', 'sarah@buildpro.com', '+1987654321', '456 Build Avenue, Construction Town', '22222222-2222-2222-2222-222222222222'),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Global Hardware Inc', 'Mike Wilson', 'mike@globalhw.com', '+1122334455', '789 Hardware Blvd, Hardware City', '33333333-3333-3333-3333-333333333333');