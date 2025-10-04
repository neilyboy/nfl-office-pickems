#!/bin/sh
set -e

echo "🚀 Starting NFL Pick'em App..."

# Ensure data directory has correct permissions
echo "📁 Setting up data directory permissions..."
chown -R nextjs:nodejs /app/data
chmod 777 /app/data

# Initialize/update database schema
echo "🗄️  Initializing database..."
if [ ! -f /app/data/nfl-pickems.db ]; then
  echo "📊 Database not found - creating new database..."
else
  echo "📊 Existing database found - updating schema..."
fi

# Push Prisma schema to database (creates tables if needed, updates if schema changed)
npx prisma db push --accept-data-loss

echo "✅ Database ready!"
echo "🌐 Starting Next.js server on port 3001..."

# Start the application
exec npm start
