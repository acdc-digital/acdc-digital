# Task Runners Configuration

## Overview

Task runners execute user code from the Code node in a secure and performant way. They support both JavaScript and Python execution.

**Status:** Python support is in **BETA** - requires `N8N_NATIVE_PYTHON_RUNNER=true` to enable.

---

## How Task Runners Work

Task runners consist of three components:

1. **Task Runner** - Executes the code
2. **Task Broker** - Coordinates communication (runs in n8n instance)
3. **Task Requester** - Submits tasks (Code node in workflows)

**Flow:**
```
Code Node (Requester) → Task Broker (n8n) → Task Runner → Execute → Results → Broker → Code Node
```

Task runners connect to the broker via WebSocket and execute tasks on demand.

---

## Task Runner Modes

### Internal Mode (Default - Development Only)

**How it works:**
- n8n launches task runner as a child process
- n8n manages the runner's lifecycle
- Runner shares same uid/gid as n8n
- Simple setup, but **not recommended for production**

**Configuration:**
```bash
N8N_RUNNERS_ENABLED=true
N8N_RUNNERS_MODE=internal  # This is the default
N8N_PYTHON_ENABLED=true
N8N_NATIVE_PYTHON_RUNNER=true  # Required for Python (beta)
```

**Already configured in your `.env` file!**

**When to use:**
- ✅ Development and testing
- ✅ Single-user instances
- ✅ Quick setup
- ❌ NOT for production

---

### External Mode (Production Recommended)

**How it works:**
- Task runners run in a separate container/process
- Launcher manages runner lifecycle
- Independent from n8n instance
- Better security isolation
- Scales with queue mode

**Architecture:**
```
n8n Container ←→ Task Runners Container (Sidecar)
  (Broker)          (JS + Python Runners)
```

**When to use:**
- ✅ Production deployments
- ✅ Queue mode with workers
- ✅ Security-sensitive environments
- ✅ Better resource isolation

---

## Setting Up External Mode

### Docker Compose Example

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:1.118.2
    container_name: n8n-main
    environment:
      # Task Runner Configuration
      - N8N_RUNNERS_ENABLED=true
      - N8N_RUNNERS_MODE=external
      - N8N_RUNNERS_BROKER_LISTEN_ADDRESS=0.0.0.0
      - N8N_RUNNERS_AUTH_TOKEN=${N8N_RUNNERS_AUTH_TOKEN}
      - N8N_NATIVE_PYTHON_RUNNER=true
      
      # Database
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_DATABASE=n8n_acdc
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_USER=n8n_user
      - DB_POSTGRESDB_PASSWORD=${DB_PASSWORD}
      
      # Other settings
      - N8N_EDITOR_BASE_URL=${N8N_EDITOR_BASE_URL}
      - N8N_ENCRYPTION_KEY=${N8N_ENCRYPTION_KEY}
      
    ports:
      - "5678:5678"
    volumes:
      - n8n_data:/home/node/.n8n
    depends_on:
      - postgres
    networks:
      - n8n-network

  task-runners:
    image: n8nio/runners:1.118.2  # Must match n8n version
    container_name: n8n-runners
    environment:
      - N8N_RUNNERS_TASK_BROKER_URI=http://n8n-main:5679
      - N8N_RUNNERS_AUTH_TOKEN=${N8N_RUNNERS_AUTH_TOKEN}
      - N8N_RUNNERS_AUTO_SHUTDOWN_TIMEOUT=15
      
      # JavaScript allowlist
      - NODE_FUNCTION_ALLOW_BUILTIN=crypto,fs,path
      - NODE_FUNCTION_ALLOW_EXTERNAL=
      
      # Python allowlist  
      - N8N_RUNNERS_STDLIB_ALLOW=json,datetime,re
      - N8N_RUNNERS_EXTERNAL_ALLOW=
      
    depends_on:
      - n8n
    networks:
      - n8n-network

  postgres:
    image: postgres:15
    container_name: n8n-postgres
    environment:
      - POSTGRES_DB=n8n_acdc
      - POSTGRES_USER=n8n_user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - n8n-network

volumes:
  n8n_data:
  postgres_data:

networks:
  n8n-network:
    driver: bridge
```

### Environment Variables (.env)

Create `.env.docker` for Docker Compose:

```bash
# Generate secure token: openssl rand -base64 32
N8N_RUNNERS_AUTH_TOKEN=your-secure-token-here

# Your settings
N8N_EDITOR_BASE_URL=http://localhost:5678
N8N_ENCRYPTION_KEY=your-encryption-key
DB_PASSWORD=your-db-password
```

### Start with Docker Compose

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps

# Stop services
docker-compose down
```

---

## Configuration Reference

### N8N Instance Environment Variables

For the main n8n container/instance:

```bash
# Enable task runners
N8N_RUNNERS_ENABLED=true

# Mode: internal or external
N8N_RUNNERS_MODE=external

# Auth token (shared secret with runners)
N8N_RUNNERS_AUTH_TOKEN=your-secure-token

# Listen address (0.0.0.0 for external mode)
N8N_RUNNERS_BROKER_LISTEN_ADDRESS=0.0.0.0

# Broker port (default: 5679)
N8N_RUNNERS_BROKER_PORT=5679

# Enable Python (beta)
N8N_NATIVE_PYTHON_RUNNER=true

# Max concurrent tasks per runner
N8N_RUNNERS_MAX_CONCURRENCY=5

# Task timeout (seconds)
N8N_RUNNERS_TASK_TIMEOUT=60

# Max payload size (bytes)
N8N_RUNNERS_MAX_PAYLOAD=1073741824
```

### Task Runners Container Environment Variables

For the runners sidecar container:

```bash
# Auth token (must match n8n's token)
N8N_RUNNERS_AUTH_TOKEN=your-secure-token

# Broker URI (n8n instance)
N8N_RUNNERS_TASK_BROKER_URI=http://n8n-main:5679

# Auto-shutdown after inactivity (seconds, 0=disabled)
N8N_RUNNERS_AUTO_SHUTDOWN_TIMEOUT=15

# Max concurrent tasks
N8N_RUNNERS_MAX_CONCURRENCY=5

# Health check port
N8N_RUNNERS_LAUNCHER_HEALTH_CHECK_PORT=5680
```

### JavaScript Runner Variables

```bash
# Built-in Node.js modules allowed
NODE_FUNCTION_ALLOW_BUILTIN=crypto,fs,path

# External npm packages allowed (comma-separated)
NODE_FUNCTION_ALLOW_EXTERNAL=moment,lodash,axios

# Example: allow all built-ins
NODE_FUNCTION_ALLOW_BUILTIN=*
```

### Python Runner Variables (Beta)

```bash
# Python standard library modules allowed
N8N_RUNNERS_STDLIB_ALLOW=json,datetime,re,math

# External Python packages allowed
N8N_RUNNERS_EXTERNAL_ALLOW=numpy,pandas,requests

# Built-in functions to deny
N8N_RUNNERS_BUILTINS_DENY=eval,exec,compile,open

# Block environment access
N8N_BLOCK_RUNNER_ENV_ACCESS=true
```

---

## Queue Mode with Task Runners

When using queue mode, **each worker needs its own task runner sidecar**.

### Docker Compose with Workers

```yaml
services:
  n8n-main:
    image: n8nio/n8n:1.118.2
    environment:
      - EXECUTIONS_MODE=queue
      - N8N_RUNNERS_ENABLED=true
      - N8N_RUNNERS_MODE=external
      - OFFLOAD_MANUAL_EXECUTIONS_TO_WORKERS=true
    # ...

  task-runners-main:
    image: n8nio/runners:1.118.2
    environment:
      - N8N_RUNNERS_TASK_BROKER_URI=http://n8n-main:5679
    # ...

  n8n-worker-1:
    image: n8nio/n8n:1.118.2
    environment:
      - EXECUTIONS_MODE=queue
      - N8N_RUNNERS_ENABLED=true
      - N8N_RUNNERS_MODE=external
    # ...

  task-runners-worker-1:
    image: n8nio/runners:1.118.2
    environment:
      - N8N_RUNNERS_TASK_BROKER_URI=http://n8n-worker-1:5679
    # ...
```

---

## Adding Custom Dependencies

To add JavaScript or Python packages to the task runners:

### 1. Create Custom Dockerfile

```dockerfile
FROM n8nio/runners:1.118.2

# Add JavaScript dependencies
COPY custom-package.json /tmp/package.json
WORKDIR /opt/runners/task-runner-javascript
RUN npm install /tmp/package.json

# Add Python dependencies
COPY requirements.txt /tmp/requirements.txt
RUN /opt/runners/task-runner-python/venv/bin/pip install -r /tmp/requirements.txt

# Copy custom launcher config
COPY n8n-task-runners.json /etc/n8n-task-runners.json
```

### 2. Create package.json (JavaScript)

```json
{
  "name": "task-runner-extras",
  "dependencies": {
    "moment": "2.30.1",
    "lodash": "4.17.21",
    "axios": "1.6.0"
  }
}
```

### 3. Create requirements.txt (Python)

```txt
numpy==2.3.2
pandas==2.2.2
requests==2.31.0
```

### 4. Create Launcher Config

`n8n-task-runners.json`:

```json
{
  "task-runners": [
    {
      "runner-type": "javascript",
      "env-overrides": {
        "NODE_FUNCTION_ALLOW_BUILTIN": "crypto,fs,path",
        "NODE_FUNCTION_ALLOW_EXTERNAL": "moment,lodash,axios"
      }
    },
    {
      "runner-type": "python",
      "env-overrides": {
        "PYTHONPATH": "/opt/runners/task-runner-python",
        "N8N_RUNNERS_STDLIB_ALLOW": "json,datetime,re,math",
        "N8N_RUNNERS_EXTERNAL_ALLOW": "numpy,pandas,requests"
      }
    }
  ]
}
```

### 5. Build Custom Image

```bash
docker build -t n8nio/runners:custom .
```

### 6. Use in Docker Compose

```yaml
task-runners:
  image: n8nio/runners:custom
  # ... rest of config
```

---

## Security Considerations

### Allowlisting Modules

**Why?** Prevent malicious code from accessing dangerous functionality.

**Best practices:**
- ✅ Start with minimal allowlist
- ✅ Add only what you need
- ✅ Review security implications
- ✅ Document why each module is allowed

### Dangerous Modules to Avoid

**JavaScript:**
- `child_process` - Can execute system commands
- `fs` - File system access
- `net` - Network access
- `process` - Process manipulation

**Python:**
- `os` - Operating system interface
- `subprocess` - Spawn processes
- `socket` - Low-level networking
- `eval`, `exec`, `compile` - Dynamic code execution

### Network Isolation

In production, consider:
- Separate network for task runners
- Restrict outbound connections
- Use network policies (Kubernetes)

---

## Monitoring and Debugging

### Check Runner Status

```bash
# Docker Compose
docker-compose ps
docker-compose logs task-runners

# Check health endpoint
curl http://localhost:5680/health
```

### View Runner Logs

```bash
# Detailed logs
docker-compose logs -f task-runners

# With timestamp
docker-compose logs -f --timestamps task-runners
```

### Debug Mode

Enable debug logging:

```bash
# For launcher
N8N_RUNNERS_LAUNCHER_LOG_LEVEL=debug

# Check broker connection
N8N_LOG_LEVEL=debug
```

### Common Issues

**Runners not connecting:**
- Check `N8N_RUNNERS_AUTH_TOKEN` matches
- Verify `N8N_RUNNERS_TASK_BROKER_URI` is correct
- Check network connectivity
- Review firewall rules

**Tasks timing out:**
- Increase `N8N_RUNNERS_TASK_TIMEOUT`
- Check runner logs for errors
- Verify resource limits

**Module not allowed:**
- Add to allowlist in environment variables
- Rebuild custom image if needed
- Check launcher config

---

## Migration Path

### Current Setup (Internal Mode)

Your `.env` already has:
```bash
N8N_RUNNERS_ENABLED=true
N8N_RUNNERS_MODE=internal
N8N_PYTHON_ENABLED=true
```

This works great for getting started!

### When to Consider External Mode

Move to external mode when:
- Deploying to production
- Using queue mode with workers
- Need better security isolation
- Scaling to multiple instances
- Using Docker/Kubernetes

### Migration Steps

1. Set up Docker Compose configuration
2. Generate auth token
3. Test with Docker Compose locally
4. Migrate workflows gradually
5. Monitor performance
6. Deploy to production

---

## Performance Tuning

### Concurrency

```bash
# More concurrent tasks (more memory)
N8N_RUNNERS_MAX_CONCURRENCY=10

# Less concurrent tasks (less memory)
N8N_RUNNERS_MAX_CONCURRENCY=3
```

### Timeouts

```bash
# Longer timeout for slow tasks
N8N_RUNNERS_TASK_TIMEOUT=120

# Shorter for quick tasks
N8N_RUNNERS_TASK_TIMEOUT=30
```

### Auto-Shutdown

```bash
# Keep runners alive longer (uses memory)
N8N_RUNNERS_AUTO_SHUTDOWN_TIMEOUT=60

# Shutdown quickly (saves memory, slower restarts)
N8N_RUNNERS_AUTO_SHUTDOWN_TIMEOUT=5

# Never shutdown (always ready, uses memory)
N8N_RUNNERS_AUTO_SHUTDOWN_TIMEOUT=0
```

---

## Recommendations by Use Case

### Development / Testing
→ **Internal Mode** (Current setup)
- Already configured ✅
- Zero additional setup
- Perfect for learning

### Small Production / Single Instance
→ **Internal Mode** (acceptable)
- Simple deployment
- Adequate for low load
- Monitor resource usage

### Production / Scaling
→ **External Mode**
- Better isolation
- Scales with workers
- Professional grade
- Use Docker Compose or Kubernetes

### High Security
→ **External Mode + Custom Image**
- Strict allowlists
- Network isolation
- Auditable dependencies
- Custom security policies

---

## Quick Reference

### Current Configuration

Your instance uses **internal mode**:
- Configured in: `/Users/matthewsimon/Projects/acdc-digital/n8n/.env`
- Mode: `N8N_RUNNERS_MODE=internal`
- Python enabled: `N8N_PYTHON_ENABLED=true`
- Beta Python runner: Ready to enable

### Enable Beta Python Runner

Edit `.env`:
```bash
N8N_NATIVE_PYTHON_RUNNER=true
```

Restart n8n:
```bash
./n8n.sh restart
```

### Check Runner Status

```bash
./status.sh
```

### View Logs

```bash
tail -f ~/.n8n/logs/n8n.log | grep -i runner
```

---

## Examples

### JavaScript Code Node with Modules

```javascript
// Requires: NODE_FUNCTION_ALLOW_BUILTIN=crypto
const crypto = require('crypto');
const hash = crypto.createHash('sha256').update('hello').digest('hex');
return { hash };
```

### Python Code Node with Packages

```python
# Requires: N8N_RUNNERS_EXTERNAL_ALLOW=numpy
import numpy as np
data = np.array([1, 2, 3, 4, 5])
mean = float(np.mean(data))
return {"mean": mean}
```

---

## Support and Resources

### Documentation
- N8N Task Runners: https://docs.n8n.io/hosting/configuration/task-runners/
- Environment Variables: https://docs.n8n.io/hosting/environment-variables/

### Troubleshooting
- Check status: `./status.sh`
- View logs: `tail -f ~/.n8n/logs/n8n.log`
- Test connectivity: Check broker port (5679)

### ACDC Digital
- Slack: #n8n-automation
- Contact: DevOps team

---

**Last Updated:** November 8, 2025

**Your Setup:** Internal mode (development-ready) ✅
