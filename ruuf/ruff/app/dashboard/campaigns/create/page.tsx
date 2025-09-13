"use client";

import { Authenticated } from "convex/react";
import DashboardLayout from "@/app/dashboard/_components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { ArrowLeft, Save, Send } from "lucide-react";
import Link from "next/link";

export default function CreateCampaignPage() {
  return (
    <DashboardLayout>
      <Authenticated>
        <CreateCampaignContent />
      </Authenticated>
    </DashboardLayout>
  );
}

function CreateCampaignContent() {
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    content: "",
    recipientListId: "",
    priority: "medium" as "low" | "medium" | "high",
    scheduledSendTime: "",
  });

  const handleSubmit = async () => {
    console.log("Demo: Would create campaign with data:", formData);
    alert("Demo Mode: Campaign creation requires recipient lists to be implemented first. This is a UI demonstration.");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" asChild>
          <Link href="/dashboard/campaigns">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Campaigns
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Campaign</h1>
          <p className="text-gray-600 mt-1">Set up your email campaign details</p>
        </div>
      </div>

      {/* Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Campaign Name */}
              <div>
                <Label htmlFor="name">Campaign Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter campaign name"
                  className="mt-1"
                />
              </div>

              {/* Subject Line */}
              <div>
                <Label htmlFor="subject">Subject Line</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="Enter email subject line"
                  className="mt-1"
                />
              </div>

              {/* Email Content */}
              <div>
                <Label htmlFor="content">Email Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Write your email content here..."
                  rows={12}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Priority */}
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value: "low" | "medium" | "high") =>
                    setFormData({ ...formData, priority: value })
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

              {/* Schedule */}
              <div>
                <Label htmlFor="scheduledSendTime">Schedule Send Time (Optional)</Label>
                <Input
                  id="scheduledSendTime"
                  type="datetime-local"
                  value={formData.scheduledSendTime}
                  onChange={(e) => setFormData({ ...formData, scheduledSendTime: e.target.value })}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-gray-500 mb-4">
                Note: This demo creates campaigns without recipient lists. 
                In production, you would select from existing recipient lists.
              </p>

              <Button
                onClick={handleSubmit}
                disabled={!formData.name.trim()}
                className="w-full"
                variant="outline"
              >
                <Save className="h-4 w-4 mr-2" />
                Save as Draft (Demo)
              </Button>

              <Button
                disabled={true}
                className="w-full"
                variant="outline"
              >
                <Send className="h-4 w-4 mr-2" />
                Send Campaign (Requires Recipients)
              </Button>

              <p className="text-sm text-gray-500 text-center">
                You can always edit and test your campaign before sending
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}