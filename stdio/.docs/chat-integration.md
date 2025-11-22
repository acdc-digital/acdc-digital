# Chat Integration with File Attachments

## Overview
This document describes the implementation of chat integration with uploaded file references, allowing Claude to use design files as context when generating components.

## Architecture

### Flow Diagram
```
User selects file → File menu displays uploaded files → 
User attaches file(s) → Files shown as badges below toolbar →
User sends message → API extracts file_id from attachments →
Anthropic receives message with document blocks → 
Claude processes with file context → Response streamed back
```

## Implementation Details

### 1. ChatPanel.tsx Updates

**New Imports:**
```typescript
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { X, File } from "lucide-react";
```

**State Management:**
```typescript
const [attachedFileIds, setAttachedFileIds] = useState<string[]>([]);
const [showFileMenu, setShowFileMenu] = useState(false);
const files = useQuery(api.files.list);
```

**File Attachment in handleSubmit:**
```typescript
sendMessage({ 
  content: input, 
  role: 'user',
  experimental_attachments: attachedFileIds.map(fileId => ({
    contentType: 'text/plain',
    name: files?.find(f => f.anthropicFileId === fileId)?.filename || 'file',
    url: `/api/files/${fileId}`,
  }))
});
```

**UI Components Added:**
- **File Menu Dropdown**: Shows list of uploaded files when clicking File icon
- **Attached Files Badges**: Displays selected files with remove buttons below toolbar
- **Empty State**: Shows "No files uploaded yet" when no files available

### 2. Chat API Route Updates (`app/api/chat/route.ts`)

**Replaced Vercel AI SDK with Direct Anthropic SDK:**
- Switched from `streamText` to `anthropic.messages.stream`
- Enables full control over message format for Files API beta

**Message Conversion:**
```typescript
const anthropicMessages = messages.map((msg: any) => {
  if (msg.role === 'user' && msg.experimental_attachments && msg.experimental_attachments.length > 0) {
    const contentBlocks: any[] = [
      { type: 'text', text: msg.content }
    ];
    
    msg.experimental_attachments.forEach((attachment: any) => {
      const fileId = attachment.url.split('/').pop();
      contentBlocks.push({
        type: 'document',
        source: { type: 'file', file_id: fileId }
      });
    });
    
    return { role: msg.role, content: contentBlocks };
  }
  
  return { role: msg.role, content: msg.content };
});
```

**Files API Beta Headers:**
```typescript
const stream = await anthropic.messages.stream({
  model: 'claude-haiku-4-5-20251001',
  max_tokens: 4096,
  system: `${ROLE_SYSTEM_PROMPT}\n\n${getComponentGenerationPrompt()}`,
  messages: anthropicMessages,
  temperature: 0.7,
}, {
  headers: {
    'anthropic-beta': 'pdfs-2024-09-25',
  },
});
```

**Stream Conversion:**
Converts Anthropic stream events to ReadableStream for StreamingTextResponse

## Usage

### For Users:
1. Click the **Folder** icon in the ActivityBar to open Files panel
2. Click the **+** button to upload a `.md` design file
3. In the Chat panel, click the **File** icon in the toolbar
4. Select file(s) to attach from the dropdown menu
5. Attached files appear as badges below the toolbar
6. Type your component generation request
7. Press Enter to send - Claude will receive both your message and the file content

### Example Prompt:
```
"Create a login form component based on the design file attached. 
Use the color scheme and layout specified in the design."
```

## Technical Notes

### Why Direct Anthropic SDK?
The Vercel AI SDK's `experimental_attachments` doesn't natively support Anthropic's Files API beta document blocks. Using the Anthropic SDK directly allows us to:
- Construct proper `document` content blocks with `file_id` references
- Include the required `anthropic-beta: pdfs-2024-09-25` header
- Maintain full control over message structure

### File ID Extraction
File IDs are passed via `experimental_attachments` URL field:
```typescript
url: `/api/files/${fileId}` // fileId is the Anthropic file_id
```

The API route extracts the ID: `attachment.url.split('/').pop()`

### Content Blocks Structure
Each user message with attachments becomes:
```typescript
{
  role: 'user',
  content: [
    { type: 'text', text: 'User message...' },
    { type: 'document', source: { type: 'file', file_id: 'file-xxx' } },
    // ... more document blocks for each attached file
  ]
}
```

## Dependencies

### Required Packages:
- `@anthropic-ai/sdk` ^0.70.1 (for Files API beta support)
- `ai` (for StreamingTextResponse)
- `convex` (for file list queries)
- `lucide-react` (for X, File icons)

### Environment Variables:
- `ANTHROPIC_API_KEY`: Required for direct Anthropic API calls
- `NEXT_PUBLIC_CONVEX_URL`: Required for Convex queries

## Testing Checklist

- [ ] Upload a `.md` file with design specifications
- [ ] Verify file appears in Files panel
- [ ] Click File icon in chat toolbar
- [ ] Verify file appears in dropdown menu
- [ ] Select file from menu
- [ ] Verify file badge appears below toolbar with correct filename
- [ ] Click X button on badge to remove file
- [ ] Verify file removed from attachments
- [ ] Attach file again and type a message
- [ ] Send message and verify Claude response references file content
- [ ] Check Network tab: verify `experimental_attachments` in request payload
- [ ] Verify API response streams correctly

## Future Enhancements

1. **Multiple File Types**: Support PDF, images via Anthropic vision API
2. **Drag & Drop**: Drag files from Files panel into chat
3. **Inline Preview**: Show file content preview on hover
4. **Token Usage Display**: Show token count for messages with attachments
5. **File Search**: Filter uploaded files in dropdown menu
6. **Attachment Indicators**: Show file icon in message bubbles
7. **Error Handling**: Better UX for file access errors or expired file_ids

## Troubleshooting

### Files not appearing in dropdown
- Check Convex connection: `files` query should return array
- Verify files uploaded successfully via Files panel
- Check browser console for query errors

### File content not used by Claude
- Verify `anthropic-beta: pdfs-2024-09-25` header included
- Check API logs: ensure `document` blocks constructed correctly
- Confirm file_id matches Anthropic Files API format (starts with `file-`)
- Verify ANTHROPIC_API_KEY has Files API beta access

### Streaming issues
- Check browser console for stream errors
- Verify StreamingTextResponse properly converts Anthropic events
- Test with shorter prompts to isolate streaming vs content issues

## Related Documentation
- [File Upload Implementation](.docs/files-api-implementation.md)
- [Anthropic Files API Docs](https://docs.anthropic.com/en/docs/build-with-claude/pdf-support)
- [Vercel AI SDK Docs](https://sdk.vercel.ai/docs)
