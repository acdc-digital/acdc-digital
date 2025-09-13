// HOOKS INDEX - Central exports for custom hooks following AURA patterns
// /Users/matthewsimon/Projects/AURA/AURA/lib/hooks/index.ts

export { useUser } from "./useUser";
export { useFiles } from "./useFiles";
export { useProjects } from "./useProjects";
export { useCalendarPosts } from "./useCalendarPosts";
export { useTrash } from "./useTrash";
export { useSessionSync } from "./useSessionSync";
export { useSessionMessages } from "./useSessionMessages";
export { useSessionTokens } from "./useSessionTokens";
export { useIdentityGuidelines } from "./useIdentityGuidelines";
export { useOnboarding } from "./useOnboarding";
export { useOnboardingMapping } from "./useOnboardingMapping";
export { usePreview } from "./usePreview";
export {
  useTerminal,
  useTerminalHistory,
  useTerminalSession,
} from "./useTerminal";

// Export types
export type { UseUserReturn, UserProfileUpdateData } from "./useUser";
export type {
  UseFilesReturn,
  FileData,
  CreateFileData,
  UpdateFileData,
} from "./useFiles";
export type {
  UseProjectsReturn,
  ProjectData,
  CreateProjectData,
  UpdateProjectData,
} from "./useProjects";
export type {
  UseTrashReturn,
  DeletedFileData,
  DeletedProjectData,
  TrashItem,
  TrashStats,
} from "./useTrash";
export type { Terminal, TerminalCommand } from "./useTerminal";
export type {
  IdentityGuidelines,
  IdentityGuidelinesStats,
  TargetAudience,
  BrandPersonality,
  ColorPalette,
  Typography,
  LogoGuidelines,
  IndustryContext,
  ContentGuidelines,
  SocialMediaGuidelines,
} from "./useIdentityGuidelines";
