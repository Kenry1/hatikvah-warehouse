import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types for data entities
export interface Vehicle {
  id: string;
  name: string;
  type: 'truck' | 'van' | 'car' | 'motorcycle';
  plateNumber: string;
  status: 'available' | 'assigned' | 'maintenance' | 'out_of_service';
  assignedTo?: string;
  lastService: string;
  nextService: string;
  mileage: number;
  fuelLevel: number;
  documents: Document[];
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'on_leave' | 'inactive';
  leaveRequests: LeaveRequest[];
  avatar?: string;
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: 'vacation' | 'sick' | 'personal' | 'emergency';
  startDate: string;
  endDate: string;
  status: 'pending' | 'approved' | 'rejected';
  reason: string;
  approvedBy?: string;
}

export interface FinanceRequest {
  id: string;
  requesterId: string;
  type: 'expense' | 'purchase' | 'travel' | 'equipment';
  amount: number;
  currency: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  attachments: Document[];
  approvedBy?: string;
  dateRequested: string;
}

export interface ITTicket {
  id: string;
  reporterId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  category: 'hardware' | 'software' | 'network' | 'access' | 'other';
  assignedTo?: string;
  dateCreated: string;
  dateResolved?: string;
}

export interface SafetyReport {
  id: string;
  reporterId: string;
  type: 'incident' | 'near_miss' | 'inspection' | 'violation';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: string;
  description: string;
  status: 'open' | 'investigating' | 'resolved';
  attachments: Document[];
  dateReported: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
  startDate: string;
  endDate: string;
  progress: number;
  assignedEmployees: string[];
  budget: number;
  spent: number;
}

export interface Material {
  id: string;
  name: string;
  category: 'safety' | 'solar_equipment' | 'company_assets';
  quantity: number;
  unit: string;
  reorderPoint: number;
  supplier?: string;
  cost: number;
  location: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  materials: string[];
  rating: number;
}

export interface Document {
  id: string;
  name: string;
  type: string;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
}

interface DataContextType {
  // Data states
  vehicles: Vehicle[];
  employees: Employee[];
  leaveRequests: LeaveRequest[];
  financeRequests: FinanceRequest[];
  itTickets: ITTicket[];
  safetyReports: SafetyReport[];
  projects: Project[];
  materials: Material[];
  suppliers: Supplier[];
  
  // CRUD operations
  addVehicle: (vehicle: Omit<Vehicle, 'id'>) => void;
  updateVehicle: (id: string, updates: Partial<Vehicle>) => void;
  deleteVehicle: (id: string) => void;
  
  addEmployee: (employee: Omit<Employee, 'id'>) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  
  addLeaveRequest: (request: Omit<LeaveRequest, 'id'>) => void;
  updateLeaveRequest: (id: string, updates: Partial<LeaveRequest>) => void;
  
  addFinanceRequest: (request: Omit<FinanceRequest, 'id'>) => void;
  updateFinanceRequest: (id: string, updates: Partial<FinanceRequest>) => void;
  
  addITTicket: (ticket: Omit<ITTicket, 'id'>) => void;
  updateITTicket: (id: string, updates: Partial<ITTicket>) => void;
  
  addSafetyReport: (report: Omit<SafetyReport, 'id'>) => void;
  updateSafetyReport: (id: string, updates: Partial<SafetyReport>) => void;
  
  addProject: (project: Omit<Project, 'id'>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  
  addMaterial: (material: Omit<Material, 'id'>) => void;
  updateMaterial: (id: string, updates: Partial<Material>) => void;
  
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  
  // Utility functions
  refreshData: () => void;
  isLoading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// Mock data generator
const generateMockData = () => ({
  vehicles: [
    {
      id: '1',
      name: 'Delivery Truck 01',
      type: 'truck' as const,
      plateNumber: 'ABC-123',
      status: 'available' as const,
      lastService: '2024-06-15',
      nextService: '2024-09-15',
      mileage: 45000,
      fuelLevel: 85,
      documents: []
    },
    {
      id: '2',
      name: 'Service Van 02',
      type: 'van' as const,
      plateNumber: 'XYZ-456',
      status: 'assigned' as const,
      assignedTo: 'John Doe',
      lastService: '2024-07-01',
      nextService: '2024-10-01',
      mileage: 32000,
      fuelLevel: 60,
      documents: []
    }
  ],
  employees: [
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@company.com',
      role: 'Site Engineer',
      department: 'Operations',
      status: 'active' as const,
      leaveRequests: []
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      role: 'HR Manager',
      department: 'HR',
      status: 'active' as const,
      leaveRequests: []
    }
  ],
  leaveRequests: [
    {
      id: '1',
      employeeId: '1',
      type: 'vacation' as const,
      startDate: '2024-08-01',
      endDate: '2024-08-07',
      status: 'pending' as const,
      reason: 'Family vacation'
    }
  ],
  financeRequests: [
    {
      id: '1',
      requesterId: '1',
      type: 'expense' as const,
      amount: 500,
      currency: 'USD',
      description: 'Travel expenses for site visit',
      status: 'pending' as const,
      attachments: [],
      dateRequested: '2024-07-20'
    }
  ],
  itTickets: [
    {
      id: '1',
      reporterId: '2',
      title: 'Laptop not connecting to Wi-Fi',
      description: 'Unable to connect to office Wi-Fi network',
      priority: 'medium' as const,
      status: 'open' as const,
      category: 'network' as const,
      dateCreated: '2024-07-19'
    }
  ],
  safetyReports: [
    {
      id: '1',
      reporterId: '1',
      type: 'incident' as const,
      severity: 'low' as const,
      location: 'Construction Site A',
      description: 'Minor equipment malfunction',
      status: 'investigating' as const,
      attachments: [],
      dateReported: '2024-07-18'
    }
  ],
  projects: [
    {
      id: '1',
      name: 'Fiber Network Installation',
      description: 'FTTH installation in downtown area',
      status: 'active' as const,
      startDate: '2024-06-01',
      endDate: '2024-12-31',
      progress: 35,
      assignedEmployees: ['1'],
      budget: 100000,
      spent: 35000
    }
  ],
  materials: [
    {
      id: '1',
      name: 'Fiber Optic Cable',
      category: 'ftth' as const,
      quantity: 500,
      unit: 'meters',
      reorderPoint: 100,
      cost: 2.5,
      location: 'Warehouse A'
    }
  ],
  suppliers: [
    {
      id: '1',
      name: 'TechSupply Co.',
      contactPerson: 'Mike Johnson',
      email: 'mike@techsupply.com',
      phone: '+1-555-0123',
      address: '123 Tech Street, Tech City',
      materials: ['1'],
      rating: 4.5
    }
  ]
});

export function DataProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [financeRequests, setFinanceRequests] = useState<FinanceRequest[]>([]);
  const [itTickets, setITTickets] = useState<ITTicket[]>([]);
  const [safetyReports, setSafetyReports] = useState<SafetyReport[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('appData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setVehicles(parsed.vehicles || []);
      setEmployees(parsed.employees || []);
      setLeaveRequests(parsed.leaveRequests || []);
      setFinanceRequests(parsed.financeRequests || []);
      setITTickets(parsed.itTickets || []);
      setSafetyReports(parsed.safetyReports || []);
      setProjects(parsed.projects || []);
      setMaterials(parsed.materials || []);
      setSuppliers(parsed.suppliers || []);
    } else {
      // Initialize with mock data
      const mockData = generateMockData();
      setVehicles(mockData.vehicles);
      setEmployees(mockData.employees);
      setLeaveRequests(mockData.leaveRequests);
      setFinanceRequests(mockData.financeRequests);
      setITTickets(mockData.itTickets);
      setSafetyReports(mockData.safetyReports);
      setProjects(mockData.projects);
      setMaterials(mockData.materials);
      setSuppliers(mockData.suppliers);
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    const data = {
      vehicles,
      employees,
      leaveRequests,
      financeRequests,
      itTickets,
      safetyReports,
      projects,
      materials,
      suppliers
    };
    localStorage.setItem('appData', JSON.stringify(data));
  }, [vehicles, employees, leaveRequests, financeRequests, itTickets, safetyReports, projects, materials, suppliers]);

  // Vehicle operations
  const addVehicle = (vehicle: Omit<Vehicle, 'id'>) => {
    const newVehicle = { ...vehicle, id: generateId() };
    setVehicles(prev => [...prev, newVehicle]);
  };

  const updateVehicle = (id: string, updates: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...updates } : v));
  };

  const deleteVehicle = (id: string) => {
    setVehicles(prev => prev.filter(v => v.id !== id));
  };

  // Employee operations
  const addEmployee = (employee: Omit<Employee, 'id'>) => {
    const newEmployee = { ...employee, id: generateId() };
    setEmployees(prev => [...prev, newEmployee]);
  };

  const updateEmployee = (id: string, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const deleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

  // Leave request operations
  const addLeaveRequest = (request: Omit<LeaveRequest, 'id'>) => {
    const newRequest = { ...request, id: generateId() };
    setLeaveRequests(prev => [...prev, newRequest]);
  };

  const updateLeaveRequest = (id: string, updates: Partial<LeaveRequest>) => {
    setLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  // Finance request operations
  const addFinanceRequest = (request: Omit<FinanceRequest, 'id'>) => {
    const newRequest = { ...request, id: generateId() };
    setFinanceRequests(prev => [...prev, newRequest]);
  };

  const updateFinanceRequest = (id: string, updates: Partial<FinanceRequest>) => {
    setFinanceRequests(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  // IT ticket operations
  const addITTicket = (ticket: Omit<ITTicket, 'id'>) => {
    const newTicket = { ...ticket, id: generateId() };
    setITTickets(prev => [...prev, newTicket]);
  };

  const updateITTicket = (id: string, updates: Partial<ITTicket>) => {
    setITTickets(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  };

  // Safety report operations
  const addSafetyReport = (report: Omit<SafetyReport, 'id'>) => {
    const newReport = { ...report, id: generateId() };
    setSafetyReports(prev => [...prev, newReport]);
  };

  const updateSafetyReport = (id: string, updates: Partial<SafetyReport>) => {
    setSafetyReports(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  // Project operations
  const addProject = (project: Omit<Project, 'id'>) => {
    const newProject = { ...project, id: generateId() };
    setProjects(prev => [...prev, newProject]);
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  // Material operations
  const addMaterial = (material: Omit<Material, 'id'>) => {
    const newMaterial = { ...material, id: generateId() };
    setMaterials(prev => [...prev, newMaterial]);
  };

  const updateMaterial = (id: string, updates: Partial<Material>) => {
    setMaterials(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  // Supplier operations
  const addSupplier = (supplier: Omit<Supplier, 'id'>) => {
    const newSupplier = { ...supplier, id: generateId() };
    setSuppliers(prev => [...prev, newSupplier]);
  };

  const updateSupplier = (id: string, updates: Partial<Supplier>) => {
    setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const refreshData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <DataContext.Provider value={{
      vehicles,
      employees,
      leaveRequests,
      financeRequests,
      itTickets,
      safetyReports,
      projects,
      materials,
      suppliers,
      addVehicle,
      updateVehicle,
      deleteVehicle,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      addLeaveRequest,
      updateLeaveRequest,
      addFinanceRequest,
      updateFinanceRequest,
      addITTicket,
      updateITTicket,
      addSafetyReport,
      updateSafetyReport,
      addProject,
      updateProject,
      addMaterial,
      updateMaterial,
      addSupplier,
      updateSupplier,
      refreshData,
      isLoading
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}