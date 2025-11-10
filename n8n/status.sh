#!/bin/bash

# ========================================
# ACDC DIGITAL - N8N Status Checker
# ========================================

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}N8N Instance Status Check${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if n8n is running
if pgrep -x "n8n" > /dev/null; then
    echo -e "${GREEN}✓ n8n is running${NC}"
    N8N_PID=$(pgrep -x "n8n")
    echo -e "  PID: $N8N_PID"
else
    echo -e "${RED}✗ n8n is not running${NC}"
fi

echo ""

# Check configuration
if [ -f ".env" ]; then
    echo -e "${GREEN}✓ Configuration file exists${NC}"
    
    # Load env
    set -a
    source .env 2>/dev/null
    set +a
    
    echo ""
    echo -e "${BLUE}Configuration:${NC}"
    echo -e "  URL: ${GREEN}${N8N_EDITOR_BASE_URL:-Not set}${NC}"
    echo -e "  Port: ${GREEN}${N8N_PORT:-5678}${NC}"
    echo -e "  Database: ${GREEN}${DB_TYPE:-sqlite}${NC}"
    echo -e "  Timezone: ${GREEN}${GENERIC_TIMEZONE:-America/New_York}${NC}"
    
    # Check if secrets are set
    echo ""
    echo -e "${BLUE}Security:${NC}"
    if [[ "$N8N_ENCRYPTION_KEY" == "GENERATE_AND_REPLACE_THIS_KEY" ]] || [ -z "$N8N_ENCRYPTION_KEY" ]; then
        echo -e "  ${RED}✗ Encryption key not set (run ./setup.sh)${NC}"
    else
        echo -e "  ${GREEN}✓ Encryption key configured${NC}"
    fi
    
    if [[ "$N8N_USER_MANAGEMENT_JWT_SECRET" == "GENERATE_AND_REPLACE_THIS_SECRET" ]] || [ -z "$N8N_USER_MANAGEMENT_JWT_SECRET" ]; then
        echo -e "  ${RED}✗ JWT secret not set (run ./setup.sh)${NC}"
    else
        echo -e "  ${GREEN}✓ JWT secret configured${NC}"
    fi
    
else
    echo -e "${RED}✗ Configuration file not found${NC}"
fi

echo ""

# Check database
echo -e "${BLUE}Database:${NC}"
if [ "${DB_TYPE:-sqlite}" == "sqlite" ]; then
    if [ -f "$HOME/.n8n/database.sqlite" ]; then
        DB_SIZE=$(du -h "$HOME/.n8n/database.sqlite" | cut -f1)
        echo -e "  ${GREEN}✓ SQLite database exists${NC}"
        echo -e "  Size: $DB_SIZE"
        echo -e "  Location: ~/.n8n/database.sqlite"
    else
        echo -e "  ${YELLOW}⚠ Database not initialized yet${NC}"
    fi
elif [ "${DB_TYPE}" == "postgresdb" ]; then
    echo -e "  Type: PostgreSQL"
    echo -e "  Database: ${DB_POSTGRESDB_DATABASE:-n8n}"
    echo -e "  Host: ${DB_POSTGRESDB_HOST:-localhost}"
    # Test connection (if psql available)
    if command -v psql &> /dev/null; then
        if PGPASSWORD="${DB_POSTGRESDB_PASSWORD}" psql -h "${DB_POSTGRESDB_HOST:-localhost}" -U "${DB_POSTGRESDB_USER:-postgres}" -d "${DB_POSTGRESDB_DATABASE:-n8n}" -c '\q' 2>/dev/null; then
            echo -e "  ${GREEN}✓ Connection successful${NC}"
        else
            echo -e "  ${RED}✗ Cannot connect to database${NC}"
        fi
    fi
fi

echo ""

# Check directories
echo -e "${BLUE}Data Directories:${NC}"
if [ -d "$HOME/.n8n" ]; then
    echo -e "  ${GREEN}✓ Data directory exists${NC}"
    echo -e "  Location: ~/.n8n/"
    
    if [ -d "$HOME/.n8n/logs" ]; then
        echo -e "  ${GREEN}✓ Logs directory exists${NC}"
        if [ -f "$HOME/.n8n/logs/n8n.log" ]; then
            LOG_SIZE=$(du -h "$HOME/.n8n/logs/n8n.log" | cut -f1)
            LOG_LINES=$(wc -l < "$HOME/.n8n/logs/n8n.log")
            echo -e "    Size: $LOG_SIZE ($LOG_LINES lines)"
        fi
    fi
    
    if [ -d "$HOME/.n8n/binaryData" ]; then
        echo -e "  ${GREEN}✓ Binary data directory exists${NC}"
        BINARY_SIZE=$(du -sh "$HOME/.n8n/binaryData" 2>/dev/null | cut -f1)
        echo -e "    Size: $BINARY_SIZE"
    fi
else
    echo -e "  ${YELLOW}⚠ Data directory not created yet${NC}"
fi

echo ""

# Check port availability
echo -e "${BLUE}Network:${NC}"
PORT=${N8N_PORT:-5678}
if lsof -i :$PORT > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓ Port $PORT is in use${NC}"
else
    echo -e "  ${YELLOW}⚠ Port $PORT is available${NC}"
fi

# Test if n8n is accessible
if curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT" 2>/dev/null | grep -q "200\|302"; then
    echo -e "  ${GREEN}✓ n8n is accessible at http://localhost:$PORT${NC}"
else
    if pgrep -x "n8n" > /dev/null; then
        echo -e "  ${YELLOW}⚠ n8n is running but not responding yet${NC}"
    else
        echo -e "  ${RED}✗ n8n is not accessible${NC}"
    fi
fi

echo ""

# Check secrets backup
echo -e "${BLUE}Backups:${NC}"
if [ -f ".secrets" ]; then
    echo -e "  ${GREEN}✓ Secrets backup exists${NC}"
    echo -e "  ${YELLOW}⚠ Ensure this is backed up securely!${NC}"
else
    echo -e "  ${YELLOW}⚠ No secrets backup found${NC}"
fi

echo ""

# Quick actions
echo -e "${BLUE}Quick Actions:${NC}"
if pgrep -x "n8n" > /dev/null; then
    echo "  • View logs: tail -f ~/.n8n/logs/n8n.log"
    echo "  • Access n8n: http://localhost:$PORT"
    echo "  • Stop n8n: Press Ctrl+C in the n8n terminal"
else
    echo "  • Start n8n: ./start-n8n.sh"
    echo "  • Check logs: tail -f ~/.n8n/logs/n8n.log"
fi

echo ""
echo -e "${BLUE}========================================${NC}"
