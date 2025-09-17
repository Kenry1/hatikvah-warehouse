import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp, doc, setDoc } from 'firebase/firestore';

export interface AssistantSession {
  id?: string;
  userId: string;
  status: 'active' | 'closed';
  createdAt?: any;
  updatedAt?: any;
  lastAction?: string;
}

export interface AssistantMessageRecord {
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt?: any;
  actionType?: string;
}

export async function startAssistantSession(userId: string): Promise<string> {
  const ref = await addDoc(collection(db, 'assistant_sessions'), { userId, status: 'active', createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  return ref.id;
}

export async function saveAssistantMessage(sessionId: string, message: AssistantMessageRecord) {
  await addDoc(collection(db, 'assistant_sessions', sessionId, 'messages'), { ...message, createdAt: serverTimestamp() });
}

export async function updateAssistantSession(sessionId: string, data: Partial<AssistantSession>) {
  const ref = doc(db, 'assistant_sessions', sessionId);
  await setDoc(ref, { ...data, updatedAt: serverTimestamp() }, { merge: true });
}
