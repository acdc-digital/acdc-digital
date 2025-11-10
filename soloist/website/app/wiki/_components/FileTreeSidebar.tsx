"use client";

import React, { useState } from "react";
import { ChevronRight, ChevronDown, File, Folder, FoldVertical } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useWikiStore, type FileNode } from "../../../store/wikiStore";

interface FileTreeItemProps {
  node: FileNode;
  level: number;
  isOpen: boolean;
  onToggle: () => void;
  forceClose: boolean;
}

function FileTreeItem({ node, level, isOpen, onToggle, forceClose }: FileTreeItemProps) {
  const pathname = usePathname();

  if (node.type === "folder") {
    return (
      <div>
        <button
          onClick={onToggle}
          className="flex items-center gap-1 w-full text-left py-1 hover:bg-muted rounded-sm text-sm transition-colors"
          // @ts-ignore - dynamic padding based on level
          style={{ paddingLeft: `${level * 0.75 + 0.5}rem` }}
        >
          {isOpen ? (
            <ChevronDown className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          )}
          <Folder className="h-3.5 w-3.5 text-blue-500 flex-shrink-0" />
          <span className="text-muted-foreground truncate">{node.name}</span>
        </button>
        {isOpen && node.children && (
          <div>
            {node.children.map((child, index) => (
              <FileTreeItemWrapper key={index} node={child} level={level + 1} forceClose={forceClose} />
            ))}
          </div>
        )}
      </div>
    );
  }

  // File node
  if (node.path) {
    return (
      <Link
        href={node.path}
        className="flex items-center gap-1 py-1 hover:bg-muted rounded-sm text-sm transition-colors group"
        // @ts-ignore - dynamic padding based on level
        style={{ paddingLeft: `${level * 0.75 + 0.5}rem` }}
      >
        <span className="w-3 flex-shrink-0" /> {/* Spacer for alignment */}
        <File className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground flex-shrink-0" />
        <span className="text-muted-foreground group-hover:text-foreground truncate">{node.name}</span>
      </Link>
    );
  }

  return (
    <div
      className="flex items-center gap-1 py-1 text-sm"
      // @ts-ignore - dynamic padding based on level
      style={{ paddingLeft: `${level * 0.75 + 0.5}rem` }}
    >
      <span className="w-3 flex-shrink-0" />
      <File className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
      <span className="text-muted-foreground truncate">{node.name}</span>
    </div>
  );
}

// Wrapper component to manage individual node state
function FileTreeItemWrapper({ node, level, forceClose }: { node: FileNode; level: number; forceClose: boolean }) {
  const [isOpen, setIsOpen] = useState(level < 2); // Auto-expand first 2 levels
  
  // Close when forceClose is triggered
  React.useEffect(() => {
    if (forceClose) {
      setIsOpen(false);
    }
  }, [forceClose]);
  
  return (
    <FileTreeItem 
      node={node} 
      level={level} 
      isOpen={isOpen} 
      onToggle={() => setIsOpen(!isOpen)}
      forceClose={forceClose}
    />
  );
}

export function FileTreeSidebar({ fileTree: propFileTree }: { fileTree?: FileNode[] }) {
  const storeFileTreeData = useWikiStore((state) => state.fileTreeData);
  const [forceClose, setForceClose] = useState(false);
  
  // Use prop if provided, otherwise fall back to store, then empty array
  const fileTree = propFileTree || storeFileTreeData || [];

  const handleCollapseAll = () => {
    setForceClose(true);
    // Reset forceClose to allow future collapses
    setTimeout(() => setForceClose(false), 50);
  };
  
  return (
    <div className="w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-14 h-[calc(100vh-3.5rem)] overflow-y-auto">
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            File Structure
          </h3>
          <button
            onClick={handleCollapseAll}
            className="p-1 hover:bg-muted rounded transition-colors"
            title="Collapse All"
          >
            <FoldVertical className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        </div>
        <div className="space-y-0.5">
          {fileTree.map((node, index) => (
            <FileTreeItemWrapper key={index} node={node} level={0} forceClose={forceClose} />
          ))}
        </div>
      </div>
    </div>
  );
}
