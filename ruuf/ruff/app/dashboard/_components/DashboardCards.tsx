import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function MetricCard({ title, value, description, icon, trend }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="h-4 w-4 text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <p className={`text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '+' : ''}{trend.value}% from last month
          </p>
        )}
      </CardContent>
    </Card>
  );
}

interface CampaignCardProps {
  campaign: {
    _id: string;
    name: string;
    status: "draft" | "scheduled" | "sending" | "completed" | "paused" | "failed";
    subject: string;
    createdAt: number;
    totalRecipients: number;
    sentCount: number;
    deliveredCount: number;
    bouncedCount: number;
  };
  onClick?: () => void;
}

export function CampaignCard({ campaign, onClick }: CampaignCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft": return "bg-gray-500";
      case "scheduled": return "bg-blue-500";
      case "sending": return "bg-yellow-500";
      case "completed": return "bg-green-500";
      case "paused": return "bg-orange-500";
      case "failed": return "bg-red-500";
      default: return "bg-gray-500";
    }
  };

  const progressPercentage = campaign.totalRecipients > 0 
    ? (campaign.sentCount / campaign.totalRecipients) * 100 
    : 0;

  const deliveryRate = campaign.sentCount > 0 
    ? (campaign.deliveredCount / campaign.sentCount) * 100 
    : 0;

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg truncate">{campaign.name}</CardTitle>
          <Badge className={`${getStatusColor(campaign.status)} text-white capitalize`}>
            {campaign.status}
          </Badge>
        </div>
        <CardDescription className="truncate">{campaign.subject}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Progress Bar */}
          {campaign.status === "sending" || campaign.status === "completed" ? (
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
          ) : null}
          
          {/* Statistics */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Recipients</p>
              <p className="font-semibold">{campaign.totalRecipients.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Sent</p>
              <p className="font-semibold">{campaign.sentCount.toLocaleString()}</p>
            </div>
            {campaign.sentCount > 0 && (
              <>
                <div>
                  <p className="text-muted-foreground">Delivered</p>
                  <p className="font-semibold text-green-600">
                    {campaign.deliveredCount.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Bounced</p>
                  <p className="font-semibold text-red-600">
                    {campaign.bouncedCount.toLocaleString()}
                  </p>
                </div>
              </>
            )}
          </div>
          
          {/* Delivery Rate */}
          {campaign.sentCount > 0 && (
            <div className="pt-2 border-t">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Delivery Rate</span>
                <span className={`font-semibold ${
                  deliveryRate >= 95 ? 'text-green-600' : 
                  deliveryRate >= 85 ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {Math.round(deliveryRate)}%
                </span>
              </div>
            </div>
          )}
          
          <div className="text-xs text-muted-foreground">
            Created {new Date(campaign.createdAt).toLocaleDateString()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface DeliveryStatsProps {
  stats: {
    totalSent: number;
    totalDelivered: number;
    totalBounced: number;
    totalComplaints: number;
    deliveryRate: number;
    bounceRate: number;
  };
}

export function DeliveryStats({ stats }: DeliveryStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <MetricCard
        title="Emails Sent"
        value={stats.totalSent.toLocaleString()}
        description="Total emails sent"
      />
      <MetricCard
        title="Delivery Rate"
        value={`${stats.deliveryRate.toFixed(1)}%`}
        description="Successfully delivered"
      />
      <MetricCard
        title="Bounce Rate"
        value={`${stats.bounceRate.toFixed(1)}%`}
        description="Failed deliveries"
      />
      <MetricCard
        title="Spam Complaints"
        value={stats.totalComplaints.toLocaleString()}
        description="Marked as spam"
      />
    </div>
  );
}