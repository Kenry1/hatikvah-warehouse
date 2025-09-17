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
- Gemini AI assistant endpoints (chat + streaming)

## API Endpoints
### POST /api/assistant/chat
Non‑streaming Gemini assistant response.

Request body:
```json
{ "messages": [ { "role": "user", "content": "Need 5 bolts" } ] }
```
Response body:
```json
{ "reply": "...", "action": {"action":"create_request", ...}, "model": "gemini-1.5-flash-latest" }
```

### POST /api/assistant/chat/stream
Streaming variant returning plain text chunks; optional action JSON is appended inside `[ACTION_JSON]...[/ACTION_JSON]` markers at the end.

Client should read incrementally and parse the markers after completion.


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
- Gemini API key is loaded from `backend/.env` (`GEMINI_API_KEY`) and never sent to the client

## Gemini Assistant Setup

1. Create / copy `backend/.env` from `.env.example`.
2. Set:
   ```env
   GEMINI_API_KEY=your-key-here
   GEMINI_MODEL=gemini-1.5-flash-latest
   ```
3. Restart server.
4. (Optional) Hit health check:
   ```bash
   curl http://localhost:3001/api/health
   ```
5. Test chat endpoint:
   ```bash
   curl -X POST http://localhost:3001/api/assistant/chat \
     -H "Content-Type: application/json" \
     -d '{"messages":[{"role":"user","content":"Hello"}]}'
   ```

## Notes
- Keep prompts concise to reduce token usage.
- Use streaming for faster perceived latency.
- Rotate the API key if it becomes exposed.
