import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthContextType, User, Company, CreateCompanyData } from '@/types/auth';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock data for demo - in real app this would come from API
let mockUsers: User[] = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@techcorp.com',
    role: 'ICT',
    companyId: 'comp1',
    companyName: 'TechCorp Solutions',
    createdAt: '2024-01-01'
  },
  {
    id: '2',
    username: 'finance',
    email: 'finance@techcorp.com',
    role: 'Finance',
    companyId: 'comp1',
    companyName: 'TechCorp Solutions',
    createdAt: '2024-01-01'
  },
  {
    id: '3',
    username: 'hr',
    email: 'hr@techcorp.com',
    role: 'HR',
    companyId: 'comp1',
    companyName: 'TechCorp Solutions',
    createdAt: '2024-01-01'
  },
  {
    id: '4',
    username: 'management',
    email: 'management@techcorp.com',
    role: 'Management',
    companyId: 'comp1',
    companyName: 'TechCorp Solutions',
    createdAt: '2024-01-01'
  },
  {
    id: '5',
    username: 'safety',
    email: 'safety@techcorp.com',
    role: 'Health and Safety',
    companyId: 'comp1',
    companyName: 'TechCorp Solutions',
    createdAt: '2024-01-01'
  },
  {
    id: '6',
    username: 'employee',
    email: 'employee@techcorp.com',
    role: 'Employee',
    companyId: 'comp1',
    companyName: 'TechCorp Solutions',
    createdAt: '2024-01-01'
  },
  {
    id: '7',
    username: 'implmanager',
    email: 'implmanager@techcorp.com',
    role: 'Implementation Manager',
    companyId: 'comp1',
    companyName: 'TechCorp Solutions',
    createdAt: '2024-01-01'
  },
  {
    id: '8',
    username: 'logistics',
    email: 'logistics@techcorp.com',
    role: 'Logistics',
    companyId: 'comp1',
    companyName: 'TechCorp Solutions',
    createdAt: '2024-01-01'
  },
  {
    id: '9',
    username: 'operations',
    email: 'operations@techcorp.com',
    role: 'Operations Manager',
    companyId: 'comp1',
    companyName: 'TechCorp Solutions',
    createdAt: '2024-01-01'
  },
  {
    id: '10',
    username: 'planning',
    email: 'planning@techcorp.com',
    role: 'Planning',
    companyId: 'comp1',
    companyName: 'TechCorp Solutions',
    createdAt: '2024-01-01'
  },
  {
    id: '11',
    username: 'projectmgr',
    email: 'projectmgr@techcorp.com',
    role: 'Project Manager',
    companyId: 'comp1',
    companyName: 'TechCorp Solutions',
    createdAt: '2024-01-01'
  },
  {
    id: '12',
    username: 'siteeng',
    email: 'siteeng@techcorp.com',
    role: 'Site Engineer',
    companyId: 'comp1',
    companyName: 'TechCorp Solutions',
    createdAt: '2024-01-01'
  },
  {
    id: '13',
    username: 'warehouse',
    email: 'warehouse@techcorp.com',
    role: 'Warehouse',
    companyId: 'comp1',
    companyName: 'TechCorp Solutions',
    createdAt: '2024-01-01'
  },
  {
    id: '14',
    username: 'procurement',
    email: 'procurement@techcorp.com',
    role: 'Procurement',
    companyId: 'comp1',
    companyName: 'TechCorp Solutions',
    createdAt: '2024-01-01'
  }
];

let mockCompanies: Company[] = [
  {
    id: 'comp1',
    name: 'TechCorp Solutions',
    createdAt: '2024-01-01',
    adminUserId: '1'
  },
  {
    id: 'comp2',
    name: 'Global Logistics Inc',
    createdAt: '2024-01-01',
    adminUserId: '5'
  },
  {
    id: 'comp3',
    name: 'SafetyFirst Industries',
    createdAt: '2024-01-01',
    adminUserId: '6'
  },
  {
    id: 'comp4',
    name: 'Innovation Labs',
    createdAt: '2024-01-01',
    adminUserId: '7'
  }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (companyName: string, username: string, password: string) => {
    setIsLoading(true);
    try {
      // Mock authentication - in real app this would be API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const foundUser = mockUsers.find(
        u => u.companyName === companyName && u.username === username
      );
      
      if (foundUser && password === 'password') {
        setUser(foundUser);
        localStorage.setItem('currentUser', JSON.stringify(foundUser));
      } else {
        throw new Error('Invalid credentials');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const createCompany = async (data: CreateCompanyData) => {
    setIsLoading(true);
    try {
      // Mock company creation - in real app this would be API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Check if company name already exists
      const existingCompany = mockCompanies.find(c => c.name === data.companyName);
      if (existingCompany) {
        throw new Error('Company name already exists');
      }
      
      // Check if admin username already exists
      const existingUser = mockUsers.find(u => u.username === data.adminUsername);
      if (existingUser) {
        throw new Error('Username already exists');
      }
      
      // Generate IDs
      const companyId = `comp${mockCompanies.length + 1}`;
      const userId = `${mockUsers.length + 1}`;
      const now = new Date().toISOString().split('T')[0];
      
      // Create company
      const newCompany: Company = {
        id: companyId,
        name: data.companyName,
        createdAt: now,
        adminUserId: userId
      };
      
      // Create admin user
      const newUser: User = {
        id: userId,
        username: data.adminUsername,
        email: data.adminEmail,
        role: 'ICT',
        companyId: companyId,
        companyName: data.companyName,
        createdAt: now
      };
      
      // Add to mock data
      mockCompanies.push(newCompany);
      mockUsers.push(newUser);
      
      // Auto-login the new admin user
      setUser(newUser);
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      
    } finally {
      setIsLoading(false);
    }
  };

  const getCompanies = () => {
    return mockCompanies;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{ user, login, createCompany, getCompanies, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}