"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks";
import { SignOutButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { 
  User, 
  LogOut,
  Shield,
  Mail,
  Settings,
  Key,
  Activity,
  Edit3,
  Save,
  Camera,
  Phone,
  Globe
} from "lucide-react";

export default function Users() {
  const { isLoading, isAuthenticated } = useAuth();
  const { user: clerkUser } = useUser();
  const [activeSection, setActiveSection] = useState<"profile" | "security" | "activity">("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: clerkUser?.firstName || "",
    lastName: clerkUser?.lastName || "",
    email: clerkUser?.emailAddresses[0]?.emailAddress || "",
    phone: clerkUser?.phoneNumbers[0]?.phoneNumber || "",
  });

  if (isLoading) {
    return (
      <div className="flex h-full bg-black items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-neutral-400">Loading your account...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-full bg-black items-center justify-center">
        <div className="text-center max-w-md">
          <User className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Sign in to continue</h2>
          <p className="text-sm text-neutral-400 mb-6">
            Access your account settings and manage your SMNB profile
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-black">
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-8 space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-white flex items-center gap-3">
                <User className="w-6 h-6 text-cyan-400" />
                My Account
              </h1>
              <p className="text-neutral-400">Manage your profile, security, and account preferences.</p>
            </div>
            <SignOutButton>
              <Button variant="outline" className="bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </SignOutButton>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-neutral-900/50 rounded-lg p-1 border border-neutral-800 w-fit">
            <button
              onClick={() => setActiveSection("profile")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                activeSection === "profile" 
                  ? "bg-cyan-400/20 text-cyan-400" 
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Edit3 className="w-3 h-3" />
              Profile
            </button>
            <button
              onClick={() => setActiveSection("security")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                activeSection === "security" 
                  ? "bg-cyan-400/20 text-cyan-400" 
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Shield className="w-3 h-3" />
              Security
            </button>
            <button
              onClick={() => setActiveSection("activity")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${
                activeSection === "activity" 
                  ? "bg-cyan-400/20 text-cyan-400" 
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Activity className="w-3 h-3" />
              Activity
            </button>
          </div>

          {/* Content Sections */}
          {activeSection === "profile" && (
            <div className="bg-neutral-900/30 rounded-lg border border-neutral-800 p-8">
              <div className="max-w-4xl space-y-8">
                {/* Profile Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-medium text-white mb-2">Profile Information</h3>
                    <p className="text-neutral-400">Manage your personal information and preferences.</p>
                  </div>
                  <Button 
                    onClick={() => setIsEditing(!isEditing)}
                    variant="outline" 
                    className="bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700"
                  >
                    <Edit3 className="w-4 h-4 mr-2" />
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </Button>
                </div>

                {/* Profile Picture Section */}
                <div className="bg-neutral-900/50 rounded-lg p-6 border border-neutral-800">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-cyan-400/10 border-2 border-cyan-400/30 flex items-center justify-center">
                        {clerkUser?.imageUrl ? (
                          <Image 
                            src={clerkUser.imageUrl} 
                            alt="Profile" 
                            width={80}
                            height={80}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <User className="w-8 h-8 text-cyan-400" />
                        )}
                      </div>
                      {isEditing && (
                        <button 
                          title="Change profile picture"
                          className="absolute -bottom-1 -right-1 w-6 h-6 bg-cyan-400 rounded-full flex items-center justify-center hover:bg-cyan-500 transition-colors"
                        >
                          <Camera className="w-3 h-3 text-black" />
                        </button>
                      )}
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-white mb-1">
                        {clerkUser?.fullName || "User"}
                      </h4>
                      <p className="text-sm text-neutral-400 mb-1">
                        {clerkUser?.emailAddresses[0]?.emailAddress}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-neutral-500">
                        <span>Member since {new Date(clerkUser?.createdAt || Date.now()).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1">
                          <div className={`w-2 h-2 rounded-full ${
                            clerkUser?.emailAddresses[0]?.verification?.status === "verified" 
                              ? "bg-green-400" 
                              : "bg-yellow-400"
                          }`}></div>
                          {clerkUser?.emailAddresses[0]?.verification?.status === "verified" ? "Verified" : "Unverified"}
                        </span>
                        <span>Last active: Just now</span>
                      </div>
                      {isEditing && (
                        <Button size="sm" className="bg-cyan-400 hover:bg-cyan-500 text-black">
                          Upload New Photo
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="bg-neutral-900/50 rounded-lg p-6 border border-neutral-800">
                  <h4 className="text-lg font-medium text-white mb-4">Basic Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        First Name
                      </label>
                      {isEditing ? (
                        <Input
                          value={profileData.firstName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                          className="bg-neutral-800 border-neutral-700 text-white"
                        />
                      ) : (
                        <div className="p-3 bg-neutral-800 border border-neutral-700 rounded-md text-white">
                          {clerkUser?.firstName || "Not set"}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        Last Name
                      </label>
                      {isEditing ? (
                        <Input
                          value={profileData.lastName}
                          onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                          className="bg-neutral-800 border-neutral-700 text-white"
                        />
                      ) : (
                        <div className="p-3 bg-neutral-800 border border-neutral-700 rounded-md text-white">
                          {clerkUser?.lastName || "Not set"}
                        </div>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        <Mail className="w-4 h-4 inline mr-1" />
                        Email Address
                      </label>
                      <div className="p-3 bg-neutral-800 border border-neutral-700 rounded-md text-white">
                        {clerkUser?.emailAddresses[0]?.emailAddress || "Not set"}
                        <span className="ml-2 text-xs text-green-400">
                          {clerkUser?.emailAddresses[0]?.verification?.status === "verified" ? "Verified" : "Unverified"}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">
                        <Phone className="w-4 h-4 inline mr-1" />
                        Phone Number
                      </label>
                      {isEditing ? (
                        <Input
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                          className="bg-neutral-800 border-neutral-700 text-white"
                          placeholder="Add phone number"
                        />
                      ) : (
                        <div className="p-3 bg-neutral-800 border border-neutral-700 rounded-md text-white">
                          {clerkUser?.phoneNumbers[0]?.phoneNumber || "Not added"}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {isEditing && (
                    <div className="flex gap-3 mt-6">
                      <Button className="bg-cyan-400 hover:bg-cyan-500 text-black">
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                        className="bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}
                </div>

                {/* Account Settings */}
                <div className="bg-neutral-900/50 rounded-lg p-6 border border-neutral-800">
                  <h4 className="text-lg font-medium text-white mb-4">Account Settings</h4>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-lg border border-neutral-700">
                      <div className="flex items-center gap-3">
                        <Globe className="w-5 h-5 text-cyan-400" />
                        <div>
                          <p className="text-sm font-medium text-white">Language & Region</p>
                          <p className="text-xs text-neutral-400">English (US)</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="bg-neutral-700 border-neutral-600 text-neutral-300">
                        Change
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 bg-neutral-800/50 rounded-lg border border-neutral-700">
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-cyan-400" />
                        <div>
                          <p className="text-sm font-medium text-white">Email Preferences</p>
                          <p className="text-xs text-neutral-400">Manage notification settings</p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" className="bg-neutral-700 border-neutral-600 text-neutral-300">
                        Configure
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "security" && (
            <div className="bg-neutral-900/30 rounded-lg border border-neutral-800 p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Security Settings</h3>
                  <p className="text-neutral-400">Manage your account security and authentication methods.</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-800">
                    <div className="flex items-center gap-3 mb-3">
                      <Key className="w-5 h-5 text-cyan-400" />
                      <h4 className="font-medium text-white">Password</h4>
                    </div>
                    <p className="text-sm text-neutral-400 mb-3">Last changed 30 days ago</p>
                    <Button size="sm" className="bg-cyan-400 hover:bg-cyan-500 text-black">
                      Change Password
                    </Button>
                  </div>
                  
                  <div className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-800">
                    <div className="flex items-center gap-3 mb-3">
                      <Shield className="w-5 h-5 text-green-400" />
                      <h4 className="font-medium text-white">Two-Factor Auth</h4>
                    </div>
                    <p className="text-sm text-neutral-400 mb-3">Not enabled</p>
                    <Button size="sm" variant="outline" className="bg-neutral-800 border-neutral-700 text-neutral-300">
                      Enable 2FA
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === "activity" && (
            <div className="bg-neutral-900/30 rounded-lg border border-neutral-800 p-8">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-2">Account Activity</h3>
                  <p className="text-neutral-400">Recent activity and session history for your account.</p>
                </div>
                
                <div className="space-y-4">
                  <div className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-400/10 border border-green-400/30 flex items-center justify-center">
                          <Activity className="w-4 h-4 text-green-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">Signed in</p>
                          <p className="text-xs text-neutral-400">Current session</p>
                        </div>
                      </div>
                      <span className="text-xs text-neutral-500">Just now</span>
                    </div>
                  </div>
                  
                  <div className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-800">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-cyan-400/10 border border-cyan-400/30 flex items-center justify-center">
                          <Settings className="w-4 h-4 text-cyan-400" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">Profile updated</p>
                          <p className="text-xs text-neutral-400">Account information changed</p>
                        </div>
                      </div>
                      <span className="text-xs text-neutral-500">2 hours ago</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
