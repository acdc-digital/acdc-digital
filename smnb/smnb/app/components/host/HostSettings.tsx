// HOST SETTINGS
// /Users/matthewsimon/Projects/SMNB/smnb/components/host/HostSettings.tsx

/**
 * Host Settings Component
 * 
 * Configuration panel for host agent parameters and instructions.
 * Allows adjustment of personality, verbosity, timing, and other settings.
 */

'use client';

import React from 'react';
import { useHostAgentStore } from '@/lib/stores/host/hostAgentStore';
import { 
  HOST_PERSONALITIES, 
  VERBOSITY_LEVELS, 
  HostAgentConfig 
} from '@/lib/types/hostAgent';
import { Card } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Select } from '@/app/components/ui/select';
import { Switch } from '@/app/components/ui/switch';
import { Label } from '@/app/components/ui/label';
import { Input } from '@/app/components/ui/input';

interface HostSettingsProps {
  className?: string;
}

export const HostSettings: React.FC<HostSettingsProps> = ({ className = '' }) => {
  const { config, updateConfig, isActive } = useHostAgentStore();

  const handleConfigUpdate = (updates: Partial<HostAgentConfig>) => {
    updateConfig(updates);
  };

  const handlePersonalityChange = (personality: HostAgentConfig['personality']) => {
    handleConfigUpdate({ personality });
  };

  const handleVerbosityChange = (verbosity: HostAgentConfig['verbosity']) => {
    handleConfigUpdate({ verbosity });
  };

  const handleFrequencyChange = (frequency: string) => {
    const value = parseInt(frequency);
    if (!isNaN(value) && value > 0) {
      handleConfigUpdate({ updateFrequency: value * 1000 }); // Convert to milliseconds
    }
  };

  const handleContextWindowChange = (window: string) => {
    const value = parseInt(window);
    if (!isNaN(value) && value > 0) {
      handleConfigUpdate({ contextWindow: value });
    }
  };

  const handleWaterfallSpeedChange = (speed: string) => {
    const value = parseInt(speed);
    if (!isNaN(value) && value > 0) {
      handleConfigUpdate({ waterfallSpeed: value });
    }
  };

  const handleMockModeToggle = (enabled: boolean) => {
    handleConfigUpdate({ enableMockMode: enabled });
  };

  return (
    <div className={`flex flex-col h-full p-4 space-y-6 overflow-y-auto ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Host Agent Settings</h2>
        {isActive && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500"></div>
            <span className="text-xs text-orange-500 font-medium">Live</span>
          </div>
        )}
      </div>

      {/* Personality Settings */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Personality</Label>
            <span className="text-xs text-muted-foreground">
              {HOST_PERSONALITIES[config.personality].style}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(HOST_PERSONALITIES).map(([key, persona]) => (
              <Button
                key={key}
                variant={config.personality === key ? "default" : "outline"}
                size="sm"
                onClick={() => handlePersonalityChange(key as HostAgentConfig['personality'])}
                className="text-xs"
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Button>
            ))}
          </div>
          
          <p className="text-xs text-muted-foreground leading-relaxed">
            {HOST_PERSONALITIES[config.personality].systemPrompt}
          </p>
        </div>
      </Card>

      {/* Verbosity Settings */}
      <Card className="p-4">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Verbosity</Label>
            <span className="text-xs text-muted-foreground">
              {VERBOSITY_LEVELS[config.verbosity].targetLength}
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(VERBOSITY_LEVELS).map(([key, level]) => (
              <Button
                key={key}
                variant={config.verbosity === key ? "default" : "outline"}
                size="sm"
                onClick={() => handleVerbosityChange(key as HostAgentConfig['verbosity'])}
                className="text-xs"
              >
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </Button>
            ))}
          </div>
          
          <p className="text-xs text-muted-foreground">
            {VERBOSITY_LEVELS[config.verbosity].description} • Max {VERBOSITY_LEVELS[config.verbosity].maxTokens} tokens
          </p>
        </div>
      </Card>

      {/* Timing Settings */}
      <Card className="p-4">
        <div className="space-y-4">
          <Label className="text-sm font-medium">Timing & Performance</Label>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Update Frequency (seconds)</Label>
              <Input
                type="number"
                min="1"
                max="60"
                value={Math.round(config.updateFrequency / 1000)}
                onChange={(e) => handleFrequencyChange(e.target.value)}
                className="w-16 h-7 text-xs"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Context Window</Label>
              <Input
                type="number"
                min="1"
                max="20"
                value={config.contextWindow}
                onChange={(e) => handleContextWindowChange(e.target.value)}
                className="w-16 h-7 text-xs"
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label className="text-xs text-muted-foreground">Display Speed (chars/sec)</Label>
              <Input
                type="number"
                min="5"
                max="50"
                value={config.waterfallSpeed}
                onChange={(e) => handleWaterfallSpeedChange(e.target.value)}
                className="w-16 h-7 text-xs"
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Development Settings */}
      <Card className="p-4">
        <div className="space-y-4">
          <Label className="text-sm font-medium">Development</Label>
          
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Mock Mode</Label>
              <p className="text-xs text-muted-foreground">
                Use simulated responses without API calls
              </p>
            </div>
            <Switch
              checked={config.enableMockMode || false}
              onCheckedChange={handleMockModeToggle}
            />
          </div>
        </div>
      </Card>

      {/* Instructions */}
      <Card className="p-4">
        <div className="space-y-3">
          <Label className="text-sm font-medium">Instructions</Label>
          <div className="space-y-2 text-xs text-muted-foreground leading-relaxed">
            <p>• <strong>Personality</strong> affects the tone and style of generated narrations</p>
            <p>• <strong>Verbosity</strong> controls the length and detail level of responses</p>
            <p>• <strong>Update Frequency</strong> sets how often new stories are processed</p>
            <p>• <strong>Context Window</strong> determines how many previous items influence new narrations</p>
            <p>• <strong>Display Speed</strong> controls how quickly text appears in the waterfall</p>
            <p>• Changes take effect immediately for new narrations</p>
            <p>• Mock mode is useful for testing without consuming API tokens</p>
          </div>
        </div>
      </Card>

      {/* Status Information */}
      <Card className="p-4 bg-muted/30">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Current Configuration</Label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Personality:</span>
              <span className="ml-1 font-medium">{config.personality}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Verbosity:</span>
              <span className="ml-1 font-medium">{config.verbosity}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Frequency:</span>
              <span className="ml-1 font-medium">{config.updateFrequency / 1000}s</span>
            </div>
            <div>
              <span className="text-muted-foreground">Mock Mode:</span>
              <span className="ml-1 font-medium">{config.enableMockMode ? 'On' : 'Off'}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default HostSettings;