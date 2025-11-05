@echo off
REM DLX Studios Ultimate - Start Server Script for Windows
REM This script starts the production server

echo ========================================
echo DLX Studios Ultimate - Starting Server
echo ========================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

REM Check if dependencies are installed
if not exist "node_modules\" (
    echo Installing dependencies...
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to install dependencies
        pause
        exit /b 1
    )
)

REM Check if build exists
if not exist "dist\" (
    echo Building frontend...
    call npm run build
    if %ERRORLEVEL% NEQ 0 (
        echo ERROR: Failed to build frontend
        pause
        exit /b 1
    )
)

REM Set environment variables
set NODE_ENV=production
set PORT=3001
set LM_STUDIO_URL=http://localhost:1234

echo.
echo Starting server on port %PORT%...
echo LM Studio URL: %LM_STUDIO_URL%
echo.
echo Press Ctrl+C to stop the server
echo.

REM Start the server
node server.js

pause

