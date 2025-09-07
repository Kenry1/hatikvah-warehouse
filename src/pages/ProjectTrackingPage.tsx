import { useEffect, useState } from "react";
import type { DriveFile } from "@/types/drive";
import { SiteFilesDashboard } from "@/components/project-tracking/SiteFilesDashboard";
import { listSiteFiles, deleteDriveFile } from "@/services/driveData";

export default function ProjectTrackingPage() {
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFiles = async () => {
    setLoading(true);
    try {
  const items = await listSiteFiles();
      setFiles(items);
    } catch (e) {
      console.error("Failed to load Drive files", e);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiles();
  }, []);

  const handleDriveFetch = async () => {
    setLoading(true);
    try {
  const items = await listSiteFiles({ fallbackToDrive: true, interactive: true });
      setFiles(items);
    } catch (e) {
      console.error("Drive fetch failed", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      await deleteDriveFile(fileId);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch (e) {
      console.error("Delete failed", e);
    }
  };

  return <SiteFilesDashboard files={files} isLoading={loading} onRefresh={loadFiles} onDelete={handleDelete} onDriveFetch={handleDriveFetch} />;
}
