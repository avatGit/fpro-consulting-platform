@echo off
REM Database Sync Script for F-PRO CONSULTING Platform
REM This script syncs the database schema with the models

echo ========================================
echo F-PRO CONSULTING - Database Sync
echo ========================================
echo.

cd /d "%~dp0"
cd Backend

echo Syncing database models...
echo.

node -e "const { syncModels } = require('./src/models'); syncModels({ alter: true }).then(() => { console.log('Database sync completed successfully!'); process.exit(0); }).catch(err => { console.error('Database sync failed:', err); process.exit(1); });"

echo.
echo ========================================
echo Sync Complete!
echo ========================================
pause
