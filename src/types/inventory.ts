export interface AssetRequest {
  id?: string;
  requesterId: string;
  companyId: string;
  assetType: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'assigned';
  requestedDate?: any;
  assignedTo?: string;
  comments?: string;
}

export interface ITAsset {
  id?: string;
  name: string;
  type: string;
  serialNumber: string;
  status: string;
  location: string;
  assignedTo?: string;
  purchaseDate: string;
  warrantyEndDate?: string;
  companyId: string;
  createdAt?: any;
  updatedAt?: any;
}
export interface Site {
  id: string;
  name: string;
  location: string;
  contactPerson: string;
  phone: string;
  active: boolean;
}

export interface Material {
  id: string;
  name: string;
  category: string;
  unit: string;
  unitPrice: number;
  minStockLevel: number;
}

export interface Stock {
  materialId: string;
  materialName: string;
  category: string;
  unit: string;
  availableQuantity: number;
  minStockLevel: number;
  unitPrice: number;
  totalValue: number;
  lastUpdated: Date;
}

export interface MaterialRequestItem {
  materialId: string;
  materialName: string;
  category: string;
  unit: string;
  requestedQuantity: number;
  availableQuantity: number;
  unitPrice: number;
  totalCost: number;
  status: 'pending' | 'fulfilled' | 'partial';
}

export interface MaterialRequest {
  id: string;
  siteId: string;
  siteName: string;
  requestDate: Date;
  requestedBy: string;
  requestedByUsername?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'submitted' | 'approved' | 'issued' | 'pending' | 'fulfilled' | 'partial' | 'cancelled' | 'other';
  items: MaterialRequestItem[];
  totalCost: number;
  notes?: string;
  approvedBy?: string;
  approvedDate?: Date;
  fulfilledDate?: Date;
  requestorRole?: string;
  approver?: string;
  approverRole?: string;
  issuedBy?: string;
}

export type FulfillmentStatus = 'pending' | 'fulfilled' | 'partial';
export type RequestPriority = 'low' | 'medium' | 'high' | 'urgent';
export type RequestStatus = 'pending' | 'fulfilled' | 'partial' | 'cancelled';
