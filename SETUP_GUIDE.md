# Google Drive Service Account Setup Guide

This guide will help you set up Google Drive Service Account authentication so that files are uploaded to YOUR Google Drive account without requiring user permissions.

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click on it and press "Enable"

## Step 2: Create a Service Account

1. In Google Cloud Console, go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the details:
   - **Name**: `rsigci-drive-service`
   - **Description**: `Service account for RSIGCI file uploads`
4. Click "Create and Continue"
5. For "Role", select "Editor" (or create a custom role with only Drive permissions)
6. Click "Done"

## Step 3: Generate Service Account Key

1. In the Credentials page, find your service account and click on it
2. Go to the "Keys" tab
3. Click "Add Key" > "Create new key"
4. Choose "JSON" format
5. Click "Create" - this will download a JSON file
6. **IMPORTANT**: Keep this file secure and never commit it to version control

## Step 4: Set Up Google Drive Folder (Optional)

1. Go to [Google Drive](https://drive.google.com)
2. Create a new folder for job applications (e.g., "RSIGCI Applications")
3. Right-click the folder and select "Share"
4. Add your service account email (found in the JSON file) with "Editor" permissions
5. Copy the folder ID from the URL (the long string after `/folders/`)

## Step 5: Configure Backend

1. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   ```bash
   cp env-example.txt .env
   ```

3. **Edit `.env` file:**
   ```env
   GOOGLE_SERVICE_ACCOUNT_KEY_FILE=./service-account-key.json
   GOOGLE_DRIVE_FOLDER_ID=your-folder-id-here
   PORT=3000
   ```

4. **Place your service account JSON file:**
   - Rename your downloaded JSON file to `service-account-key.json`
   - Place it in the root directory of your project

## Step 6: Update Frontend Configuration

1. **Update `google-drive-service.js`:**
   - Change `BACKEND_URL` to your actual backend URL
   - If using localhost: `http://localhost:3000/api`
   - If deployed: `https://your-domain.com/api`

2. **Update `index.html`:**
   - Remove the Google API scripts since we're not using OAuth anymore
   - The backend handles all Google Drive operations

## Step 7: Test the Setup

1. **Start the backend server:**
   ```bash
   npm start
   ```

2. **Open your application:**
   - Navigate to `http://localhost:3000`
   - Try uploading a file through the application form

3. **Check Google Drive:**
   - Go to your Google Drive
   - Check the specified folder for uploaded files

## Step 8: Deploy to Production

### Option A: Deploy Backend to Cloud Platform

1. **Google Cloud Run (Recommended):**
   ```bash
   # Build and deploy
   gcloud run deploy rsigci-backend \
     --source . \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated
   ```

2. **Update frontend BACKEND_URL** to your deployed URL

### Option B: Deploy to VPS/Server

1. **Upload files to your server**
2. **Install Node.js and dependencies:**
   ```bash
   npm install --production
   ```

3. **Set up environment variables**
4. **Use PM2 to run the server:**
   ```bash
   npm install -g pm2
   pm2 start backend-server.js --name rsigci-backend
   pm2 startup
   pm2 save
   ```

## Security Considerations

1. **Never commit service account keys to version control**
2. **Use environment variables for sensitive data**
3. **Set up proper CORS settings for production**
4. **Consider rate limiting for file uploads**
5. **Implement file type validation on the backend**

## Troubleshooting

### Common Issues:

1. **"Failed to get access token"**
   - Check if service account JSON file is in the correct location
   - Verify Google Drive API is enabled
   - Check service account permissions

2. **"Upload failed"**
   - Check if folder ID is correct
   - Verify service account has access to the folder
   - Check file size limits

3. **CORS errors**
   - Update CORS settings in `backend-server.js`
   - Ensure frontend URL is allowed

### Debug Steps:

1. **Check backend logs:**
   ```bash
   npm run dev
   ```

2. **Check browser console for errors**

3. **Verify Google Drive API quota and limits**

## Benefits of This Approach

✅ **No user permissions required** - Files upload to YOUR Google Drive  
✅ **Secure** - Service account credentials stay on the server  
✅ **Reliable** - No OAuth popups or user consent issues  
✅ **Scalable** - Can handle multiple users without permission problems  
✅ **Organized** - All files go to a specific folder in your Drive  

## File Structure After Setup

```
your-project/
├── index.html
├── google-drive-service.js
├── backend-server.js
├── package.json
├── .env
├── service-account-key.json (your downloaded key file)
├── env-example.txt
└── SETUP_GUIDE.md
```

This setup ensures that all file uploads go directly to your Google Drive account without any user interaction or permission issues! 