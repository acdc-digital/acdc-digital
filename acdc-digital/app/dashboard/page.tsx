export default function DashboardPage() {
  return (
    <div className="h-screen bg-background flex overflow-hidden">
      {/* Activity Bar */}
      <div className="w-16 bg-slate-700 flex flex-col items-center py-4 space-y-4">
        <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center text-white text-sm font-bold">
          F
        </div>
        <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center text-white text-sm">
          S
        </div>
        <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center text-white text-sm">
          G
        </div>
        <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center text-white text-sm">
          D
        </div>
        <div className="w-8 h-8 bg-gray-600 rounded flex items-center justify-center text-white text-sm">
          E
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-64 bg-slate-600 border-r border-slate-500">
        <div className="p-4 border-b border-slate-500">
          <h2 className="text-white font-semibold">Explorer</h2>
        </div>
        <div className="p-4 space-y-2">
          <div className="text-white text-sm">📁 Project Files</div>
          <div className="ml-4 space-y-1">
            <div className="text-gray-300 text-sm cursor-pointer hover:text-white">📄 dashboard.tsx</div>
            <div className="text-gray-300 text-sm cursor-pointer hover:text-white">📄 layout.tsx</div>
            <div className="text-gray-300 text-sm cursor-pointer hover:text-white">📄 globals.css</div>
          </div>
          <div className="text-white text-sm">📁 Components</div>
          <div className="ml-4 space-y-1">
            <div className="text-gray-300 text-sm cursor-pointer hover:text-white">📄 ui/</div>
            <div className="text-gray-300 text-sm cursor-pointer hover:text-white">📄 ConvexClientProvider.tsx</div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Tab Bar */}
        <div className="h-10 bg-slate-500 border-b border-slate-400 flex items-center px-4">
          <div className="flex space-x-2">
            <div className="px-3 py-1 bg-slate-400 text-white text-sm rounded-t">
              Dashboard
            </div>
            <div className="px-3 py-1 text-gray-300 text-sm hover:text-white cursor-pointer">
              Settings
            </div>
            <div className="px-3 py-1 text-gray-300 text-sm hover:text-white cursor-pointer">
              Analytics
            </div>
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 bg-slate-800 overflow-auto">
          {/* Empty main content area */}
        </div>

        {/* Terminal/Bottom Panel */}
        <div className="h-40 bg-slate-900 border-t border-slate-700">
          <div className="h-8 bg-slate-700 border-b border-slate-600 flex items-center px-4">
            <div className="flex space-x-4">
              <div className="text-green-400 text-sm font-medium">Terminal</div>
              <div className="text-gray-400 text-sm">Output</div>
              <div className="text-gray-400 text-sm">Debug Console</div>
            </div>
          </div>
          <div className="p-4 font-mono text-sm">
            <div className="text-green-400 mb-2">$ npm run dev</div>
            <div className="text-gray-300 mb-1">✓ Ready in 2.1s</div>
            <div className="text-gray-300 mb-1">○ Local: http://localhost:3000</div>
            <div className="text-green-400">$ Dashboard loaded successfully</div>
            <div className="text-gray-400 mt-2 animate-pulse">|</div>
          </div>
        </div>
      </div>
    </div>
  );
}
