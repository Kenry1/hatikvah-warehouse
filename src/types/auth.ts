export interface User {
  status: string;
  lastLogin: any;
  id: string;
  username: string;
  email: string;
  role: UserRole;
  companyId: string;
  companyName: string;
  createdAt: string;
  phoneNumber?: string; // Added phone number
  department?: string; // Added department field
}

export interface Company {
  id: string;
  name: string;
  createdAt: string;
  adminUserId: string;
  trialEndDate?: string; // Add trialEndDate for free trial
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

import { Auth } from "firebase/auth"; // Import Auth type

export interface AuthContextType {
  user: User | null;
  login: (companyName: string, username: string, password: string) => Promise<void>;
  createCompany: (data: CreateCompanyData) => Promise<void>;
  getCompanies: () => Company[];
  logout: () => void;
  isLoading: boolean;
  auth: Auth; // Add auth property
}

export interface CreateCompanyData {
  companyName: string;
  adminEmail: string;
  adminUsername: string;
  adminPassword: string;
}