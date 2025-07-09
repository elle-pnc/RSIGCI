// Simple Google Drive Service (Alternative Approach)
class GoogleDriveSimpleService {
  static API_KEY = 'AIzaSyDwdhYLJYXExCD2281VE-tTuXSDfw0b2fU';
  static CLIENT_ID = '556445572871-lu6ne90jotsh6dsckvmslgoaokd9jldm.apps.googleusercontent.com';
  static initialized = false;

  // Initialize with simpler approach
  static async initialize() {
    try {
      console.log('Initializing Simple Google Drive Service...');
      
      // Load Google API
      await new Promise((resolve) => {
        if (typeof gapi !== 'undefined' && gapi.client) {
          resolve();
        } else {
          gapi.load('client', resolve);
        }
      });

      // Initialize with API key only
      await gapi.client.init({
        apiKey: this.API_KEY,
        discoveryDocs: ['https://www.googleapis.com/discovery/v1/apis/drive/v3/rest']
      });

      this.initialized = true;
      console.log('Simple Google Drive Service initialized');
      return true;
    } catch (error) {
      console.error('Error initializing Simple Google Drive Service:', error);
      return false;
    }
  }

  // Upload file using a different approach
  static async uploadFile(file) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      console.log('Starting simple upload for file:', file.name);
      
      // Check file size
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size too large. Please upload a file smaller than 10MB.');
      }

      // For now, return a mock result since OAuth is blocked
      // In a real implementation, you would use a different authentication method
      const mockResult = {
        id: 'mock_file_id_' + Date.now(),
        name: file.name,
        url: 'https://drive.google.com/file/d/mock_file_id/view',
        downloadUrl: 'https://drive.google.com/uc?export=download&id=mock_file_id',
        size: file.size,
        mimeType: file.type,
        mock: true
      };

      console.log('Mock upload result:', mockResult);
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      return mockResult;

    } catch (error) {
      console.error('Error in simple upload:', error);
      throw error;
    }
  }

  // Get file info
  static async getFileInfo(fileId) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      // Mock file info
      return {
        id: fileId,
        name: 'Mock File',
        size: '1024',
        mimeType: 'application/pdf',
        webViewLink: 'https://drive.google.com/file/d/' + fileId + '/view',
        webContentLink: 'https://drive.google.com/uc?export=download&id=' + fileId
      };
    } catch (error) {
      console.error('Error getting file info:', error);
      throw error;
    }
  }

  // Delete file
  static async deleteFile(fileId) {
    try {
      if (!this.initialized) {
        await this.initialize();
      }

      console.log('Mock delete for file:', fileId);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }
}

// Make available globally
window.GoogleDriveSimpleService = GoogleDriveSimpleService;

// Auto-initialize
document.addEventListener('DOMContentLoaded', async function() {
  console.log('Initializing Simple Google Drive Service...');
  try {
    await GoogleDriveSimpleService.initialize();
    console.log('Simple Google Drive Service ready');
  } catch (error) {
    console.error('Failed to initialize Simple Google Drive Service:', error);
  }
}); 