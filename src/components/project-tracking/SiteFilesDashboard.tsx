import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import type { DriveFile } from "@/types/drive";
import { FileStatsCard } from "./FileStatsCard";
import { FileListTable } from "./FileListTable";

export const SiteFilesDashboard = ({
  files,
  isLoading = false,
  onRefresh,
  onDelete,
  onDriveFetch,
}: {
  files: DriveFile[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onDelete?: (fileId: string) => void;
  onDriveFetch?: () => void;
}) => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-foreground mb-2">Drive Files Dashboard</h1>
            <p className="text-muted-foreground">Manage and monitor uploaded Google Drive files</p>
          </div>
          {(onRefresh || onDriveFetch) && (
            <div className="flex gap-2">
              {onRefresh && (
                <Button variant="outline" className="w-fit" onClick={onRefresh} disabled={isLoading}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {isLoading ? "Refreshing..." : "Refresh"}
                </Button>
              )}
              {onDriveFetch && (
                <Button variant="default" className="w-fit" onClick={onDriveFetch} disabled={isLoading}>
                  Fetch from Drive
                </Button>
              )}
            </div>
          )}
        </motion.div>

        {/* Stats Card */}
        <FileStatsCard files={files} isLoading={isLoading} />

        {/* Files Table */}
        <FileListTable files={files} isLoading={isLoading} onDelete={onDelete} />
      </div>
    </div>
  );
};
