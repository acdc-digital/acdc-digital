# ACDC Digital Mono-Repo

## Overview

This workspace contains multiple independent Next.js applications managed by pnpm workspaces, each with their own Convex backend and unique functionality.

### Applications

| Package | Port | Description | Key Features |
|---------|------|-------------|--------------|
| **acdc-digital** | 8008 | Main application with AI integration | Convex backend, collaborative editing |
| **smnb** | 8888 | Smart News Management Bot | Reddit integration, content aggregation |  
| **aura** | 3333 | AI assistant application | Clerk authentication, advanced AI features |
| **ruuf** | 5454 | AI-powered assistant platform | MCP integration, Clerk authentication, agent workflows |

## Workspace Structure
```
acdc-digital/                     # Root workspace
├── package.json                  # Root package.json with workspace scripts
├── pnpm-workspace.yaml          # Workspace configuration
├── pnpm-lock.yaml              # Single lockfile for all packages
├── node_modules/               # Shared dependencies (hoisted)
├── WORKSPACE.md                # This documentation file
├── acdc-digital/               # Main application package
│   ├── package.json
│   ├── convex/
│   ├── app/
│   └── ...
├── smnb/                       # SMNB workspace
│   ├── smnb/                   # SMNB Next.js application
│   │   ├── package.json
│   │   ├── convex/
│   │   ├── app/
│   │   └── ...
│   └── docs/                   # SMNB documentation and assets
├── aura/                       # AURA workspace
│   ├── AURA/                   # AURA Next.js application
│   │   ├── package.json
│   │   ├── convex/
│   │   ├── app/
│   │   └── ...
│   └── docs/                   # AURA documentation and assets
└── ruuf/                       # RUUF workspace
    └── ruff/                   # RUUF Next.js application
        ├── package.json
        ├── convex/
        ├── app/
        └── ...
```

## Available Scripts

### ACDC Digital (Main App)
```bash
# Development
pnpm dev                        # Start acdc-digital in dev mode
pnpm build                      # Build acdc-digital
pnpm start                      # Start acdc-digital production server
pnpm lint                       # Lint acdc-digital
pnpm convex                     # Start acdc-digital Convex dev

# Database management
pnpm db:clear                   # Clear acdc-digital database
pnpm db:clear-chat             # Clear chat data
pnpm db:clear-docs             # Clear document data
```

### SMNB Application
```bash
# Development
pnpm dev:smnb                   # Start smnb in dev mode (port 8888)
pnpm build:smnb                 # Build smnb
pnpm start:smnb                 # Start smnb production server
pnpm lint:smnb                  # Lint smnb
pnpm convex:smnb               # Start smnb Convex dev

# Database management
pnpm clean:smnb                 # Clean smnb
pnpm clean:smnb-stats          # Get smnb database stats
pnpm clean:smnb-analytics      # Clear smnb analytics tables
pnpm clean:smnb-largest        # Clear smnb largest tables
```

### AURA Application
```bash
# Development
pnpm dev:aura                   # Start aura in dev mode (port 3333)
pnpm build:aura                 # Build aura
pnpm start:aura                 # Start aura production server
pnpm lint:aura                  # Lint aura
pnpm convex:aura               # Start aura Convex dev

# Testing & Database management
pnpm state:aura                 # Run aura state audit
pnpm structure:aura             # Run aura structure tests
pnpm cleanup:aura               # Clean aura database
```

### RUUF Application
```bash
# Development
pnpm dev:ruuf                   # Start ruuf in dev mode (port 5454)
pnpm build:ruuf                 # Build ruuf
pnpm start:ruuf                 # Start ruuf production server
pnpm lint:ruuf                  # Lint ruuf
pnpm type-check:ruuf           # Type check ruuf
pnpm convex:ruuf               # Start ruuf Convex dev
```

## Working with Packages

### Install Dependencies
```bash
# Install all dependencies for all packages
pnpm install

# Install a dependency to a specific package
pnpm --filter acdc-digital add [package-name]
pnpm --filter smnb add [package-name]
pnpm --filter aura add [package-name]
pnpm --filter ruff add [package-name]
```

### Run Commands in Specific Packages
```bash
# Run any script in a specific package
pnpm --filter acdc-digital [script-name]
pnpm --filter smnb [script-name]
pnpm --filter aura [script-name]
pnpm --filter ruff [script-name]
```

### Development Workflow

#### Quick Start
```bash
# Install all dependencies
pnpm install

# Start any application
pnpm dev          # ACDC Digital (port 8008)
pnpm dev:smnb     # SMNB (port 8888)
pnpm dev:aura     # AURA (port 3333)
pnpm dev:ruuf     # RUUF (port 5454)
```

#### Full Development Setup
1. **Start ACDC Digital**: `pnpm dev` (runs on port 8008)
2. **Start SMNB**: `pnpm dev:smnb` (runs on port 8888)
3. **Start AURA**: `pnpm dev:aura` (runs on port 3333)
4. **Start RUUF**: `pnpm dev:ruuf` (runs on port 5454)
5. **Start Convex for each** (in separate terminals):
   - `pnpm convex` (for ACDC Digital)
   - `pnpm convex:smnb` (for SMNB)
   - `pnpm convex:aura` (for AURA)
   - `pnpm convex:ruuf` (for RUUF)

## Package Independence

Each package maintains its own:
- Dependencies (managed in individual package.json files)
- Convex backend configuration
- Environment variables (separate .env files)
- Build outputs
- Port configurations (8008 for acdc-digital, 8888 for smnb, 3333 for aura, 5454 for ruuf)

## Benefits of Mono-Repo Setup

1. **Shared Dependencies**: Common dependencies are hoisted to reduce duplication
2. **Single Lockfile**: Consistent dependency versions across packages
3. **Unified Commands**: Run scripts for all packages from the root
4. **Simplified CI/CD**: Single repository for deployment pipelines
5. **Code Sharing**: Easy to share common utilities between packages (future enhancement)

## Troubleshooting

### Common Issues

**Port conflicts**: Each application runs on a different port:
- ACDC Digital: 8008
- SMNB: 8888  
- AURA: 3333
- RUUF: 5454

**Dependency issues**: 
```bash
# Clean and reinstall all dependencies
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**Package not found**:
```bash
# List all workspace packages
pnpm list -r --depth=0

# Verify workspace configuration
cat pnpm-workspace.yaml
```

### Environment Setup

Each package may require its own environment variables:
- `acdc-digital/.env.local`
- `smnb/smnb/.env.local` 
- `aura/AURA/.env.local`
- `ruuf/ruff/.env.local`

## Migration Notes

- ✅ Removed individual `node_modules` directories from packages
- ✅ Removed individual `pnpm-lock.yaml` files
- ✅ All packages now use workspace-level dependency management
- ✅ No nested `.git` directories (single git repository)
- ✅ Unified script management from root package.json