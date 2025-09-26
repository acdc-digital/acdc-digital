// DAILY JOURNAL COMPONENT - AI-powered journal form with mood tracking
// /Users/matthewsimon/Projects/acdc-digital/solov2/app/dashboard/_components/Terminal/_components/DailyJournal.tsx

"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Ruler } from './Ruler';
import { 
  Calendar, 
  Clock, 
  Save, 
  Star, 
  Heart,
  BookOpen,
  Plus,
  X,
  Brain,
  Sparkles,
  TrendingUp,
  Activity,
  CheckCircle2,
  Circle,
  Edit,
  Pencil,
  Check
} from 'lucide-react';

interface JournalEntry {
  date: string;
  moodScore: number;
  title: string;
  content: string;
  tags: string[];
  gratitude: string[];
}

interface DailyJournalProps {
  selectedDate?: string;
  onSave?: (entry: JournalEntry) => void;
  onCancel?: () => void;
}

export function DailyJournal({ selectedDate, onSave, onCancel }: DailyJournalProps) {
  const today = new Date().toISOString().split('T')[0];
  const journalDate = selectedDate || today;

  const [entry, setEntry] = useState<JournalEntry>({
    date: journalDate,
    moodScore: 70,
    title: '',
    content: '',
    tags: [],
    gratitude: []
  });

  const [newTag, setNewTag] = useState('');
  const [newGratitude, setNewGratitude] = useState('');
  const [titleLabel, setTitleLabel] = useState('Entry Title');
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [journalLabel, setJournalLabel] = useState('Journal Entry');
  const [isEditingJournalLabel, setIsEditingJournalLabel] = useState(false);
  const [tagsLabel, setTagsLabel] = useState('Tags & Categories');
  const [isEditingTagsLabel, setIsEditingTagsLabel] = useState(false);
  const [gratitudeLabel, setGratitudeLabel] = useState('Gratitude Practice');
  const [isEditingGratitudeLabel, setIsEditingGratitudeLabel] = useState(false);

  const addTag = () => {
    if (newTag.trim() && !entry.tags.includes(newTag.trim())) {
      setEntry(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEntry(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };



  const addGratitude = () => {
    if (newGratitude.trim()) {
      setEntry(prev => ({ ...prev, gratitude: [...prev.gratitude, newGratitude.trim()] }));
      setNewGratitude('');
    }
  };

  const removeGratitude = (index: number) => {
    setEntry(prev => ({ ...prev, gratitude: prev.gratitude.filter((_, i) => i !== index) }));
  };

  const handleSave = () => {
    if (onSave) {
      onSave(entry);
    }
  };

  // Mood color system matching heatmap legend exactly
  const getMoodColor = (score: number) => {
    if (score >= 90) return 'text-[#007acc]';      // 90-100: Excellent
    if (score >= 80) return 'text-[#0e7490]';      // 80-89: Great  
    if (score >= 70) return 'text-[#059669]';      // 70-79: Good
    if (score >= 60) return 'text-[#65a30d]';      // 60-69: Moderate
    if (score >= 50) return 'text-[#ca8a04]';      // 50-59: Fair
    if (score >= 40) return 'text-[#ea580c]';      // 40-49: Poor
    if (score >= 30) return 'text-[#dc2626]';      // 30-39: Low
    if (score >= 20) return 'text-[#c026d3]';      // 20-29: Very Low
    if (score >= 10) return 'text-[#9333ea]';      // 10-19: Critical
    return 'text-[#e11d48]';                       // 0-9: Severe
  };

  const getMoodLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 80) return 'Great';
    if (score >= 70) return 'Good';
    if (score >= 60) return 'Moderate';
    if (score >= 50) return 'Fair';
    if (score >= 40) return 'Poor';
    if (score >= 30) return 'Low';
    if (score >= 20) return 'Very Low';
    if (score >= 10) return 'Critical';
    return 'Severe';
  };

  const formatDate = (dateString: string) => {
    // Parse the date string manually to avoid timezone issues
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day); // month is 0-indexed in Date constructor
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#1e1e1e] text-[#cccccc] border-l border-[#2d2d2d]">

      {/* Form Content */}
      <div className="flex-1 overflow-auto p-3 space-y-4">
        {/* Date and Metadata */}
        <div className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-md p-2">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs text-[#858585] mb-1">Entry Date</div>
              <div className="text-sm text-[#cccccc] font-dm-sans">{formatDate(journalDate)}</div>
            </div>
            <div className="text-right">
              <div className="text-xs text-[#858585] mb-1">Mood Score</div>
              <div className="flex items-center gap-1">
                <span className={`text-sm font-dm-sans font-bold ${getMoodColor(entry.moodScore)}`}>
                  {entry.moodScore}
                </span>
                <span className="text-xs text-[#858585]">/100</span>
              </div>
            </div>
          </div>
        </div>

        {/* Mood Score with Enhanced UI */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium font-dm-sans text-[#cccccc] flex items-center gap-2">
              Mood Assessment
            </Label>
            <div className="flex items-center gap-2 mt-3">
              <Badge 
                variant="outline" 
                className={`border-current text-xs ${getMoodColor(entry.moodScore)}`}
              >
                {getMoodLabel(entry.moodScore)}
              </Badge>
            </div>
          </div>
          
          <div className="relative">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={entry.moodScore}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEntry(prev => ({ ...prev, moodScore: parseInt(e.target.value) }))}
              className="w-full h-2 bg-[#2d2d2d] rounded-md appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#008080] [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-mde
                [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-[#008080] [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:appearance-none"
              aria-label="Mood score slider"
              title={`Mood score: ${entry.moodScore}/100 (${getMoodLabel(entry.moodScore)})`}
            />
          </div>
          
          {/* Ruler component */}
          <div className="mt-1">
            <Ruler min={0} max={100} />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {isEditingLabel ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={titleLabel}
                  onChange={(e) => setTitleLabel(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      setIsEditingLabel(false);
                    }
                  }}
                  onBlur={() => setIsEditingLabel(false)}
                  className="bg-transparent border-none text-sm font-medium font-dm-sans text-[#cccccc] outline-none p-0 m-0 min-w-20"
                  aria-label="Edit section title"
                  autoFocus
                />
              </div>
            ) : (
              <Label htmlFor="title" className="text-sm font-medium font-dm-sans text-[#cccccc] flex items-center gap-2">
                {titleLabel}
                <button
                  onClick={() => setIsEditingLabel(true)}
                  className="text-[#858585] hover:text-[#cccccc] hover:cursor-pointer transition-colors"
                  title="Edit label"
                  aria-label="Edit label"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </Label>
            )}
          </div>
          <Input
            id="title"
            placeholder="What's the focus of today's reflection?"
            value={entry.title}
            onChange={(e) => setEntry(prev => ({ ...prev, title: e.target.value }))}
            className="bg-[#1a1a1a] border-[#2d2d2d] text-[#cccccc] placeholder:text-[#6c757d] font-dm-sans"
          />
        </div>

        {/* Main Content with AI assistance */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {isEditingJournalLabel ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={journalLabel}
                  onChange={(e) => setJournalLabel(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      setIsEditingJournalLabel(false);
                    }
                  }}
                  onBlur={() => setIsEditingJournalLabel(false)}
                  className="bg-transparent border-none text-sm font-medium font-dm-sans text-[#cccccc] outline-none p-0 m-0 min-w-20"
                  aria-label="Edit journal section title"
                  autoFocus
                />
              </div>
            ) : (
              <Label htmlFor="content" className="text-sm font-medium font-dm-sans text-[#cccccc] flex items-center gap-2">
                {journalLabel}
                <button
                  onClick={() => setIsEditingJournalLabel(true)}
                  className="text-[#858585] hover:text-[#cccccc] hover:cursor-pointer transition-colors"
                  title="Edit journal label"
                  aria-label="Edit journal label"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </Label>
            )}
          </div>
          <Textarea
            id="content"
            placeholder="Reflect on your day, thoughts, experiences, challenges, and wins. What patterns do you notice? How are you growing?"
            value={entry.content}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEntry(prev => ({ ...prev, content: e.target.value }))}
            className="bg-[#1a1a1a] border-[#2d2d2d] min-h-[100px] resize-none text-[#cccccc] placeholder:text-[#6c757d] leading-relaxed"
          />
          <div className="text-xs text-[#858585] flex items-center justify-between">
            <span className="font-dm-sans">{entry.content.length} characters</span>
            {entry.content.length > 100 && (
              <div className="flex items-center gap-1 text-[#10b981]">
                <CheckCircle2 className="w-3 h-3" />
                <span>Good detail</span>
              </div>
            )}
          </div>
        </div>

        {/* Smart Tags with Suggestions */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {isEditingTagsLabel ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tagsLabel}
                  onChange={(e) => setTagsLabel(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      setIsEditingTagsLabel(false);
                    }
                  }}
                  onBlur={() => setIsEditingTagsLabel(false)}
                  className="bg-transparent border-none text-sm font-medium font-dm-sans text-[#cccccc] outline-none p-0 m-0 min-w-20"
                  aria-label="Edit tags section title"
                  autoFocus
                />
              </div>
            ) : (
              <Label className="text-sm font-medium font-dm-sans text-[#cccccc] flex items-center gap-2">
                {tagsLabel}
                <button
                  onClick={() => setIsEditingTagsLabel(true)}
                  className="text-[#858585] hover:text-[#cccccc] hover:cursor-pointer transition-colors"
                  title="Edit tags label"
                  aria-label="Edit tags label"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </Label>
            )}
          </div>
          
          {/* Quick Tag Suggestions */}
          <div className="flex flex-wrap gap-2 mb-3">
            {['work', 'personal', 'health', 'relationships', 'learning', 'goals'].map((suggestion) => (
              <Button
                key={suggestion}
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (!entry.tags.includes(suggestion)) {
                    setEntry(prev => ({ ...prev, tags: [...prev.tags, suggestion] }));
                  }
                }}
                className="h-6 px-3 text-xs border border-[#2d2d2d] hover:border-[#007acc] hover:text-[#007acc] hover:bg-[#007acc]/10 hover:cursor-pointer text-[#858585]"
                disabled={entry.tags.includes(suggestion)}
              >
                {suggestion}
              </Button>
            ))}
          </div>

          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Add custom tag..."
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTag()}
              className="bg-[#1a1a1a] border-[#2d2d2d] flex-1 text-[#cccccc] placeholder:text-[#6c757d] font-dm-sans text-sm"
            />
            <Button 
              onClick={addTag}
              size="sm" 
              variant="outline"
              className="border-[#2d2d2d] bg-[#008080]/80 hover:bg-[#008080]/60 hover:border-[#2d2d2d] hover:cursor-pointer text-black h-8 w-8 p-0"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {entry.tags.map((tag) => (
              <Badge 
                key={tag}
                variant="outline" 
                className="bg-[#007acc]/10 border-[#007acc] text-[#007acc] text-xs flex items-center gap-1 hover:bg-[#007acc]/20 hover:cursor-pointer transition-colors"
              >
                <span className="font-dm-sans">#{tag}</span>
                <X 
                  className="w-3 h-3 cursor-pointer hover:text-[#cccccc] hover:cursor-pointer transition-colors" 
                  onClick={() => removeTag(tag)}
                />
              </Badge>
            ))}
          </div>
        </div>

        {/* Gratitude Practice */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {isEditingGratitudeLabel ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={gratitudeLabel}
                  onChange={(e) => setGratitudeLabel(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      setIsEditingGratitudeLabel(false);
                    }
                  }}
                  onBlur={() => setIsEditingGratitudeLabel(false)}
                  className="bg-transparent border-none text-sm font-medium font-dm-sans text-[#cccccc] outline-none p-0 m-0 min-w-20"
                  aria-label="Edit gratitude section title"
                  autoFocus
                />
              </div>
            ) : (
              <Label className="text-sm font-medium font-dm-sans text-[#cccccc] flex items-center gap-2">
                {gratitudeLabel}
                <button
                  onClick={() => setIsEditingGratitudeLabel(true)}
                  className="text-[#858585] hover:text-[#cccccc] hover:cursor-pointer transition-colors"
                  title="Edit gratitude label"
                  aria-label="Edit gratitude label"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </Label>
            )}
          </div>
          
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="What brought you joy or peace today?"
              value={newGratitude}
              onChange={(e) => setNewGratitude(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addGratitude()}
              className="bg-[#1a1a1a] border-[#2d2d2d] flex-1 text-[#cccccc] placeholder:text-[#6c757d] font-dm-sans text-sm"
            />
            <Button 
              onClick={addGratitude}
              size="sm" 
              variant="outline"
              className="border-[#2d2d2d] bg-[#008080]/80 hover:bg-[#008080]/60 hover:border-[#2d2d2d] hover:cursor-pointer text-black h-8 w-8 p-0"
            >
              <Plus className="w-3 h-3" />
            </Button>
          </div>
          
          <div className="space-y-2">
            {entry.gratitude.map((item, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 p-2 bg-[#1a1a1a] rounded-md border border-[#2d2d2d] hover:border-[#10b981]/30 transition-colors group"
              >
                <Star className="w-4 h-4 text-[#10b981] flex-shrink-0" />
                <span className="flex-1 text-sm text-[#cccccc] font-dm-sans leading-relaxed">{item}</span>
                <X 
                  className="w-4 h-4 cursor-pointer text-[#6c757d] hover:text-[#ef4444] hover:cursor-pointer opacity-0 group-hover:opacity-100 transition-all flex-shrink-0" 
                  onClick={() => removeGratitude(index)}
                />
              </div>
            ))}
            {entry.gratitude.length === 0 && (
              <div className="text-left py-4 text-[#6c757d] text-sm">
                Take a moment to reflect on what you're grateful for today.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}