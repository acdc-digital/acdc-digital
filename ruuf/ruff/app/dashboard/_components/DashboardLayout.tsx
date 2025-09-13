"use client";

import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { usePathname } from "next/navigation";
import { useDashboardStore, type DashboardView } from "@/lib/store/dashboardStore";
import {
  BarChart3,
  Bell,
  Home,
  Mail,
  MessageSquare,
  Plus,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { currentView, setCurrentView } = useDashboardStore();

  const handleNavClick = (e: React.MouseEvent, item: typeof navItems[0]) => {
    if (item.isDashboardView && item.view) {
      e.preventDefault();
      setCurrentView(item.view);
    }
    // For non-dashboard views, let the normal navigation happen
  };

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: Home, view: 'overview' as DashboardView, isDashboardView: true },
    { name: "Campaigns", href: "/dashboard", icon: Mail, view: 'campaigns' as DashboardView, isDashboardView: true },
    { name: "Recipients", href: "/dashboard", icon: Users, view: 'recipients' as DashboardView, isDashboardView: true },
    { name: "Analytics", href: "/dashboard", icon: BarChart3, view: 'analytics' as DashboardView, isDashboardView: true },
    { name: "Monitoring", href: "/dashboard/monitoring", icon: Bell, view: null, isDashboardView: false },
    { name: "AI Assistant", href: "/dashboard/assistant", icon: MessageSquare, view: null, isDashboardView: false },
    { name: "Settings", href: "/dashboard", icon: Settings, view: 'settings' as DashboardView, isDashboardView: true },
  ];  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <header className="bg-white shadow-sm border-b">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <Mail className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">EmailFlow</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button asChild size="sm">
                <Link href="/dashboard/campaigns/create">
                  <Plus className="h-4 w-4 mr-2" />
                  New Campaign
                </Link>
              </Button>
              <UserButton />
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <ul className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = item.isDashboardView 
                  ? (pathname === '/dashboard' && currentView === item.view)
                  : (pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)));
                
                return (
                  <li key={item.name}>
                    {item.isDashboardView ? (
                      <button
                        onClick={(e) => handleNavClick(e, item)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors text-left ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </button>
                    ) : (
                      <Link
                        href={item.href}
                        className={`flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.name}</span>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}