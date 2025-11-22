"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { File, Trash2, Loader2 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface FileListProps {
  onSelectFile?: (fileId: string) => void;
}

export function FileList({ onSelectFile }: FileListProps) {
  const files = useQuery(api.files.list);
  const removeFile = useMutation(api.files.remove);

  const handleDelete = async (fileId: Id<"uploadedFiles">) => {
    if (confirm("Are you sure you want to delete this file?")) {
      await removeFile({ id: fileId });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (files === undefined) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-4 h-4 animate-spin text-[#858585]" />
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="text-xs text-[#858585] px-2 py-1.5">
        No files yet
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {files.map((file) => (
        <div
          key={file._id}
          className="group flex items-center justify-between px-2 py-1.5 hover:bg-[#2d2d2d] rounded transition-colors"
        >
          <button
            onClick={() => onSelectFile?.(file.anthropicFileId)}
            className="flex items-center gap-2 flex-1 min-w-0 text-left"
          >
            <File className="w-3.5 h-3.5 text-[#858585] shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="text-xs text-[#cccccc] truncate">
                {file.filename}
              </div>
              <div className="text-[10px] text-[#858585]">
                {formatFileSize(file.sizeBytes)}
              </div>
            </div>
          </button>
          <button
            onClick={() => handleDelete(file._id)}
            className="opacity-0 group-hover:opacity-100 p-1 rounded text-[#858585] hover:text-red-400 hover:bg-[#3e3e42] transition-all"
            title="Delete file"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
