# Installation & Quick Start Guide

## Prerequisites
- Node.js v16+
- PostgreSQL v12+
- npm v8+

## Installation Steps

### 1. Install Dependencies

**Windows PowerShell:**
```powershell
# If execution policy blocks npm
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Install dependencies
cd c:\Users\Hp\Documents\fpro_platform_backup\backend
npm install
```

**Expected packages to install:**
- `nodemailer` - Email notifications
- `node-cron` - Scheduled jobs
- `express-rate-limit` - Rate limiting
- `validator` - Input validation

### 2. Configure Environment

Copy `.env.example` to `.env` and update:

```env
# Database (REQUIRED)
DB_NAME=fpro_consulting
DB_USER=postgres
DB_PASSWORD=your_password

# JWT (REQUIRED)
JWT_SECRET=change_this_to_a_secure_random_string

# Email (Optional - uses mock in development)
SMTP_HOST=smtp.gmail.com
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### 3. Setup Database

```bash
# Create database in PostgreSQL
createdb fpro_consulting

# Sync models (creates tables)
npm run db:sync:alter

# Optional: Seed test data
npm run db:seed
```

### 4. Start Server

```bash
npm run dev
```

Server starts at: `http://localhost:5000`

## Verify Installation

### Check API Health
```bash
GET http://localhost:5000/api/health
```

### View API Documentation
Open browser: `http://localhost:5000/api/docs`

### Check Logs
Look for these startup messages:
```
✅ Tous les modèles ont été synchronisés
🕐 Initialisation des tâches planifiées...
📅 Scheduled: Maintenance reminders (0 9 * * *)
📅 Scheduled: Rental return reminders (0 10 * * *)
🚀 Serveur F-PRO CONSULTING démarré avec succès
```

## New Features Available

### Notifications API
- `GET /api/notifications` - List notifications
- `GET /api/notifications/unread-count` - Unread count
- `PATCH /api/notifications/:id/read` - Mark as read

### AI Assistance API
- `GET /api/maintenance/:id/suggest-technician` - Get AI suggestions
- `GET /api/maintenance/:id/priority` - Calculate priority score
- `GET /api/maintenance/workload/distribution` - technician workload

## Troubleshooting

### npm install fails
- Run PowerShell as Administrator
- Or use: `Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass`

### Database connection fails
- Verify PostgreSQL is running
- Check DB credentials in `.env`
- Ensure database exists

### Cron jobs not starting
- Check logs for initialization messages
- Verify `NODE_ENV=development` in `.env`

## Next Steps

1. **Test the API**: Use Swagger UI or Postman
2. **Review Code**: Check `src/services/` for new services
3. **Read Documentation**: See `README.md` for full details
4. **Deploy**: Follow production checklist in README

## Support

- **Documentation**: `README.md`
- **API Docs**: `http://localhost:5000/api/docs`
- **Walkthrough**: See `walkthrough.md` artifact
