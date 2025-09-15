import type { MaterialRequest } from "../types/inventory";

export interface InventoryItem {
  itemName: string;
  itemCode: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
  category: string;
  unitPrice: number;
}

export interface IssueRequest {
  id: string;
  requesterName: string;
  department: string;
  itemName: string;
  stockCode: string;
  requestedQuantity: number;
  unit: string;
  purpose: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvalDate?: string;
}

export interface Transaction {
    type: 'Issued' | 'Received';
    itemName: string;
    itemCode: string;
    quantity: number;
    user: string;
    timestamp: string;
    ref: string;
}

export const mockInventoryData: InventoryItem[] = [
  { itemName: 'Hard Hats', itemCode: 'HH001', quantity: 78, unit: 'pcs', reorderLevel: 50, category: 'Safety Equipment', unitPrice: 20 },
  { itemName: 'Safety Vests', itemCode: 'SV001', quantity: 105, unit: 'pcs', reorderLevel: 80, category: 'Safety Equipment', unitPrice: 25 },
  { itemName: 'Work Gloves', itemCode: 'WG001', quantity: 45, unit: 'pairs', reorderLevel: 60, category: 'Safety Equipment', unitPrice: 15 },
  { itemName: 'Distribution Boxes', itemCode: 'DB001', quantity: 42, unit: 'pcs', reorderLevel: 30, category: 'Solar Equipment', unitPrice: 2000 },
  { itemName: 'Patch Panels', itemCode: 'PP001', quantity: 67, unit: 'pcs', reorderLevel: 50, category: 'Solar Equipment', unitPrice: 1990 },
  { itemName: 'Network Connectors', itemCode: 'NC001', quantity: 125, unit: 'pcs', reorderLevel: 100, category: 'Solar Equipment', unitPrice: 200 },
  { itemName: 'Testing Equipment', itemCode: 'TE001', quantity: 12, unit: 'pcs', reorderLevel: 15, category: 'Company Assets', unitPrice: 20000 },
  { itemName: 'Laptops', itemCode: 'LP001', quantity: 28, unit: 'pcs', reorderLevel: 25, category: 'Company Assets', unitPrice: 15000 },
  { itemName: 'Power Tools', itemCode: 'PT001', quantity: 49, unit: 'pcs', reorderLevel: 40, category: 'Company Assets', unitPrice: 5000 },
];

export const mockRequests: IssueRequest[] = [
  { id: 'REQ004', requesterName: 'Jane Doe', department: 'Site Delta', itemName: 'Patch Panels', stockCode: 'PP001', requestedQuantity: 5, unit: 'pcs', purpose: 'New client setup', requestDate: '2024-12-16T09:00:00Z', status: 'pending' },
  { id: 'REQ005', requesterName: 'Alex Lee', department: 'Site Epsilon', itemName: 'Work Gloves', stockCode: 'WG001', requestedQuantity: 20, unit: 'pairs', purpose: 'Safety stock replenishment', requestDate: '2024-12-16T11:20:00Z', status: 'pending' },
  { id: 'REQ001', requesterName: 'John Smith', department: 'Site Alpha', itemName: 'Hard Hats', stockCode: 'HH001', requestedQuantity: 10, unit: 'pcs', purpose: 'Team expansion', requestDate: '2024-12-15T14:00:00Z', status: 'approved', approvedBy: 'Admin', approvalDate: '2024-12-15T16:00:00Z' },
];

export const mockTransactions: Transaction[] = [
    { type: 'Issued', itemName: 'Patch Panels', itemCode: 'PP001', quantity: 5, user: 'Jane Doe', timestamp: '2024-12-16 10:30', ref: 'REQ004' },
    { type: 'Received', itemName: 'Work Gloves', itemCode: 'WG001', quantity: 50, user: 'Alex Lee', timestamp: '2024-12-16 09:00', ref: 'INV-2024-12-16' },
];

// Mock sites
export const sites = [
  {
    id: 'site-1',
    name: 'Site Alpha',
    location: 'Nairobi',
    contactPerson: 'John Smith',
    phone: '0712345678',
    active: true
  },
  {
    id: 'site-2',
    name: 'Site Beta',
    location: 'Mombasa',
    contactPerson: 'Jane Doe',
    phone: '0723456789',
    active: true
  },
  {
    id: 'site-3',
    name: 'Site Gamma',
    location: 'Kisumu',
    contactPerson: 'Alex Lee',
    phone: '0734567890',
    active: false
  }
];

// Mock materials
export const materials = [
  {
    id: 'mat-1',
    name: 'Cement',
    category: 'Building',
    unit: 'bags',
    unitPrice: 650,
    minStockLevel: 50
  },
  {
    id: 'mat-2',
    name: 'Steel Rods',
    category: 'Building',
    unit: 'pieces',
    unitPrice: 1200,
    minStockLevel: 30
  },
  {
    id: 'mat-3',
    name: 'Bricks',
    category: 'Building',
    unit: 'pieces',
    unitPrice: 15,
    minStockLevel: 500
  }
];

// Mock warehouse stock
export const warehouseStock = [
  {
    materialId: 'mat-1',
    materialName: 'Cement',
    category: 'Building',
    unit: 'bags',
    availableQuantity: 120,
    minStockLevel: 50,
    unitPrice: 650,
    totalValue: 78000,
    lastUpdated: new Date(),
    totalRequests: 30,
    fulfilledRequests: 25,
    pendingRequests: 3,
    partialRequests: 2,
    totalStockValue: 78000,
    priorityBreakdown: { urgent: 5, high: 10, medium: 10, low: 5 },
    totalRequestsValue: 19500,
    siteId: 'site-1'
  },
  {
    materialId: 'mat-2',
    materialName: 'Steel Rods',
    category: 'Building',
    unit: 'pieces',
    availableQuantity: 40,
    minStockLevel: 30,
    unitPrice: 1200,
    totalValue: 48000,
    lastUpdated: new Date(),
    totalRequests: 20,
    fulfilledRequests: 15,
    pendingRequests: 3,
    partialRequests: 2,
    totalStockValue: 48000,
    priorityBreakdown: { urgent: 2, high: 8, medium: 6, low: 4 },
    totalRequestsValue: 24000,
    siteId: 'site-2'
  },
  {
    materialId: 'mat-3',
    materialName: 'Bricks',
    category: 'Building',
    unit: 'pieces',
    availableQuantity: 1000,
    minStockLevel: 500,
    unitPrice: 15,
    totalValue: 15000,
    lastUpdated: new Date(),
    totalRequests: 50,
    fulfilledRequests: 40,
    pendingRequests: 5,
    partialRequests: 5,
    totalStockValue: 15000,
    priorityBreakdown: { urgent: 10, high: 15, medium: 15, low: 10 },
    totalRequestsValue: 7500,
    siteId: 'site-3'
  }
];

// Mock material requests
export const materialRequests: MaterialRequest[] = [
  {
    id: 'req-1',
    siteId: 'site-1',
    siteName: 'Site Alpha',
    requestDate: new Date('2025-08-01'),
    requestedBy: 'John Smith',
    priority: 'high',
    status: 'fulfilled',
    items: [
      {
        materialId: 'mat-1',
        materialName: 'Cement',
        category: 'Building',
        unit: 'bags',
        requestedQuantity: 40,
        availableQuantity: 120,
        unitPrice: 650,
        totalCost: 26000,
        status: 'fulfilled'
      }
    ],
    totalCost: 26000,
    notes: 'Urgent for foundation work',
    approvedBy: 'Manager A',
    approvedDate: new Date('2025-08-02'),
    fulfilledDate: new Date('2025-08-03')
  },
  {
    id: 'req-2',
    siteId: 'site-2',
    siteName: 'Site Beta',
    requestDate: new Date('2025-08-03'),
    requestedBy: 'Jane Doe',
    priority: 'urgent',
    status: 'pending',
    items: [
      {
        materialId: 'mat-2',
        materialName: 'Steel Rods',
        category: 'Building',
        unit: 'pieces',
        requestedQuantity: 15,
        availableQuantity: 40,
        unitPrice: 1200,
        totalCost: 18000,
        status: 'pending'
      }
    ],
    totalCost: 18000,
    notes: 'Required for roof support',
    approvedBy: 'Manager B'
  },
  {
    id: 'req-3',
    siteId: 'site-3',
    siteName: 'Site Gamma',
    requestDate: new Date('2025-08-05'),
    requestedBy: 'Alex Lee',
    priority: 'medium',
    status: 'partial',
    items: [
      {
        materialId: 'mat-3',
        materialName: 'Bricks',
        category: 'Building',
        unit: 'pieces',
        requestedQuantity: 500,
        availableQuantity: 1000,
        unitPrice: 15,
        totalCost: 7500,
        status: 'partial'
      }
    ],
    totalCost: 7500,
    notes: 'For wall construction',
    approvedBy: 'Manager C',
    approvedDate: new Date('2025-08-06')
  }
];

