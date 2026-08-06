#!/bin/bash
# ==============================================================================
# Setup Cloudflare Worker Secrets
#
# This script sets all required server-side environment variables
# as Cloudflare Worker secrets. Run once after first deploy or when
# secrets change.
#
# Usage: ./scripts/setup-cloudflare-secrets.sh
# ==============================================================================

set -e

echo "🔐 Setting up Cloudflare Worker secrets for 'kmtracker'..."
echo "   You will be prompted to enter each secret value."
echo ""

SECRETS=(
  "NEXT_PUBLIC_SUPABASE_URL"
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
  "SUPABASE_SERVICE_ROLE_KEY"
  "STRAVA_CLIENT_ID"
  "STRAVA_CLIENT_SECRET"
  "STRAVA_WEBHOOK_VERIFY_TOKEN"
  "SESSION_SECRET"
)

for secret in "${SECRETS[@]}"; do
  echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  echo "📝 Setting: $secret"
  read -rsp "   Enter value (hidden): " value
  echo ""

  if [ -z "$value" ]; then
    echo "   ⏭️  Skipped (empty)"
    continue
  fi

  echo "$value" | npx wrangler secret put "$secret" --name kmtracker 2>/dev/null
  echo "   ✅ Set successfully"
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 All secrets configured!"
echo ""
echo "💡 To verify, run: npx wrangler secret list --name kmtracker"
