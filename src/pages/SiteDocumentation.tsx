import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload } from "lucide-react";
import { SiteUploadForm } from "@/components/SiteUploadForm";
import { SiteUploadsTable } from "@/components/SiteUploadsTable";
import { saveSiteFileMeta, listSiteFiles, deleteDriveFile } from "@/services/driveData";
import { googleOauthDrive } from "@/services/googleOauthDrive";

type UploadedDoc = {
  id: string;
  title: string;
  fileName: string;
  siteId?: string;
  siteName?: string;
  uploadDate: string; // ISO
  uploader?: string;
  fileUrl?: string;
  driveFileId?: string;
};

const SiteDocumentation: React.FC = () => {
  const [uploadedDocs, setUploadedDocs] = useState<UploadedDoc[]>([]);
  const [loading, setLoading] = useState(false);

  // Load existing documents from Firestore (all documents, ignore company id)
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const files = await listSiteFiles(); // Firestore only by default
        const mapped: UploadedDoc[] = files.map((f) => ({
          id: f.id, // use drive file id as row id
          title: f.name,
          fileName: f.name,
          siteId: f.siteId,
          siteName: f.siteName,
          uploadDate: f.createdTime,
          uploader: f.uploader,
          fileUrl: f.webViewLink,
          driveFileId: f.id,
        }));
        setUploadedDocs(mapped);
      } catch (e) {
        console.error('Failed to load site documents from Firestore', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Set browser tab title
  useEffect(() => {
    const previousTitle = document.title;
    document.title = 'Site Documentation';
    return () => { document.title = previousTitle; };
  }, []);

  const handleDriveRefresh = async () => {
    // User-initiated fallback that may prompt for OAuth
    setLoading(true);
    try {
      const files = await listSiteFiles({ fallbackToDrive: true, interactive: true });
      const mapped: UploadedDoc[] = files.map((f) => ({
        id: f.id,
        title: f.name,
        fileName: f.name,
        siteId: f.siteId,
        siteName: f.siteName,
        uploadDate: f.createdTime,
        uploader: f.uploader,
        fileUrl: f.webViewLink,
        driveFileId: f.id,
      }));
      setUploadedDocs(mapped);
    } catch (e) {
      console.error('Drive fallback refresh failed', e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (doc: UploadedDoc) => {
    setUploadedDocs((prev) => [doc, ...prev]);
    try {
      await saveSiteFileMeta({
        title: doc.title,
        fileName: doc.fileName,
        siteId: doc.siteId,
        siteName: doc.siteName,
        uploadDate: doc.uploadDate,
        uploader: doc.uploader,
        fileUrl: doc.fileUrl,
        driveFileId: doc.driveFileId!,
        // Try to carry user id if available from local storage Auth
        uploadedByUserId: (JSON.parse(localStorage.getItem('currentUser') || 'null')?.id) || undefined,
      });
    } catch (e) {
      console.error('Failed to save metadata to Firestore', e);
    }
  };

  const handleRemove = async (id: string) => {
    // id is driveFileId here
    try {
      await deleteDriveFile(id);
      setUploadedDocs((prev) => prev.filter((doc) => doc.id !== id));
    } catch (e) {
      console.error('Failed to delete drive file', e);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="max-w-7xl mx-auto backdrop-blur-md bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 shadow-xl rounded-2xl overflow-hidden">
          {/* Header */}
          <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <CardTitle className="flex items-center gap-3 text-xl md:text-2xl font-semibold text-slate-800 dark:text-slate-100">
                <FileText className="h-6 w-6 text-primary" />
                <span className="leading-tight">Site Documentation</span>
              </CardTitle>
              <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-slate-600 dark:text-slate-400">
                <span className="inline-flex items-center gap-1"><Upload className="h-4 w-4" /> Manage & Sync</span>
                <button
                  className="inline-flex items-center rounded-md px-3 py-1.5 border border-slate-300 dark:border-slate-600 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-700 transition disabled:opacity-50"
                  onClick={handleDriveRefresh}
                  disabled={loading}
                  aria-busy={loading}
                  aria-label="Fetch / refresh documents from Google Drive"
                >
                  {loading ? 'Refreshing…' : 'Fetch from Drive'}
                </button>
              </div>
            </div>
          </CardHeader>

          {/* Body */}
      <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Upload Form */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
        className="md:col-span-2 lg:col-span-2"
            >
              <SiteUploadForm onUpload={handleUpload} />
            </motion.div>

            {/* Recent Uploads Feed */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="md:col-span-2 lg:col-span-1"
            >
              <div className="border rounded-xl p-4 bg-white/70 dark:bg-slate-800/70 shadow-md md:sticky md:top-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
                  <h4 className="text-sm font-medium flex items-center gap-2 text-slate-700 dark:text-slate-200">
                    <FileText className="h-4 w-4 text-primary" />
                    Recent Uploads
                  </h4>
                  <span className="text-xs text-slate-500">Last 5</span>
                </div>
                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                  {uploadedDocs.slice(0, 5).length === 0 && (
                    <div className="text-sm text-slate-400 italic">
                      No recent uploads
                    </div>
                  )}
                  {uploadedDocs.slice(0, 5).map((doc) => (
                    <motion.button
                      key={doc.id}
                      type="button"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="w-full text-left flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100/70 dark:hover:bg-slate-700/70 transition focus:outline-none focus:ring-2 focus:ring-primary/40"
                      onClick={() => doc.fileUrl && window.open(doc.fileUrl, '_blank')}
                    >
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate text-slate-800 dark:text-slate-100">
                          {doc.title}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 truncate">
                          {doc.siteName || doc.siteId || '—'}
                        </div>
                      </div>
                      <div className="text-xs text-slate-400 whitespace-nowrap">
                        {new Date(doc.uploadDate).toLocaleDateString()}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </CardContent>

          {/* Full Uploads Table */}
          <CardContent className="p-6 border-t border-slate-200 dark:border-slate-700">
            <SiteUploadsTable uploadedDocs={uploadedDocs} onRemove={handleRemove} />
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SiteDocumentation;
