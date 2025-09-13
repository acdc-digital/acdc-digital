"use client";

import { Authenticated } from "convex/react";
import DashboardLayout from "@/app/dashboard/_components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DeliveryStats } from "@/app/dashboard/_components/DashboardCards";
import Link from "next/link";
import { 
  ArrowLeft, 
  Edit, 
  Play, 
  Pause, 
  Copy,
  Mail,
  Users,
  TrendingUp,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useParams } from "next/navigation";

// Mock campaign data for demonstration
const getMockCampaign = (id: string) => ({
  _id: id,
  name: "Product Launch Campaign",
  description: "Announcing our latest product features to our subscriber base",
  status: "sending" as const,
  subject: "🚀 Introducing Revolutionary New Features",
  fromAddress: "marketing@company.com",
  fromName: "Marketing Team",
  replyToAddress: "support@company.com",
  htmlContent: `
    <h1>Exciting New Features Are Here!</h1>
    <p>We're thrilled to announce our latest product updates...</p>
    <a href="https://company.com/features">Learn More</a>
  `,
  plainTextContent: "Exciting New Features Are Here!\n\nWe're thrilled to announce...",
  totalRecipients: 3500,
  sentCount: 2100,
  deliveredCount: 2040,
  bouncedCount: 60,
  openedCount: 612,
  clickedCount: 89,
  spamCount: 15,
  failedCount: 5,
  createdAt: Date.now() - 86400000, // 1 day ago
  scheduledAt: null,
  startedAt: Date.now() - 3600000 * 4, // 4 hours ago
  completedAt: null,
  priority: "high" as const,
  customHeaders: [
    { name: "X-Campaign-Type", value: "product-launch" }
  ]
});

export default function CampaignDetailsPage() {
  return (
    <DashboardLayout>
      <Authenticated>
        <CampaignDetailsContent />
      </Authenticated>
    </DashboardLayout>
  );
}

function CampaignDetailsContent() {
  const params = useParams();
  const campaignId = params?.id as string;
  const campaign = getMockCampaign(campaignId);

  const deliveryProgress = campaign.totalRecipients > 0 
    ? (campaign.sentCount / campaign.totalRecipients) * 100 
    : 0;

  const openRate = campaign.deliveredCount > 0 
    ? (campaign.openedCount / campaign.deliveredCount) * 100 
    : 0;

  const clickRate = campaign.openedCount > 0 
    ? (campaign.clickedCount / campaign.openedCount) * 100 
    : 0;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sending": return <Clock className="h-4 w-4" />;
      case "completed": return <CheckCircle className="h-4 w-4" />;
      case "failed": return <XCircle className="h-4 w-4" />;
      case "paused": return <Pause className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "sending": return "bg-blue-100 text-blue-800";
      case "completed": return "bg-green-100 text-green-800";
      case "failed": return "bg-red-100 text-red-800";
      case "paused": return "bg-yellow-100 text-yellow-800";
      case "draft": return "bg-gray-100 text-gray-800";
      case "scheduled": return "bg-purple-100 text-purple-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href="/dashboard/campaigns">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Campaigns
            </Link>
          </Button>
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">{campaign.name}</h1>
              <Badge className={`${getStatusColor(campaign.status)} flex items-center space-x-1`}>
                {getStatusIcon(campaign.status)}
                <span className="capitalize">{campaign.status}</span>
              </Badge>
            </div>
            <p className="text-gray-600">{campaign.description}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/dashboard/campaigns/${campaignId}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          {campaign.status === "sending" && (
            <Button variant="outline" size="sm">
              <Pause className="h-4 w-4 mr-2" />
              Pause
            </Button>
          )}
          <Button size="sm" disabled={campaign.status === "sending" || campaign.status === "completed"}>
            <Play className="h-4 w-4 mr-2" />
            Send Now
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-500">Recipients</p>
                <p className="text-2xl font-bold">{campaign.totalRecipients.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-500">Delivered</p>
                <p className="text-2xl font-bold">{campaign.deliveredCount.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-500">Open Rate</p>
                <p className="text-2xl font-bold">{openRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-500">Click Rate</p>
                <p className="text-2xl font-bold">{clickRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="recipients">Recipients</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Delivery Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Delivery Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Sent: {campaign.sentCount.toLocaleString()}</span>
                    <span>{deliveryProgress.toFixed(1)}%</span>
                  </div>
                  <Progress value={deliveryProgress} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Delivered:</span>
                    <span className="font-medium">{campaign.deliveredCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Opened:</span>
                    <span className="font-medium">{campaign.openedCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Clicked:</span>
                    <span className="font-medium">{campaign.clickedCount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Bounced:</span>
                    <span className="font-medium">{campaign.bouncedCount.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Campaign Details */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subject Line:</span>
                    <span className="font-medium max-w-64 truncate">{campaign.subject}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">From:</span>
                    <span className="font-medium">{campaign.fromName} &lt;{campaign.fromAddress}&gt;</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Priority:</span>
                    <Badge variant="outline" className="capitalize">{campaign.priority}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created:</span>
                    <span className="font-medium">{new Date(campaign.createdAt).toLocaleDateString()}</span>
                  </div>
                  {campaign.startedAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">Started:</span>
                      <span className="font-medium">{new Date(campaign.startedAt).toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <DeliveryStats 
                stats={{
                  totalSent: campaign.sentCount,
                  totalDelivered: campaign.deliveredCount,
                  totalBounced: campaign.bouncedCount,
                  totalComplaints: campaign.spamCount,
                  deliveryRate: campaign.sentCount > 0 ? (campaign.deliveredCount / campaign.sentCount) * 100 : 0,
                  bounceRate: campaign.sentCount > 0 ? (campaign.bouncedCount / campaign.sentCount) * 100 : 0,
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Content (HTML)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap overflow-x-auto">
                    {campaign.htmlContent}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Plain Text Version</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                    {campaign.plainTextContent}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recipients">
          <Card>
            <CardHeader>
              <CardTitle>Recipient Management</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900">Recipient Lists</h3>
                <p className="text-gray-500 mt-2">Recipient list management will be available soon</p>
                <Button className="mt-4" disabled>
                  <Users className="h-4 w-4 mr-2" />
                  Manage Recipients
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-6 text-sm">
                <div>
                  <label className="text-gray-500">From Address</label>
                  <p className="font-medium">{campaign.fromAddress}</p>
                </div>
                <div>
                  <label className="text-gray-500">From Name</label>
                  <p className="font-medium">{campaign.fromName}</p>
                </div>
                <div>
                  <label className="text-gray-500">Reply To</label>
                  <p className="font-medium">{campaign.replyToAddress}</p>
                </div>
                <div>
                  <label className="text-gray-500">Priority</label>
                  <p className="font-medium capitalize">{campaign.priority}</p>
                </div>
              </div>

              {campaign.customHeaders && campaign.customHeaders.length > 0 && (
                <div>
                  <label className="text-gray-500 text-sm">Custom Headers</label>
                  <div className="mt-2 space-y-2">
                    {campaign.customHeaders.map((header, index) => (
                      <div key={index} className="flex justify-between text-sm bg-gray-50 p-2 rounded">
                        <span className="font-medium">{header.name}:</span>
                        <span className="text-gray-600">{header.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}