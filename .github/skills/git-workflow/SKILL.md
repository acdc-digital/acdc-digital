---
name: git-workflow
description: Git workflow patterns for the ACDC Digital monorepo including commit conventions, branching strategy, and common operations. Use when committing code, managing branches, or resolving git issues.
---

# Git Workflow

## When to use this skill

Use this skill when:
- Committing changes with proper messages
- Managing branches
- Resolving merge conflicts
- Working with git history

## Commit Message Convention

Use conventional commits format:

```
<type>(<scope>): <subject>

[optional body]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | New feature |
| `fix` | Bug fix |
| `docs` | Documentation changes |
| `style` | Formatting, no code change |
| `refactor` | Code restructuring |
| `perf` | Performance improvement |
| `test` | Adding tests |
| `chore` | Maintenance tasks |

### Scopes (Projects)

- `soloist` - Soloist app changes
- `smnb` - SMNB app changes
- `aura` - AURA app changes
- `convex` - Backend changes
- `ui` - Component/UI changes

### Examples

```bash
git commit -m "feat(soloist): add mood prediction chart"
git commit -m "fix(smnb): resolve ticker symbol validation"
git commit -m "docs: update README with project cards"
git commit -m "chore: update dependencies"
```

## Branching Strategy

```
main                    # Production-ready code
├── feature/xxx         # New features
├── fix/xxx             # Bug fixes
└── chore/xxx           # Maintenance
```

## Common Commands

### Stage and commit all changes
```bash
git add -A && git commit -m "type(scope): message" && git push origin main
```

### Create feature branch
```bash
git checkout -b feature/new-feature
```

### Merge to main
```bash
git checkout main
git merge feature/new-feature
git push origin main
```

### View changes
```bash
git status
git diff
git log --oneline -10
```

### Undo last commit (keep changes)
```bash
git reset --soft HEAD~1
```

### Stash changes
```bash
git stash
git stash pop
```

## Protected Files

These files require careful attention:
- `.env*` files (never commit secrets)
- `.legal/` folder (in .gitignore)
- `convex/_generated/` (auto-generated)

## .gitignore Patterns

Key ignored patterns:
- `node_modules/`
- `.next/`
- `.env*`
- `.legal/`
- `.convex/`
