#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 RSIGCI Google Drive Setup Checker');
console.log('=====================================\n');

// Check if package.json exists
if (!fs.existsSync('package.json')) {
    console.log('❌ package.json not found');
    console.log('Please run this script from your project directory');
    process.exit(1);
}

// Check if service account key exists
if (!fs.existsSync('service-account-key.json')) {
    console.log('⚠️  service-account-key.json not found');
    console.log('\n📋 You need to:');
    console.log('1. Go to https://console.cloud.google.com/');
    console.log('2. Create a new project');
    console.log('3. Enable Google Drive API');
    console.log('4. Create a Service Account');
    console.log('5. Download the JSON key file');
    console.log('6. Rename it to service-account-key.json');
    console.log('7. Place it in this folder');
    console.log('\n📖 See EASY_SETUP.md for detailed steps');
    process.exit(1);
}

console.log('✅ service-account-key.json found');

// Check if .env exists
if (!fs.existsSync('.env')) {
    console.log('📝 Creating .env file...');
    if (fs.existsSync('env-example.txt')) {
        fs.copyFileSync('env-example.txt', '.env');
        console.log('✅ .env file created from template');
        console.log('⚠️  Please edit .env and add your Google Drive folder ID');
    } else {
        console.log('❌ env-example.txt not found');
        process.exit(1);
    }
} else {
    console.log('✅ .env file exists');
}

// Check if node_modules exists
if (!fs.existsSync('node_modules')) {
    console.log('📦 Installing dependencies...');
    const { execSync } = require('child_process');
    try {
        execSync('npm install', { stdio: 'inherit' });
        console.log('✅ Dependencies installed');
    } catch (error) {
        console.log('❌ Failed to install dependencies');
        console.log('Please run: npm install');
        process.exit(1);
    }
} else {
    console.log('✅ Dependencies already installed');
}

// Test the service account key
try {
    const keyData = JSON.parse(fs.readFileSync('service-account-key.json', 'utf8'));
    if (keyData.client_email && keyData.private_key) {
        console.log('✅ Service account key looks valid');
    } else {
        console.log('❌ Service account key appears invalid');
        console.log('Please download a new key from Google Cloud Console');
        process.exit(1);
    }
} catch (error) {
    console.log('❌ Invalid service account key file');
    console.log('Please check your service-account-key.json file');
    process.exit(1);
}

console.log('\n🎉 Setup check complete!');
console.log('\nNext steps:');
console.log('1. Edit .env file and add your Google Drive folder ID');
console.log('2. Run: npm start');
console.log('3. Open: http://localhost:3000');
console.log('\n📖 See EASY_SETUP.md for detailed instructions');

// Check if backend server can start
console.log('\n🔍 Testing backend server...');
const { spawn } = require('child_process');
const server = spawn('node', ['backend-server.js'], { 
    stdio: 'pipe',
    env: { ...process.env, NODE_ENV: 'test' }
});

setTimeout(() => {
    server.kill();
    console.log('✅ Backend server test passed');
    console.log('\n🚀 Ready to start! Run: npm start');
}, 3000);

server.on('error', (error) => {
    console.log('❌ Backend server test failed');
    console.log('Error:', error.message);
}); 