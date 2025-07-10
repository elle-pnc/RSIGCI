@echo off
echo 🚀 RSIGCI Google Drive Setup
echo ============================
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed
    echo Please download and install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js is installed

REM Check if npm is available
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not available
    pause
    exit /b 1
)

echo ✅ npm is available

REM Install dependencies
echo 📦 Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

REM Check if .env file exists
if not exist ".env" (
    echo 📝 Creating .env file from template...
    if exist "env-example.txt" (
        copy "env-example.txt" ".env" >nul
        echo ✅ .env file created
        echo ⚠️  Please edit .env file with your Google Drive settings
    ) else (
        echo ❌ env-example.txt not found
        pause
        exit /b 1
    )
) else (
    echo ✅ .env file already exists
)

REM Check if service account key exists
if not exist "service-account-key.json" (
    echo ⚠️  service-account-key.json not found
    echo.
    echo 📋 Please follow these steps:
    echo    1. Go to https://console.cloud.google.com/
    echo    2. Create a new project
    echo    3. Enable Google Drive API
    echo    4. Create a Service Account
    echo    5. Download the JSON key file
    echo    6. Rename it to 'service-account-key.json'
    echo    7. Place it in this directory
    echo.
    echo 📖 See EASY_SETUP.md for detailed instructions
    echo.
    pause
    exit /b 1
) else (
    echo ✅ service-account-key.json found
)

echo.
echo 🎉 Setup complete!
echo.
echo Next steps:
echo 1. Edit .env file and add your Google Drive folder ID
echo 2. Run: npm start
echo 3. Open: http://localhost:3000
echo.
echo 📖 For detailed setup instructions, see EASY_SETUP.md
echo.
pause 