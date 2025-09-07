import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { File as FileIcon, ExternalLink, Trash2, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { DriveFile } from "@/types/drive";
import { useMemo, useState } from "react";

export const FileListTable = ({
  files,
  isLoading,
  onDelete,
}: {
  files: DriveFile[];
  isLoading?: boolean;
  onDelete?: (fileId: string) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const filteredFiles = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return files.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.siteName?.toLowerCase().includes(q) ||
  f.siteId?.toLowerCase().includes(q) ||
  f.uploader?.toLowerCase().includes(q)
    );
  }, [files, searchQuery]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const LoadingRow = ({ index }: { index: number }) => (
    <motion.tr key={`loading-${index}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: index * 0.1 }}>
      <td className="dashboard-table td">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 bg-muted animate-pulse rounded" />
          <div className="h-4 bg-muted animate-pulse rounded w-48" />
        </div>
      </td>
      <td className="dashboard-table td">
        <div className="h-6 bg-muted animate-pulse rounded w-20" />
      </td>
      <td className="dashboard-table td">
        <div className="h-4 bg-muted animate-pulse rounded w-24" />
      </td>
      <td className="dashboard-table td">
        <div className="h-4 bg-muted animate-pulse rounded w-24" />
      </td>
      <td className="dashboard-table td">
        <div className="flex gap-2">
          <div className="h-8 w-8 bg-muted animate-pulse rounded" />
          <div className="h-8 w-8 bg-muted animate-pulse rounded" />
        </div>
      </td>
    </motion.tr>
  );

  return (
    <Card className="dashboard-card overflow-hidden">
      <div className="p-4 flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by file name or site..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        {searchQuery && (
          <Badge variant="secondary" className="w-fit">
            {filteredFiles.length} of {files.length} files
          </Badge>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="dashboard-table min-w-full table-fixed text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="dashboard-table th px-4 py-3 w-1/2">File Name</th>
              <th className="dashboard-table th px-4 py-3 w-1/5">Site</th>
              <th className="dashboard-table th px-4 py-3 w-1/5">Upload Date</th>
              <th className="dashboard-table th px-4 py-3 w-1/5">Uploader</th>
              <th className="dashboard-table th px-4 py-3 w-[110px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => <LoadingRow key={`loading-${index}`} index={index} />)
            ) : filteredFiles.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-12 text-muted-foreground">
                  No files found
                </td>
              </tr>
            ) : (
              <AnimatePresence>
                {filteredFiles.map((file, index) => (
                  <motion.tr
                    key={file.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="dashboard-table tr group"
                  >
                    <td className="dashboard-table td px-4 py-3 align-middle w-1/2">
                      <div className="flex items-center gap-3 min-w-0">
                        <FileIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                        <span
                          className="font-medium text-foreground truncate block w-full"
                          title={file.name}
                        >
                          {file.name}
                        </span>
                      </div>
                    </td>
                    <td className="dashboard-table td px-4 py-3 align-middle w-1/5 whitespace-nowrap">
                      {file.siteName ? (
                        <Badge variant="secondary" className="font-normal">
                          {file.siteName}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs font-mono">{file.siteId || "No site"}</span>
                      )}
                    </td>
                    <td className="dashboard-table td px-4 py-3 align-middle w-1/5 whitespace-nowrap">
                      <span className="text-muted-foreground" title={file.createdTime}>
                        {formatDate(file.createdTime)}
                      </span>
                    </td>
                    <td className="dashboard-table td px-4 py-3 align-middle w-1/5 whitespace-nowrap">
                      <span className="text-muted-foreground" title={file.uploader || ''}>
                        {file.uploader || '—'}
                      </span>
                    </td>
                    <td className="dashboard-table td px-2 py-3 align-middle w-[110px] whitespace-nowrap">
                      <div className="flex items-center gap-1 justify-end">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => window.open(file.webViewLink, "_blank")}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        {onDelete && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onDelete(file.id)}
                            className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
};
