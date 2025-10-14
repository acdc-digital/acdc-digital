# React Flow Integration - Developer Guide

## Quick Start for Developers

### File Structure
```
smnb/smnb/app/dashboard/studio/generator/
├── Generator.tsx                    # Main component with view toggle
├── components/
│   ├── KeywordFlowView.tsx         # React Flow implementation
│   └── Instructions.tsx            # Column instructions (existing)
└── ...

smnb/smnb/app/
└── globals.css                      # Contains React Flow dark theme styles
```

### Key Dependencies
```json
{
  "@xyflow/react": "^12.x.x",        // React Flow library
  "lucide-react": "^0.x.x",          // Icons
  "@/components/ui/*": "*"           // shadcn/ui components
}
```

## Component Architecture

### Generator.tsx (Parent)

**State Management**:
```typescript
// View mode toggle
const [viewMode, setViewMode] = useState<'columns' | 'flow'>('columns');

// Keywords from Convex DB
const trends = useQuery(api.keywords.keywords.getTrendingKeywords, { limit: 50 });

// Column state (shared between views)
const [columns, setColumns] = useState<ColumnState[]>([...]);
```

**Key Functions**:
```typescript
// Add keyword to column (called from flow view)
const addKeywordToColumn = useCallback((keyword: KeywordItem, columnId: string) => {
  setColumns(prevColumns =>
    prevColumns.map(col => {
      if (col.id === columnId) {
        const exists = col.items.some(item => item.keyword === keyword.keyword);
        if (!exists) {
          return { ...col, items: [...col.items, keyword] };
        }
      }
      return col;
    })
  );
}, []);

// Generate post (called from both views)
const handleGeneratePost = async (columnId: string) => {
  // Implementation...
};
```

### KeywordFlowView.tsx (Flow Component)

**Props Interface**:
```typescript
interface KeywordFlowViewProps {
  keywords: KeywordItem[];           // Keywords to display as nodes
  columns: ColumnState[];            // Columns to display as target nodes
  onAddKeywordToColumn: (keyword: KeywordItem, columnId: string) => void;
  onGeneratePost: (columnId: string) => void;
}
```

**Node Creation**:
```typescript
const initialNodes: Node[] = useMemo(() => {
  // Keyword nodes
  const keywordNodes = keywords.map((keyword, index) => ({
    id: `keyword-${keyword.keyword}`,
    type: 'keyword',
    position: { x: 50 + (index % 8) * 200, y: 50 + Math.floor(index / 8) * 150 },
    data: { ...keyword, onAddToColumn: (columnId) => {...} }
  }));

  // Column nodes
  const columnNodes = columns.map((column, index) => ({
    id: `column-${column.id}`,
    type: 'column',
    position: { x: 100 + index * 280, y: 450 },
    data: { title: column.title, itemCount: column.items.length, ... }
  }));

  return [...keywordNodes, ...columnNodes];
}, [keywords, columns]);
```

**Edge Creation**:
```typescript
const initialEdges: Edge[] = useMemo(() => {
  const edges: Edge[] = [];
  columns.forEach((column) => {
    column.items.forEach((item) => {
      edges.push({
        id: `edge-${item.keyword}-${column.id}`,
        source: `keyword-${item.keyword}`,
        target: `column-${column.id}`,
        animated: true,
        style: { stroke: '#818384', strokeWidth: 2 },
      });
    });
  });
  return edges;
}, [columns]);
```

## Custom Node Types

### KeywordNode Component

**Purpose**: Display keyword with metadata
**Features**:
- Tier-based color coding
- Trend icon
- Metadata display (count, category, engagement)
- Trending indicator

**Implementation**:
```typescript
function KeywordNode({ data }: { data: KeywordItem & { onAddToColumn: (columnId: string) => void } }) {
  const tierStyle = TIER_STYLES[data.tier as keyof typeof TIER_STYLES] || TIER_STYLES.avg;
  const trendIcon = TREND_ICONS[data.trendStatus as keyof typeof TREND_ICONS] || "📊";
  
  return (
    <div className={cn("px-4 py-3 rounded-lg border-2 shadow-lg", tierStyle)}>
      {/* Node content */}
    </div>
  );
}
```

### ColumnNode Component

**Purpose**: Display column target with generate button
**Features**:
- Column title
- Item count
- Generate button with state

**Implementation**:
```typescript
function ColumnNode({ data }: { data: { title: string; itemCount: number; onGenerate: () => void } }) {
  return (
    <div className="bg-[#1a1a1a] border-2 border-primary rounded-lg p-4">
      <h3>{data.title}</h3>
      <p>{data.itemCount} keywords</p>
      <Button onClick={data.onGenerate}>Generate</Button>
    </div>
  );
}
```

## Extending the Feature

### Adding a New Node Type

1. **Define the node component**:
```typescript
function MyCustomNode({ data }: { data: MyDataType }) {
  return (
    <div className="custom-node-styling">
      {/* Your content */}
    </div>
  );
}
```

2. **Register the node type**:
```typescript
const nodeTypes: NodeTypes = {
  keyword: KeywordNode,
  column: ColumnNode,
  myCustomNode: MyCustomNode,  // Add here
};
```

3. **Create nodes of the new type**:
```typescript
const customNode: Node = {
  id: 'custom-1',
  type: 'myCustomNode',
  position: { x: 100, y: 100 },
  data: { /* your data */ }
};
```

### Adding Custom Edge Styling

```typescript
const customEdge: Edge = {
  id: 'custom-edge-1',
  source: 'node-1',
  target: 'node-2',
  animated: true,
  style: { 
    stroke: '#ff0000',      // Custom color
    strokeWidth: 3,         // Custom width
    strokeDasharray: '5,5'  // Dashed line
  },
  label: 'Custom Label',    // Optional label
  labelStyle: { fill: '#fff', fontWeight: 700 }
};
```

### Adding Custom Controls

```typescript
<ReactFlow {...props}>
  <Panel position="top-right" className="custom-panel">
    <Button onClick={customAction}>Custom Action</Button>
  </Panel>
  <Controls />
  <MiniMap />
  <Background />
</ReactFlow>
```

## Styling Guidelines

### Dark Theme Colors
```css
/* Node backgrounds */
--node-bg: #1a1a1a
--node-border: #343536
--node-hover: #252526

/* Text colors */
--text-primary: #ffffff
--text-secondary: #d1d5db
--text-muted: #808080

/* Accent colors */
--primary: #007acc
--primary-hover: #0098ff

/* Performance tiers */
--tier-elite: purple-to-pink gradient
--tier-excel: blue-to-purple gradient
--tier-good: green
--tier-avg: yellow
--tier-poor: orange
--tier-critical: red
```

### CSS Class Naming Convention
```
.react-flow-dark              // Main container
.react-flow-dark .node        // Node styling
.react-flow-dark .edge        // Edge styling
.react-flow-dark .controls    // Controls styling
```

## Performance Optimization Tips

### 1. Memoize Node Arrays
```typescript
const nodes = useMemo(() => {
  return createNodes(data);
}, [data]); // Only recalculate when data changes
```

### 2. Batch State Updates
```typescript
// Bad: Multiple state updates
setNodes(newNodes);
setEdges(newEdges);

// Good: Single update
const updates = { nodes: newNodes, edges: newEdges };
applyChanges(updates);
```

### 3. Limit Visible Nodes
```typescript
// Paginate or filter large datasets
const visibleKeywords = keywords.slice(0, 50);
```

### 4. Debounce Expensive Operations
```typescript
const debouncedUpdate = useMemo(
  () => debounce((nodes) => setNodes(nodes), 300),
  []
);
```

## Debugging Tips

### 1. React Flow DevTools
Enable React Flow devtools in development:
```typescript
<ReactFlow
  {...props}
  onInit={(reactFlowInstance) => {
    console.log('React Flow initialized:', reactFlowInstance);
  }}
/>
```

### 2. Node ID Conflicts
Ensure unique node IDs:
```typescript
// Bad: May have conflicts
id: keyword.keyword

// Good: Prefixed and unique
id: `keyword-${keyword.keyword}-${index}`
```

### 3. Edge Connection Issues
Verify source and target IDs match:
```typescript
const edge = {
  source: 'keyword-anxiety',  // Must match node id exactly
  target: 'column-column-1'   // Must match node id exactly
};
```

### 4. Style Not Applying
Check CSS specificity:
```css
/* May not work due to specificity */
.react-flow__node { color: red; }

/* Better: More specific selector */
.react-flow-dark .react-flow__node { color: red; }
```

## Common Patterns

### Pattern 1: Conditional Edge Color
```typescript
const getEdgeStyle = (engagement: number) => ({
  stroke: engagement > 80 ? '#10b981' : engagement > 50 ? '#f59e0b' : '#ef4444',
  strokeWidth: 2
});
```

### Pattern 2: Node Clustering
```typescript
const clusterNodesByCategory = (keywords: KeywordItem[]) => {
  const clusters = groupBy(keywords, 'category');
  return Object.entries(clusters).map(([category, items], clusterIndex) => {
    return items.map((item, itemIndex) => ({
      id: `keyword-${item.keyword}`,
      position: {
        x: clusterIndex * 300 + itemIndex * 100,
        y: clusterIndex * 200
      },
      data: item
    }));
  }).flat();
};
```

### Pattern 3: Animated Connection
```typescript
const onConnect = useCallback((connection: Connection) => {
  const newEdge = {
    ...connection,
    animated: true,
    style: { stroke: '#007acc', strokeWidth: 3 }
  };
  setEdges((eds) => addEdge(newEdge, eds));
}, []);
```

## Testing Considerations

### Unit Tests
```typescript
// Test node creation
it('creates keyword nodes from data', () => {
  const keywords = [{ keyword: 'test', count: 5, ... }];
  const nodes = createKeywordNodes(keywords);
  expect(nodes).toHaveLength(1);
  expect(nodes[0].id).toBe('keyword-test');
});
```

### Integration Tests
```typescript
// Test view switching
it('switches between views', () => {
  render(<Generator />);
  fireEvent.click(screen.getByText('Flow View'));
  expect(screen.getByTestId('react-flow')).toBeInTheDocument();
});
```

### E2E Tests
```typescript
// Test connection creation
test('creates edge when nodes connected', async () => {
  await page.goto('/dashboard/studio/generator');
  await page.click('[data-testid="flow-view-button"]');
  // Simulate drag from keyword to column
  await page.dragAndDrop('[data-id="keyword-anxiety"]', '[data-id="column-1"]');
  expect(await page.locator('.react-flow__edge').count()).toBe(1);
});
```

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Nodes not rendering | Missing node type registration | Add to `nodeTypes` object |
| Edges not appearing | Source/target ID mismatch | Verify IDs match exactly |
| Poor performance | Too many nodes | Implement pagination/filtering |
| Styling not applied | CSS not imported | Import `@xyflow/react/dist/style.css` |
| Layout issues | Container height undefined | Set explicit height on container |

## Resources

- [React Flow Documentation](https://reactflow.dev/learn)
- [React Flow Examples](https://reactflow.dev/examples)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [Lucide Icons](https://lucide.dev/)

## Contributing

When extending this feature:
1. Follow existing code patterns
2. Maintain TypeScript type safety
3. Add appropriate comments
4. Update documentation
5. Test across browsers
6. Consider performance impact
7. Match existing dark theme

---

**Last Updated**: 2025-10-14
**Maintainer**: ACDC Digital
**Status**: Active Development
