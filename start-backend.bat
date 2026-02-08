@echo off
REM Start Backend Server for F-PRO CONSULTING Platform

echo ========================================
echo F-PRO CONSULTING - Starting Backend
echo ========================================
echo.

cd /d "%~dp0"
cd Backend

echo Starting server...
echo.

node src/server.js

pause
