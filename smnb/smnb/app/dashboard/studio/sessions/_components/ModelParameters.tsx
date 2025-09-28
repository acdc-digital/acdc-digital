// MODEL PARAMETERS - AI model configuration controls
// /Users/matthewsimon/Projects/SMNB/smnb/app/dashboard/studio/sessions/_components/ModelParameters.tsx

"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Info, Sparkles, Brain, Gauge } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModelParametersProps {
  sessionId: Id<"sessions">;
  settings: {
    model: string;
    temperature: number;
    maxTokens: number;
    topP: number;
    frequencyPenalty: number;
    presencePenalty: number;
    controlMode: "hands-free" | "balanced" | "full-control";
  };
}

export function ModelParameters({ sessionId, settings }: ModelParametersProps) {
  const [localSettings, setLocalSettings] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);
  const updateSettings = useMutation(api.sessions.updateSettings);

  const handleChange = (key: string, value: any) => {
    setLocalSettings({ ...localSettings, [key]: value });
    setHasChanges(true);
  };

  const handleSave = async () => {
    await updateSettings({
      id: sessionId,
      settings: localSettings,
    });
    setHasChanges(false);
  };

  const controlModes = [
    {
      value: "hands-free",
      label: "Hands-Free",
      description: "AI manages all parameters automatically",
      icon: Sparkles,
      color: "text-green-400",
      bgColor: "bg-green-400/10",
      borderColor: "border-green-400/30",
    },
    {
      value: "balanced",
      label: "Balanced",
      description: "Preset configurations with minor adjustments",
      icon: Brain,
      color: "text-cyan-400",
      bgColor: "bg-cyan-400/10",
      borderColor: "border-cyan-400/30",
    },
    {
      value: "full-control",
      label: "Full Control",
      description: "Complete control over all parameters",
      icon: Gauge,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
      borderColor: "border-purple-400/30",
    },
  ];

  const isDisabled = localSettings.controlMode === "hands-free";
  const isLimited = localSettings.controlMode === "balanced";

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      {/* Control Mode Selection */}
      <div className="space-y-4">
        <Label className="text-white text-base font-semibold">Control Mode</Label>
        <div className="grid grid-cols-1 gap-3">
          {controlModes.map((mode) => {
            const Icon = mode.icon;
            const isSelected = localSettings.controlMode === mode.value;
            
            return (
              <Card 
                key={mode.value} 
                onClick={() => handleChange("controlMode", mode.value)}
                className={cn(
                  "p-4 cursor-pointer transition-all border-2",
                  "bg-neutral-900/50 hover:bg-neutral-900",
                  isSelected ? `${mode.bgColor} ${mode.borderColor}` : "border-neutral-800"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn("w-5 h-5", mode.color)} />
                  <div>
                    <h3 className={cn("font-medium", isSelected ? mode.color : "text-white")}>
                      {mode.label}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1">
                      {mode.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Model Selection */}
      <div className="space-y-2">
        <Label className="text-neutral-200">Model</Label>
        <Select 
          value={localSettings.model} 
          onValueChange={(value) => handleChange("model", value)}
          disabled={isDisabled}
        >
          <SelectTrigger className="bg-neutral-900 border-neutral-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-neutral-900 border-neutral-700">
            <SelectItem value="gpt-4" className="text-white">GPT-4</SelectItem>
            <SelectItem value="gpt-4-turbo" className="text-white">GPT-4 Turbo</SelectItem>
            <SelectItem value="gpt-3.5-turbo" className="text-white">GPT-3.5 Turbo</SelectItem>
            <SelectItem value="claude-3-opus" className="text-white">Claude 3 Opus</SelectItem>
            <SelectItem value="claude-3-sonnet" className="text-white">Claude 3 Sonnet</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Parameter Controls */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-neutral-200">Temperature</Label>
            <span className="text-sm text-cyan-400 font-mono">{localSettings.temperature}</span>
          </div>
          <input
            type="range"
            min={0}
            max={2}
            step={0.1}
            value={localSettings.temperature}
            onChange={(e) => handleChange("temperature", parseFloat(e.target.value))}
            disabled={isDisabled}
            className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer slider"
          />
          <p className="text-xs text-neutral-500">Controls randomness in responses</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-neutral-200">Max Tokens</Label>
            <span className="text-sm text-cyan-400 font-mono">{localSettings.maxTokens}</span>
          </div>
          <input
            type="range"
            min={256}
            max={4096}
            step={256}
            value={localSettings.maxTokens}
            onChange={(e) => handleChange("maxTokens", parseInt(e.target.value))}
            disabled={isDisabled || isLimited}
            className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer slider"
          />
          <p className="text-xs text-neutral-500">Maximum length of response</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-neutral-200">Top P</Label>
            <span className="text-sm text-cyan-400 font-mono">{localSettings.topP}</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={localSettings.topP}
            onChange={(e) => handleChange("topP", parseFloat(e.target.value))}
            disabled={isDisabled || isLimited}
            className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer slider"
          />
          <p className="text-xs text-neutral-500">Nucleus sampling threshold</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-neutral-200">Frequency Penalty</Label>
            <span className="text-sm text-cyan-400 font-mono">{localSettings.frequencyPenalty}</span>
          </div>
          <input
            type="range"
            min={-2}
            max={2}
            step={0.1}
            value={localSettings.frequencyPenalty}
            onChange={(e) => handleChange("frequencyPenalty", parseFloat(e.target.value))}
            disabled={isDisabled || isLimited}
            className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer slider"
          />
          <p className="text-xs text-neutral-500">Reduces repetition of tokens</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-neutral-200">Presence Penalty</Label>
            <span className="text-sm text-cyan-400 font-mono">{localSettings.presencePenalty}</span>
          </div>
          <input
            type="range"
            min={-2}
            max={2}
            step={0.1}
            value={localSettings.presencePenalty}
            onChange={(e) => handleChange("presencePenalty", parseFloat(e.target.value))}
            disabled={isDisabled || isLimited}
            className="w-full h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer slider"
          />
          <p className="text-xs text-neutral-500">Encourages new topics</p>
        </div>
      </div>

      {/* Info Banner */}
      {isDisabled && (
        <div className="flex items-start gap-3 p-4 bg-green-400/5 border border-green-400/20 rounded-lg">
          <Info className="w-4 h-4 text-green-400 mt-0.5" />
          <div className="text-sm text-neutral-300">
            <p className="font-medium mb-1">Hands-Free Mode Active</p>
            <p className="text-xs text-neutral-400">
              The AI is automatically managing all parameters for optimal performance.
            </p>
          </div>
        </div>
      )}

      {isLimited && (
        <div className="flex items-start gap-3 p-4 bg-cyan-400/5 border border-cyan-400/20 rounded-lg">
          <Info className="w-4 h-4 text-cyan-400 mt-0.5" />
          <div className="text-sm text-neutral-300">
            <p className="font-medium mb-1">Balanced Mode Active</p>
            <p className="text-xs text-neutral-400">
              Some parameters are preset. You can adjust model and temperature only.
            </p>
          </div>
        </div>
      )}

      {/* Save Button */}
      {hasChanges && (
        <div className="flex justify-end">
          <Button 
            onClick={handleSave}
            className="bg-cyan-400 hover:bg-cyan-500 text-black font-medium"
          >
            Save Changes
          </Button>
        </div>
      )}
      
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #22d3ee;
          cursor: pointer;
        }
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #22d3ee;
          cursor: pointer;
          border: none;
        }
      `}</style>
    </div>
  );
}