"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexUser } from "@/hooks/useConvexUser";
import {
  MessageSquare,
  Star,
  Send,
  Loader2,
  CheckCircle2,
} from "lucide-react";

interface FeedbackFormData {
  email: string;
  overallRating: number;
  mostValuableFeature: string;
  leastValuableFeature: string;
  easeOfUse: number;
  dataAccuracy: number;
  helpfulnessLevel: number;
  improvementSuggestions: string;
  featureRequests: string;
  privacyConcerns: string;
  recommendToFriend: number;
  additionalComments: string;
}

function StarRating({ rating, onRatingChange, label }: { rating: number; onRatingChange: (rating: number) => void; label: string }) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
            aria-label={`${star} star${star > 1 ? 's' : ''}`}
            title={`Rate ${star} star${star > 1 ? 's' : ''}`}
            className={`p-1 transition-colors rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 ${
              star <= rating ? "text-yellow-500" : "text-zinc-300 dark:text-zinc-600 hover:text-yellow-300"
            }`}
          >
            <Star className="h-5 w-5 fill-current" />
          </button>
        ))}
      </div>
    </div>
  );
}

export function FeedbackForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState<FeedbackFormData>({
    email: "",
    overallRating: 0,
    mostValuableFeature: "",
    leastValuableFeature: "",
    easeOfUse: 0,
    dataAccuracy: 0,
    helpfulnessLevel: 0,
    improvementSuggestions: "",
    featureRequests: "",
    privacyConcerns: "",
    recommendToFriend: 0,
    additionalComments: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { userId, isAuthenticated } = useConvexUser();
  const submitUserFeedback = useMutation(api.shared.feedback.feedback.submitUserFeedback);

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleStarRating = (field: string, rating: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: rating
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      await submitUserFeedback({
        userId: isAuthenticated ? userId : undefined,
        email: formData.email || undefined,
        overallRating: formData.overallRating,
        mostValuableFeature: formData.mostValuableFeature || undefined,
        leastValuableFeature: formData.leastValuableFeature || undefined,
        easeOfUse: formData.easeOfUse,
        dataAccuracy: formData.dataAccuracy,
        helpfulnessLevel: formData.helpfulnessLevel,
        improvementSuggestions: formData.improvementSuggestions || undefined,
        featureRequests: formData.featureRequests || undefined,
        privacyConcerns: formData.privacyConcerns || undefined,
        recommendToFriend: formData.recommendToFriend,
        additionalComments: formData.additionalComments || undefined,
      });
      
      setSubmitSuccess(true);
      
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      setError(error instanceof Error ? error.message : "Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitSuccess) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-500" />
        </div>
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          Thank you for your feedback!
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Your insights help us improve Soloist for everyone.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email Address <span className="text-zinc-500">(optional)</span>
        </Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          placeholder="your@email.com"
          className="h-9"
        />
      </div>

      <div className="space-y-4">
        <StarRating
          rating={formData.overallRating}
          onRatingChange={(rating) => handleStarRating("overallRating", rating)}
          label="Overall satisfaction with Soloist *"
        />

        <div className="grid grid-cols-2 gap-4">
          <StarRating
            rating={formData.easeOfUse}
            onRatingChange={(rating) => handleStarRating("easeOfUse", rating)}
            label="Ease of use *"
          />
          <StarRating
            rating={formData.dataAccuracy}
            onRatingChange={(rating) => handleStarRating("dataAccuracy", rating)}
            label="Accuracy of insights *"
          />
          <StarRating
            rating={formData.helpfulnessLevel}
            onRatingChange={(rating) => handleStarRating("helpfulnessLevel", rating)}
            label="How helpful is Soloist? *"
          />
          <StarRating
            rating={formData.recommendToFriend}
            onRatingChange={(rating) => handleStarRating("recommendToFriend", rating)}
            label="Recommend to a friend? *"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="mostValuable" className="text-sm font-medium">
            Most valuable feature
          </Label>
          <select
            id="mostValuable"
            title="Select the most valuable feature"
            value={formData.mostValuableFeature}
            onChange={(e) => handleInputChange("mostValuableFeature", e.target.value)}
            className="w-full h-9 px-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-sm"
          >
            <option value="">Select a feature</option>
            <option value="mood-tracking">Daily mood tracking</option>
            <option value="ai-insights">AI-powered insights</option>
            <option value="mood-forecasting">Mood forecasting</option>
            <option value="data-visualization">Data visualization</option>
            <option value="pattern-recognition">Pattern recognition</option>
            <option value="goal-setting">Goal setting</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="leastValuable" className="text-sm font-medium">
            Least valuable feature
          </Label>
          <select
            id="leastValuable"
            title="Select the least valuable feature"
            value={formData.leastValuableFeature}
            onChange={(e) => handleInputChange("leastValuableFeature", e.target.value)}
            className="w-full h-9 px-3 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-md text-sm"
          >
            <option value="">Select a feature</option>
            <option value="mood-tracking">Daily mood tracking</option>
            <option value="ai-insights">AI-powered insights</option>
            <option value="mood-forecasting">Mood forecasting</option>
            <option value="data-visualization">Data visualization</option>
            <option value="pattern-recognition">Pattern recognition</option>
            <option value="goal-setting">Goal setting</option>
            <option value="none">All features are valuable</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="improvements" className="text-sm font-medium">
            How can we improve Soloist?
          </Label>
          <Textarea
            id="improvements"
            value={formData.improvementSuggestions}
            onChange={(e) => handleInputChange("improvementSuggestions", e.target.value)}
            placeholder="Share your ideas for improvements..."
            rows={3}
            className="resize-none text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="features" className="text-sm font-medium">
            Feature requests
          </Label>
          <Textarea
            id="features"
            value={formData.featureRequests}
            onChange={(e) => handleInputChange("featureRequests", e.target.value)}
            placeholder="What features would you like to see?"
            rows={3}
            className="resize-none text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="comments" className="text-sm font-medium">
            Additional comments
          </Label>
          <Textarea
            id="comments"
            value={formData.additionalComments}
            onChange={(e) => handleInputChange("additionalComments", e.target.value)}
            placeholder="Anything else you'd like to share?"
            rows={3}
            className="resize-none text-sm"
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          className="h-9"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || formData.overallRating === 0}
          className="h-9 bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Submitting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Submit Feedback
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export function FeedbackCard({ showFeedback, onToggle }: { showFeedback: boolean; onToggle: () => void }) {
  if (!showFeedback) return null;
  
  return (
    <div id="feedback" className="mb-12 scroll-mt-8">
      <Card className="border-emerald-200 dark:border-emerald-800 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
            Share Your Feedback
          </CardTitle>
          <CardDescription>
            Help us improve Soloist with your insights and suggestions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FeedbackForm onClose={onToggle} />
        </CardContent>
      </Card>
    </div>
  );
}
