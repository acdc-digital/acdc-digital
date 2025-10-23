"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Slider } from "../../../../components/ui/slider";
import { Label } from "../../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
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
  const updateSettings = useMutation(api.users.sessions.updateSettings);

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
    <div className="p-6 space-y-6 overflow-y-auto">
      {/* Control Mode Selection */}
      <div className="space-y-4">
        <Label className="text-neutral-200 text-base font-medium">Control Mode</Label>
        <div className="grid gap-3">
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
                <div className="flex items-start gap-3">
                  <Icon className={cn("w-5 h-5 mt-0.5", isSelected ? mode.color : "text-neutral-400")} />
                  <div>
                    <h4 className={cn("font-medium mb-1", isSelected ? "text-white" : "text-neutral-200")}>
                      {mode.label}
                    </h4>
                    <p className="text-xs text-neutral-400">
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
            <SelectItem value="claude-3-opus" className="text-white">Claude 3 Opus</SelectItem>
            <SelectItem value="claude-3-sonnet" className="text-white">Claude 3 Sonnet</SelectItem>
            <SelectItem value="claude-3-haiku" className="text-white">Claude 3 Haiku</SelectItem>
            <SelectItem value="gpt-4" className="text-white">GPT-4</SelectItem>
            <SelectItem value="gpt-4-turbo" className="text-white">GPT-4 Turbo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Parameter Sliders */}
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-neutral-200">Temperature</Label>
            <span className="text-sm text-cyan-400 font-mono">{localSettings.temperature}</span>
          </div>
          <Slider
            value={[localSettings.temperature]}
            onValueChange={([value]) => handleChange("temperature", value)}
            min={0}
            max={2}
            step={0.1}
            disabled={isDisabled}
            className="[&_[role=slider]]:bg-cyan-400"
          />
          <p className="text-xs text-neutral-500">Controls randomness in responses</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-neutral-200">Max Tokens</Label>
            <span className="text-sm text-cyan-400 font-mono">{localSettings.maxTokens}</span>
          </div>
          <Slider
            value={[localSettings.maxTokens]}
            onValueChange={([value]) => handleChange("maxTokens", value)}
            min={256}
            max={4096}
            step={256}
            disabled={isDisabled || isLimited}
            className="[&_[role=slider]]:bg-cyan-400"
          />
          <p className="text-xs text-neutral-500">Maximum length of response</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-neutral-200">Top P</Label>
            <span className="text-sm text-cyan-400 font-mono">{localSettings.topP}</span>
          </div>
          <Slider
            value={[localSettings.topP]}
            onValueChange={([value]) => handleChange("topP", value)}
            min={0}
            max={1}
            step={0.05}
            disabled={isDisabled || isLimited}
            className="[&_[role=slider]]:bg-cyan-400"
          />
          <p className="text-xs text-neutral-500">Nucleus sampling threshold</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-neutral-200">Frequency Penalty</Label>
            <span className="text-sm text-cyan-400 font-mono">{localSettings.frequencyPenalty}</span>
          </div>
          <Slider
            value={[localSettings.frequencyPenalty]}
            onValueChange={([value]) => handleChange("frequencyPenalty", value)}
            min={-2}
            max={2}
            step={0.1}
            disabled={isDisabled || isLimited}
            className="[&_[role=slider]]:bg-cyan-400"
          />
          <p className="text-xs text-neutral-500">Reduces repetition of tokens</p>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label className="text-neutral-200">Presence Penalty</Label>
            <span className="text-sm text-cyan-400 font-mono">{localSettings.presencePenalty}</span>
          </div>
          <Slider
            value={[localSettings.presencePenalty]}
            onValueChange={([value]) => handleChange("presencePenalty", value)}
            min={-2}
            max={2}
            step={0.1}
            disabled={isDisabled || isLimited}
            className="[&_[role=slider]]:bg-cyan-400"
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
    </div>
  );
}