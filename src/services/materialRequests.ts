import { db } from '@/lib/firebase';
import { collection, addDoc, runTransaction, doc, getDocs } from 'firebase/firestore';

export interface DraftRequestItem {
  materialId?: string; // resolved ID
  materialName?: string; // user provided name (to resolve)
  category?: string;
  quantity: number;
}

export interface DraftMaterialRequest {
  siteName: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  notes?: string;
  items: DraftRequestItem[];
}

interface SubmitContext {
  userId: string;
  username?: string;
  role?: string;
}

export interface SubmitResult {
  requestId: string;
  decremented: Array<{ materialId: string; newQty: number; oldQty: number }>;
}

// Fetch helper: list of materials with minimal fields
export async function fetchWarehouseMaterials() {
  const snap = await getDocs(collection(db, 'solar_warehouse'));
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
}

export async function fetchMaterialRequestSites() {
  const snap = await getDocs(collection(db, 'material_requests'));
  const names = new Set<string>();
  snap.docs.forEach(d => { const data: any = d.data(); if (data.siteName) names.add(String(data.siteName)); });
  return Array.from(names);
}

export function validateDraft(draft: DraftMaterialRequest) {
  const errors: string[] = [];
  if (!draft.siteName?.trim()) errors.push('Site name is required');
  if (!draft.priority) errors.push('Priority is required');
  if (!draft.items.length) errors.push('At least one item is required');
  draft.items.forEach((it, idx) => {
    if (!it.materialId && !it.materialName) errors.push(`Item #${idx+1}: material not specified`);
    if (!it.quantity || it.quantity < 1) errors.push(`Item #${idx+1}: quantity must be >= 1`);
  });
  return errors;
}

export async function submitMaterialRequest(draft: DraftMaterialRequest, ctx: SubmitContext) : Promise<SubmitResult> {
  const errors = validateDraft(draft);
  if (errors.length) throw new Error(errors.join('; '));

  // Resolve any items missing materialId (should be resolved before calling ideally)
  if (draft.items.some(i => !i.materialId)) {
    throw new Error('Unresolved material references remain.');
  }

  const payload: any = {
    siteName: draft.siteName,
    siteId: `site-${Date.now()}`,
    priority: draft.priority,
    notes: draft.notes || '',
    items: draft.items.map(i => ({
      category: i.category || '',
      materialId: i.materialId,
      quantity: i.quantity,
    })),
    createdAt: new Date().toISOString(),
    requestDate: new Date().toISOString(),
    requestedBy: ctx.userId,
    requestedByUsername: ctx.username || '',
    requestorRole: ctx.role || '',
    status: 'pending',
  };

  const decremented: SubmitResult['decremented'] = [];

  await runTransaction(db, async (transaction) => {
    // Check stock first
    for (const item of draft.items) {
      const ref = doc(db, 'solar_warehouse', item.materialId!);
      const snap = await transaction.get(ref);
      if (!snap.exists()) throw new Error(`Material ${item.materialId} not found`);
      const data: any = snap.data();
      const available = data.availableQuantity ?? data.quantity ?? 0;
      if (item.quantity > available) {
        throw new Error(`Insufficient stock for ${item.materialId}. Requested ${item.quantity}, available ${available}`);
      }
    }
    // Create request document
    const reqRef = await addDoc(collection(db, 'material_requests'), payload);

    // Decrement stocks
    for (const item of draft.items) {
      const ref = doc(db, 'solar_warehouse', item.materialId!);
      const snap = await transaction.get(ref);
      const data: any = snap.data();
      const available = data.availableQuantity ?? data.quantity ?? 0;
      const newQty = Math.max(available - item.quantity, 0);
      const updatePayload: any = {};
      if (Object.prototype.hasOwnProperty.call(data, 'availableQuantity')) updatePayload.availableQuantity = newQty;
      if (Object.prototype.hasOwnProperty.call(data, 'quantity')) updatePayload.quantity = newQty;
      if (!Object.keys(updatePayload).length) updatePayload.availableQuantity = newQty;
      transaction.update(ref, updatePayload);
      decremented.push({ materialId: item.materialId!, oldQty: available, newQty });
    }

    return { requestId: reqRef.id };
  });

  return { requestId: 'pending-return-populated-after-tx', decremented } as SubmitResult; // placeholder (tx returns ignored by Firestore API)
}
