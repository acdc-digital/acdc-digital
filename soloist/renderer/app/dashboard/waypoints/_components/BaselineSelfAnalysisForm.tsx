"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, Sparkles, Save, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

// Auto-expanding textarea component using CSS field-sizing
interface AutoExpandingInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  minHeight?: number;
  maxHeight?: number;
}

const AutoExpandingInput = React.forwardRef<HTMLTextAreaElement, AutoExpandingInputProps>(
  ({ minHeight = 36, maxHeight = 200, className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex w-full border bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 resize-none overflow-y-auto transition-all",
          // Use CSS field-sizing for native auto-resize
          "[field-sizing:content]",
          className
        )}
        style={{ 
          minHeight: `${minHeight}px`, 
          maxHeight: `${maxHeight}px`,
        }}
        rows={1}
        {...props}
      />
    );
  }
);
AutoExpandingInput.displayName = "AutoExpandingInput";

type BaselineFormValues = {
  // Emotional Landscape
  emotionalFrequency: string;
  stressRecovery: string;
  typicalMood: string;
  emotionalAwareness: string;
  goodDayDescription: string;

  // Cognitive Patterns
  decisionStyle: string;
  overthinking: string;
  reactionToSetback: string;

  // Motivation & Focus
  motivationType: string;
  focusTrigger: string;
  successDefinition: string;

  // Behavioral Rhythms
  consistency: string;
  reflectionFrequency: string;
  resetStrategy: string;

  // Social & Self-Perception
  socialLevel: string;
  rechargeMethod: string;
  selfUnderstanding: string;
  selfImprovementFocus: string;
};

interface BaselineSelfAnalysisFormProps {
  onBaselineComputed?: (baselineAnswerId: Id<"baseline_answers">) => void;
  onAnalysisStateChange?: (isGenerating: boolean) => void;
}

export function BaselineSelfAnalysisForm({
  onBaselineComputed,
  onAnalysisStateChange,
}: BaselineSelfAnalysisFormProps) {
  const { register, handleSubmit, reset, watch, setValue, formState } = useForm<BaselineFormValues>({
    mode: "onChange",
  });

  const saveBaselineAnswers = useMutation(api.baseline.saveBaselineAnswers);
  const computePrimaryBaseline = useMutation(api.baseline.computePrimaryBaseline);
  const generateAnalysis = useAction(api.baselineChatActions.generateBaselineAnalysis);
  const currentUser = useQuery(api.users.viewer);
  const latestBaselineAnswers = useQuery(api.baseline.getLatestBaselineAnswers);
  const computedBaseline = useQuery(api.baseline.getBaseline, { version: 1 });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isComputing, setIsComputing] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState<"idle" | "saving" | "saved">("idle");
  const [computeResult, setComputeResult] = React.useState<{
    baseline_index: number;
    confidence: number;
  } | null>(null);
  const [hasLoadedInitialData, setHasLoadedInitialData] = React.useState(false);

  // Calculate form completion percentage
  const calculateProgress = () => {
    const watchedValues = watch();
    const fields = [
      "emotionalFrequency",
      "stressRecovery",
      "typicalMood",
      "emotionalAwareness",
      "goodDayDescription",
      "decisionStyle",
      "overthinking",
      "reactionToSetback",
      "motivationType",
      "focusTrigger",
      "successDefinition",
      "consistency",
      "reflectionFrequency",
      "resetStrategy",
      "socialLevel",
      "rechargeMethod",
      "selfUnderstanding",
      "selfImprovementFocus",
    ];
    
    let completedFields = 0;
    fields.forEach((fieldId) => {
      const value = watchedValues[fieldId as keyof BaselineFormValues];
      if (typeof value === "string" && value.trim()) {
        completedFields += 1;
      }
    });

    return fields.length > 0 ? (completedFields / fields.length) * 100 : 0;
  };

  const progress = calculateProgress();

  // Load existing baseline answers when available
  React.useEffect(() => {
    if (latestBaselineAnswers) {
      // Always load on first mount, or if not currently editing
      if (!hasLoadedInitialData || !formState.isDirty) {
        // Extract only the form fields (exclude _id, _creationTime, userId, createdAt)
        const {
          emotionalFrequency,
          stressRecovery,
          typicalMood,
          emotionalAwareness,
          goodDayDescription,
          decisionStyle,
          overthinking,
          reactionToSetback,
          motivationType,
          focusTrigger,
          successDefinition,
          consistency,
          reflectionFrequency,
          resetStrategy,
          socialLevel,
          rechargeMethod,
          selfUnderstanding,
          selfImprovementFocus,
        } = latestBaselineAnswers;
        
        reset({
          emotionalFrequency,
          stressRecovery,
          typicalMood,
          emotionalAwareness,
          goodDayDescription,
          decisionStyle,
          overthinking,
          reactionToSetback,
          motivationType,
          focusTrigger,
          successDefinition,
          consistency,
          reflectionFrequency,
          resetStrategy,
          socialLevel,
          rechargeMethod,
          selfUnderstanding,
          selfImprovementFocus,
        });
        setHasLoadedInitialData(true);
      }
    }
  }, [latestBaselineAnswers, reset, formState.isDirty, hasLoadedInitialData]);

  const onSubmit = async (data: BaselineFormValues) => {
    setIsSubmitting(true);
    setIsComputing(true);

    try {
      // Save the answers first - now passing individual fields
      const answerId = await saveBaselineAnswers(data);

      // Compute the deterministic baseline
      const result = await computePrimaryBaseline();
      setComputeResult(result);

      // Generate AI analysis
      if (currentUser?._id && answerId) {
        onAnalysisStateChange?.(true);
        onBaselineComputed?.(answerId);

        try {
          await generateAnalysis({
            userId: currentUser._id,
            baselineAnswerId: answerId,
          });
        } catch (error) {
          console.error("Failed to generate analysis:", error);
        } finally {
          onAnalysisStateChange?.(false);
        }
      }
      
      console.log("Baseline computed successfully!", result);
      setSaveStatus("saved");
    } catch (error) {
      console.error("Failed to compute baseline:", error);
    } finally {
      setIsSubmitting(false);
      setIsComputing(false);
    }
  };

  return (
    <div className="border-r border-white/20 h-full flex flex-col bg-neutral-100 dark:bg-neutral-800 relative">
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-zinc-200 dark:bg-zinc-700 z-10">
        <div
          className="h-full bg-gradient-to-r from-blue-400 to-blue-500 dark:from-blue-500 dark:to-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Fixed Header */}
      <div className="flex-shrink-0 px-5 bg-neutral-100 dark:bg-neutral-800 border-b border-neutral-300 dark:border-neutral-600">
        <div className="pb-2 pt-2">
          <div className="flex items-center justify-between">
            <div className="flex gap-3">
              {/* Solo Dot - the individual within the circle */}
              <div className="mt-1 w-7 h-7 rounded-full bg-neutral-900 dark:bg-white flex items-center justify-center pl-2.5 pt-2">
                <div className="w-2.5 h-2.5 rounded-full bg-[#EF4444]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
                  Your Baseline
                </h2>
                <p className="text-neutral-500 dark:text-neutral-400 text-xs mt-0s">
                  Discover your rhythm. Understand your patterns.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  // Reset to empty values
                  reset({
                    emotionalFrequency: "",
                    stressRecovery: "",
                    typicalMood: "",
                    emotionalAwareness: "",
                    goodDayDescription: "",
                    decisionStyle: "",
                    overthinking: "",
                    reactionToSetback: "",
                    motivationType: "",
                    focusTrigger: "",
                    successDefinition: "",
                    consistency: "",
                    reflectionFrequency: "",
                    resetStrategy: "",
                    socialLevel: "",
                    rechargeMethod: "",
                    selfUnderstanding: "",
                    selfImprovementFocus: "",
                  });
                }}
                disabled={isSubmitting}
                className="flex flex-col items-center gap-0.5 p-1.5 rounded-md text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors disabled:opacity-50"
                title="Start Over"
              >
                <RefreshCcw className="h-4 w-4" />
                <span className="text-[10px]">Refresh</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Form Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Form Content - continuous list */}
        <div className="px-5 py-5 space-y-6">
          {/* Emotional Landscape */}
          <div className="space-y-5">
            <div className="pb-1">
              <h3 className="text-sm font-medium tracking-tight text-neutral-900 dark:text-white">
                Emotional Landscape
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-xs">
                How you experience and process feelings
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                How often do you experience strong emotions?
              </Label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["Rarely", "Sometimes", "Often", "Constantly"].map((option) => {
                  const isSelected = watch("emotionalFrequency") === option.toLowerCase();
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setValue("emotionalFrequency", option.toLowerCase())}
                      className={`px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-all ${
                        isSelected
                          ? "border-white/40 bg-transparent text-white/80"
                          : "border-neutral-300 dark:border-neutral-600 bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                When stressed, how long does it take you to recover?
              </Label>
              <AutoExpandingInput
                className="mt-1.5 bg-neutral-200 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:border-neutral-600 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none rounded-tl-none rounded-tr-lg rounded-b-lg"
                placeholder="e.g., A few hours, a day, several days..."
                {...register("stressRecovery")}
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                What's your typical baseline mood?
              </Label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["Optimistic", "Neutral", "Cautious", "Varies widely"].map((option) => {
                  const optionValue = option.toLowerCase().replace(" ", "-");
                  const isSelected = watch("typicalMood") === optionValue;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setValue("typicalMood", optionValue)}
                      className={`px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-all ${
                        isSelected
                          ? "border-white/40 bg-transparent text-white/80"
                          : "border-neutral-300 dark:border-neutral-600 bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                What does a good day feel like for you?
              </Label>
              <AutoExpandingInput
                className="mt-2 bg-neutral-200 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:border-neutral-600 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none rounded-tl-none rounded-tr-lg rounded-b-lg"
                placeholder="Describe the rhythm of your best days..."
                minHeight={72}
                maxHeight={200}
                {...register("goodDayDescription")}
              />
            </div>
          </div>

          {/* Cognitive Patterns */}
          <div className="-ml-5 w-[calc(65%+1.25rem)] h-px bg-white/40" />
          <div className="space-y-5">
            <div className="pb-1">
              <h3 className="text-sm font-medium tracking-tight text-neutral-900 dark:text-white">
                Cognitive Patterns
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-xs">
                How you think and process decisions
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                When making decisions, do you rely more on logic or instinct?
              </Label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["Logic", "Balanced", "Instinct"].map((option) => {
                  const isSelected = watch("decisionStyle") === option.toLowerCase();
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setValue("decisionStyle", option.toLowerCase())}
                      className={`px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-all ${
                        isSelected
                          ? "border-white/40 bg-transparent text-white/80"
                          : "border-neutral-300 dark:border-neutral-600 bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                How often do you find yourself overthinking?
              </Label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["Rarely", "Sometimes", "Often", "Constantly"].map((option) => {
                  const isSelected = watch("overthinking") === option.toLowerCase();
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setValue("overthinking", option.toLowerCase())}
                      className={`px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-all ${
                        isSelected
                          ? "border-white/40 bg-transparent text-white/80"
                          : "border-neutral-300 dark:border-neutral-600 bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                When faced with a setback, your first reaction is usually to...
              </Label>
              <AutoExpandingInput
                className="mt-1.5 bg-neutral-200 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:border-neutral-600 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none rounded-tl-none rounded-tr-lg rounded-b-lg"
                placeholder="e.g., Analyze what went wrong, take a break, move on..."
                {...register("reactionToSetback")}
              />
            </div>
          </div>

          {/* Motivation & Focus */}
          <div className="-ml-5 w-[calc(65%+1.25rem)] h-px bg-white/40" />
          <div className="space-y-5">
            <div className="pb-1">
              <h3 className="text-sm font-medium tracking-tight text-neutral-900 dark:text-white">
                Motivation & Focus
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-xs">
                What drives you and captures your attention
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                What motivates you most when pursuing goals?
              </Label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["Achievement", "Growth", "Curiosity", "Impact"].map((option) => {
                  const isSelected = watch("motivationType") === option.toLowerCase();
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setValue("motivationType", option.toLowerCase())}
                      className={`px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-all ${
                        isSelected
                          ? "border-white/40 bg-transparent text-white/80"
                          : "border-neutral-300 dark:border-neutral-600 bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                What triggers your deepest focus?
              </Label>
              <AutoExpandingInput
                className="mt-1.5 bg-neutral-200 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:border-neutral-600 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none rounded-tl-none rounded-tr-lg rounded-b-lg"
                placeholder="e.g., Tight deadlines, personal interest, quiet mornings..."
                {...register("focusTrigger")}
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                How do you define success for yourself?
              </Label>
              <AutoExpandingInput
                className="mt-2 bg-neutral-200 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:border-neutral-600 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none rounded-tl-none rounded-tr-lg rounded-b-lg"
                placeholder="What does progress look like in your life?"
                minHeight={72}
                maxHeight={200}
                {...register("successDefinition")}
              />
            </div>
          </div>

          {/* Behavioral Rhythms */}
          <div className="-ml-5 w-[calc(65%+1.25rem)] h-px bg-white/40" />
          <div className="space-y-5">
            <div className="pb-1">
              <h3 className="text-sm font-medium tracking-tight text-neutral-900 dark:text-white">
                Behavioral Rhythms
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-xs">
                Your daily patterns and routines
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                How consistent are your daily routines?
              </Label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["Very Consistent", "Somewhat", "Unpredictable"].map((option) => {
                  const optionValue = option.toLowerCase().replace(" ", "-");
                  const isSelected = watch("consistency") === optionValue;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setValue("consistency", optionValue)}
                      className={`px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-all ${
                        isSelected
                          ? "border-white/40 bg-transparent text-white/80"
                          : "border-neutral-300 dark:border-neutral-600 bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                How often do you reflect on your day or week?
              </Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {["Daily", "Weekly", "Occasionally", "Rarely"].map((option) => {
                  const isSelected = watch("reflectionFrequency") === option.toLowerCase();
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setValue("reflectionFrequency", option.toLowerCase())}
                      className={`px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-all ${
                        isSelected
                          ? "border-white/40 bg-transparent text-white/80"
                          : "border-neutral-300 dark:border-neutral-600 bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                When you feel off balance, what helps you reset?
              </Label>
              <AutoExpandingInput
                className="mt-1.5 bg-neutral-200 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:border-neutral-600 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none rounded-tl-none rounded-tr-lg rounded-b-lg"
                placeholder="e.g., Music, nature, journaling, exercise..."
                {...register("resetStrategy")}
              />
            </div>
          </div>

          {/* Social & Self-Perception */}
          <div className="-ml-5 w-[calc(65%+1.25rem)] h-px bg-white/40" />
          <div className="space-y-5">
            <div className="pb-1">
              <h3 className="text-sm font-medium tracking-tight text-neutral-900 dark:text-white">
                Social & Self-Perception
              </h3>
              <p className="text-neutral-500 dark:text-neutral-400 text-xs">
                How you relate to others and understand yourself
              </p>
            </div>

            <div>
              <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                How much social interaction do you typically have per week?
              </Label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["Minimal", "Moderate", "Frequent", "Very Frequent"].map((option) => {
                  const optionValue = option.toLowerCase().replace(" ", "-");
                  const isSelected = watch("socialLevel") === optionValue;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setValue("socialLevel", optionValue)}
                      className={`px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-all ${
                        isSelected
                          ? "border-white/40 bg-transparent text-white/80"
                          : "border-neutral-300 dark:border-neutral-600 bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                How do you typically recharge?
              </Label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["Alone time", "Social time", "Both"].map((option) => {
                  const optionValue = option.toLowerCase().replace(" ", "-");
                  const isSelected = watch("rechargeMethod") === optionValue;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setValue("rechargeMethod", optionValue)}
                      className={`px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-all ${
                        isSelected
                          ? "border-white/40 bg-transparent text-white/80"
                          : "border-neutral-300 dark:border-neutral-600 bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                How well do you think you understand yourself?
              </Label>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {["Very well", "Fairly well", "Somewhat", "Still learning"].map((option) => {
                  const optionValue = option.toLowerCase().replace(" ", "-");
                  const isSelected = watch("selfUnderstanding") === optionValue;
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setValue("selfUnderstanding", optionValue)}
                      className={`px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition-all ${
                        isSelected
                          ? "border-white/40 bg-transparent text-white/80"
                          : "border-neutral-300 dark:border-neutral-600 bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500"
                      }`}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                What part of yourself are you most curious to understand better?
              </Label>
              <AutoExpandingInput
                className="mt-2 bg-neutral-200 dark:bg-neutral-700 border-neutral-300 dark:border-neutral-600 text-neutral-900 dark:text-white placeholder:text-neutral-500 focus:border-neutral-600 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none rounded-tl-none rounded-tr-lg rounded-b-lg"
                placeholder="What patterns would you like to discover about yourself?"
                minHeight={72}
                maxHeight={200}
                {...register("selfImprovementFocus")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 px-5 py-3 bg-neutral-100 dark:bg-neutral-800 border-t border-neutral-300 dark:border-neutral-600 flex items-center justify-between">
        <Button
          type="submit"
          onClick={handleSubmit(onSubmit)}
          disabled={isSubmitting || isComputing}
          className="h-8 px-6 text-sm border border-neutral-300 dark:border-neutral-600 bg-neutral-200 dark:bg-neutral-700/75 text-neutral-600 dark:text-neutral-300 hover:border-neutral-400 dark:hover:border-neutral-500 font-medium rounded-none transition-all"
        >
          {isComputing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Finding your rhythm...
            </>
          ) : isSubmitting ? (
            <>
              <Save className="mr-2 h-4 w-4" />
              Saving...
            </>
          ) : computedBaseline ? (
            <>
              Recompute Baseline
            </>
          ) : (
            <>
              Discover Your Baseline
            </>
          )}
        </Button>
        <div className="flex items-center gap-3">
          {saveStatus === "saving" && (
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              <span>Saving...</span>
            </div>
          )}
          {saveStatus === "saved" && (
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Saved</span>
            </div>
          )}
          {computedBaseline && (
            <div className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-neutral-500 dark:text-neutral-400">Index</span>
                <span className="text-[#3B82F6] font-mono font-semibold">{computedBaseline.scores.baseline_index}</span>
              </div>
              <div className="w-px h-4 bg-neutral-300 dark:bg-neutral-600" />
              <div className="flex items-center gap-2">
                <span className="text-neutral-500 dark:text-neutral-400">Confidence</span>
                <span className="text-emerald-600 font-mono font-semibold">{computedBaseline.scores.confidence}%</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
