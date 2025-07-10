const { google } = require('googleapis');
require('dotenv').config();

async function testGoogleDrive() {
  try {
    console.log('Testing Google Drive connection...');
    
    const auth = new google.auth.GoogleAuth({
      keyFile: './service-account-key.json',
      scopes: ['https://www.googleapis.com/auth/drive.file'],
    });
    
    const drive = google.drive({ version: 'v3', auth });
    
    // Test creating a simple file
    const fileMetadata = {
      name: `test-${Date.now()}.txt`,
      parents: ['17ZzXe7x7sG9xZGByqG_qQa81QGdF7Vgg'], // Your folder ID
    };
    
    const media = {
      mimeType: 'text/plain',
      body: 'This is a test file from the server.',
    };
    
    const file = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: 'id,name,webViewLink',
    });
    
    console.log('✅ Test file created successfully!');
    console.log('File ID:', file.data.id);
    console.log('File Name:', file.data.name);
    console.log('File URL:', file.data.webViewLink);
    
  } catch (error) {
    console.error('❌ Google Drive test failed:', error.message);
    console.error('Full error:', error);
  }
}

testGoogleDrive(); 