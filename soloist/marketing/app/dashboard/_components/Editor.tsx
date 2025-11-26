"use client";

import Controls from "../controls/Controls";

interface EditorProps {
  showControls?: boolean;
}

export function Editor({ showControls = false }: EditorProps) {
  return (
    <div className="flex-1 flex flex-col bg-background h-full overflow-hidden">
      {/* Main content area - placeholder for future content */}
      <div className="flex-1 overflow-auto">
        {/* Future content goes here */}
      </div>
      
      {/* Controls at bottom - only show on dashboard */}
      {showControls && (
        <div className="flex-shrink-0 p-3">
          <Controls />
        </div>
      )}
    </div>
  );
}
