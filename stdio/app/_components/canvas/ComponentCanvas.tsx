"use client";

import { useState, useImperativeHandle, forwardRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { PreviewFrame } from "./PreviewFrame";
import { CanvasControls } from "./CanvasControls";

type DeviceMode = "desktop" | "tablet" | "mobile";

export interface ComponentCanvasRef {
  handleComponentGenerated: (code: string, title: string) => void;
  setIsGenerating: (isGenerating: boolean) => void;
}

export const ComponentCanvas = forwardRef<ComponentCanvasRef>((props, ref) => {
  const [code, setCode] = useState(`function App() {
  const [count, setCount] = React.useState(0);
  
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h1 style={{ color: '#2563eb', marginBottom: '1rem' }}>Welcome to Canvas</h1>
      <p style={{ color: '#666', marginBottom: '1rem' }}>Start building your React component</p>
      <p style={{ fontSize: '2rem', margin: '1rem 0' }}>{count}</p>
      <button 
        onClick={() => setCount(count + 1)}
        style={{
          padding: '0.5rem 1rem',
          background: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '0.375rem',
          cursor: 'pointer'
        }}
      >
        Click Me ({count})
      </button>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));`);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [refreshKey, setRefreshKey] = useState(0);
  const [title, setTitle] = useState("Untitled Component");
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCodeCollapsed, setIsCodeCollapsed] = useState(false);
  
  const saveComponent = useMutation(api.components.saveComponent);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleComponentGenerated = (generatedCode: string, componentTitle: string) => {
    setCode(generatedCode);
    setTitle(componentTitle);
    setRefreshKey((prev) => prev + 1);
  };

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    handleComponentGenerated,
    setIsGenerating,
  }));

  const handleSave = async () => {
    if (!code.trim()) {
      alert("Cannot save empty component");
      return;
    }

    setIsSaving(true);
    try {
      await saveComponent({
        code,
        title,
        framework: "react",
        description: "React component created in Canvas",
      });
      alert("Component saved successfully!");
    } catch (error) {
      console.error("Failed to save component:", error);
      alert("Failed to save component");
    } finally {
      setIsSaving(false);
    }
  };

  const getPreviewWidth = () => {
    switch (deviceMode) {
      case "mobile":
        return "375px";
      case "tablet":
        return "768px";
      case "desktop":
      default:
        return "100%";
    }
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e]">
        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left: Code Editor */}
          <div className={`flex flex-col border-r border-[#3e3e42] transition-all duration-300 ${isCodeCollapsed ? 'w-10' : 'w-1/2'}`}>
          <div className="h-[35px] bg-[#252526] border-b border-[#3e3e42] flex items-center justify-between px-3">
            <span className="text-xs text-[#858585]">{isCodeCollapsed ? '' : 'Code'}</span>
            <button
              onClick={() => setIsCodeCollapsed(!isCodeCollapsed)}
              className="text-[#858585] hover:text-[#cccccc] transition-colors"
              title={isCodeCollapsed ? 'Expand code' : 'Collapse code'}
            >
              {isCodeCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          </div>
          {!isCodeCollapsed && (
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="flex-1 bg-[#1e1e1e] text-[#cccccc] text-xs font-mono p-4 resize-none outline-none border-none"
              placeholder="Enter your component code here..."
              spellCheck={false}
            />
          )}
        </div>

        {/* Right: Preview + Storage */}
        <div className={`flex flex-col transition-all duration-300 ${isCodeCollapsed ? 'flex-1' : 'w-1/2'}`}>
          {/* Preview Area */}
          <div className="flex-1 flex flex-col">
            <CanvasControls
              onRefresh={handleRefresh}
              deviceMode={deviceMode}
              onDeviceModeChange={setDeviceMode}
              isGenerating={isGenerating}
              title={title}
              onTitleChange={setTitle}
              onSave={handleSave}
              isSaving={isSaving}
            />
            <div className="flex-1 flex items-center justify-center bg-[#181818] p-4 overflow-auto">
              <div
                key={refreshKey}
                className="h-full transition-all duration-300"
                style={{ width: getPreviewWidth() }}
              >
                <PreviewFrame code={code} framework="react" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ComponentCanvas.displayName = "ComponentCanvas";
