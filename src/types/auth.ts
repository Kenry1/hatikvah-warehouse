export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  companyId: string;
  companyName: string;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  createdAt: string;
  adminUserId: string;
}

export type UserRole = 
  | 'ICT'
  | 'Finance'
  | 'Health and Safety'
  | 'Employee'
  | 'HR'
  | 'Implementation Manager'
  | 'Logistics'
  | 'Operations Manager'
  | 'Planning'
  | 'Project Manager'
  | 'Site Engineer'
  | 'Warehouse'
  | 'Admin'
  | 'Procurement'
  | 'Management';

export interface AuthContextType {
  user: User | null;
  login: (companyName: string, username: string, password: string) => Promise<void>;
  createCompany: (data: CreateCompanyData) => Promise<void>;
  getCompanies: () => Company[];
  logout: () => void;
  isLoading: boolean;
}

export interface CreateCompanyData {
  companyName: string;
  adminEmail: string;
  adminUsername: string;
  adminPassword: string;
}