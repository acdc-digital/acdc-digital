# Changelog

All notable changes to SoloPro will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.6.6] - 2025-01-XX

### Added
- 🚀 **Comprehensive Release Management System** - Complete specification and automation for version management
- 📋 **Release Specification Document** - Detailed process documentation in `docs/RELEASE.MD`
- 🤖 **Automated Version Update Scripts** - One-command version updating with `scripts/update-version.sh`
- 🔍 **Build Verification Tools** - Automated build file verification with `scripts/verify-build.sh`
- 📝 **Release Process Documentation** - Step-by-step guide for consistent releases

### Enhanced
- 🔧 **Development Workflow** - Streamlined version management across all packages
- 📦 **Build Process** - Automated verification and quality gates
- 🎯 **Release Consistency** - Unified version tracking across frontend and backend

### Fixed
- ✅ **Version Synchronization** - All package.json files now consistently updated
- 🎨 **Frontend Version Display** - Accurate version information in all UI components
- 📄 **Documentation** - Up-to-date version references in README and download links

## [1.6.5] - 2025-01-22

### Added
- 💰 **OpenAI Cost Tracking System** - Comprehensive monitoring of all AI usage
- 📊 **Admin Analytics Dashboard** - Real-time cost statistics and trends
- 🎯 **Feature Breakdown** - Cost analysis by AI function (forecasting, consultation, etc.)
- ⚡ **Model Performance Metrics** - Efficiency comparison across OpenAI models
- 🚨 **Cost Alerts** - Warnings when projected monthly spending exceeds thresholds
- 📈 **Usage Analytics** - Token usage, request counts, and user attribution
- 🗂️ **Database Schema** - New `openaiUsage` table with optimized indexes

### Enhanced
- 🔧 **AI Integration** - All AI functions now track costs automatically
- 🎨 **Admin Interface** - New LLM Usage section with intuitive navigation
- 📱 **Responsive Design** - Cost dashboard works across all device sizes

### Fixed
- 🛠️ **Build Issues** - Removed date-fns dependency, fixed production compilation
- ⚡ **Performance** - Native JavaScript date formatting for better compatibility

## [1.6.4] - 2025-01-29

### Added
- **Email Verification System**: Required email verification for all new user accounts
  - 8-digit OTP codes sent via professional branded emails
  - Resend integration for reliable email delivery
  - Secure token generation using Oslo cryptography
  
- **Advanced Password Security**: Strong password requirements and validation
  - 8+ characters with uppercase, lowercase, numbers, and special characters
  - Real-time validation with helpful requirement hints
  - Custom password provider with detailed error messages
  - Backward compatibility for existing user accounts

- **Complete Password Reset Flow**: Email-based password reset with secure OTP verification
  - Two-step process: email verification → new password creation
  - Rate limiting protection via Convex Auth
  - Professional email templates with security warnings

- **Enhanced Error Handling**: Smart error detection with contextual messaging
  - Color-coded badges: amber for verification issues, red for critical errors
  - User-friendly suggestions with actionable next steps
  - Professional styling with icons and proper visual hierarchy

- **Streamlined Security Settings**: Integrated password reset within user profile modals
  - No overlapping modals - clean, single-modal experience
  - Consistent security iconography across all interfaces
  - Mobile-responsive design for all authentication flows

### Fixed
- **Schema & Database**: Fixed schema conflicts between custom users table and Convex Auth
  - Standardized user ID fields across all tables
  - Database cleanup of orphaned authentication records
  - Maintained backward compatibility with existing data

- **TypeScript & Build**: Fixed compilation errors in authentication components
  - Proper type annotations for enhanced development experience
  - Build optimization for all packages (renderer, website, electron)

### Changed
- **Architecture Updates**: Unified authentication system across website and desktop app
  - Consistent error handling between all authentication states
  - Proper flow control with back navigation and state management
  - Security-first design with verification-required workflows

- **Component Architecture**: Reusable authentication components across packages
  - Shared error handling logic for consistent user experience
  - Modular security features for easy maintenance and updates

### Security
- **Professional Email Templates**: Branded verification and security-focused messaging
- **Reliable Email Delivery**: Resend service integration with proper domain verification
- **Enhanced Error Logging**: Improved debugging for email and authentication issues

## [1.5.0] - 2025-01-28

### Added
- **Comprehensive Feedback System**: New feedback modal with detailed user feedback collection
  - Star ratings for overall satisfaction, ease of use, data accuracy, helpfulness, and recommendation
  - Feature value assessment (most/least valuable features)
  - Text fields for improvement suggestions, feature requests, privacy concerns, and comments
  - Anonymous feedback support for unauthenticated users
  - Convex backend integration with `userFeedback` table and analytics queries

- **Production Deployment Configuration**: Complete deployment setup for production
  - Environment variable support for website and renderer URLs
  - Vercel configuration files for both website and renderer
  - Automated deployment script (`deploy.sh`) with build validation
  - Comprehensive deployment guide with step-by-step instructions

- **Cross-Application Routing**: Dynamic URL handling between website and renderer
  - Environment-based URL routing (localhost for dev, production domains for prod)
  - Seamless navigation between marketing site and application
  - Updated all hardcoded localhost references to use environment variables

### Changed
- **Updated Package Versions**: Unified all package.json versions to 1.5.0
  - Root monorepo: 1.4.2 → 1.5.0
  - Website: 0.1.0 → 1.5.0  
  - Renderer: 0.1.0 → 1.5.0
  - Electron: 1.4.2 → 1.5.0

- **Enhanced Authentication Integration**: Improved feedback system integration with authentication
  - Uses `useConvexUser` hook for consistent authentication state
  - Proper handling of authenticated and anonymous user feedback

### Technical Improvements
- **Database Schema Updates**: New `userFeedback` table with comprehensive feedback tracking
- **Type Safety**: Full TypeScript support for all new feedback functions
- **Error Handling**: Enhanced error handling and user feedback in the feedback modal
- **Deployment Automation**: Streamlined deployment process with validation and testing

### Developer Experience
- **Deployment Tooling**: New automated deployment script with environment validation
- **Documentation**: Comprehensive deployment guide with troubleshooting section
- **Environment Management**: Clear separation of development and production configurations

---

## [1.4.2] - Previous Release
- Base functionality and core features 