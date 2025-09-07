import React, { useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, Calendar, Hash, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { googleOauthDrive } from "@/services/googleOauthDrive";
import { useAuth } from "@/contexts/AuthContext";

type UploadedDoc = {
  id: string;
  title: string;
  fileName: string;
  siteId?: string;
  siteName?: string;
  uploadDate: string;
  uploader?: string;
  fileUrl?: string;
  driveFileId?: string;
};

type Props = {
  onUpload: (doc: {
    id: string;
    title: string;
    fileName: string;
    siteId?: string;
    siteName?: string;
    uploadDate: string;
    uploader?: string;
    fileUrl?: string;
    driveFileId?: string;
  }) => void;
};

export const SiteUploadForm: React.FC<Props> = ({ onUpload }) => {
  const { user } = useAuth();
  const [siteId, setSiteId] = useState("");
  const [siteName, setSiteName] = useState("");
  const [date, setDate] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    // Validate required fields
    if (!siteId.trim()) {
      alert("Site ID is required");
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      // Update progress to show upload starting
      setProgress(10);

  // Upload via OAuth (user's My Drive) to avoid service account quota errors
  await googleOauthDrive.init((import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string);
  await googleOauthDrive.ensureToken(true);
  const fileId = await googleOauthDrive.uploadFile(file, file.name.split(".")[0]);

      if (fileId) {
        setProgress(90);

        // Get the public URL
  // Make public and get URL
  await googleOauthDrive.makeFilePublic(fileId);
  const fileUrl = googleOauthDrive.getFileUrl(fileId);

        // Create document object
        const doc: UploadedDoc = {
          id: fileId, // use Drive file ID as canonical ID
          title: file.name.split(".")[0],
          fileName: file.name,
          siteId: siteId || undefined,
          siteName: siteName || undefined,
          uploadDate: new Date().toISOString(),
          uploader: user?.username || user?.email || "Unknown",
          fileUrl: fileUrl || undefined,
          driveFileId: fileId
        };

        setProgress(100);
  onUpload({ ...doc, uploader: doc.uploader, driveFileId: fileId });

        // Reset form
        setFile(null);
        setSiteId("");
        setSiteName("");
        setDate("");
      } else {
        throw new Error("Failed to upload file to Google Drive");
      }
    } catch (error) {
      console.error("Upload failed:", error);
      // You might want to show a toast notification here
      const errorMessage = error instanceof Error ? error.message : "Upload failed. Please try again.";
      alert(`Upload failed: ${errorMessage}`);
    } finally {
      setIsUploading(false);
    }

  };

  return (
    <motion.div
      className="space-y-4 p-6 border rounded-xl bg-white/70 dark:bg-slate-800/70 shadow-md backdrop-blur-md"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Site ID */}
        <div className="space-y-2">
          <Label htmlFor="siteId" className="flex items-center gap-1 text-slate-600">
            <Hash className="h-4 w-4" /> Site ID <span className="text-red-500">*</span>
          </Label>
          <Input
            id="siteId"
            placeholder="Enter Site ID"
            value={siteId}
            onChange={(e) => setSiteId(e.target.value)}
            required
          />
        </div>

        {/* Site Name */}
        <div className="space-y-2">
          <Label htmlFor="siteName" className="flex items-center gap-1 text-slate-600">
            <Building2 className="h-4 w-4" /> Site Name
          </Label>
          <Input
            id="siteName"
            placeholder="Enter Site Name"
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
          />
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label htmlFor="date" className="flex items-center gap-1 text-slate-600">
            <Calendar className="h-4 w-4" /> Date
          </Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </div>

      {/* Drag & Drop File Upload */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="border-2 border-dashed rounded-xl p-4 sm:p-6 text-center cursor-pointer hover:border-primary/60 transition min-h-[200px] flex items-center justify-center"
      >
        {file ? (
          <div className="flex flex-col items-center gap-4">
            <UploadCloud className="h-8 w-8 text-primary" />
            <div className="text-center">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{file.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleButtonClick}
              className="mt-2 min-h-[44px] px-4"
            >
              <UploadCloud className="h-4 w-4 mr-2" />
              Choose Different File
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <UploadCloud className="h-8 w-8 text-slate-400" />
            <div className="text-center">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Drag & drop a file here, or click to browse
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Supports all file types
              </p>
            </div>
            <Button
              onClick={handleButtonClick}
              className="mt-2 min-h-[44px] px-6"
            >
              <UploadCloud className="h-4 w-4 mr-2" />
              Choose File
            </Button>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          accept="*/*"
          aria-label="Choose file to upload"
        />
      </div>

      {/* Progress Bar */}
      {isUploading && (
        <Progress value={progress} className="h-2" />
      )}

      {/* Security Notice */}
      <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
        <strong>Note:</strong> Files upload from the browser to your Google Drive via OAuth.
      </div>

      {/* Upload Button */}
      <Button
        className="w-full"
        disabled={!file || isUploading}
        onClick={handleUpload}
      >
        {isUploading ? "Uploading..." : "Upload File"}
      </Button>
    </motion.div>
  );
};
