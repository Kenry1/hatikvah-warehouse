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
  { itemName: 'Fiber Optic Cables (1000m)', itemCode: 'FOC001', quantity: 25, unit: 'rolls', reorderLevel: 30, category: 'FTTH Equipment', unitPrice: 1800 },
  { itemName: 'ONT Devices', itemCode: 'ONT001', quantity: 85, unit: 'pcs', reorderLevel: 100, category: 'FTTH Equipment', unitPrice: 1500 },
  { itemName: 'Optical Splitters', itemCode: 'OS001', quantity: 46, unit: 'pcs', reorderLevel: 40, category: 'FTTH Equipment', unitPrice: 2000 },
  { itemName: 'Distribution Boxes', itemCode: 'DB001', quantity: 42, unit: 'pcs', reorderLevel: 30, category: 'FTTX Components', unitPrice: 2000 },
  { itemName: 'Patch Panels', itemCode: 'PP001', quantity: 67, unit: 'pcs', reorderLevel: 50, category: 'FTTX Components', unitPrice: 1990 },
  { itemName: 'Network Connectors', itemCode: 'NC001', quantity: 125, unit: 'pcs', reorderLevel: 100, category: 'FTTX Components', unitPrice: 200 },
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

