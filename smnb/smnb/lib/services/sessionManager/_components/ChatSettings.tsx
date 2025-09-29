// CHAT SETTINGS COMPONENT
// /Users/matthewsimon/Projects/acdc-digital/smnb/smnb/lib/services/sessionManager/_components/ChatSettings.tsx

/**
 * Chat Settings Panel Component
 * 
 * Provides configuration options for the chat service
 */

"use client";

import { ChatOptions } from '../sessionChatService';

export interface ChatSettingsProps {
  settings: ChatOptions;
  onSettingsChange: (settings: Partial<ChatOptions>) => void;
  className?: string;
}

export function ChatSettings({ settings, onSettingsChange, className }: ChatSettingsProps) {
  return (
    <div className={`p-4 bg-neutral-800 rounded-lg space-y-3 ${className || ''}`}>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-neutral-300">Temperature</label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={settings.temperature}
            onChange={(e) => onSettingsChange({ temperature: parseFloat(e.target.value) })}
            className="w-full"
            title="Temperature setting for response creativity"
          />
          <span className="text-xs text-neutral-500">{settings.temperature}</span>
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-300">Max Tokens</label>
          <input
            type="number"
            min="100"
            max="4000"
            value={settings.maxTokens}
            onChange={(e) => onSettingsChange({ maxTokens: parseInt(e.target.value) })}
            className="w-full bg-neutral-700 text-white text-xs p-1 rounded"
            title="Maximum tokens for response length"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-medium text-neutral-300">Model</label>
          <select
            value={settings.model}
            onChange={(e) => onSettingsChange({ model: e.target.value })}
            className="w-full bg-neutral-700 text-white text-xs p-1 rounded"
            title="AI model to use for responses"
          >
            <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</option>
            <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-medium text-neutral-300">Streaming</label>
          <input
            type="checkbox"
            checked={settings.stream}
            onChange={(e) => onSettingsChange({ stream: e.target.checked })}
            className="ml-2"
            title="Enable streaming responses"
          />
        </div>
      </div>
      
      <div>
        <label className="text-xs font-medium text-neutral-300">System Prompt</label>
        <textarea
          value={settings.systemPrompt}
          onChange={(e) => onSettingsChange({ systemPrompt: e.target.value })}
          className="w-full bg-neutral-700 text-white text-xs p-2 rounded mt-1"
          rows={3}
          placeholder="System prompt to guide the AI's behavior..."
        />
      </div>
    </div>
  );
}

export default ChatSettings;