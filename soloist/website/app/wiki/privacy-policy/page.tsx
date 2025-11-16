"use client";

import React from "react";
import { Shield, Mail, Calendar } from "lucide-react";

export default function PrivacyPolicyPage() {
  const lastUpdated = "January 2025";

  return (
    <div className="max-w-4xl ml-8">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <Shield className="h-8 w-8 text-primary" />
          <h1 className="text-5xl font-bold tracking-tight">Privacy Policy</h1>
        </div>
        <p className="text-xl text-muted-foreground">
          Last updated: {lastUpdated} • Effective Date: {lastUpdated}
        </p>
      </div>

      <div className="space-y-8 text-base leading-relaxed">
        {/* Introduction */}
        <section>
          <h2 className="text-3xl font-bold mb-4">Introduction</h2>
          <p className="text-foreground/80 mb-4">
            Welcome to SoloPro ("we," "our," or "us"). This Privacy Policy explains how ACDC.digital 
            collects, uses, discloses, and safeguards your information when you use our mood tracking 
            and AI-powered forecasting application and related services.
          </p>
          <p className="text-foreground/80">
            SoloPro is designed to help you track your daily well-being through personalized logs, 
            AI-powered scoring (0-100), and visual heatmaps. We are committed to protecting your 
            privacy and ensuring the security of your personal and emotional data.
          </p>
        </section>

        {/* Information We Collect */}
        <section>
          <h2 className="text-3xl font-bold mb-4">Information We Collect</h2>
          
          <h3 className="text-xl font-semibold mb-3">Personal Information</h3>
          <ul className="list-disc pl-6 mb-6 text-foreground/80 space-y-2">
            <li>Account information (email address, username)</li>
            <li>Profile information you choose to provide</li>
            <li>Communication preferences and settings</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">Daily Log Data</h3>
          <ul className="list-disc pl-6 mb-6 text-foreground/80 space-y-2">
            <li>Daily mood entries and personal reflections</li>
            <li>Custom objectives and personal goals you set</li>
            <li>Daily experiences and activities you record</li>
            <li>AI-generated scores (0-100) based on your entries</li>
            <li>Timestamps and frequency of app usage</li>
          </ul>

          <h3 className="text-xl font-semibold mb-3">Technical Information</h3>
          <ul className="list-disc pl-6 text-foreground/80 space-y-2">
            <li>Device information and operating system</li>
            <li>Browser type and version</li>
            <li>IP address and general location data</li>
            <li>App performance and error logs</li>
          </ul>
        </section>

        {/* How We Use Your Information */}
        <section>
          <h2 className="text-3xl font-bold mb-4">How We Use Your Information</h2>
          <ul className="list-disc pl-6 text-foreground/80 space-y-3">
            <li><strong>Core Functionality:</strong> Process your daily logs and generate AI-powered mood scores and forecasts</li>
            <li><strong>Personalization:</strong> Create customized heatmaps and analytics based on your unique patterns</li>
            <li><strong>Insights & Analytics:</strong> Provide trend analysis and predictive insights about your well-being</li>
            <li><strong>Service Improvement:</strong> Enhance our AI algorithms and user experience</li>
            <li><strong>Communication:</strong> Send important updates, security alerts, and feature announcements</li>
            <li><strong>Support:</strong> Provide customer service and technical assistance</li>
          </ul>
        </section>

        {/* AI and Data Processing */}
        <section>
          <h2 className="text-3xl font-bold mb-4">AI Processing & Solomon</h2>
          <p className="text-foreground/80 mb-4">
            Our AI system "Solomon" analyzes your daily log entries to generate mood scores and forecasts. 
            This processing:
          </p>
          <ul className="list-disc pl-6 text-foreground/80 space-y-2">
            <li>Occurs securely within our systems</li>
            <li>Uses anonymized and aggregated data patterns</li>
            <li>Does not share your personal entries with third parties</li>
            <li>Continuously improves through machine learning while protecting your privacy</li>
          </ul>
        </section>

        {/* Data Storage and Security */}
        <section>
          <h2 className="text-3xl font-bold mb-4">Data Storage and Security</h2>
          <p className="text-foreground/80 mb-4">
            We use Convex, a secure serverless database platform, to store your data. Our security measures include:
          </p>
          <ul className="list-disc pl-6 text-foreground/80 space-y-2">
            <li>End-to-end encryption for data transmission</li>
            <li>Encrypted storage of all personal and mood data</li>
            <li>Regular security audits and monitoring</li>
            <li>Access controls and authentication protocols</li>
            <li>Secure backup and disaster recovery procedures</li>
          </ul>
        </section>

        {/* Data Sharing */}
        <section>
          <h2 className="text-3xl font-bold mb-4">Information Sharing</h2>
          <p className="text-foreground/80 mb-4">
            We do not sell, trade, or rent your personal information. We may share information only in these limited circumstances:
          </p>
          <ul className="list-disc pl-6 text-foreground/80 space-y-2">
            <li><strong>With Your Consent:</strong> When you explicitly authorize sharing</li>
            <li><strong>Service Providers:</strong> Trusted partners who help operate our service (under strict confidentiality agreements)</li>
            <li><strong>Legal Requirements:</strong> When required by law or to protect rights and safety</li>
            <li><strong>Business Transfers:</strong> In the event of a merger or acquisition (with continued privacy protection)</li>
          </ul>
        </section>

        {/* Your Rights */}
        <section>
          <h2 className="text-3xl font-bold mb-4">Your Privacy Rights</h2>
          <p className="text-foreground/80 mb-4">You have the right to:</p>
          <ul className="list-disc pl-6 text-foreground/80 space-y-2">
            <li><strong>Access:</strong> Request a copy of your personal data</li>
            <li><strong>Correction:</strong> Update or correct inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
            <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
            <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
            <li><strong>Restriction:</strong> Limit how we process your information</li>
          </ul>
        </section>

        {/* Data Retention */}
        <section>
          <h2 className="text-3xl font-bold mb-4">Data Retention</h2>
          <p className="text-foreground/80">
            We retain your data for as long as your account is active or as needed to provide services. 
            Daily logs and mood data are kept to maintain the continuity of your heatmaps and analytics. 
            You can request deletion of your data at any time, after which we will securely delete your 
            information within 30 days, except where retention is required by law.
          </p>
        </section>

        {/* Children's Privacy */}
        <section>
          <h2 className="text-3xl font-bold mb-4">Children's Privacy</h2>
          <p className="text-foreground/80">
            SoloPro is not intended for children under 13 years of age. We do not knowingly collect 
            personal information from children under 13. If you believe we have collected information 
            from a child under 13, please contact us immediately.
          </p>
        </section>

        {/* International Users */}
        <section>
          <h2 className="text-3xl font-bold mb-4">International Users</h2>
          <p className="text-foreground/80">
            SoloPro is operated from Canada. If you are accessing our service from outside Canada, 
            please be aware that your information may be transferred to, stored, and processed in Canada 
            where our servers are located and our central database is operated.
          </p>
        </section>

        {/* Changes to Privacy Policy */}
        <section>
          <h2 className="text-3xl font-bold mb-4">Changes to This Privacy Policy</h2>
          <p className="text-foreground/80">
            We may update this Privacy Policy from time to time. We will notify you of any changes by 
            posting the new Privacy Policy on this page and updating the "Last updated" date. 
            Significant changes will be communicated via email or in-app notification.
          </p>
        </section>

        {/* Contact Information */}
        <section>
          <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
          <p className="text-foreground/80 mb-4">
            If you have any questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <div className="bg-muted/50 rounded-lg p-6 space-y-3">
            <div className="flex items-center gap-3 text-foreground/80">
              <Mail className="h-5 w-5" />
              <span>Email: msimon@acdc.digital</span>
            </div>
            <div className="flex items-center gap-3 text-foreground/80">
              <Calendar className="h-5 w-5" />
              <span>ACDC.digital, Halifax, Nova Scotia, Canada</span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <section className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            © 2025 ACDC.digital. All rights reserved. SoloPro is a trademark of ACDC.digital.
          </p>
        </section>
      </div>
    </div>
  );
}
