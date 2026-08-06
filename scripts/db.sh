#!/usr/bin/env bash
#
# Database Deployment & Migration Helper Script
# Usage: ./scripts/db.sh <command> [args]

set -euo pipefail

# ANSI Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Determine project root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# Function to display help
show_help() {
    echo -e "${CYAN}Database Deployment & Migration Helper Script${NC}"
    echo -e "Usage: ./scripts/db.sh <command> [options]\n"
    echo -e "Commands:"
    echo -e "  ${GREEN}migrate${NC}                        Run database migrations on production"
    echo -e "  ${GREEN}status${NC}                         Show applied and pending migrations"
    echo -e "  ${GREEN}seed${NC}                           Run seed.sql on production"
    echo -e "  ${GREEN}reset-password <email> <pass>${NC}  Reset a user's password"
    echo -e "  ${GREEN}help${NC}                           Show this help message"
}

# Function to ensure DATABASE_URL is set
ensure_database_url() {
    if [ -z "${DATABASE_URL:-}" ]; then
        if [ -f "${PROJECT_ROOT}/.env.production.local" ]; then
            echo -e "${BLUE}Loading DATABASE_URL from .env.production.local...${NC}"
            ENV_DB_URL=$(grep -E '^DATABASE_URL=' "${PROJECT_ROOT}/.env.production.local" | head -n 1 | cut -d '=' -f2- || true)
            ENV_DB_URL="${ENV_DB_URL#\"}"
            ENV_DB_URL="${ENV_DB_URL%\"}"
            ENV_DB_URL="${ENV_DB_URL#\'}"
            ENV_DB_URL="${ENV_DB_URL%\'}"
            if [ -n "${ENV_DB_URL}" ]; then
                DATABASE_URL="${ENV_DB_URL}"
                export DATABASE_URL
            fi
        fi
    fi

    if [ -z "${DATABASE_URL:-}" ]; then
        echo -e "${YELLOW}DATABASE_URL is not set.${NC}"
        read -rp "Please enter DATABASE_URL: " DATABASE_URL
        if [ -z "${DATABASE_URL:-}" ]; then
            echo -e "${RED}Error: DATABASE_URL is required.${NC}" >&2
            exit 1
        fi
        export DATABASE_URL
    fi
}

# Main script logic
COMMAND="${1:-help}"

case "$COMMAND" in
    migrate)
        ensure_database_url
        echo -e "${BLUE}Running database migrations on production...${NC}"
        if npx supabase db push --db-url "$DATABASE_URL"; then
            echo -e "${GREEN}✓ Migrations applied successfully!${NC}"
        else
            echo -e "${RED}✗ Migration failed.${NC}" >&2
            exit 1
        fi
        ;;
    status)
        ensure_database_url
        echo -e "${BLUE}Checking migration status...${NC}"
        if npx supabase migration list --db-url "$DATABASE_URL"; then
            echo -e "${GREEN}✓ Migration status retrieved successfully.${NC}"
        else
            echo -e "${RED}✗ Failed to retrieve migration status.${NC}" >&2
            exit 1
        fi
        ;;
    seed)
        ensure_database_url
        SEED_FILE="${PROJECT_ROOT}/supabase/seed.sql"
        if [ ! -f "$SEED_FILE" ]; then
            echo -e "${RED}Error: seed.sql not found at ${SEED_FILE}${NC}" >&2
            exit 1
        fi
        echo -e "${BLUE}Running seed.sql on production database...${NC}"
        if psql "$DATABASE_URL" -f "$SEED_FILE"; then
            echo -e "${GREEN}✓ Database seeded successfully!${NC}"
        else
            echo -e "${RED}✗ Database seeding failed.${NC}" >&2
            exit 1
        fi
        ;;
    reset-password)
        if [ $# -lt 3 ]; then
            echo -e "${RED}Error: Missing required arguments.${NC}" >&2
            echo -e "Usage: ./scripts/db.sh reset-password <email> <new-password>"
            exit 1
        fi
        EMAIL="$2"
        NEW_PASSWORD="$3"

        ensure_database_url
        echo -e "${BLUE}Resetting password for ${EMAIL}...${NC}"

        SQL_CMD="UPDATE auth.users SET encrypted_password = crypt(:'pass', gen_salt('bf')), updated_at = NOW() WHERE email = :'email';"

        if RESULT=$(psql "$DATABASE_URL" -v email="$EMAIL" -v pass="$NEW_PASSWORD" -c "$SQL_CMD" 2>&1); then
            echo "$RESULT"
            echo -e "${GREEN}✓ Password reset command executed for ${EMAIL}.${NC}"
        else
            echo -e "${RED}✗ Failed to reset password for ${EMAIL}.${NC}" >&2
            echo -e "${RED}${RESULT}${NC}" >&2
            exit 1
        fi
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        echo -e "${RED}Error: Unknown command '$COMMAND'${NC}\n" >&2
        show_help
        exit 1
        ;;
esac
