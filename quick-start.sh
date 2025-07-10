#!/bin/bash

echo "🚀 RSIGCI Google Drive Setup - Quick Start"
echo "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "Download from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js is installed"

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not available. Please install npm."
    exit 1
fi

echo "✅ npm is available"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env-example.txt .env
    echo "✅ .env file created"
    echo "⚠️  Please edit .env file with your Google Drive settings"
else
    echo "✅ .env file already exists"
fi

# Check if service account key exists
if [ ! -f service-account-key.json ]; then
    echo "⚠️  service-account-key.json not found"
    echo "📋 Please follow these steps:"
    echo "   1. Go to Google Cloud Console"
    echo "   2. Create a Service Account"
    echo "   3. Download the JSON key file"
    echo "   4. Rename it to 'service-account-key.json'"
    echo "   5. Place it in this directory"
    echo ""
    echo "📖 See SETUP_GUIDE.md for detailed instructions"
else
    echo "✅ service-account-key.json found"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your Google Drive folder ID"
echo "2. Run: npm start"
echo "3. Open: http://localhost:3000"
echo ""
echo "📖 For detailed setup instructions, see SETUP_GUIDE.md" 