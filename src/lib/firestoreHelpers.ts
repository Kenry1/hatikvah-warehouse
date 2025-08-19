import { db } from './firebase';
import { collection, addDoc, getDocs, query, where, serverTimestamp, doc, deleteDoc } from 'firebase/firestore';
import { Toast } from '@/components/ui/toast';

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