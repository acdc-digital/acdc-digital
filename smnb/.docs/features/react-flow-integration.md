# React Flow Integration for Keyword Generator

## Overview

This feature adds a powerful, interactive node-based flow visualization to the SMNB keyword generator, transforming the simple drag-and-drop interface into a sophisticated flowchart experience. Built with React Flow (@xyflow/react), it provides a visual way to understand keyword relationships and organize content generation workflows.

## Features

### 1. **Dual View Modes**
- **Columns View**: Traditional drag-and-drop interface with 4 customizable columns
- **Flow View**: Interactive flowchart with nodes and connections

### 2. **Interactive Node Graph**
- Visual representation of keywords as draggable nodes
- Column targets displayed as action nodes
- Connect keywords to columns by drawing edges
- Automatic layout with customizable positioning

### 3. **Rich Keyword Visualization**
Each keyword node displays:
- Trend icon (🌱 emerging, 📈 rising, 🔥 peak, etc.)
- Keyword count and engagement metrics
- Category classification
- Performance tier styling (elite, excel, good, avg, etc.)
- Trending indicator

### 4. **Flow Controls**
- **Zoom**: Mouse wheel or pinch gestures
- **Pan**: Click and drag the background
- **MiniMap**: Overview of the entire graph
- **Auto-fit**: Automatically centers and scales the view

## Usage

### Switching Views
Click the view toggle buttons at the top:
- **Columns Button** (📱): Switch to traditional column view
- **Flow View Button** (🔀): Switch to node-based flow view

### In Flow View
1. **Connect Keywords**: Click and drag from a keyword node to a column node to create a connection
2. **Move Nodes**: Drag nodes to reorganize the layout
3. **Zoom/Pan**: Use mouse wheel to zoom, click background to pan
4. **Generate Content**: Click the "Generate" button on column nodes

### In Columns View
1. **Drag Keywords**: Grab keyword badges and drop them into columns
2. **Add Instructions**: Enter custom instructions for each column
3. **Generate Content**: Click the "Generate" button at the bottom of each column

## Technical Implementation

### Architecture
```
Generator.tsx (Parent Component)
├── View Mode State Management
├── Keyword Data from Convex
└── KeywordFlowView.tsx (Flow View Component)
    ├── Custom Node Types
    │   ├── KeywordNode (displays keyword data)
    │   └── ColumnNode (displays column with generate button)
    ├── React Flow Canvas
    ├── Controls (zoom, fit view)
    ├── MiniMap (overview)
    └── Background (dots pattern)
```

### Key Components

#### Generator.tsx
- Main component managing state for both views
- Toggle between 'columns' and 'flow' modes
- Handles keyword-to-column associations
- Manages post generation workflow

#### KeywordFlowView.tsx
- Renders the React Flow canvas
- Creates nodes from keywords and columns
- Manages edges (connections) between nodes
- Handles node interactions and updates

### Data Flow
```
Keywords (from Convex DB)
    ↓
Generator Component State
    ↓
┌─────────────┬─────────────┐
│             │             │
Columns View  │  Flow View  │
(drag/drop)   │  (nodes/edges)
└─────────────┴─────────────┘
    ↓
Column State Updates
    ↓
Post Generation (Anthropic AI)
```

## Styling

The flow view uses dark theme styling consistent with the SMNB design system:
- Background: `#1a1a1a` (dark charcoal)
- Nodes: Tier-based gradient colors
- Controls: `#252526` (darker grey)
- Borders: `#343536` (medium grey)
- Text: `#ffffff` (white) with various opacity levels

## Dependencies

- `@xyflow/react`: Core React Flow library
- `lucide-react`: Icon library
- `@/components/ui/*`: shadcn/ui components
- `convex/react`: Backend data integration

## Performance Considerations

1. **Memoization**: Node and edge arrays are memoized to prevent unnecessary re-renders
2. **Lazy Updates**: State updates are batched and optimized
3. **Viewport Optimization**: Only visible nodes are rendered in detail
4. **Connection Validation**: Prevents duplicate connections

## Future Enhancements

### Planned Features
- [ ] Save/load custom layouts
- [ ] Export flow as image
- [ ] Advanced filtering and search
- [ ] Keyword clustering and auto-grouping
- [ ] Real-time collaboration on flows
- [ ] Custom edge styling based on keyword relationships
- [ ] AI-suggested optimal keyword groupings
- [ ] Performance analytics overlay on nodes
- [ ] Undo/redo functionality
- [ ] Keyboard shortcuts for power users

### Market Data Integration
- Display trending scores on edges
- Show engagement prediction paths
- Visualize content performance correlations
- Highlight high-performing keyword combinations

## Troubleshooting

### Flow View Not Rendering
- Check that React Flow styles are imported: `@xyflow/react/dist/style.css`
- Ensure the container has a defined height
- Verify keywords are loaded from Convex

### Connections Not Working
- Make sure you're connecting from keyword nodes to column nodes
- Check that the keyword doesn't already exist in the target column

### Performance Issues
- Reduce the number of visible keywords (currently limited to 50)
- Use the MiniMap for navigation instead of panning large distances
- Consider pagination for very large datasets

## API Reference

### KeywordFlowView Props

```typescript
interface KeywordFlowViewProps {
  keywords: KeywordItem[];           // Array of keyword data
  columns: ColumnState[];            // Array of column configurations
  onAddKeywordToColumn: (keyword: KeywordItem, columnId: string) => void;
  onGeneratePost: (columnId: string) => void;
}
```

### KeywordItem Interface

```typescript
interface KeywordItem {
  keyword: string;      // The keyword text
  count: number;        // Frequency count
  category: string;     // Category classification
  sentiment: string;    // Sentiment analysis
  confidence: number;   // AI confidence score
  trending: boolean;    // Is currently trending
  tier?: string;        // Performance tier
  trendStatus?: string; // Trend status
  engagement?: number;  // Engagement metric
}
```

## Best Practices

1. **Start with Columns View**: Get familiar with the basic workflow first
2. **Use Flow View for Complex Relationships**: When you need to see connections between multiple keywords
3. **Organize Spatially**: Group related keywords together in the flow view
4. **Save Frequently**: Changes to keyword assignments are saved automatically
5. **Use MiniMap**: For navigation in large graphs

## Example Workflow

1. Load keywords from Reddit data
2. Switch to Flow View
3. Identify trending keywords (🔥 peak icon)
4. Connect high-engagement keywords to appropriate columns
5. Add custom instructions to columns
6. Generate AI-powered content
7. Review and iterate

## Credits

Built with:
- [React Flow](https://reactflow.dev/) - Interactive node-based UI
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [Convex](https://convex.dev/) - Backend database
- [Anthropic Claude](https://www.anthropic.com/) - AI content generation
