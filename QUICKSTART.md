# 🚀 Quick Start Guide

## What's Working Right Now

✅ **Foundation Complete**
- Project structure set up
- Database schema defined
- Docker configuration ready
- Dark theme UI components
- Admin setup flow
- Session management

## Test It Now!

### Step 1: Install Dependencies
```bash
cd ~/Documents/nfl-pickems
npm install
```

### Step 2: Run Development Server
```bash
npm run dev
```

### Step 3: Open Browser
Go to: **http://localhost:3001**

### Step 4: Complete Setup
1. You'll be redirected to `/setup`
2. Create your admin PIN (4 or 6 digits)
3. Create your recovery password (8+ characters)
4. Click "Complete Setup"

### Step 5: See the Home Page
After setup, you'll see the landing page with:
- Welcome message
- User Login button
- Admin button

## What's Next to Build

This is a **foundation**. Here's what still needs to be built:

### 🔴 Critical (Phase 1)
- [ ] Admin PIN entry dialog
- [ ] User login page & API
- [ ] User session handling
- [ ] Admin dashboard

### 🟡 Important (Phase 2)
- [ ] User management (add/edit/delete)
- [ ] Make picks page
- [ ] ESPN API integration for current week
- [ ] Pick validation

### 🟢 Features (Phase 3)
- [ ] Live scores page
- [ ] Real-time polling
- [ ] Chat system
- [ ] Statistics & graphs
- [ ] Lunch tracker

## Current File Structure

```
nfl-pickems/
├── src/
│   ├── app/
│   │   ├── api/admin/setup/route.ts  ✅
│   │   ├── setup/page.tsx             ✅
│   │   ├── page.tsx                   ✅
│   │   ├── layout.tsx                 ✅
│   │   └── globals.css                ✅
│   ├── components/ui/                 ✅ (button, input, label, toast, dialog, card, avatar)
│   └── lib/
│       ├── db.ts                      ✅
│       ├── auth.ts                    ✅
│       ├── session.ts                 ✅
│       ├── espn-api.ts                ✅
│       └── utils.ts                   ✅
├── prisma/schema.prisma               ✅
├── Dockerfile                         ✅
├── docker-compose.yml                 ✅
└── package.json                       ✅
```

## Development Tips

### Database Management
```bash
# View database with Prisma Studio
npm run prisma:studio

# Reset database (if needed)
rm -rf data/
```

### Docker Testing
```bash
# Copy to test directory
cp -r ~/Documents/nfl-pickems/* ~/Pictures/nfl-pickems/

# Build and run
cd ~/Pictures/nfl-pickems
docker compose build
docker compose up -d

# View logs
docker compose logs --tail=50
```

## Next Session Focus

In the next development session, we should build:

1. **Admin Panel** - PIN entry dialog and dashboard
2. **User Management** - Add/edit/delete users
3. **Login System** - User authentication
4. **Picks Page** - Make weekly picks

This will give us a functional MVP to test the core workflow!

## Notes

- Database is SQLite (stored in `data/` directory)
- Port is 3001 (configurable in docker-compose.yml)
- Timezone is set to America/Chicago (CST)
- Dark theme is default and always on
- Team logos/wordmarks copied from nfl-squares project

## Troubleshooting

**Port already in use?**
```bash
# Change port in docker-compose.yml
ports:
  - "3002:3001"  # Use 3002 instead
```

**Database errors?**
```bash
# Remove and recreate
rm -rf data/
npm run dev  # Will recreate on next run
```

**Build errors?**
```bash
# Clear and reinstall
rm -rf node_modules .next
npm install
```

---

**Ready to continue? Let's build the admin panel next!** 🚀
