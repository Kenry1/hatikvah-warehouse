import React, { useEffect, useRef, useState } from 'react';
import { googleOauthDrive } from '@/services/googleOauthDrive';

// Minimal test page to sign in with Google and upload a small file to My Drive
// Use for validation before wiring into production flows.

const CLIENT_ID_PLACEHOLDER = 'PASTE_GOOGLE_OAUTH_CLIENT_ID_HERE';

export default function DriveOAuthTest() {
  const [ready, setReady] = useState(false);
  const [token, setToken] = useState<string>('');
  const envClientId = (import.meta as any).env?.VITE_GOOGLE_CLIENT_ID as string | undefined;
  const clientId = useRef<string>(envClientId || CLIENT_ID_PLACEHOLDER);

  useEffect(() => {
    (async () => {
      try {
        await googleOauthDrive.init(clientId.current);
        setReady(true);
      } catch (e: any) {
        console.error('Init error', e);
      }
    })();
  }, []);

  const signIn = async () => {
    try {
      const t = await googleOauthDrive.ensureToken(true);
      setToken(t.access_token);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const upload = async () => {
    try {
      const blob = new Blob(['hello world'], { type: 'text/plain' });
      const file = new File([blob], 'hello.txt', { type: 'text/plain' });
      const id = await googleOauthDrive.uploadFile(file, 'OAuthTest');
      alert(`Uploaded. File ID: ${id}`);
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <h2>Google Drive OAuth Test</h2>
      <p>Client ID: <code>{clientId.current}</code></p>
      {!envClientId && (
        <p style={{ color: 'crimson' }}>
          VITE_GOOGLE_CLIENT_ID is not set. Set it in a .env.local (for dev) or Vercel env vars.
        </p>
      )}
      {!ready && <p>Loading Google Identity Services…</p>}
      <button disabled={!ready} onClick={signIn}>Sign in with Google</button>
      <button disabled={!token} onClick={upload} style={{ marginLeft: 8 }}>Upload sample file</button>
      {token && (
        <div style={{ marginTop: 8 }}>
          <small>Access token acquired.</small>
        </div>
      )}
    </div>
  );
}
