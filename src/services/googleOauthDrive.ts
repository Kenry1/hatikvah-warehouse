// Simple Google Drive client using Google Identity Services (OAuth) for browser
// Uploads to the signed-in user's My Drive (avoids service-account quota issues)

export type GApiToken = {
  access_token: string;
  expires_in: number;
  token_type: string;
  scope?: string;
};

class GoogleOauthDriveClient {
  private token: GApiToken | null = null;
  private client: any | null = null;

  init(clientId: string, scopes = 'https://www.googleapis.com/auth/drive.file') {
    return new Promise<void>((resolve, reject) => {
      if (!clientId) {
        reject(new Error('Missing VITE_GOOGLE_CLIENT_ID. Set it in your env and reload.'));
        return;
      }
      const ensureScript = () => {
        // @ts-ignore - injected by Google Identity Services
        if ((window as any).google && (window as any).google.accounts) return resolve();
        const s = document.createElement('script');
        s.src = 'https://accounts.google.com/gsi/client';
        s.async = true;
        s.defer = true;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error('Failed to load Google Identity Services'));
        document.head.appendChild(s);
      };
      ensureScript();
    }).then(() => {
      this.client = (window as any).google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: scopes,
        callback: (t: any) => {
          // Default callback in case requestAccessToken is called without overriding
          if (t && t.access_token) {
            this.token = t as GApiToken;
          } else if (t && t.error) {
            console.error('OAuth error:', t);
          }
        },
      });
    });
  }

  async ensureToken(prompt = true) {
    if (this.token) return this.token;
    if (!this.client) throw new Error('OAuth client not initialized');

    const client = this.client;
    const promptValue = prompt ? 'consent' : '';

    const token = await new Promise<GApiToken>((resolve, reject) => {
      const prev = client.callback;
      client.callback = (t: any) => {
        // Restore original callback
        client.callback = prev;
        if (t && t.access_token) {
          const tok = t as GApiToken;
          this.token = tok;
          resolve(tok);
        } else if (t && t.error) {
          const msg = `${t.error}${t.error_description ? ': ' + t.error_description : ''}`;
          reject(new Error(msg));
        } else {
          reject(new Error('No access token received'));
        }
      };
      try {
        client.requestAccessToken({ prompt: promptValue });
      } catch (e) {
        client.callback = prev;
        reject(e as Error);
      }
    });

    return token;
  }

  signOut() {
    this.token = null;
  }

  async uploadFile(file: File, title = 'Upload') {
    await this.ensureToken();
    const name = `${title}_${new Date().toISOString().split('T')[0]}_${file.name}`;

    // Multipart upload to user's My Drive
    const metadata = { name };
    const base64Data = await this.fileToBase64(file);
    const boundary = 'boundary123';
    const body = `--${boundary}\r\n` +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) + '\r\n' +
      `--${boundary}\r\n` +
      `Content-Type: ${file.type || 'application/octet-stream'}\r\n` +
      'Content-Transfer-Encoding: base64\r\n\r\n' +
      base64Data + '\r\n' +
      `--${boundary}--`;

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token!.access_token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body,
    });
    if (!res.ok) {
      let details: any;
      try { details = await res.json(); } catch { details = await res.text(); }
      throw new Error(`Upload failed: ${res.status} ${JSON.stringify(details)}`);
    }
    const data = await res.json();
    return data.id as string;
  }

  async makeFilePublic(fileId: string) {
    await this.ensureToken(false);
    const url = `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}/permissions`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token!.access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ role: 'reader', type: 'anyone' }),
    });
    if (!res.ok) {
      let details: any;
      try { details = await res.json(); } catch { details = await res.text(); }
      throw new Error(`Permission failed: ${res.status} ${JSON.stringify(details)}`);
    }
    return true;
  }

  getFileUrl(fileId: string) {
    return `https://drive.google.com/file/d/${fileId}/view`;
  }

  private fileToBase64(file: File) {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(String(reader.result).split(',')[1]);
      reader.onerror = reject;
    });
  }
}

export const googleOauthDrive = new GoogleOauthDriveClient();
