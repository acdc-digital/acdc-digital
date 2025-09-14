// Sidebar Component - Context-sensitive side panel for LifeOS dashboard
// /Users/matthewsimon/Projects/LifeOS/LifeOS/app/_components/sidebar/dashSidebar.tsx

"use client";

import { useUser, SignInButton } from "@clerk/nextjs";
import { PanelType } from "@/lib/store";
import { 
  UserConsole, 
  AgentsExtensionsPanel, 
  BooksConsole,
  TodosConsole,
  HealthFitnessPanel,
  ResearchSidebar,
  DashTrash 
} from "@/app/_components/activity/_components";
import { FileExplorerPanel } from "@/app/_components/activity/_components/fileExplorer";
import CalendarPanel from "@/app/_components/activity/_components/calendar/CalendarPanel";
import { DashDebug } from "@/app/_components/activity/_components/debug/DashDebug";

interface DashSidebarProps {
  activePanel: PanelType;
}

export function DashSidebar({ activePanel }: DashSidebarProps) {
  const { isSignedIn } = useUser();

  const renderPanelContent = () => {
    switch (activePanel) {
      case 'notes':
        return isSignedIn ? (
          <FileExplorerPanel />
        ) : (
          <div className="p-4">
            <h3 className="text-[#cccccc] font-medium mb-4">NOTES</h3>
            <div className="text-[#858585] text-sm">
              <p className="mb-4">Sign in to access your notes and files.</p>
              <SignInButton mode="modal">
                <button className="bg-[#007acc] hover:bg-[#005a9e] text-white px-3 py-1.5 rounded text-xs transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </div>
        );
      
      case 'calendar':
        return isSignedIn ? (
          <CalendarPanel />
        ) : (
          <div className="p-4">
            <h3 className="text-[#cccccc] font-medium mb-4">CALENDAR</h3>
            <div className="text-[#858585] text-sm">
              <p className="mb-4">Sign in to manage your calendar and posts.</p>
              <SignInButton mode="modal">
                <button className="bg-[#007acc] hover:bg-[#005a9e] text-white px-3 py-1.5 rounded text-xs transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </div>
        );
      
      case 'agents-extensions':
        return isSignedIn ? (
          <AgentsExtensionsPanel />
        ) : (
          <div className="p-4">
            <h3 className="text-[#cccccc] font-medium mb-4">AGENTS & EXTENSIONS</h3>
            <div className="text-[#858585] text-sm">
              <p className="mb-4">Sign in to access AI agents and extensions.</p>
              <SignInButton mode="modal">
                <button className="bg-[#007acc] hover:bg-[#005a9e] text-white px-3 py-1.5 rounded text-xs transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </div>
        );

      case 'books':
        return isSignedIn ? (
          <BooksConsole />
        ) : (
          <div className="p-4">
            <h3 className="text-[#cccccc] font-medium mb-4">BOOKS</h3>
            <div className="text-[#858585] text-sm">
              <p className="mb-4">Sign in to access your book library.</p>
              <SignInButton mode="modal">
                <button className="bg-[#007acc] hover:bg-[#005a9e] text-white px-3 py-1.5 rounded text-xs transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </div>
        );

      case 'todos':
        return isSignedIn ? (
          <TodosConsole />
        ) : (
          <div className="p-4">
            <h3 className="text-[#cccccc] font-medium mb-4">TO DOS</h3>
            <div className="text-[#858585] text-sm">
              <p className="mb-4">Sign in to manage your tasks and todos.</p>
              <SignInButton mode="modal">
                <button className="bg-[#007acc] hover:bg-[#005a9e] text-white px-3 py-1.5 rounded text-xs transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </div>
        );

      case 'health-fitness':
        return isSignedIn ? (
          <HealthFitnessPanel />
        ) : (
          <div className="p-4">
            <h3 className="text-[#cccccc] font-medium mb-4">HEALTH & FITNESS</h3>
            <div className="text-[#858585] text-sm">
              <p className="mb-4">Sign in to track your health and fitness.</p>
              <SignInButton mode="modal">
                <button className="bg-[#007acc] hover:bg-[#005a9e] text-white px-3 py-1.5 rounded text-xs transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </div>
        );

      case 'research':
        return isSignedIn ? (
          <ResearchSidebar />
        ) : (
          <div className="p-4">
            <h3 className="text-[#cccccc] font-medium mb-4">RESEARCH</h3>
            <div className="text-[#858585] text-sm">
              <p className="mb-4">Sign in to access research tools and resources.</p>
              <SignInButton mode="modal">
                <button className="bg-[#007acc] hover:bg-[#005a9e] text-white px-3 py-1.5 rounded text-xs transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </div>
        );
      
      case 'search-replace':
        return (
          <div className="p-4">
            <h3 className="text-[#cccccc] font-medium mb-4">SEARCH</h3>
            {isSignedIn ? (
              <div>
                <input
                  type="text"
                  placeholder="Search files..."
                  className="w-full bg-[#3c3c3c] text-[#cccccc] text-sm px-3 py-2 rounded border-none outline-none"
                />
              </div>
            ) : (
              <div className="text-[#858585] text-sm">
                <p>Sign in to search your projects.</p>
              </div>
            )}
          </div>
        );
      
      case 'debug':
        return isSignedIn ? (
          <DashDebug />
        ) : (
          <div className="p-4">
            <h3 className="text-[#cccccc] font-medium mb-4">DEBUG CONSOLE</h3>
            <div className="text-[#858585] text-sm">
              <p className="mb-4">Sign in to access advanced debugging tools.</p>
              <SignInButton mode="modal">
                <button className="bg-[#007acc] hover:bg-[#005a9e] text-white px-3 py-1.5 rounded text-xs transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </div>
        );
      
      case 'trash':
        return isSignedIn ? (
          <DashTrash />
        ) : (
          <div className="p-4">
            <h3 className="text-[#cccccc] font-medium mb-4">TRASH</h3>
            <div className="text-[#858585] text-sm">
              <p className="mb-4">Sign in to access trash management.</p>
              <SignInButton mode="modal">
                <button className="bg-[#007acc] hover:bg-[#005a9e] text-white px-3 py-1.5 rounded text-xs transition-colors">
                  Sign In
                </button>
              </SignInButton>
            </div>
          </div>
        );
      
      case 'account':
        return <UserConsole />;
      
      default:
        return (
          <div className="p-4">
            <div className="text-[#858585] text-sm">
              Select an option from the activity bar.
            </div>
          </div>
        );
    }
  };

  return (
    <div className="w-60 min-w-60 max-w-60 bg-[#252526] border-r border-[#454545] flex flex-col">
      {renderPanelContent()}
    </div>
  );
}
