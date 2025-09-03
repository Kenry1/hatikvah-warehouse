// Material Request type and fetch function
export interface MaterialRequest {
  id?: string;
  requesterId: string;
  companyId: string;
  materialType: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected' | 'assigned';
  requestedDate?: any;
  assignedTo?: string;
  comments?: string;
  price?: number;
  urgency?: 'high' | 'medium' | 'low';
}

export const getMaterialRequestList = async (companyId: string): Promise<MaterialRequest[]> => {
  try {
    const q = query(collection(db, 'material_requests'));
    const querySnapshot = await getDocs(q);
    const requests: MaterialRequest[] = [];
    querySnapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() } as MaterialRequest);
    });
    return requests;
  } catch (error) {
    console.error('Error fetching material requests: ', error);
    throw new Error('Failed to fetch material requests.');
  }
};
import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, serverTimestamp, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Toast } from '@/components/ui/toast';
import { User } from '@/types/auth'; // Assuming User interface is defined in auth.ts

export interface LeaveRequest {
  id?: string;
  employeeId: string;
  employeeName: string;
  department: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  companyId: string;
  appliedDate?: any; 
}

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

// Function to add a new leave request
export const addLeaveRequest = async (requestData: Omit<LeaveRequest, 'id' | 'appliedDate'>) => {
  try {
    const docRef = await addDoc(collection(db, 'leaveRequests'), {
      ...requestData,
      appliedDate: serverTimestamp()
    });
    console.log('Leave request submitted with ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error submitting leave request: ', error);
    throw new Error('Failed to submit leave request.');
  }
};

// Function to get a list of leave requests for a specific user
export const getLeaveRequestList = async (employeeId: string, companyId: string): Promise<LeaveRequest[]> => {
  try {
    const q = query(
      collection(db, 'leaveRequests'),
      where('employeeId', '==', employeeId),
      where('companyId', '==', companyId)
    );
    const querySnapshot = await getDocs(q);
    const requests: LeaveRequest[] = [];
    querySnapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() } as LeaveRequest);
    });
    return requests;
  } catch (error) {
    console.error('Error fetching leave requests: ', error);
    throw new Error('Failed to fetch leave requests.');
  }
};

// Function to delete a leave request
export const deleteLeaveRequest = async (requestId: string) => {
  try {
    await deleteDoc(doc(db, 'leaveRequests', requestId));
    console.log('Leave request deleted with ID: ', requestId);
  } catch (error) {
    console.error('Error deleting leave request: ', error);
    throw new Error('Failed to delete leave request.');
  }
};

// Function to get a list of users for a specific company
export const getUserList = async (companyId: string): Promise<User[]> => {
  try {
    const q = query(
      collection(db, 'users'),
      where('companyId', '==', companyId)
    );
    const querySnapshot = await getDocs(q);
    const users: User[] = [];
    querySnapshot.forEach((doc) => {
      users.push({ id: doc.id, ...doc.data() } as User);
    });
    return users;
  } catch (error) {
    console.error('Error fetching users: ', error);
    throw new Error('Failed to fetch users.');
  }
};

// Function to update a user's data
export const updateUser = async (userId: string, data: Partial<User>) => {
  try {
    await updateDoc(doc(db, 'users', userId), data);
    console.log('User updated with ID: ', userId);
  } catch (error) {
    console.error('Error updating user: ', error);
    throw new Error('Failed to update user.');
  }
};

// Function to delete a user's Firestore document
// Note: This only deletes the Firestore document. To delete the Firebase Authentication user, 
// a Firebase Cloud Function using the Admin SDK is typically required for security.
export const deleteUser = async (userId: string) => {
  try {
    await deleteDoc(doc(db, 'users', userId));
    console.log('User document deleted with ID: ', userId);
  } catch (error) {
    console.error('Error deleting user document: ', error);
    throw new Error('Failed to delete user.');
  }
};

// Function to add a new asset request
export const addAssetRequest = async (requestData: Omit<AssetRequest, 'id' | 'requestedDate'>) => {
  try {
    const docRef = await addDoc(collection(db, 'assetRequests'), {
      ...requestData,
      requestedDate: serverTimestamp()
    });
    console.log('Asset request submitted with ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error submitting asset request: ', error);
    throw new Error('Failed to submit asset request.');
  }
};

// Function to add a new IT Asset
export const addITAsset = async (assetData: Omit<ITAsset, 'id' | 'createdAt' | 'updatedAt'>) => {
  try {
    const docRef = await addDoc(collection(db, 'itAssets'), {
      ...assetData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('IT Asset added with ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error adding IT Asset: ', error);
    throw new Error('Failed to add IT Asset.');
  }
};

// Function to get a list of IT Assets for a specific company
export const getITAssetList = async (companyId: string): Promise<ITAsset[]> => {
  try {
    const q = query(
      collection(db, 'itAssets'),
      where('companyId', '==', companyId)
    );
    const querySnapshot = await getDocs(q);
    const assets: ITAsset[] = [];
    querySnapshot.forEach((doc) => {
      assets.push({ id: doc.id, ...doc.data() } as ITAsset);
    });
    return assets;
  } catch (error) {
    console.error('Error fetching IT Assets: ', error);
    throw new Error('Failed to fetch IT Assets.');
  }
};

// Function to get a list of asset requests for a specific company
export const getAssetRequestList = async (companyId: string): Promise<AssetRequest[]> => {
  try {
    const q = query(
      collection(db, 'assetRequests'),
      where('companyId', '==', companyId)
    );
    const querySnapshot = await getDocs(q);
    const requests: AssetRequest[] = [];
    querySnapshot.forEach((doc) => {
      requests.push({ id: doc.id, ...doc.data() } as AssetRequest);
    });
    return requests;
  } catch (error) {
    console.error('Error fetching asset requests: ', error);
    throw new Error('Failed to fetch asset requests.');
  }
};
