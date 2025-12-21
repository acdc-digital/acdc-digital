"use client";

import React from "react";
import { AnnotatedDashboard, FeatureSection } from "./AnnotatedDashboard";
import {
  Callout,
  Subtitle,
  Section,
  Cards,
  Card,
  Steps,
  Step,
  Tabs,
  Tab,
  Divider,
  ScoreTable,
  List,
  ListItem,
} from "./GuideComponents";

export function UserGuide() {
  return (
    <div className="text-zinc-100">
      {/* Header */}
      <h1 className="text-4xl font-bold mb-2">Welcome to Soloist</h1>
      <Subtitle>Your personal mood tracking and forecasting companion</Subtitle>

      <p className="text-zinc-300 mb-8">
        Soloist is a mood tracking and forecasting application that helps you understand your emotional patterns and predict future well-being. By logging your daily experiences, Soloist creates personalized insights that empower you to take control of your mental health.
      </p>

      {/* Dashboard Overview */}
      <Section title="Dashboard Overview">
        <p className="text-zinc-300 mb-4">
          Explore the main dashboard interface. Click any numbered circle to jump to its explanation.
        </p>

        <AnnotatedDashboard />

        <h3 className="text-xl font-semibold text-zinc-100 mt-8 mb-4">Interface Elements</h3>

        <FeatureSection id="feature-sidebar" number={1} title="Navigation Sidebar">
          The sidebar provides quick access to all main views: Heatmap (calendar view), Base (daily feed), Soloist (forecasting), Canvas (notes), Guide (this page), and Service (settings). Click any icon to switch between views.
        </FeatureSection>

        <FeatureSection id="feature-year-nav" number={2} title="Year Navigation">
          Navigate between years using the arrow buttons or dropdown. View historical data from previous years or plan ahead for the future.
        </FeatureSection>

        <FeatureSection id="feature-filters" number={3} title="Filter Controls">
          Filter your heatmap view by specific criteria like mood ranges, tags, or date ranges. Useful for analyzing patterns in specific contexts.
        </FeatureSection>

        <FeatureSection id="feature-view-toggle" number={4} title="View Toggle">
          Switch between Log view (create/edit entries) and Feed view (browse your daily summaries and AI-generated insights).
        </FeatureSection>

        <FeatureSection id="feature-stats" number={5} title="Stats Summary">
          Quick overview showing your total number of logs and average mood score. Track your consistency and overall well-being at a glance.
        </FeatureSection>

        <FeatureSection id="feature-heatmap" number={6} title="Heatmap Calendar">
          The main calendar view showing your entire year. Each cell represents a day, color-coded by your mood score. Click any day to view or edit that day&apos;s log.
        </FeatureSection>

        <FeatureSection id="feature-legend" number={7} title="Score Legend">
          Reference guide for the color-coding system. Hover over any color to highlight all days in that score range. Scores range from 0-9 (red/crisis) to 90-100 (indigo/exceptional).
        </FeatureSection>

        <FeatureSection id="feature-log-form" number={8} title="Daily Log Form">
          The form panel for creating or editing daily entries. Switch between Daily Log (structured data) and Notes (freeform text) tabs.
        </FeatureSection>

        <FeatureSection id="feature-templates" number={9} title="Template Selector">
          Choose from preset templates or create custom ones. Templates pre-configure which sliders and fields appear, tailored to different tracking needs.
        </FeatureSection>

        <FeatureSection id="feature-sliders" number={10} title="Mood Sliders">
          Rate different aspects of your day on a 0-10 scale. Default categories include Overall Mood, Work Satisfaction, Personal Life, and Work-Life Balance. Customize these in your template.
        </FeatureSection>

        <FeatureSection id="feature-wellness" number={11} title="Wellness Tracking">
          Track basic wellness metrics like hours of sleep and exercise. These factors correlate with mood and help Solomon provide better insights.
        </FeatureSection>

        <FeatureSection id="feature-selected-day" number={12} title="Selected Day Indicator">
          The currently selected day is highlighted. Click any day on the heatmap to select it and load its data in the log form.
        </FeatureSection>
      </Section>

      <Divider />

      <Callout variant="info" title="Quick Start">
        Get started in just 4 steps: Set up your profile, log your first day, build your pattern over a week, and unlock AI-powered predictions.
      </Callout>

      {/* Key Benefits */}
      <Section title="Key Benefits">
        <Cards columns={2}>
          <Card title="Track Patterns" icon="calendar" horizontal>
            Visualize daily mood patterns with interactive heatmaps
          </Card>
          <Card title="Get Predictions" icon="trending-up" horizontal>
            AI-powered forecasts of future emotional states
          </Card>
          <Card title="Identify Triggers" icon="search" horizontal>
            Discover patterns and triggers in your well-being
          </Card>
          <Card title="Data-Driven Decisions" icon="bar-chart-3" horizontal>
            Make informed choices about your mental health
          </Card>
        </Cards>
      </Section>

      <Divider />

      {/* How Soloist Works */}
      <Section title="How Soloist Works">
        <p className="text-zinc-300 mb-4">
          Soloist transforms your daily experiences into actionable insights through a simple process.
        </p>

        <Tabs>
          <Tab value="Daily Logging">
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">Daily Logging Workflow</h3>
            <Steps>
              <Step title="Create Daily Logs" icon="plus-circle">
                Access &quot;Create New Log&quot; from the sidebar. Capture mood, activities, sleep, and reflections instantly.
              </Step>
              <Step title="Personalized Insights" icon="sparkles">
                Solomon analyzes your entries and generates personalized feed summaries with recommendations and mood scores (0-100).
              </Step>
              <Step title="Organization & Memory" icon="folder">
                Tag entries and add comments for context. Complete historical tracking enables pattern recognition and trend analysis.
              </Step>
            </Steps>
          </Tab>
          <Tab value="Analytics">
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">Advanced Analytics & Forecasting</h3>
            <Steps>
              <Step title="Soloist View" icon="eye">
                Access 7-day emotional forecasting to predict your mood patterns and plan ahead for better days.
              </Step>
              <Step title="Interactive Calendar" icon="calendar">
                View your entire year with color-coded daily scores. Click any day for detailed insights and track long-term trends.
              </Step>
              <Step title="Pattern Recognition" icon="brain">
                Discover hidden connections in your data with advanced analytics and behavioral correlations.
              </Step>
            </Steps>
          </Tab>
          <Tab value="Personalization">
            <h3 className="text-lg font-semibold text-zinc-100 mb-4">Personalization & Settings</h3>
            <Steps>
              <Step title="Personal Attributes" icon="user">
                Configure your profile with name, goals, and objectives to enable more personalized AI-generated insights.
              </Step>
              <Step title="Generator Assistant" icon="wand">
                Customize how random daily logs are generated with personalized instructions that reflect your lifestyle.
              </Step>
              <Step title="Enhanced AI Context" icon="message-square">
                Provide detailed background information to help Solomon deliver more accurate mood analysis.
              </Step>
            </Steps>
          </Tab>
        </Tabs>
      </Section>

      <Divider />

      {/* Getting Started */}
      <Section title="Getting Started">
        <p className="text-zinc-300 mb-4">
          Transform your mental health journey in four simple steps:
        </p>
        <Steps>
          <Step title="Set Up Your Profile" icon="settings">
            Access Settings from the sidebar to configure your name, goals, and objectives. This personalizes your AI insights.
          </Step>
          <Step title="Log Your First Day" icon="edit">
            Spend 2-3 minutes capturing your mood, sleep, activities, and reflections. Solomon immediately generates your first insights.
          </Step>
          <Step title="Build Your Pattern" icon="layers">
            Continue daily logging for one week. Watch your personal heatmap emerge and discover patterns you never noticed.
          </Step>
          <Step title="Unlock Predictions" icon="rocket">
            Access AI-powered forecasting in the Soloist view, advanced analytics, and personalized recommendations to optimize your well-being.
          </Step>
        </Steps>
      </Section>

      <Divider />

      {/* Core Features */}
      <Section title="Core Features">
        <Cards columns={2}>
          <Card title="Interactive Heatmap" icon="grid-3x3" horizontal>
            Visualize your entire year with color-coded daily scores. Click any day for detailed insights and track long-term trends.
          </Card>
          <Card title="Advanced Analytics" icon="bar-chart-3" horizontal>
            Deep-dive into patterns with charts, correlations, and statistical insights that reveal hidden connections in your data.
          </Card>
          <Card title="AI Mood Forecasting" icon="trending-up" horizontal>
            Predict future emotional states with 85% accuracy. Plan ahead and take proactive steps for better days.
          </Card>
          <Card title="Smart Recommendations" icon="lightbulb" horizontal>
            Receive personalized suggestions based on your patterns to maintain good days and improve challenging ones.
          </Card>
        </Cards>
      </Section>

      <Divider />

      {/* Understanding Your Scores */}
      <Section title="Understanding Your Scores">
        <p className="text-zinc-300 mb-4">
          Solomon evaluates your daily logs and assigns a score from 0-100, mapping to ten distinct color categories:
        </p>
        <ScoreTable />
        <Callout variant="note" title="How Scoring Works">
          Solomon analyzes your mood ratings, sleep patterns, activities, and reflections to generate these scores. The color-coded system helps you quickly identify patterns and trends over time.
        </Callout>
      </Section>

      <Divider />

      {/* Privacy & Security */}
      <Section title="Privacy & Security">
        <Callout variant="info" title="Your Data is Protected">
          We take your privacy seriously. All your personal data is protected with enterprise-grade security measures.
        </Callout>
        <List>
          <ListItem><strong>Your data is private</strong> — Only you can see your personal logs and insights</ListItem>
          <ListItem><strong>Encrypted storage</strong> — All data is encrypted both in transit and at rest</ListItem>
          <ListItem><strong>No data selling</strong> — We never sell or share your personal information</ListItem>
          <ListItem><strong>Open source</strong> — Our code is transparent and auditable</ListItem>
          <ListItem><strong>Data ownership</strong> — You can export or delete your data at any time</ListItem>
        </List>
      </Section>

      <Divider />

      {/* Tips for Success */}
      <Section title="Tips for Success">
        <Callout variant="tip" title="Best Practices for Accurate Tracking">
          Follow these guidelines to get the most out of Soloist and improve the accuracy of your predictions.
        </Callout>
        <Steps>
          <Step title="Be Consistent" icon="repeat">
            Log daily, even on busy days. Consistency improves the accuracy of your predictions and pattern recognition.
          </Step>
          <Step title="Be Honest" icon="heart">
            Accurate logs lead to better insights and predictions. Don&apos;t sugarcoat your entries.
          </Step>
          <Step title="Review Regularly" icon="eye">
            Check your heatmap and analytics weekly to spot trends and understand your patterns.
          </Step>
          <Step title="Use Forecasts" icon="compass">
            Plan ahead based on predicted mood patterns in the Soloist view.
          </Step>
          <Step title="Set Goals" icon="target">
            Use custom objectives in Settings to work toward specific well-being targets.
          </Step>
        </Steps>
      </Section>

      <Divider />

      {/* Need Help */}
      <Section title="Need Help?">
        <Cards columns={3}>
          <Card title="Email Support" icon="mail" horizontal>
            msimon@acdc.digital
          </Card>
          <Card title="Community" icon="users" horizontal>
            Join us on GitHub
          </Card>
          <Card title="FAQ" icon="help-circle" horizontal>
            Visit our website
          </Card>
        </Cards>
      </Section>

      <Divider />

      <Callout variant="info">
        <strong>Soloist</strong> — Take control of tomorrow, today.
      </Callout>
    </div>
  );
}
