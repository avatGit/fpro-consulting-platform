@echo off
echo ========================================
echo F-PRO CONSULTING - Starting Frontend
echo ========================================
echo.

cd /d "%~dp0"
cd frontend\F-PRO

echo Starting React development server...
echo.
echo Once started, the app will open at:
echo http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.

call npm start

pause
