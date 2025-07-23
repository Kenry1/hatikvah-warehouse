import { createContext, useContext, useState, ReactNode } from 'react';

export interface Material {
  id: string;
  name: string;
  category: 'safety' | 'ftth' | 'fttx' | 'company-assets';
  stock: number;
  minLevel: number;
  value: string;
  serialNumber?: string;
  assignedTo?: string;
  status?: 'active' | 'maintenance' | 'retired';
}

export interface MaterialRequest {
  id: string;
  requester: string;
  items: string;
  approvedDate: string;
  status: 'ready' | 'picked-up' | 'pending';
  category: string;
}

interface WarehouseContextType {
  materials: Material[];
  requests: MaterialRequest[];
  activeSection: string;
  setActiveSection: (section: string) => void;
  addMaterial: (material: Omit<Material, 'id'>) => void;
  updateMaterial: (id: string, updates: Partial<Material>) => void;
  deleteMaterial: (id: string) => void;
  updateRequestStatus: (id: string, status: MaterialRequest['status']) => void;
}

const WarehouseContext = createContext<WarehouseContextType | undefined>(undefined);

export function useWarehouse() {
  const context = useContext(WarehouseContext);
  if (!context) {
    throw new Error('useWarehouse must be used within a WarehouseProvider');
  }
  return context;
}

const initialMaterials: Material[] = [
  { id: '1', name: 'Hard Hats', category: 'safety', stock: 78, minLevel: 50, value: '$1,560' },
  { id: '2', name: 'Safety Vests', category: 'safety', stock: 105, minLevel: 80, value: '$2,625' },
  { id: '3', name: 'Work Gloves', category: 'safety', stock: 45, minLevel: 60, value: '$675' },
  { id: '4', name: 'Fiber Optic Cables (1000m)', category: 'ftth', stock: 25, minLevel: 30, value: '$45,000' },
  { id: '5', name: 'ONT Devices', category: 'ftth', stock: 85, minLevel: 100, value: '$127,500' },
  { id: '6', name: 'Optical Splitters', category: 'ftth', stock: 46, minLevel: 40, value: '$92,000' },
  { id: '7', name: 'Distribution Boxes', category: 'fttx', stock: 42, minLevel: 30, value: '$84,000' },
  { id: '8', name: 'Patch Panels', category: 'fttx', stock: 67, minLevel: 50, value: '$133,400' },
  { id: '9', name: 'Network Connectors', category: 'fttx', stock: 125, minLevel: 100, value: '$25,000' },
  { id: '10', name: 'Testing Equipment', category: 'company-assets', stock: 12, minLevel: 15, value: '$240,000', serialNumber: 'TE001-012', status: 'active' },
  { id: '11', name: 'Laptops', category: 'company-assets', stock: 28, minLevel: 25, value: '$420,000', serialNumber: 'LT001-028', status: 'active' },
  { id: '12', name: 'Power Tools', category: 'company-assets', stock: 49, minLevel: 40, value: '$245,000', serialNumber: 'PT001-049', status: 'active' },
];

const initialRequests: MaterialRequest[] = [
  { id: 'REQ001', requester: 'John Smith - Site Alpha', items: 'Fiber Cables (500m), ONT (5pcs)', approvedDate: '2024-12-15', status: 'ready', category: 'FTTH Equipment' },
  { id: 'REQ002', requester: 'Sarah Johnson - Site Beta', items: 'Safety Vests (10pcs), Hard Hats (8pcs)', approvedDate: '2024-12-14', status: 'picked-up', category: 'Safety Equipment' },
  { id: 'REQ003', requester: 'Mike Wilson - Site Gamma', items: 'Distribution Boxes (3pcs)', approvedDate: '2024-12-13', status: 'ready', category: 'FTTX Components' },
];

export function WarehouseProvider({ children }: { children: ReactNode }) {
  const [materials, setMaterials] = useState<Material[]>(initialMaterials);
  const [requests, setRequests] = useState<MaterialRequest[]>(initialRequests);
  const [activeSection, setActiveSection] = useState('dashboard');

  const addMaterial = (material: Omit<Material, 'id'>) => {
    const newMaterial = {
      ...material,
      id: Date.now().toString(),
    };
    setMaterials(prev => [...prev, newMaterial]);
  };

  const updateMaterial = (id: string, updates: Partial<Material>) => {
    setMaterials(prev => prev.map(material => 
      material.id === id ? { ...material, ...updates } : material
    ));
  };

  const deleteMaterial = (id: string) => {
    setMaterials(prev => prev.filter(material => material.id !== id));
  };

  const updateRequestStatus = (id: string, status: MaterialRequest['status']) => {
    setRequests(prev => prev.map(request => 
      request.id === id ? { ...request, status } : request
    ));
  };

  return (
    <WarehouseContext.Provider value={{
      materials,
      requests,
      activeSection,
      setActiveSection,
      addMaterial,
      updateMaterial,
      deleteMaterial,
      updateRequestStatus,
    }}>
      {children}
    </WarehouseContext.Provider>
  );
}