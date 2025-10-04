# 🚀 Production Deployment Guide

Complete guide for deploying NFL Pick'em to production with Docker.

---

## 📋 **Prerequisites**

- Docker and Docker Compose installed
- Git installed
- Port 3001 available (or change in docker-compose.yml)

---

## 🎯 **Quick Start (5 Minutes)**

### **1. Clone the Repository**

```bash
cd /your/production/path
git clone https://github.com/neilyboy/nfl-office-pickems.git
cd nfl-office-pickems
```

### **2. Start with Docker Compose**

```bash
docker-compose up -d
```

That's it! The app will:
- ✅ Build the Docker image
- ✅ Create the database automatically
- ✅ Apply all schema changes
- ✅ Start on port 3001

### **3. Access Your App**

```
http://your-server:3001
```

### **4. Create Admin Account**

On first visit, you'll be prompted to set up an admin account.

---

## 🗄️ **Database & Data Persistence**

### **Data Location**

Your database is stored in: `/your/production/path/nfl-office-pickems/data/`

This directory is mounted as a volume, so data persists even if you rebuild containers.

### **Files Created**

```
./data/
├── nfl-pickems.db          # SQLite database
├── nfl-pickems.db-journal  # SQLite journal (temporary)
└── backups/                # Admin-created backups
```

### **Database Initialization**

The database is automatically created and initialized on first run:

1. **Entrypoint script runs** (`docker-entrypoint.sh`)
2. **Checks if database exists**
3. **Runs `prisma db push`** - Creates all tables with latest schema
4. **Starts the app**

**All tables are created automatically:**
- AdminSettings
- FeatureSettings (NEW!)
- User (with permission fields!)
- Pick
- ChatMessage
- ChatArchive
- LunchTracker
- WeekStatus
- SystemBackup

---

## 🔄 **Updating to Latest Version**

### **Pull Latest Code**

```bash
cd /your/production/path/nfl-office-pickems
git pull
```

### **Rebuild and Restart**

```bash
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

**The entrypoint script will automatically:**
- ✅ Detect schema changes
- ✅ Apply database migrations
- ✅ Preserve all your data

---

## 🛠️ **Configuration**

### **Change Port**

Edit `docker-compose.yml`:

```yaml
ports:
  - "8080:3001"  # Maps port 8080 on host to 3001 in container
```

### **Change Timezone**

Edit `docker-compose.yml`:

```yaml
environment:
  - TZ=America/New_York  # Or your timezone
```

### **Cookie Security (HTTP vs HTTPS)**

The app automatically detects if you're using HTTPS via a reverse proxy!

**Default Behavior (Recommended):**
- Leave `FORCE_SECURE_COOKIES` unset
- Automatically uses secure cookies when accessed via HTTPS
- Automatically uses regular cookies when accessed via HTTP
- Works perfectly with Nginx Proxy Manager, Traefik, Caddy, etc.

**Manual Override (Optional):**

Edit `docker-compose.yml`:

```yaml
environment:
  # Force secure cookies (only if you have issues with auto-detection)
  - FORCE_SECURE_COOKIES=true   # Force HTTPS cookies
  # OR
  - FORCE_SECURE_COOKIES=false  # Force HTTP cookies
```

**When to use manual override:**
- Your reverse proxy doesn't set `X-Forwarded-Proto` header
- You want to force a specific mode for testing

**Your Use Case (Nginx Proxy Manager):**
- ✅ **No configuration needed!**
- NPM automatically sets `X-Forwarded-Proto: https`
- App will detect HTTPS and use secure cookies automatically

### **Database Path**

By default, database is at `./data/nfl-pickems.db`. To change:

Edit `docker-compose.yml`:

```yaml
volumes:
  - /custom/path/data:/app/data  # Custom data directory
```

---

## 📊 **Monitoring & Logs**

### **View Logs**

```bash
# Follow logs in real-time
docker-compose logs -f

# View last 100 lines
docker-compose logs --tail=100

# View specific container
docker logs nfl-pickems-nfl-pickems-1 -f
```

### **Check Container Status**

```bash
docker-compose ps
```

### **Restart Container**

```bash
docker-compose restart
```

---

## 💾 **Backup & Restore**

### **Automatic Backups**

Admins can create backups from the Admin Dashboard → Backup & Restore.

Backups are stored in `./data/backups/`

### **Manual Database Backup**

```bash
# Stop the container first
docker-compose down

# Copy the database
cp ./data/nfl-pickems.db ./backups/nfl-pickems-backup-$(date +%Y%m%d).db

# Restart
docker-compose up -d
```

### **Restore from Backup**

```bash
# Stop the container
docker-compose down

# Restore database
cp ./backups/nfl-pickems-backup-YYYYMMDD.db ./data/nfl-pickems.db

# Restart
docker-compose up -d
```

---

## 🔐 **Security Best Practices**

### **1. Use Reverse Proxy**

Use Nginx or Traefik with HTTPS:

```nginx
server {
    listen 443 ssl;
    server_name pickems.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### **2. Firewall Rules**

```bash
# Only allow port 3001 from localhost (if using reverse proxy)
sudo ufw allow from 127.0.0.1 to any port 3001

# Or allow from specific IP
sudo ufw allow from YOUR_IP to any port 3001
```

### **3. Regular Backups**

Set up a cron job for daily backups:

```bash
# Add to crontab (crontab -e)
0 2 * * * cp /path/to/data/nfl-pickems.db /path/to/backups/nfl-pickems-$(date +\%Y\%m\%d).db
```

---

## 🚨 **Troubleshooting**

### **Container Won't Start**

```bash
# View detailed logs
docker-compose logs

# Check if port is already in use
sudo lsof -i:3001

# Remove old containers and rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### **Database Errors**

```bash
# Access container shell
docker exec -it nfl-pickems-nfl-pickems-1 sh

# Check database file
ls -la /app/data/

# Manually run Prisma commands
npx prisma db push
```

### **Permission Errors**

```bash
# Fix data directory permissions
sudo chown -R 1001:1001 ./data
sudo chmod -R 755 ./data
```

### **App Not Accessible**

```bash
# Check if container is running
docker ps | grep nfl-pickems

# Check firewall
sudo ufw status

# Test locally
curl http://localhost:3001
```

---

## 📈 **Performance Optimization**

### **For Large Leagues (100+ users)**

Consider upgrading to PostgreSQL:

1. Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Update `docker-compose.yml`:
```yaml
services:
  db:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_DB=nflpickems
      - POSTGRES_USER=pickems
      - POSTGRES_PASSWORD=your-secure-password
  
  nfl-pickems:
    depends_on:
      - db
    environment:
      - DATABASE_URL=postgresql://pickems:your-secure-password@db:5432/nflpickems

volumes:
  postgres_data:
```

---

## ✅ **Health Checks**

### **Verify Everything is Working**

```bash
# 1. Container is running
docker-compose ps
# Should show "Up"

# 2. App responds
curl http://localhost:3001
# Should return HTML

# 3. Database exists
ls -lh ./data/nfl-pickems.db
# Should show file size (>100KB after setup)

# 4. Logs show no errors
docker-compose logs --tail=50
# Should see "✅ Database ready!" and "🌐 Starting Next.js server"
```

---

## 🎯 **Post-Deployment Checklist**

- [ ] App accessible at http://your-server:3001
- [ ] Admin account created
- [ ] Users can be added
- [ ] Picks can be made
- [ ] Database file exists in `./data/`
- [ ] Backups configured (cron job)
- [ ] HTTPS configured (reverse proxy)
- [ ] Firewall rules in place
- [ ] Monitoring/logging set up

---

## 📞 **Need Help?**

Check the logs first:
```bash
docker-compose logs -f
```

Common issues are usually:
1. Port already in use
2. Permissions on `./data/` directory
3. Firewall blocking access

---

**Your NFL Pick'em app is production-ready! 🏈**

All database migrations happen automatically - just pull updates and restart! 🚀
