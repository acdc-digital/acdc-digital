import { create } from 'zustand';

// Dashboard view types
export type DashboardView = 'overview' | 'campaigns' | 'recipients' | 'analytics' | 'settings';

// Dashboard state interface
interface DashboardState {
  // Current active view
  currentView: DashboardView;
  
  // Dashboard metrics
  metrics: {
    totalCampaigns: number;
    activeCampaigns: number;
    totalRecipients: number;
    deliveryRate: number;
    openRate: number;
    clickRate: number;
    bounceRate: number;
  };
  
  // Recent activity data
  recentActivity: Array<{
    id: string;
    type: 'campaign_sent' | 'bounce' | 'open' | 'click' | 'unsubscribe';
    title: string;
    description: string;
    timestamp: number;
    severity?: 'info' | 'warning' | 'error';
  }>;
  
  // Loading states
  isLoading: boolean;
  
  // Actions
  setCurrentView: (view: DashboardView) => void;
  updateMetrics: (metrics: Partial<DashboardState['metrics']>) => void;
  addRecentActivity: (activity: DashboardState['recentActivity'][0]) => void;
  setLoading: (loading: boolean) => void;
  refreshDashboard: () => void;
}

// Mock data for demonstration
const mockMetrics = {
  totalCampaigns: 24,
  activeCampaigns: 3,
  totalRecipients: 12500,
  deliveryRate: 96.8,
  openRate: 24.5,
  clickRate: 4.2,
  bounceRate: 2.1,
};

const mockRecentActivity = [
  {
    id: '1',
    type: 'campaign_sent' as const,
    title: 'Holiday Sale Campaign',
    description: 'Sent to 2,500 recipients',
    timestamp: Date.now() - 1000 * 60 * 15, // 15 minutes ago
    severity: 'info' as const,
  },
  {
    id: '2',
    type: 'open' as const,
    title: 'Welcome Series - Part 1',
    description: '156 opens in the last hour',
    timestamp: Date.now() - 1000 * 60 * 30, // 30 minutes ago
    severity: 'info' as const,
  },
  {
    id: '3',
    type: 'bounce' as const,
    title: 'Newsletter Campaign',
    description: '12 hard bounces detected',
    timestamp: Date.now() - 1000 * 60 * 45, // 45 minutes ago
    severity: 'warning' as const,
  },
  {
    id: '4',
    type: 'click' as const,
    title: 'Product Launch',
    description: '89 clicks on main CTA',
    timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
    severity: 'info' as const,
  },
];

// Create the store
export const useDashboardStore = create<DashboardState>()((set, get) => ({
  // Initial state
  currentView: 'overview',
  metrics: mockMetrics,
  recentActivity: mockRecentActivity,
  isLoading: false,
  
  // Actions
  setCurrentView: (view) => {
    // Immediately set the view and loading state
    set({ 
      currentView: view, 
      isLoading: true 
    });
    
    // Simulate loading with proper cleanup
    setTimeout(() => {
      const currentState = get();
      // Only update if we're still on the same view
      if (currentState.currentView === view) {
        switch (view) {
          case 'overview':
            set({
              isLoading: false,
              metrics: {
                totalCampaigns: 64,
                activeCampaigns: 12,
                totalRecipients: 12500,
                deliveryRate: 96.8,
                openRate: 24.5,
                clickRate: 4.2,
                bounceRate: 2.1,
              },
              recentActivity: [
                {
                  id: '1',
                  type: 'campaign_sent' as const,
                  title: 'Holiday Sale Campaign',
                  description: 'Sent to 2,500 recipients',
                  timestamp: Date.now() - 1000 * 60 * 16,
                  severity: 'info' as const,
                },
                {
                  id: '2',
                  type: 'open' as const,
                  title: 'Welcome Series - Part 1',
                  description: '156 opens in the last hour',
                  timestamp: Date.now() - 1000 * 60 * 31,
                  severity: 'info' as const,
                },
                {
                  id: '3',
                  type: 'bounce' as const,
                  title: 'Newsletter Campaign',
                  description: '12 hard bounces detected',
                  timestamp: Date.now() - 1000 * 60 * 67,
                  severity: 'warning' as const,
                },
                {
                  id: '4',
                  type: 'click' as const,
                  title: 'Product Launch',
                  description: '89 clicks on main CTA',
                  timestamp: Date.now() - 1000 * 60 * 89,
                  severity: 'info' as const,
                },
              ],
            });
            break;

          case 'campaigns':
            set({
              isLoading: false,
              metrics: {
                totalCampaigns: Math.floor(Math.random() * 50) + 30,
                activeCampaigns: Math.floor(Math.random() * 10) + 5,
                totalRecipients: 12500,
                deliveryRate: Math.round((Math.random() * 5 + 95) * 10) / 10,
                openRate: Math.round((Math.random() * 10 + 20) * 10) / 10,
                clickRate: Math.round((Math.random() * 3 + 3) * 10) / 10,
                bounceRate: Math.round((Math.random() * 2 + 1) * 10) / 10,
              },
              recentActivity: [
                {
                  id: '1',
                  type: 'campaign_sent' as const,
                  title: 'Summer Sale Campaign',
                  description: 'Successfully sent to 5,000 recipients',
                  timestamp: Date.now() - 1000 * 60 * 10,
                  severity: 'info' as const,
                },
                {
                  id: '2',
                  type: 'campaign_sent' as const,
                  title: 'Back to School Promo',
                  description: 'Campaign scheduled for tomorrow',
                  timestamp: Date.now() - 1000 * 60 * 45,
                  severity: 'info' as const,
                },
              ],
            });
            break;

          case 'recipients':
            set({
              isLoading: false,
              metrics: {
                totalCampaigns: 64,
                activeCampaigns: 12,
                totalRecipients: Math.floor(Math.random() * 5000) + 10000,
                deliveryRate: Math.round((Math.random() * 5 + 95) * 10) / 10,
                openRate: 24.5,
                clickRate: 4.2,
                bounceRate: Math.round((Math.random() * 2 + 1) * 10) / 10,
              },
              recentActivity: [
                {
                  id: '1',
                  type: 'open' as const,
                  title: 'New Subscriber',
                  description: 'john.doe@example.com subscribed via landing page',
                  timestamp: Date.now() - 1000 * 60 * 5,
                  severity: 'info' as const,
                },
                {
                  id: '2',
                  type: 'unsubscribe' as const,
                  title: 'Unsubscribe',
                  description: 'jane.smith@example.com unsubscribed',
                  timestamp: Date.now() - 1000 * 60 * 20,
                  severity: 'warning' as const,
                },
              ],
            });
            break;

          case 'analytics':
            set({
              isLoading: false,
              metrics: {
                totalCampaigns: 64,
                activeCampaigns: 12,
                totalRecipients: 12500,
                deliveryRate: 96.8,
                openRate: Math.round((Math.random() * 10 + 20) * 10) / 10,
                clickRate: Math.round((Math.random() * 3 + 3) * 10) / 10,
                bounceRate: Math.round((Math.random() * 2 + 1) * 10) / 10,
              },
              recentActivity: [
                {
                  id: '1',
                  type: 'click' as const,
                  title: 'Monthly Report Ready',
                  description: 'Analytics report for this month is available',
                  timestamp: Date.now() - 1000 * 60 * 2,
                  severity: 'info' as const,
                },
                {
                  id: '2',
                  type: 'open' as const,
                  title: 'High Performance Alert',
                  description: 'Campaign exceeded typical open rate by 45%',
                  timestamp: Date.now() - 1000 * 60 * 60,
                  severity: 'info' as const,
                },
              ],
            });
            break;

          case 'settings':
            set({
              isLoading: false,
              metrics: {
                totalCampaigns: 64,
                activeCampaigns: 12,
                totalRecipients: 12500,
                deliveryRate: 96.8,
                openRate: 24.5,
                clickRate: 4.2,
                bounceRate: 2.1,
              },
              recentActivity: [
                {
                  id: '1',
                  type: 'campaign_sent' as const,
                  title: 'SMTP Settings Updated',
                  description: 'Email delivery configuration modified',
                  timestamp: Date.now() - 1000 * 60 * 30,
                  severity: 'info' as const,
                },
                {
                  id: '2',
                  type: 'open' as const,
                  title: 'New Team Member',
                  description: 'sarah.jones@company.com added as Editor',
                  timestamp: Date.now() - 1000 * 60 * 60 * 3,
                  severity: 'info' as const,
                },
              ],
            });
            break;

          default:
            // Handle any unknown views gracefully
            set({ isLoading: false });
            break;
        }
      }
    }, 300);
  },
  
  updateMetrics: (newMetrics) => {
    set((state) => ({
      metrics: { ...state.metrics, ...newMetrics }
    }));
  },
  
  addRecentActivity: (activity) => {
    set((state) => ({
      recentActivity: [activity, ...state.recentActivity.slice(0, 9)] // Keep only 10 most recent
    }));
  },
  
  setLoading: (loading) => {
    set({ isLoading: loading });
  },
  
  refreshDashboard: () => {
    set({ isLoading: true });
    
    // Simulate API call to refresh data
    setTimeout(() => {
      set({
        metrics: {
          totalCampaigns: Math.floor(Math.random() * 50) + 20,
          activeCampaigns: Math.floor(Math.random() * 10) + 1,
          totalRecipients: Math.floor(Math.random() * 5000) + 10000,
          deliveryRate: Math.round((Math.random() * 5 + 95) * 10) / 10,
          openRate: Math.round((Math.random() * 10 + 20) * 10) / 10,
          clickRate: Math.round((Math.random() * 3 + 3) * 10) / 10,
          bounceRate: Math.round((Math.random() * 2 + 1) * 10) / 10,
        },
        isLoading: false,
      });
      
      // Add a refresh activity
      get().addRecentActivity({
        id: `refresh_${Date.now()}`,
        type: 'campaign_sent',
        title: 'Dashboard Refreshed',
        description: 'Latest metrics updated',
        timestamp: Date.now(),
        severity: 'info',
      });
    }, 1000);
  },
}));

// Utility function to get view-specific metrics
export const getViewMetrics = (view: DashboardView, metrics: DashboardState['metrics']) => {
  switch (view) {
    case 'campaigns':
      return [
        { label: 'Total Campaigns', value: metrics.totalCampaigns.toString(), change: '+12%' },
        { label: 'Active Campaigns', value: metrics.activeCampaigns.toString(), change: '+5%' },
        { label: 'Delivery Rate', value: `${metrics.deliveryRate}%`, change: '+2.1%' },
        { label: 'Avg Open Rate', value: `${metrics.openRate}%`, change: '+0.8%' },
      ];
    case 'recipients':
      return [
        { label: 'Total Recipients', value: metrics.totalRecipients.toLocaleString(), change: '+8%' },
        { label: 'Active Recipients', value: Math.floor(metrics.totalRecipients * 0.85).toLocaleString(), change: '+6%' },
        { label: 'Delivery Rate', value: `${metrics.deliveryRate}%`, change: '+1.2%' },
        { label: 'Bounce Rate', value: `${metrics.bounceRate}%`, change: '-0.3%' },
      ];
    case 'analytics':
      return [
        { label: 'Open Rate', value: `${metrics.openRate}%`, change: '+2.3%' },
        { label: 'Click Rate', value: `${metrics.clickRate}%`, change: '+0.9%' },
        { label: 'Bounce Rate', value: `${metrics.bounceRate}%`, change: '-0.4%' },
        { label: 'Unsubscribe Rate', value: '0.8%', change: '-0.1%' },
      ];
    case 'settings':
      return [
        { label: 'Account Status', value: 'Active', change: 'Verified' },
        { label: 'API Calls', value: '2,450', change: '+15%' },
        { label: 'Storage Used', value: '1.2 GB', change: '+5%' },
        { label: 'Team Members', value: '5', change: 'No change' },
      ];
    default: // overview
      return [
        { label: 'Total Campaigns', value: metrics.totalCampaigns.toString(), change: '+12%' },
        { label: 'Total Recipients', value: metrics.totalRecipients.toLocaleString(), change: '+8%' },
        { label: 'Delivery Rate', value: `${metrics.deliveryRate}%`, change: '+2.1%' },
        { label: 'Open Rate', value: `${metrics.openRate}%`, change: '+2.3%' },
      ];
  }
};