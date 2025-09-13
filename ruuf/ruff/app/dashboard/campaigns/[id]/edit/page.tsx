"use client";

import { Authenticated } from "convex/react";
import DashboardLayout from "@/app/dashboard/_components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Save, 
  Eye, 
  Send, 
  AlertTriangle,
  CheckCircle,
  Mail,
  Settings,
  Users
} from "lucide-react";

// Mock campaign data
const getMockCampaign = (id: string) => ({
  _id: id,
  name: "Product Launch Campaign",
  description: "Announcing our latest product features to our subscriber base",
  status: "draft" as const,
  subject: "🚀 Introducing Revolutionary New Features",
  fromAddress: "marketing@company.com",
  fromName: "Marketing Team",
  replyToAddress: "support@company.com",
  htmlContent: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h1 style="color: #2563eb;">Exciting New Features Are Here!</h1>
  <p>We're thrilled to announce our latest product updates that will revolutionize your workflow.</p>
  
  <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
    <h2>What's New:</h2>
    <ul>
      <li>Advanced Analytics Dashboard</li>
      <li>Real-time Collaboration Tools</li>
      <li>Enhanced Security Features</li>
    </ul>
  </div>
  
  <a href="https://company.com/features" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
    Learn More
  </a>
  
  <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
    Thanks for being a valued customer!<br>
    The Marketing Team
  </p>
</div>`,
  plainTextContent: `Exciting New Features Are Here!

We're thrilled to announce our latest product updates that will revolutionize your workflow.

What's New:
- Advanced Analytics Dashboard
- Real-time Collaboration Tools  
- Enhanced Security Features

Learn more: https://company.com/features

Thanks for being a valued customer!
The Marketing Team`,
  priority: "high" as const,
  recipientListId: "list-123",
  scheduledAt: null,
  customHeaders: [
    { name: "X-Campaign-Type", value: "product-launch" }
  ]
});

export default function EditCampaignPage() {
  return (
    <DashboardLayout>
      <Authenticated>
        <EditCampaignContent />
      </Authenticated>
    </DashboardLayout>
  );
}

function EditCampaignContent() {
  const params = useParams();
  const campaignId = params?.id as string;
  const originalCampaign = getMockCampaign(campaignId);
  
  const [formData, setFormData] = useState({
    name: originalCampaign.name,
    description: originalCampaign.description,
    subject: originalCampaign.subject,
    fromAddress: originalCampaign.fromAddress,
    fromName: originalCampaign.fromName,
    replyToAddress: originalCampaign.replyToAddress,
    htmlContent: originalCampaign.htmlContent,
    plainTextContent: originalCampaign.plainTextContent,
    priority: originalCampaign.priority,
    scheduledSendTime: "",
  });

  const [activeTab, setActiveTab] = useState("basic");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    console.log("Demo: Would save campaign with data:", formData);
    setHasUnsavedChanges(false);
    alert("Campaign saved successfully! (Demo Mode)");
  };

  const handlePreview = () => {
    alert("Demo: Would open email preview window");
  };

  const handleSendTest = () => {
    alert("Demo: Would send test email to your address");
  };

  const canSave = formData.name.trim() && formData.subject.trim() && formData.htmlContent.trim();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href={`/dashboard/campaigns/${campaignId}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Campaign
            </Link>
          </Button>
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-900">Edit Campaign</h1>
              <Badge variant="outline" className="bg-gray-100 text-gray-800">
                Draft
              </Badge>
            </div>
            <p className="text-gray-600">Modify campaign details and content</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={handlePreview}>
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button variant="outline" onClick={handleSendTest}>
            <Mail className="h-4 w-4 mr-2" />
            Send Test
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      {/* Unsaved Changes Warning */}
      {hasUnsavedChanges && (
        <Alert className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            You have unsaved changes. Don&apos;t forget to save before leaving this page.
          </AlertDescription>
        </Alert>
      )}

      {/* Form Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic" className="flex items-center space-x-2">
            <Mail className="h-4 w-4" />
            <span>Basic Info</span>
          </TabsTrigger>
          <TabsTrigger value="content" className="flex items-center space-x-2">
            <Mail className="h-4 w-4" />
            <span>Content</span>
          </TabsTrigger>
          <TabsTrigger value="recipients" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Recipients</span>
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Settings</span>
          </TabsTrigger>
        </TabsList>

        {/* Basic Information Tab */}
        <TabsContent value="basic" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Campaign Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Campaign Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter campaign name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description", e.target.value)}
                    placeholder="Brief description of this campaign"
                    rows={3}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: "low" | "medium" | "high") =>
                      handleInputChange("priority", value)
                    }
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Email Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="subject">Subject Line</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => handleInputChange("subject", e.target.value)}
                    placeholder="Enter email subject line"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="fromName">From Name</Label>
                  <Input
                    id="fromName"
                    value={formData.fromName}
                    onChange={(e) => handleInputChange("fromName", e.target.value)}
                    placeholder="Sender name"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="fromAddress">From Address</Label>
                  <Input
                    id="fromAddress"
                    value={formData.fromAddress}
                    onChange={(e) => handleInputChange("fromAddress", e.target.value)}
                    placeholder="sender@company.com"
                    type="email"
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="replyTo">Reply To Address</Label>
                  <Input
                    id="replyTo"
                    value={formData.replyToAddress}
                    onChange={(e) => handleInputChange("replyToAddress", e.target.value)}
                    placeholder="support@company.com"
                    type="email"
                    className="mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>HTML Content</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.htmlContent}
                  onChange={(e) => handleInputChange("htmlContent", e.target.value)}
                  placeholder="Enter HTML email content"
                  rows={20}
                  className="font-mono text-sm"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Plain Text Content</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={formData.plainTextContent}
                  onChange={(e) => handleInputChange("plainTextContent", e.target.value)}
                  placeholder="Enter plain text version"
                  rows={20}
                  className="font-mono text-sm"
                />
              </CardContent>
            </Card>
          </div>

          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Always provide both HTML and plain text versions for better email client compatibility.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Recipients Tab */}
        <TabsContent value="recipients">
          <Card>
            <CardHeader>
              <CardTitle>Recipient Lists</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Recipient Management Coming Soon
                </h3>
                <p className="text-gray-500 mb-6">
                  Recipient list selection and management will be available in the next update.
                </p>
                <div className="space-y-2 text-left max-w-md mx-auto">
                  <p className="text-sm text-gray-600"><strong>Current List:</strong> Main Subscribers (5,200 recipients)</p>
                  <p className="text-sm text-gray-600"><strong>Status:</strong> Active</p>
                  <p className="text-sm text-gray-600"><strong>Last Updated:</strong> 2 hours ago</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label htmlFor="scheduledSendTime">Schedule Send Time (Optional)</Label>
                <Input
                  id="scheduledSendTime"
                  type="datetime-local"
                  value={formData.scheduledSendTime}
                  onChange={(e) => handleInputChange("scheduledSendTime", e.target.value)}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Leave empty to send immediately when campaign is activated
                </p>
              </div>

              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-3">Custom Headers</h4>
                <div className="space-y-2">
                  {originalCampaign.customHeaders.map((header, index) => (
                    <div key={index} className="flex justify-between items-center text-sm bg-white p-2 rounded border">
                      <span className="font-medium">{header.name}:</span>
                      <span className="text-gray-600">{header.value}</span>
                    </div>
                  ))}
                </div>
                <Button variant="outline" size="sm" className="mt-3" disabled>
                  Add Header (Coming Soon)
                </Button>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Changes to advanced settings may require campaign approval before sending.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Bottom Actions */}
      <div className="flex justify-between items-center pt-6 border-t">
        <div className="text-sm text-gray-500">
          {hasUnsavedChanges ? "You have unsaved changes" : "All changes saved"}
        </div>
        
        <div className="flex items-center space-x-3">
          <Button variant="outline" asChild>
            <Link href={`/dashboard/campaigns/${campaignId}`}>
              Cancel
            </Link>
          </Button>
          <Button onClick={handleSave} disabled={!canSave}>
            <Save className="h-4 w-4 mr-2" />
            Save Campaign
          </Button>
          <Button 
            className="bg-green-600 hover:bg-green-700" 
            disabled={!canSave}
            onClick={() => alert("Demo: Would activate campaign for sending")}
          >
            <Send className="h-4 w-4 mr-2" />
            Save & Send
          </Button>
        </div>
      </div>
    </div>
  );
}