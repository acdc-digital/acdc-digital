"use client";

import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  BackgroundVariant,
  NodeTypes,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Hash, TrendingUp, Activity, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

// Types from parent component
export interface KeywordItem {
  keyword: string;
  count: number;
  category: string;
  sentiment: string;
  confidence: number;
  trending: boolean;
  tier?: string;
  trendStatus?: string;
  engagement?: number;
}

interface KeywordFlowViewProps {
  keywords: KeywordItem[];
  columns: Array<{
    id: string;
    title: string;
    items: KeywordItem[];
  }>;
  onAddKeywordToColumn: (keyword: KeywordItem, columnId: string) => void;
  onGeneratePost: (columnId: string) => void;
}

// Performance tier styles matching heatmap design
const TIER_STYLES = {
  elite: "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-purple-600",
  excel: "bg-gradient-to-r from-blue-500 to-purple-500 text-white border-blue-600",
  veryGood: "bg-blue-500 text-white border-blue-600",
  good: "bg-green-500 text-white border-green-600",
  avgPlus: "bg-green-400 text-white border-green-500",
  avg: "bg-yellow-400 text-black border-yellow-500",
  avgMinus: "bg-orange-400 text-white border-orange-500",
  poor: "bg-orange-500 text-white border-orange-600",
  veryPoor: "bg-red-500 text-white border-red-600",
  critical: "bg-red-700 text-white border-red-800"
};

const TREND_ICONS = {
  emerging: "🌱",
  rising: "📈",
  peak: "🔥",
  declining: "📉",
  stable: "➡️",
  dormant: "💤"
};

// Custom Keyword Node Component
function KeywordNode({ data }: { data: KeywordItem & { onAddToColumn: (columnId: string) => void } }) {
  const tierStyle = TIER_STYLES[data.tier as keyof typeof TIER_STYLES] || TIER_STYLES.avg;
  const trendIcon = TREND_ICONS[data.trendStatus as keyof typeof TREND_ICONS] || "📊";
  
  return (
    <div className={cn(
      "px-4 py-3 rounded-lg border-2 shadow-lg min-w-[180px]",
      "transition-all duration-200 hover:scale-105 hover:shadow-xl",
      tierStyle
    )}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{trendIcon}</span>
        <Hash className="h-4 w-4" />
        <span className="font-semibold text-sm">{data.keyword}</span>
      </div>
      <div className="text-xs opacity-90 space-y-1">
        <div>Count: {data.count}</div>
        <div>Category: {data.category}</div>
        {data.engagement && <div>Engagement: {Math.round(data.engagement)}</div>}
        {data.trending && (
          <div className="flex items-center gap-1 mt-1">
            <TrendingUp className="h-3 w-3" />
            <span>Trending</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Custom Column Node Component
function ColumnNode({ data }: { data: { title: string; itemCount: number; onGenerate: () => void; columnId: string } }) {
  return (
    <div className="bg-[#1a1a1a] border-2 border-primary rounded-lg p-4 min-w-[220px] shadow-xl">
      <div className="mb-3">
        <h3 className="text-lg font-bold text-white">{data.title}</h3>
        <p className="text-xs text-muted-foreground">
          {data.itemCount > 0 ? `${data.itemCount} keywords` : 'Drop keywords here'}
        </p>
      </div>
      <Button
        onClick={data.onGenerate}
        disabled={data.itemCount === 0}
        className="w-full"
        size="sm"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        Generate
      </Button>
    </div>
  );
}

const nodeTypes: NodeTypes = {
  keyword: KeywordNode,
  column: ColumnNode,
};

export function KeywordFlowView({ 
  keywords, 
  columns, 
  onAddKeywordToColumn,
  onGeneratePost 
}: KeywordFlowViewProps) {
  
  // Create nodes from keywords and columns
  const initialNodes: Node[] = useMemo(() => {
    const keywordNodes: Node[] = keywords.map((keyword, index) => ({
      id: `keyword-${keyword.keyword}`,
      type: 'keyword',
      position: { 
        x: 50 + (index % 8) * 200, 
        y: 50 + Math.floor(index / 8) * 150 
      },
      data: {
        ...keyword,
        onAddToColumn: (columnId: string) => {
          onAddKeywordToColumn(keyword, columnId);
        }
      },
    }));

    const columnNodes: Node[] = columns.map((column, index) => ({
      id: `column-${column.id}`,
      type: 'column',
      position: { 
        x: 100 + index * 280, 
        y: keywords.length > 0 ? 450 : 200
      },
      data: {
        title: column.title,
        itemCount: column.items.length,
        columnId: column.id,
        onGenerate: () => onGeneratePost(column.id)
      },
    }));

    return [...keywordNodes, ...columnNodes];
  }, [keywords, columns, onAddKeywordToColumn, onGeneratePost]);

  // Create edges from column items to columns
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

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (connection: Connection) => {
      // Handle connecting keyword to column
      if (connection.source?.startsWith('keyword-') && connection.target?.startsWith('column-')) {
        const keywordId = connection.source.replace('keyword-', '');
        const columnId = connection.target.replace('column-', '');
        const keyword = keywords.find(k => k.keyword === keywordId);
        if (keyword) {
          onAddKeywordToColumn(keyword, columnId);
        }
      }
      setEdges((eds) => addEdge(connection, eds));
    },
    [keywords, onAddKeywordToColumn, setEdges]
  );

  // Update nodes when props change
  useMemo(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useMemo(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

  return (
    <div className="w-full h-full bg-[#1a1a1a] rounded-lg overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
        className="react-flow-dark"
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={16} 
          size={1} 
          color="#333333"
        />
        <Controls 
          className="bg-[#252526] border border-[#343536] rounded"
          style={{ button: { backgroundColor: '#1a1a1a', color: '#ffffff' } }}
        />
        <MiniMap 
          nodeColor={(node) => {
            if (node.type === 'column') return '#007acc';
            return '#8b5cf6';
          }}
          className="bg-[#252526] border border-[#343536] rounded"
          maskColor="rgba(0, 0, 0, 0.6)"
        />
        <Panel position="top-left" className="bg-[#252526] border border-[#343536] rounded p-3">
          <div className="flex items-center gap-2 text-sm text-white">
            <Activity className="h-4 w-4 text-primary" />
            <span className="font-medium">Keyword Flow View</span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Connect keywords to columns by dragging from node handles
          </p>
        </Panel>
      </ReactFlow>
    </div>
  );
}
