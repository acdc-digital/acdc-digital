// DAILY LOG FORM
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/_components/dailyLogForm.tsx

"use client";

import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
// Demo mode: No Convex hooks needed
// import { useQuery, useMutation, useAction } from "@/hooks/convexHooks";
// import { api } from "@/convex/_generated/api";
import { useConvexUser } from "@/hooks/useConvexUser";
import { useTemplates } from "@/hooks/useTemplates";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  Loader2,
  Settings,
  Settings2,
  X,
  Zap,
  Star,
  Heart,
  MessageSquare,
  User,
  Plus,
  Minus,
  Check,
} from "lucide-react";
import { useFeedStore, FeedMessage } from "@/store/feedStore";
import { addDays, format, subDays } from "date-fns";
// Demo mode: No Convex client needed
// import { useConvex } from "@/hooks/useConvex";
import { useBrowserEnvironment } from "@/utils/environment";
import { TemplateField } from "./Templates";
import { generateDailyLog, validateGeneratedData } from "@/services/generateLog";
import { streamDemoFeedMessage } from "@/lib/demoStreaming";

interface DailyLogFormData {
  overallMood: number;
  workSatisfaction: number;
  personalLifeSatisfaction: number;
  balanceRating: number;
  sleep: number;
  exercise: boolean;
  highlights: string;
  challenges: string;
  tomorrowGoal: string;
  [key: string]: any; // Allow for dynamic fields from templates
}

interface DailyLogFormProps {
  onClose: () => void;
  date: string;
  hasActiveSubscription?: boolean;
  showTemplates?: boolean;
  onCustomize?: () => void;
}

/**
 * Client‑side form for creating/updating a daily log.
 * Server logic lives in `convex/dailyLogs.ts`.
 * Now supports customizable templates (managed from main page)!
 */
export default function DailyLogForm({ onClose, date, hasActiveSubscription, showTemplates, onCustomize }: DailyLogFormProps) {
  console.log("DailyLogForm mounted", { date, hasActiveSubscription });
  const { isAuthenticated, isLoading: userLoading, userId } = useConvexUser();
  const isBrowser = useBrowserEnvironment();

  // Templates integration
  const {
    currentFormFields,
    activeTemplate,
    isLoading: templatesLoading,
  } = useTemplates({ userId: userId || undefined });

  // Simple field filtering without memoization to avoid React errors
  const stableFormFields = currentFormFields?.filter(field => field && field.id && field.type) || [];

  // DEBUG: Log what we're getting from useTemplates
  console.log("📋 DailyLogForm - Templates Debug:", {
    currentFormFields,
    currentFormFieldsLength: currentFormFields?.length,
    stableFormFields,
    stableFormFieldsLength: stableFormFields.length,
    templatesLoading,
    userId,
  });

  // Demo mode: No settings validation needed (no backend)
  // Generator is always available
  const settingsComplete = true;
  const missingSettings: string[] = [];

  /* ────────────────────────────────────────── */
  /* Feed store hooks                           */
  /* ────────────────────────────────────────── */
  const setActiveTab     = useFeedStore((s) => s.setActiveTab);
  const setSidebarOpen   = useFeedStore((s) => s.setSidebarOpen);
  const setSelectedDate  = useFeedStore((s) => s.setSelectedDate);
  const setStreamingMessage = useFeedStore((s) => s.setStreamingMessage);
  const setIsStreaming   = useFeedStore((s) => s.setIsStreaming);
  const setFeedMessages  = useFeedStore((s) => s.setFeedMessages);
  const feedMessages     = useFeedStore((s) => s.feedMessages);

  const effectiveDate = date ?? new Date().toISOString().split("T")[0];

  // Demo mode: No backend - all data is ephemeral and client-side only
  // (Convex queries/mutations/actions removed for demo mode)

  // Create dynamic form data based on current template fields (simplified)
  const createFormDefaults = () => {
    const defaults: Record<string, any> = {};
    stableFormFields.forEach(field => {
      if (field && field.id) {
        defaults[field.id] = field.defaultValue;
      }
    });
    return defaults;
  };

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<DailyLogFormData>({
    defaultValues: createFormDefaults(),
  });

  // Reset form when template changes
  useEffect(() => {
    const newDefaults = createFormDefaults();
    console.log("🔄 Template changed, resetting form with new defaults:", {
      templateName: activeTemplate?.name,
      fieldCount: stableFormFields.length,
      fields: stableFormFields.map(f => f.id),
      newDefaults
    });
    reset(newDefaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTemplate?.id, stableFormFields.length]); // Reset when template ID or field count changes

  /* ────────────────────────────────────────── */
  /* Demo mode: no existing log persistence      */
  /* Each page refresh starts fresh            */
  /* ────────────────────────────────────────── */

  /* ────────────────────────────────────────── */
  /* Local state                               */
  /* ────────────────────────────────────────── */
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Enhanced placeholder suggestions that rotate
  const getSmartPlaceholder = (fieldType: string, label: string) => {
    const placeholders = {
      highlights: [
        "What made you smile today?",
        "A moment that stood out...",
        "Something you're grateful for...",
        "A small win you experienced...",
        "What energized you most?"
      ],
      challenges: [
        "What felt difficult today?",
        "A challenge you worked through...",
        "Something that tested you...",
        "What you'd handle differently...",
        "An obstacle you faced..."
      ],
      tomorrowGoal: [
        "What do you want to focus on tomorrow?",
        "One thing to prioritize...",
        "Your main intention for tomorrow...",
        "What would make tomorrow great?",
        "A goal to work toward..."
      ]
    };

    const suggestions = placeholders[fieldType as keyof typeof placeholders] || [`Enter ${label.toLowerCase()}...`];
    return suggestions[Math.floor(Date.now() / 10000) % suggestions.length];
  };

  // Calculate form completion percentage
  const calculateProgress = () => {
    const watchedValues = watch();
    const totalFields = stableFormFields.length;
    let completedFields = 0;

    stableFormFields.forEach(field => {
      if (!field?.id) return;
      const value = watchedValues[field.id];
      if (field.type === 'checkbox') {
        completedFields += value ? 1 : 0;
      } else if (typeof value === 'string') {
        completedFields += value.trim() ? 1 : 0;
      } else if (typeof value === 'number') {
        completedFields += value > 0 ? 1 : 0;
      }
    });

    return totalFields > 0 ? (completedFields / totalFields) * 100 : 0;
  };

  /* ────────────────────────────────────────── */
  /*  User ID validation                        */
  /* ────────────────────────────────────────── */
  console.log("🔒 Loading check:", {
    userLoading,
    isAuthenticated,
    userId,
    templatesLoading,
    willShowLoading: userLoading || !isAuthenticated || !userId || templatesLoading
  });

  if (userLoading || !isAuthenticated || !userId || templatesLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        <span className="text-sm text-zinc-500">Loading...</span>
      </div>
    );
  }

  /* ────────────────────────────────────────── */
  /* Form submit handler                       */
  /* ────────────────────────────────────────── */
  const onSubmit = async (data: DailyLogFormData) => {
    console.log("DailyLogForm onSubmit called", { effectiveDate, userId, data });
    setError(null);
    setIsSubmitting(true);

    try {
      // Demo mode: Data is ephemeral, stored in session only
      // No backend calls - all data cleared on refresh
      console.log("Demo mode: Log saved (ephemeral)", { date: effectiveDate, data });

      // Simulate save delay for realism
      await new Promise(resolve => setTimeout(resolve, 300));

      // Show success state
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      /* ───── Switch the sidebar to Feed view ───── */
      setSelectedDate(effectiveDate);
      setActiveTab("feed");
      setSidebarOpen(true);

      /* ───── Start streaming demo message ───── */
      console.log("🎬 Starting demo message stream...");
      setIsStreaming(true);
      setStreamingMessage("");

      // Stream the demo message
      await streamDemoFeedMessage(
        effectiveDate,
        (partialMessage) => {
          // Update streaming message as it builds
          setStreamingMessage(partialMessage);
        },
        (finalMessage) => {
          // When complete, create final feed message
          console.log("✅ Stream complete, creating feed message");
          const newMessage: FeedMessage = {
            _id: `demo-feed-${Date.now()}`,
            date: effectiveDate,
            createdAt: Date.now(),
            message: finalMessage,
          };

          // Add to feed messages or replace for this date
          const existingMessages = feedMessages || [];
          const filteredMessages = existingMessages.filter(m => m.date !== effectiveDate);
          setFeedMessages([...filteredMessages, newMessage]);
          
          // Clear streaming state
          setIsStreaming(false);
          setStreamingMessage(null);
        }
      );
    } catch (err) {
      console.error("Failed to save daily log:", err);
      setError(err instanceof Error ? err.message : "Failed to save log");
      setIsStreaming(false);
      setStreamingMessage(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ────────────────────────────────────────── */
  /* Random generation handler                 */
  /* ────────────────────────────────────────── */
  const handleGenerateRandom = async () => {
    setError(null);
    setIsGenerating(true);
    try {
      // Use local generation service (no backend required)
      const generatedData = await generateDailyLog(effectiveDate);

      if (generatedData && typeof generatedData === 'object') {
        // Use the validation helper from the service
        const validatedData = validateGeneratedData(generatedData, stableFormFields);

        // Reset the form with the generated data
        reset(validatedData);

        // AUTO-SUBMIT: After generating and filling the form, submit it automatically
        console.log("Auto-submitting the generated log data");
        await onSubmit(validatedData as DailyLogFormData);
      } else {
        throw new Error("Generated data is not in the expected format or is null.");
      }
    } catch (err) {
      console.error("Failed to generate random log:", err);
      setError(err instanceof Error ? err.message : "Failed to generate log content.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Render field based on template field type
  const renderTemplateField = (field: TemplateField) => {
    // Safety check to prevent undefined field errors
    if (!field || !field.id || !field.type) {
      console.warn("Invalid field passed to renderTemplateField:", field);
      return null;
    }

    const watchValue = watch(field.id);

    switch (field.type) {
      case "slider":
        const sliderValue = watchValue || field.defaultValue || 1;
        const max = field.max || 10;
        const percentage = ((sliderValue - (field.min || 1)) / (max - (field.min || 1))) * 100;

        return (
          <div key={field.id} className="space-y-3 group">
            <div className="flex items-center justify-between">
              <Label htmlFor={field.id} className="text-sm text-zinc-600 dark:text-zinc-300 group-hover:text-zinc-800 dark:group-hover:text-zinc-100 transition-colors duration-200">
                {field.label}
                {field.required && <span className="text-amber-500 ml-1">•</span>}
              </Label>
              <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100 px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded min-w-[2rem] text-center transition-all duration-200">
                {sliderValue}/{max}
              </div>
            </div>

            <div className="relative group/slider">
              {/* Enhanced track with gradient and inner shadow */}
              <div className="relative h-2 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden shadow-inner">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-400 to-blue-500 dark:from-blue-500 dark:to-blue-600 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {/* Hidden native slider for functionality */}
              <Input
                id={field.id}
                type="range"
                min={field.min || 1}
                max={max}
                step={field.step || 1}
                className="absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:ring-offset-2"
                {...register(field.id, {
                  required: field.required,
                  valueAsNumber: true,
                })}
              />

              {/* Enhanced thumb with better shadow and hover effects */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white dark:bg-zinc-100 border border-zinc-200 dark:border-zinc-600 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.1)] dark:shadow-[0_2px_4px_rgba(0,0,0,0.3)] transition-all duration-200 pointer-events-none group-hover/slider:scale-110 group-hover/slider:shadow-[0_4px_8px_rgba(0,0,0,0.15)] dark:group-hover/slider:shadow-[0_4px_8px_rgba(0,0,0,0.4)]"
                style={{ left: `calc(${percentage}% - 10px)` }}
              />
            </div>
          </div>
        );

      case "number":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="text-sm text-zinc-600 dark:text-zinc-300">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="number"
              step={field.step || 1}
              min={field.min}
              max={field.max}
              placeholder={field.placeholder}
              className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors duration-200"
              {...register(field.id, {
                required: field.required,
                valueAsNumber: true,
              })}
            />
          </div>
        );

      case "checkbox":
        return (
          <div key={field.id} className="flex items-center space-x-3">
            <input
              id={field.id}
              type="checkbox"
              className="w-4 h-4 border border-zinc-200 dark:border-zinc-700 rounded bg-white dark:bg-zinc-800 checked:bg-blue-500 checked:border-blue-500 focus:ring-1 focus:ring-blue-400 transition-colors duration-200"
              {...register(field.id)}
            />
            <Label htmlFor={field.id} className="text-sm text-zinc-600 dark:text-zinc-300 cursor-pointer">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
          </div>
        );

      case "textarea":
        const textareaValue = watchValue || '';
        const maxLength = 500;
        return (
          <div key={field.id} className="space-y-2 group">
            <Label htmlFor={field.id} className="text-sm text-zinc-600 dark:text-zinc-300 group-hover:text-zinc-800 dark:group-hover:text-zinc-100 transition-colors duration-200">
              {field.label}
              {field.required && <span className="text-amber-500 ml-1">•</span>}
            </Label>
            <div className="relative">
              <Textarea
                id={field.id}
                placeholder={getSmartPlaceholder(field.id, field.label)}
                rows={3}
                maxLength={maxLength}
                className="bg-white dark:bg-zinc-800 border border-zinc-200/60 dark:border-zinc-700/60 rounded-md px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:scale-[1.02] resize-none transition-all duration-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 ring-1 ring-zinc-100/50 dark:ring-zinc-800/50 ring-inset"
                {...register(field.id, { required: field.required })}
              />
              <div className="absolute bottom-2 right-3 text-xs text-zinc-400 dark:text-zinc-500">
                {textareaValue.length}/{maxLength}
              </div>
            </div>
          </div>
        );

      case "text":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="text-sm text-zinc-600 dark:text-zinc-300">
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </Label>
            <Input
              id={field.id}
              type="text"
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
              className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md px-3 py-2 text-zinc-900 dark:text-zinc-100 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors duration-200 placeholder:text-zinc-400 dark:placeholder:text-zinc-500"
              {...register(field.id, { required: field.required })}
            />
          </div>
        );

      default:
        return null;
    }
  };

  // Group template fields by category (simplified)
  const groupedFields = stableFormFields.reduce((acc, field) => {
    const category = field?.category || "other";
    if (!acc[category]) acc[category] = [];
    acc[category].push(field);
    return acc;
  }, {} as Record<string, TemplateField[]>);

  console.log("📊 Grouped Fields:", {
    groupedFields,
    categories: Object.keys(groupedFields),
    totalFields: Object.values(groupedFields).flat().length
  });

  const categoryNames: Record<string, string> = {
    ratings: "Rate Your Day",
    wellness: "Basic Wellness",
    reflections: "Quick Reflections",
    custom: "Custom Fields",
    other: "Other Fields",
  };

  const categoryIcons: Record<string, React.ReactNode> = {
    ratings: <Star className="w-3 h-3" />,
    wellness: <Heart className="w-3 h-3" />,
    reflections: <MessageSquare className="w-3 h-3" />,
    custom: <User className="w-3 h-3" />,
    other: <Settings className="w-3 h-3" />,
  };

  const progress = calculateProgress();

  console.log("🎨 About to render form:", {
    groupedFieldsKeys: Object.keys(groupedFields),
    hasFields: Object.keys(groupedFields).length > 0,
    stableFormFieldsLength: stableFormFields.length
  });

  /* ────────────────────────────────────────── */
  /* UI                                        */
  /* ────────────────────────────────────────── */
  return (
    <div className="flex flex-col h-full bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 overflow-x-hidden">
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-100 dark:bg-zinc-800 z-10">
        <div
          className="h-full bg-gradient-to-r from-blue-400 to-blue-500 dark:from-blue-500 dark:to-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Enhanced Form Fields with better cards */}
      <div className="relative flex-1 overflow-hidden">
        <ScrollArea className="h-full overflow-x-hidden px-4 py-0">
          <form
            id="daily-log-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4 w-full max-w-full mt-4 mb-6"
          >
            {Object.entries(groupedFields).map(([category, fields]) => (
              <div key={category} className="bg-white dark:bg-zinc-800/50 border border-zinc-200/60 dark:border-zinc-700/60 rounded-md p-5 transition-all duration-200 ring-1 ring-zinc-100/50 dark:ring-zinc-800/50 ring-inset">
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-3">
                    {categoryIcons[category] && (
                      <span className="text-zinc-500 dark:text-zinc-400">
                        {categoryIcons[category]}
                      </span>
                    )}
                    <h3 className="text-[11px] uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-medium">
                      {categoryNames[category] || category}
                    </h3>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-700 px-2 py-0.5 rounded-full">
                      {fields.length} item{fields.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <div className="space-y-5">
                  {fields.map(renderTemplateField)}
                </div>
              </div>
            ))}
          </form>
        </ScrollArea>

        {/* Enhanced fade effects */}
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-zinc-900 to-transparent pointer-events-none z-10" />
      </div>

      {/* Footer */}
      <div className="sticky bottom-0 w-full border-t border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-3">
        {error && (
          <div className="flex items-center space-x-2 mb-3 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
            <AlertCircle size={16} />
            <span className="text-sm">{error}</span>
          </div>
        )}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            type="submit"
            form="daily-log-form"
            disabled={isSubmitting || isGenerating}
            className="bg-emerald-600 hover:bg-emerald-700 text-white h-10 px-6"
          >
            {showSuccess ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Saved!
              </>
            ) : isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Log"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSubmitting || isGenerating}
            className="h-10 px-6"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}