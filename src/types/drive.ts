export type DriveFile = {
  id: string;
  name: string;
  siteId?: string;
  siteName?: string;
  createdTime: string; // ISO string
  webViewLink: string;
  uploader?: string;
  uploadedByUserId?: string;
};
