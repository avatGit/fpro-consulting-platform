# Quick Start Guide - Admin Dashboard

## ✅ Backend Status: RUNNING
Your backend is already running on port 5000! The database sync was successful - all new tables (audit_logs, invoices, system_settings) were created.

## 🚀 Start Frontend (Choose One Method)

### Method 1: Enable PowerShell Scripts (Recommended)
Run this command in PowerShell **as Administrator**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Then start the frontend:
```powershell
cd frontend\F-PRO
npm start
```

### Method 2: Use CMD Instead
Open **Command Prompt (CMD)** and run:
```cmd
cd frontend\F-PRO
npm start
```

### Method 3: Use the Package.json Script Directly
```powershell
cd frontend\F-PRO
node node_modules/react-scripts/bin/react-scripts.js start
```

## 🎯 Access Admin Dashboard

Once frontend starts, navigate to:
```
http://localhost:3000/login
```

**Login with admin credentials:**
- Email: Your admin user email
- Password: Your admin password

After login, you'll be redirected to:
```
http://localhost:3000/admin
```

## 🧪 Quick Test Checklist

1. **Dashboard Module** - View statistics and activity
2. **Users Module** - Click "Utilisateurs" in sidebar
3. **Quotes Module** - Click "Devis" to see quotes
4. **Invoices Module** - Click "Factures" for billing
5. **Audit Logs** - Click "Logs d'audit" to see admin actions
6. **Settings** - Click "Paramètres" for system config

## 🐛 Troubleshooting

**If frontend won't start:**
1. Check if port 3000 is already in use
2. Try: `npx react-scripts start` instead of `npm start`
3. Clear cache: `npm cache clean --force` then `npm install`

**If you get login errors:**
1. Verify backend is running (check http://localhost:5000)
2. Check browser console for errors
3. Verify CORS is enabled in backend

## 📞 Need Help?

Check the comprehensive testing guide:
`C:\Users\yameo\.gemini\antigravity\brain\4cb2117a-8859-47e5-b74a-f65d7d49bab7\testing_guide.md`
