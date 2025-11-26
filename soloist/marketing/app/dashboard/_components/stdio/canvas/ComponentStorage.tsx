"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Trash2, ExternalLink } from "lucide-react";
import { useState } from "react";

interface ComponentStorageProps {
  onSelectComponent: (component: {
    _id: Id<"generatedComponents">;
    code: string;
    title: string;
    framework: "react";
  }) => void;
}

export function ComponentStorage({ onSelectComponent }: ComponentStorageProps) {
  const components = useQuery(api.components.listComponents);
  const deleteComponent = useMutation(api.components.deleteComponent);
  const [deletingId, setDeletingId] = useState<Id<"generatedComponents"> | null>(null);

  const handleDelete = async (id: Id<"generatedComponents">) => {
    if (!confirm("Are you sure you want to delete this component?")) return;
    
    setDeletingId(id);
    try {
      await deleteComponent({ componentId: id });
    } catch (error) {
      console.error("Failed to delete component:", error);
    } finally {
      setDeletingId(null);
    }
  };

  if (components === undefined) {
    return (
      <div className="p-4">
        <div className="text-xs text-muted-foreground">Loading components...</div>
      </div>
    );
  }

  if (components.length === 0) {
    return (
      <div className="p-4">
        <div className="text-xs text-muted-foreground">
          No saved components yet. Generate your first component to get started.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      {components.map((component) => (
        <div
          key={component._id}
          className="group flex items-start gap-2 px-2 py-2 hover:bg-accent/10 transition-colors cursor-pointer"
          onClick={() => onSelectComponent(component)}
        >
          <ExternalLink className="w-3 h-3 text-muted-foreground shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="text-xs text-foreground truncate">
              {component.title}
            </div>
            <div className="text-[10px] text-muted-foreground mt-0.5">
              {new Date(component.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(component._id);
            }}
            disabled={deletingId === component._id}
            className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-accent/10 transition-colors opacity-0 group-hover:opacity-100 disabled:opacity-50 shrink-0"
            title="Delete component"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
