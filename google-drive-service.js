// Google Drive Service for File Uploads
class GoogleDriveService {
  // Static properties
  static API_KEY = 'AIzaSyDwdhYLJYXExCD2281VE-tTuXSDfw0b2fU';
  static CLIENT_ID = '556445572871-lu6ne90jotsh6dsckvmslgoaokd9jldm.apps.googleusercontent.com';
  static DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'];
  static SCOPES = 'https://www.googleapis.com/auth/drive.file';
  
  // Static instance variables
  static tokenClient = null;
  static gapiInited = false;
  static gisInited = false;
  static initialized = false;

  // Check if Google APIs are loaded
  static checkAPIsLoaded() {
    if (typeof gapi === 'undefined') {
      throw new Error('Google API (gapi) not loaded. Please check if the Google API script is included.');
    }
    if (typeof google === 'undefined' || typeof google.accounts === 'undefined') {
      throw new Error('Google Identity Services not loaded. Please check if the Google Identity script is included.');
    }
    return true;
  }

  // Initialize Google APIs
  static async initialize() {
    try {
      console.log('Starting Google Drive initialization...');
      
      // Check if APIs are loaded
      this.checkAPIsLoaded();
      
      // Load the Google API client
      await new Promise((resolve, reject) => {
        if (gapi.client) {
          console.log('Google API client already loaded');
          resolve();
        } else {
          console.log('Loading Google API client...');
          gapi.load('client', resolve);
        }
      });

      // Initialize the client
      await gapi.client.init({
        apiKey: this.API_KEY,
        discoveryDocs: this.DISCOVERY_DOCS,
      });

      this.gapiInited = true;
      console.log('Google API initialized successfully');

      // Initialize Google Identity Services with better configuration
      this.tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: this.CLIENT_ID,
        scope: this.SCOPES,
        callback: '', // Will be set later
        prompt: 'consent',
        access_type: 'offline',
        include_granted_scopes: true,
        redirect_uri: window.location.origin + window.location.pathname
      });

      this.gisInited = true;
      this.initialized = true;
      console.log('Google Identity Services initialized successfully');

      return true;
    } catch (error) {
      console.error('Error initializing Google Drive:', error);
      this.initialized = false;
      return false;
    }
  }

  // Get authorization token with better error handling
  static async getAuthToken() {
    if (!this.initialized) {
      throw new Error('Google Drive Service not initialized. Please call initialize() first.');
    }

    return new Promise((resolve, reject) => {
      if (!this.gisInited) {
        reject(new Error('Google Identity Services not initialized'));
        return;
      }

      this.tokenClient.callback = (resp) => {
        if (resp.error) {
          console.error('OAuth error:', resp.error);
          if (resp.error === 'access_denied') {
            reject(new Error('Access denied. Please make sure you have the correct OAuth configuration in Google Cloud Console. Check that your redirect URIs include: ' + window.location.origin + window.location.pathname));
          } else {
            reject(new Error(`OAuth error: ${resp.error}`));
          }
        } else {
          console.log('OAuth successful, access token obtained');
          resolve(resp.access_token);
        }
      };

      // Check if we already have a valid token
      const currentToken = gapi.client.getToken();
      if (currentToken && currentToken.access_token) {
        console.log('Using existing token');
        resolve(currentToken.access_token);
      } else {
        console.log('Requesting new access token...');
        this.tokenClient.requestAccessToken({ prompt: 'consent' });
      }
    });
  }

  // Upload file to Google Drive
  static async uploadFile(file, onProgress = null) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      console.log('Starting Google Drive upload for file:', file.name);
      
      // Check file size (limit to 10MB for Google Drive)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size too large. Please upload a file smaller than 10MB.');
      }

      // Get authorization token
      const token = await this.getAuthToken();
      console.log('Authorization token obtained');
      
      // Create file metadata
      const metadata = {
        name: `${Date.now()}_${file.name}`,
        mimeType: file.type,
        parents: ['root'], // Upload to root folder
      };

      console.log('Uploading file with metadata:', metadata);

      // Create FormData for upload
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      // Upload to Google Drive
      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: form,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Upload response error:', errorData);
        throw new Error(`Upload failed: ${errorData.error?.message || response.statusText}`);
      }

      const result = await response.json();
      console.log('File uploaded to Google Drive:', result);

      // Get the file URL
      const fileUrl = `https://drive.google.com/file/d/${result.id}/view?usp=sharing`;
      
      return {
        id: result.id,
        name: result.name,
        url: fileUrl,
        downloadUrl: `https://drive.google.com/uc?export=download&id=${result.id}`,
        size: file.size,
        mimeType: file.type
      };

    } catch (error) {
      console.error('Error uploading to Google Drive:', error);
      throw error;
    }
  }

  // Delete file from Google Drive
  static async deleteFile(fileId) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const token = await this.getAuthToken();
      
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete file from Google Drive');
      }

      console.log('File deleted from Google Drive:', fileId);
      return true;
    } catch (error) {
      console.error('Error deleting from Google Drive:', error);
      throw error;
    }
  }

  // Get file info from Google Drive
  static async getFileInfo(fileId) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      const token = await this.getAuthToken();
      
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,size,mimeType,webViewLink,webContentLink`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get file info from Google Drive');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting file info from Google Drive:', error);
      throw error;
    }
  }
}

// Make the service available globally
window.GoogleDriveService = GoogleDriveService;

// Auto-initialize when page loads (with delay to ensure APIs are loaded)
document.addEventListener('DOMContentLoaded', async function() {
  console.log('DOM loaded, initializing Google Drive Service...');
  console.log('Current URL:', window.location.href);
  console.log('Origin:', window.location.origin);
  console.log('Pathname:', window.location.pathname);
  
  // Wait a bit for Google APIs to load
  setTimeout(async () => {
    try {
      const success = await GoogleDriveService.initialize();
      if (success) {
        console.log('Google Drive Service ready');
      } else {
        console.error('Failed to initialize Google Drive Service');
      }
    } catch (error) {
      console.error('Failed to initialize Google Drive Service:', error);
    }
  }, 2000); // Wait 2 seconds for APIs to load
}); 