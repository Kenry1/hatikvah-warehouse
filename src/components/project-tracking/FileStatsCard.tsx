import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Files, Clock } from "lucide-react";
import { motion } from "framer-motion";
import type { DriveFile } from "@/types/drive";

export const FileStatsCard = ({ files, isLoading }: { files: DriveFile[]; isLoading?: boolean }) => {
  const totalFiles = files.length;
  const mostRecentFile = files.length
    ? [...files].sort((a, b) => new Date(b.createdTime).getTime() - new Date(a.createdTime).getTime())[0]
    : null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <Card className="dashboard-card p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-3">
            <div className="h-4 bg-muted animate-pulse rounded w-32" />
            <div className="h-8 bg-muted animate-pulse rounded w-16" />
            <div className="h-3 bg-muted animate-pulse rounded w-24" />
          </div>
          <div className="h-12 w-12 bg-muted animate-pulse rounded-lg" />
        </div>
      </Card>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <Card className="dashboard-card-elevated p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Files className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Total Files</span>
            </div>
            <div className="text-3xl font-bold text-foreground">{totalFiles}</div>
            {mostRecentFile && (
              <div className="flex items-center gap-2">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Last upload: {formatDate(mostRecentFile.createdTime)}</span>
              </div>
            )}
          </div>
          <Badge variant="secondary" className="text-lg px-3 py-1">
            {totalFiles}
          </Badge>
        </div>
      </Card>
    </motion.div>
  );
};
