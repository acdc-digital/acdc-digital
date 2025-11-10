#!/bin/bash

# ========================================
# ACDC DIGITAL - N8N Startup Script
# ========================================

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ENV_FILE="$SCRIPT_DIR/.env"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}ACDC DIGITAL - N8N Instance${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if .env file exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: .env file not found at $ENV_FILE${NC}"
    echo "Please create the .env file first."
    exit 1
fi

# Load environment variables
echo -e "${GREEN}Loading environment variables...${NC}"
set -a
source "$ENV_FILE"
set +a

# Check for required secrets
echo -e "${GREEN}Checking configuration...${NC}"
NEEDS_SETUP=false

if [[ "$N8N_ENCRYPTION_KEY" == "GENERATE_AND_REPLACE_THIS_KEY" ]]; then
    echo -e "${YELLOW}⚠️  N8N_ENCRYPTION_KEY needs to be set${NC}"
    NEEDS_SETUP=true
fi

if [[ "$N8N_USER_MANAGEMENT_JWT_SECRET" == "GENERATE_AND_REPLACE_THIS_SECRET" ]]; then
    echo -e "${YELLOW}⚠️  N8N_USER_MANAGEMENT_JWT_SECRET needs to be set${NC}"
    NEEDS_SETUP=true
fi

if [ "$NEEDS_SETUP" = true ]; then
    echo ""
    echo -e "${YELLOW}Run the setup script first:${NC}"
    echo -e "  ./setup.sh"
    echo ""
    read -p "Continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Create necessary directories
echo -e "${GREEN}Creating directories...${NC}"
mkdir -p ~/.n8n/logs
mkdir -p ~/.n8n/binaryData

# Display configuration
echo ""
echo -e "${BLUE}Configuration:${NC}"
echo -e "  URL: ${GREEN}$N8N_EDITOR_BASE_URL${NC}"
echo -e "  Database: ${GREEN}$DB_TYPE${NC}"
echo -e "  Timezone: ${GREEN}$GENERIC_TIMEZONE${NC}"
echo -e "  Log Location: ${GREEN}~/.n8n/logs/n8n.log${NC}"
echo ""

# Start n8n
echo -e "${GREEN}Starting n8n...${NC}"
echo ""
echo -e "${BLUE}========================================${NC}"
echo ""

# Export environment variables and start n8n
export $(grep -v '^#' "$ENV_FILE" | xargs)
n8n start
