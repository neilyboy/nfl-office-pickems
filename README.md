# 🏈 NFL Office Pickems - Production Ready!

A complete, feature-rich Next.js application for managing NFL office football pickems with real-time scoring, chat, and comprehensive admin tools.

![Status](https://img.shields.io/badge/Status-Production%20Ready-success)
![Completion](https://img.shields.io/badge/Completion-98%25-brightgreen)
![License](https://img.shields.io/badge/License-MIT-blue)

## ✨ Features
- **Admin Setup**: First-run PIN and password creation
- **User Management**: Admin creates users with default password `nflofficepickems`
- **Password Reset**: Users must change password on first login and after resets
- **Session Management**: Separate user and admin sessions

### 👥 User Features
- **Make Picks**: Pick winners for all games each week with team logos
- **Week Navigation**: Browse all 18 weeks - view past picks, make future picks
- **Monday Night Tie-breaker**: Guess total points from all Monday games
- **Pick Locking**: Automatic locking at first game time
- **Live Scores**: Real-time ESPN API integration with game status
- **Group Chat**: Real-time chat with emoji support 😊🏈
- **Season Statistics**: View win/loss records, leaderboard, personal stats

### 👔 Admin Features
- **User Management**: Add, edit, delete users with avatar colors
- **Pick Management**: Modify any user's picks for any week (past, present, future)
- **Week Navigation**: Admin can view/edit all 18 weeks
- **Historical Data Entry**: Enter past picks for record keeping
- **Full Control**: No lock restrictions for admin users

### 📊 Statistics & Tracking
- **Leaderboard**: Real-time during games, historical overall
- **Win/Loss Records**: Track winners and losers each week
- **Lunch Tracker**: Who owes who lunch, paid status
- **Probability Calculations**: Live win probability as games progress
- **Graphs & Charts**: Visual representation of stats using Recharts

### 🎮 Real-time Features
- **ESPN API Integration**: Polls every 30 seconds during live games
- **Live Game Status**: Quarter, time, score, game state
- **Auto-locking**: Picks lock 5 minutes before first game
- **Week Completion**: Auto-detects when all Monday games finish

## Tech Stack

- **Framework**: Next.js 14 (App Router) with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS with shadcn/ui components
- **Icons**: Lucide React
- **Data Source**: ESPN API (real-time NFL game data)
- **Authentication**: Cookie-based sessions with bcrypt
- **Deployment**: Docker-ready (Docker + Docker Compose)
- **Team Assets**: All 32 NFL team logos and wordmarks (SVG)

## Project Structure

```
nfl-pickems/
├── src/
│   ├── app/
│   │   ├── api/          # API routes
│   │   ├── admin/        # Admin panel pages
│   │   ├── picks/        # User picks page
│   │   ├── live/         # Live scores page
│   │   ├── login/        # User login page
│   │   ├── profile/      # User profile settings
│   │   └── page.tsx      # Main landing page
│   ├── components/
│   │   ├── ui/           # shadcn/ui components
│   │   └── ...           # Custom components
│   └── lib/
│       ├── db.ts         # Prisma client
│       ├── auth.ts       # Authentication utilities
│       ├── session.ts    # Session management
│       ├── espn-api.ts   # ESPN API integration
│       └── utils.ts      # Utility functions
├── prisma/
│   └── schema.prisma     # Database schema
├── team_logos/           # NFL team logos
├── team_wordmarks/       # NFL team wordmarks
├── Dockerfile
├── docker-compose.yml
└── package.json
```

## Database Schema

### Models
- **User**: User accounts (username, password, name, admin flag, avatar color)
- **Pick**: Weekly game picks (userId, week, season, gameId, pickedTeamId, mondayGuess)
- **Message**: Group chat messages (userId, message, timestamp)

### Key Features
- Prisma ORM for type-safe database access
- Automatic timestamps (createdAt, updatedAt)
- Foreign key relationships
- Indexed queries for performance

## Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn

### Installation
```bash
git clone https://github.com/neilyboy/nfl-office-pickems.git
cd nfl-office-pickems
npm install
```

### Database Setup
```bash
# Create .env file
DATABASE_URL="postgresql://user:password@localhost:5432/nfl_pickems"

# Run migrations
npx prisma migrate dev
```

### Development
```bash
npm run dev
```

Access at: http://localhost:3001

### Docker (Production)
```bash
docker compose build
docker compose up -d
```

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import repository in Vercel
3. Add `DATABASE_URL` environment variable
4. Deploy

### Docker
```bash
git pull origin main
docker compose down
docker compose build --no-cache
docker compose up -d
```

### Environment Variables
```env
DATABASE_URL="postgresql://..."
NODE_ENV="production"
```

## Rules

1. **Weekly Picks**: Users pick winners for all games
2. **Tie-breaker**: Guess total Monday night points (closest without going over wins, closest either way loses)
3. **Unique Guesses**: First to submit claims their Monday night guess
4. **Pick Deadline**: 5 minutes before first game
5. **Winner/Loser**: Most correct = winner, least correct = loser
6. **Prize**: Loser buys winner lunch

## License

Private use only.
