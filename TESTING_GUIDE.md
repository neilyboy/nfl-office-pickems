# 🧪 NFL Office Pickems - Complete Testing Guide

**Version:** 1.0 (Development Build)  
**Date:** October 2, 2025  
**Progress:** 60% Complete

---

## 🚀 Quick Start

### Start the Development Server
```bash
cd ~/Documents/nfl-pickems
npm run dev
```

**URL:** http://localhost:3001

---

## ✅ Feature Testing Checklist

### 1. First-Time Setup (One-Time Only)

**Test:** Initial admin setup
- [ ] Navigate to http://localhost:3001
- [ ] Automatically redirected to `/setup`
- [ ] Create admin PIN (4-6 digits)
- [ ] Create recovery password (8+ characters)
- [ ] Submit and verify redirect to home page

**Expected Result:** Admin credentials saved, redirected to home

---

### 2. Admin System Testing

#### 2.1 Admin Login
**Test:** PIN authentication
- [ ] Click "Admin" button on home page
- [ ] Enter your PIN in the dialog
- [ ] Verify successful login and redirect to admin dashboard

**Expected Result:** Dashboard displays with 4 menu cards

#### 2.2 User Management
**Test:** Add a new user
- [ ] Click "Manage Users" card
- [ ] Click "Add User" button
- [ ] Fill in form:
  - First Name: Test
  - Last Name: User
  - Username: testuser
  - Password: (leave default: nflofficepickems)
  - Avatar Color: (choose any color)
- [ ] Click "Add User"
- [ ] Verify user appears in list with "Must Change Password" badge

**Test:** Edit user
- [ ] Click edit icon (pencil) on a user
- [ ] Change first name
- [ ] Click "Save Changes"
- [ ] Verify changes appear immediately

**Test:** Reset password
- [ ] Click key icon on a user
- [ ] Confirm password reset
- [ ] Verify "Must Change Password" badge appears

**Test:** Delete user
- [ ] Click trash icon on a user
- [ ] Confirm deletion
- [ ] Verify user removed from list

**Expected Result:** All CRUD operations work smoothly

---

### 3. User Authentication Testing

#### 3.1 User Login
**Test:** Login with new user
- [ ] Log out of admin (if logged in)
- [ ] Click "User Login" button
- [ ] Enter credentials:
  - Username: testuser
  - Password: nflofficepickems
- [ ] Click "Login"
- [ ] Verify redirect to change password page

#### 3.2 Change Password
**Test:** First-time password change
- [ ] Enter current password: nflofficepickems
- [ ] Enter new password: (min 8 characters)
- [ ] Confirm new password
- [ ] Click "Change Password"
- [ ] Verify redirect to picks page

**Expected Result:** Password changed, redirected to picks

#### 3.3 Forgot Password
**Test:** Password reset request
- [ ] Log out
- [ ] Click "User Login"
- [ ] Click "Forgot Password?"
- [ ] Enter your username
- [ ] Click "Request Reset"
- [ ] Verify success message
- [ ] Log in as admin
- [ ] Go to User Management
- [ ] Verify "Reset Requested" badge on user

**Expected Result:** Admin notified of password reset request

---

### 4. Picks System Testing

#### 4.1 View Week Games
**Test:** Load current week games
- [ ] Login as a user
- [ ] Automatically on picks page (or navigate to `/picks`)
- [ ] Verify Week 5 games displayed
- [ ] Verify games grouped by day (Thursday, Sunday, Monday)
- [ ] Verify team logos appear
- [ ] Check lock timer countdown (if games haven't started)

**Expected Result:** All games visible with proper formatting

#### 4.2 Make Picks
**Test:** Select winners
- [ ] Click on any team card to select as winner
- [ ] Verify card highlights with blue border
- [ ] Verify trophy icon appears on selected team
- [ ] Select a winner for each game
- [ ] Verify "X games left to pick" message updates

**Test:** Monday night tie-breaker
- [ ] Scroll to Monday Night Tie-Breaker card
- [ ] Enter total points guess (e.g., 45)
- [ ] Verify input accepted

**Test:** Save picks
- [ ] Click "Save Picks" button
- [ ] Verify success toast notification
- [ ] Refresh the page
- [ ] Verify all picks still selected

**Expected Result:** Picks saved and persist on reload

#### 4.3 Lock Timer
**Test:** Pre-lock behavior
- [ ] Check time remaining in header badge
- [ ] Verify countdown updates every second
- [ ] Verify you can change picks freely

**Test:** Post-lock behavior  
*(Note: For Week 5, picks are already locked since Thursday game started)*
- [ ] Verify "Picks Are Locked" message displays
- [ ] Verify red "Locked" badge in header
- [ ] Try clicking a different team
- [ ] Verify toast notification prevents changes
- [ ] Verify "Save Picks" button is disabled

**Expected Result:** Cannot modify picks after lock time

---

### 5. Live Scores Testing

#### 5.1 Navigate to Live Scores
**Test:** Access scores page
- [ ] From picks page, click "📊 Live Scores" button
- [ ] OR navigate to http://localhost:3001/scores
- [ ] Verify page loads with games and scores

**Expected Result:** All games display with current status

#### 5.2 View Game Scores
**Test:** Thursday game (in progress or completed)
- [ ] Verify game shows current score
- [ ] Verify "LIVE" badge if in progress, "Final" if completed
- [ ] Verify quarter/time information displays
- [ ] Verify your pick is highlighted (blue border)

**Test:** Sunday games (upcoming)
- [ ] Verify score shows "-" or "0"
- [ ] Verify "Upcoming" badge displays
- [ ] Verify game time shown

**Test:** Pick indicators
- [ ] For completed games, verify green ✓ if pick was correct
- [ ] For completed games, verify red ✗ if pick was incorrect
- [ ] Verify "X picks" shown under each team

**Expected Result:** All game states display correctly

#### 5.3 Leaderboard
**Test:** View standings
- [ ] Check right sidebar "Leaderboard" card
- [ ] Verify all users with picks are listed
- [ ] Verify your entry is highlighted
- [ ] Verify correct count displayed (green number)
- [ ] Verify record format: "X-Y (Z left)"

**Test:** Your Progress card
- [ ] Verify "Your Progress" card shows:
  - Correct picks (green)
  - Incorrect picks (red)
  - Remaining games (gray)

**Expected Result:** Accurate standings and personal stats

#### 5.4 Auto-Refresh
**Test:** Live updates
- [ ] Verify "Auto-refresh ON" badge in bottom-right
- [ ] Wait 30 seconds
- [ ] Verify page refreshes automatically
- [ ] Check "Updated" timestamp in header updates

**Test:** Manual refresh
- [ ] Click "Refresh" button
- [ ] Verify refresh icon spins during update
- [ ] Verify scores update

**Expected Result:** Scores update automatically and manually

---

### 6. Navigation Testing

**Test:** Cross-page navigation
- [ ] From scores, click "🏈 Make Picks"
- [ ] Verify redirect to picks page
- [ ] From picks, click "📊 Live Scores"
- [ ] Verify redirect to scores page
- [ ] Click "Home" (back arrow) on either page
- [ ] Verify redirect to home page

**Expected Result:** Smooth navigation between all pages

---

### 7. Session Management

**Test:** Logout
- [ ] Click "Logout" button on any user page
- [ ] Verify redirect to home page
- [ ] Try accessing `/picks` directly
- [ ] Verify redirect to login page

**Test:** Session persistence
- [ ] Login as user
- [ ] Refresh the page
- [ ] Verify still logged in
- [ ] Close browser tab
- [ ] Reopen and navigate to site
- [ ] Verify still logged in (session persists)

**Expected Result:** Sessions work correctly

---

### 8. Chat System Testing

#### 8.1 Access Chat
**Test:** Navigate to chat
- [ ] From any logged-in page, click "💬 Chat" button
- [ ] OR navigate to http://localhost:3001/chat
- [ ] Verify chat interface loads
- [ ] Verify "Week 5 Chat" header displays

**Expected Result:** Chat page loads with message history

#### 8.2 View Messages
**Test:** Read existing messages
- [ ] Verify all messages display in chronological order
- [ ] Verify user avatars show with colors
- [ ] Verify names display correctly
- [ ] Verify "You" shows for your messages
- [ ] Verify timestamps show (e.g., "5m ago", "2h ago")
- [ ] Check messages align left (others) and right (yours)

**Expected Result:** Clean, readable message display

#### 8.3 Send Messages
**Test:** Post new message
- [ ] Type a message in the input field
- [ ] Verify character counter updates (X/500)
- [ ] Click Send button (paper plane icon)
- [ ] Verify message appears immediately
- [ ] Verify your message is highlighted
- [ ] Verify auto-scroll to latest message

**Test:** Message validation
- [ ] Try sending empty message (should not work)
- [ ] Try sending 500 character message (should work)
- [ ] Try sending 501 character message (input prevents it)

**Expected Result:** Messages send successfully with validation

#### 8.4 Emoji Support
**Test:** Add emojis to messages
- [ ] Click smile icon button
- [ ] Verify emoji picker displays
- [ ] Click any emoji (e.g., 😀, 🏈, 🔥)
- [ ] Verify emoji added to message input
- [ ] Type additional text
- [ ] Send message
- [ ] Verify emoji displays in sent message

**Test:** Multiple emojis
- [ ] Add 3-4 different emojis to one message
- [ ] Send and verify all display correctly

**Expected Result:** Emojis work perfectly

#### 8.5 Auto-Refresh
**Test:** Live updates
- [ ] Open chat in two browser tabs (two different users)
- [ ] Send message in Tab 1
- [ ] Wait 5 seconds
- [ ] Verify message appears in Tab 2 automatically
- [ ] Check "Auto-refresh ON" badge in bottom-right

**Test:** Manual viewing
- [ ] Open chat as User A
- [ ] Have User B send a message (different browser/device)
- [ ] Wait up to 5 seconds
- [ ] Verify User B's message appears

**Expected Result:** Chat updates every 5 seconds

---

## 🐛 Known Issues / Limitations

### Current Limitations:
1. **No admin pick management** - Admin cannot edit user picks yet
2. **No chat management (admin)** - Admin cannot clear/manage chat yet
3. **No historical data** - Past weeks not accessible yet
4. **No backup/restore** - Database backup feature not implemented
5. **Tooltips missing** - Icon buttons need hover tooltips
6. **No past week chat archives** - Can only see current week chat

### Expected Behavior (Not Bugs):
- **Week 5 picks are locked** - Thursday game already started at 7:15 PM CST
- **Leaderboard shows "No picks yet"** - Need multiple users with picks
- **Some games show 0-0** - Games haven't started yet
- **Only current week visible** - Week navigation not implemented yet

---

## 📊 Test Data Suggestions

### Create Multiple Test Users:
```
User 1:
- Username: alice
- Name: Alice Johnson
- Pick preference: Home teams

User 2:
- Username: bob
- Name: Bob Smith  
- Pick preference: Away teams

User 3:
- Username: charlie
- Name: Charlie Davis
- Pick preference: Mixed picks
```

This will help test:
- Leaderboard sorting
- Pick distribution counts
- Tiebreaker logic
- Chat interactions (when implemented)

---

## 🎯 Success Criteria

### The system is working correctly if:
✅ Admin can manage all users  
✅ Users can login and change passwords  
✅ Users can make picks before lock time  
✅ Picks are locked 5 minutes before first game  
✅ Live scores update every 30 seconds  
✅ Leaderboard accurately reflects standings  
✅ Your picks are highlighted on score page  
✅ Navigation works smoothly between pages  
✅ Team logos display correctly  
✅ Monday night tie-breaker is unique per user  

---

## 🔧 Troubleshooting

### Issue: Port 3001 already in use
```bash
# Kill the process
pkill -f "next dev"

# Or find and kill specific process
lsof -i :3001
kill -9 <PID>
```

### Issue: Database errors
```bash
# Regenerate Prisma client
cd ~/Documents/nfl-pickems
npx prisma generate

# Reset database (WARNING: Deletes all data)
rm -rf data/
DATABASE_URL="file:./data/nfl-pickems.db" npx prisma db push --accept-data-loss
```

### Issue: Logos not displaying
```bash
# Verify public directory
ls ~/Documents/nfl-pickems/public/team_logos/
# Should show 32 SVG files

# If missing, copy from root
cp team_logos/* public/team_logos/
cp team_wordmarks/* public/team_wordmarks/
```

### Issue: Dev server not responding
```bash
# Check server logs
tail -100 /tmp/pickems.log

# Restart server
pkill -f "next dev"
cd ~/Documents/nfl-pickems
npm run dev
```

---

## 📈 Performance Testing

### Recommended Tests:
- [ ] **Load time:** Home page < 1 second
- [ ] **Picks page:** Loads all games < 2 seconds
- [ ] **Live scores:** Updates complete in < 500ms
- [ ] **Navigation:** Page transitions < 500ms
- [ ] **Auto-refresh:** Doesn't cause UI flicker

### Browser Compatibility:
- [ ] Firefox (current version)
- [ ] Chrome (current version)
- [ ] Safari (if on Mac)
- [ ] Mobile browsers (responsive design)

---

## 🎉 Congratulations!

If all tests pass, you have a fully functional NFL Office Pickems application with:
- 💼 Complete admin dashboard
- 👥 User management system
- 🔐 Authentication & security
- 🏈 Weekly picks with lock mechanism
- 📊 Live scores with real-time updates
- 🏆 Leaderboard with standings
- 🎨 Beautiful dark theme UI
- 📱 Mobile-responsive design

**Next Phase:** Chat system, statistics, and polish! 🚀

---

**Questions or Issues?** Check the logs at `/tmp/pickems.log` or review `CURRENT_STATUS.md` for development notes.
