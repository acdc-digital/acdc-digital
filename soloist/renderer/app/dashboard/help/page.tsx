"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useConvexUser } from "@/hooks/useConvexUser";
import {
  BookOpen,
  Calendar,
  Brain,
  BarChart3,
  Target,
  Zap,
  Heart,
  TrendingUp,
  MessageSquare,
  Star,
  Send,
  Loader2,
  CheckCircle2,
} from "lucide-react";

export default function HelpPage() {
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [formData, setFormData] = useState({
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
        setFormData({
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
        setShowFeedback(false);
        setSubmitSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      setError(error instanceof Error ? error.message : "Failed to submit feedback. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const StarRating = ({ rating, onRatingChange, label }: { rating: number; onRatingChange: (rating: number) => void; label: string }) => {
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
  };

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const tableOfContents = [
    { id: "what-is", label: "What is Soloist", icon: BookOpen },
    { id: "how-it-works", label: "How It Works", icon: Brain },
    { id: "getting-started", label: "Getting Started", icon: Target },
    { id: "core-features", label: "Core Features", icon: Zap },
    { id: "scores", label: "Understanding Scores", icon: BarChart3 },
    { id: "privacy", label: "Privacy & Security", icon: Heart },
    { id: "tips", label: "Tips for Success", icon: TrendingUp },
    { id: "support", label: "Need Help?", icon: MessageSquare },
  ];

  return (
    <div className="h-full flex">
      {/* Table of Contents Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="sticky top-0 p-6">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">Quick Navigation</h2>
          </div>
          <nav className="space-y-1">
            {tableOfContents.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeSection === item.id
                      ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-medium"
                      : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
            <button
              onClick={() => setShowFeedback(!showFeedback)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                showFeedback
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-medium"
                  : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/50"
              }`}
            >
              <MessageSquare className="h-4 w-4" />
              Share Feedback
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="max-w-4xl mx-auto px-8 py-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <BookOpen className="h-6 w-6 text-blue-600" />
                <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">Soloist User Guide</h1>
              </div>
              <Badge variant="outline" className="border-blue-500 text-blue-600 font-medium">
                Complete User Manual & Getting Started Guide
              </Badge>
            </div>

            {/* Feedback Section */}
            {showFeedback && (
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
                    {submitSuccess ? (
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
                    ) : (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                          <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                          </div>
                        )}

                        {/* Contact Info */}
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

                        {/* Ratings */}
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

                        {/* Feature Dropdowns */}
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="mostValuable" className="text-sm font-medium">
                              Most valuable feature
                            </Label>
                            <select
                              id="mostValuable"
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

                        {/* Text Areas */}
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

                        {/* Submit Button */}
                        <div className="flex justify-end gap-3 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowFeedback(false)}
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
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Content Sections */}
            <div className="space-y-12">
              {/* What is Soloist */}
              <section id="what-is" className="scroll-mt-8">
                <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">What is Soloist</h2>
                <p className="text-zinc-700 dark:text-zinc-300 text-base leading-relaxed mb-6">
                  Soloist is a mood tracking and forecasting application that helps you understand 
                  your emotional patterns and predict future well-being. By logging your daily experiences, 
                  Soloist creates personalized insights that empower you to take control of your mental health.
                </p>
                
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-6">
                  <h4 className="font-semibold mb-4 text-zinc-900 dark:text-zinc-100">Key Benefits:</h4>
                  <ul className="list-disc pl-6 text-zinc-700 dark:text-zinc-300 space-y-2">
                    <li>Track daily mood patterns with visual heatmaps</li>
                    <li>Get predictions about future emotional states</li>
                    <li>Identify triggers and patterns in your well-being</li>
                    <li>Make data-driven decisions about your mental health</li>
                  </ul>
                </div>
              </section>

              {/* How It Works */}
              <section id="how-it-works" className="scroll-mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <Brain className="h-6 w-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">How Soloist Works</h2>
                </div>
                <p className="text-zinc-700 dark:text-zinc-300 text-base leading-relaxed mb-6">
                  Soloist transforms your daily experiences into actionable insights through a simple four-step process. 
                  From quick daily logs to AI-powered predictions, here's how we help you understand and improve your well-being.
                </p>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Daily Logging Workflow</h3>
                    <div className="space-y-4 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      <p>
                        <strong>1. Create Daily Logs:</strong> Access "Create New Log" from the sidebar. 
                        Capture mood, activities, sleep, and reflections instantly.
                      </p>
                      <p>
                        <strong>2. Personalized Daily Insights:</strong> Solomon analyzes your entries and generates 
                        personalized feed summaries with recommendations and mood scores (0-100).
                      </p>
                      <p>
                        <strong>3. Organization & Memory:</strong> Tag entries and add comments for context. 
                        Complete historical tracking enables pattern recognition and trend analysis.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Advanced Analytics & Forecasting</h3>
                    <div className="space-y-4 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      <p>
                        <strong>1. Soloist View:</strong> Access 7-day emotional forecasting to predict your mood patterns 
                        and plan ahead for better days.
                      </p>
                      <p>
                        <strong>2. Interactive Calendar:</strong> View your entire year with color-coded daily scores. 
                        Click any day for detailed insights and track long-term trends.
                      </p>
                      <p>
                        <strong>3. Pattern Recognition:</strong> Discover hidden connections in your data with 
                        advanced analytics and behavioral correlations.
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Personalization & Settings</h3>
                    <div className="space-y-4 text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      <p>
                        <strong>1. Personal Attributes:</strong> Configure your profile with name, goals, and objectives 
                        to enable more personalized AI-generated insights and recommendations.
                      </p>
                      <p>
                        <strong>2. Generator Assistant Setup:</strong> Customize how random daily logs are generated 
                        with personalized instructions that reflect your lifestyle and preferences.
                      </p>
                      <p>
                        <strong>3. Enhanced AI Context:</strong> Provide detailed background information to help Solomon 
                        deliver more accurate mood analysis and contextually relevant suggestions.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Getting Started */}
              <section id="getting-started" className="scroll-mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <Target className="h-6 w-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Getting Started</h2>
                </div>
                <p className="text-zinc-700 dark:text-zinc-300 text-base leading-relaxed mb-6">
                  Transform your mental health journey in four simple steps. Start tracking today and see meaningful insights within your first week.
                </p>
                
                <div className="space-y-6">
                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">1</div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Set Up Your Profile</h4>
                      <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        Access Settings from the sidebar to configure your name, goals, and objectives. This personalizes your AI insights.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">2</div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Log Your First Day</h4>
                      <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        Spend 2-3 minutes capturing your mood, sleep, activities, and reflections. Solomon immediately generates your first insights.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Build Your Pattern</h4>
                      <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        Continue daily logging for one week. Watch your personal heatmap emerge and discover patterns you never noticed.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 items-start">
                    <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">4</div>
                    <div className="space-y-2">
                      <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Unlock Predictions</h4>
                      <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                        Access AI-powered forecasting in the Soloist view, advanced analytics, and personalized recommendations to optimize your well-being.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Core Features */}
              <section id="core-features" className="scroll-mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="h-6 w-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Core Features</h2>
                </div>
                <p className="text-zinc-700 dark:text-zinc-300 text-base leading-relaxed mb-6">
                  Powerful tools designed to help you understand, predict, and improve your emotional well-being.
                </p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-zinc-50 dark:bg-zinc-800/30 rounded-lg p-6 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <Calendar className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Interactive Heatmap</h4>
                    </div>
                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      Visualize your entire year with color-coded daily scores. Click any day for detailed insights and track long-term trends.
                    </p>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-800/30 rounded-lg p-6 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <BarChart3 className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Advanced Analytics</h4>
                    </div>
                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      Deep-dive into patterns with charts, correlations, and statistical insights that reveal hidden connections in your data.
                    </p>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-800/30 rounded-lg p-6 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">AI Mood Forecasting</h4>
                    </div>
                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      Predict future emotional states with 85% accuracy. Plan ahead and take proactive steps for better days.
                    </p>
                  </div>

                  <div className="bg-zinc-50 dark:bg-zinc-800/30 rounded-lg p-6 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 transition-colors">
                    <div className="flex items-center gap-3 mb-3">
                      <Target className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-zinc-900 dark:text-zinc-100">Smart Recommendations</h4>
                    </div>
                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      Receive personalized suggestions based on your patterns to maintain good days and improve challenging ones.
                    </p>
                  </div>
                </div>
              </section>

              {/* Understanding Your Scores */}
              <section id="scores" className="scroll-mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <BarChart3 className="h-6 w-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Understanding Your Scores</h2>
                </div>
                
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-6">
                  <p className="text-zinc-700 dark:text-zinc-300 text-base leading-relaxed mb-6">
                    Solomon evaluates your daily logs and assigns a score from 0-100, mapping to ten distinct color categories that represent your overall well-being:
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-4 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/50">
                      <div className="w-5 h-5 bg-indigo-500 rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">90-100 • INDIGO</div>
                        <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">Exceptional day with strong positive emotions, high energy, and significant achievements</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/50">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">80-89 • BLUE</div>
                        <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">Very good day, predominantly positive experiences and successful coping</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/50">
                      <div className="w-5 h-5 bg-sky-400 rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">70-79 • SKY</div>
                        <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">Good day, more positive than negative, manageable challenges</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/50">
                      <div className="w-5 h-5 bg-teal-500 rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">60-69 • TEAL</div>
                        <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">Fairly positive, some moderate challenges with adequate coping</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/50">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">50-59 • GREEN</div>
                        <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">Balanced day, mix of ups and downs but generally steady</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/50">
                      <div className="w-5 h-5 bg-lime-400 rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">40-49 • LIME</div>
                        <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">Slightly below average, more challenges than successes</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/50">
                      <div className="w-5 h-5 bg-yellow-400 rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">30-39 • YELLOW</div>
                        <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">Difficult day with noticeable setbacks and stress</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/50">
                      <div className="w-5 h-5 bg-amber-500 rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">20-29 • AMBER</div>
                        <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">Very challenging day with significant negative emotions</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/50">
                      <div className="w-5 h-5 bg-rose-500 rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">10-19 • ROSE</div>
                        <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">Extremely difficult day with severe distress</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900/50">
                      <div className="w-5 h-5 bg-red-600 rounded-full flex-shrink-0"></div>
                      <div className="flex-1">
                        <div className="font-semibold text-zinc-900 dark:text-zinc-100">0-9 • RED</div>
                        <div className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">Crisis level, severe distress and inability to function</div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                      <strong>How it works:</strong> Solomon analyzes your mood ratings, sleep patterns, activities, and reflections to generate these scores. 
                      The color-coded system helps you quickly identify patterns and trends in your emotional well-being over time.
                    </p>
                  </div>
                </div>
              </section>

              {/* Privacy & Security */}
              <section id="privacy" className="scroll-mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <Heart className="h-6 w-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Privacy & Security</h2>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-6">
                  <ul className="list-disc pl-6 text-zinc-700 dark:text-zinc-300 space-y-3 leading-relaxed">
                    <li><strong>Your data is private:</strong> Only you can see your personal logs and insights</li>
                    <li><strong>Encrypted storage:</strong> All data is encrypted both in transit and at rest</li>
                    <li><strong>No data selling:</strong> We never sell or share your personal information</li>
                    <li><strong>Open source:</strong> Our code is transparent and auditable</li>
                    <li><strong>Data ownership:</strong> You can export or delete your data at any time</li>
                  </ul>
                </div>
              </section>

              {/* Tips for Success */}
              <section id="tips" className="scroll-mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <TrendingUp className="h-6 w-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Tips for Success</h2>
                </div>
                <div className="space-y-4 ml-4">
                  <div className="flex gap-4 items-start">
                    <div className="w-3 h-3 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      <strong>Be consistent:</strong> Log daily, even on busy days. Consistency improves accuracy.
                    </p>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-3 h-3 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      <strong>Be honest:</strong> Accurate logs lead to better insights and predictions.
                    </p>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-3 h-3 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      <strong>Review regularly:</strong> Check your heatmap and analytics weekly to spot trends.
                    </p>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-3 h-3 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      <strong>Use forecasts:</strong> Plan ahead based on predicted mood patterns in the Soloist view.
                    </p>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="w-3 h-3 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      <strong>Set goals:</strong> Use custom objectives in Settings to work toward specific well-being targets.
                    </p>
                  </div>
                </div>
              </section>

              {/* Support */}
              <section id="support" className="scroll-mt-8">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                  <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Need Help?</h2>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-6">
                  <p className="text-zinc-700 dark:text-zinc-300 text-base leading-relaxed mb-4">
                    If you have questions or need support, we're here to help:
                  </p>
                  <ul className="list-disc pl-6 text-zinc-700 dark:text-zinc-300 space-y-2 leading-relaxed">
                    <li>Email us at: <strong>msimon@acdc.digital</strong></li>
                    <li>Join our community on GitHub</li>
                    <li>Check out our FAQ section on the website</li>
                  </ul>
                </div>
              </section>

              {/* Footer */}
              <section className="pt-8 border-t border-zinc-200 dark:border-zinc-700">
                <p className="text-sm text-zinc-700 dark:text-zinc-300 text-center leading-relaxed">
                  Soloist. | Take control of tomorrow, today.
                </p>
              </section>
            </div>
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
