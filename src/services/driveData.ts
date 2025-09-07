import { googleOauthDrive } from './googleOauthDrive';
import type { DriveFile } from '../types/drive';
import { db } from '@/lib/firebase';
import { collection, addDoc, getDocs, deleteDoc, query, where, orderBy, Timestamp, doc as fsDoc, setDoc } from 'firebase/firestore';

// Firestore collection name for site document metadata
export const SITE_DOCS_COLLECTION = 'site_documents';

export type SiteDocMeta = {
  // Firestore doc id is separate; we will not rely on it for Drive ops
  title: string;
  fileName: string;
  siteId?: string;
  siteName?: string;
  uploadDate: string; // ISO
  uploader?: string;
  fileUrl?: string; // webViewLink
  driveFileId: string;
  uploadedByUserId?: string;
};

// Save a metadata record to Firestore after a successful Drive upload
export async function saveSiteFileMeta(meta: SiteDocMeta) {
  const ref = fsDoc(db, SITE_DOCS_COLLECTION, meta.driveFileId);
  await setDoc(ref, {
    ...meta,
    // store server-friendly createdAt for ordering if needed
    createdAt: Timestamp.fromDate(new Date(meta.uploadDate || new Date().toISOString())),
  }, { merge: true });
}

// List documents from Firestore (ignore company id; fetch all)
export async function listSiteFiles(opts?: { siteId?: string; search?: string; fallbackToDrive?: boolean; interactive?: boolean }) {
  try {
    const col = collection(db, SITE_DOCS_COLLECTION);
    // Fetch all metadata docs, then filter client-side as needed
    const snap = await getDocs(col);
    const items = snap.docs.map((d) => ({ id: d.id, ...(d.data() as SiteDocMeta & { createdAt?: any }) }));

    const filtered = items.filter((it) => {
      if (opts?.siteId && it.siteId !== opts.siteId) return false;
      if (opts?.search) {
        const s = opts.search.toLowerCase();
        const hay = `${it.title} ${it.fileName} ${it.siteName ?? ''} ${it.siteId ?? ''}`.toLowerCase();
        if (!hay.includes(s)) return false;
      }
      return true;
    });

    // Map to DriveFile shape
  const mapped: DriveFile[] = filtered
      .sort((a, b) => {
        const ad = a.createdAt?.toDate?.() ?? new Date(a.uploadDate);
        const bd = b.createdAt?.toDate?.() ?? new Date(b.uploadDate);
        return bd.getTime() - ad.getTime();
      })
      .map((f) => ({
        id: f.driveFileId,
        name: f.title || f.fileName,
        createdTime: (f.createdAt?.toDate?.() ?? new Date(f.uploadDate)).toISOString(),
        siteId: f.siteId,
        siteName: f.siteName,
        webViewLink: f.fileUrl || googleOauthDrive.getFileUrl(f.driveFileId),
    uploader: f.uploader,
    uploadedByUserId: f.uploadedByUserId,
      }));

    if (mapped.length > 0) return mapped;
    // Optionally fall back to Drive listing only when explicitly requested (e.g., user-initiated refresh)
    if (opts?.fallbackToDrive) {
      return await listSiteFilesFromDrive(opts);
    }
    return [];
  } catch (err) {
    console.warn('listSiteFiles metadata fetch failed.', err);
    // Avoid Drive fallback during passive loads to prevent popup blockers; caller can request fallback explicitly
    if (opts?.fallbackToDrive) {
      return await listSiteFilesFromDrive(opts);
    }
    return [];
  }
}

// Fallback: list recent files directly from Drive OAuth for the current user
export async function listSiteFilesFromDrive(opts?: { siteId?: string; search?: string; interactive?: boolean }) {
  // Best-effort init; if missing client id, this will throw and bubble up
  const clientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string;
  await googleOauthDrive.init(clientId);
  try {
    await googleOauthDrive.ensureToken(false);
  } catch (e) {
    if (opts?.interactive) {
      // user-initiated path: request interactive consent to avoid popup blockers
      await googleOauthDrive.ensureToken(true);
    } else {
      throw e;
    }
  }

  const driveFiles = await googleOauthDrive.listFiles({
    // Basic filter to exclude trashed handled by client; include everything recent
    orderBy: 'createdTime desc',
    pageSize: 50,
  });

  const filtered = (driveFiles || []).filter((f) => {
    if (opts?.search) {
      const s = opts.search.toLowerCase();
      const hay = `${f.name}`.toLowerCase();
      if (!hay.includes(s)) return false;
    }
    return true;
  });

  const mapped: DriveFile[] = filtered.map((f) => ({
    id: f.id,
    name: f.name,
    createdTime: f.createdTime,
    // siteId/siteName unknown without Firestore metadata; leave undefined
    webViewLink: f.webViewLink || googleOauthDrive.getFileUrl(f.id),
    // uploader unknown from Drive API alone
  }));

  return mapped;
}

// Delete Drive file then remove its metadata from Firestore
export async function deleteDriveFile(fileId: string) {
  // Attempt Drive deletion first (may fail if current user lacks permission)
  try {
    await googleOauthDrive.deleteFile(fileId);
  } catch (e) {
    // Try interactive auth once if needed
    await googleOauthDrive.init((import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string);
    await googleOauthDrive.ensureToken(true);
    await googleOauthDrive.deleteFile(fileId);
  }
  // Remove all metadata docs referencing this drive file id
  const col = collection(db, SITE_DOCS_COLLECTION);
  const q = query(col, where('driveFileId', '==', fileId));
  const snap = await getDocs(q);
  await Promise.all(snap.docs.map((d) => deleteDoc(fsDoc(db, SITE_DOCS_COLLECTION, d.id))));
}
