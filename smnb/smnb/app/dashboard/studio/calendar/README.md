# Calendar - Full Google Calendar / Outlook Style

A comprehensive calendar system with event management, similar to Google Calendar and Microsoft Outlook.

## Features

### 📅 Monthly Calendar View
- Full month grid showing all days (6 weeks x 7 days)
- Events displayed directly in calendar cells
- Click on any day to view its events
- Navigate between months with prev/next buttons
- "Today" button to quickly return to current date
- Visual indicators for:
  - Today (blue background)
  - Selected date (highlighted background)
  - Days with events (event count badge)

### 📝 Event Management
- **Create Events**: Click "New Event" or "+" button
- **Edit Events**: Click event card, then click edit icon
- **Delete Events**: Click event card, then click delete icon
- **Event Details**:
  - Title (required)
  - Description
  - Start/End date and time
  - All-day event option
  - Color coding (8 colors available)
  - Location
  - Attendees (comma-separated)

### 🎨 Event Display
- Color-coded event cards
- Truncated display in calendar grid (max 3 events shown)
- "+N more" indicator for additional events
- Time stamps for timed events
- Full event details in right panel

### 📊 Right Side Panel
Shows:
- Selected date information
- List of events for that day
- Detailed event view when event is clicked
- Quick event creation button

## Architecture

### Convex Backend
**File**: `/convex/calendar.ts`

Functions:
- `getEventsForMonth`: Fetch all events for a specific month
- `getEventsForDay`: Fetch events for a specific day
- `createEvent`: Create a new calendar event
- `updateEvent`: Update an existing event
- `deleteEvent`: Delete an event
- `getEventById`: Get a single event by ID

**Schema**: `calendar_events` table
- title: string
- description?: string
- startTime: number (Unix timestamp)
- endTime: number (Unix timestamp)
- color: string (hex color)
- allDay: boolean
- location?: string
- attendees?: string[]

## Components

### Calendar.tsx - Main container
Manages state and Convex queries/mutations. Coordinates between calendar view and detail panel.

### MonthCalendarView.tsx - Month grid view
Renders 6-week calendar grid. Shows events in each day cell. Handles date selection and event clicks. Month navigation controls.

### EventDetailPanel.tsx - Right sidebar
Shows selected date information. Lists events for selected day. Shows detailed event information. Edit/delete controls.

### EventDialog.tsx - Event creation/editing
Modal dialog for creating/editing events. Form with all event fields. Date/time pickers. Color selector. Validation and error handling.

## Usage

```tsx
import Calendar from "@/app/dashboard/studio/calendar/Calendar";

<Calendar isActive={true} />
```

## Event Colors

8 pre-defined colors:
- Blue (#007acc) - Default
- Green (#10b981)
- Purple (#8b5cf6)
- Red (#ef4444)
- Orange (#f97316)
- Pink (#ec4899)
- Yellow (#eab308)
- Teal (#14b8a6)

## Design System

Colors match VS Code dark theme:
- Background: `#1e1e1e`
- Panels: `#252526`
- Borders: `#2d2d2d`
- Text: `#cccccc`
- Muted text: `#858585`
- Accent: `#007acc` (VS Code blue)

## Structure

```
calendar/
├── Calendar.tsx                 # Main calendar component
└── _components/
    ├── DatePicker.tsx          # Quick date selection dropdown
    ├── CalendarView.tsx        # Main calendar grid view
    ├── EventsList.tsx          # Events panel for selected date
    └── index.ts                # Component exports
```

## Features

### Main Calendar View
- **Full month calendar grid** using shadcn Calendar component
- **Today indicator** - Current day highlighted in gray (`#3d3d3d`)
- **Selected date** - User selection highlighted in blue (`#007acc`)
- **Month/year navigation** - Built into the calendar component
- **Responsive hover states** - VS Code-inspired interactions

### Date Picker (Header)
- **Quick date selection** via dropdown popover
- **Month/year dropdowns** for fast navigation to any date
- **Compact design** - Fits in the header toolbar

### Events Panel (Right Sidebar)
- **320px fixed width** panel showing event details
- **Selected date display** - Full formatted date
- **Events list** - Shows all events for the selected date
- **Empty state** - Clean placeholder when no events exist
- **Add event button** - Ready for future implementation

## Design System

Follows ACDC Digital brand guidelines:
- **Primary Blue**: `#007acc` - Selected dates, accents
- **Dark Backgrounds**: `#1e1e1e`, `#252526`, `#2d2d2d`
- **Text Colors**: `#cccccc` (primary), `#858585` (muted)
- **VS Code-inspired** - Matches IDE aesthetics

## Future Integration

The component is structured for easy Convex integration:

1. **Events Query**: Add Convex query in the `useEffect` when `isActive` is true
2. **Event Filtering**: Already implemented - filters by selected date
3. **Event Creation**: "Add Event" button ready for mutation hook
4. **Real-time Updates**: Structure supports live event updates

## Usage

The calendar is already integrated into the dashboard layout and appears when the calendar button is clicked in the activity bar.

```tsx
<Calendar isActive={activePanel === "calendar"} />
```

## Component Props

### Calendar
- `isActive?: boolean` - Whether this panel is currently visible

### DatePicker
- `date: Date | undefined` - Currently selected date
- `onDateChange: (date: Date | undefined) => void` - Date change handler

### CalendarView
- `date: Date | undefined` - Currently selected date
- `onDateChange: (date: Date | undefined) => void` - Date change handler

### EventsList
- `selectedDate: Date | undefined` - Date to show events for
- `events: Event[]` - Array of events to display

## Event Type

```typescript
interface Event {
  id: string;
  title: string;
  from: string;        // ISO date string
  to: string;          // ISO date string
  description?: string;
}
```
