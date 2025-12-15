// FOOTER COMPONENT
// /Users/matthewsimon/Documents/Github/soloist_pro/website/src/components/Footer.tsx

"use client";

import React from "react";
import {
  Fingerprint,
  MessageSquare, 
  Github, 
  Slack, 
  Mail,
  MapPin,
  Instagram,
  Linkedin
} from "lucide-react";
import Link from "next/link";
import { BouncingLogoCompact } from "@/components/features/BouncingLogoCompact";
import { PrivacyPolicyModal } from "@/components/legal/privacyPolicy";
import { TermsOfServiceModal } from "@/components/legal/termsOfService";
import { NewsletterSignup } from "@/components/landing/NewsletterSignup";
import { FeedbackModal } from "@/app/admin/_components/Feedback";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-border pb-8 md:pb-0">
      <div className="container-mobile">
        {/* Main Footer Content */}
        <div className="py-6 md:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-12 gap-6 md:gap-6 lg:gap-8">
            {/* Company Info - 4 columns */}
            <div className="sm:col-span-2 md:col-span-3 lg:col-span-4">
              <div className="mb-4 md:mb-8">
                <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                  <BouncingLogoCompact size={32} className="w-6 h-6 md:w-8 md:h-8" />
                  <h3 className="text-lg md:text-2xl font-bold text-black">Soloist.</h3>
                </div>
                <p className="text-xs md:text-sm text-black leading-relaxed">
                Soloist. is dedicated to making the transitions of life easier to understand. With clarity comes focus, we hope this helps you become the version of yourself that you want most.
                </p>
              </div>

              {/* Social Links */}
              <div className="flex flex-wrap gap-2 md:gap-3">
                <Link 
                  href="https://github.com/acdc-digital/solopro" 
                  className="group p-1.5 md:p-2.5 rounded-full bg-white border border-border text-black hover:text-black hover:border-foreground transition-all duration-200 flex items-center justify-center"
                  aria-label="GitHub"
                >
                  <Github className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </Link>
                <Link 
                  href="https://www.instagram.com/soloist.pro" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-1.5 md:p-2.5 rounded-full bg-white border border-border text-black hover:text-black hover:border-foreground transition-all duration-200 flex items-center justify-center"
                  aria-label="Instagram"
                >
                  <Instagram className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </Link>
                <Link 
                  href="https://www.tiktok.com/@soloist.pro" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-1.5 md:p-2.5 rounded-full bg-white border border-border text-black hover:text-black hover:border-foreground transition-all duration-200 flex items-center justify-center"
                  aria-label="TikTok"
                >
                  <svg className="h-3.5 w-3.5 md:h-4 md:w-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </Link>
                <Link 
                  href="https://www.linkedin.com/company/acdc-digital" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-1.5 md:p-2.5 rounded-full bg-white border border-border text-black hover:text-black hover:border-foreground transition-all duration-200 flex items-center justify-center"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </Link>
                <Link 
                  href="https://acdcdigital.slack.com/archives/C0919GRUWB0" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-1.5 md:p-2.5 rounded-full bg-white border border-border text-black hover:text-black hover:border-foreground transition-all duration-200 flex items-center justify-center"
                  aria-label="Slack Community"
                >
                  <Slack className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </Link>
                <Link 
                  href="mailto:msimon@acdc.digital" 
                  className="group p-1.5 md:p-2.5 rounded-full bg-white border border-border text-black hover:text-black hover:border-foreground transition-all duration-200 flex items-center justify-center"
                  aria-label="Email"
                >
                  <Mail className="h-3.5 w-3.5 md:h-4 md:w-4" />
                </Link>
              </div>
            </div>

            {/* Quick Links - 2 columns */}
            <div className="md:col-span-2">
              <h4 className="font-semibold text-black mb-2 md:mb-6 text-xs md:text-base">Quick Links</h4>
              <ul className="space-y-0 md:space-y-1">
                <li>
                  <Link href="#" className="text-[10px] md:text-sm text-black hover:text-black transition-colors inline-flex items-center gap-1 group py-0.5 md:py-0.5">
                    Home
                  </Link>
                </li>
                <li>
                  <Link href="#features" className="text-[10px] md:text-sm text-black hover:text-black transition-colors inline-flex items-center gap-1 group py-0.5 md:py-0.5">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-[10px] md:text-sm text-black hover:text-black transition-colors inline-flex items-center gap-1 group py-0.5 md:py-0.5">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#roadmap" className="text-[10px] md:text-sm text-black hover:text-black transition-colors inline-flex items-center gap-1 group py-0.5 md:py-0.5">
                    Roadmap
                  </Link>
                </li>
                <li>
                  <Link href="#faq" className="text-[10px] md:text-sm text-black hover:text-black transition-colors inline-flex items-center gap-1 group py-0.5 md:py-0.5">
                    FAQ
                  </Link>
                </li>
                <li>
                  <PrivacyPolicyModal>
                    <button className="text-[10px] md:text-sm text-black hover:text-black transition-colors text-left py-0.5 md:py-0.5">
                      Privacy Policy
                    </button>
                  </PrivacyPolicyModal>
                </li>
                <li>
                  <TermsOfServiceModal>
                    <button className="text-[10px] md:text-sm text-black hover:text-black transition-colors text-left py-0.5 md:py-0.5">
                      Terms of Service
                    </button>
                  </TermsOfServiceModal>
                </li>
              </ul>
            </div>

            {/* Community - 2 columns */}
            <div className="md:col-span-2">
              <h4 className="font-semibold text-black mb-2 md:mb-6 text-xs md:text-base">Community</h4>
              <ul className="space-y-0 md:space-y-1">
                <li>
                  <Link href="/blog" className="text-[10px] md:text-sm text-black hover:text-black transition-colors text-left py-0.5 md:py-0.5">
                    Blog
                  </Link>
                </li>
                <li>
                  <FeedbackModal>
                    <button className="text-[10px] md:text-sm text-black hover:text-black transition-colors text-left py-0.5 md:py-0.5">
                      Forum
                    </button>
                  </FeedbackModal>
                </li>
              </ul>
            </div>

            {/* Newsletter Signup - 4 columns */}
            <div className="md:col-span-3 lg:col-span-4">
              <h4 className="font-semibold text-black mb-2 md:mb-6 text-xs md:text-base">Stay Updated</h4>
              <p className="text-[10px] md:text-sm text-black mb-3 md:mb-6 leading-snug">
                Get notified about new features and updates.
              </p>
              <div className="mb-6 md:mb-8">
                <NewsletterSignup 
                  source="footer"
                  placeholder="Enter your email"
                  buttonText="Subscribe"
                />
              </div>
              
              {/* Company Details */}
              <div className="pt-4 md:pt-6">
                <div className="space-y-0.5 md:space-y-2 text-xs md:text-sm text-black">
                  <p className="font-medium text-black">ACDC.digital</p>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    <p>Halifax, Nova Scotia, Canada</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    <a href="mailto:msimon@acdc.digital" className="hover:text-black transition-colors">
                      msimon@acdc.digital
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-primary/30 mb-6 md:mb-8 rounded-b-lg">
            <div className="border-b border-primary/20 p-3 md:p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex items-end space-x-2">
                    <div className="text-lg md:text-2xl font-bold text-primary">ACDC.digital</div>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-3 md:p-4">
              <p className="text-secondary mb-3 md:mb-4 text-xs md:text-sm">
                Through thoughtful and creative design, we turn ideas into intelligent systems & algorithms. We build adaptive infrastructure that analyzes, learns, and evolves with the purpose of enhancing how we can understand ourselves and interact with others. Adaptive intelligence should enhance the human experience, not just <em>feel</em> human.
              </p>
              <div className="flex space-x-4 md:space-x-6">
                <a href="https://github.com/acdc-digital" className="text-secondary hover:text-white transition-colors text-xs md:text-sm" aria-label="github">
                  <Github className="w-3.5 h-3.5 md:w-4 md:h-4 inline mr-2" />
                  GitHub
                </a>
                <a href="mailto:msimon@acdc.digital" className="text-secondary hover:text-white transition-colors text-xs md:text-sm" aria-label="contact">
                  <Mail className="w-3.5 h-3.5 md:w-4 md:h-4 inline mr-2" />
                  Contact
                </a>
              </div>
            </div>
          </div>

        {/* Bottom Bar */}
        <div className="mt-4 md:mt-0 pb-0 pt-4 md:py-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 md:gap-4">
            <div className="text-xs md:text-sm text-black">
              © {currentYear} ACDC.digital. All rights reserved.
            </div>
            
            {/* <div className="text-xs md:text-sm">
              <Link 
                href="https://github.com/acdc-digital/solopro" 
                className="text-black hover:text-black transition-colors inline-flex items-center gap-2"
              >
                <Github className="h-3.5 w-3.5 md:h-4 md:w-4" />
                Open Source Project
              </Link>
            </div> */}
          </div>
        </div>
      </div>
    </footer>
  );
}