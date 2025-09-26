# ACDC Digital - Scripts Directory

This directory contains automation scripts for the ACDC Digital workspace to streamline development workflows and maintain consistency across packages.

## Scripts Overview

### `create-package.sh`
**Purpose**: Automated package generator for creating new Next.js + Convex packages following ACDC Digital workspace standards.

**Location**: `/Users/matthewsimon/Projects/acdc-digital/.scripts/create-package.sh`

## 🚀 create-package.sh

### Description
Creates a complete Next.js application with Convex backend integration, following the established patterns used across the ACDC Digital workspace. This script automates the entire package scaffolding process that was manually performed when creating the `donut` package.

### Usage
```bash
# From workspace root
./.scripts/create-package.sh <package-name> [options]
```

### Command Line Options
| Option | Description | Example |
|--------|-------------|---------|
| `<package-name>` | **Required**. Package name (lowercase, alphanumeric, hyphens) | `my-app` |
| `-p, --port <port>` | Custom port for dev server (default: auto-detect) | `--port 3001` |
| `-d, --description <desc>` | Custom package description | `--description "My awesome app"` |
| `--no-convex` | Skip Convex backend setup | `--no-convex` |
| `--no-install` | Skip npm install step | `--no-install` |
| `-h, --help` | Show help message | `--help` |

### Examples
```bash
# Basic package creation
./.scripts/create-package.sh dashboard

# With custom port and description
./.scripts/create-package.sh user-profile --port 8010 --description "User management dashboard"

# Frontend-only package (no Convex)
./.scripts/create-package.sh landing-page --no-convex

# Create scaffolding without installing dependencies
./.scripts/create-package.sh analytics --no-install
```

### What Gets Created
The script generates a complete package structure with:

#### 📁 Directory Structure
```
<package-name>/
├── .agents/                  # AI agents and automation scripts
├── .docs/                    # Project documentation
├── .github/                  # GitHub workflows and templates
├── .notes/                   # Development notes and planning
├── .tests/                   # Test files and test utilities
├── .vscode/                  # VS Code workspace settings
├── package.json              # Dependencies and scripts
├── README.md                 # Package documentation
├── next.config.ts           # Next.js configuration
├── tsconfig.json            # TypeScript configuration
├── eslint.config.mjs        # ESLint configuration
├── tailwind.config.ts       # Tailwind CSS configuration
├── postcss.config.mjs       # PostCSS configuration
├── next-env.d.ts            # Next.js type definitions
├── app/
│   ├── globals.css          # Global styles (VS Code theme)
│   ├── layout.tsx           # Root layout component
│   └── page.tsx             # Home page component
├── components/
│   └── ui/
│       └── button.tsx       # Reusable Button component
├── convex/ (if --no-convex not used)
│   ├── convex.config.ts     # Convex app configuration
│   ├── schema.ts            # Database schema definition
│   └── tsconfig.json        # Convex TypeScript config
└── lib/
    └── utils.ts             # Utility functions (cn helper)
```

#### 📦 Dependencies Included
**Production Dependencies:**
- `next` (15.2.3) - React framework
- `react` & `react-dom` (^19.0.0) - React library
- `convex` (^1.23.0) - Backend platform (if enabled)
- `clsx` & `tailwind-merge` - CSS class utilities
- `class-variance-authority` - Component variant styling
- `@radix-ui/react-slot` - Radix UI primitives
- `lucide-react` - Icon library
- `tailwindcss-animate` - Animation utilities

**Development Dependencies:**
- `typescript` (^5) - TypeScript compiler
- `@types/*` - Type definitions
- `eslint` & `eslint-config-next` - Code linting
- `tailwindcss` & `@tailwindcss/postcss` - CSS framework
- `prettier` - Code formatting

#### ⚙️ Configuration Features
- **Auto-port detection**: Scans existing packages to assign next available port
- **VS Code theme**: Dark theme styling matching IDE aesthetic
- **TypeScript**: Strict configuration with proper path mapping
- **ESLint**: Next.js recommended rules with TypeScript support
- **Tailwind**: Full configuration with custom theme and animations
- **Convex**: Optional backend with schema and type generation

### Smart Features

#### 🔍 Port Auto-Detection
The script automatically scans existing `package.json` files in the workspace to find used ports and assigns the next available port number:
```bash
# Existing packages use ports 8008, 8009
# New package automatically gets port 8010
```

#### ✅ Package Validation
- **Name format**: Must be lowercase, start with letter, contain only letters/numbers/hyphens
- **Duplicate prevention**: Won't overwrite existing packages
- **Directory safety**: Creates packages only in workspace root

#### 🎨 Consistent Theming
All generated packages include:
- VS Code inspired color palette
- Dark mode by default
- Consistent component styling
- Custom scrollbar styling
- IDE aesthetic utilities

### Output & Feedback
The script provides colored terminal output for different message types:
- 🔵 **INFO**: General status messages
- 🟢 **SUCCESS**: Completion confirmations
- 🟡 **WARNING**: Non-critical issues
- 🔴 **ERROR**: Critical errors with helpful messages

### Post-Creation Steps
After successful package creation:

1. **Navigate to package**:
   ```bash
   cd <package-name>
   ```

2. **Start development** (if dependencies installed):
   ```bash
   npm run dev
   ```

3. **Setup Convex** (if enabled):
   ```bash
   npm run convex
   ```

### Integration with Workspace
The generated packages automatically integrate with:
- **Workspace structure**: Follows established patterns
- **Shared dependencies**: Uses consistent versions
- **Development workflow**: Ready for immediate development
- **Build system**: Compatible with existing CI/CD

### Troubleshooting

#### Common Issues
1. **Permission denied**: Ensure script is executable with `chmod +x`
2. **Port conflicts**: Use `--port` flag to specify custom port
3. **Invalid package name**: Follow lowercase alphanumeric naming
4. **Existing directory**: Choose different package name or remove existing

#### Dependencies
The script requires:
- `bash` shell
- `jq` (optional, for JSON manipulation - falls back to sed)
- `npm` or `pnpm` (for dependency installation)
- Basic Unix utilities (`find`, `grep`, `sort`)

## Development Workflow

### Adding New Scripts
1. Create script file in `.scripts/` directory
2. Make executable: `chmod +x .scripts/script-name.sh`
3. Add documentation to this README
4. Test script thoroughly before committing

### Script Standards
- Use `#!/bin/bash` shebang
- Include error handling with `set -e`
- Provide colored output for user feedback
- Include help/usage information
- Validate input parameters
- Use workspace-relative paths

### Maintenance
- Keep dependency versions synchronized with workspace packages
- Update configurations when workspace standards change
- Test scripts after major tooling updates
- Document breaking changes in script behavior

---

## Contributing

When adding new scripts or modifying existing ones:
1. Follow existing patterns and conventions
2. Include comprehensive error handling
3. Provide clear documentation and examples
4. Test edge cases and error scenarios
5. Update this README with new script information