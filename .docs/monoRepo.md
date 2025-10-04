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
| **donut** | 8009 | Data visualization and analytics | Recharts integration, donut charts, time tracking |
| **home** | 8787 | ACDC Digital's home/landing page | Next.js, Tailwind CSS, modern UI components |
| **lifeOS** | TBD | Agentic social media management platform | AI agents, brand strategy, content automation |
| **soloist** | 3002/3004 | Personal analytics and mood tracking | AI forecasting, Electron desktop app, predictive insights |

## Workspace Structure
```
acdc-digital/                     # Root workspace
├── package.json                  # Root package.json with workspace scripts
├── pnpm-workspace.yaml          # Workspace configuration
├── pnpm-lock.yaml              # Single lockfile for all packages
├── node_modules/               # Shared dependencies (hoisted)
├── monoRepo.md                 # This documentation file
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
├── ruuf/                       # RUUF workspace
│   └── ruff/                   # RUUF Next.js application
│       ├── package.json
│       ├── convex/
│       ├── app/
│       └── ...
├── donut/                      # Data visualization application
│   ├── package.json
│   ├── convex/
│   ├── app/
│   ├── components/
│   └── ...
├── home/                       # ACDC Digital home/landing page
│   ├── package.json
│   ├── convex/
│   ├── app/
│   ├── components/
│   └── ...
├── lifeOS/                     # LifeOS workspace
│   ├── LifeOS/                 # LifeOS Next.js application (in development)
│   ├── package.json
│   └── docs/                   # LifeOS documentation
└── soloist/                    # Soloist monorepo workspace
    ├── package.json            # Soloist workspace configuration
    ├── convex/                 # Shared Convex backend
    ├── renderer/               # Next.js web application (port 3002)
    ├── website/                # Marketing website (port 3004)
    ├── electron/               # Desktop application
    └── docs/                   # Soloist documentation
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

### Donut Application
```bash
# Development
pnpm --filter donut dev         # Start donut in dev mode (port 8009)
pnpm --filter donut build       # Build donut
pnpm --filter donut start       # Start donut production server
pnpm --filter donut lint        # Lint donut
pnpm --filter donut convex      # Start donut Convex dev
```

### Home Application
```bash
# Development
pnpm --filter home dev          # Start home in dev mode (port 8787)
pnpm --filter home build        # Build home
pnpm --filter home start        # Start home production server
pnpm --filter home lint         # Lint home
pnpm --filter home convex       # Start home Convex dev
```

### LifeOS Application
```bash
# Development
pnpm --filter lifeos-workspace dev      # Start LifeOS in dev mode
pnpm --filter lifeos-workspace build    # Build LifeOS
pnpm --filter lifeos-workspace convex   # Start LifeOS Convex dev
pnpm --filter lifeos-workspace state    # Run LifeOS state audit
pnpm --filter lifeos-workspace structure # Run LifeOS structure tests
pnpm --filter lifeos-workspace clean    # Clean LifeOS
```

### Soloist Application
```bash
# Development (Monorepo with multiple apps)
pnpm --filter solopro-monorepo dev              # Start all Soloist apps (renderer + website + electron)
pnpm --filter solopro-monorepo dev:renderer     # Start renderer only (port 3002)
pnpm --filter solopro-monorepo dev:website      # Start website only (port 3004)
pnpm --filter solopro-monorepo dev:electron     # Start Electron app only
pnpm --filter solopro-monorepo convex:dev       # Start Convex dev

# Building
pnpm --filter solopro-monorepo build            # Build all Soloist projects
pnpm --filter solopro-monorepo build:renderer   # Build renderer for production
pnpm --filter solopro-monorepo build:website    # Build website for production
pnpm --filter solopro-monorepo build:app        # Build Electron desktop app

# Deployment
pnpm --filter solopro-monorepo deploy:all       # Deploy website and renderer
pnpm --filter solopro-monorepo deploy:website   # Deploy website only
pnpm --filter solopro-monorepo deploy:renderer  # Deploy renderer only
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
pnpm --filter donut add [package-name]
pnpm --filter home add [package-name]
pnpm --filter lifeos-workspace add [package-name]
pnpm --filter solopro-monorepo add [package-name]
```

### Run Commands in Specific Packages
```bash
# Run any script in a specific package
pnpm --filter acdc-digital [script-name]
pnpm --filter smnb [script-name]
pnpm --filter aura [script-name]
pnpm --filter ruff [script-name]
pnpm --filter donut [script-name]
pnpm --filter home [script-name]
pnpm --filter lifeos-workspace [script-name]
pnpm --filter solopro-monorepo [script-name]
```

### Development Workflow

#### Quick Start
```bash
# Install all dependencies
pnpm install

# Start any application
pnpm dev                                   # ACDC Digital (port 8008)
pnpm dev:smnb                             # SMNB (port 8888)
pnpm dev:aura                             # AURA (port 3333)
pnpm dev:ruuf                             # RUUF (port 5454)
pnpm --filter donut dev                   # Donut (port 8009)
pnpm --filter home dev                    # Home (port 8787)
pnpm --filter lifeos-workspace dev        # LifeOS (port TBD)
pnpm --filter solopro-monorepo dev        # Soloist (renderer: 3002, website: 3004)
```

#### Full Development Setup
1. **Start ACDC Digital**: `pnpm dev` (runs on port 8008)
2. **Start SMNB**: `pnpm dev:smnb` (runs on port 8888)
3. **Start AURA**: `pnpm dev:aura` (runs on port 3333)
4. **Start RUUF**: `pnpm dev:ruuf` (runs on port 5454)
5. **Start Donut**: `pnpm --filter donut dev` (runs on port 8009)
6. **Start Home**: `pnpm --filter home dev` (runs on port 8787)
7. **Start LifeOS**: `pnpm --filter lifeos-workspace dev` (port TBD)
8. **Start Soloist**: `pnpm --filter solopro-monorepo dev` (renderer: 3002, website: 3004)
9. **Start Convex for each** (in separate terminals):
   - `pnpm convex` (for ACDC Digital)
   - `pnpm convex:smnb` (for SMNB)
   - `pnpm convex:aura` (for AURA)
   - `pnpm convex:ruuf` (for RUUF)
   - `pnpm --filter donut convex` (for Donut)
   - `pnpm --filter home convex` (for Home)
   - `pnpm --filter lifeos-workspace convex` (for LifeOS)
   - `pnpm --filter solopro-monorepo convex:dev` (for Soloist)

## Package Independence

Each package maintains its own:
- Dependencies (managed in individual package.json files)
- Convex backend configuration
- Environment variables (separate .env files)
- Build outputs
- Port configurations (8008 for acdc-digital, 8888 for smnb, 3333 for aura, 5454 for ruuf, 8009 for donut, 8787 for home, 3002/3004 for soloist)

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
- Donut: 8009
- Home: 8787
- LifeOS: TBD (in development)
- Soloist Renderer: 3002
- Soloist Website: 3004

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
- `donut/.env.local`
- `home/.env.local`
- `lifeOS/LifeOS/.env.local`
- `soloist/.env.local`

## Migration Notes

- ✅ Removed individual `node_modules` directories from packages
- ✅ Removed individual `pnpm-lock.yaml` files
- ✅ All packages now use workspace-level dependency management
- ✅ No nested `.git` directories (single git repository)
- ✅ Unified script management from root package.json