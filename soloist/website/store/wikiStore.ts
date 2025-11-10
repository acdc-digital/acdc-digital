import { create } from "zustand";

interface TableOfContentsSection {
  id: string;
  title: string;
  count: number;
}

export interface FileNode {
  name: string;
  path?: string;
  type: "file" | "folder";
  children?: FileNode[];
}

interface WikiState {
  showSidebar: boolean;
  sidebarContent: "fileTree" | "tableOfContents" | null;
  tableOfContentsData: TableOfContentsSection[] | null;
  fileTreeData: FileNode[] | null;
  setShowSidebar: (show: boolean) => void;
  setSidebarContent: (
    content: "fileTree" | "tableOfContents" | null, 
    data?: TableOfContentsSection[] | FileNode[] | null
  ) => void;
}

export const useWikiStore = create<WikiState>((set) => ({
  showSidebar: false,
  sidebarContent: null,
  tableOfContentsData: null,
  fileTreeData: null,
  setShowSidebar: (show) => set({ showSidebar: show }),
  setSidebarContent: (content, data = null) => 
    set({ 
      sidebarContent: content, 
      showSidebar: content !== null,
      tableOfContentsData: content === "tableOfContents" ? data as TableOfContentsSection[] : null,
      fileTreeData: content === "fileTree" ? data as FileNode[] : null,
    }),
}));
