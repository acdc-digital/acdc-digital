# React Flow Integration - Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    SMNB Generator Component                      │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  View Mode State: 'columns' | 'flow'                       │ │
│  │  [Columns] [Flow View]  <-- Toggle Buttons                 │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌──────────────────────────┐  ┌──────────────────────────────┐│
│  │   Convex Backend         │  │   Local State                ││
│  │                          │  │                              ││
│  │  • Keywords (trends)     │  │  • columns[]                 ││
│  │  • Categories            │  │  • viewMode                  ││
│  │  • Engagement data       │  │  • draggedItem               ││
│  └──────────────────────────┘  └──────────────────────────────┘│
│                 ▼                          ▼                     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │          Data Processing & Transformation                 │  │
│  │  • Extract keywords                                       │  │
│  │  • Calculate tiers                                        │  │
│  │  • Add trend indicators                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                 ▼                          ▼                     │
│  ┌──────────────────────┐  ┌────────────────────────────────┐  │
│  │   Columns View       │  │   Flow View                    │  │
│  │   (Original)         │  │   (New - React Flow)           │  │
│  │                      │  │                                │  │
│  │  • Drag & Drop       │  │  • Node-based Graph            │  │
│  │  • 4 Columns         │  │  • Interactive Edges           │  │
│  │  • Generate Button   │  │  • Zoom/Pan Controls           │  │
│  │  • Instructions      │  │  • MiniMap                     │  │
│  └──────────────────────┘  └────────────────────────────────┘  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Hierarchy

```
Generator.tsx
├── ViewToggle
│   ├── Button ("Columns")
│   └── Button ("Flow View")
│
├── [Conditional Rendering]
│
├─── If viewMode === 'columns'
│    │
│    ├── TrendingKeywordsSection
│    │   └── Badge[] (draggable keywords)
│    │
│    └── ColumnsGrid
│        └── Card[] (4 columns)
│            ├── CardHeader (title, count)
│            ├── CardContent
│            │   ├── Keywords (badges)
│            │   └── GeneratedPosts
│            ├── Instructions
│            └── CardFooter
│                └── Button ("Generate")
│
└─── If viewMode === 'flow'
     │
     └── KeywordFlowView
         └── ReactFlow
             ├── Background (dots pattern)
             ├── Nodes
             │   ├── KeywordNode[]
             │   │   └── CustomNodeComponent
             │   └── ColumnNode[]
             │       └── CustomNodeComponent
             ├── Edges[]
             │   └── Animated connections
             ├── Controls
             │   ├── Zoom In
             │   ├── Zoom Out
             │   └── Fit View
             ├── MiniMap
             └── Panel (info display)
```

## Data Flow Diagram

```
┌──────────────┐
│   Convex DB  │
│   Keywords   │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────────┐
│   useQuery(getTrendingKeywords)  │
└──────────────┬───────────────────┘
               │
               ▼
    ┌──────────────────────┐
    │   displayTrends[]    │
    │   (KeywordItem[])    │
    └──────┬───────────────┘
           │
           ├──────────────────┬──────────────────┐
           │                  │                  │
           ▼                  ▼                  ▼
    ┏━━━━━━━━━━━━┓    ┏━━━━━━━━━━━━┓    ┏━━━━━━━━━━━━┓
    ┃ Columns    ┃    ┃ Flow View  ┃    ┃ columns[]  ┃
    ┃ View       ┃    ┃ Component  ┃    ┃ State      ┃
    ┗━━━━┯━━━━━━━┛    ┗━━━━┯━━━━━━━┛    ┗━━━━┯━━━━━━━┛
         │                  │                  │
         │    User Action   │                  │
         │  (drag/connect)  │                  │
         └──────────────────┴──────────────────┘
                            │
                            ▼
                  ┌──────────────────┐
                  │  addKeywordTo    │
                  │  Column()        │
                  └────────┬─────────┘
                           │
                           ▼
                  ┌──────────────────┐
                  │  setColumns()    │
                  │  (state update)  │
                  └────────┬─────────┘
                           │
         ┌─────────────────┴─────────────────┐
         │                                   │
         ▼                                   ▼
  ┏━━━━━━━━━━━━┓                      ┏━━━━━━━━━━━━┓
  ┃ Columns    ┃ ◄─── Synced ────► ┃ Flow View  ┃
  ┃ Re-render  ┃                      ┃ Re-render  ┃
  ┗━━━━━━━━━━━━┛                      ┗━━━━━━━━━━━━┛
```

## Node Creation Flow (React Flow)

```
Keywords Array + Columns Array
         │
         ▼
┌─────────────────────────────┐
│  useMemo() - Create Nodes   │
└───────────┬─────────────────┘
            │
    ┌───────┴──────────┐
    │                  │
    ▼                  ▼
┌─────────┐      ┌──────────┐
│ Keyword │      │ Column   │
│ Nodes   │      │ Nodes    │
└────┬────┘      └─────┬────┘
     │                 │
     │  Map each       │  Map each
     │  keyword to     │  column to
     │  node object    │  node object
     │                 │
     ▼                 ▼
┌─────────────────────────────┐
│  {                          │
│    id: 'keyword-anxiety',   │
│    type: 'keyword',         │
│    position: { x, y },      │
│    data: {                  │
│      keyword, count,        │
│      tier, trendStatus,     │
│      engagement, ...        │
│    }                        │
│  }                          │
└─────────────────────────────┘
     │
     ▼
┌─────────────────────────────┐
│  Combined Nodes Array       │
│  [...keywordNodes,          │
│   ...columnNodes]           │
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  useNodesState(initialNodes)│
└────────────┬────────────────┘
             │
             ▼
┌─────────────────────────────┐
│  ReactFlow Component        │
│  renders nodes              │
└─────────────────────────────┘
```

## Edge Creation Flow

```
Columns State (with items)
         │
         ▼
┌──────────────────────────────┐
│  useMemo() - Create Edges    │
└───────────┬──────────────────┘
            │
            │  For each column
            │  For each item in column
            ▼
┌──────────────────────────────┐
│  {                           │
│    id: 'edge-anxiety-col1',  │
│    source: 'keyword-anxiety',│
│    target: 'column-column-1',│
│    animated: true,           │
│    style: {                  │
│      stroke: '#818384',      │
│      strokeWidth: 2          │
│    }                         │
│  }                           │
└───────────┬──────────────────┘
            │
            ▼
┌──────────────────────────────┐
│  Combined Edges Array        │
└───────────┬──────────────────┘
            │
            ▼
┌──────────────────────────────┐
│  useEdgesState(initialEdges) │
└───────────┬──────────────────┘
            │
            ▼
┌──────────────────────────────┐
│  ReactFlow Component         │
│  renders edges               │
└──────────────────────────────┘
```

## Connection Event Flow

```
User drags from keyword node to column node
         │
         ▼
┌──────────────────────────────┐
│  onConnect callback          │
└───────────┬──────────────────┘
            │
            ▼
┌──────────────────────────────┐
│  Extract source & target IDs │
│  'keyword-anxiety'           │
│  'column-column-1'           │
└───────────┬──────────────────┘
            │
            ▼
┌──────────────────────────────┐
│  Find matching keyword       │
│  from keywords array         │
└───────────┬──────────────────┘
            │
            ▼
┌──────────────────────────────┐
│  Call onAddKeywordToColumn() │
│  (props callback)            │
└───────────┬──────────────────┘
            │
            ▼
┌──────────────────────────────┐
│  Generator updates columns   │
│  state via setColumns()      │
└───────────┬──────────────────┘
            │
            ▼
┌──────────────────────────────┐
│  KeywordFlowView re-renders  │
│  with new edges              │
└───────────┬──────────────────┘
            │
            ▼
┌──────────────────────────────┐
│  Edge appears animated       │
│  between nodes               │
└──────────────────────────────┘
```

## Styling Architecture

```
globals.css
    │
    ├── React Flow Core Styles
    │   ├── .react-flow-dark (container)
    │   ├── .react-flow__node (nodes)
    │   ├── .react-flow__edge (edges)
    │   ├── .react-flow__controls (buttons)
    │   └── .react-flow__minimap (overview)
    │
    └── Custom Animations
        ├── @keyframes dashdraw
        └── hover/transition effects

KeywordFlowView.tsx
    │
    ├── Tier Styles (inline)
    │   ├── TIER_STYLES object
    │   └── gradient backgrounds
    │
    └── Component Styles (className)
        ├── Tailwind utilities
        └── Custom combinations
```

## State Synchronization

```
┌─────────────────────────────────────────────────────────┐
│                  Generator State                         │
│                                                          │
│  const [columns, setColumns] = useState([...])          │
│                                                          │
└───────────┬─────────────────────────────┬───────────────┘
            │                             │
            │                             │
    ┌───────▼────────┐          ┌────────▼────────┐
    │  Columns View  │          │   Flow View     │
    │                │          │                 │
    │  Uses columns  │          │  Uses columns   │
    │  directly      │          │  to create      │
    │                │          │  edges          │
    └───────┬────────┘          └────────┬────────┘
            │                            │
            │ Drop event                 │ Connect event
            │                            │
    ┌───────▼────────┐          ┌────────▼────────┐
    │ Add keyword    │          │ Add keyword     │
    │ to column      │          │ to column       │
    └───────┬────────┘          └────────┬────────┘
            │                            │
            └────────────┬───────────────┘
                         │
                 ┌───────▼──────────┐
                 │  setColumns()    │
                 │  (shared state)  │
                 └───────┬──────────┘
                         │
            ┌────────────┴─────────────┐
            │                          │
    ┌───────▼────────┐        ┌────────▼────────┐
    │  Columns View  │        │   Flow View     │
    │  Re-renders    │        │   Re-renders    │
    │                │        │                 │
    │  Shows updated │        │  Shows new edge │
    │  badges        │        │                 │
    └────────────────┘        └─────────────────┘
```

## Performance Optimization Strategy

```
┌─────────────────────────────────────────┐
│     Raw Data (keywords, columns)        │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  useMemo() - Compute nodes only when    │
│  keywords or columns change             │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  useMemo() - Compute edges only when    │
│  columns change                         │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  useNodesState() - Manages node updates │
│  with React Flow optimizations          │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  useEdgesState() - Manages edge updates │
│  with React Flow optimizations          │
└────────────────┬────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────┐
│  ReactFlow renders only visible nodes   │
│  (viewport culling)                     │
└─────────────────────────────────────────┘
```

---

**Legend**:
- `┌─┐` Regular boxes = Components/States
- `┏━┓` Bold boxes = User-facing views
- `│ ├` Lines = Data flow
- `▼ ▲` Arrows = Direction of flow
- `◄─►` Double arrows = Two-way sync
