# ACDC Digital - N8N Setup Walkthrough

## 📋 Setup Checklist

Use this checklist to ensure your n8n instance is properly configured for ACDC Digital.

### Phase 1: Initial Setup ✅

- [ ] Run `./setup.sh` to generate security keys
- [ ] Backup `.secrets` file to secure location
- [ ] Review `.env` configuration
- [ ] Choose database (SQLite vs PostgreSQL)

### Phase 2: Core Configuration

#### Database Setup
- [ ] **Option A: SQLite (Default)** - Already configured ✅
- [ ] **Option B: PostgreSQL** - Run `./setup-database.sh`

#### Email/SMTP Configuration
- [ ] Update `N8N_SMTP_HOST`
- [ ] Update `N8N_SMTP_PORT`
- [ ] Update `N8N_SMTP_USER`
- [ ] Update `N8N_SMTP_PASS`
- [ ] Update `N8N_SMTP_SENDER`
- [ ] Test email functionality after first login

#### Security Review
- [ ] Verify `N8N_ENCRYPTION_KEY` is set (not default value)
- [ ] Verify `N8N_USER_MANAGEMENT_JWT_SECRET` is set
- [ ] Review `N8N_BLOCK_ENV_ACCESS_IN_NODE=true`
- [ ] Review `N8N_BLOCK_FILE_ACCESS_TO_N8N_FILES=true`
- [ ] Ensure `N8N_MFA_ENABLED=true`

### Phase 3: First Launch

- [ ] Run `./start-n8n.sh`
- [ ] Access http://localhost:5678
- [ ] Create admin account (first user)
- [ ] Complete onboarding
- [ ] Test SMTP by inviting a user

### Phase 4: Production Readiness (Optional)

#### Domain & SSL
- [ ] Acquire domain (e.g., n8n.acdcdigital.com)
- [ ] Obtain SSL certificate
- [ ] Update `N8N_EDITOR_BASE_URL`
- [ ] Update `N8N_PROTOCOL=https`
- [ ] Configure reverse proxy

#### Performance Optimization
- [ ] Consider PostgreSQL migration
- [ ] Consider Redis + Queue mode
- [ ] Set up external storage (S3)
- [ ] Configure monitoring

#### Backup Strategy
- [ ] Set up automated database backups
- [ ] Document restore procedures
- [ ] Test backup/restore process
- [ ] Store encryption key securely offsite

---

## 🚀 Step-by-Step Walkthrough

### Step 1: Generate Security Credentials

Run the setup script:

```bash
cd /Users/matthewsimon/Projects/acdc-digital/n8n
./setup.sh
```

**What this does:**
- Generates a 256-bit encryption key for credentials
- Generates a JWT secret for authentication
- Updates your `.env` file
- Creates a `.secrets` backup file

**⚠️ Critical**: Back up the `.secrets` file immediately!
- Store in password manager (1Password, LastPass, etc.)
- Or store in secure vault
- Without this key, you cannot decrypt saved credentials

---

### Step 2: Configure Email (SMTP)

Edit `.env` and update the SMTP section:

#### For Gmail:

```bash
N8N_SMTP_HOST=smtp.gmail.com
N8N_SMTP_PORT=587
N8N_SMTP_USER=automation@acdcdigital.com
N8N_SMTP_PASS=your-16-char-app-password
N8N_SMTP_SENDER=ACDC Digital Automation <automation@acdcdigital.com>
N8N_SMTP_SSL=false
N8N_SMTP_STARTTLS=true
```

**Gmail Setup Steps:**
1. Go to https://myaccount.google.com/security
2. Enable 2-Step Verification
3. Go to https://myaccount.google.com/apppasswords
4. Create app password for "Mail"
5. Copy the 16-character password
6. Use this password in `N8N_SMTP_PASS`

#### For SendGrid:

```bash
N8N_SMTP_HOST=smtp.sendgrid.net
N8N_SMTP_PORT=587
N8N_SMTP_USER=apikey
N8N_SMTP_PASS=your-sendgrid-api-key
N8N_SMTP_SENDER=ACDC Digital Automation <automation@acdcdigital.com>
N8N_SMTP_SSL=false
N8N_SMTP_STARTTLS=true
```

#### For AWS SES:

```bash
N8N_SMTP_HOST=email-smtp.us-east-1.amazonaws.com
N8N_SMTP_PORT=587
N8N_SMTP_USER=your-ses-smtp-username
N8N_SMTP_PASS=your-ses-smtp-password
N8N_SMTP_SENDER=ACDC Digital Automation <automation@acdcdigital.com>
N8N_SMTP_SSL=false
N8N_SMTP_STARTTLS=true
```

---

### Step 3: Choose Your Database

#### Option A: SQLite (Recommended for Starting)

**Already configured!** No action needed.

**Pros:**
- Zero setup required
- Works immediately
- Perfect for development and small teams
- Easy backups (single file)

**Cons:**
- Not ideal for high concurrency
- Single file can be a bottleneck
- Limited for multi-instance setups

#### Option B: PostgreSQL (Recommended for Production)

**Run the helper script:**

```bash
./setup-database.sh
```

Follow the prompts to:
1. Install PostgreSQL (if needed)
2. Create database
3. Configure credentials
4. Update `.env` automatically

**Manual Setup (if preferred):**

```bash
# Install PostgreSQL
brew install postgresql@15
brew services start postgresql@15

# Create database
createdb n8n_acdc

# Update .env
DB_TYPE=postgresdb
DB_POSTGRESDB_DATABASE=n8n_acdc
DB_POSTGRESDB_HOST=localhost
DB_POSTGRESDB_PORT=5432
DB_POSTGRESDB_USER=postgres
DB_POSTGRESDB_PASSWORD=your_password
DB_POSTGRESDB_POOL_SIZE=5
```

---

### Step 4: Review Security Settings

Open `.env` and verify these settings:

```bash
# Encryption (should be a long random string)
N8N_ENCRYPTION_KEY=<should not be "GENERATE_AND_REPLACE_THIS_KEY">

# JWT Secret (should be a long random string)
N8N_USER_MANAGEMENT_JWT_SECRET=<should not be "GENERATE_AND_REPLACE_THIS_SECRET">

# Block environment access in nodes
N8N_BLOCK_ENV_ACCESS_IN_NODE=true

# Block file access
N8N_BLOCK_FILE_ACCESS_TO_N8N_FILES=true

# Enable MFA
N8N_MFA_ENABLED=true

# Secure cookies
N8N_SECURE_COOKIE=true
```

**Optional: Restrict Dangerous Nodes**

If you want to prevent users from running shell commands:

```bash
NODES_EXCLUDE=["n8n-nodes-base.executeCommand"]
```

---

### Step 5: Start N8N

```bash
./start-n8n.sh
```

The script will:
1. Check configuration
2. Create necessary directories
3. Display current settings
4. Start n8n

**Expected output:**
```
========================================
ACDC DIGITAL - N8N Instance
========================================

Loading environment variables...
Checking configuration...
Creating directories...

Configuration:
  URL: http://localhost:5678
  Database: sqlite
  Timezone: America/New_York
  Log Location: ~/.n8n/logs/n8n.log

Starting n8n...
```

---

### Step 6: Create Admin Account

1. Open browser to http://localhost:5678
2. You'll see the n8n setup screen
3. Fill in your details:
   - **First name**: Your name
   - **Last name**: Your surname
   - **Email**: your-email@acdcdigital.com
   - **Password**: Strong password (12+ chars)
4. Click "Get started"

**Important**: The first user created is automatically the instance owner with full admin rights.

---

### Step 7: Complete Onboarding

n8n will guide you through:
1. Role selection (choose what fits you)
2. Use case questions (helps customize experience)
3. Quick tour of the interface

You can skip this if you prefer and explore on your own.

---

### Step 8: Test Email Functionality

To verify SMTP is working:

1. Go to **Settings** (gear icon) → **Community nodes**
2. Click **Users**
3. Click **Invite** button
4. Enter a test email address
5. Check if invitation email is received

If email fails:
- Check SMTP credentials in `.env`
- Verify port (587 for STARTTLS, 465 for SSL)
- Check spam/junk folder
- Review logs: `tail -f ~/.n8n/logs/n8n.log`

---

### Step 9: Initial Configuration

#### Set Up Projects (Enterprise Feature)

If you have an enterprise license:
1. Go to **Settings** → **Projects**
2. Create projects for different teams:
   - Sales Automation
   - Marketing Workflows
   - Operations
   - IT & DevOps

#### Create Tags

1. Go to **Workflows**
2. Click **Tags** (left sidebar)
3. Create organizational tags:
   - Department: Sales, Marketing, Ops, IT
   - Priority: Critical, High, Medium, Low
   - Status: Active, Testing, Development, Archive

#### Add Team Members

1. Go to **Settings** → **Users**
2. Click **Invite**
3. Enter team member's email
4. Select role:
   - **Admin**: Can manage workflows and users
   - **Member**: Can create and edit workflows
5. Team member receives invitation email

---

## 🎯 Quick Reference

### Starting n8n
```bash
cd /Users/matthewsimon/Projects/acdc-digital/n8n
./start-n8n.sh
```

### Stopping n8n
Press `Ctrl + C` in the terminal where n8n is running

### Viewing Logs
```bash
tail -f ~/.n8n/logs/n8n.log
```

### Accessing n8n
http://localhost:5678

### Configuration File
`/Users/matthewsimon/Projects/acdc-digital/n8n/.env`

### Data Location
- Database: `~/.n8n/database.sqlite`
- Binary Data: `~/.n8n/binaryData/`
- Logs: `~/.n8n/logs/`

---

## 🔧 Common Customizations

### Change Port

Edit `.env`:
```bash
N8N_PORT=3000
```

### Change Timezone

Edit `.env`:
```bash
GENERIC_TIMEZONE=America/Los_Angeles
```

### Increase Execution Timeout

Edit `.env`:
```bash
EXECUTIONS_TIMEOUT=600  # 10 minutes
```

### Enable More Concurrent Workflows

Edit `.env`:
```bash
N8N_CONCURRENCY_PRODUCTION_LIMIT=20
```

### Keep Executions Longer

Edit `.env`:
```bash
EXECUTIONS_DATA_MAX_AGE=720  # 30 days instead of 14
```

---

## 🚨 Troubleshooting

### Port Already in Use

Error: `Port 5678 is already in use`

**Solution:**
```bash
# Find what's using the port
lsof -i :5678

# Kill the process (use PID from above)
kill -9 <PID>

# Or change the port in .env
N8N_PORT=5679
```

### Cannot Connect to Database

**SQLite Issues:**
- Check `~/.n8n/` directory exists and is writable
- Check disk space: `df -h`

**PostgreSQL Issues:**
- Verify PostgreSQL is running: `brew services list`
- Test connection: `psql -h localhost -U postgres -d n8n_acdc`
- Check credentials in `.env`

### Email Not Sending

**Checklist:**
- [ ] SMTP credentials correct
- [ ] Port is correct (587 or 465)
- [ ] STARTTLS/SSL settings match port
- [ ] Email provider allows SMTP (some require app passwords)
- [ ] Check logs for specific error

### Workflows Not Executing

**Check:**
1. Workflow is activated (toggle in workflow editor)
2. Trigger is properly configured
3. No errors in execution list
4. Check logs: `~/.n8n/logs/n8n.log`
5. Concurrent execution limit not reached

---

## 📚 Next Steps

Once your instance is running:

1. **Learn n8n Basics**
   - Create your first workflow
   - Understand triggers, nodes, and connections
   - Practice with templates

2. **Integrate Your Tools**
   - Add credentials for services you use
   - Connect Slack, Google Workspace, databases, etc.
   - Test connections

3. **Build Automations**
   - Start with simple workflows
   - Gradually add complexity
   - Use error handling
   - Document your workflows

4. **Set Up Monitoring**
   - Enable metrics endpoint
   - Configure alerts for failures
   - Set up regular health checks

5. **Plan for Scale**
   - Consider PostgreSQL migration
   - Plan backup strategy
   - Evaluate queue mode for performance
   - Consider external binary storage

---

## 🆘 Getting Help

### Internal Resources
- **Slack**: #n8n-automation
- **Contact**: DevOps team

### External Resources
- **Documentation**: https://docs.n8n.io
- **Community Forum**: https://community.n8n.io
- **Discord**: https://discord.gg/n8n
- **YouTube**: https://www.youtube.com/@n8n-io

### Professional Support
For enterprise support, contact n8n at: https://n8n.io/pricing

---

## ✅ Setup Complete!

Your n8n instance for ACDC Digital is now configured and ready to use!

**What you have:**
- ✅ Secure configuration with encryption
- ✅ Database set up (SQLite or PostgreSQL)
- ✅ Email notifications configured
- ✅ Security best practices enabled
- ✅ Easy startup scripts
- ✅ Comprehensive documentation

**Start automating!** 🚀
