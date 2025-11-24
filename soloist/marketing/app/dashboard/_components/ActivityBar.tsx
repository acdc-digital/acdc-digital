"use client";

import { 
  Folder, 
  Calendar, 
  BarChart3,
  Layout,
  Image,
  Mail,
  Settings,
  User,
  BadgeCheck,
  LucideIcon, 
  IdCardLanyardIcon,
  CircleUserIcon
} from "lucide-react";

export type PanelType = 
  | "dashboard"
  | "content"
  | "credentials"
  | "account"
  | "settings"
  | null;

interface ActivityBarProps {
  activePanel: PanelType;
  onPanelChange: (panel: PanelType) => void;
}

export function ActivityBar({ activePanel, onPanelChange }: ActivityBarProps) {
  const activityItems: Array<{ id: PanelType; icon: LucideIcon; label: string }> = [
    { id: "dashboard", icon: Layout, label: "Dashboard" },
    { id: "content", icon: Folder, label: "Documentation" },
    { id: "credentials", icon: CircleUserIcon, label: "Credentials" },
    { id: "account", icon: User, label: "Account" },
  ];

  const bottomItems: Array<{ id: PanelType; icon: LucideIcon; label: string }> = [
    { id: "settings", icon: Settings, label: "Settings" },
  ];

  const handleActivityClick = (id: PanelType) => {
    onPanelChange(id);
  };

  const getUserInitial = () => {
    // TODO: Get from auth context
    return 'U';
  };

  return (
    <aside className="w-12 bg-card border-r border-border flex flex-col">
      {/* Activity Icons */}
      <div className="flex flex-col items-center">
        {activityItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePanel === item.id;
          
          // Special handling for account icon
          if (item.id === 'account') {
            return (
              <button
                key={item.id}
                className={`w-12 h-12 hover:bg-accent/10 flex items-center justify-center cursor-pointer relative transition-all duration-200 ${
                  isActive ? 'bg-accent/10' : ''
                }`}
                onClick={() => handleActivityClick(item.id)}
                title={item.label}
              >
                <div
                  className={`w-6 h-6 rounded-full border flex items-center justify-center text-xs font-medium ${
                    isActive
                      ? 'border-foreground text-foreground'
                      : 'border-muted-foreground text-muted-foreground'
                  }`}
                >
                  {getUserInitial()}
                </div>
                {isActive && (
                  <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-primary" />
                )}
              </button>
            );
          }

          // Special handling for credentials icon - make it bigger
          if (item.id === 'credentials') {
            return (
              <button
                key={item.id}
                onClick={() => handleActivityClick(item.id)}
                className={`w-12 h-12 hover:bg-accent/10 flex items-center justify-center relative transition-all duration-200 ${
                  isActive ? 'bg-accent/10' : ''
                }`}
                title={item.label}
              >
                <Icon
                  className={`w-5.25 h-5.25 ${
                    isActive ? 'text-foreground' : 'text-muted-foreground'
                  }`}
                />
                {isActive && (
                  <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-primary" />
                )}
              </button>
            );
          }
          
          return (
            <button
              key={item.id}
              onClick={() => handleActivityClick(item.id)}
              className={`w-12 h-12 hover:bg-accent/10 flex items-center justify-center relative transition-all duration-200 ${
                isActive ? 'bg-accent/10' : ''
              }`}
              title={item.label}
            >
              <Icon
                className={`w-4.5 h-4.5 ${
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                }`}
              />
              {isActive && (
                <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-primary" />
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Section */}
      <div className="mt-auto flex flex-col items-center">
        {bottomItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePanel === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => handleActivityClick(item.id)}
              className={`w-12 h-12 hover:bg-accent/10 flex items-center justify-center relative transition-all duration-200 ${
                isActive ? 'bg-accent/10' : ''
              }`}
              title={item.label}
            >
              <Icon
                className={`w-4.5 h-4.5 ${
                  isActive ? 'text-foreground' : 'text-muted-foreground'
                }`}
              />
              {isActive && (
                <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
