# Google Drive Integration Setup Guide

This guide will help you set up Google Drive integration for faster and more reliable file uploads.

## Why Google Drive is Better

- **Faster Uploads**: Google Drive is optimized for file storage and uploads
- **Better Reliability**: More stable than Firebase Storage for file operations
- **Larger File Support**: Can handle files up to 10MB easily
- **Better Progress Tracking**: Real-time upload progress
- **Familiar Interface**: Users can access their uploaded files directly in Google Drive

## Setup Steps

### 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click on it and press "Enable"

### 2. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client IDs"
3. Choose "Web application"
4. Add your domain to "Authorized JavaScript origins":
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
5. Add your domain to "Authorized redirect URIs":
   - `http://localhost:3000` (for development)
   - `https://yourdomain.com` (for production)
6. Click "Create"
7. Copy the **Client ID** and **Client Secret**

### 3. Create API Key

1. In the same Credentials page, click "Create Credentials" > "API Key"
2. Copy the API Key
3. (Optional) Restrict the API key to Google Drive API only

### 4. Update Configuration

Edit `google-drive-service.js` and replace the placeholder values:

```javascript
this.API_KEY = 'YOUR_GOOGLE_API_KEY'; // Replace with your API key
this.CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'; // Replace with your Client ID
```

### 5. Test the Integration

1. Open your website
2. Try uploading a file through the application form
3. Check the browser console for any errors
4. Verify the file appears in your Google Drive

## File Structure

```
your-project/
├── index.html
├── admin.html
├── firebase-config.js
├── google-drive-service.js  ← New file
├── GOOGLE_DRIVE_SETUP.md   ← This guide
└── test-firebase.html
```

## How It Works

1. **File Upload**: Files are uploaded directly to Google Drive
2. **Application Data**: Application information is still stored in Firebase Firestore
3. **File Links**: Google Drive file links are stored in the application record
4. **Admin Access**: Admins can view and download files through Google Drive links

## Benefits Over Firebase Storage

| Feature | Firebase Storage | Google Drive |
|---------|------------------|--------------|
| Upload Speed | Slower | Faster |
| File Size Limit | 5MB (optimized) | 10MB+ |
| Reliability | Sometimes unstable | Very stable |
| Progress Tracking | Limited | Excellent |
| User Access | Admin only | User can access |
| Cost | Pay per GB | Free tier available |

## Troubleshooting

### Common Issues

1. **"Google API not initialized"**
   - Check that your API key and Client ID are correct
   - Ensure Google Drive API is enabled in Google Cloud Console

2. **"Authorization failed"**
   - Check that your domain is added to authorized origins
   - Clear browser cache and try again

3. **"Upload failed"**
   - Check file size (should be under 10MB)
   - Ensure stable internet connection
   - Try uploading a smaller file first

### Testing

Use the diagnostic tool at `test-firebase.html` to test:
- Google Drive connection
- File upload functionality
- Network connectivity

## Security Considerations

1. **API Key Security**: Keep your API key secure and restrict it to your domain
2. **OAuth Scopes**: Only request necessary permissions (`drive.file`)
3. **File Access**: Files are uploaded to the user's Google Drive, not your account
4. **Data Privacy**: Consider your privacy policy for file uploads

## Migration from Firebase Storage

If you have existing applications with Firebase Storage files:

1. Files will remain in Firebase Storage
2. New uploads will go to Google Drive
3. Both systems can coexist during transition
4. Consider migrating old files if needed

## Cost Comparison

- **Firebase Storage**: Pay per GB stored and transferred
- **Google Drive**: Free tier includes 15GB storage
- **Google Drive API**: Free tier includes 1,000 requests/day

## Next Steps

1. Set up your Google Cloud project
2. Update the configuration in `google-drive-service.js`
3. Test the integration
4. Deploy to production
5. Monitor usage and performance

## Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify your Google Cloud configuration
3. Test with smaller files first
4. Check your internet connection
5. Try a different browser

The Google Drive integration should provide much faster and more reliable file uploads compared to Firebase Storage! 