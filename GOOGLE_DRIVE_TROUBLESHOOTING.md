# Google Drive Integration Troubleshooting

## ✅ SOLUTION FOUND: Service Account Storage Quota Issue

### The Problem:
**"Service Accounts do not have storage quota"** - This is a Google limitation. Service accounts cannot upload to personal Google Drive accounts.

### ✅ Solution 1: Use Shared Drive (Recommended)

**🚀 Quick Setup Tool**: Open `google-drive-setup.html` in your browser for automated setup!

1. **Create a Shared Drive** (Automated):
   - Open `google-drive-setup.html` in your browser
   - Click "Create Shared Drive" to automatically create "SWIISH" drive
   - Copy the Drive ID that appears

2. **Create a Shared Drive** (Manual):
   - Go to [Google Drive](https://drive.google.com)
   - Click "Shared drives" in the left sidebar
   - Click "New" to create a shared drive
   - Name it "SWIISH" or your preferred name

3. **Create a Shared Drive** (Programmatic):
   - Use the new `createSharedDrive()` method in the service
   - Example: `await googleDriveService.createSharedDrive('SWIISH')`
   - This uses the `drives.create` API endpoint

4. **Add Service Account as Manager**:
   - In the shared drive, click "Share"
   - Add: `drive-uploader@my-project-11111111111-469012.iam.gserviceaccount.com`
   - Give "Manager" permissions
   - Click "Send"

3. **Update Code to Use Shared Drive**:
   - Get the shared drive ID from the URL
   - Update `SHARED_DRIVE_ID` in `googleDriveService.ts` to the shared drive ID
   - Ensure `USE_SHARED_DRIVE = true` is set
   - Change `UPLOAD_TO_ROOT = false` to upload to the shared drive
   - The service now includes `supportsAllDrives=true` in all API calls

### ✅ Solution 2: Domain-Wide Delegation (Advanced)

If you have a Google Workspace domain, you can set up domain-wide delegation:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to "IAM & Admin" → "Service Accounts"
3. Find your service account
4. Enable "Domain-wide delegation"
5. Add the service account to your domain's API access

### Current Configuration:
- **Upload Destination**: Service Account's Root Directory (not allowed)
- **Service Account**: drive-uploader@my-project-11111111111-469012.iam.gserviceaccount.com
- **Shared Drive Support**: ✅ Enabled with `supportsAllDrives=true`
- **Status**: ❌ Failing due to storage quota limitation

### New Shared Drive Methods Available:
- `createSharedDrive(name)` - Creates a new shared drive programmatically
- `listSharedDrives()` - Lists all shared drives accessible to the service account
- `getSharedDrive(driveId)` - Gets details of a specific shared drive

### Shared Drive API Parameters:
The service now includes these parameters for full shared drive support:
- `supportsAllDrives=true` - Enables operations on shared drives
- `driveId` - Specifies the shared drive ID for targeted operations
- `corpora=drive` - Limits search to specific shared drive
- `includeItemsFromAllDrives=true` - Includes shared drive items in results

### Quick Fix:
**🚀 Use the automated setup tool**: Open `google-drive-setup.html` and follow the steps!

**Manual Setup**:
1. Create shared drive "SWIISH"
2. Share with service account as Manager
3. Update SHARED_DRIVE_ID in code
4. Test upload functionality

### Quick Test Page
A standalone test page has been created: `google-drive-test.html`
- Open this file in your browser to test authentication without the full app
- Use this to verify service account setup before testing in the main app

### Automated Setup Tool
A comprehensive setup tool has been created: `google-drive-setup.html`
- **Features**: Automated shared drive creation, step-by-step guidance, configuration updates
- **Usage**: Open in browser and follow the 4-step process
- **Benefits**: Eliminates manual configuration errors and provides real-time feedback

### Common Causes:
1. **Service Account Permissions**: The service account doesn't have access to the target folder
2. **JWT Authentication Issues**: Invalid JWT token or signature
3. **Scope Problems**: Insufficient API permissions
4. **Folder Access**: Target folder doesn't exist or service account can't access it

### Step-by-Step Fix:

#### 1. Test Authentication First
- Open `google-drive-test.html` in your browser
- Click "Test Basic Authentication"
- Check if JWT generation and token exchange work

#### 2. Share Folder with Service Account
- Go to [Google Drive](https://drive.google.com)
- Find the folder named: **"SWIISH"**
- Right-click the folder → Share
- Add this email: `drive-uploader@my-project-11111111111-469012.iam.gserviceaccount.com`
- Give "Editor" permissions
- Click "Send"

#### 3. Verify Folder Access
- Go back to `google-drive-test.html`
- Click "Test Folder Access"
- Should show: "✅ Folder access successful: [folder name]"

#### 5. Test Shared Drive Creation
- Use `googleDriveService.createSharedDrive('Test Drive')` to create a test shared drive
- Use `googleDriveService.listSharedDrives()` to verify the drive was created
- Use `googleDriveService.getSharedDrive(driveId)` to get drive details

### Debugging Steps:

1. **Open Browser Console** (F12 → Console tab)
2. **Check for these log messages**:
   - `✅ Google Drive service initialized` - Authentication working
   - `✅ Folder access test passed` - Folder permissions correct
   - `❌ Folder access test failed` - Need to share folder

3. **Common Error Patterns**:
   - `403 Forbidden` on upload = Folder access issue
   - `400 Bad Request` on token = JWT format issue
   - `401 Unauthorized` = Authentication completely failed

### Alternative Solutions:

#### Option A: Upload to Root Directory
If folder sharing doesn't work, modify the service:
```typescript
// In googleDriveService.ts, change this line:
const UPLOAD_TO_ROOT = true; // Instead of false
```

#### Option B: Create New Folder
1. Create a new folder in Google Drive
2. Share it with the service account
3. Update `FOLDER_ID` in `googleDriveService.ts`

### Security Note:
⚠️ **This implementation exposes service account credentials in the frontend code. This is not secure for production use.** Consider implementing a backend service for production deployments.
