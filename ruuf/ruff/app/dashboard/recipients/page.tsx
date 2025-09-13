"use client";

import { Authenticated } from "convex/react";
import DashboardLayout from "@/app/dashboard/_components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
// import Link from "next/link"; // Not used in this component
import { 
  Plus, 
  Search, 
  Users, 
  Mail,
  Download,
  Upload,
  Filter,
  MoreVertical,
  Trash2,
  Edit,
  UserPlus
} from "lucide-react";

// Mock recipient lists data
const mockRecipientLists = [
  {
    _id: "list-1",
    name: "Main Subscribers",
    description: "Primary subscriber list from website signups",
    totalRecipients: 5200,
    activeRecipients: 4850,
    createdAt: Date.now() - 86400000 * 30, // 30 days ago
    lastUpdated: Date.now() - 3600000 * 2, // 2 hours ago
    status: "active" as const,
  },
  {
    _id: "list-2", 
    name: "VIP Customers",
    description: "High-value customers and enterprise clients",
    totalRecipients: 320,
    activeRecipients: 318,
    createdAt: Date.now() - 86400000 * 90, // 90 days ago
    lastUpdated: Date.now() - 86400000, // 1 day ago
    status: "active" as const,
  },
  {
    _id: "list-3",
    name: "Newsletter Subscribers",
    description: "Weekly newsletter subscription list", 
    totalRecipients: 2800,
    activeRecipients: 2650,
    createdAt: Date.now() - 86400000 * 60, // 60 days ago
    lastUpdated: Date.now() - 86400000 * 3, // 3 days ago
    status: "active" as const,
  },
];

// Mock individual recipients for a list
const mockRecipients = [
  {
    _id: "recipient-1",
    email: "john.doe@example.com",
    firstName: "John",
    lastName: "Doe",
    status: "active" as const,
    subscribedAt: Date.now() - 86400000 * 15,
    lastActivity: Date.now() - 86400000 * 2,
    tags: ["customer", "enterprise"],
  },
  {
    _id: "recipient-2",
    email: "jane.smith@company.com", 
    firstName: "Jane",
    lastName: "Smith",
    status: "active" as const,
    subscribedAt: Date.now() - 86400000 * 45,
    lastActivity: Date.now() - 86400000 * 1,
    tags: ["newsletter", "vip"],
  },
  {
    _id: "recipient-3",
    email: "bob.wilson@startup.io",
    firstName: "Bob",
    lastName: "Wilson", 
    status: "bounced" as const,
    subscribedAt: Date.now() - 86400000 * 120,
    lastActivity: Date.now() - 86400000 * 30,
    tags: ["trial"],
  },
];

export default function RecipientsPage() {
  return (
    <DashboardLayout>
      <Authenticated>
        <RecipientsContent />
      </Authenticated>
    </DashboardLayout>
  );
}

function RecipientsContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("lists");

  const filteredLists = mockRecipientLists.filter(list =>
    list.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    list.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    const colors = {
      active: "bg-green-100 text-green-800",
      bounced: "bg-red-100 text-red-800", 
      unsubscribed: "bg-gray-100 text-gray-800",
      inactive: "bg-yellow-100 text-yellow-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recipient Management</h1>
          <p className="text-gray-600 mt-2">
            Manage your email recipient lists and subscriber data
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New List
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search lists and recipients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="lists">Recipient Lists</TabsTrigger>
          <TabsTrigger value="recipients">Individual Recipients</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Recipient Lists Tab */}
        <TabsContent value="lists" className="space-y-6">
          {filteredLists.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredLists.map((list) => (
                <Card key={list._id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{list.name}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{list.description}</p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span>Total Recipients</span>
                      </div>
                      <span className="font-semibold">{list.totalRecipients.toLocaleString()}</span>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-green-600" />
                        <span>Active Recipients</span>
                      </div>
                      <span className="font-semibold text-green-600">{list.activeRecipients.toLocaleString()}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Last Updated</span>
                      <span>{new Date(list.lastUpdated).toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center space-x-2 pt-2 border-t">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => {
                          setSelectedList(list._id);
                          setActiveTab("recipients");
                        }}
                      >
                        <Users className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Export
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No recipient lists found</h3>
                <p className="text-gray-500 mb-6">Create your first recipient list to start sending campaigns</p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create List
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Individual Recipients Tab */}
        <TabsContent value="recipients" className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold">Recipients</h2>
              {selectedList && (
                <Badge variant="outline">
                  {mockRecipientLists.find(l => l._id === selectedList)?.name || "All Lists"}
                </Badge>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm">
                <UserPlus className="h-4 w-4 mr-2" />
                Add Recipient
              </Button>
            </div>
          </div>

          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tags</TableHead>
                  <TableHead>Subscribed</TableHead>
                  <TableHead>Last Activity</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockRecipients.map((recipient) => (
                  <TableRow key={recipient._id}>
                    <TableCell className="font-medium">
                      {recipient.firstName} {recipient.lastName}
                    </TableCell>
                    <TableCell>{recipient.email}</TableCell>
                    <TableCell>
                      <Badge className={getStatusBadge(recipient.status)}>
                        {recipient.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {recipient.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(recipient.subscribedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(recipient.lastActivity).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Total Recipients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {mockRecipientLists.reduce((sum, list) => sum + list.totalRecipients, 0).toLocaleString()}
                </div>
                <p className="text-sm text-gray-600 mt-1">Across all lists</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Active Recipients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {mockRecipientLists.reduce((sum, list) => sum + list.activeRecipients, 0).toLocaleString()}
                </div>
                <p className="text-sm text-gray-600 mt-1">Ready to receive emails</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>List Growth Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">+12.3%</div>
                <p className="text-sm text-gray-600 mt-1">Last 30 days</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recipient Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  📊
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Advanced Analytics Coming Soon
                </h3>
                <p className="text-gray-500">
                  Detailed recipient analytics, engagement metrics, and growth tracking will be available soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}