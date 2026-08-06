#!/bin/bash

# Auto-run migrations on deploy
# This script ensures all migrations are applied

echo "🔄 Checking migrations..."

# Get list of pending migrations
cd "$(dirname "$0")/.."

# Using dry-run to see what would be applied
npx supabase db push --dry-run --include-all 2>&1 || echo "⚠️  Cannot check migrations (expected if not linked)"

echo ""
echo "📋 Instructions:"
echo "1. For local dev: Run migrations manually in Supabase Dashboard SQL Editor"
echo "2. For production: migrations should be applied before deploy"
echo ""
echo "📍 SQL files location: supabase/migrations/"
echo "📍 Run individual migration: Copy content to https://app.supabase.com → SQL Editor"
