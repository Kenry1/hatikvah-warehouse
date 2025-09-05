# 🚀 Google Drive Shared Drive Setup - Quick Start

## The Problem
You're getting 403 Forbidden errors because service accounts don't have storage quota for personal Google Drive uploads.

## ✅ The Solution: Use Shared Drives

### Step 1: Run the Automated Setup Tool
1. Open `google-drive-setup.html` in your browser
2. Click "Create Shared Drive"
3. Copy the Drive ID that appears

### Step 2: Share the Drive
1. Go to [Google Drive](https://drive.google.com)
2. Find the "SWIISH" shared drive
3. Click "Share"
4. Add: `drive-uploader@my-project-11111111111-469012.iam.gserviceaccount.com`
5. Give "Manager" permissions

### Step 3: Update Your Code
In `src/services/googleDriveService.ts`, replace:
```typescript
const SHARED_DRIVE_ID = 'UPDATE_WITH_REAL_SHARED_DRIVE_ID';
```
With:
```typescript
const SHARED_DRIVE_ID = 'PASTE_THE_DRIVE_ID_HERE';
```

### Step 4: Test
1. Go back to `google-drive-setup.html`
2. Click "Test Upload"
3. Verify it works

## Alternative: Manual Setup
If the automated tool doesn't work:

1. Create shared drive manually at [Google Drive](https://drive.google.com)
2. Get the drive ID from the URL
3. Follow steps 2-4 above

## What Changed
- ✅ Added `supportsAllDrives=true` to all API calls
- ✅ Created shared drive management methods
- ✅ Added automated setup tool
- ✅ Enhanced error handling and logging

## Need Help?
- Check `GOOGLE_DRIVE_TROUBLESHOOTING.md` for detailed instructions
- Use `google-drive-test.html` for basic testing
- All console logs now show detailed error information</content>
<parameter name="filePath">c:\Users\Public\ops-flow-ui-system-\SHARED_DRIVE_SETUP.md
