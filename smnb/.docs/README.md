# SMNB Documentation

Comprehensive documentation for the SMNB (Social Media News Broadcaster) project.

## 📚 Documentation Structure

### `/api` - API Documentation
Complete API reference including REST endpoints, Convex functions, authentication, and rate limiting.
- `README.md` - API overview
- `rest-endpoints.md` - REST API endpoints
- `convex-functions.md` - Convex function reference
- `authentication.md` - API authentication
- `rate-limits.md` - Rate limiting documentation
- `error-handling.md` - Error handling patterns
- `examples.md` - API usage examples

### `/architecture` - System Architecture
High-level system design, component architecture, and technical specifications.
- `dashboard-architecture.md` - Dashboard component structure
- `studio-architecture.md` - Studio architecture
- `smnbwebsite.md` - Website architecture
- `STATE_MANAGEMENT_ANALYSIS.md` - State management patterns
- `NEXUS_IMPLEMENTATION_GUIDE.md` - Nexus implementation
- `systemCalls.md` - System call documentation
- `AGENTS-AND-TOOLS.md` - AI agents and tools overview
- `LLM-AGENTS-ANALYSIS.md` - LLM agents analysis
- `DATA-FLOW-CHART.md` - Data flow diagrams

### `/authentication` - Authentication System
User authentication, security patterns, and API authentication.
- `README.md` - Authentication overview
- `overview.md` - System overview
- `quick-start.md` - Getting started guide
- `api-reference.md` - Authentication API
- `patterns.md` - Authentication patterns
- `security.md` - Security best practices
- `troubleshooting.md` - Common issues and solutions

### `/bugfixes` - Bug Fixes & Patches
Documentation of major bug fixes and patches applied to the system.
- `TRADING-MUTATION-FIX.md` - Trading mutation bug fix

### `/convex` - Convex Backend
Convex-specific documentation including schema, functions, and data models.
- `llm-maps.md` - LLM mapping structures

### `/database` - Database Documentation
Database schema, migrations, and data models.
- `TRADE-DB.MD` - Trading database schema

### `/design` - Design System
UI/UX design patterns, brand identity, and styling architecture.
- `brandidentity.md` - Brand guidelines
- `designarchitecture.md` - Design system architecture
- `text-styling-architecture-map.md` - Typography system
- `animation-status.md` - Animation implementation status

### `/development` - Development Guides
Developer guides, testing procedures, and implementation summaries.
- `TESTING_GUIDE.md` - Testing procedures
- `IMPLEMENTATION_SUMMARY.md` - Feature implementation summaries
- `FIX_SUMMARY.md` - Bug fix summaries
- `ENHANCED_TOKEN_TRACKING.md` - Token tracking implementation
- `tokencounting.md` - Token counting system
- `timeHorizon.md` - Time horizon calculations
- `feedblog-postquantity.md` - Feed quantity management

### `/editor` - Editor Module
Text editor component documentation and specifications.
- `init-spec.md` - Editor initialization specs

### `/features` - Feature Documentation
Individual feature implementations and guides.
- `ANALYTICS.md` - Analytics system
- `stats-implementation-complete.md` - Stats feature
- `story-card-architecture.md` - Story card system
- `story-threading-system.md` - Story threading
- `auto-scroll-enhancement.md` - Auto-scroll feature
- `prompt-input-enhancement.md` - Prompt input improvements
- `ORCHESTRATOR_USAGE_GUIDE.md` - Orchestrator guide
- `dataExtrapolation.md` - Data extrapolation
- `feedStats.md` - Feed statistics

### `/implementations` - Implementation Docs
Detailed implementation documentation for major features and refactors.
- `SESSION_FILTERING_IMPLEMENTATION.md` - Session filtering
- `SESSION_STATS_IMPLEMENTATION.md` - Session statistics
- `CONSOLIDATION-SUMMARY.md` - Code consolidation summary

### `/integrations` - External Integrations
Third-party API integrations and data pipeline documentation.
- `redditapi.md` - Reddit API integration
- `reddit-api-error-handling.md` - Reddit error handling
- `enhanced-reddit-pipeline.md` - Enhanced pipeline
- `feedApiStructure.md` - Feed API structure

### `/migrations` - Database & Code Migrations
Migration guides and phase fix documentation.
- `MIGRATION.md` - General migration guide
- `PHASE_4_1_1_FIX.md` - Phase 4.1.1 fixes
- `PHASE_4_1_2_EVENT_FIX.md` - Phase 4.1.2 event fixes
- `PHASE_4_1_3_STALE_STATE_FIX.md` - Phase 4.1.3 stale state fixes

### `/modules` - Application Modules
Documentation for major application modules and agents.
- `HOST-MODULE.md` - Host module documentation
- `PRODUCER_AI_REFACTOR.md` - Producer AI refactor
- `BLOOMBERG-TRADING-HOST.md` - Bloomberg trading host
- `WHISTLEBLOWER-AGENT.md` - Whistleblower monitoring agent

### `/sessions` - Session Management
Session handling, tunnels, and chat management.
- `SESSION_TUNNELS.md` - Session tunnel system
- `sessionManager.md` - Session manager
- `sessionManagerChats-implementation.md` - Chat implementation
- `components/Conversations.md` - Conversations component

### `/setup` - Setup & Installation
Installation guides and environment setup documentation.
- `convex-inst.md` - Convex installation
- `computer-use-setup.md` - Computer use setup
- `innitredditapi.md` - Reddit API initialization
- `gitAttrubutes.md` - Git attributes configuration

### `/ui` - UI Components
User interface component documentation and specifications.
- `chat_ui/` - Chat UI components

### `/workflows` - Workflow Documentation
Process workflows and user experience flows.
- `feed-workflow.md` - Feed processing workflow
- `editor-agent-workflow-chart.md` - Editor agent workflow
- `user-experience-workflow.md` - User experience flow
- `syntheticFlow.md` - Synthetic data flow
- `Data-WorkFLOW.md` - General data workflow

## 📖 Key Documents

- `QUICK_REFERENCE.md` - Quick reference guide for common tasks
- `SUMMARY.md` - Project summary and overview

## 🗂️ Finding Documentation

### By Topic
- **Getting Started**: See `/setup` and `QUICK_REFERENCE.md`
- **API Development**: See `/api` and `/convex`
- **UI Development**: See `/ui`, `/design`, and `/features`
- **System Architecture**: See `/architecture`
- **Troubleshooting**: See `/authentication/troubleshooting.md` and `/bugfixes`

### By Role
- **Backend Developers**: `/api`, `/convex`, `/database`, `/architecture`
- **Frontend Developers**: `/ui`, `/design`, `/features`, `/workflows`
- **DevOps**: `/setup`, `/migrations`, `/integrations`
- **Product Managers**: `/workflows`, `/features`, `SUMMARY.md`

## 📝 Documentation Standards

### File Naming
- Use `SCREAMING_SNAKE_CASE.md` for major documents (e.g., `QUICK_REFERENCE.md`)
- Use `kebab-case.md` for feature/component docs (e.g., `story-card-architecture.md`)
- Use descriptive names that clearly indicate content

### Structure
- Each major section should have a `README.md` overview
- Include code examples where applicable
- Keep documents focused and single-purpose
- Link between related documents

### Maintenance
- Update docs when implementing new features
- Archive outdated documentation with clear deprecation notices
- Review and update quarterly for accuracy

## 🔄 Recent Reorganization (October 2025)

Documentation was reorganized from `/smnb/docs` to `/smnb/.docs` with improved categorization:
- Created clear folder hierarchy by topic
- Moved all loose files into appropriate categories
- Established consistent naming conventions
- Added comprehensive README structure

## 📞 Contributing

When adding new documentation:
1. Choose the appropriate category folder
2. Follow the naming conventions
3. Include a clear title and description
4. Add links in this README if it's a major document
5. Update related documentation with cross-references

---

**Last Updated**: October 21, 2025  
**Maintained By**: ACDC Digital Team
