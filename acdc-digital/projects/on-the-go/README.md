# On The Go

SMS note-taking app with Twilio integration and real-time Convex backend.

## Features

- 📱 **SMS Integration**: Receive notes via Twilio SMS
- 📝 **Markdown Editor**: Edit notes with markdown support
- 🔄 **Real-time Updates**: Automatic list updates when new messages arrive
- 🏷️ **Tagging System**: Organize notes with custom tags
- 📊 **Status Tracking**: Track note status (new, read, edited, archived)
- 🎨 **VS Code-inspired UI**: Professional dark theme dashboard

## Getting Started

### 1. Install Dependencies

```bash
cd on-the-go
npm install
```

### 2. Set Up Convex

```bash
# Start Convex development server
npm run convex

# Follow the prompts to:
# - Create a Convex account (if needed)
# - Set up your project
# - Get your deployment URL
```

### 3. Configure Environment

Copy `.env.local.example` to `.env.local` and add your Convex URL:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
```

### 4. Start Development Server

```bash
npm run dev
```

Visit http://localhost:6060 to see your app!

## Twilio Integration Setup

**Status**: ✅ Configured and ready to test

See [TWILIO-SETUP.md](.docs/TWILIO-SETUP.md) for detailed setup instructions.

### Quick Start

1. **Webhook Configuration** (Required):
   - Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/incoming
   - Select phone number: `+12294587352`
   - Set webhook URL: `https://unique-dog-520.convex.cloud/twilio/sms`
   - Method: HTTP POST
   - Save

2. **Test Receiving**:
   - Send SMS to `+12294587352`
   - Check dashboard for new note

3. **Test Sending** (from Convex dashboard or code):
   ```typescript
   await ctx.runAction(internal.notes.sendSms, {
     to: "+1234567890",
     body: "Hello from on-the-go!"
   });
   ```

### How It Works

- **Incoming SMS**: Twilio → Webhook → Custom handler → `notes` table
- **Outgoing SMS**: Your code → Convex Twilio component → Twilio API

## Project Structure

```
on-the-go/
├── app/
│   ├── dashboard/              # Main dashboard
│   │   ├── _components/        # Dashboard components
│   │   │   ├── Header.tsx
│   │   │   ├── ActivityBar.tsx
│   │   │   ├── SidePanel.tsx
│   │   │   ├── Editor.tsx
│   │   │   ├── NotesList.tsx   # Notes list view
│   │   │   ├── NoteEditor.tsx  # Markdown editor
│   │   │   ├── Terminal.tsx
│   │   │   └── Footer.tsx
│   │   └── page.tsx
│   ├── layout.tsx              # Root layout with Convex
│   └── page.tsx                # Redirects to dashboard
├── convex/
│   ├── schema.ts               # Database schema
│   ├── notes.ts                # Notes queries & mutations
│   ├── http.ts                 # Twilio webhook endpoint
│   └── convex.config.ts
└── components/
    └── ConvexClientProvider.tsx

## Usage

### Dashboard Navigation

- **Notes** (📱): View all notes
- **Archived** (📦): View archived notes
- **Settings** (⚙️): App settings

### Working with Notes

1. **View Notes**: Click "Notes" in the activity bar to see all messages
2. **Open a Note**: Click on any note in the list to open it in a new tab
3. **Edit Content**: Click in the text area to edit (markdown supported)
4. **Preview**: Toggle "Preview" to see rendered markdown
5. **Add Tags**: Type tags and press Enter at the bottom
6. **Save**: Click "Save" to update the note
7. **Archive**: Click "Archive" to move to archived notes

### Markdown Support

The editor supports basic markdown:

```markdown
# Heading 1
## Heading 2
### Heading 3

- List item 1
- List item 2

Regular paragraph text
```

## Database Schema

### Notes Table

| Field | Type | Description |
|-------|------|-------------|
| `phoneNumber` | string | Sender's phone number |
| `messageBody` | string | Original SMS content |
| `twilioMessageSid` | string | Twilio message ID |
| `editedContent` | string? | Markdown-edited version |
| `status` | enum | new, read, edited, archived |
| `tags` | string[]? | Optional tags |
| `receivedAt` | number | Timestamp |
| `createdAt` | number | Timestamp |
| `updatedAt` | number | Timestamp |

## API Endpoints

### Convex Functions

**Queries:**
- `notes.listNotes({ status?, limit? })` - Get all notes
- `notes.getNote({ noteId })` - Get single note
- `notes.searchNotes({ searchText, status? })` - Search notes
- `notes.getStats()` - Get note statistics

**Mutations:**
- `notes.updateNote({ noteId, editedContent?, status?, tags? })` - Update note
- `notes.markAsRead({ noteId })` - Mark as read
- `notes.deleteNote({ noteId })` - Delete note

**Internal Mutations:**
- `notes.createNote({ phoneNumber, messageBody, ... })` - Create note (webhook only)

### HTTP Endpoints

- `POST /twilio/sms` - Twilio webhook for incoming SMS
- `GET /health` - Health check endpoint

## Development

### Scripts

- `npm run dev` - Start Next.js dev server (port 6060)
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run convex` - Start Convex dev server

### Adding Features

1. **New Query/Mutation**: Add to `convex/notes.ts`
2. **New Component**: Add to `app/dashboard/_components/`
3. **New Route**: Add to `app/` directory
4. **Update Schema**: Modify `convex/schema.ts`

## Deployment

### Deploy Next.js App

```bash
# Deploy to Vercel
vercel

# Or use your preferred platform
npm run build
```

### Deploy Convex Backend

```bash
# Deploy to production
npx convex deploy

# Update your .env with production URL
NEXT_PUBLIC_CONVEX_URL=https://your-production.convex.cloud
```

### Update Twilio Webhook

Change your Twilio webhook URL to the production Convex URL.

## Tech Stack

- **Frontend**: Next.js 15.2.3, React 19, TypeScript
- **Backend**: Convex (real-time database + serverless functions)
- **Styling**: Tailwind CSS 4, VS Code-inspired design
- **Icons**: Lucide React
- **Integration**: Twilio SMS API

## Design Guidelines

This project follows the ACDC Digital design system:

- **Colors**: VS Code-inspired dark theme
- **Typography**: System fonts with monospace for code
- **Layout**: Activity bar + side panel + editor pattern
- **Components**: Consistent with SmolAccount dashboard architecture

See `.design/dashboard/` for detailed design documentation.

## Troubleshooting

### Convex Not Connected

- Ensure `npm run convex` is running
- Check `.env.local` has correct `NEXT_PUBLIC_CONVEX_URL`
- Restart Next.js dev server after changing env vars

### Twilio Webhook Not Working

- Verify webhook URL in Twilio console
- Check Convex logs for errors: `npx convex logs`
- Ensure webhook URL uses HTTPS (production only)
- Test webhook with Twilio's webhook tester

### Notes Not Appearing

- Check browser console for errors
- Verify Convex queries are returning data
- Test creating a note manually in Convex dashboard

## License

Part of ACDC Digital workspace

---

**Happy note-taking on the go! 📝🚀**
