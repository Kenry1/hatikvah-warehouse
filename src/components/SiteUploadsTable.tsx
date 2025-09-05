import React from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ExternalLink } from 'lucide-react';

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

interface SiteUploadsTableProps {
  uploadedDocs: UploadedDoc[];
  onRemove: (id: string) => void;
}

export const SiteUploadsTable: React.FC<SiteUploadsTableProps> = ({ uploadedDocs, onRemove }) => {
  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium mb-3">Site Uploads</h3>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>File</TableHead>
              <TableHead>Site Name</TableHead>
              <TableHead>Site ID</TableHead>
              <TableHead>Upload Date</TableHead>
              <TableHead>Uploader</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {uploadedDocs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">No uploads yet.</TableCell>
              </TableRow>
            ) : (
              uploadedDocs.map(doc => (
                <TableRow key={doc.id}>
                  <TableCell className="font-medium">{doc.title}</TableCell>
                  <TableCell>{doc.fileName}</TableCell>
                  <TableCell>{doc.siteName || '—'}</TableCell>
                  <TableCell>{doc.siteId || '—'}</TableCell>
                  <TableCell>{new Date(doc.uploadDate).toLocaleString()}</TableCell>
                  <TableCell>{doc.uploader}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {doc.fileUrl && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(doc.fileUrl, '_blank')}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View
                        </Button>
                      )}
                      <Button size="sm" variant="destructive" onClick={() => onRemove(doc.id)}>Delete</Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
