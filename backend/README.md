# Site Documentation Backend

This is the backend server for the Site Documentation system with Google Drive integration.

## Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

   Or for development with auto-restart:
   ```bash
   npm run dev
   ```

The server will run on `http://localhost:3001`

## Features

- File upload to Google Drive
- Secure authentication with Google Service Account
- CORS enabled for frontend communication
- Rate limiting for security
- File type and size validation
- Public file sharing links

## API Endpoints

### POST /api/upload
Upload a file to Google Drive.

**Request:**
- Content-Type: multipart/form-data
- Body:
  - `file`: The file to upload
  - `siteId`: Site ID (optional)
  - `siteName`: Site name (optional)
  - `uploadDate`: Upload date (ISO string)
  - `uploader`: Uploader name

**Response:**
```json
{
  "success": true,
  "fileId": "google-drive-file-id",
  "fileUrl": "https://drive.google.com/file/d/.../view"
}
```

## Google Drive Configuration

The server is configured to upload files to a specific Google Drive folder. Make sure your Google Service Account has the necessary permissions to:
- Create files in the target folder
- Set file permissions to public

## Security

- Files are validated for type and size
- Rate limiting is implemented
- CORS is configured for the frontend domain
- Google Service Account credentials are used for secure authentication
