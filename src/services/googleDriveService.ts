// Google Drive configuration
const FOLDER_ID = '1PDBvRJmFNjukjdmxU0lcz2NopEZSaBHQ'; // Current folder ID - may need to be updated for "SWIISH" folder
const FOLDER_NAME = 'SWIISH'; // Target folder name

// Alternative: Upload to root directory if folder access fails
// IMPORTANT: Keep this false for service accounts to avoid My Drive quota errors
const UPLOAD_TO_ROOT = false;

// ⚠️ SECURITY WARNING: Service account credentials exposed in frontend
const SERVICE_ACCOUNT_EMAIL = "drive-uploader@sunlit-cab-471213-k9.iam.gserviceaccount.com";
const PRIVATE_KEY = "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC8O1zyK6865qNQ\nvUfZaZKQFzsjbSiJkIAmSHl4dFdXs5E42nJ0lueS8HQeq0ebf0fZGpnYvKIECebn\n1nsSmNNmA+lWf24jQDrQ0BaxbuAgedFprhsd7vRgijRRWg8FY0XdQXzvjXsMiqRw\ncefyzE0sFsarbs30+8a8709sFT42n885nbaW/3ivoTqUBm8tfM5hcQMAQlaP2rUl\nxHFpZ7QaJ4Rpn0CB3cUvhC62OsbZCjj1Fv4Ss3keQHclBpCXR03qcPhKqWrwTO4q\naQCfArQmLiBk0zHVLvqUu/kMUbtDb8W4/jcI6Lo3bUXCPl1j6GQZ8n3/u89Lhr18\nSouh1d7LAgMBAAECggEAOKGtmai9/D0m1qRUCRvjvhlXMBXn89d3Ts1QSobKPncm\nkpHajKxYONPCQ/XpQeXd8no33kcGgauO/qJ/fb1gINm9aspFEzMAXxG0OibvJKYx\n9Jcuzmc1vBPooK81RLw06VgKJDKPWlseFTyX+eswrrqdhDd+nJ3hkbd4UD7l7F3N\nOkzq8MvbxCtUyNS6jAjqoZJcpwL4GUdus821LyuXSiRP704F3KMbcyfIZ3zZxf+L\nbb2pKQhOELQiutziGl2BXqyWS/tCLVHoEjX615k559e4bUEhobCPphpRpDkNaQ+B\nKixwVvzNa76Kgx/RMQeYqnJAmx9J2l8ofJzh2XQQTQKBgQDjPwdXl50GszFHi6ha\nIgCzkjU2Gs7jOjb5q2Db80xG/mhG4ZLPbw88RuUGGHhcHQ1ADSnNSQx/LlQgY4Vh\nexWqhN4Opq9O0dVOF2N78RQvy3hnO1r35lg3h0QospzsB3Ona8rJtfMs5Z+kj4DH\n7NsWqXe+Yzmy+P3BzF//C8r8LQKBgQDUDJSaKqeAyxRlxxzhlpiF8S3DLgvIgJnp\nH+cFdtL6umps5LEvjqSLnmmBB5VwZ05uV/CHUcpAPFPtf+KV+xW4jq+0JehVYZjJ\nSd6FoE4EKx4bMyyI3H9Tzw0AudouMynqEtUsiAo5B+BV3c4xJp9jmfm4B9s1n/zD\nrgdhGAiJ1wKBgFyRKCR+FfDMvZ4vPXy5rR94x0Qq12uoIwzAysvN55xjtYZqDKuC\nyen71v8MqLqc+vDEa+q7fuOvs4UeBQ8YXFMBnJLLQ04QG5ub22J5aYeuknU6sGua\n4QR9jT4mw9VBk9L3Dbvs6gm337fg3MyTpwssLSLYuIA2/OccoV37J8xhAoGBAKcZ\nxtz6cgdXgZp23zaSk10x4ssldRmq5h7FCivPKJF257kqOsrsUJTJ4ABTNptefXsN\nB7nLZWNbZxQIrElelQ5cOu/u03i9MUamVJne6rv0MoRivlyXzisARhHlY572qLgR\n4TV3ev7YSxu/b+ZhtkcqJpS0dDV8/xZBBQWph8j/AoGAPw4nv/nRqzWhZBhizTlb\ndMmO2FGveHc6Lu2b3Mzzul8+IffK4vzgowDT4pir/Eg9OeEQREL9Qj3OijaaElG1\nwiMlgwn17HpL1divn7058SdMgTCyWgyiGVJ2YCj2TyIAo15++p/CUKfPShga0+nL\nxRII8HpcX/O7V4hO6hvzy6o=\n-----END PRIVATE KEY-----\n";

// Shared Drive configuration
const SHARED_DRIVE_ID = '1PDBvRJmFNjukjdmxU0lcz2NopEZSaBHQ'; // Updated with the provided Drive ID
const USE_SHARED_DRIVE = true; // Enabled since we have a shared drive

class GoogleDriveService {
  private accessToken: string | null = null;

  async initializeDrive() {
    try {
      // Generate JWT for service account authentication
      const jwt = await this.generateJWT();

      console.log('🔐 Generated JWT:', jwt.substring(0, 50) + '...');

      // Exchange JWT for access token
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
          assertion: jwt,
        }),
      });

      if (!tokenResponse.ok) {
        const errorText = await tokenResponse.text();
        console.error('❌ Token response error:', errorText);
        throw new Error(`Token request failed: ${tokenResponse.status} - ${errorText}`);
      }

      const tokenData = await tokenResponse.json();
      this.accessToken = tokenData.access_token;

      console.log('✅ Google Drive service initialized (Frontend - ⚠️ SECURITY RISK)');
      console.log('🔑 Access token obtained:', this.accessToken ? 'Yes' : 'No');
    } catch (error) {
      console.error('❌ Error initializing Google Drive:', error);
      throw error;
    }
  }

  private async generateJWT(): Promise<string> {
    const header = {
      alg: 'RS256',
      typ: 'JWT',
    };

    const now = Math.floor(Date.now() / 1000);
    const payload = {
      iss: SERVICE_ACCOUNT_EMAIL,
      scope: 'https://www.googleapis.com/auth/drive',
      aud: 'https://oauth2.googleapis.com/token',
      exp: now + 3600, // 1 hour
      iat: now,
    };

    // Base64 encode header and payload
    const encodedHeader = btoa(JSON.stringify(header)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const encodedPayload = btoa(JSON.stringify(payload)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

    const message = `${encodedHeader}.${encodedPayload}`;

    // Sign the message with private key
    const signature = await this.signMessage(message, PRIVATE_KEY);

    return `${message}.${signature}`;
  }

  private async signMessage(message: string, privateKey: string): Promise<string> {
    try {
      // Clean and format the private key for PKCS8
      const keyData = privateKey
        .replace(/-----BEGIN PRIVATE KEY-----/, '')
        .replace(/-----END PRIVATE KEY-----/, '')
        .replace(/\s/g, '');

      console.log('🔐 Private key length:', keyData.length);

      // Convert base64 to binary
      const binaryKey = Uint8Array.from(atob(keyData), c => c.charCodeAt(0));

      console.log('🔐 Binary key length:', binaryKey.length);

      const cryptoKey = await crypto.subtle.importKey(
        'pkcs8',
        binaryKey,
        {
          name: 'RSASSA-PKCS1-v1_5',
          hash: 'SHA-256',
        },
        false,
        ['sign']
      );

      const signature = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, new TextEncoder().encode(message));

      const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signature)))
        .replace(/=/g, '')
        .replace(/\+/g, '-')
        .replace(/\//g, '_');

      console.log('🔐 Signature generated successfully');
      return signatureB64;
    } catch (error) {
      console.error('❌ Error in signMessage:', error);
      throw error;
    }
  }

  async uploadFile(file: File, metadata: any) {
    try {
      if (!this.accessToken) {
        await this.initializeDrive();
      }

      // Convert file to base64
      const base64Data = await this.fileToBase64(file);

      // Create file metadata
      const fileMetadata: any = {
        name: `${metadata.title}_${new Date().toISOString().split('T')[0]}_${file.name}`,
      };

      // Only add parents if not uploading to root
      if (!UPLOAD_TO_ROOT) {
        if (USE_SHARED_DRIVE) {
          fileMetadata.parents = [SHARED_DRIVE_ID];
        } else {
          fileMetadata.parents = [FOLDER_ID];
        }
      }

      console.log(`📤 Uploading ${file.name} to Google Drive...`);
      console.log('📁 Upload destination:', UPLOAD_TO_ROOT ? 'Root Directory' : 
        (USE_SHARED_DRIVE ? `Shared Drive: ${FOLDER_NAME} (ID: ${SHARED_DRIVE_ID})` : `${FOLDER_NAME} (ID: ${FOLDER_ID})`));
      console.log('🔑 Using access token:', this.accessToken ? 'Present' : 'Missing');

      // Try resumable upload first (most reliable for browsers)
      try {
        console.log('🔄 Attempting resumable upload...');
        return await this.uploadFileResumable(file, metadata);
      } catch (resumableError) {
        console.log('🔄 Resumable upload failed, trying simple upload...');
        console.error('Resumable upload error:', resumableError);
      }

      // Try simple upload as second option
      try {
        console.log('🔄 Attempting simple upload...');
        return await this.uploadFileSimple(file, metadata);
      } catch (simpleError) {
        console.log('🔄 Simple upload failed, trying multipart upload...');
        console.error('Simple upload error:', simpleError);
      }

      // Fallback to multipart upload
      console.log('🔄 Using multipart upload as final fallback...');
  const uploadUrl = `https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true`;
      
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'multipart/related; boundary=boundary123',
        },
        body: this.createMultipartBody(fileMetadata, base64Data, file.type),
      });

      console.log('📡 Upload response status:', uploadResponse.status);

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('❌ Upload response error:', errorText);
        console.error('❌ Response status:', uploadResponse.status);
        console.error('❌ Response headers:', Object.fromEntries(uploadResponse.headers.entries()));

        // If folder access denied, try uploading to root
        if (uploadResponse.status === 403 && !UPLOAD_TO_ROOT) {
          console.log('🔄 Folder access denied, trying upload to root directory...');
          return await this.uploadFileToRoot(file, metadata);
        }

        throw new Error(`Upload failed: ${uploadResponse.status} ${uploadResponse.statusText} - ${errorText}`);
      }

      const uploadResult = await uploadResponse.json();
      console.log(`✅ File uploaded successfully: ${uploadResult.id}`);

      return uploadResult.id;
    } catch (error) {
      console.error('❌ Error uploading file to Google Drive:', error);
      throw error;
    }
  }

  async getFileUrl(fileId: string) {
    try {
      if (!this.accessToken) {
        await this.initializeDrive();
      }

      // Make file publicly accessible
      const permissionUrl = USE_SHARED_DRIVE 
        ? `https://www.googleapis.com/drive/v3/files/${fileId}/permissions?supportsAllDrives=true`
        : `https://www.googleapis.com/drive/v3/files/${fileId}/permissions`;
      
      const permissionResponse = await fetch(permissionUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: 'reader',
          type: 'anyone',
        }),
      });

      if (!permissionResponse.ok) {
        throw new Error(`Permission update failed: ${permissionResponse.status}`);
      }

      const fileUrl = `https://drive.google.com/file/d/${fileId}/view`;
      console.log(`🔗 Public URL generated: ${fileUrl}`);
      return fileUrl;
    } catch (error) {
      console.error('❌ Error getting file URL:', error);
      throw error;
    }
  }

  private createMultipartBody(metadata: any, base64Data: string, mimeType: string): string {
    const boundary = 'boundary123';
    const metadataPart = JSON.stringify(metadata);

    return `--${boundary}\r\n` +
           `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
           `${metadataPart}\r\n` +
           `--${boundary}\r\n` +
           `Content-Type: ${mimeType}\r\n` +
           `Content-Transfer-Encoding: base64\r\n\r\n` +
           `${base64Data}\r\n` +
           `--${boundary}--`;
  }

  async testAuthentication() {
    try {
      console.log('🧪 Testing Google Drive authentication...');
      console.log('📧 Service Account:', SERVICE_ACCOUNT_EMAIL);
      console.log('📁 Upload destination:', UPLOAD_TO_ROOT ? 'Root Directory' : 
        (USE_SHARED_DRIVE ? `Shared Drive: ${FOLDER_NAME} (ID: ${SHARED_DRIVE_ID})` : `${FOLDER_NAME} (ID: ${FOLDER_ID})`));

      if (!this.accessToken) {
        await this.initializeDrive();
      }

      // Test basic Drive API access
      const testUrl = USE_SHARED_DRIVE 
        ? 'https://www.googleapis.com/drive/v3/files?pageSize=1&supportsAllDrives=true'
        : 'https://www.googleapis.com/drive/v3/files?pageSize=1';
      
      const testResponse = await fetch(testUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      console.log('🧪 Basic API test response status:', testResponse.status);

      if (testResponse.ok) {
        console.log('✅ Basic authentication test passed');
        return true;
      } else {
        const errorText = await testResponse.text();
        console.error('❌ Basic authentication test failed:', errorText);
        return false;
      }
    } catch (error) {
      console.error('❌ Authentication test error:', error);
      return false;
    }
  }

  async testBasicDriveAccess() {
    try {
      console.log('🧪 Testing basic Google Drive API access...');

      if (!this.accessToken) {
        await this.initializeDrive();
      }

      // Test basic Drive API access with different endpoints
      const endpoints = [
        USE_SHARED_DRIVE ? 'https://www.googleapis.com/drive/v3/about?fields=user&supportsAllDrives=true' : 'https://www.googleapis.com/drive/v3/about?fields=user',
        USE_SHARED_DRIVE ? 'https://www.googleapis.com/drive/v3/files?pageSize=1&supportsAllDrives=true' : 'https://www.googleapis.com/drive/v3/files?pageSize=1',
        USE_SHARED_DRIVE ? 'https://www.googleapis.com/drive/v3/files/generateIds?count=1&supportsAllDrives=true' : 'https://www.googleapis.com/drive/v3/files/generateIds?count=1'
      ];

      for (const endpoint of endpoints) {
        console.log(`🧪 Testing endpoint: ${endpoint}`);
        const response = await fetch(endpoint, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
          },
        });

        console.log(`🧪 ${endpoint} - Status: ${response.status}`);

        if (response.ok) {
          const data = await response.json();
          console.log(`✅ ${endpoint} - Success:`, data);
        } else {
          const errorText = await response.text();
          console.error(`❌ ${endpoint} - Error:`, errorText);
        }
      }

      return true;
    } catch (error) {
      console.error('❌ Basic Drive access test error:', error);
      return false;
    }
  }

  private async uploadFileToRoot(file: File, metadata: any) {
    try {
      // Convert file to base64
      const base64Data = await this.fileToBase64(file);

      // Create file metadata (no parents = root directory)
      const fileMetadata = {
        name: `${metadata.title}_${new Date().toISOString().split('T')[0]}_${file.name}`,
      };

      console.log(`📤 Uploading ${file.name} to Google Drive root directory...`);

      // Upload file using Google Drive REST API
  const uploadUrl = 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true';
      
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'multipart/related; boundary=boundary123',
        },
        body: this.createMultipartBody(fileMetadata, base64Data, file.type),
      });

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('❌ Root upload response error:', errorText);
        console.error('❌ Root response status:', uploadResponse.status);
        console.error('❌ Root response headers:', Object.fromEntries(uploadResponse.headers.entries()));
        throw new Error(`Root upload failed: ${uploadResponse.status} ${uploadResponse.statusText} - ${errorText}`);
      }

      const uploadResult = await uploadResponse.json();
      console.log(`✅ File uploaded to root successfully: ${uploadResult.id}`);

      return uploadResult.id;
    } catch (error) {
      console.error('❌ Error uploading file to root:', error);
      throw error;
    }
  }

  async uploadFileSimple(file: File, metadata: any) {
    try {
      if (!this.accessToken) {
        await this.initializeDrive();
      }

      console.log(`📤 Simple upload: ${file.name} to Google Drive...`);

      // Create file metadata
      const fileMetadata = {
        name: `${metadata.title}_${new Date().toISOString().split('T')[0]}_${file.name}`,
      };

      // Convert file to base64
      const base64Data = await this.fileToBase64(file);

      // Simple upload using media upload
      const uploadUrl = USE_SHARED_DRIVE 
        ? 'https://www.googleapis.com/upload/drive/v3/files?uploadType=media&supportsAllDrives=true'
        : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=media';
      
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': file.type || 'application/octet-stream',
          'Content-Length': file.size.toString(),
        },
        body: file, // Send the raw file instead of base64
      });

      console.log('📡 Simple upload response status:', uploadResponse.status);

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('❌ Simple upload response error:', errorText);
        throw new Error(`Simple upload failed: ${uploadResponse.status} ${uploadResponse.statusText} - ${errorText}`);
      }

      const uploadResult = await uploadResponse.json();
      console.log(`✅ File uploaded successfully: ${uploadResult.id}`);

      return uploadResult.id;
    } catch (error) {
      console.error('❌ Error in simple upload:', error);
      throw error;
    }
  }

  async testUploadEndpoint() {
    try {
      console.log('🧪 Testing upload endpoint specifically...');

      if (!this.accessToken) {
        await this.initializeDrive();
      }

      // Test the upload endpoint with a minimal request
      const testUrl = USE_SHARED_DRIVE 
        ? 'https://www.googleapis.com/upload/drive/v3/files?uploadType=media&supportsAllDrives=true'
        : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=media';
      
      const testResponse = await fetch(testUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'text/plain',
          'Content-Length': '0',
        },
        body: '', // Empty body for testing
      });

      console.log('🧪 Upload endpoint test status:', testResponse.status);

      if (testResponse.ok) {
        console.log('✅ Upload endpoint accessible');
        return true;
      } else {
        const errorText = await testResponse.text();
        console.error('❌ Upload endpoint error:', errorText);
        console.error('❌ Upload endpoint status:', testResponse.status);
        console.error('❌ Upload endpoint headers:', Object.fromEntries(testResponse.headers.entries()));
        return false;
      }
    } catch (error) {
      console.error('❌ Upload endpoint test error:', error);
      return false;
    }
  }

  async setupSharedDrive() {
    try {
      console.log('🚀 Setting up shared drive for file uploads...');

      // Step 1: Create the shared drive
      console.log('📁 Creating shared drive "SWIISH"...');
      const driveData = await this.createSharedDrive('SWIISH');
      console.log('✅ Shared drive created:', driveData.id);

      // Step 2: Update the configuration (this would need to be done manually or through environment)
      console.log('⚠️  IMPORTANT: Update SHARED_DRIVE_ID in googleDriveService.ts with:', driveData.id);
      console.log('⚠️  Current SHARED_DRIVE_ID should be replaced with:', driveData.id);

      // Step 3: Instructions for sharing
      console.log('📧 Next steps:');
      console.log('1. Go to https://drive.google.com');
      console.log('2. Find the shared drive "SWIISH"');
      console.log('3. Click Share and add the service account as Manager:');
      console.log('   drive-uploader@my-project-11111111111-469012.iam.gserviceaccount.com');
      console.log('4. Update SHARED_DRIVE_ID in the code with:', driveData.id);

      return driveData;
    } catch (error) {
      console.error('❌ Error setting up shared drive:', error);
      throw error;
    }
  }

  async uploadFileResumable(file: File, metadata: any) {
    try {
      if (!this.accessToken) {
        await this.initializeDrive();
      }

      console.log(`📤 Resumable upload: ${file.name} to Google Drive...`);

      // Step 1: Initiate resumable upload
      const initiateUrl = USE_SHARED_DRIVE 
        ? 'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&supportsAllDrives=true'
        : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable';
      
      const initiateResponse = await fetch(initiateUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          'X-Upload-Content-Type': file.type || 'application/octet-stream',
          'X-Upload-Content-Length': file.size.toString(),
        },
        body: JSON.stringify({
          name: `${metadata.title}_${new Date().toISOString().split('T')[0]}_${file.name}`,
        }),
      });

      if (!initiateResponse.ok) {
        const errorText = await initiateResponse.text();
        console.error('❌ Resumable upload initiation failed:', errorText);
        throw new Error(`Resumable upload initiation failed: ${initiateResponse.status}`);
      }

      const uploadUrl = initiateResponse.headers.get('Location');
      if (!uploadUrl) {
        throw new Error('No upload URL received from Google Drive');
      }

      console.log('📡 Upload URL received:', uploadUrl);

      // Step 2: Upload the file data
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
          'Content-Length': file.size.toString(),
        },
        body: file,
      });

      console.log('📡 File upload response status:', uploadResponse.status);

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text();
        console.error('❌ File upload failed:', errorText);
        throw new Error(`File upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`);
      }

      const uploadResult = await uploadResponse.json();
      console.log(`✅ File uploaded successfully: ${uploadResult.id}`);

      return uploadResult.id;
    } catch (error) {
      console.error('❌ Error in resumable upload:', error);
      throw error;
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = reader.result as string;
        // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64Data = base64.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  }

  async createSharedDrive(driveName: string) {
    try {
      if (!this.accessToken) {
        await this.initializeDrive();
      }

      console.log(`📁 Creating shared drive: ${driveName}`);

      const createDriveResponse = await fetch('https://www.googleapis.com/drive/v3/drives', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: driveName,
        }),
      });

      console.log('📡 Create shared drive response status:', createDriveResponse.status);

      if (!createDriveResponse.ok) {
        const errorText = await createDriveResponse.text();
        console.error('❌ Create shared drive response error:', errorText);
        console.error('❌ Create shared drive response status:', createDriveResponse.status);
        console.error('❌ Create shared drive response headers:', Object.fromEntries(createDriveResponse.headers.entries()));
        throw new Error(`Create shared drive failed: ${createDriveResponse.status} ${createDriveResponse.statusText} - ${errorText}`);
      }

      const driveData = await createDriveResponse.json();
      console.log(`✅ Shared drive created successfully: ${driveData.id}`);

      return driveData;
    } catch (error) {
      console.error('❌ Error creating shared drive:', error);
      throw error;
    }
  }

  async listSharedDrives() {
    try {
      if (!this.accessToken) {
        await this.initializeDrive();
      }

      console.log('📋 Listing shared drives...');

      const listDrivesResponse = await fetch('https://www.googleapis.com/drive/v3/drives', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      console.log('📡 List shared drives response status:', listDrivesResponse.status);

      if (!listDrivesResponse.ok) {
        const errorText = await listDrivesResponse.text();
        console.error('❌ List shared drives response error:', errorText);
        throw new Error(`List shared drives failed: ${listDrivesResponse.status} ${listDrivesResponse.statusText} - ${errorText}`);
      }

      const drivesData = await listDrivesResponse.json();
      console.log(`✅ Found ${drivesData.drives?.length || 0} shared drives`);

      return drivesData.drives || [];
    } catch (error) {
      console.error('❌ Error listing shared drives:', error);
      throw error;
    }
  }

  async getSharedDrive(driveId: string) {
    try {
      if (!this.accessToken) {
        await this.initializeDrive();
      }

      console.log(`📁 Getting shared drive details: ${driveId}`);

      const getDriveResponse = await fetch(`https://www.googleapis.com/drive/v3/drives/${driveId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
        },
      });

      console.log('📡 Get shared drive response status:', getDriveResponse.status);

      if (!getDriveResponse.ok) {
        const errorText = await getDriveResponse.text();
        console.error('❌ Get shared drive response error:', errorText);
        throw new Error(`Get shared drive failed: ${getDriveResponse.status} ${getDriveResponse.statusText} - ${errorText}`);
      }

      const driveData = await getDriveResponse.json();
      console.log(`✅ Shared drive details retrieved: ${driveData.name}`);

      return driveData;
    } catch (error) {
      console.error('❌ Error getting shared drive details:', error);
      throw error;
    }
  }
}

export const googleDriveService = new GoogleDriveService();
