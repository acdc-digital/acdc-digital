// HOOKS INDEX - Central exports for custom hooks following LifeOS patterns
// /Users/matthewsimon/Projects/LifeOS/LifeOS/lib/hooks/index.ts

export { useUser } from './useUser';
export { useFiles } from './useFiles';
export { useProjects } from './useProjects';
export { useCalendarPosts } from './useCalendarPosts';
export { useTrash } from './useTrash';
export { useTerminal, useTerminalHistory, useTerminalSession } from './useTerminal';
export { useResearch } from './useResearch';

// Export types
export type { UseUserReturn, UserProfileUpdateData } from './useUser';
export type { UseFilesReturn, FileData, CreateFileData, UpdateFileData } from './useFiles';
export type { UseProjectsReturn, ProjectData, CreateProjectData, UpdateProjectData } from './useProjects';
export type { 
  UseTrashReturn, 
  DeletedFileData, 
  DeletedProjectData, 
  TrashItem, 
  TrashStats 
} from './useTrash';
export type { Terminal, TerminalCommand } from './useTerminal';
