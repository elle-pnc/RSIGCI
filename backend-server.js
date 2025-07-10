const express = require('express');
const multer = require('multer');
const { google } = require('googleapis');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: ['https://rsigci-job-applications.onrender.com', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(express.static('.')); // Serve files from current directory

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Google Drive Service Account configuration
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];
const FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || 'root'; // Your Google Drive folder ID - using root for now

// Debug environment variables
console.log('=== ENVIRONMENT VARIABLES DEBUG ===');
console.log('GOOGLE_DRIVE_FOLDER_ID:', process.env.GOOGLE_DRIVE_FOLDER_ID);
console.log('GOOGLE_SERVICE_ACCOUNT_KEY exists:', !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
  try {
    const key = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
    console.log('Service account email:', key.client_email);
    console.log('Project ID:', key.project_id);
  } catch (e) {
    console.error('Failed to parse service account key:', e.message);
  }
}
console.log('=== END ENVIRONMENT DEBUG ===');

// Create Google Drive client
function createDriveClient() {
  let auth;
  
  try {
    // Check if service account key is provided as environment variable
    if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      console.log('Using service account key from environment variable');
      // Use environment variable for service account key
      const serviceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
      auth = new google.auth.GoogleAuth({
        credentials: serviceAccountKey,
        scopes: SCOPES,
      });
    } else {
      console.log('Using service account key from file');
      // Use key file (for local development)
      auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE || './service-account-key.json',
        scopes: SCOPES,
      });
    }
    
    return google.drive({ version: 'v3', auth });
  } catch (error) {
    console.error('Error creating Drive client:', error);
    throw error;
  }
}

// Helper: Find or create a folder by name under a parent
async function getOrCreateApplicantFolder(drive, parentFolderId, applicantName) {
  // Search for folder
  const query = `name = '${applicantName.replace(/'/g, "\\'")}' and mimeType = 'application/vnd.google-apps.folder' and '${parentFolderId}' in parents and trashed = false`;
  const res = await drive.files.list({
    q: query,
    fields: 'files(id, name)',
    spaces: 'drive',
  });
  if (res.data.files && res.data.files.length > 0) {
    return res.data.files[0].id;
  }
  // Create folder
  const folderMetadata = {
    name: applicantName,
    mimeType: 'application/vnd.google-apps.folder',
    parents: [parentFolderId],
  };
  const folder = await drive.files.create({
    requestBody: folderMetadata,
    fields: 'id',
  });
  return folder.data.id;
}

// In-memory storage for jobs and applications (in production, use a database)
let jobs = [
  {
    id: '1',
    title: 'Construction Site Supervisor',
    location: 'Cabuyao, Laguna',
    type: 'Full-time',
    description: 'We are looking for an experienced Construction Site Supervisor to oversee construction projects and ensure they are completed on time and within budget.',
    requirements: [
      'Bachelor\'s degree in Civil Engineering or related field',
      'Minimum 5 years of experience in construction supervision',
      'Strong leadership and communication skills',
      'Knowledge of safety regulations and quality standards'
    ],
    status: 'active',
    postedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    title: 'Sales Account Executive',
    location: 'Cabuyao, Laguna',
    type: 'Full-time',
    description: 'Join our sales team as an Account Executive to drive business growth and maintain strong client relationships.',
    requirements: [
      'Bachelor\'s degree in Business, Marketing, or related field',
      'Minimum 3 years of sales experience',
      'Excellent communication and negotiation skills',
      'Proven track record of meeting sales targets'
    ],
    status: 'active',
    postedAt: new Date('2024-01-10')
  }
];

let applications = [];

// Test service account endpoint
app.get('/api/test-service-account', async (req, res) => {
  try {
    console.log('Testing service account access...');
    
    const drive = createDriveClient();
    
    // Try to list files in the folder to test access
    const response = await drive.files.list({
      pageSize: 1,
      fields: 'files(id,name)',
      q: `'${FOLDER_ID}' in parents`,
    });
    
    console.log('Service account test successful');
    res.json({
      success: true,
      folderId: FOLDER_ID,
      filesFound: response.data.files.length,
      message: 'Service account has access to Google Drive folder'
    });
  } catch (error) {
    console.error('Service account test failed:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      folderId: FOLDER_ID,
      message: 'Service account test failed'
    });
  }
});

// Get access token endpoint
app.get('/api/google-drive/token', async (req, res) => {
  try {
    let auth;
    
    // Check if service account key is provided as environment variable
    if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
      const serviceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
      auth = new google.auth.GoogleAuth({
        credentials: serviceAccountKey,
        scopes: SCOPES,
      });
    } else {
      auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE || './service-account-key.json',
        scopes: SCOPES,
      });
    }
    
    const client = await auth.getClient();
    const accessToken = await client.getAccessToken();
    
    res.json({
      access_token: accessToken.token,
      expires_at: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    });
  } catch (error) {
    console.error('Error getting access token:', error);
    res.status(500).json({ error: 'Failed to get access token' });
  }
});

// Upload file endpoint
app.post('/api/google-drive/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const drive = createDriveClient();
    
    // Create file metadata
            const fileMetadata = {
          name: `${Date.now()}_${req.file.originalname}`,
          parents: undefined, // Use root folder for now
        };

    // Create media - convert buffer to stream
    const { Readable } = require('stream');
    const media = {
      mimeType: req.file.mimetype,
      body: Readable.from(req.file.buffer),
    };

    // Upload file
    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id,name,size,mimeType,webViewLink,webContentLink',
    });

    console.log('File uploaded:', file.data);

    res.json({
      id: file.data.id,
      name: file.data.name,
      url: `https://drive.google.com/file/d/${file.data.id}/view?usp=sharing`,
      downloadUrl: `https://drive.google.com/uc?export=download&id=${file.data.id}`,
      size: req.file.size,
      mimeType: req.file.mimetype,
    });

  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Delete file endpoint
app.delete('/api/google-drive/files/:fileId', async (req, res) => {
  try {
    const drive = createDriveClient();
    
    await drive.files.delete({
      fileId: req.params.fileId,
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

// Get file info endpoint
app.get('/api/google-drive/files/:fileId', async (req, res) => {
  try {
    const drive = createDriveClient();
    
    const file = await drive.files.get({
      fileId: req.params.fileId,
      fields: 'id,name,size,mimeType,webViewLink,webContentLink',
    });

    res.json(file.data);
  } catch (error) {
    console.error('Error getting file info:', error);
    res.status(500).json({ error: 'Failed to get file info' });
  }
});

// Jobs endpoints
app.get('/api/jobs', (req, res) => {
  res.json(jobs.filter(job => job.status === 'active'));
});

app.post('/api/jobs', (req, res) => {
  const newJob = {
    id: Date.now().toString(),
    ...req.body,
    status: 'active',
    postedAt: new Date()
  };
  jobs.push(newJob);
  res.json(newJob);
});

app.put('/api/jobs/:id', (req, res) => {
  const jobIndex = jobs.findIndex(job => job.id === req.params.id);
  if (jobIndex !== -1) {
    jobs[jobIndex] = { ...jobs[jobIndex], ...req.body };
    res.json(jobs[jobIndex]);
  } else {
    res.status(404).json({ error: 'Job not found' });
  }
});

app.delete('/api/jobs/:id', (req, res) => {
  const jobIndex = jobs.findIndex(job => job.id === req.params.id);
  if (jobIndex !== -1) {
    jobs[jobIndex].status = 'deleted';
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Job not found' });
  }
});

// Applications endpoints
app.get('/api/applications', (req, res) => {
  res.json(applications);
});

app.post('/api/applications', upload.single('resume'), async (req, res) => {
  try {
    console.log('=== APPLICATION SUBMISSION START ===');
    console.log('Request body:', req.body);
    console.log('File received:', req.file ? req.file.originalname : 'No file');
    
    const applicationData = {
      id: Date.now().toString(),
      fullName: req.body.fullName,
      email: req.body.email,
      phone: req.body.phone,
      position: req.body.position,
      coverLetter: req.body.coverLetter,
      appliedAt: new Date(),
      status: 'new'
    };

    // Upload resume to Google Drive if provided
    if (req.file) {
      console.log('File found, attempting Google Drive upload...');
      console.log('File name:', req.file.originalname);
      console.log('File size:', req.file.size);
      console.log('File type:', req.file.mimetype);
      console.log('FOLDER_ID:', FOLDER_ID);
      
      try {
        console.log('Creating Drive client...');
        const drive = createDriveClient();
        console.log('Drive client created successfully');
        
        // 1. Find or create applicant folder
        const applicantFolderId = await getOrCreateApplicantFolder(drive, FOLDER_ID, applicationData.fullName);
        console.log('Applicant folder ID:', applicantFolderId);
        
        // 2. Upload file into applicant folder
        const fileMetadata = {
          name: `${Date.now()}_${req.file.originalname}`,
          parents: [applicantFolderId],
        };
        
        console.log('File metadata:', fileMetadata);

        // Create media - convert buffer to stream
        const { Readable } = require('stream');
        const media = {
          mimeType: req.file.mimetype,
          body: Readable.from(req.file.buffer),
        };
        
        console.log('Media created, uploading to Drive...');

        const file = await drive.files.create({
          requestBody: fileMetadata,
          media: media,
          fields: 'id,name,size,mimeType,webViewLink,webContentLink',
        });

        applicationData.resumeURL = `https://drive.google.com/file/d/${file.data.id}/view?usp=sharing`;
        applicationData.resumeFileName = req.file.originalname;
        applicationData.resumeFileId = file.data.id;
        applicationData.resumeFolderId = applicantFolderId;

        console.log('✅ Resume uploaded to Google Drive successfully!');
        console.log('File ID:', file.data.id);
        console.log('File URL:', applicationData.resumeURL);
        console.log('Full file data:', file.data);
      } catch (uploadError) {
        console.error('❌ Error uploading resume:', uploadError);
        console.error('Error details:', uploadError.message);
        console.error('Error stack:', uploadError.stack);
        applicationData.resumeUploadError = uploadError.message;
      }
    } else {
      console.log('No file provided in request');
    }

    applications.push(applicationData);
    
    console.log('✅ Application submitted successfully!');
    console.log('Application ID:', applicationData.id);
    console.log('=== APPLICATION SUBMISSION END ===');
    res.json(applicationData);
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

app.put('/api/applications/:id/status', (req, res) => {
  const applicationIndex = applications.findIndex(app => app.id === req.params.id);
  if (applicationIndex !== -1) {
    applications[applicationIndex].status = req.body.status;
    res.json(applications[applicationIndex]);
  } else {
    res.status(404).json({ error: 'Application not found' });
  }
});

app.delete('/api/applications/:id', (req, res) => {
  const applicationIndex = applications.findIndex(app => app.id === req.params.id);
  if (applicationIndex !== -1) {
    applications.splice(applicationIndex, 1);
    res.json({ success: true });
  } else {
    res.status(404).json({ error: 'Application not found' });
  }
});

// Serve the main HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve backend-service.js
app.get('/backend-service.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'backend-service.js'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Access your application at: http://localhost:${PORT}`);
});

module.exports = app; 