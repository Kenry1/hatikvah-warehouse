import React, { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Upload } from "lucide-react";
import { SiteUploadForm } from "@/components/SiteUploadForm";
import { SiteUploadsTable } from "@/components/SiteUploadsTable";

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

  const handleUpload = (doc: UploadedDoc) => {
    setUploadedDocs((prev) => [doc, ...prev]);
  };

  const handleRemove = (id: string) => {
    setUploadedDocs((prev) => prev.filter((doc) => doc.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Card className="max-w-6xl mx-auto backdrop-blur-md bg-white/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 shadow-xl rounded-2xl overflow-hidden">
          {/* Header */}
          <CardHeader className="border-b border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-800/60">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-lg font-semibold text-slate-800">
                <FileText className="h-6 w-6 text-primary" />
                Site Documentation
              </CardTitle>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Upload className="h-4 w-4" />
                Upload & Manage
              </div>
            </div>
          </CardHeader>

          {/* Body */}
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Upload Form */}
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="md:col-span-2"
            >
              <SiteUploadForm onUpload={handleUpload} />
            </motion.div>

            {/* Recent Uploads Feed */}
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="md:col-span-1"
            >
              <div className="sticky top-6 border rounded-xl p-4 bg-white/70 dark:bg-slate-800/70 shadow-md">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium flex items-center gap-2 text-slate-700">
                    <FileText className="h-4 w-4 text-primary" />
                    Recent Uploads
                  </h4>
                  <span className="text-xs text-slate-500">Last 5</span>
                </div>
                <div className="space-y-2">
                  {uploadedDocs.slice(0, 5).length === 0 && (
                    <div className="text-sm text-slate-400 italic">
                      No recent uploads
                    </div>
                  )}
                  {uploadedDocs.slice(0, 5).map((doc) => (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-100/70 dark:hover:bg-slate-700/70 transition cursor-pointer"
                      onClick={() => doc.fileUrl && window.open(doc.fileUrl, '_blank')}
                    >
                      <div className="p-2 rounded-lg bg-primary/10">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate text-slate-800">
                          {doc.title}
                        </div>
                        <div className="text-xs text-slate-500 truncate">
                          {doc.siteName || doc.siteId || "—"}
                        </div>
                      </div>
                      <div className="text-xs text-slate-400">
                        {new Date(doc.uploadDate).toLocaleDateString()}
                      </div>
                    </motion.div>
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
