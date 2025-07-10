// Google Drive Service for File Uploads using Service Account
class GoogleDriveService {
  // Static properties for Service Account
  static BACKEND_URL = 'http://localhost:3000/api'; // Update this to your backend URL
  static FOLDER_ID = 'your-google-drive-folder-id'; // Optional: specific folder to upload to
  
  // Static instance variables
  static initialized = false;
  static accessToken = null;
  static tokenExpiry = null;

  // Initialize the service
  static async initialize() {
    try {
      console.log('Starting Google Drive Service Account initialization...');
      
      // Get access token from backend
      await this.getAccessToken();
      
      this.initialized = true;
      console.log('Google Drive Service Account initialized successfully');
      return true;
    } catch (error) {
      console.error('Error initializing Google Drive Service Account:', error);
      this.initialized = false;
      return false;
    }
  }

  // Get access token from backend (secure way)
  static async getAccessToken() {
    try {
      // Call your backend to get a valid access token
      const response = await fetch(`${this.BACKEND_URL}/google-drive/token`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get access token from backend');
      }

      const data = await response.json();
      this.accessToken = data.access_token;
      this.tokenExpiry = data.expires_at;
      
      console.log('Access token obtained from backend');
      return this.accessToken;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  }

  // Get valid access token
  static async getValidAccessToken() {
    if (!this.initialized) {
      await this.initialize();
    }

    // Check if token is expired
    if (!this.accessToken || (this.tokenExpiry && Date.now() / 1000 > this.tokenExpiry)) {
      await this.getAccessToken();
    }

    return this.accessToken;
  }

  // Upload file to Google Drive using Service Account (via backend)
  static async uploadFile(file, onProgress = null) {
    try {
      console.log('Starting Google Drive upload for file:', file.name);
      
      // Check file size (limit to 10MB for Google Drive)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size too large. Please upload a file smaller than 10MB.');
      }

      // Create FormData for upload
      const formData = new FormData();
      formData.append('file', file);

      // Upload to backend which will handle Google Drive upload
      const response = await fetch(`${this.BACKEND_URL}/google-drive/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Upload response error:', errorData);
        throw new Error(`Upload failed: ${errorData.error || response.statusText}`);
      }

      const result = await response.json();
      console.log('File uploaded to Google Drive:', result);

      return {
        id: result.id,
        name: result.name,
        url: result.url,
        downloadUrl: result.downloadUrl,
        size: result.size,
        mimeType: result.mimeType
      };

    } catch (error) {
      console.error('Error uploading to Google Drive:', error);
      throw error;
    }
  }

  // Delete file from Google Drive
  static async deleteFile(fileId) {
    try {
      const response = await fetch(`${this.BACKEND_URL}/google-drive/files/${fileId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
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
      const response = await fetch(`${this.BACKEND_URL}/google-drive/files/${fileId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
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

// Auto-initialize when page loads
document.addEventListener('DOMContentLoaded', async function() {
  console.log('DOM loaded, initializing Google Drive Service Account...');
  
  try {
    const success = await GoogleDriveService.initialize();
    if (success) {
      console.log('Google Drive Service Account ready');
    } else {
      console.error('Failed to initialize Google Drive Service Account');
    }
  } catch (error) {
    console.error('Failed to initialize Google Drive Service Account:', error);
  }
}); 