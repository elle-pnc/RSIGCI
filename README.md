# RSIGCI Job Application System

A job application system with Google Drive file upload integration.

## Features

- Job posting and management
- Application submission with file uploads
- Google Drive integration for file storage
- Admin dashboard for managing applications

## Deployment to Render

### Prerequisites

1. GitHub account
2. Render account (free)
3. Google Cloud Platform project with Drive API enabled

### Step-by-Step Deployment

#### 1. Prepare Your Repository

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"

# Create GitHub repository and push
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

#### 2. Set Up Render

1. Go to [render.com](https://render.com) and sign up
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name:** rsigci-job-applications
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

#### 3. Environment Variables

Add these environment variables in Render dashboard:

- `GOOGLE_DRIVE_FOLDER_ID`: Your Google Drive folder ID
- `GOOGLE_SERVICE_ACCOUNT_KEY_FILE`: Path to service account key (or use the JSON content)

#### 4. Service Account Setup

**Option A: Upload JSON file**
1. Upload your `service-account-key.json` to Render
2. Set `GOOGLE_SERVICE_ACCOUNT_KEY_FILE` to the file path

**Option B: Use environment variable**
1. Copy the content of your service account JSON
2. Create environment variable `GOOGLE_SERVICE_ACCOUNT_KEY` with the JSON content
3. Update the backend to use this environment variable

#### 5. Deploy

1. Click "Create Web Service"
2. Render will automatically build and deploy your application
3. Your app will be available at: `https://your-app-name.onrender.com`

## Local Development

```bash
# Install dependencies
npm install

# Create .env file with your configuration
cp env-example.txt .env
# Edit .env with your settings

# Start development server
npm start
```

## Environment Variables

- `GOOGLE_DRIVE_FOLDER_ID`: Your Google Drive folder ID
- `GOOGLE_SERVICE_ACCOUNT_KEY_FILE`: Path to service account key file
- `PORT`: Server port (default: 3000)

## File Structure

```
├── backend-server.js      # Main server file
├── index.html            # Frontend application
├── package.json          # Dependencies
├── service-account-key.json  # Google service account (not in git)
├── .env                  # Environment variables (not in git)
└── README.md            # This file
```

## Support

For issues or questions, please contact the development team. 