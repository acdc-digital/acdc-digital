"use client";

import React from "react";
import { ArrowRight, Calendar, TrendingUp, Sparkles, Shield, BarChart3, Settings } from "lucide-react";

export default function UserGuidePage() {

  return (
    <div className="max-w-4xl ml-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold tracking-tight mb-4">User Guide</h1>
        <p className="text-xl text-muted-foreground">
          A complete walkthrough of the Soloist experience, from your first day to becoming a power user
        </p>
      </div>

      {/* Introduction */}
      <section id="what-is-soloist" className="mb-16">
        <h2 className="text-3xl font-bold mb-4">What is Soloist?</h2>
        <p className="text-lg text-foreground/80 mb-4 leading-relaxed">
          Soloist is a mood tracking and forecasting application that helps you understand your emotional patterns. Think of it as a weather app, but for your mood. Just like you check the weather to plan your day, Soloist helps you anticipate and prepare for your emotional state.
        </p>
        <p className="text-lg text-foreground/80 leading-relaxed">
          The core idea is simple: by logging how you feel each day, our AI can identify patterns and predict how you might feel in the future. This gives you the power to prepare, adjust, and take control of your emotional well-being.
        </p>
      </section>

      {/* Getting Started */}
      <section id="getting-started" className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xl font-bold text-primary">1</span>
          </div>
          <h2 className="text-3xl font-bold">Getting Started</h2>
        </div>

        <div className="space-y-6 ml-13">
          <div className="border-l-2 border-primary/20 pl-6 py-2">
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Sign Up & Authentication
            </h3>
            <p className="text-foreground/80 mb-3 leading-relaxed">
              When you first visit Soloist, you'll be prompted to create an account. We use secure authentication to protect your data - your mood logs are personal and private.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              <strong>Why we do it this way:</strong> Your emotional data is sensitive. By requiring authentication, we ensure that only you can access your logs and predictions. We never share your data with third parties.
            </p>
          </div>

          <div className="border-l-2 border-primary/20 pl-6 py-2">
            <h3 className="text-xl font-semibold mb-3">Subscription Setup</h3>
            <p className="text-foreground/80 mb-3 leading-relaxed">
              After signing up, you'll be prompted to choose a subscription plan. Soloist is a subscription-based service that gives you access to the full app, including AI forecasting and unlimited log entries.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              <strong>Why we do it this way:</strong> The AI forecasting feature uses advanced machine learning that has real costs. A subscription model allows us to maintain high-quality predictions and keep improving the service while keeping your data private (we don't sell ads or data).
            </p>
          </div>
        </div>
      </section>

      {/* Daily Logging */}
      <section id="daily-logging" className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xl font-bold text-primary">2</span>
          </div>
          <h2 className="text-3xl font-bold">Your Daily Logging Routine</h2>
        </div>

        <div className="space-y-6 ml-13">
          <div className="border-l-2 border-blue-200 dark:border-blue-900 pl-6 py-2">
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Creating Your First Log
            </h3>
            <p className="text-foreground/80 mb-3 leading-relaxed">
              Each day, you'll log your mood by answering a series of questions and providing a score from 0-100. This takes about 2-3 minutes. You can log anytime during the day, but we recommend doing it at the same time each day for consistency.
            </p>
            <div className="bg-muted/50 p-4 rounded-lg mb-3">
              <p className="font-semibold mb-2">A typical log includes:</p>
              <ul className="space-y-1 text-sm text-foreground/80">
                <li>• <strong>Emotion Score (0-100):</strong> How you're feeling overall</li>
                <li>• <strong>Activities:</strong> What you did today (exercise, socializing, work, etc.)</li>
                <li>• <strong>Notes:</strong> Any additional context or thoughts</li>
                <li>• <strong>Custom Questions:</strong> Any personalized tracking you've set up</li>
              </ul>
            </div>
            <p className="text-foreground/80 leading-relaxed">
              <strong>Why we do it this way:</strong> The 0-100 scale gives us granular data to work with. Unlike simple "good/bad/neutral" options, a numeric score helps the AI detect subtle patterns. The activities and notes provide context that makes predictions more accurate.
            </p>
          </div>

          <div className="border-l-2 border-blue-200 dark:border-blue-900 pl-6 py-2">
            <h3 className="text-xl font-semibold mb-3">Editing Past Logs</h3>
            <p className="text-foreground/80 mb-3 leading-relaxed">
              You can always go back and edit previous logs. Maybe you forgot to log yesterday, or you want to add more detail to an entry. Simply navigate to the date you want to edit and update it.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              <strong>Why we do it this way:</strong> Life is unpredictable, and sometimes you forget to log. We use an "upsert" system (update or insert) that automatically handles whether you're creating a new log or updating an existing one, preventing duplicates and making the experience seamless.
            </p>
          </div>

          <div className="border-l-2 border-blue-200 dark:border-blue-900 pl-6 py-2">
            <h3 className="text-xl font-semibold mb-3">Building Your History</h3>
            <p className="text-foreground/80 mb-3 leading-relaxed">
              In your first few days, you're building your data foundation. The app will track your logs, but forecasting isn't available yet. You need at least 4 consecutive days of logs before the AI can generate predictions.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              <strong>Why we do it this way:</strong> The AI needs enough data to identify patterns. Four days is the minimum to detect trends and make reasonable predictions. Think of it like training - the more data you provide, the smarter the AI becomes about your specific patterns.
            </p>
          </div>
        </div>
      </section>

      {/* Forecasting */}
      <section id="forecasts" className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xl font-bold text-primary">3</span>
          </div>
          <h2 className="text-3xl font-bold">Understanding Forecasts</h2>
        </div>

        <div className="space-y-6 ml-13">
          <div className="border-l-2 border-purple-200 dark:border-purple-900 pl-6 py-2">
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Generating Your First Forecast
            </h3>
            <p className="text-foreground/80 mb-3 leading-relaxed">
              Once you have 4 days of logs, you'll see a "Generate Forecast" button. Click it, and within a few seconds, the AI will analyze your patterns and predict your mood for the next 3 days.
            </p>
            <div className="bg-muted/50 p-4 rounded-lg mb-3">
              <p className="font-semibold mb-2">What the AI analyzes:</p>
              <ul className="space-y-1 text-sm text-foreground/80">
                <li>• Your mood scores over the past 4 days</li>
                <li>• Activities that correlate with higher or lower scores</li>
                <li>• Trends (are you improving or declining?)</li>
                <li>• Day-of-week patterns (maybe you're always happier on Fridays)</li>
                <li>• Context from your notes</li>
              </ul>
            </div>
            <p className="text-foreground/80 leading-relaxed">
              <strong>Why we do it this way:</strong> We use advanced language models (AI) to understand the nuance in your data. Unlike simple statistical models, our AI can understand the meaning behind your activities and notes, not just the numbers. This makes predictions more accurate and personalized.
            </p>
          </div>

          <div className="border-l-2 border-purple-200 dark:border-purple-900 pl-6 py-2">
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-600" />
              The 7-Day View
            </h3>
            <p className="text-foreground/80 mb-3 leading-relaxed">
              Your main forecast screen shows a 7-day view: 3 days of past data (your actual logs), today, and 3 days of future predictions. This layout helps you see trends and compare predictions to reality.
            </p>
            <div className="bg-muted/50 p-4 rounded-lg mb-3">
              <p className="font-semibold mb-2">Each day shows:</p>
              <ul className="space-y-1 text-sm text-foreground/80">
                <li>• <strong>Emotion Score:</strong> Predicted or actual (0-100)</li>
                <li>• <strong>Description:</strong> "Excellent Day," "Challenging Day," etc.</li>
                <li>• <strong>Trend:</strong> Arrow showing if you're trending up, down, or stable</li>
                <li>• <strong>Details:</strong> Explanation of why the AI made this prediction</li>
                <li>• <strong>Recommendations:</strong> Suggestions based on the forecast</li>
                <li>• <strong>Confidence:</strong> How sure the AI is about this prediction</li>
              </ul>
            </div>
            <p className="text-foreground/80 leading-relaxed">
              <strong>Why we do it this way:</strong> The 7-day view gives you context. You can see if you're in an upward or downward trend, and the past data helps you understand how accurate previous predictions were. This builds trust in the system and helps you learn your patterns.
            </p>
          </div>

          <div className="border-l-2 border-purple-200 dark:border-purple-900 pl-6 py-2">
            <h3 className="text-xl font-semibold mb-3">Using Predictions</h3>
            <p className="text-foreground/80 mb-3 leading-relaxed">
              When you see a forecast predicting a difficult day ahead, you can prepare. Maybe you schedule lighter work, plan a self-care activity, or reach out to a friend. When you see a great day coming, you might tackle challenging projects or plan social activities.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              <strong>Why we do it this way:</strong> The goal isn't to perfectly predict your mood (that's impossible - life is unpredictable). The goal is to give you awareness. With awareness comes agency - you can make choices to improve difficult days or maximize good ones.
            </p>
          </div>

          <div className="border-l-2 border-purple-200 dark:border-purple-900 pl-6 py-2">
            <h3 className="text-xl font-semibold mb-3">Rating Predictions</h3>
            <p className="text-foreground/80 mb-3 leading-relaxed">
              After each predicted day passes, you can give it a thumbs up or thumbs down based on accuracy. This feedback helps track how well the forecasts are working for you.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              <strong>Why we do it this way:</strong> Your feedback creates a feedback loop. While it doesn't directly retrain the AI (that happens at the system level), it helps you and us understand accuracy trends. Plus, it makes you more aware of whether the forecasts match reality.
            </p>
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section id="advanced-features" className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xl font-bold text-primary">4</span>
          </div>
          <h2 className="text-3xl font-bold">Advanced Features</h2>
        </div>

        <div className="space-y-6 ml-13">
          <div className="border-l-2 border-green-200 dark:border-green-900 pl-6 py-2">
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <Settings className="w-5 h-5 text-green-600" />
              Custom Templates
            </h3>
            <p className="text-foreground/80 mb-3 leading-relaxed">
              You can create custom logging templates with your own questions. Maybe you want to track sleep quality, caffeine intake, or time spent outdoors. Templates let you personalize what you track.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              <strong>Why we do it this way:</strong> Everyone's mood is influenced by different factors. Custom templates let you track what matters to YOU. The AI then learns correlations between these custom factors and your mood, making predictions even more personalized.
            </p>
          </div>

          <div className="border-l-2 border-green-200 dark:border-green-900 pl-6 py-2">
            <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              Historical Analysis
            </h3>
            <p className="text-foreground/80 mb-3 leading-relaxed">
              You can view all your past logs, see trends over weeks and months, and export your data. The app keeps your complete history so you can look back and see long-term patterns.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              <strong>Why we do it this way:</strong> Long-term trends often reveal insights that day-to-day tracking misses. Maybe you notice seasonal patterns, or you realize that a certain activity consistently improves your mood. Your data is yours forever, and you can export it anytime.
            </p>
          </div>

          <div className="border-l-2 border-green-200 dark:border-green-900 pl-6 py-2">
            <h3 className="text-xl font-semibold mb-3">Retrospective Forecast Analysis</h3>
            <p className="text-foreground/80 mb-3 leading-relaxed">
              This advanced feature tests the AI by generating "retrospective" forecasts. It pretends each past day is "today," generates a forecast, then compares it to what actually happened. This gives you an accuracy report.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              <strong>Why we do it this way:</strong> This is how we validate and improve the forecasting system. By testing predictions against known outcomes, we can measure accuracy and identify areas for improvement. It also builds your confidence in the system when you see the accuracy scores.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy & Data */}
      <section id="privacy" className="mb-16">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-xl font-bold text-primary">5</span>
          </div>
          <h2 className="text-3xl font-bold">Privacy & Your Data</h2>
        </div>

        <div className="space-y-6 ml-13">
          <div className="border-l-2 border-amber-200 dark:border-amber-900 pl-6 py-2">
            <h3 className="text-xl font-semibold mb-3">What We Store</h3>
            <p className="text-foreground/80 mb-3 leading-relaxed">
              We store your logs, forecasts, and account information in a secure database. Your data is encrypted and isolated - only you can access it through your authenticated account.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              <strong>Why we do it this way:</strong> Security and privacy are paramount for mood tracking. We use industry-standard security practices, and your data never leaves our secure infrastructure without your explicit action (like exporting).
            </p>
          </div>

          <div className="border-l-2 border-amber-200 dark:border-amber-900 pl-6 py-2">
            <h3 className="text-xl font-semibold mb-3">Exporting Your Data</h3>
            <p className="text-foreground/80 mb-3 leading-relaxed">
              You can export all your data at any time in JSON format. This includes your profile, all logs, custom attributes, and subscription info. It's your data, and you can take it with you.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              <strong>Why we do it this way:</strong> Data portability is important. Whether you want a backup, need to comply with data requests, or decide to move to another service, your data should be accessible and portable.
            </p>
          </div>

          <div className="border-l-2 border-amber-200 dark:border-amber-900 pl-6 py-2">
            <h3 className="text-xl font-semibold mb-3">Deleting Your Account</h3>
            <p className="text-foreground/80 mb-3 leading-relaxed">
              You can permanently delete your account and all associated data at any time. This action is irreversible and removes everything - logs, forecasts, subscription records, and your profile.
            </p>
            <p className="text-foreground/80 leading-relaxed">
              <strong>Why we do it this way:</strong> You have the right to be forgotten. When you delete your account, we remove ALL traces of your data from our systems. This is required by privacy laws like GDPR, and it's the right thing to do.
            </p>
          </div>
        </div>
      </section>

      {/* Best Practices */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">Best Practices for Success</h2>
        
        <div className="grid gap-6">
          <div className="border rounded-lg p-6 bg-card">
            <h3 className="text-xl font-semibold mb-3">📅 Log Consistently</h3>
            <p className="text-foreground/80 leading-relaxed">
              Try to log at the same time each day. Consistency improves accuracy because the AI can account for time-of-day patterns. Morning logs might look different from evening logs.
            </p>
          </div>

          <div className="border rounded-lg p-6 bg-card">
            <h3 className="text-xl font-semibold mb-3">✍️ Be Honest</h3>
            <p className="text-foreground/80 leading-relaxed">
              There's no "right" answer for your mood score. Be honest about how you feel. The AI learns your patterns, not some idealized version. Accuracy comes from authenticity.
            </p>
          </div>

          <div className="border rounded-lg p-6 bg-card">
            <h3 className="text-xl font-semibold mb-3">📝 Add Context</h3>
            <p className="text-foreground/80 leading-relaxed">
              The notes field is powerful. Mention specific events, stressors, or positive experiences. This helps the AI understand what drives your mood changes and makes better predictions.
            </p>
          </div>

          <div className="border rounded-lg p-6 bg-card">
            <h3 className="text-xl font-semibold mb-3">🔄 Review Regularly</h3>
            <p className="text-foreground/80 leading-relaxed">
              Look back at past logs and compare them to forecasts. You'll start noticing patterns you weren't aware of. This self-awareness is often more valuable than the forecasts themselves.
            </p>
          </div>

          <div className="border rounded-lg p-6 bg-card">
            <h3 className="text-xl font-semibold mb-3">💡 Use Predictions Wisely</h3>
            <p className="text-foreground/80 leading-relaxed">
              Forecasts are tools, not destiny. If you see a difficult day predicted, you have the power to change it through your choices. The prediction is an opportunity to be proactive, not a limitation.
            </p>
          </div>

          <div className="border rounded-lg p-6 bg-card">
            <h3 className="text-xl font-semibold mb-3">⏳ Give It Time</h3>
            <p className="text-foreground/80 leading-relaxed">
              The AI gets smarter as you use it more. The first predictions might be rough, but after a few weeks, patterns emerge and accuracy improves. Stick with it for at least 30 days to see the full benefit.
            </p>
          </div>
        </div>
      </section>

      {/* Troubleshooting */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold mb-6">Common Questions & Troubleshooting</h2>
        
        <div className="space-y-6">
          <div className="border-l-4 border-primary pl-6">
            <h3 className="text-lg font-semibold mb-2">Why can't I generate a forecast yet?</h3>
            <p className="text-foreground/80 leading-relaxed">
              You need at least 4 consecutive days of logs before the AI can identify patterns. Make sure you've logged your mood for 4 days in a row, then the "Generate Forecast" button will appear.
            </p>
          </div>

          <div className="border-l-4 border-primary pl-6">
            <h3 className="text-lg font-semibold mb-2">The forecast seems inaccurate. Why?</h3>
            <p className="text-foreground/80 leading-relaxed">
              Accuracy improves with more data. If you've only been using the app for a week, the AI is still learning your patterns. Also, life is unpredictable - unexpected events can change your mood in ways the AI couldn't anticipate. The goal is to identify general trends, not predict every day perfectly.
            </p>
          </div>

          <div className="border-l-4 border-primary pl-6">
            <h3 className="text-lg font-semibold mb-2">Can I skip a day and still get forecasts?</h3>
            <p className="text-foreground/80 leading-relaxed">
              Yes, but it's not ideal. The AI uses your most recent consecutive logs. If you skip a day, you'll need to rebuild a 4-day streak before generating new forecasts. Consistency is key.
            </p>
          </div>

          <div className="border-l-4 border-primary pl-6">
            <h3 className="text-lg font-semibold mb-2">How do I change my subscription?</h3>
            <p className="text-foreground/80 leading-relaxed">
              Go to your account settings to manage your subscription. You can upgrade, downgrade, or cancel at any time. If you cancel, you'll retain access until the end of your current billing period.
            </p>
          </div>

          <div className="border-l-4 border-primary pl-6">
            <h3 className="text-lg font-semibold mb-2">What happens to my data if I cancel?</h3>
            <p className="text-foreground/80 leading-relaxed">
              Your data remains intact even if you cancel your subscription. You can reactivate anytime and pick up where you left off. If you want to permanently delete everything, you'll need to explicitly delete your account.
            </p>
          </div>

          <div className="border-l-4 border-primary pl-6">
            <h3 className="text-lg font-semibold mb-2">Can I use this as a replacement for therapy?</h3>
            <p className="text-foreground/80 leading-relaxed">
              No. Soloist is a tracking and awareness tool, not a medical device or replacement for professional mental health care. If you're struggling with your mental health, please seek help from a qualified therapist or counselor.
            </p>
          </div>
        </div>
      </section>

      {/* Next Steps */}
      <section className="mb-16">
        <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-lg p-8 border">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-foreground/80 mb-6 leading-relaxed">
            The best time to start tracking your mood was yesterday. The second best time is today. Begin your journey to better emotional awareness and take control of your well-being.
          </p>
          <div className="flex gap-4">
            <a
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Go to App
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/wiki"
              className="inline-flex items-center gap-2 px-6 py-3 border border-border rounded-lg font-semibold hover:bg-muted transition-colors"
            >
              View API Documentation
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
