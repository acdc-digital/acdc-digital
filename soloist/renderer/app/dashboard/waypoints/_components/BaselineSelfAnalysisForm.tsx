"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Loader2, CheckCircle2, TrendingUp } from "lucide-react";

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

export function BaselineSelfAnalysisForm() {
  const { register, handleSubmit, reset, watch, formState } = useForm<BaselineFormValues>({
    mode: "onChange",
  });

  const saveBaselineAnswers = useMutation(api.baseline.saveBaselineAnswers);
  const computePrimaryBaseline = useMutation(api.baseline.computePrimaryBaseline);
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
      await saveBaselineAnswers({
        answers: data,
      });
      
      // Compute the deterministic baseline
      const result = await computePrimaryBaseline();
      setComputeResult(result);
      
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
    <Card className="max-w-3xl mx-auto border-2 border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-sm shadow-lg">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
            Baseline Self-Analysis
          </CardTitle>
          {saveStatus === "saving" && (
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Saving...</span>
            </div>
          )}
          {saveStatus === "saved" && (
            <div className="flex items-center gap-2 text-sm text-emerald-600">
              <CheckCircle2 className="h-4 w-4" />
              <span>Saved</span>
            </div>
          )}
        </div>
        <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
          Help Soloist understand your emotional rhythm, thought patterns, and what drives you.
          This baseline will help personalize your insights and recommendations.
        </p>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Emotional Landscape */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full" />
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Emotional Landscape
            </h3>
          </div>

          <div className="space-y-6 pl-3">
            <div>
              <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                How often do you experience strong emotions?
              </Label>
              <RadioGroup className="mt-3 flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rarely" id="rarely" {...register("emotionalFrequency")} />
                  <Label htmlFor="rarely" className="font-normal cursor-pointer">Rarely</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sometimes" id="sometimes" {...register("emotionalFrequency")} />
                  <Label htmlFor="sometimes" className="font-normal cursor-pointer">Sometimes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="often" id="often" {...register("emotionalFrequency")} />
                  <Label htmlFor="often" className="font-normal cursor-pointer">Often</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="constantly" id="constantly" {...register("emotionalFrequency")} />
                  <Label htmlFor="constantly" className="font-normal cursor-pointer">Constantly</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                When stressed, how long does it take you to recover?
              </Label>
              <Input
                className="mt-2"
                placeholder="e.g., A few hours, a day, several days..."
                {...register("stressRecovery")}
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                What's your typical baseline mood?
              </Label>
              <RadioGroup className="mt-3 flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="optimistic" id="optimistic" {...register("typicalMood")} />
                  <Label htmlFor="optimistic" className="font-normal cursor-pointer">Optimistic</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="neutral" id="neutral" {...register("typicalMood")} />
                  <Label htmlFor="neutral" className="font-normal cursor-pointer">Neutral</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cautious" id="cautious" {...register("typicalMood")} />
                  <Label htmlFor="cautious" className="font-normal cursor-pointer">Cautious</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="varies" id="varies" {...register("typicalMood")} />
                  <Label htmlFor="varies" className="font-normal cursor-pointer">Varies widely</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Describe what a good day feels like for you
              </Label>
              <Textarea
                className="mt-2 min-h-[100px]"
                placeholder="What does a calm, happy, or productive day look like for you?"
                {...register("goodDayDescription")}
              />
            </div>
          </div>
        </section>

        <Separator className="my-8" />

        {/* Cognitive Patterns */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full" />
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Cognitive Patterns
            </h3>
          </div>

          <div className="space-y-6 pl-3">
            <div>
              <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                When making decisions, do you rely more on logic or instinct?
              </Label>
              <RadioGroup className="mt-3 flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="logic" id="logic" {...register("decisionStyle")} />
                  <Label htmlFor="logic" className="font-normal cursor-pointer">Logic</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="balanced" id="balanced" {...register("decisionStyle")} />
                  <Label htmlFor="balanced" className="font-normal cursor-pointer">Balanced</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="instinct" id="instinct" {...register("decisionStyle")} />
                  <Label htmlFor="instinct" className="font-normal cursor-pointer">Instinct</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                How often do you overthink or second-guess yourself?
              </Label>
              <RadioGroup className="mt-3 flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rarely" id="overthink-rarely" {...register("overthinking")} />
                  <Label htmlFor="overthink-rarely" className="font-normal cursor-pointer">Rarely</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sometimes" id="overthink-sometimes" {...register("overthinking")} />
                  <Label htmlFor="overthink-sometimes" className="font-normal cursor-pointer">Sometimes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="often" id="overthink-often" {...register("overthinking")} />
                  <Label htmlFor="overthink-often" className="font-normal cursor-pointer">Often</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="constantly" id="overthink-constantly" {...register("overthinking")} />
                  <Label htmlFor="overthink-constantly" className="font-normal cursor-pointer">Constantly</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                When faced with a setback, your first reaction is usually to...
              </Label>
              <Input
                className="mt-2"
                placeholder="e.g., Analyze what went wrong, blame yourself, move on quickly..."
                {...register("reactionToSetback")}
              />
            </div>
          </div>
        </section>

        <Separator className="my-8" />

        {/* Motivation & Focus */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-emerald-500 to-emerald-600 rounded-full" />
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Motivation & Focus
            </h3>
          </div>

          <div className="space-y-6 pl-3">
            <div>
              <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                What motivates you most when pursuing goals?
              </Label>
              <RadioGroup className="mt-3 flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="achievement" id="achievement" {...register("motivationType")} />
                  <Label htmlFor="achievement" className="font-normal cursor-pointer">Achievement</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="growth" id="growth" {...register("motivationType")} />
                  <Label htmlFor="growth" className="font-normal cursor-pointer">Growth</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="curiosity" id="curiosity" {...register("motivationType")} />
                  <Label htmlFor="curiosity" className="font-normal cursor-pointer">Curiosity</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="impact" id="impact" {...register("motivationType")} />
                  <Label htmlFor="impact" className="font-normal cursor-pointer">Impact</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                What typically triggers your deepest focus?
              </Label>
              <Input
                className="mt-2"
                placeholder="e.g., Tight deadlines, personal interest, external pressure..."
                {...register("focusTrigger")}
              />
            </div>

            <div>
              <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                How do you define success for yourself?
              </Label>
              <Textarea
                className="mt-2 min-h-[100px]"
                placeholder="Your personal definition of success..."
                {...register("successDefinition")}
              />
            </div>
          </div>
        </section>

        <Separator className="my-8" />

        {/* Behavioral Rhythms */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full" />
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Behavioral Rhythms
            </h3>
          </div>

          <div className="space-y-6 pl-3">
            <div>
              <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                How consistent are your daily routines?
              </Label>
              <RadioGroup className="mt-3 flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very-consistent" id="very-consistent" {...register("consistency")} />
                  <Label htmlFor="very-consistent" className="font-normal cursor-pointer">Very Consistent</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="somewhat" id="somewhat" {...register("consistency")} />
                  <Label htmlFor="somewhat" className="font-normal cursor-pointer">Somewhat</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unpredictable" id="unpredictable" {...register("consistency")} />
                  <Label htmlFor="unpredictable" className="font-normal cursor-pointer">Unpredictable</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                How often do you reflect on your day or week?
              </Label>
              <RadioGroup className="mt-3 flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="daily" id="daily" {...register("reflectionFrequency")} />
                  <Label htmlFor="daily" className="font-normal cursor-pointer">Daily</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="weekly" id="weekly" {...register("reflectionFrequency")} />
                  <Label htmlFor="weekly" className="font-normal cursor-pointer">Weekly</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="occasionally" id="occasionally" {...register("reflectionFrequency")} />
                  <Label htmlFor="occasionally" className="font-normal cursor-pointer">Occasionally</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="rarely" id="reflect-rarely" {...register("reflectionFrequency")} />
                  <Label htmlFor="reflect-rarely" className="font-normal cursor-pointer">Rarely</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                When you feel off balance, what helps you reset?
              </Label>
              <Input
                className="mt-2"
                placeholder="e.g., Music, nature, journaling, exercise..."
                {...register("resetStrategy")}
              />
            </div>
          </div>
        </section>

        <Separator className="my-8" />

        {/* Social & Self-Perception */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1 h-6 bg-gradient-to-b from-pink-500 to-pink-600 rounded-full" />
            <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Social & Self-Perception
            </h3>
          </div>

          <div className="space-y-6 pl-3">
            <div>
              <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                How much social interaction do you typically have per week?
              </Label>
              <RadioGroup className="mt-3 flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="minimal" id="minimal" {...register("socialLevel")} />
                  <Label htmlFor="minimal" className="font-normal cursor-pointer">Minimal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="moderate" id="moderate" {...register("socialLevel")} />
                  <Label htmlFor="moderate" className="font-normal cursor-pointer">Moderate</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="frequent" id="frequent" {...register("socialLevel")} />
                  <Label htmlFor="frequent" className="font-normal cursor-pointer">Frequent</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very-frequent" id="very-frequent" {...register("socialLevel")} />
                  <Label htmlFor="very-frequent" className="font-normal cursor-pointer">Very Frequent</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                How do you typically recharge?
              </Label>
              <RadioGroup className="mt-3 flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="alone" id="alone" {...register("rechargeMethod")} />
                  <Label htmlFor="alone" className="font-normal cursor-pointer">Alone time</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="social" id="social" {...register("rechargeMethod")} />
                  <Label htmlFor="social" className="font-normal cursor-pointer">Social time</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="both" id="both" {...register("rechargeMethod")} />
                  <Label htmlFor="both" className="font-normal cursor-pointer">Both</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                How well do you think you understand yourself?
              </Label>
              <RadioGroup className="mt-3 flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="very-well" id="very-well" {...register("selfUnderstanding")} />
                  <Label htmlFor="very-well" className="font-normal cursor-pointer">Very well</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="fairly-well" id="fairly-well" {...register("selfUnderstanding")} />
                  <Label htmlFor="fairly-well" className="font-normal cursor-pointer">Fairly well</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="somewhat" id="understand-somewhat" {...register("selfUnderstanding")} />
                  <Label htmlFor="understand-somewhat" className="font-normal cursor-pointer">Somewhat</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unsure" id="unsure" {...register("selfUnderstanding")} />
                  <Label htmlFor="unsure" className="font-normal cursor-pointer">Unsure</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <Label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                What part of yourself are you most interested in understanding better?
              </Label>
              <Textarea
                className="mt-2 min-h-[100px]"
                placeholder="Your focus of growth or curiosity..."
                {...register("selfImprovementFocus")}
              />
            </div>
          </div>
        </section>
      </CardContent>

      <CardFooter className="flex justify-between pt-6 border-t border-zinc-200 dark:border-zinc-800">
        <Button 
          variant="outline" 
          onClick={() => reset()}
          disabled={isSubmitting}
        >
          Reset Form
        </Button>
        
        <div className="flex items-center gap-4">
          {computedBaseline && (
            <div className="text-sm text-zinc-600 dark:text-zinc-400">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                <span>
                  Baseline Index: <strong className="text-blue-600 dark:text-blue-400">{computedBaseline.scores.baseline_index}</strong>
                  {" • "}
                  Confidence: <strong className="text-emerald-600 dark:text-emerald-400">{computedBaseline.scores.confidence}%</strong>
                </span>
              </div>
            </div>
          )}
          
          <Button 
            type="submit" 
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting || isComputing}
            className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700"
          >
            {isComputing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Computing...
              </>
            ) : isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : computedBaseline ? (
              "Recompute Baseline"
            ) : (
              "Compute Baseline"
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
