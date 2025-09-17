# AI Assistant Setup

This document explains how to enable the Gemini-powered assistant.

## 1. Backend Installation
```
cd backend
npm install
```
If you previously installed dependencies, also install the new Gemini SDK:
```
npm install @google/generative-ai
```

## 2. Environment Variables
Copy `.env.example` to `.env` inside `backend/` and add your real key:
```
GEMINI_API_KEY=REPLACE_WITH_REAL_KEY
FRONTEND_URL=http://localhost:5173
```
Never hardcode the key in frontend code.

## 3. Start Backend
```
npm run dev
```
Backend runs on port 3001 by default.

## 4. Frontend Env (optional)
If backend runs on a different host/port add to project root `.env`:
```
VITE_BACKEND_URL=http://localhost:3001
```

## 5. Using the Assistant
Open the application, go to Sidebar > Assistant.

Draft Workflow Steps:
1. Site name
2. Priority (low | medium | high | urgent)
3. Items (enter one per line using `ID x QTY` or partial name + qty)
4. Notes (optional)
5. Confirm & submit

Commands:
- `ai on` / `ai off` – toggle Gemini augmentation
- `stream on` / `stream off` – toggle streaming token-by-token output
- `list` – show current draft items
- `done` – finish adding items and move to notes
- `cancel` – reset current draft (retains session)
- `submit` – write request to Firestore (role-gated)
- `end session` – mark current assistant session closed (history retained, no more persistence)
- `new session` – start a fresh session (previous one closed)

Role Gating:
- Only roles in: Site Engineer, ICT, Admin, Manager may submit requests. Others receive a permission message.

Session Persistence:
- Each authenticated user session is stored in `assistant_sessions`.
- Messages saved under `assistant_sessions/{sessionId}/messages`.
- Ending a session sets `status: closed`; a new session creates a new document.

AI Action Auto-Apply:
- When Gemini returns JSON with action `create_request`, assistant auto-fills site, priority, items, notes if missing or new.
- Duplicate materials ignored; newly added fields summarized back to user.
- AI may indicate submission intent; user must still type `submit`.

Streaming Mode:
- Uses `/api/assistant/chat/stream` for incremental output.
- Client replaces placeholder `[AI] (streaming...)` as chunks arrive.
- Action JSON (if any) is appended after stream ends inside `[ACTION_JSON]...` markers and then processed.

Material Disambiguation:
- Partial name producing multiple matches triggers a numbered list (max 8).
- User selects an item by typing its number or `cancel` to abort.
- Single match auto-adds immediately.

## 6. Action JSON
AI may emit a block parsed from `[ACTION_JSON] ... [/ACTION_JSON]` (in streaming) or returned with normal response. Shape example:
```
{ "action": "create_request", "siteName": "Site A", "priority": "high", "items": [ {"materialId": "MTR-1001", "quantity": 5 } ], "notes": "Urgent maintenance" }
```
Client applies only valid, non-conflicting updates.

## 7. Security & Rate Limiting
- Gemini route: `POST /api/assistant/chat`
- Protected by general rate limiter (100 per 15 min window). Increase or add per-user keys if needed.
- Sends optional `X-User-Id` header (frontend should include it when user is authenticated). Missing header logs a warning server-side.

## 8. Analytics
Route `/assistant/analytics` (Admin sidebar) summarizes:
- Total sessions
- Closed sessions
- Total material requests
- Average items per request

Extensible to per-user stats, token usage, and material frequency.

## 9. Troubleshooting
| Issue | Resolution |
|-------|------------|
| 500 Gemini request failed | Check GEMINI_API_KEY and network egress | 
| CORS blocked | Ensure FRONTEND_URL matches actual dev server URL | 
| AI replies lack action JSON | Model may not infer; add more explicit user confirmation |

## 10. Production Notes
- Restrict AI endpoints with auth & role middleware.
- Add per-user rate limits (tokens & requests).
- Consider caching deterministic prompts.
- Log action JSON applications for audit.
- Monitor stock decrement transaction failures.
