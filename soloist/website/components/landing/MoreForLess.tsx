// MORE FOR LESS COMPONENT
// /Users/matthewsimon/Projects/acdc-digital/soloist/website/components/landing/MoreForLess.tsx

'use client'

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Image from "next/image";

export function MoreForLess() {
  return (
    <section className="my-8 py-8 md:py-12 bg-white">
      <div className="container mx-auto px-4 md:px-0">
        <div className="w-full md:max-w-[76rem] md:mx-auto">
          {/* Single Row Layout: Text Left, Image Right */}
          <div className="flex flex-col md:flex-row items-start justify-between gap-6 md:gap-6">
            {/* Left Side: Text Content */}
            <div className="flex-1 max-w-2xl">
              <h2 className="text-5xl md:text-6xl font-parkinsans-semibold text-foreground mb-3 md:mb-4 space-y-2">
                <div>More Clarity.</div>
                <div>No Smoke & Mirrors.</div>
              </h2>
              <p className="text-base md:text-lg text-muted-foreground mb-4">
                Everything you need under one roof.
              </p>
              <Link
                href="#pricing"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-base transition-colors"
              >
                See pricing plans
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Right Side: Competition Apps Image */}
            <div className="flex-shrink-0 w-full md:w-auto md:max-w-2xl md:mt-24">
              <Image
                src="/competitionV2.svg"
                alt="Competing productivity apps"
                width={800}
                height={120}
                className="w-full h-auto"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
