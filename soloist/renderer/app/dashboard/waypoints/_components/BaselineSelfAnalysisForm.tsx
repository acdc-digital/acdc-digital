"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, CheckCircle2, TrendingUp, Save } from "lucide-react";

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
  const { register, handleSubmit, reset, watch, formState } = useForm<BaselineFormValues>({
    mode: "onChange",
  });

  const saveBaselineAnswers = useMutation(api.baseline.saveBaselineAnswers);
  const computePrimaryBaseline = useMutation(api.baseline.computePrimaryBaseline);
  const generateAnalysis = useAction(api.baselineChatActions.generateBaselineAnalysis);
  const currentUser = useQuery(api.users.viewer);
  const existingBaseline = useQuery(api.baselineAnalysis.getBaseline);
  const computedBaseline = useQuery(api.baseline.getBaseline, { version: 1 });

  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isComputing, setIsComputing] = React.useState(false);
  const [saveStatus, setSaveStatus] = React.useState<"idle" | "saving" | "saved">("idle");
  const [computeResult, setComputeResult] = React.useState<{
    baseline_index: number;
    confidence: number;
  } | null>(null);

  // Load existing baseline data when available
  React.useEffect(() => {
    if (existingBaseline && !formState.isDirty) {
      reset(existingBaseline);
    }
  }, [existingBaseline, reset, formState.isDirty]);

  const onSubmit = async (data: BaselineFormValues) => {
    setIsSubmitting(true);
    setIsComputing(true);

    try {
      // Save the answers first
      const answerId = await saveBaselineAnswers({
        answers: data,
      });

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
    <div className="h-full flex flex-col bg-[#252526] text-[#cccccc]">
      {/* VS Code-style Header */}
      <div className="flex-shrink-0 border-b border-[#2d2d30] bg-[#1e1e1e] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[15px] font-semibold text-white mb-1">Baseline Self-Analysis</h1>
            <p className="text-[13px] text-[#858585]">
              Establish your psychological baseline for personalized insights
            </p>
          </div>
          <div className="flex items-center gap-3">
            {saveStatus === "saving" && (
              <div className="flex items-center gap-2 text-[12px] text-[#858585]">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Saving...</span>
              </div>
            )}
            {saveStatus === "saved" && (
              <div className="flex items-center gap-2 text-[12px] text-[#4ec9b0]">
                <CheckCircle2 className="h-3 w-3" />
                <span>Saved</span>
              </div>
            )}
            {computedBaseline && (
              <div className="flex items-center gap-4 text-[12px] px-3 py-1.5 bg-[#1e1e1e] border border-[#007acc]/30 rounded">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#858585]">Index:</span>
                  <span className="text-[#007acc] font-mono font-semibold">{computedBaseline.scores.baseline_index}</span>
                </div>
                <div className="w-px h-3 bg-[#2d2d30]" />
                <div className="flex items-center gap-1.5">
                  <span className="text-[#858585]">Confidence:</span>
                  <span className="text-[#4ec9b0] font-mono font-semibold">{computedBaseline.scores.confidence}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Emotional Landscape */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#2d2d30]">
            <div className="w-1 h-5 bg-[#007acc] rounded-sm" />
            <h3 className="text-[13px] font-semibold text-white uppercase tracking-wide">
              Emotional Landscape
            </h3>
          </div>

          <div className="space-y-6">
            <div>
              <Label className="text-[13px] font-medium text-[#cccccc]">
                How often do you experience strong emotions?
              </Label>
              <RadioGroup className="mt-2 flex flex-wrap gap-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rarely" id="rarely" {...register("emotionalFrequency")} />
                  <Label htmlFor="rarely" className="font-normal cursor-pointer text-[13px]">Rarely</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sometimes" id="sometimes" {...register("emotionalFrequency")} />
                  <Label htmlFor="sometimes" className="font-normal cursor-pointer text-[13px]">Sometimes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="often" id="often" {...register("emotionalFrequency")} />
                  <Label htmlFor="often" className="font-normal cursor-pointer text-[13px]">Often</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="constantly" id="constantly" {...register("emotionalFrequency")} />
                  <Label htmlFor="constantly" className="font-normal cursor-pointer text-[13px]">Constantly</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-[13px] font-medium text-[#cccccc]">
                When stressed, how long does it take you to recover?
              </Label>
              <Input
                className="mt-2 bg-[#1e1e1e] border-[#2d2d30] text-[#cccccc] placeholder:text-[#858585] focus:border-[#007acc] focus:ring-1 focus:ring-[#007acc] rounded-md h-8 text-[13px]"
                placeholder="e.g., A few hours, a day, several days..."
                {...register("stressRecovery")}
              />
            </div>

            <div>
              <Label className="text-[13px] font-medium text-[#cccccc]">
                What's your typical baseline mood?
              </Label>
              <RadioGroup className="mt-2 flex flex-wrap gap-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="optimistic" id="optimistic" {...register("typicalMood")} />
                  <Label htmlFor="optimistic" className="font-normal cursor-pointer text-[13px]">Optimistic</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="neutral" id="neutral" {...register("typicalMood")} />
                  <Label htmlFor="neutral" className="font-normal cursor-pointer text-[13px]">Neutral</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cautious" id="cautious" {...register("typicalMood")} />
                  <Label htmlFor="cautious" className="font-normal cursor-pointer text-[13px]">Cautious</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="varies" id="varies" {...register("typicalMood")} />
                  <Label htmlFor="varies" className="font-normal cursor-pointer text-[13px]">Varies widely</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-[13px] font-medium text-[#cccccc]">
                Describe what a good day feels like for you
              </Label>
              <Textarea
                className="mt-2 min-h-[80px] bg-[#1e1e1e] border-[#2d2d30] text-[#cccccc] placeholder:text-[#858585] focus:border-[#007acc] focus:ring-1 focus:ring-[#007acc] rounded-md text-[13px]"
                placeholder="What does a calm, happy, or productive day look like for you?"
                {...register("goodDayDescription")}
              />
            </div>
          </div>
        </section>

        {/* Cognitive Patterns */}
        <section className="space-y-4 pt-6">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#2d2d30]">
            <div className="w-1 h-5 bg-[#8b5cf6] rounded-sm" />
            <h3 className="text-[13px] font-semibold text-white uppercase tracking-wide">
              Cognitive Patterns
            </h3>
          </div>

          <div className="space-y-6">
            <div>
              <Label className="text-[13px] font-medium text-[#cccccc]">
                When making decisions, do you rely more on logic or instinct?
              </Label>
              <RadioGroup className="mt-2 flex flex-wrap gap-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="logic" id="logic" {...register("decisionStyle")} />
                  <Label htmlFor="logic" className="font-normal cursor-pointer text-[13px]">Logic</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="balanced" id="balanced" {...register("decisionStyle")} />
                  <Label htmlFor="balanced" className="font-normal cursor-pointer text-[13px]">Balanced</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="instinct" id="instinct" {...register("decisionStyle")} />
                  <Label htmlFor="instinct" className="font-normal cursor-pointer text-[13px]">Instinct</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-[13px] font-medium text-[#cccccc]">
                How often do you overthink or second-guess yourself?
              </Label>
              <RadioGroup className="mt-2 flex flex-wrap gap-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rarely" id="overthink-rarely" {...register("overthinking")} />
                  <Label htmlFor="overthink-rarely" className="font-normal cursor-pointer text-[13px]">Rarely</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sometimes" id="overthink-sometimes" {...register("overthinking")} />
                  <Label htmlFor="overthink-sometimes" className="font-normal cursor-pointer text-[13px]">Sometimes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="often" id="overthink-often" {...register("overthinking")} />
                  <Label htmlFor="overthink-often" className="font-normal cursor-pointer text-[13px]">Often</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="constantly" id="overthink-constantly" {...register("overthinking")} />
                  <Label htmlFor="overthink-constantly" className="font-normal cursor-pointer text-[13px]">Constantly</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-[13px] font-medium text-[#cccccc]">
                When faced with a setback, your first reaction is usually to...
              </Label>
              <Input
                className="mt-2 bg-[#1e1e1e] border-[#2d2d30] text-[#cccccc] placeholder:text-[#858585] focus:border-[#007acc] focus:ring-1 focus:ring-[#007acc] rounded-md h-8 text-[13px]"
                placeholder="e.g., Analyze what went wrong, blame yourself, move on quickly..."
                {...register("reactionToSetback")}
              />
            </div>
          </div>
        </section>

        {/* Motivation & Focus */}
        <section className="space-y-4 pt-6">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#2d2d30]">
            <div className="w-1 h-5 bg-[#4ec9b0] rounded-sm" />
            <h3 className="text-[13px] font-semibold text-white uppercase tracking-wide">
              Motivation & Focus
            </h3>
          </div>

          <div className="space-y-6">
            <div>
              <Label className="text-[13px] font-medium text-[#cccccc]">
                What motivates you most when pursuing goals?
              </Label>
              <RadioGroup className="mt-2 flex flex-wrap gap-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="achievement" id="achievement" {...register("motivationType")} />
                  <Label htmlFor="achievement" className="font-normal cursor-pointer text-[13px]">Achievement</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="growth" id="growth" {...register("motivationType")} />
                  <Label htmlFor="growth" className="font-normal cursor-pointer text-[13px]">Growth</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="curiosity" id="curiosity" {...register("motivationType")} />
                  <Label htmlFor="curiosity" className="font-normal cursor-pointer text-[13px]">Curiosity</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="impact" id="impact" {...register("motivationType")} />
                  <Label htmlFor="impact" className="font-normal cursor-pointer text-[13px]">Impact</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-[13px] font-medium text-[#cccccc]">
                What typically triggers your deepest focus?
              </Label>
              <Input
                className="mt-2 bg-[#1e1e1e] border-[#2d2d30] text-[#cccccc] placeholder:text-[#858585] focus:border-[#007acc] focus:ring-1 focus:ring-[#007acc] rounded-md h-8 text-[13px]"
                placeholder="e.g., Tight deadlines, personal interest, external pressure..."
                {...register("focusTrigger")}
              />
            </div>

            <div>
              <Label className="text-[13px] font-medium text-[#cccccc]">
                How do you define success for yourself?
              </Label>
              <Textarea
                className="mt-2 min-h-[80px] bg-[#1e1e1e] border-[#2d2d30] text-[#cccccc] placeholder:text-[#858585] focus:border-[#007acc] focus:ring-1 focus:ring-[#007acc] rounded-md text-[13px]"
                placeholder="Your personal definition of success..."
                {...register("successDefinition")}
              />
            </div>
          </div>
        </section>

        {/* Behavioral Rhythms */}
        <section className="space-y-4 pt-6">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#2d2d30]">
            <div className="w-1 h-5 bg-[#ce9178] rounded-sm" />
            <h3 className="text-[13px] font-semibold text-white uppercase tracking-wide">
              Behavioral Rhythms
            </h3>
          </div>

          <div className="space-y-6">
            <div>
              <Label className="text-[13px] font-medium text-[#cccccc]">
                How consistent are your daily routines?
              </Label>
              <RadioGroup className="mt-2 flex flex-wrap gap-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very-consistent" id="very-consistent" {...register("consistency")} />
                  <Label htmlFor="very-consistent" className="font-normal cursor-pointer text-[13px]">Very Consistent</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="somewhat" id="somewhat" {...register("consistency")} />
                  <Label htmlFor="somewhat" className="font-normal cursor-pointer text-[13px]">Somewhat</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unpredictable" id="unpredictable" {...register("consistency")} />
                  <Label htmlFor="unpredictable" className="font-normal cursor-pointer text-[13px]">Unpredictable</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-[13px] font-medium text-[#cccccc]">
                How often do you reflect on your day or week?
              </Label>
              <RadioGroup className="mt-2 flex flex-wrap gap-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="daily" id="daily" {...register("reflectionFrequency")} />
                  <Label htmlFor="daily" className="font-normal cursor-pointer text-[13px]">Daily</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weekly" id="weekly" {...register("reflectionFrequency")} />
                  <Label htmlFor="weekly" className="font-normal cursor-pointer text-[13px]">Weekly</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="occasionally" id="occasionally" {...register("reflectionFrequency")} />
                  <Label htmlFor="occasionally" className="font-normal cursor-pointer text-[13px]">Occasionally</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rarely" id="reflect-rarely" {...register("reflectionFrequency")} />
                  <Label htmlFor="reflect-rarely" className="font-normal cursor-pointer text-[13px]">Rarely</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-[13px] font-medium text-[#cccccc]">
                When you feel off balance, what helps you reset?
              </Label>
              <Input
                className="mt-2 bg-[#1e1e1e] border-[#2d2d30] text-[#cccccc] placeholder:text-[#858585] focus:border-[#007acc] focus:ring-1 focus:ring-[#007acc] rounded-md h-8 text-[13px]"
                placeholder="e.g., Music, nature, journaling, exercise..."
                {...register("resetStrategy")}
              />
            </div>
          </div>
        </section>

        {/* Social & Self-Perception */}
        <section className="space-y-4 pt-6">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-[#2d2d30]">
            <div className="w-1 h-5 bg-[#569cd6] rounded-sm" />
            <h3 className="text-[13px] font-semibold text-white uppercase tracking-wide">
              Social & Self-Perception
            </h3>
          </div>

          <div className="space-y-6">
            <div>
              <Label className="text-[13px] font-medium text-[#cccccc]">
                How much social interaction do you typically have per week?
              </Label>
              <RadioGroup className="mt-2 flex flex-wrap gap-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="minimal" id="minimal" {...register("socialLevel")} />
                  <Label htmlFor="minimal" className="font-normal cursor-pointer text-[13px]">Minimal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderate" id="moderate" {...register("socialLevel")} />
                  <Label htmlFor="moderate" className="font-normal cursor-pointer text-[13px]">Moderate</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="frequent" id="frequent" {...register("socialLevel")} />
                  <Label htmlFor="frequent" className="font-normal cursor-pointer text-[13px]">Frequent</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very-frequent" id="very-frequent" {...register("socialLevel")} />
                  <Label htmlFor="very-frequent" className="font-normal cursor-pointer text-[13px]">Very Frequent</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-[13px] font-medium text-[#cccccc]">
                How do you typically recharge?
              </Label>
              <RadioGroup className="mt-2 flex flex-wrap gap-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="alone" id="alone" {...register("rechargeMethod")} />
                  <Label htmlFor="alone" className="font-normal cursor-pointer text-[13px]">Alone time</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="social" id="social" {...register("rechargeMethod")} />
                  <Label htmlFor="social" className="font-normal cursor-pointer text-[13px]">Social time</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="both" id="both" {...register("rechargeMethod")} />
                  <Label htmlFor="both" className="font-normal cursor-pointer text-[13px]">Both</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-[13px] font-medium text-[#cccccc]">
                How well do you think you understand yourself?
              </Label>
              <RadioGroup className="mt-2 flex flex-wrap gap-3">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very-well" id="very-well" {...register("selfUnderstanding")} />
                  <Label htmlFor="very-well" className="font-normal cursor-pointer text-[13px]">Very well</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fairly-well" id="fairly-well" {...register("selfUnderstanding")} />
                  <Label htmlFor="fairly-well" className="font-normal cursor-pointer text-[13px]">Fairly well</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="somewhat" id="understand-somewhat" {...register("selfUnderstanding")} />
                  <Label htmlFor="understand-somewhat" className="font-normal cursor-pointer text-[13px]">Somewhat</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unsure" id="unsure" {...register("selfUnderstanding")} />
                  <Label htmlFor="unsure" className="font-normal cursor-pointer text-[13px]">Unsure</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-[13px] font-medium text-[#cccccc]">
                What part of yourself are you most interested in understanding better?
              </Label>
              <Textarea
                className="mt-2 min-h-[80px] bg-[#1e1e1e] border-[#2d2d30] text-[#cccccc] placeholder:text-[#858585] focus:border-[#007acc] focus:ring-1 focus:ring-[#007acc] rounded-md text-[13px]"
                placeholder="Your focus of growth or curiosity..."
                {...register("selfImprovementFocus")}
              />
            </div>
          </div>
        </section>
      </div>

      {/* VS Code-style Footer */}
      <div className="flex-shrink-0 border-t border-[#2d2d30] bg-[#1e1e1e] px-6 py-4 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => reset()}
          disabled={isSubmitting}
          className="h-8 px-3 text-[12px] text-[#cccccc] hover:bg-[#2d2d30] hover:text-white border border-[#2d2d30] rounded-md transition-all duration-200"
        >
          Reset Form
        </Button>
        
        <div className="flex items-center gap-3">
          {computedBaseline && (
            <div className="flex items-center gap-3 text-[12px] px-3 py-1.5 bg-[#252526] border border-[#2d2d30] rounded-md">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="h-3 w-3 text-[#007acc]" />
                <span className="text-[#858585]">Index:</span>
                <span className="text-[#007acc] font-mono font-semibold">{computedBaseline.scores.baseline_index}</span>
              </div>
              <div className="w-px h-3 bg-[#2d2d30]" />
              <div className="flex items-center gap-1.5">
                <span className="text-[#858585]">Confidence:</span>
                <span className="text-[#4ec9b0] font-mono font-semibold">{computedBaseline.scores.confidence}%</span>
              </div>
            </div>
          )}
          
          <Button
            type="submit"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting || isComputing}
            className="h-8 px-4 text-[12px] bg-[#007acc] hover:bg-[#005a9e] text-white border-none rounded-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#007acc]/20 font-medium"
          >
            {isComputing ? (
              <>
                <Loader2 className="mr-1.5 h-3 w-3 animate-spin" />
                Computing...
              </>
            ) : isSubmitting ? (
              <>
                <Save className="mr-1.5 h-3 w-3" />
                Saving...
              </>
            ) : computedBaseline ? (
              "Recompute Baseline"
            ) : (
              "Compute Baseline"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
