#!/bin/bash

# ========================================
# ACDC DIGITAL - N8N Setup Script
# ========================================

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ENV_FILE="$SCRIPT_DIR/.env"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}ACDC DIGITAL - N8N Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

if [ ! -f "$ENV_FILE" ]; then
    echo -e "${RED}Error: .env file not found${NC}"
    exit 1
fi

echo -e "${GREEN}This script will help you configure security credentials.${NC}"
echo ""

# Generate encryption key
echo -e "${BLUE}1. Generating encryption key...${NC}"
ENCRYPTION_KEY=$(openssl rand -base64 32)
echo -e "   ${GREEN}✓ Generated${NC}"

# Generate JWT secret
echo -e "${BLUE}2. Generating JWT secret...${NC}"
JWT_SECRET=$(openssl rand -base64 32)
echo -e "   ${GREEN}✓ Generated${NC}"

# Update .env file
echo ""
echo -e "${BLUE}3. Updating .env file...${NC}"

# Create a temporary file
TMP_FILE=$(mktemp)

# Replace the keys
sed "s|N8N_ENCRYPTION_KEY=GENERATE_AND_REPLACE_THIS_KEY|N8N_ENCRYPTION_KEY=$ENCRYPTION_KEY|g" "$ENV_FILE" > "$TMP_FILE"
sed -i.bak "s|N8N_USER_MANAGEMENT_JWT_SECRET=GENERATE_AND_REPLACE_THIS_SECRET|N8N_USER_MANAGEMENT_JWT_SECRET=$JWT_SECRET|g" "$TMP_FILE"

# Move the temp file to replace the original
mv "$TMP_FILE" "$ENV_FILE"
rm -f "$TMP_FILE.bak"

echo -e "   ${GREEN}✓ Updated${NC}"

# Store secrets in a secure file
SECRETS_FILE="$SCRIPT_DIR/.secrets"
cat > "$SECRETS_FILE" << EOF
# ========================================
# ACDC DIGITAL - N8N SECRETS
# IMPORTANT: Keep this file secure and backed up!
# Generated: $(date)
# ========================================

N8N_ENCRYPTION_KEY=$ENCRYPTION_KEY
N8N_USER_MANAGEMENT_JWT_SECRET=$JWT_SECRET

# IMPORTANT NOTES:
# - NEVER lose the encryption key - you won't be able to decrypt credentials
# - Store this file in a secure location (password manager, vault, etc.)
# - Do NOT commit this file to version control
EOF

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT:${NC}"
echo -e "1. Secrets saved to: ${GREEN}.secrets${NC}"
echo -e "2. ${RED}BACKUP THIS FILE SECURELY!${NC}"
echo -e "3. Never lose the encryption key or you won't be able to decrypt credentials"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo -e "1. Review and update SMTP settings in .env"
echo -e "2. Update N8N_EDITOR_BASE_URL when you have a domain"
echo -e "3. Run: ${GREEN}./start-n8n.sh${NC}"
echo ""
