import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Folder, FileText, UploadCloud } from "lucide-react";

// TODO: Replace with real Google Drive API integration
const mockFolders = [
  { id: "1", name: "Site Reports" },
  { id: "2", name: "Drawings" },
  { id: "3", name: "Invoices" },
];
const mockFiles = [
  { id: "a", name: "Report_July.pdf", folderId: "1" },
  { id: "b", name: "Drawing_001.dwg", folderId: "2" },
  { id: "c", name: "Invoice_2025.xlsx", folderId: "3" },
];

export default function ProjectTrackingPage() {
  const [folders, setFolders] = useState(mockFolders);
  const [files, setFiles] = useState(mockFiles);
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);

  // Replace with Google Drive API fetch logic
  useEffect(() => {
    // Example: fetch folders/files for a specific Google account
  }, []);

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Folder className="h-5 w-5" />
            Project Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Folders</h3>
            <div className="flex gap-4">
              {folders.map(folder => (
                <button
                  key={folder.id}
                  className={`px-4 py-2 rounded border ${selectedFolder === folder.id ? "bg-primary text-white" : "bg-muted"}`}
                  onClick={() => setSelectedFolder(folder.id)}
                >
                  <Folder className="inline-block mr-2 h-4 w-4" />
                  {folder.name}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-6">
            <h3 className="font-semibold mb-2">Uploads</h3>
            <div className="flex flex-col gap-2">
              {files.filter(f => !selectedFolder || f.folderId === selectedFolder).map(file => (
                <div key={file.id} className="flex items-center gap-2 p-2 border rounded bg-muted">
                  <FileText className="h-4 w-4" />
                  <span>{file.name}</span>
                  <UploadCloud className="h-4 w-4 ml-auto text-primary" />
                </div>
              ))}
              {files.filter(f => !selectedFolder || f.folderId === selectedFolder).length === 0 && (
                <div className="text-muted-foreground">No uploads in this folder.</div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
