"use client";

import React from "react";
import { FileText, Mail, Calendar } from "lucide-react";

export default function TermsOfServicePage() {
  const lastUpdated = "January 2025";

  return (
    <div className="max-w-4xl ml-8">
      {/* Header */}
      <div className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="h-8 w-8 text-primary" />
          <h1 className="text-5xl font-bold tracking-tight">Terms of Service</h1>
        </div>
        <p className="text-xl text-muted-foreground">
          Last updated: {lastUpdated} • Effective Date: {lastUpdated}
        </p>
      </div>

      <div className="space-y-8 text-base leading-relaxed">
        {/* Introduction */}
        <section>
          <h2 className="text-3xl font-bold mb-4">Agreement to Terms</h2>
          <p className="text-foreground/80 mb-4">
            Welcome to SoloPro, operated by ACDC.digital ("we," "our," or "us"). These Terms of Service 
            ("Terms") govern your use of our mood tracking and AI-powered forecasting application and 
            related services (collectively, the "Service").
          </p>
          <p className="text-foreground/80">
            By accessing or using SoloPro, you agree to be bound by these Terms. If you disagree with 
            any part of these terms, then you may not access the Service.
          </p>
        </section>

        {/* Service Description */}
        <section>
          <h2 className="text-3xl font-bold mb-4">Service Description</h2>
          <p className="text-foreground/80 mb-4">
            SoloPro is a personal well-being application that provides:
          </p>
          <ul className="list-disc pl-6 text-foreground/80 space-y-2">
            <li>Daily mood and wellness tracking through customizable logs</li>
            <li>AI-powered scoring system (0-100) via our "Solomon" algorithm</li>
            <li>Visual heatmaps and analytics of your emotional patterns</li>
            <li>Predictive insights and forecasting for personal well-being</li>
            <li>Personalized goal setting and progress tracking</li>
          </ul>
        </section>

        {/* User Accounts */}
        <section>
          <h2 className="text-3xl font-bold mb-4">User Accounts</h2>
          <p className="text-foreground/80 mb-4">
            To use certain features of SoloPro, you must create an account. You agree to:
          </p>
          <ul className="list-disc pl-6 text-foreground/80 space-y-2">
            <li>Provide accurate, current, and complete information</li>
            <li>Maintain and update your account information</li>
            <li>Keep your password secure and confidential</li>
            <li>Accept responsibility for all activities under your account</li>
            <li>Notify us immediately of any unauthorized use</li>
          </ul>
        </section>

        {/* Acceptable Use */}
        <section>
          <h2 className="text-3xl font-bold mb-4">Acceptable Use</h2>
          <p className="text-foreground/80 mb-4">You agree not to:</p>
          <ul className="list-disc pl-6 text-foreground/80 space-y-2">
            <li>Use the Service for any unlawful purpose or in violation of any laws</li>
            <li>Attempt to gain unauthorized access to our systems or other users' accounts</li>
            <li>Interfere with or disrupt the Service or servers</li>
            <li>Upload malicious code, viruses, or harmful content</li>
            <li>Reverse engineer, decompile, or attempt to extract source code</li>
            <li>Use the Service to harass, abuse, or harm others</li>
            <li>Share your account credentials with others</li>
          </ul>
        </section>

        {/* Content and Data */}
        <section>
          <h2 className="text-3xl font-bold mb-4">Your Content and Data</h2>
          <p className="text-foreground/80 mb-4">
            You retain ownership of all content you submit to SoloPro, including daily logs, 
            personal reflections, and goals. By using our Service, you grant us:
          </p>
          <ul className="list-disc pl-6 text-foreground/80 space-y-2">
            <li>A license to process your data to provide the Service</li>
            <li>Permission to use anonymized, aggregated data to improve our AI algorithms</li>
            <li>The right to backup and store your data securely</li>
          </ul>
          <p className="text-foreground/80 mt-4">
            You are responsible for the accuracy and legality of content you submit. We reserve 
            the right to remove content that violates these Terms.
          </p>
        </section>

        {/* AI and Algorithms */}
        <section>
          <h2 className="text-3xl font-bold mb-4">AI Processing and Limitations</h2>
          <p className="text-foreground/80 mb-4">
            Our AI system "Solomon" provides mood scoring and forecasting based on your input. 
            You understand that:
          </p>
          <ul className="list-disc pl-6 text-foreground/80 space-y-2">
            <li>AI predictions are estimates, not medical diagnoses or professional advice</li>
            <li>Results may vary and are not guaranteed to be accurate</li>
            <li>The Service is not a substitute for professional mental health care</li>
            <li>You should consult healthcare professionals for medical concerns</li>
          </ul>
        </section>

        {/* Subscription and Payments */}
        <section>
          <h2 className="text-3xl font-bold mb-4">Subscription and Payments</h2>
          <p className="text-foreground/80 mb-4">
            SoloPro offers both free and premium subscription tiers:
          </p>
          <ul className="list-disc pl-6 text-foreground/80 space-y-2">
            <li>Free tier includes basic mood tracking and limited features</li>
            <li>Premium subscriptions provide full access to AI insights and analytics</li>
            <li>Subscription fees are billed in advance on a recurring basis</li>
            <li>You may cancel your subscription at any time</li>
            <li>Refunds are provided according to our refund policy</li>
            <li>We reserve the right to change pricing with 30 days notice</li>
          </ul>
        </section>

        {/* Privacy and Data Protection */}
        <section>
          <h2 className="text-3xl font-bold mb-4">Privacy and Data Protection</h2>
          <p className="text-foreground/80">
            Your privacy is important to us. Our collection, use, and protection of your personal 
            information is governed by our Privacy Policy, which is incorporated into these Terms 
            by reference. We use industry-standard security measures to protect your data, including 
            encryption and secure storage via Convex serverless database.
          </p>
        </section>

        {/* Intellectual Property */}
        <section>
          <h2 className="text-3xl font-bold mb-4">Intellectual Property</h2>
          <p className="text-foreground/80 mb-4">
            The Service and its original content, features, and functionality are owned by 
            ACDC.digital and are protected by international copyright, trademark, and other 
            intellectual property laws. You may not:
          </p>
          <ul className="list-disc pl-6 text-foreground/80 space-y-2">
            <li>Copy, modify, or distribute our proprietary content</li>
            <li>Use our trademarks without written permission</li>
            <li>Create derivative works based on our Service</li>
            <li>Remove or alter any copyright or proprietary notices</li>
          </ul>
        </section>

        {/* Disclaimers */}
        <section>
          <h2 className="text-3xl font-bold mb-4">Disclaimers</h2>
          <p className="text-foreground/80 mb-4">
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND. 
            WE DISCLAIM ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING:
          </p>
          <ul className="list-disc pl-6 text-foreground/80 space-y-2">
            <li>Warranties of merchantability and fitness for a particular purpose</li>
            <li>Warranties that the Service will be uninterrupted or error-free</li>
            <li>Warranties regarding the accuracy of AI predictions or insights</li>
            <li>Warranties that the Service will meet your specific requirements</li>
          </ul>
        </section>

        {/* Limitation of Liability */}
        <section>
          <h2 className="text-3xl font-bold mb-4">Limitation of Liability</h2>
          <p className="text-foreground/80">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, ACDC.DIGITAL SHALL NOT BE LIABLE FOR ANY 
            INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT 
            LIMITED TO LOSS OF PROFITS, DATA, OR USE, ARISING OUT OF OR RELATING TO THESE TERMS 
            OR THE SERVICE, REGARDLESS OF THE THEORY OF LIABILITY.
          </p>
        </section>

        {/* Termination */}
        <section>
          <h2 className="text-3xl font-bold mb-4">Termination</h2>
          <p className="text-foreground/80 mb-4">
            We may terminate or suspend your account and access to the Service immediately, 
            without prior notice, for conduct that we believe violates these Terms or is harmful 
            to other users, us, or third parties.
          </p>
          <p className="text-foreground/80">
            You may terminate your account at any time by contacting us. Upon termination, 
            your right to use the Service will cease, and we may delete your account and data 
            according to our data retention policy.
          </p>
        </section>

        {/* Governing Law */}
        <section>
          <h2 className="text-3xl font-bold mb-4">Governing Law</h2>
          <p className="text-foreground/80">
            These Terms are governed by and construed in accordance with the laws of Nova Scotia, 
            Canada, without regard to conflict of law principles. Any disputes arising from these 
            Terms or the Service will be resolved in the courts of Nova Scotia, Canada.
          </p>
        </section>

        {/* Changes to Terms */}
        <section>
          <h2 className="text-3xl font-bold mb-4">Changes to Terms</h2>
          <p className="text-foreground/80">
            We reserve the right to modify these Terms at any time. We will notify users of 
            significant changes via email or in-app notification. Your continued use of the 
            Service after changes become effective constitutes acceptance of the new Terms.
          </p>
        </section>

        {/* Contact Information */}
        <section>
          <h2 className="text-3xl font-bold mb-4">Contact Us</h2>
          <p className="text-foreground/80 mb-4">
            If you have any questions about these Terms of Service, please contact us:
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
