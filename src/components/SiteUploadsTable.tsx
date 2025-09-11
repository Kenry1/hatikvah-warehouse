import React, { useMemo, useState } from 'react';
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
  // Filter state
  const [search, setSearch] = useState('');
  const [siteFilter, setSiteFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const siteOptions = useMemo(() => {
    const set = new Set<string>();
    uploadedDocs.forEach(d => {
      if (d.siteName) set.add(d.siteName);
      else if (d.siteId) set.add(d.siteId);
    });
    return Array.from(set).sort();
  }, [uploadedDocs]);

  const filteredDocs = useMemo(() => {
    return uploadedDocs.filter(doc => {
      // Search match
      if (search) {
        const hay = `${doc.title} ${doc.fileName} ${doc.siteName || ''} ${doc.siteId || ''}`.toLowerCase();
        if (!hay.includes(search.toLowerCase())) return false;
      }
      // Site filter
      if (siteFilter) {
        if (doc.siteName !== siteFilter && doc.siteId !== siteFilter) return false;
      }
      // Date range (inclusive)
      if (dateFrom || dateTo) {
        const ts = new Date(doc.uploadDate).getTime();
        if (dateFrom) {
          const fromTs = new Date(dateFrom + 'T00:00:00').getTime();
          if (ts < fromTs) return false;
        }
        if (dateTo) {
          const toTs = new Date(dateTo + 'T23:59:59').getTime();
          if (ts > toTs) return false;
        }
      }
      return true;
    });
  }, [uploadedDocs, search, siteFilter, dateFrom, dateTo]);

  const hasActiveFilters = !!(search || siteFilter || dateFrom || dateTo);

  return (
    <div className="mt-6">
      <h3 className="text-sm font-medium mb-3">Site Uploads</h3>

      {/* Filters */}
      <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-end lg:gap-4">
        <div className="flex-1">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1" htmlFor="searchUploads">Search</label>
          <input
            id="searchUploads"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search title, file, site..."
            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <div className="min-w-[180px]">
          <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1" htmlFor="siteFilter">Site</label>
          <select
            id="siteFilter"
            value={siteFilter}
            onChange={(e) => setSiteFilter(e.target.value)}
            className="w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            <option value="">All Sites</option>
            {siteOptions.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
        <div className="flex gap-3 flex-wrap">
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1" htmlFor="dateFrom">From</label>
            <input
              id="dateFrom"
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-md border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 dark:text-slate-300 mb-1" htmlFor="dateTo">To</label>
            <input
              id="dateTo"
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-md border border-slate-300 dark:border-slate-600 bg-white/80 dark:bg-slate-800/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => { setSearch(''); setSiteFilter(''); setDateFrom(''); setDateTo(''); }}
              className="text-xs px-3 py-2 rounded-md border border-slate-300 dark:border-slate-600 bg-white/60 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              Clear
            </button>
          )}
          <div className="text-xs text-slate-500 self-center hidden lg:block">
            {filteredDocs.length} / {uploadedDocs.length} shown
          </div>
        </div>
        <div className="text-xs text-slate-500 lg:hidden">
          {filteredDocs.length} / {uploadedDocs.length} shown
        </div>
      </div>

      {/* Mobile Card Layout */}
      <div className="space-y-3 sm:hidden">
  {filteredDocs.length === 0 && (
          <div className="text-sm text-slate-500 border rounded-lg p-4 bg-white/60 dark:bg-slate-800/60">No uploads yet.</div>
        )}
  {filteredDocs.map(doc => (
          <div
            key={doc.id}
            className="border rounded-lg p-4 bg-white/70 dark:bg-slate-800/70 shadow-sm flex flex-col gap-3"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate text-slate-800 dark:text-slate-100">{doc.title}</p>
                <p className="text-xs text-slate-500 truncate">{doc.fileName}</p>
              </div>
              <div className="text-right text-xs text-slate-500 whitespace-nowrap">
                {new Date(doc.uploadDate).toLocaleDateString()}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
              <div><span className="font-medium">Site:</span> {doc.siteName || '—'}</div>
              <div><span className="font-medium">ID:</span> {doc.siteId || '—'}</div>
              <div className="col-span-2"><span className="font-medium">Uploader:</span> {doc.uploader || '—'}</div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              {doc.fileUrl && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => window.open(doc.fileUrl, '_blank')}
                  className="text-xs"
                >
                  <ExternalLink className="h-4 w-4 mr-1" /> View
                </Button>
              )}
              <Button size="sm" variant="destructive" className="text-xs" onClick={() => onRemove(doc.id)}>Delete</Button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop / Tablet Table */}
      <div className="hidden sm:block rounded-md border overflow-x-auto">
        <div className="min-w-[900px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Title</TableHead>
                <TableHead>File</TableHead>
                <TableHead className="w-[140px]">Site Name</TableHead>
                <TableHead className="w-[110px]">Site ID</TableHead>
                <TableHead className="w-[170px]">Upload Date</TableHead>
                <TableHead className="w-[140px]">Uploader</TableHead>
                <TableHead className="w-[140px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDocs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">No uploads yet.</TableCell>
                </TableRow>
              ) : (
                filteredDocs.map(doc => (
                  <TableRow key={doc.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/40">
                    <TableCell className="font-medium max-w-[180px] truncate" title={doc.title}>{doc.title}</TableCell>
                    <TableCell className="max-w-[220px] truncate" title={doc.fileName}>{doc.fileName}</TableCell>
                    <TableCell>{doc.siteName || '—'}</TableCell>
                    <TableCell>{doc.siteId || '—'}</TableCell>
                    <TableCell>{new Date(doc.uploadDate).toLocaleString()}</TableCell>
                    <TableCell className="truncate max-w-[140px]" title={doc.uploader}>{doc.uploader}</TableCell>
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
    </div>
  );
};
