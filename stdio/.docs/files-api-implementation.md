# Anthropic Files API Implementation Guide

## Overview

This document provides a comprehensive guide to the Anthropic Files API integration in the stdio application. The implementation enables users to upload markdown (`.md`) files as design context that can be referenced by Claude when generating React components. This eliminates the need to repeatedly paste design specifications into chat messages and provides a more efficient workflow for component generation.

## Architecture

### High-Level Flow

```
User uploads .md file
    ↓
Next.js API Route (/api/files/upload)
    ↓
Anthropic Files API (receives file, returns file_id)
    ↓
Convex Database (stores metadata + file_id)
    ↓
UI displays file in Files sidebar
    ↓
User references file in chat
    ↓
Chat API includes file_id in Claude request
    ↓
Claude reads file context and generates component
```

### Component Architecture

```
stdio/
├── app/
│   ├── _components/
│   │   ├── files/
│   │   │   └── FileList.tsx          # UI for displaying uploaded files
│   │   ├── SidePanel.tsx             # Contains file upload UI
│   │   └── ChatPanel.tsx             # (Future: file attachment in chat)
│   └── api/
│       └── files/
│           └── upload/
│               └── route.ts          # Handles upload to Anthropic API
├── convex/
│   ├── schema.ts                     # Database schema for files
│   └── files.ts                      # Convex functions for file CRUD
```

## Implementation Details

### 1. Database Schema (Convex)

**File**: `convex/schema.ts`

The schema defines how uploaded files are stored in the Convex database. Each file record contains both metadata and the actual file content.

```typescript
uploadedFiles: defineTable({
  filename: v.string(),              // Original filename (e.g., "design-system.md")
  anthropicFileId: v.string(),       // Unique ID from Anthropic (e.g., "file_011CNha8...")
  mimeType: v.string(),              // MIME type (always "text/plain" for .md)
  sizeBytes: v.number(),             // File size in bytes
  content: v.string(),               // Full markdown content
  createdAt: v.number(),             // Unix timestamp of upload
})
  .index("by_createdAt", ["createdAt"])
  .index("by_anthropicFileId", ["anthropicFileId"])
```

**Why store content?**
- Allows quick preview without calling Anthropic API
- Provides fallback if Anthropic file expires
- Enables full-text search in the future
- No additional cost (Anthropic file operations are free)

**Indexes explained:**
- `by_createdAt`: Enables efficient sorting by upload time (newest first)
- `by_anthropicFileId`: Fast lookup when referencing files in chat

**Type safety:**
Convex automatically generates TypeScript types from this schema in `_generated/dataModel.ts`, providing:
```typescript
type UploadedFile = {
  _id: Id<"uploadedFiles">;
  _creationTime: number;
  filename: string;
  anthropicFileId: string;
  mimeType: string;
  sizeBytes: number;
  content: string;
  createdAt: number;
};
```

### 2. Convex Functions

**File**: `convex/files.ts`

These are server-side functions that run in Convex's cloud infrastructure, providing type-safe database operations.

#### List Files Query

```typescript
export const list = query({
  args: {},
  returns: v.array(v.object({
    _id: v.id("uploadedFiles"),
    _creationTime: v.number(),
    filename: v.string(),
    anthropicFileId: v.string(),
    mimeType: v.string(),
    sizeBytes: v.number(),
    content: v.string(),
    createdAt: v.number(),
  })),
  handler: async (ctx) => {
    const files = await ctx.db
      .query("uploadedFiles")
      .withIndex("by_createdAt")    // Use index for performance
      .order("desc")                 // Newest first
      .collect();
    return files;
  },
});
```

**Key concepts:**
- `query` vs `mutation`: Queries are read-only, mutations modify data
- `args` and `returns`: Convex enforces argument and return type validation
- `withIndex`: Uses database index instead of scanning entire table
- `order("desc")`: Most recent uploads appear first

**Best practices:**
- Always use indexes for queries (never use `.filter()` without index)
- Define explicit return types for TypeScript safety
- Order matters: Query index fields in the order they're defined

#### Create File Mutation

```typescript
export const create = mutation({
  args: {
    filename: v.string(),
    anthropicFileId: v.string(),
    mimeType: v.string(),
    sizeBytes: v.number(),
    content: v.string(),
  },
  returns: v.id("uploadedFiles"),
  handler: async (ctx, args) => {
    const fileId = await ctx.db.insert("uploadedFiles", {
      filename: args.filename,
      anthropicFileId: args.anthropicFileId,
      mimeType: args.mimeType,
      sizeBytes: args.sizeBytes,
      content: args.content,
      createdAt: Date.now(),
    });
    return fileId;
  },
});
```

**Transaction safety:**
- Convex mutations are atomic - either all changes succeed or none do
- No need for explicit transaction handling
- If this mutation fails, no partial data is saved

#### Delete File Mutation

```typescript
export const remove = mutation({
  args: { id: v.id("uploadedFiles") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
```

**Important notes:**
- Only deletes from Convex database
- Does NOT delete from Anthropic (files persist there per their retention policy)
- Anthropic files become inaccessible after deletion according to their docs
- Consider adding orphan cleanup job in production

#### Find by Anthropic ID Query

```typescript
export const getByAnthropicFileId = query({
  args: { anthropicFileId: v.string() },
  returns: v.union(
    v.object({
      _id: v.id("uploadedFiles"),
      // ... other fields
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const file = await ctx.db
      .query("uploadedFiles")
      .withIndex("by_anthropicFileId", (q) => 
        q.eq("anthropicFileId", args.anthropicFileId)
      )
      .first();
    return file;
  },
});
```

**Use case:**
- When Claude returns a file reference in chat
- Lookup file metadata without scanning entire table
- Returns `null` if file doesn't exist (safe handling)

### 3. Upload API Route

**File**: `app/api/files/upload/route.ts`

This Next.js API route handles the server-side file upload to Anthropic. It runs on Vercel's edge runtime for low latency.

```typescript
import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file extension
    if (!file.name.endsWith(".md")) {
      return NextResponse.json(
        { error: "Only .md files are supported" },
        { status: 400 }
      );
    }

    // Convert File to Buffer for processing
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const content = buffer.toString("utf-8");

    // Upload to Anthropic Files API
    const uploadedFile = await anthropic.beta.files.upload({
      file: new File([buffer], file.name, { type: "text/plain" }),
    });

    // Return success with file metadata
    return NextResponse.json({
      success: true,
      file: {
        id: uploadedFile.id,
        filename: uploadedFile.filename,
        mimeType: uploadedFile.mime_type,
        sizeBytes: uploadedFile.size_bytes,
        content: content,
      },
    });
  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
```

**Key decisions:**

1. **Why read file content?**
   - Store locally for preview/search
   - Avoid re-downloading from Anthropic
   - Enable offline viewing

2. **Why use Buffer?**
   - Anthropic SDK expects Node.js File object
   - Next.js FormData provides Web API File object
   - Buffer provides the bridge between them

3. **Error handling:**
   - Client-side errors (400): Missing file, wrong type
   - Server-side errors (500): Anthropic API failures
   - Always log errors for debugging

4. **Security considerations:**
   - API key stored in environment variable
   - File size validated by Anthropic (500MB limit)
   - Only .md files accepted (prevents binary uploads)
   - No public endpoint (requires authentication in production)

**Response format:**
```json
{
  "success": true,
  "file": {
    "id": "file_011CNha8iCJcU1wXNR6q4V8w",
    "filename": "design-system.md",
    "mimeType": "text/plain",
    "sizeBytes": 8192,
    "content": "# Design System\n\n..."
  }
}
```

### 4. File List Component

**File**: `app/_components/files/FileList.tsx`

A React component that displays uploaded files with interactive delete functionality.

```typescript
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { File, Trash2, Loader2 } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface FileListProps {
  onSelectFile?: (fileId: string) => void;
}

export function FileList({ onSelectFile }: FileListProps) {
  // Real-time query - automatically updates when files change
  const files = useQuery(api.files.list);
  
  // Mutation for deleting files
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

  // Loading state while query executes
  if (files === undefined) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-4 h-4 animate-spin text-[#858585]" />
      </div>
    );
  }

  // Empty state
  if (files.length === 0) {
    return (
      <div className="text-xs text-[#858585] px-2 py-1.5">
        No files yet
      </div>
    );
  }

  // Render file list
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
```

**Convex real-time features:**

1. **Reactive queries:**
   ```typescript
   const files = useQuery(api.files.list);
   ```
   - Automatically re-fetches when database changes
   - No manual refresh needed
   - Returns `undefined` during initial load
   - Updates instantly across all clients

2. **Optimistic mutations:**
   ```typescript
   await removeFile({ id: fileId });
   ```
   - UI updates immediately (optimistic)
   - Reverts if server operation fails
   - No loading state needed for mutations

**UI/UX details:**

1. **Hover interactions:**
   - Delete button only appears on hover (`opacity-0 group-hover:opacity-100`)
   - Reduces visual clutter
   - Prevents accidental deletion

2. **Truncation handling:**
   - Long filenames truncate with ellipsis (`truncate`)
   - Parent container prevents overflow (`min-w-0`)
   - Icon never truncates (`shrink-0`)

3. **Confirmation dialog:**
   - Native `confirm()` prevents accidental deletion
   - Production apps should use custom modal
   - Consider undo functionality for better UX

4. **File size formatting:**
   - Displays in appropriate unit (B, KB, MB)
   - One decimal place for readability
   - Handles edge cases (0 bytes, very large files)

### 5. Side Panel Integration

**File**: `app/_components/SidePanel.tsx`

The side panel contains the file upload UI and integrates the FileList component.

```typescript
export function SidePanel({ activePanel, onSelectComponent }: SidePanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createFile = useMutation(api.files.create);
  
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.md')) {
      alert('Please select a .md file');
      return;
    }

    setIsUploading(true);
    try {
      // Step 1: Upload to Anthropic via API route
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload file');
      }

      const data = await response.json();

      // Step 2: Save metadata to Convex
      await createFile({
        filename: data.file.filename,
        anthropicFileId: data.file.id,
        mimeType: data.file.mimeType,
        sizeBytes: data.file.sizeBytes,
        content: data.file.content,
      });

      console.log('File uploaded successfully:', data.file.filename);
    } catch (error) {
      console.error('File upload error:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset input to allow re-uploading same file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
```

**Upload flow breakdown:**

1. **User selects file:**
   - Hidden `<input type="file">` triggered by visible button
   - `accept=".md"` provides browser-level filtering
   - Server-side validation still required (never trust client)

2. **Client-side validation:**
   - Check file extension before upload
   - Saves bandwidth by rejecting invalid files early
   - Provides immediate feedback to user

3. **FormData preparation:**
   ```typescript
   const formData = new FormData();
   formData.append('file', file);
   ```
   - Browser API for multipart/form-data encoding
   - Required for file uploads
   - Handles binary data correctly

4. **API call:**
   ```typescript
   const response = await fetch('/api/files/upload', {
     method: 'POST',
     body: formData,
   });
   ```
   - Uses native fetch (no axios needed)
   - Next.js automatically handles multipart parsing
   - Response contains Anthropic file ID

5. **Database save:**
   ```typescript
   await createFile({
     filename: data.file.filename,
     anthropicFileId: data.file.id,
     // ...
   });
   ```
   - Only saves if Anthropic upload succeeds
   - Stores metadata for quick access
   - Real-time update triggers FileList re-render

6. **Error handling:**
   - Try-catch wraps entire upload process
   - User-friendly alert messages
   - Console logging for debugging
   - Loading state prevents double-upload

7. **Input reset:**
   ```typescript
   if (fileInputRef.current) {
     fileInputRef.current.value = '';
   }
   ```
   - Allows uploading same file twice
   - Necessary because `onChange` won't fire otherwise
   - Safe null check with optional chaining

**UI rendering:**

```typescript
case "files":
  return (
    <div className="flex flex-col gap-4 p-4">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-[#cccccc]">
            Project Files
          </h3>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="p-1 rounded text-[#858585] hover:bg-[#2d2d2d] hover:text-[#cccccc] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={isUploading ? "Uploading..." : "Upload markdown file"}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".md"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="hidden"
            aria-label="Upload markdown file"
          />
        </div>
        <FileList />
      </div>
    </div>
  );
```

**Accessibility:**
- `aria-label` on hidden input for screen readers
- `title` attribute for hover tooltip
- `disabled` state prevents interaction during upload
- Visual feedback with opacity change

## Using Files in Chat (Implementation Guide)

### Current State
Files are uploaded and stored but not yet integrated into the chat system.

### Future Implementation

#### Step 1: Update Chat API Route

**File**: `app/api/chat/route.ts`

```typescript
import { anthropic } from '@ai-sdk/anthropic';
import Anthropic from '@anthropic-ai/sdk';

// Create direct Anthropic client for file support
const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { messages, fileIds } = await req.json();

    // Build message content with file references
    const messageContent = [];
    
    // Add text content
    const lastMessage = messages[messages.length - 1];
    messageContent.push({
      type: "text",
      text: lastMessage.content,
    });

    // Add file references
    if (fileIds && fileIds.length > 0) {
      for (const fileId of fileIds) {
        messageContent.push({
          type: "document",
          source: {
            type: "file",
            file_id: fileId,
          },
          context: "Use this as design context for component generation",
        });
      }
    }

    // Use direct Anthropic client for file support
    const response = await anthropicClient.messages.create({
      model: "claude-sonnet-4-5",
      max_tokens: 4000,
      system: `${ROLE_SYSTEM_PROMPT}\n\n${getComponentGenerationPrompt()}`,
      messages: [
        {
          role: "user",
          content: messageContent,
        },
      ],
    });

    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ error: 'Error processing request' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
```

**Why direct Anthropic client?**
- Vercel AI SDK doesn't yet support Files API beta
- Direct client gives full control over message structure
- Can add document blocks with file references
- Future: Migrate back to AI SDK when it supports files

#### Step 2: Add File Selection to Chat UI

**File**: `app/_components/ChatPanel.tsx`

Add file attachment button:

```typescript
const [attachedFileIds, setAttachedFileIds] = useState<string[]>([]);
const files = useQuery(api.files.list);

// File attachment dropdown
<Popover>
  <PopoverTrigger>
    <Paperclip className="w-4 h-4" />
  </PopoverTrigger>
  <PopoverContent>
    {files?.map(file => (
      <button
        key={file._id}
        onClick={() => {
          setAttachedFileIds([...attachedFileIds, file.anthropicFileId]);
        }}
      >
        {file.filename}
      </button>
    ))}
  </PopoverContent>
</Popover>

// Display attached files
{attachedFileIds.map(fileId => {
  const file = files?.find(f => f.anthropicFileId === fileId);
  return (
    <Badge key={fileId}>
      {file?.filename}
      <X onClick={() => {
        setAttachedFileIds(attachedFileIds.filter(id => id !== fileId));
      }} />
    </Badge>
  );
})}
```

#### Step 3: Update Message Sending

```typescript
const handleSend = async () => {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      messages: messages,
      fileIds: attachedFileIds, // Include attached files
    }),
  });
  
  // Clear attachments after sending
  setAttachedFileIds([]);
};
```

## Testing Strategy

### Unit Tests

1. **Convex functions:**
   ```typescript
   import { convexTest } from "convex-test";
   import { expect, test } from "vitest";
   import schema from "./schema";
   
   test("creates and retrieves file", async () => {
     const t = convexTest(schema);
     
     const fileId = await t.mutation(api.files.create, {
       filename: "test.md",
       anthropicFileId: "file_123",
       mimeType: "text/plain",
       sizeBytes: 100,
       content: "# Test",
     });
     
     const files = await t.query(api.files.list);
     expect(files).toHaveLength(1);
     expect(files[0].filename).toBe("test.md");
   });
   ```

2. **API route:**
   ```typescript
   import { POST } from './route';
   
   test("rejects non-markdown files", async () => {
     const formData = new FormData();
     formData.append('file', new File([''], 'test.txt'));
     
     const response = await POST({
       formData: () => Promise.resolve(formData),
     });
     
     expect(response.status).toBe(400);
   });
   ```

### Integration Tests

1. **Upload flow:**
   - Select .md file
   - Verify Anthropic API called
   - Check Convex database updated
   - Confirm UI displays file

2. **Delete flow:**
   - Upload file
   - Click delete button
   - Confirm deletion prompt
   - Verify file removed from UI
   - Check database record deleted

### Manual Testing Checklist

- [ ] Upload valid .md file
- [ ] Upload invalid file (non-.md)
- [ ] Upload same file twice
- [ ] Delete file
- [ ] Upload during ongoing upload (disabled state)
- [ ] Check file list updates in real-time
- [ ] Verify file sizes display correctly
- [ ] Test with large files (>10MB)
- [ ] Test with empty file
- [ ] Test with special characters in filename

## Production Considerations

### 1. Error Handling

**Anthropic API failures:**
```typescript
try {
  const uploadedFile = await anthropic.beta.files.upload({...});
} catch (error) {
  if (error.status === 413) {
    return NextResponse.json(
      { error: "File too large (max 500 MB)" },
      { status: 413 }
    );
  }
  if (error.status === 403) {
    return NextResponse.json(
      { error: "Storage limit exceeded (100 GB max)" },
      { status: 403 }
    );
  }
  throw error;
}
```

### 2. Rate Limiting

**Anthropic limits:**
- ~100 requests per minute during beta
- Implement client-side rate limiting
- Show queue status to user
- Consider request batching

```typescript
import { Ratelimit } from "@upstash/ratelimit";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, "1 m"),
});

const { success } = await ratelimit.limit(userId);
if (!success) {
  return NextResponse.json(
    { error: "Rate limit exceeded" },
    { status: 429 }
  );
}
```

### 3. File Size Validation

**Client-side check:**
```typescript
const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500 MB

if (file.size > MAX_FILE_SIZE) {
  alert("File too large. Maximum size is 500 MB.");
  return;
}
```

**Server-side check:**
```typescript
if (buffer.length > MAX_FILE_SIZE) {
  return NextResponse.json(
    { error: "File exceeds maximum size" },
    { status: 413 }
  );
}
```

### 4. Security

**Authentication:**
```typescript
import { auth } from "@clerk/nextjs";

export async function POST(req: Request) {
  const { userId } = auth();
  
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }
  
  // Proceed with upload...
}
```

**File type validation:**
```typescript
// Server-side MIME type check
const fileMagic = buffer.slice(0, 4);
const isText = fileMagic.every(byte => byte < 128);

if (!isText) {
  return NextResponse.json(
    { error: "Invalid file format" },
    { status: 400 }
  );
}
```

**Filename sanitization:**
```typescript
const sanitizeFilename = (filename: string) => {
  // Remove path traversal attempts
  const safe = filename.replace(/[<>:"|?*\\\/\x00-\x1f]/g, '_');
  
  // Limit length
  return safe.slice(0, 255);
};
```

### 5. Storage Management

**Monitor usage:**
```typescript
export const getStorageUsage = query({
  args: {},
  handler: async (ctx) => {
    const files = await ctx.db.query("uploadedFiles").collect();
    const totalBytes = files.reduce((sum, f) => sum + f.sizeBytes, 0);
    const totalGB = totalBytes / (1024 * 1024 * 1024);
    
    return {
      totalFiles: files.length,
      totalGB: totalGB.toFixed(2),
      limit: 100,
      percentUsed: (totalGB / 100) * 100,
    };
  },
});
```

**Cleanup old files:**
```typescript
export const deleteOldFiles = mutation({
  args: { olderThanDays: v.number() },
  handler: async (ctx, args) => {
    const cutoff = Date.now() - (args.olderThanDays * 24 * 60 * 60 * 1000);
    
    const oldFiles = await ctx.db
      .query("uploadedFiles")
      .withIndex("by_createdAt", q => q.lt("createdAt", cutoff))
      .collect();
    
    for (const file of oldFiles) {
      await ctx.db.delete(file._id);
    }
    
    return oldFiles.length;
  },
});
```

### 6. Performance Optimization

**Lazy loading:**
```typescript
// Only load file content when needed
export const getFileContent = query({
  args: { id: v.id("uploadedFiles") },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.id);
    return file?.content;
  },
});

// List view only needs metadata
export const listMetadata = query({
  args: {},
  handler: async (ctx) => {
    const files = await ctx.db
      .query("uploadedFiles")
      .withIndex("by_createdAt")
      .order("desc")
      .collect();
    
    return files.map(f => ({
      _id: f._id,
      filename: f.filename,
      sizeBytes: f.sizeBytes,
      createdAt: f.createdAt,
    }));
  },
});
```

**Pagination:**
```typescript
export const listPaginated = query({
  args: {
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("uploadedFiles")
      .withIndex("by_createdAt")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});
```

## Troubleshooting

### Issue: Files not appearing after upload

**Possible causes:**
1. Convex function not called
2. Anthropic API failure
3. Type mismatch in mutation

**Debug steps:**
```typescript
// Add logging
console.log('Upload response:', data);
console.log('Creating file in Convex...');

await createFile({...});

console.log('File created successfully');
```

**Check Convex dashboard:**
- View uploadedFiles table
- Check recent function calls
- Look for error logs

### Issue: "Property 'files' does not exist on type"

**Cause:**
Convex types not regenerated after schema changes.

**Solution:**
```bash
npx convex dev --once
```

This regenerates `_generated/api.ts` with new function references.

### Issue: Upload hangs indefinitely

**Possible causes:**
1. Large file taking time
2. Network timeout
3. Anthropic API rate limit

**Solutions:**
```typescript
// Add timeout
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 30000);

const response = await fetch('/api/files/upload', {
  method: 'POST',
  body: formData,
  signal: controller.signal,
});

clearTimeout(timeoutId);
```

### Issue: File content truncated

**Cause:**
Next.js body size limit (default 1MB).

**Solution:**
```typescript
// next.config.ts
export default {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
```

## Future Enhancements

### 1. Multiple File Selection

```typescript
<input
  type="file"
  accept=".md"
  multiple
  onChange={handleMultipleFiles}
/>

const handleMultipleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []);
  
  for (const file of files) {
    await uploadFile(file);
  }
};
```

### 2. Drag & Drop Upload

```typescript
const handleDrop = async (e: React.DragEvent) => {
  e.preventDefault();
  const files = Array.from(e.dataTransfer.files);
  const mdFiles = files.filter(f => f.name.endsWith('.md'));
  
  for (const file of mdFiles) {
    await uploadFile(file);
  }
};

return (
  <div
    onDrop={handleDrop}
    onDragOver={(e) => e.preventDefault()}
    className="border-2 border-dashed"
  >
    Drop .md files here
  </div>
);
```

### 3. File Preview

```typescript
const [previewContent, setPreviewContent] = useState<string | null>(null);

const handlePreview = (file: UploadedFile) => {
  setPreviewContent(file.content);
};

{previewContent && (
  <Modal>
    <ReactMarkdown>{previewContent}</ReactMarkdown>
  </Modal>
)}
```

### 4. File Search

```typescript
const [searchQuery, setSearchQuery] = useState('');

const filteredFiles = files?.filter(file =>
  file.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
  file.content.toLowerCase().includes(searchQuery.toLowerCase())
);
```

### 5. File Versioning

```typescript
uploadedFiles: defineTable({
  // ... existing fields
  version: v.number(),
  previousVersionId: v.optional(v.id("uploadedFiles")),
})
.index("by_filename_and_version", ["filename", "version"])
```

### 6. Bulk Operations

```typescript
const [selectedFiles, setSelectedFiles] = useState<Set<Id<"uploadedFiles">>>(new Set());

const deleteSelected = async () => {
  for (const fileId of selectedFiles) {
    await removeFile({ id: fileId });
  }
  setSelectedFiles(new Set());
};
```

## Conclusion

This implementation provides a robust foundation for managing design files in stdio. The key architectural decisions—storing both in Anthropic and Convex, using real-time queries, and implementing proper error handling—create a scalable system that can grow with the application.

The next step is integrating these files into the chat system, allowing Claude to reference uploaded design specifications when generating components. This will dramatically improve component quality and reduce repetitive context-sharing.

## Additional Resources

- [Anthropic Files API Documentation](https://docs.anthropic.com/en/api/files)
- [Convex Documentation](https://docs.convex.dev/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [React Hook Form](https://react-hook-form.com/) (for complex form validation)
- [Zod](https://zod.dev/) (for runtime type validation)
