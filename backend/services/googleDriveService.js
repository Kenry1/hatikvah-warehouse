const { google } = require('googleapis');
const { Readable } = require('stream');

const FOLDER_ID = '1qWrBDsrm-Ghih3sfL0MsBiXx4vNLLKXx';

// Service account credentials
const credentials = {
  type: "service_account",
  project_id: "my-project-11111111111-469012",
  private_key_id: "32504cc3a6ceea6c9e818d9b5a1059cfe20d9305",
  private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDX38J1C6cKFHvX\nnT6nfnu2AOylcQeTnxhmSrXGJtE/J7dVwKShs8l6+sl6iS1ltOSN4Kqx3ZaY8f5Q\nsD68KGvp2r4gmBrWctDWEViisAYzTCJ6IVBJt1q6TK/D8pTLwY+GCKXD7dH6goae\ngo+Bhg6DK+FD0BN3Dfbp79gs31vJbE1zD5hThjf/UJL40/MHnYvcF5zTWdzIkAmQ\nArp5ET1feRPEns3P2JohQII6OLptGkuH9hLJn5Mp1yfm8KnhUrQzgseD/caerp2o\n/+kQRVChSUrXGyvPfjGng6fQJEHzRPhCWFoubP6CZ6rPKEN3l7h0coQERmaCYTTA\nkD4KV2xzAgMBAAECggEAFNc2V8RrOO7nUdaNcPAmE1kdf49c8uR+H4oA6INg2h8E\ndRPnEPFhdyz0/I53woTnN8dD024YFuXt7m5FcDbazDXg+xaUKLXm8XO1QeeKgbNM\n9Mt4i9VWvfufUGR/9vfV2lPFZRf1mKC3TGBAaHm/tuwqkDhrWKgReV49WX+qxdQw\ncOMKJzGH84bCkmXwGBwzhn75c6h1tEwUuCljB4LYhuxA4ouPNLPkpvX3FQIGT84a\n6ngHCGPEQa829PNucEXARH1plFayxnLRz11mcIJYcUhJzRnqG0qdyB6ky3OBjxRQ\ngLeKWLZSYGczojTD9N7P8ggY1YVhP/VTJBmBeBFi+QKBgQDyGNAfTdD8Beh0FARd\nC1LgkQXJqL3oWZILZMVNPrLjqbSZnSM9/332xiUnpxLifgNEdY1cCP9ELXoxrnEE\n+aULC8e1ToYApMazOBDmorL5T2algeiz19+IvVSXrHfA6il8XY/tS7+zvPnZ3Mz5\n37vM1nEZ0FkvXairfbVkfo8jvQKBgQDkRW5oDzqrpUyFnoI0G29h6IaO9pRK/ZZU\nbEw6VOA69/iuJ8nTDOFmq2Xh1rbYOVxEwKN78eqcNWURkOQs3h8shiPxzyt/sEhI\n3vCix9mYhLdEiHkv20R32HwlTAB2Flfo76pRxBn31hNiGyqGVzX+wwauJzaKewCD\nYIcH7qK77wKBgCn0/uzN8bAb3gNwDKmLctuUhqpCYldIXrU2y7LtcNdf6/rLbvYp\nt0zzXjEXFYDHUg2lSdBvhr3sG8dMci3ojh/x9LSJXVPzOrSIvPUbsWTfy+xXLVst\nyIHMPkLjEwYODw6MsIrxm9GsqKiHScbsbYG8kHFm2G4LD1ZZPPyjqm8JAoGAI0UP\nEAj6WbcKocKh/4cVqJ0S3VgABa404gpxpLmkg7f4tn/zUSa2VPS6ozBXxATo2r6h\nA++W/lfJq/MlLkGLs4duWlhWMj58jLXVnHEgj85ButcTUm+gnpvWYrThhV1ia91M\nBaI1GPP8vrXP1j33W8uqZpIsfS0QITxy4KjggAUCgYBvElBnVlVdjd4/zwwIMZIi\ngPamMFydqIFv55g2owURlsT9hz37+opqU17MspXw7vQaC4ko9zqpUCtbjG7LDhkh\nFLBPzEDNAIh9dpyD84fhWPK06QKDcr3Tt6FbAQEj8upiZPhZk2Cini6B+zCzHs+7\n9Mhhe/1nmnIdDMeHG4b5Ag==\n-----END PRIVATE KEY-----\n",
  client_email: "drive-uploader@my-project-11111111111-469012.iam.gserviceaccount.com",
  client_id: "108102461865001066508",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/drive-uploader%40my-project-11111111111-469012.iam.gserviceaccount.com",
  universe_domain: "googleapis.com"
};

class GoogleDriveService {
  constructor() {
    this.drive = null;
    this.initializeDrive();
  }

  async initializeDrive() {
    try {
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/drive.file'],
      });

      this.drive = google.drive({ version: 'v3', auth });
      console.log('✅ Google Drive service initialized');
    } catch (error) {
      console.error('❌ Error initializing Google Drive:', error);
      throw error;
    }
  }

  async uploadFile(file, metadata) {
    try {
      if (!this.drive) {
        await this.initializeDrive();
      }

      // Convert buffer to readable stream
      const stream = Readable.from(file.buffer);

      // Create file metadata
      const fileMetadata = {
        name: `${metadata.title}_${new Date().toISOString().split('T')[0]}_${file.originalname}`,
        parents: [FOLDER_ID],
      };

      // Determine MIME type
      const mimeType = file.mimetype || 'application/octet-stream';

      console.log(`📤 Uploading ${file.originalname} to Google Drive...`);

      // Upload file
      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: {
          mimeType,
          body: stream,
        },
      });

      console.log(`✅ File uploaded successfully: ${response.data.id}`);
      return response.data.id;
    } catch (error) {
      console.error('❌ Error uploading file to Google Drive:', error);
      throw error;
    }
  }

  async getFileUrl(fileId) {
    try {
      if (!this.drive) {
        await this.initializeDrive();
      }

      // Make file publicly accessible
      await this.drive.permissions.create({
        fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });

      const fileUrl = `https://drive.google.com/file/d/${fileId}/view`;
      console.log(`🔗 Public URL generated: ${fileUrl}`);
      return fileUrl;
    } catch (error) {
      console.error('❌ Error getting file URL:', error);
      throw error;
    }
  }

  async deleteFile(fileId) {
    try {
      if (!this.drive) {
        await this.initializeDrive();
      }

      await this.drive.files.delete({
        fileId,
      });

      console.log(`🗑️ File deleted from Google Drive: ${fileId}`);
      return true;
    } catch (error) {
      console.error('❌ Error deleting file from Google Drive:', error);
      throw error;
    }
  }
}

const googleDriveService = new GoogleDriveService();

module.exports = { googleDriveService };
