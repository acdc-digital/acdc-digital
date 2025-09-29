"use client";

import { useState } from "react";
import { useAuth } from "@/lib/hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Settings as SettingsIcon, 
  Palette, 
  Shield, 
  Bell, 
  Database,
  Key,
  Monitor
} from "lucide-react";

export default function Settings() {
  const { isLoading, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  if (isLoading) {
    return (
      <div className="flex h-full bg-black items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-sm text-neutral-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex h-full bg-black items-center justify-center">
        <div className="text-center">
          <SettingsIcon className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Authentication Required</h2>
          <p className="text-sm text-neutral-400">Please sign in to access settings.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-black">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8 space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-white flex items-center gap-3">
              <SettingsIcon className="w-6 h-6 text-cyan-400" />
              Settings
            </h1>
            <p className="text-neutral-400">Configure your SMNB experience and preferences.</p>
          </div>

          {/* General Settings */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Monitor className="w-5 h-5 text-neutral-400" />
              <h2 className="text-lg font-medium text-white">General</h2>
            </div>
            
            <div className="space-y-4 ml-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="workspace-name" className="text-neutral-300">Workspace Name</Label>
                  <Input 
                    id="workspace-name"
                    defaultValue="My SMNB Workspace"
                    className="bg-neutral-900 border-neutral-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default-model" className="text-neutral-300">Default AI Model</Label>
                  <Select defaultValue="claude-3-sonnet">
                    <SelectTrigger className="bg-neutral-900 border-neutral-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-700">
                      <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                      <SelectItem value="gpt-4">GPT-4</SelectItem>
                      <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-neutral-300">Auto-save Sessions</Label>
                  <p className="text-sm text-neutral-500">Automatically save session changes</p>
                </div>
                <Switch checked={autoSave} onCheckedChange={setAutoSave} />
              </div>
            </div>
          </div>

          <div className="h-px bg-neutral-800" />

          {/* Appearance */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Palette className="w-5 h-5 text-neutral-400" />
              <h2 className="text-lg font-medium text-white">Appearance</h2>
            </div>
            
            <div className="space-y-4 ml-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-neutral-300">Dark Mode</Label>
                  <p className="text-sm text-neutral-500">Use dark theme interface</p>
                </div>
                <Switch checked={darkMode} onCheckedChange={setDarkMode} />
              </div>
              
              <div className="space-y-2">
                <Label className="text-neutral-300">Theme</Label>
                <Select defaultValue="dark">
                  <SelectTrigger className="w-48 bg-neutral-900 border-neutral-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-neutral-700">
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="auto">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="h-px bg-neutral-800" />

          {/* Notifications */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-neutral-400" />
              <h2 className="text-lg font-medium text-white">Notifications</h2>
            </div>
            
            <div className="space-y-4 ml-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-neutral-300">Push Notifications</Label>
                  <p className="text-sm text-neutral-500">Receive notifications for session updates</p>
                </div>
                <Switch checked={notifications} onCheckedChange={setNotifications} />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-neutral-300">Email Notifications</Label>
                  <p className="text-sm text-neutral-500">Receive email updates for important events</p>
                </div>
                <Switch defaultChecked={false} />
              </div>
            </div>
          </div>

          <div className="h-px bg-neutral-800" />

          {/* API Keys */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Key className="w-5 h-5 text-neutral-400" />
              <h2 className="text-lg font-medium text-white">API Keys</h2>
            </div>
            
            <div className="space-y-4 ml-8">
              <div className="space-y-2">
                <Label htmlFor="openai-key" className="text-neutral-300">OpenAI API Key</Label>
                <Input 
                  id="openai-key"
                  type="password"
                  placeholder="sk-..."
                  className="bg-neutral-900 border-neutral-700 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="anthropic-key" className="text-neutral-300">Anthropic API Key</Label>
                <Input 
                  id="anthropic-key"
                  type="password"
                  placeholder="sk-ant-..."
                  className="bg-neutral-900 border-neutral-700 text-white"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-neutral-800" />

          {/* Data & Privacy */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-neutral-400" />
              <h2 className="text-lg font-medium text-white">Data & Privacy</h2>
            </div>
            
            <div className="space-y-4 ml-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-neutral-300">Analytics</Label>
                  <p className="text-sm text-neutral-500">Help improve SMNB by sharing usage data</p>
                </div>
                <Switch defaultChecked={true} />
              </div>
              
              <div className="space-y-2">
                <Button variant="outline" className="bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800">
                  <Database className="w-4 h-4 mr-2" />
                  Export Data
                </Button>
              </div>
            </div>
          </div>

          {/* Save Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-neutral-800">
            <Button variant="outline" className="bg-neutral-900 border-neutral-700 text-neutral-300 hover:bg-neutral-800">
              Reset to Defaults
            </Button>
            <Button className="bg-cyan-400 hover:bg-cyan-500 text-black">
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
