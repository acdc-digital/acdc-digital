# Database Configuration for N8N

## Overview

N8N supports two database types:
- **SQLite** - File-based database (default, recommended for getting started)
- **PostgreSQL** - Client-server database (recommended for production)

---

## SQLite (Default - Recommended for Starting)

### What is SQLite?

SQLite is a lightweight, file-based database that requires zero configuration. Perfect for:
- Development and testing
- Small to medium teams
- Single-instance deployments
- Getting started quickly

### Configuration

**Already configured by default!** Your `.env` file has:

```bash
DB_TYPE=sqlite
```

### Database Location

The database file is automatically created at:
```
~/.n8n/database.sqlite
```

### How to Use

1. Run setup:
   ```bash
   ./setup.sh
   ```

2. Start n8n:
   ```bash
   ./start-n8n.sh
   ```

That's it! The database is created automatically on first start.

### Backup SQLite Database

```bash
# Stop n8n first
# Then copy the database file
cp ~/.n8n/database.sqlite ~/.n8n/database.sqlite.backup

# Or backup with date
cp ~/.n8n/database.sqlite ~/n8n-backup-$(date +%Y%m%d).sqlite
```

### Restore SQLite Database

```bash
# Stop n8n
# Replace the database file
cp ~/n8n-backup-20251108.sqlite ~/.n8n/database.sqlite
# Start n8n
```

### Pros and Cons

**Pros:**
- ✅ Zero configuration required
- ✅ No separate database server needed
- ✅ Easy backups (single file)
- ✅ Perfect for development
- ✅ Low resource usage

**Cons:**
- ❌ Not ideal for high concurrency
- ❌ Can't use with multiple n8n instances (queue mode with multiple workers)
- ❌ Single file can be a bottleneck at scale

---

## PostgreSQL (Recommended for Production)

### What is PostgreSQL?

PostgreSQL is a powerful, open-source relational database. Best for:
- Production deployments
- High concurrency needs
- Multiple n8n instances (scaling)
- Large teams with many workflows

### Quick Setup with Helper Script

We've created a script to make PostgreSQL setup easy:

```bash
cd /Users/matthewsimon/Projects/acdc-digital/n8n
./setup-database.sh
```

**The script will:**
1. Check if PostgreSQL is installed
2. Offer to install PostgreSQL if missing
3. Prompt for database details (or use defaults)
4. Create the database
5. Update your `.env` file automatically
6. Test the connection

### Manual Setup

#### Step 1: Install PostgreSQL

```bash
# Install via Homebrew
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Verify it's running
brew services list
```

#### Step 2: Create Database and User

Connect to PostgreSQL:
```bash
psql postgres
```

Run these SQL commands:
```sql
-- Create database for n8n
CREATE DATABASE n8n_acdc;

-- Create user with password
CREATE USER n8n_user WITH PASSWORD 'your_secure_password_here';

-- Grant all privileges
GRANT ALL PRIVILEGES ON DATABASE n8n_acdc TO n8n_user;

-- Exit
\q
```

#### Step 3: Update Configuration

Edit `.env` file:
```bash
nano .env
```

Find the PostgreSQL section and update:
```bash
# Change from sqlite to postgresdb
DB_TYPE=postgresdb

# PostgreSQL Configuration
DB_POSTGRESDB_DATABASE=n8n_acdc
DB_POSTGRESDB_HOST=localhost
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_USER=n8n_user
DB_POSTGRESDB_PASSWORD=your_secure_password_here
DB_POSTGRESDB_POOL_SIZE=5
DB_POSTGRESDB_SCHEMA=public
```

#### Step 4: Start N8N

```bash
./start-n8n.sh
```

N8N will automatically create all necessary tables in PostgreSQL.

### Connection Testing

Test your PostgreSQL connection:

```bash
# Test connection
psql -h localhost -U n8n_user -d n8n_acdc -c '\dt'

# Or use the status script
./status.sh
```

### PostgreSQL Configuration Options

All available PostgreSQL settings in `.env`:

```bash
# Required
DB_TYPE=postgresdb
DB_POSTGRESDB_DATABASE=n8n_acdc          # Database name
DB_POSTGRESDB_HOST=localhost              # Database host
DB_POSTGRESDB_PORT=5432                   # Database port
DB_POSTGRESDB_USER=n8n_user              # Database user
DB_POSTGRESDB_PASSWORD=secure_password    # Database password

# Optional
DB_POSTGRESDB_SCHEMA=public              # Schema name (default: public)
DB_POSTGRESDB_POOL_SIZE=5                # Connection pool size
DB_POSTGRESDB_CONNECTION_TIMEOUT=20000   # Connection timeout (ms)
DB_POSTGRESDB_IDLE_CONNECTION_TIMEOUT=30000  # Idle timeout (ms)

# SSL/TLS (for secure connections)
DB_POSTGRESDB_SSL_ENABLED=false          # Enable SSL
DB_POSTGRESDB_SSL_CA=/path/to/ca.crt     # CA certificate path
DB_POSTGRESDB_SSL_CERT=/path/to/cert.crt # Client certificate
DB_POSTGRESDB_SSL_KEY=/path/to/key.key   # Client key
DB_POSTGRESDB_SSL_REJECT_UNAUTHORIZED=true  # Verify SSL certificate
```

### Required Permissions

N8N needs these PostgreSQL permissions:
- CREATE tables
- ALTER tables
- INSERT, UPDATE, DELETE data
- SELECT data

The `GRANT ALL PRIVILEGES` command above provides all necessary permissions.

### Backup PostgreSQL Database

#### Using pg_dump

```bash
# Backup database
pg_dump -h localhost -U n8n_user -d n8n_acdc > n8n-backup-$(date +%Y%m%d).sql

# Or with compression
pg_dump -h localhost -U n8n_user -d n8n_acdc | gzip > n8n-backup-$(date +%Y%m%d).sql.gz
```

#### Automated Backup Script

Create `backup-db.sh`:
```bash
#!/bin/bash
BACKUP_DIR=~/n8n-backups
mkdir -p $BACKUP_DIR
pg_dump -h localhost -U n8n_user -d n8n_acdc | gzip > $BACKUP_DIR/n8n-$(date +%Y%m%d-%H%M%S).sql.gz
# Keep only last 30 days
find $BACKUP_DIR -name "n8n-*.sql.gz" -mtime +30 -delete
```

Schedule with cron:
```bash
# Run daily at 2 AM
0 2 * * * /path/to/backup-db.sh
```

### Restore PostgreSQL Database

```bash
# Stop n8n first

# Drop existing database (if needed)
psql postgres -c "DROP DATABASE n8n_acdc;"
psql postgres -c "CREATE DATABASE n8n_acdc;"
psql postgres -c "GRANT ALL PRIVILEGES ON DATABASE n8n_acdc TO n8n_user;"

# Restore from backup
psql -h localhost -U n8n_user -d n8n_acdc < n8n-backup-20251108.sql

# Or from compressed backup
gunzip -c n8n-backup-20251108.sql.gz | psql -h localhost -U n8n_user -d n8n_acdc

# Start n8n
./start-n8n.sh
```

### PostgreSQL Monitoring

#### Check Database Size

```bash
psql -h localhost -U n8n_user -d n8n_acdc -c "
SELECT pg_size_pretty(pg_database_size('n8n_acdc')) AS database_size;
"
```

#### Check Connection Count

```bash
psql -h localhost -U n8n_user -d n8n_acdc -c "
SELECT count(*) FROM pg_stat_activity WHERE datname = 'n8n_acdc';
"
```

#### View Active Queries

```bash
psql -h localhost -U n8n_user -d n8n_acdc -c "
SELECT pid, state, query FROM pg_stat_activity WHERE datname = 'n8n_acdc';
"
```

### Pros and Cons

**Pros:**
- ✅ Better performance at scale
- ✅ Supports high concurrency
- ✅ Can use with multiple n8n instances
- ✅ Advanced query capabilities
- ✅ Better data integrity
- ✅ Industry-standard database

**Cons:**
- ❌ Requires separate database server
- ❌ More complex setup
- ❌ Higher resource usage
- ❌ Requires database maintenance

---

## Migrating from SQLite to PostgreSQL

### Option 1: Export/Import Workflows

1. Export all workflows from n8n UI:
   - Settings → Workflows → Export
   
2. Stop n8n and switch to PostgreSQL

3. Start n8n with new database

4. Import workflows back:
   - Settings → Workflows → Import

### Option 2: Using Migration Tools

N8N doesn't provide a built-in migration tool, but you can:

1. Export credentials and workflows as JSON
2. Switch database configuration
3. Re-import everything

**Note:** This will lose execution history. For production migrations, plan accordingly.

---

## Troubleshooting

### SQLite Issues

**Error: Database locked**
- Another n8n instance might be running
- Check: `ps aux | grep n8n`
- Kill other instances or wait

**Error: Unable to open database**
- Check file permissions
- Check disk space: `df -h`
- Verify path: `~/.n8n/database.sqlite`

### PostgreSQL Issues

**Error: Connection refused**
```bash
# Check if PostgreSQL is running
brew services list

# Start if stopped
brew services start postgresql@15
```

**Error: Authentication failed**
- Check username/password in `.env`
- Verify user exists: `psql postgres -c "\du"`
- Reset password if needed

**Error: Database does not exist**
```bash
# Create database
createdb -h localhost -U postgres n8n_acdc
```

**Error: Permission denied**
```sql
-- Grant permissions again
GRANT ALL PRIVILEGES ON DATABASE n8n_acdc TO n8n_user;
```

### Connection Testing

Use the status script:
```bash
./status.sh
```

Or test manually:
```bash
# SQLite
ls -lh ~/.n8n/database.sqlite

# PostgreSQL
psql -h localhost -U n8n_user -d n8n_acdc -c '\dt'
```

---

## Recommendations by Use Case

### Small Team / Getting Started
→ **Use SQLite**
- Zero configuration
- Start immediately
- Easy to manage

### Medium Team / Growing
→ **Start with SQLite, plan PostgreSQL migration**
- Begin with SQLite for quick start
- Monitor performance
- Migrate when you hit limits

### Large Team / Production
→ **Use PostgreSQL from start**
- Better scalability
- Supports queue mode
- Professional grade

### High Availability / Enterprise
→ **Use PostgreSQL with replication**
- Set up primary/replica
- Use connection pooling
- Regular backups

---

## Security Best Practices

### SQLite
- ✅ Restrict file permissions: `chmod 600 ~/.n8n/database.sqlite`
- ✅ Regular backups to secure location
- ✅ Encrypt backups
- ✅ Don't expose database file via web server

### PostgreSQL
- ✅ Use strong passwords (16+ characters)
- ✅ Enable SSL/TLS for connections
- ✅ Limit network access (firewall rules)
- ✅ Regular security updates
- ✅ Use connection pooling
- ✅ Monitor access logs
- ✅ Encrypt backups
- ✅ Use separate database user for n8n (not postgres superuser)

---

## Performance Tuning

### SQLite
```bash
# Enable WAL mode for better concurrent access
# This is automatically configured when DB_SQLITE_POOL_SIZE > 0
DB_SQLITE_POOL_SIZE=1

# Run VACUUM periodically to optimize
DB_SQLITE_VACUUM_ON_STARTUP=false  # Set true for maintenance
```

### PostgreSQL

Adjust pool size based on load:
```bash
# Conservative (default)
DB_POSTGRESDB_POOL_SIZE=5

# Higher load
DB_POSTGRESDB_POOL_SIZE=10

# Very high load
DB_POSTGRESDB_POOL_SIZE=20
```

Tune PostgreSQL itself (in `postgresql.conf`):
```conf
max_connections = 100
shared_buffers = 256MB
effective_cache_size = 1GB
maintenance_work_mem = 64MB
```

---

## Quick Reference

### Check Current Database

```bash
# View configuration
grep DB_TYPE /Users/matthewsimon/Projects/acdc-digital/n8n/.env

# Or use status script
./status.sh
```

### Switch Databases

```bash
# Edit configuration
nano .env

# Change DB_TYPE=sqlite to DB_TYPE=postgresdb
# Or vice versa

# Restart n8n
./n8n.sh restart
```

### Database Commands

```bash
# SQLite
sqlite3 ~/.n8n/database.sqlite ".tables"
sqlite3 ~/.n8n/database.sqlite ".schema"

# PostgreSQL
psql -h localhost -U n8n_user -d n8n_acdc -c "\dt"
psql -h localhost -U n8n_user -d n8n_acdc -c "\d+ workflow_entity"
```

---

## Support

### Documentation
- N8N Database Docs: https://docs.n8n.io/hosting/configuration/database/
- PostgreSQL Docs: https://www.postgresql.org/docs/

### Getting Help
- Run status check: `./status.sh`
- Check logs: `tail -f ~/.n8n/logs/n8n.log`
- ACDC Digital: #n8n-automation Slack channel

---

**Last Updated:** November 8, 2025
