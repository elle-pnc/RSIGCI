# Google OAuth Troubleshooting Guide

## Error: 403 access_denied

This error occurs when the OAuth configuration in Google Cloud Console doesn't match your application's URL.

## Step-by-Step Fix

### 1. Go to Google Cloud Console
- Visit: https://console.cloud.google.com/
- Select your project: `rsigci-ojt`

### 2. Navigate to OAuth Settings
- Go to: **APIs & Services** → **Credentials**
- Find your OAuth 2.0 Client ID: `556445572871-lu6ne90jotsh6dsckvmslgoaokd9jldm.apps.googleusercontent.com`
- Click on it to edit

### 3. Update Authorized JavaScript Origins
Add these URLs:
```
http://127.0.0.1:5500
http://localhost:5500
http://127.0.0.1:3000
http://localhost:3000
file://
```

### 4. Update Authorized Redirect URIs
Add these URLs:
```
http://127.0.0.1:5500/
http://localhost:5500/
http://127.0.0.1:3000/
http://localhost:3000/
file:///
```

### 5. Save Changes
- Click **Save** at the bottom of the page
- Wait a few minutes for changes to propagate

## Alternative: Use File Protocol

If you're opening the HTML file directly (not through a server), add these to your OAuth settings:

### Authorized JavaScript Origins:
```
file://
```

### Authorized Redirect URIs:
```
file:///
```

## Testing Steps

1. **Clear browser cache and cookies** for Google accounts
2. **Open the test file**: `test-direct.html`
3. **Try the file upload test** again
4. **Check browser console** for any new error messages

## Common Issues

### Issue: Still getting access_denied
**Solution**: 
- Make sure you're using the exact same URL that's in your OAuth settings
- If using `file://`, make sure `file://` is in your authorized origins
- Wait 5-10 minutes after saving OAuth settings

### Issue: "Invalid redirect_uri"
**Solution**:
- The redirect URI must exactly match what's in your OAuth settings
- Check that you're using the correct protocol (http vs https)
- Make sure the port number matches

### Issue: "Client ID not found"
**Solution**:
- Verify you're using the correct Client ID: `556445572871-lu6ne90jotsh6dsckvmslgoaokd9jldm.apps.googleusercontent.com`
- Make sure the OAuth client is enabled in your project

## Current Configuration

Your current OAuth client settings should include:

**Client ID**: `556445572871-lu6ne90jotsh6dsckvmslgoaokd9jldm.apps.googleusercontent.com`
**API Key**: `AIzaSyDwdhYLJYXExCD2281VE-tTuXSDfw0b2fU`

## Testing URLs

Try these URLs in your OAuth settings:

### For localhost server:
- JavaScript origins: `http://127.0.0.1:5500`, `http://localhost:5500`
- Redirect URIs: `http://127.0.0.1:5500/`, `http://localhost:5500/`

### For direct file access:
- JavaScript origins: `file://`
- Redirect URIs: `file:///`

## Still Having Issues?

1. **Check the browser console** for detailed error messages
2. **Try a different browser** to rule out browser-specific issues
3. **Check if you're logged into the correct Google account**
4. **Make sure the Google Drive API is enabled** in your project

## Enable Google Drive API

If you haven't already:
1. Go to **APIs & Services** → **Library**
2. Search for "Google Drive API"
3. Click on it and press **Enable** 