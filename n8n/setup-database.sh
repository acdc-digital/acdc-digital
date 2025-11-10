#!/bin/bash

# ========================================
# ACDC DIGITAL - Database Setup Helper
# ========================================

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}Database Configuration Helper${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

echo "Which database do you want to use?"
echo "1) SQLite (recommended for getting started)"
echo "2) PostgreSQL (recommended for production)"
echo ""
read -p "Enter choice (1 or 2): " db_choice

if [ "$db_choice" == "1" ]; then
    echo ""
    echo -e "${GREEN}SQLite is already configured!${NC}"
    echo ""
    echo "Current configuration:"
    echo "  - Database: SQLite"
    echo "  - Location: ~/.n8n/database.sqlite"
    echo "  - No additional setup needed"
    echo ""
    
elif [ "$db_choice" == "2" ]; then
    echo ""
    echo -e "${YELLOW}PostgreSQL Setup${NC}"
    echo ""
    
    # Check if PostgreSQL is installed
    if ! command -v psql &> /dev/null; then
        echo -e "${YELLOW}PostgreSQL not found. Would you like to install it?${NC}"
        read -p "Install PostgreSQL? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo "Installing PostgreSQL..."
            brew install postgresql@15
            brew services start postgresql@15
            echo -e "${GREEN}✓ PostgreSQL installed and started${NC}"
        else
            echo "Please install PostgreSQL manually and run this script again."
            exit 1
        fi
    fi
    
    echo ""
    echo "Enter PostgreSQL database details:"
    echo ""
    
    read -p "Database name (default: n8n_acdc): " db_name
    db_name=${db_name:-n8n_acdc}
    
    read -p "Database host (default: localhost): " db_host
    db_host=${db_host:-localhost}
    
    read -p "Database port (default: 5432): " db_port
    db_port=${db_port:-5432}
    
    read -p "Database user (default: postgres): " db_user
    db_user=${db_user:-postgres}
    
    read -s -p "Database password: " db_password
    echo ""
    
    # Create database
    echo ""
    echo -e "${BLUE}Creating database...${NC}"
    createdb "$db_name" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✓ Database created${NC}"
    else
        echo -e "${YELLOW}Note: Database may already exist${NC}"
    fi
    
    # Update .env file
    echo ""
    echo -e "${BLUE}Updating .env file...${NC}"
    
    ENV_FILE=".env"
    if [ ! -f "$ENV_FILE" ]; then
        echo -e "${RED}Error: .env file not found${NC}"
        exit 1
    fi
    
    # Create backup
    cp "$ENV_FILE" "$ENV_FILE.backup"
    
    # Update database settings
    sed -i.bak "s|^DB_TYPE=.*|DB_TYPE=postgresdb|g" "$ENV_FILE"
    
    # Add PostgreSQL settings if not present
    if ! grep -q "DB_POSTGRESDB_DATABASE" "$ENV_FILE"; then
        echo "" >> "$ENV_FILE"
        echo "# PostgreSQL Configuration (uncommented by setup script)" >> "$ENV_FILE"
        echo "DB_POSTGRESDB_DATABASE=$db_name" >> "$ENV_FILE"
        echo "DB_POSTGRESDB_HOST=$db_host" >> "$ENV_FILE"
        echo "DB_POSTGRESDB_PORT=$db_port" >> "$ENV_FILE"
        echo "DB_POSTGRESDB_USER=$db_user" >> "$ENV_FILE"
        echo "DB_POSTGRESDB_PASSWORD=$db_password" >> "$ENV_FILE"
        echo "DB_POSTGRESDB_POOL_SIZE=5" >> "$ENV_FILE"
    else
        sed -i.bak "s|^# DB_POSTGRESDB_DATABASE=.*|DB_POSTGRESDB_DATABASE=$db_name|g" "$ENV_FILE"
        sed -i.bak "s|^# DB_POSTGRESDB_HOST=.*|DB_POSTGRESDB_HOST=$db_host|g" "$ENV_FILE"
        sed -i.bak "s|^# DB_POSTGRESDB_PORT=.*|DB_POSTGRESDB_PORT=$db_port|g" "$ENV_FILE"
        sed -i.bak "s|^# DB_POSTGRESDB_USER=.*|DB_POSTGRESDB_USER=$db_user|g" "$ENV_FILE"
        sed -i.bak "s|^# DB_POSTGRESDB_PASSWORD=.*|DB_POSTGRESDB_PASSWORD=$db_password|g" "$ENV_FILE"
        sed -i.bak "s|^# DB_POSTGRESDB_POOL_SIZE=.*|DB_POSTGRESDB_POOL_SIZE=5|g" "$ENV_FILE"
    fi
    
    rm -f "$ENV_FILE.bak"
    
    echo -e "${GREEN}✓ Configuration updated${NC}"
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}PostgreSQL Setup Complete!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo "Database details:"
    echo "  - Database: $db_name"
    echo "  - Host: $db_host"
    echo "  - Port: $db_port"
    echo "  - User: $db_user"
    echo ""
    echo "Backup of previous .env: .env.backup"
    echo ""
    
else
    echo "Invalid choice"
    exit 1
fi

echo -e "${BLUE}Next steps:${NC}"
echo "1. Start n8n: ./start-n8n.sh"
echo "2. Access n8n at: http://localhost:5678"
echo ""
