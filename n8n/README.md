# ACDC Digital - N8N Configuration Guide

## Overview

This directory contains the self-hosted n8n instance configuration for ACDC Digital. N8N is a workflow automation tool that allows you to connect different services and automate tasks.

## Quick Start

### 1. Initial Setup

Run the setup script to generate security keys:

```bash
cd /Users/matthewsimon/Projects/acdc-digital/n8n
./setup.sh
```

This will:
- Generate a secure encryption key for credentials
- Generate a JWT secret for authentication
- Update the `.env` file with these secrets
- Create a `.secrets` file as a backup

**⚠️ IMPORTANT**: Back up the `.secrets` file in a secure location (password manager, vault, etc.)

### 2. Configure SMTP (Email)

Edit `.env` and update the SMTP settings for your email provider:

```bash
N8N_SMTP_HOST=smtp.gmail.com  # Your SMTP server
N8N_SMTP_PORT=587
N8N_SMTP_USER=your-email@acdcdigital.com
N8N_SMTP_PASS=your-app-password
N8N_SMTP_SENDER=ACDC Digital N8N <no-reply@acdcdigital.com>
```

**For Gmail**:
1. Enable 2FA on your Google account
2. Create an App Password: https://myaccount.google.com/apppasswords
3. Use the app password in `N8N_SMTP_PASS`

### 3. Start N8N

```bash
./start-n8n.sh
```

Access n8n at: http://localhost:5678

### 4. First Time Login

1. Open http://localhost:5678
2. Create your admin account (first user is automatically admin)
3. Complete the onboarding

## Configuration Overview

### Current Setup

- **Database**: SQLite (stored in `~/.n8n/`)
- **Execution Mode**: Regular (single instance)
- **Binary Data**: Filesystem storage
- **Timezone**: America/New_York
- **Security**: MFA enabled, environment access blocked

### Key Features Enabled

✅ Workflow templates
✅ Community packages (verified only)
✅ Python support in Code node
✅ Task runners for code execution
✅ Two-factor authentication
✅ Execution data saved and auto-pruned (14 days)
✅ JSON logging for better debugging

## Configuration Files

### `.env`
Main configuration file with all environment variables. Contains:
- Deployment settings (URL, host, port)
- Database configuration
- Security settings
- Workflow execution settings
- Email/SMTP configuration
- Logging configuration
- Feature flags

### `.secrets`
Backup file containing critical secrets:
- Encryption key
- JWT secret

**Never commit this file to git!**

### `.gitignore`
Added to prevent committing sensitive files.

## Next Steps for Production

### 1. Database Migration (Optional but Recommended)

For production, consider migrating to PostgreSQL:

1. Install PostgreSQL:
```bash
brew install postgresql@15
brew services start postgresql@15
```

2. Create database:
```bash
createdb n8n_acdc
```

3. Update `.env`:
```bash
DB_TYPE=postgresdb
DB_POSTGRESDB_DATABASE=n8n_acdc
DB_POSTGRESDB_HOST=localhost
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_USER=your_user
DB_POSTGRESDB_PASSWORD=your_password
```

### 2. Set Up Custom Domain

1. Update `.env`:
```bash
N8N_EDITOR_BASE_URL=https://n8n.acdcdigital.com
N8N_PROTOCOL=https
N8N_SSL_KEY=/path/to/ssl/key.pem
N8N_SSL_CERT=/path/to/ssl/cert.pem
```

2. Configure reverse proxy (nginx, Caddy, etc.)

### 3. Enable Queue Mode (for Scaling)

For better performance with many workflows:

1. Install Redis:
```bash
brew install redis
brew services start redis
```

2. Update `.env`:
```bash
EXECUTIONS_MODE=queue
QUEUE_BULL_REDIS_HOST=localhost
QUEUE_BULL_REDIS_PORT=6379
```

### 4. External Binary Storage (S3)

For better scalability, move binary data to S3:

1. Create S3 bucket: `n8n-acdc-binary-data`
2. Update `.env`:
```bash
N8N_DEFAULT_BINARY_DATA_MODE=s3
N8N_EXTERNAL_STORAGE_S3_HOST=s3.us-east-1.amazonaws.com
N8N_EXTERNAL_STORAGE_S3_BUCKET_NAME=n8n-acdc-binary-data
N8N_EXTERNAL_STORAGE_S3_BUCKET_REGION=us-east-1
N8N_EXTERNAL_STORAGE_S3_ACCESS_KEY=your_key
N8N_EXTERNAL_STORAGE_S3_ACCESS_SECRET=your_secret
```

### 5. Enable Monitoring

Uncomment in `.env`:
```bash
N8N_METRICS=true
N8N_METRICS_PREFIX=n8n_acdc_
```

Set up Prometheus/Grafana to scrape `http://localhost:5678/metrics`

## Security Best Practices

✅ **Implemented**:
- Unique encryption key generated
- JWT authentication configured
- Environment access blocked in nodes
- File access restricted
- MFA enabled
- Secure cookies enforced

⚠️ **TODO**:
- [ ] Set up HTTPS with valid SSL certificates
- [ ] Configure firewall rules
- [ ] Set up regular database backups
- [ ] Implement IP allowlisting if needed
- [ ] Review and restrict node access (NODES_EXCLUDE)

## User Management

### Adding Users

1. Navigate to Settings > Users in the n8n UI
2. Click "Invite User"
3. Enter email address
4. User receives invitation email (requires SMTP configured)

### Roles

- **Owner**: Full access, can manage users
- **Admin**: Full workflow access, cannot manage users
- **Member**: Limited access based on project permissions

## Workflow Best Practices

### Naming Convention
Use descriptive names:
- `[Department] - [Purpose] - [Trigger]`
- Example: `Sales - Lead Enrichment - Webhook`

### Tags
Create tags for organization:
- Department (Sales, Marketing, Operations)
- Priority (Critical, High, Medium, Low)
- Status (Active, Testing, Archive)

### Error Handling
Always include error workflows:
1. Add Error Trigger node
2. Send notifications (Slack, email)
3. Log to database for tracking

## Backup Strategy

### What to Backup

1. **Database**
   - SQLite: `~/.n8n/database.sqlite`
   - PostgreSQL: Regular pg_dump

2. **Encryption Key**
   - File: `.secrets`
   - Critical: Cannot decrypt credentials without this

3. **Workflows** (optional - stored in DB)
   - Export important workflows as JSON backup

### Backup Schedule

Recommended:
- Daily: Database backup
- Weekly: Full backup including binary data
- Monthly: Offsite backup

### Restore Process

1. Stop n8n
2. Restore database file
3. Restore encryption key to `.env`
4. Start n8n

## Troubleshooting

### Can't Start N8N

Check logs:
```bash
tail -f ~/.n8n/logs/n8n.log
```

Common issues:
- Port 5678 already in use
- Missing encryption key
- Database connection failed

### Workflows Not Executing

1. Check execution mode: `EXECUTIONS_MODE=regular`
2. Check concurrency limit: `N8N_CONCURRENCY_PRODUCTION_LIMIT`
3. Review logs for errors

### Email Not Sending

1. Verify SMTP credentials
2. Check port (587 for STARTTLS, 465 for SSL)
3. Test with: Settings > User settings > Test email

## Environment Variables Reference

### Critical Variables

| Variable | Current Value | Purpose |
|----------|---------------|---------|
| `N8N_EDITOR_BASE_URL` | http://localhost:5678 | Public URL for n8n |
| `N8N_ENCRYPTION_KEY` | Generated | Encrypts credentials |
| `DB_TYPE` | sqlite | Database type |
| `EXECUTIONS_MODE` | regular | Execution mode |
| `GENERIC_TIMEZONE` | America/New_York | Default timezone |

### Security Variables

| Variable | Value | Purpose |
|----------|-------|---------|
| `N8N_BLOCK_ENV_ACCESS_IN_NODE` | true | Blocks env access |
| `N8N_BLOCK_FILE_ACCESS_TO_N8N_FILES` | true | Protects n8n files |
| `N8N_MFA_ENABLED` | true | Enables 2FA |
| `N8N_SECURE_COOKIE` | true | HTTPS cookies only |

## Support & Resources

### Official Documentation
- https://docs.n8n.io/
- https://docs.n8n.io/hosting/

### Community
- Forum: https://community.n8n.io/
- Discord: https://discord.gg/n8n

### ACDC Digital Internal
- Slack: #n8n-automation
- Contact: [Your DevOps Team]

## License

n8n uses a fair-code license. Review licensing at: https://n8n.io/pricing/

For enterprise features, contact n8n for a license key and add to `.env`:
```bash
N8N_LICENSE_ACTIVATION_KEY=your_license_key
```

## Changelog

### 2025-11-08 - Initial Setup
- Created base configuration for ACDC Digital
- Set up security credentials
- Configured SQLite database
- Enabled core features
- Created startup scripts
