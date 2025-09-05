# Google Drive Integration Setup

## Overview
This application now includes Google Drive integration for uploading site documentation files. When users submit documents through the site documentation form, they are automatically uploaded to the specified Google Drive folder.

## Configuration

### Google Drive Folder
- **Folder URL**: https://drive.google.com/drive/folders/1qWrBDsrm-Ghih3sfL0MsBiXx4vNLLKXx?usp=sharing
- **Folder ID**: `1qWrBDsrm-Ghih3sfL0MsBiXx4vNLLKXx`

### Service Account
The application uses a Google Service Account for authentication:
- **Project ID**: `my-project-11111111111-469012`
- **Service Account Email**: `drive-uploader@my-project-11111111111-469012.iam.gserviceaccount.com`

## Current Implementation

### Frontend Integration
- ✅ File upload form with Google Drive integration
- ✅ Progress tracking during upload
- ✅ File metadata storage (site ID, site name, upload date)
- ✅ Public file sharing links
- ✅ View links in the uploads table

### Backend Requirements
⚠️ **Important**: The current implementation requires a backend server to handle Google Drive API calls securely. The frontend service is configured but needs to be moved to a server environment.

## Required Backend Setup

To complete the Google Drive integration, you need to:

1. **Create a backend API endpoint** (Node.js/Express recommended)
2. **Move the Google Drive service** to the backend
3. **Update the frontend** to call the backend API instead of direct Google Drive calls
4. **Handle authentication securely** on the server side

### Sample Backend Implementation

```javascript
// server.js (Express.js example)
const express = require('express');
const multer = require('multer');
const { googleDriveService } = require('./services/googleDriveService');

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const metadata = req.body;

    const fileId = await googleDriveService.uploadFile(file, metadata);
    const fileUrl = await googleDriveService.getFileUrl(fileId);

    res.json({ success: true, fileId, fileUrl });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(3001, () => console.log('Server running on port 3001'));
```

## Security Considerations

1. **Never expose service account credentials** in frontend code
2. **Use environment variables** for sensitive configuration
3. **Implement proper authentication** for upload endpoints
4. **Validate file types and sizes** on the server
5. **Use HTTPS** for all API communications

## File Permissions

Uploaded files are automatically set to public read access, allowing anyone with the link to view them. If you need more restrictive permissions, modify the `getFileUrl` method in the Google Drive service.

## Next Steps

1. Set up a backend server (recommended: Node.js with Express)
2. Move Google Drive service to backend
3. Update frontend to use API endpoints
4. Test the complete upload flow
5. Implement proper error handling and user feedback
