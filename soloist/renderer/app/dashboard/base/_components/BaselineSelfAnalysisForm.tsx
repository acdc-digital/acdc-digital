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

export interface FormState {
  isSubmitting: boolean;
  isComputing: boolean;
  saveStatus: "idle" | "saving" | "saved";
  computedBaseline: { scores: { baseline_index: number; confidence: number } } | null;
}

interface BaselineSelfAnalysisFormProps {
  onBaselineComputed?: (baselineAnswerId: Id<"baseline_answers">) => void;
  onAnalysisStateChange?: (isGenerating: boolean) => void;
  onStateChange?: (state: FormState) => void;
}

export interface BaselineSelfAnalysisFormRef {
  resetForm: () => void;
  submitForm: () => void;
}

export const BaselineSelfAnalysisForm = React.forwardRef<BaselineSelfAnalysisFormRef, BaselineSelfAnalysisFormProps>(({
  onBaselineComputed,
  onAnalysisStateChange,
  onStateChange,
}, ref) => {
  const { register, handleSubmit, reset, watch, setValue, formState } = useForm<BaselineFormValues>({
    mode: "onChange",
    defaultValues: {
      emotionalFrequency: "sometimes", // Default to first question answered for progress bar
    },
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

  // Expose methods via ref
  React.useImperativeHandle(ref, () => ({
    resetForm: () => {
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
    },
    submitForm: () => handleSubmit(onSubmit)(),
  }));

  // Pass state up to parent for shared footer
  React.useEffect(() => {
    onStateChange?.({
      isSubmitting,
      isComputing,
      saveStatus,
      computedBaseline,
    });
  }, [isSubmitting, isComputing, saveStatus, computedBaseline, onStateChange]);

  return (
    <div className="h-full flex flex-col bg-neutral-100 dark:bg-neutral-800 relative">
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

      {/* Scrollable Form Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
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
                          ? "border-neutral-300 dark:border-neutral-600 bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                          : "border-white/40 bg-transparent text-white/80 hover:border-white/60"
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
                className="mt-1.5 bg-transparent border-white/40 text-white/80 placeholder:text-white/40 focus:border-neutral-600 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none rounded-tl-none rounded-tr-lg rounded-b-lg"
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
                          ? "border-neutral-300 dark:border-neutral-600 bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                          : "border-white/40 bg-transparent text-white/80 hover:border-white/60"
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
                className="mt-2 bg-transparent border-white/40 text-white/80 placeholder:text-white/40 focus:border-neutral-600 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none rounded-tl-none rounded-tr-lg rounded-b-lg"
                placeholder="Describe the rhythm of your best days..."
                minHeight={72}
                maxHeight={200}
                {...register("goodDayDescription")}
              />
            </div>
          </div>

          {/* Section Divider */}
          <div className="py-2 -ml-5">
            <div className="w-1/2 h-px bg-white/20" />
          </div>

          {/* Cognitive Patterns */}
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
                          ? "border-neutral-300 dark:border-neutral-600 bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                          : "border-white/40 bg-transparent text-white/80 hover:border-white/60"
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
                          ? "border-neutral-300 dark:border-neutral-600 bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                          : "border-white/40 bg-transparent text-white/80 hover:border-white/60"
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
                className="mt-1.5 bg-transparent border-white/40 text-white/80 placeholder:text-white/40 focus:border-neutral-600 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none rounded-tl-none rounded-tr-lg rounded-b-lg"
                placeholder="e.g., Analyze what went wrong, take a break, move on..."
                {...register("reactionToSetback")}
              />
            </div>
          </div>

          {/* Section Divider */}
          <div className="py-2 -ml-5">
            <div className="w-1/2 h-px bg-white/20" />
          </div>

          {/* Motivation & Focus */}
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
                          ? "border-neutral-300 dark:border-neutral-600 bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                          : "border-white/40 bg-transparent text-white/80 hover:border-white/60"
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
                className="mt-1.5 bg-transparent border-white/40 text-white/80 placeholder:text-white/40 focus:border-neutral-600 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none rounded-tl-none rounded-tr-lg rounded-b-lg"
                placeholder="e.g., Tight deadlines, personal interest, quiet mornings..."
                {...register("focusTrigger")}
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                How do you define success for yourself?
              </Label>
              <AutoExpandingInput
                className="mt-2 bg-transparent border-white/40 text-white/80 placeholder:text-white/40 focus:border-neutral-600 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none rounded-tl-none rounded-tr-lg rounded-b-lg"
                placeholder="What does progress look like in your life?"
                minHeight={72}
                maxHeight={200}
                {...register("successDefinition")}
              />
            </div>
          </div>

          {/* Section Divider */}
          <div className="py-2 -ml-5">
            <div className="w-1/2 h-px bg-white/20" />
          </div>

          {/* Behavioral Rhythms */}
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
                          ? "border-neutral-300 dark:border-neutral-600 bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                          : "border-white/40 bg-transparent text-white/80 hover:border-white/60"
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
                          ? "border-neutral-300 dark:border-neutral-600 bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                          : "border-white/40 bg-transparent text-white/80 hover:border-white/60"
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
                className="mt-1.5 bg-transparent border-white/40 text-white/80 placeholder:text-white/40 focus:border-neutral-600 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none rounded-tl-none rounded-tr-lg rounded-b-lg"
                placeholder="e.g., Music, nature, journaling, exercise..."
                {...register("resetStrategy")}
              />
            </div>
          </div>

          {/* Section Divider */}
          <div className="py-2 -ml-5">
            <div className="w-1/2 h-px bg-white/20" />
          </div>

          {/* Social & Self-Perception */}
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
                          ? "border-neutral-300 dark:border-neutral-600 bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                          : "border-white/40 bg-transparent text-white/80 hover:border-white/60"
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
                          ? "border-neutral-300 dark:border-neutral-600 bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                          : "border-white/40 bg-transparent text-white/80 hover:border-white/60"
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
                          ? "border-neutral-300 dark:border-neutral-600 bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300"
                          : "border-white/40 bg-transparent text-white/80 hover:border-white/60"
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
                className="mt-2 bg-transparent border-white/40 text-white/80 placeholder:text-white/40 focus:border-neutral-600 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none rounded-tl-none rounded-tr-lg rounded-b-lg"
                placeholder="What patterns would you like to discover about yourself?"
                minHeight={72}
                maxHeight={200}
                {...register("selfImprovementFocus")}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

BaselineSelfAnalysisForm.displayName = "BaselineSelfAnalysisForm";
