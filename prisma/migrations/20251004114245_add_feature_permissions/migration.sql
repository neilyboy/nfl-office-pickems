-- CreateTable
CREATE TABLE "AdminSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "pin" TEXT NOT NULL,
    "password" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "FeatureSettings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT DEFAULT 1,
    "randomPickerEnabled" BOOLEAN NOT NULL DEFAULT true,
    "upsetAlertsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "powerRankingsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "matchupSimulatorEnabled" BOOLEAN NOT NULL DEFAULT true
);

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "avatarType" TEXT NOT NULL DEFAULT 'initials',
    "avatarValue" TEXT,
    "avatarColor" TEXT NOT NULL DEFAULT '#3b82f6',
    "mustChangePassword" BOOLEAN NOT NULL DEFAULT true,
    "passwordResetRequested" BOOLEAN NOT NULL DEFAULT false,
    "canUseRandomPicker" BOOLEAN NOT NULL DEFAULT true,
    "canSeeUpsetAlerts" BOOLEAN NOT NULL DEFAULT true,
    "canSeePowerRankings" BOOLEAN NOT NULL DEFAULT true,
    "canUseMatchupSim" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Pick" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "week" INTEGER NOT NULL,
    "season" INTEGER NOT NULL,
    "gameId" TEXT NOT NULL,
    "pickedTeamId" TEXT NOT NULL,
    "mondayNightGuess" INTEGER,
    "lockedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Pick_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChatMessage" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" INTEGER NOT NULL,
    "week" INTEGER NOT NULL,
    "season" INTEGER NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChatMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChatArchive" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "week" INTEGER NOT NULL,
    "season" INTEGER NOT NULL,
    "messages" TEXT NOT NULL,
    "archivedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "LunchTracker" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "week" INTEGER NOT NULL,
    "season" INTEGER NOT NULL,
    "winnerId" INTEGER NOT NULL,
    "loserId" INTEGER NOT NULL,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "paidDate" DATETIME,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LunchTracker_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "LunchTracker_loserId_fkey" FOREIGN KEY ("loserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WeekStatus" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "week" INTEGER NOT NULL,
    "season" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'upcoming',
    "lockTime" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SystemBackup" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "filename" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL DEFAULT 'admin'
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "Pick_week_season_idx" ON "Pick"("week", "season");

-- CreateIndex
CREATE INDEX "Pick_userId_week_season_idx" ON "Pick"("userId", "week", "season");

-- CreateIndex
CREATE UNIQUE INDEX "Pick_userId_week_season_gameId_key" ON "Pick"("userId", "week", "season", "gameId");

-- CreateIndex
CREATE INDEX "ChatMessage_week_season_createdAt_idx" ON "ChatMessage"("week", "season", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ChatArchive_week_season_key" ON "ChatArchive"("week", "season");

-- CreateIndex
CREATE INDEX "LunchTracker_winnerId_idx" ON "LunchTracker"("winnerId");

-- CreateIndex
CREATE INDEX "LunchTracker_loserId_idx" ON "LunchTracker"("loserId");

-- CreateIndex
CREATE UNIQUE INDEX "LunchTracker_week_season_key" ON "LunchTracker"("week", "season");

-- CreateIndex
CREATE UNIQUE INDEX "WeekStatus_week_season_key" ON "WeekStatus"("week", "season");
