@echo off
echo.
echo 🚀 Starting DLX Studios Ultimate Server...
echo.
cd /d "%~dp0.."
call npm run start:prod
pause

