# NFL Office Pickems - Development Plan

## Current Status: 🚧 Foundation Built

### ✅ Completed
- [x] Project structure created
- [x] Package.json with all dependencies
- [x] TypeScript configuration
- [x] Tailwind CSS setup (dark theme)
- [x] Docker configuration (port 3001)
- [x] Prisma schema (all models)
- [x] Core library files (db, auth, session, espn-api, utils)
- [x] UI components (button, input, label, toast)
- [x] Team logos and wordmarks copied

### 🔄 In Progress
- [ ] Additional UI components needed
- [ ] App layout and routing structure
- [ ] API routes

### 📋 Todo - Phase 1: Core Authentication
- [ ] Admin setup page (/setup)
- [ ] Admin setup API route
- [ ] User login page (/login)
- [ ] User login API route
- [ ] Admin PIN entry dialog
- [ ] Session management middleware

### 📋 Todo - Phase 2: Admin Panel
- [ ] Admin dashboard layout
- [ ] User management (add/edit/delete)
- [ ] Pick management interface
- [ ] Chat management
- [ ] Backup/restore functionality
- [ ] Password reset requests handling

### 📋 Todo - Phase 3: User Features
- [ ] Main landing page (public stats)
- [ ] User profile/settings page
- [ ] Make picks page
- [ ] Pick validation (unique Monday guess)
- [ ] Pick locking logic

### 📋 Todo - Phase 4: Live Scores
- [ ] Live scores page
- [ ] Real-time polling (30s intervals)
- [ ] Probability calculations
- [ ] Leaderboard during games
- [ ] Game status indicators
- [ ] Charts and graphs (Recharts)

### 📋 Todo - Phase 5: Chat System
- [ ] Chat component
- [ ] Chat API routes
- [ ] Real-time updates
- [ ] Weekly auto-archiving
- [ ] Emoji support

### 📋 Todo - Phase 6: Statistics
- [ ] Historical stats page
- [ ] Win/loss calculations
- [ ] Lunch tracker display
- [ ] Season archives
- [ ] User avatars throughout

### 📋 Todo - Phase 7: Polish
- [ ] Mobile responsiveness
- [ ] Loading states
- [ ] Error handling
- [ ] Animations
- [ ] Final testing

## Next Steps

1. **Run npm install** to get all dependencies
2. **Create remaining UI components** (dialog, card, avatar, select, etc.)
3. **Build setup flow** (first run experience)
4. **Test locally** before moving to Docker

## Commands

```bash
# Development
cd ~/Documents/nfl-pickems
npm install
npm run dev

# Production test
cd ~/Pictures/nfl-pickems
# (copy files from Documents)
docker compose build
docker compose up -d
```

## Notes

- This is a LARGE project (~50+ files needed)
- Build iteratively and test each phase
- Focus on getting working features before polish
- Admin backfilling past weeks is important for data entry
