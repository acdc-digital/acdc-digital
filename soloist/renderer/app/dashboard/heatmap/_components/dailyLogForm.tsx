// DAILY LOG FORM
// /Users/matthewsimon/Documents/Github/electron-nextjs/renderer/src/app/dashboard/_components/dailyLogForm.tsx

"use client";

import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexUser } from "@/hooks/useConvexUser";
import { useTemplates } from "@/hooks/useTemplates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  Loader2,
  Check,
} from "lucide-react";
import { useFeedStore } from "@/store/feedStore";
import LongForm from "./LongForm";
import { addDays, format, subDays } from "date-fns";
import { useConvex } from "convex/react";
import { useBrowserEnvironment } from "@/utils/environment";
import { TemplateField } from "./Templates";
// Tooltip imports - kept for future generator feature
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";

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
  editorMode: 'daily' | 'longform';
  setEditorMode: (mode: 'daily' | 'longform') => void;
}

/**
 * Client‑side form for creating/updating a daily log.
 * Server logic lives in `convex/dailyLogs.ts`.
 * Now supports customizable templates (managed from main page)!
 */
export default function DailyLogForm({ onClose, date, hasActiveSubscription, editorMode, setEditorMode }: DailyLogFormProps) {
  console.log("DailyLogForm mounted", { date, hasActiveSubscription });
  const { isAuthenticated, isLoading: userLoading, userId } = useConvexUser();
  const isBrowser = useBrowserEnvironment();

  // Templates integration
  const {
    currentFormFields,
    isLoading: templatesLoading,
  } = useTemplates({ userId: userId || undefined });

  // Simple field filtering without memoization to avoid React errors
  const stableFormFields = currentFormFields?.filter(field => field && field.id && field.type) || [];

  // Generator feature is currently disabled
  // TODO: Re-enable when generator feature is ready
  /*
  // Check user settings for generator prerequisites
  const userAttributes = useQuery(
    api.shared.users.userAttributes.getAttributes,
    userId ? { userId } : "skip"
  );

  const userInstructions = useQuery(
    api.renderer.heatmap.randomizer.getInstructions,
    userId ? { userId } : "skip"
  );

  // Check if user has completed required settings (simplified)
  const settingsComplete = !!(
    userAttributes?.attributes?.name?.trim() &&
    userAttributes?.attributes?.goals?.trim() &&
    userAttributes?.attributes?.objectives?.trim() &&
    userInstructions?.trim()
  );

  const missingSettings = [];
  if (!userAttributes?.attributes?.name?.trim()) {
    missingSettings.push("Name");
  }
  if (!userAttributes?.attributes?.goals?.trim()) {
    missingSettings.push("Goals");
  }
  if (!userAttributes?.attributes?.objectives?.trim()) {
    missingSettings.push("Objectives");
  }
  if (!userInstructions?.trim()) {
    missingSettings.push("Custom Instructions");
  }
  */

  /* ────────────────────────────────────────── */
  /* Feed store hooks                           */
  /* ────────────────────────────────────────── */
  const setActiveTab     = useFeedStore((s) => s.setActiveTab);
  const setSidebarOpen   = useFeedStore((s) => s.setSidebarOpen);
  const setSelectedDate  = useFeedStore((s) => s.setSelectedDate);

  const effectiveDate = date ?? new Date().toISOString().split("T")[0];

  // Fetch existing log for the day
  const existingLog = useQuery(
    api.renderer.heatmap.dailyLogs.getDailyLog,
    userId ? { date: effectiveDate, userId } : "skip"
  );

  const dailyLogMutation = useMutation(api.renderer.heatmap.dailyLogs.dailyLog);
  const scoreDailyLog    = useAction(api.renderer.heatmap.score.scoreDailyLog);
  const generateFeed     = useAction(api.renderer.heatmap.feed.generateFeedForDailyLog);
  const generateForecast = useAction(api.renderer.soloist.forecast.generateForecast);
  // Generator feature is currently disabled
  // const generateRandomLog = useAction(api.renderer.heatmap.randomizer.generateRandomLog);
  const convex = useConvex();

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

  /* ────────────────────────────────────────── */
  /* Populate defaults when a log already exists */
  /* ────────────────────────────────────────── */
  useEffect(() => {
    if (existingLog?.answers && stableFormFields.length > 0) {
      const resetData: Record<string, any> = {};
      stableFormFields.forEach(field => {
        if (field && field.id) {
          resetData[field.id] = existingLog.answers[field.id] ?? field.defaultValue;
        }
      });
      reset(resetData);
    }
  }, [existingLog, reset]);

  /* ────────────────────────────────────────── */
  /* Local state                               */
  /* ────────────────────────────────────────── */
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Generator feature is currently disabled
  // const [isGenerating, setIsGenerating] = useState(false);
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
      await dailyLogMutation({ date: effectiveDate, userId, answers: data });
      await scoreDailyLog({ date: effectiveDate, userId });
      await generateFeed({ date: effectiveDate, userId });

      // --- Check if last 4 days (today + previous 3) all have logs ---
      const today = new Date(effectiveDate);
      const startDate = format(subDays(today, 3), 'yyyy-MM-dd');
      const endDate = format(today, 'yyyy-MM-dd');
      const logs = await convex.query(api.renderer.soloist.forecast.getLogsForUserInRangeSimple, {
        userId,
        startDate,
        endDate,
      });
      console.log("Fetched logs for last 4 days:", logs);
      const logDates = logs.map((log: { date: string }) => log.date);
      const expectedDates = Array.from({ length: 4 }, (_, i) => format(subDays(today, 3 - i), 'yyyy-MM-dd'));
      console.log("Expected dates:", expectedDates);
      const allPresent = expectedDates.every(date => logDates.includes(date));
      console.log("All present?", allPresent);
      if (allPresent) {
        const result = await generateForecast({ userId, startDate, endDate });
        console.log("generateForecast result:", result);
      }

      // Show success state
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      /* ───── Switch the sidebar to Feed view ───── */
      setSelectedDate(effectiveDate);
      setActiveTab("feed");
      setSidebarOpen(true);
    } catch (err) {
      console.error("Failed to save daily log:", err);
      setError(err instanceof Error ? err.message : "Failed to save log");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ────────────────────────────────────────── */
  /* Random generation handler (DISABLED)      */
  /* ────────────────────────────────────────── */
  /*
  const handleGenerateRandom = async () => {
    setError(null);
    setIsGenerating(true);
    try {
      if (!generateRandomLog) {
        throw new Error("Random generation feature is not available.");
      }
      const generatedData = await generateRandomLog({
        date: effectiveDate,
        userId
      });

      if (generatedData && typeof generatedData === 'object') {
        const validatedData: Partial<DailyLogFormData> = {};

        // Validate generated data against current form fields
        stableFormFields.forEach(field => {
          if (!field || !field.id) return;
          const value = generatedData[field.id];
          switch (field.type) {
            case "slider":
            case "number":
              if (typeof value === 'number') {
                const min = field.min || 0;
                const max = field.max || 10;
                validatedData[field.id] = Math.max(min, Math.min(max, Math.round(value)));
              } else {
                validatedData[field.id] = field.defaultValue;
              }
              break;
            case "checkbox":
              validatedData[field.id] = typeof value === 'boolean' ? value : field.defaultValue;
              break;
            case "textarea":
            case "text":
              validatedData[field.id] = typeof value === 'string' ? value : field.defaultValue || "";
              break;
            default:
              validatedData[field.id] = value || field.defaultValue;
          }
        });

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
      setError(err instanceof Error ? err.message : "Failed to generate random log content.");
    } finally {
      setIsGenerating(false);
    }
  };
  */

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
          <div key={field.id} className="space-y-3">
            <div className="flex items-center justify-between">
              <Label htmlFor={field.id} className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                {field.label}
                {field.required && <span className="text-amber-500 ml-1">•</span>}
              </Label>
              <div className="text-xs font-medium text-neutral-900 dark:text-neutral-100 px-2 py-0.5 bg-neutral-200 dark:bg-neutral-700 rounded min-w-[2.5rem] text-center">
                {sliderValue}/{max}
              </div>
            </div>

            <div className="relative group/slider">
              {/* Track */}
              <div className="relative h-2 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
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
                className="absolute top-0 left-0 w-full h-2 opacity-0 cursor-pointer"
                {...register(field.id, {
                  required: field.required,
                  valueAsNumber: true,
                })}
              />

              {/* Thumb */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white dark:bg-neutral-100 border border-neutral-300 dark:border-neutral-500 rounded-full shadow-sm transition-transform pointer-events-none group-hover/slider:scale-110"
                style={{ left: `calc(${percentage}% - 8px)` }}
              />
            </div>
          </div>
        );

      case "number":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {field.label}
              {field.required && <span className="text-amber-500 ml-1">•</span>}
            </Label>
            <Input
              id={field.id}
              type="number"
              step={field.step || 1}
              min={field.min}
              max={field.max}
              placeholder={field.placeholder}
              className="bg-neutral-200 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 rounded-tl-none rounded-tr-lg rounded-b-lg px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:border-neutral-400 dark:focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400/20 transition-colors"
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
              className="w-4 h-4 border border-neutral-300 dark:border-neutral-600 rounded bg-neutral-200 dark:bg-neutral-700 checked:bg-blue-500 checked:border-blue-500 focus:ring-1 focus:ring-blue-400/20 transition-colors cursor-pointer"
              {...register(field.id)}
            />
            <Label htmlFor={field.id} className="text-sm font-medium text-neutral-700 dark:text-neutral-300 cursor-pointer">
              {field.label}
              {field.required && <span className="text-amber-500 ml-1">•</span>}
            </Label>
          </div>
        );

      case "textarea":
        const textareaValue = watchValue || '';
        const maxLength = 500;
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {field.label}
              {field.required && <span className="text-amber-500 ml-1">•</span>}
            </Label>
            <div className="relative">
              <Textarea
                id={field.id}
                placeholder={getSmartPlaceholder(field.id, field.label)}
                rows={3}
                maxLength={maxLength}
                className="bg-neutral-200 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 rounded-tl-none rounded-tr-lg rounded-b-lg px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:border-neutral-400 dark:focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400/20 resize-none transition-colors placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
                {...register(field.id, { required: field.required })}
              />
              <div className="absolute bottom-2 right-3 text-xs text-neutral-500 dark:text-neutral-400">
                {textareaValue.length}/{maxLength}
              </div>
            </div>
          </div>
        );

      case "text":
        return (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id} className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {field.label}
              {field.required && <span className="text-amber-500 ml-1">•</span>}
            </Label>
            <Input
              id={field.id}
              type="text"
              placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
              className="bg-neutral-200 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 rounded-tl-none rounded-tr-lg rounded-b-lg px-3 py-2 text-neutral-900 dark:text-neutral-100 focus:border-neutral-400 dark:focus:border-neutral-500 focus:ring-1 focus:ring-neutral-400/20 transition-colors placeholder:text-neutral-500 dark:placeholder:text-neutral-400"
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

  const categoryNames: Record<string, string> = {
    ratings: "Rate Your Day",
    wellness: "Basic Wellness",
    reflections: "Quick Reflections",
    custom: "Custom Fields",
    other: "Other Fields",
  };

  const categorySubtitles: Record<string, string> = {
    ratings: "Rate different aspects of your day",
    wellness: "Track your physical wellbeing",
    reflections: "Capture thoughts and learnings",
    custom: "Your personalized tracking fields",
    other: "Additional fields",
  };

  const progress = calculateProgress();

  /* ────────────────────────────────────────── */
  /* UI                                        */
  /* ────────────────────────────────────────── */
  // If in longform mode, render the LongForm component instead
  if (editorMode === 'longform') {
    return (
      <div className="flex flex-col h-full bg-neutral-100 dark:bg-[#2b2b2b] text-zinc-800 dark:text-zinc-100 overflow-hidden">
        {/* LongForm takes the full space - mode toggle is now in sidebar header */}
        <div className="flex-1 overflow-hidden">
          <LongForm onClose={onClose} date={date} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-neutral-100 dark:bg-[#2b2b2b] text-zinc-800 dark:text-zinc-100 overflow-x-hidden relative">
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-200 dark:bg-zinc-700 z-10">
        <div
          className="h-full bg-gradient-to-r from-blue-400 to-blue-500 dark:from-blue-500 dark:to-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
      {/* Progress percentage
      <div className="absolute top-2 right-5 z-10">
        <span className="text-xs text-neutral-500 dark:text-neutral-400">{Math.round(progress)}%</span>
      </div>
      */}

      {/* Mode toggle and Customize button are now in the sidebar header */}

      {/* Scrollable Form Content */}
      <div className="flex-1 overflow-y-auto pt-1">
        <div className="px-5 py-5">
          <form
            id="daily-log-form"
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-6 w-full max-w-full"
          >
            {(Object.entries(groupedFields) as [string, TemplateField[]][]).map(([category, fields], index) => (
              <React.Fragment key={category}>
                {/* Section separator - show before all sections except first */}
                {index > 0 && (
                  <div className="-ml-5 w-[calc(65%+1.25rem)] h-px bg-white/40" />
                )}
                
                {/* Section */}
                <div className="space-y-5">
                  {/* Section header */}
                  <div className="pb-1">
                    <h3 className="text-sm font-medium tracking-tight text-neutral-900 dark:text-white">
                      {categoryNames[category] || category}
                    </h3>
                    <p className="text-neutral-500 dark:text-neutral-400 text-xs">
                      {categorySubtitles[category] || ""}
                    </p>
                  </div>
                  
                  {/* Section fields */}
                  <div className="space-y-5">
                    {fields.map(renderTemplateField)}
                  </div>
                </div>
              </React.Fragment>
            ))}
          </form>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 w-full border-t border-neutral-300 dark:border-neutral-600 bg-neutral-100 dark:bg-[#2b2b2b] px-5 py-3">
        {error && (
          <div className="flex items-center space-x-2 mb-3 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
            <AlertCircle size={16} />
            <span className="text-sm">{error}</span>
          </div>
        )}
        <div className="flex items-center justify-between">
          <Button
            type="submit"
            form="daily-log-form"
            disabled={isSubmitting}
            className={`${
              showSuccess
                ? "bg-emerald-600 border-emerald-500 text-white"
                : "bg-[#0071F8] hover:bg-[#0060d4] text-neutral-600 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500"
            } h-8 px-6 text-sm font-medium rounded-none transition-all disabled:opacity-50`}
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
            ) : existingLog ? (
              "Update Log"
            ) : (
              "Save Log"
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={onClose}
            disabled={isSubmitting}
            className="h-8 px-4 text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
}