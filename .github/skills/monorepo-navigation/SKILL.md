---
name: monorepo-navigation
description: Navigate and understand the ACDC Digital monorepo structure with multiple projects including Soloist, SMNB, and AURA. Use when exploring the codebase, understanding project relationships, or finding specific files.
---

# ACDC Digital Monorepo Navigation

## When to use this skill

Use this skill when:
- Exploring the codebase structure
- Finding files or understanding project organization
- Understanding relationships between projects
- Locating configuration files or shared code

## Monorepo Structure

```
acdc-digital/
├── .github/                    # GitHub config, workflows, skills
│   ├── skills/                 # Agent skills (this folder)
│   ├── copilot-instructions.md # Copilot coding guidelines
│   └── workflows/              # CI/CD workflows
├── acdc-digital/               # Main website/hub project
│   ├── app/                    # Next.js App Router
│   ├── components/             # Shared components
│   ├── convex/                 # Convex backend
│   └── projects/               # Sub-project configs
├── soloist/                    # Mood tracking app
│   ├── convex/                 # Shared Convex backend
│   ├── demo/                   # Demo application
│   ├── website/                # Marketing website
│   ├── marketing/              # Marketing pages
│   ├── renderer/               # Electron renderer
│   └── electron/               # Desktop app
├── smnb/                       # Sentiment analysis app
│   ├── smnb/                   # Main Next.js app
│   ├── mcp-server/             # MCP server
│   └── api/                    # API endpoints
├── aura/                       # Document editing app
│   └── AURA/                   # Main application
├── convex/                     # Root-level shared Convex
└── public/                     # Shared public assets
```

## Project Breakdown

### Soloist (Mood Tracking)
- **Purpose**: Personal mood tracking and forecasting
- **Tech**: Next.js, Convex, Electron (desktop)
- **Key paths**:
  - `soloist/convex/` - Backend functions
  - `soloist/demo/` - Demo app
  - `soloist/website/` - Marketing site

### SMNB (Sentiment Analysis)
- **Purpose**: Stock ticker sentiment analysis
- **Tech**: Next.js, Convex, MCP Server
- **Key paths**:
  - `smnb/smnb/` - Main application
  - `smnb/mcp-server/` - MCP integration
  - `smnb/smnb/convex/` - Backend

### AURA (Document Editing)
- **Purpose**: Collaborative document editing
- **Tech**: Next.js, Convex
- **Key paths**:
  - `aura/AURA/` - Main application

## Configuration Files

| File | Location | Purpose |
|------|----------|---------|
| `pnpm-workspace.yaml` | Root | Monorepo workspace config |
| `package.json` | Each project | Project dependencies |
| `convex.json` | Project root | Convex deployment config |
| `tsconfig.json` | Each project | TypeScript config |
| `.gitignore` | Root | Git ignore patterns |

## Common Tasks

### Find a Convex function
Look in `<project>/convex/` directory

### Find a component
Look in `<project>/components/` directory

### Find API routes
Look in `<project>/app/api/` or `<project>/api/`

### Find configuration
Check root-level files or `<project>/` root

## Convex Deployments

Each project may have its own Convex deployment:
- Check `convex.json` for deployment name
- Backend functions in `convex/` folder
- Generated types in `convex/_generated/`
