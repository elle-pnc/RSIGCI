# 🚀 EASY SETUP GUIDE - Follow These Steps Exactly

## Step 1: Create Google Cloud Service Account (5 minutes)

### 1.1 Go to Google Cloud Console
- Open: https://console.cloud.google.com/
- Sign in with your Google account

### 1.2 Create New Project
- Click the project dropdown at the top
- Click "New Project"
- Name: `RSIGCI-Drive-Upload`
- Click "Create"

### 1.3 Enable Google Drive API
- In the left menu, click "APIs & Services" > "Library"
- Search for "Google Drive API"
- Click on it and press "Enable"

### 1.4 Create Service Account
- Go to "APIs & Services" > "Credentials"
- Click "Create Credentials" > "Service Account"
- **Name**: `rsigci-drive-service`
- **Description**: `For file uploads`
- Click "Create and Continue"
- Click "Done"

### 1.5 Download the Key File
- Click on your new service account (rsigci-drive-service)
- Go to "Keys" tab
- Click "Add Key" > "Create new key"
- Choose "JSON"
- Click "Create"
- **SAVE THE DOWNLOADED FILE** - this is your `service-account-key.json`

## Step 2: Set Up Google Drive Folder (2 minutes)

### 2.1 Create Folder
- Go to https://drive.google.com
- Create a new folder called "RSIGCI Applications"
- Right-click the folder > "Share"
- Add your service account email (found in the JSON file) with "Editor" access
- Copy the folder ID from the URL (the long string after `/folders/`)

## Step 3: Configure Your Project (2 minutes)

### 3.1 Place the Key File
- Rename your downloaded JSON file to `service-account-key.json`
- Put it in your project folder (same folder as `index.html`)

### 3.2 Create Environment File
- Copy `env-example.txt` to `.env`
- Edit `.env` and replace `your-google-drive-folder-id` with your actual folder ID

## Step 4: Install and Run (1 minute)

### 4.1 Install Dependencies
```bash
npm install
```

### 4.2 Start the Server
```bash
npm start
```

### 4.3 Test It
- Open: http://localhost:3000
- Try uploading a file through the application form
- Check your Google Drive folder - the file should be there!

## 🎉 DONE! 

Your files will now upload to YOUR Google Drive without any user permissions needed!

---

## Need Help?

If you get stuck at any step, just tell me:
1. Which step you're on
2. What error you're seeing
3. I'll help you fix it!

## Quick Commands

```bash
# Install everything
npm install

# Start the server
npm start

# Stop the server (Ctrl+C)
```

## What This Gives You

✅ Files upload to YOUR Google Drive  
✅ No user permissions required  
✅ No OAuth popups  
✅ All files organized in one folder  
✅ Works for unlimited users 

## Google Drive Service Account Configuration
GOOGLE_SERVICE_ACCOUNT_KEY_FILE=./service-account-key.json
GOOGLE_DRIVE_FOLDER_ID=17ZzXe7x7sG9xZGByqG_qQa81QGdF7Vgg

# Server Configuration
PORT=3000

# Optional: CORS settings
CORS_ORIGIN=http://localhost:3000

**Need help with any other steps?** Just let me know! 