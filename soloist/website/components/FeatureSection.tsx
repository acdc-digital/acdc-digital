// FEATURE SECTION COMPONENT
// Simple image-left, text-right layout

"use client";

import React from "react";
import Image from "next/image";

export function FeatureSection() {
  return (
    <section className="py-16 md:py-24 px-4">
      <div className="container mx-auto max-w-7xl">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Side - Image */}
          <div className="relative aspect-square md:aspect-auto md:h-[600px] rounded-2xl overflow-hidden bg-muted">
            <Image
              src="/placeholder-feature.jpg"
              alt="Feature preview"
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Right Side - Text Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                Your Feature Title
              </h2>
              <p className="text-xl text-muted-foreground">
                A compelling subtitle that explains what makes this feature special.
              </p>
            </div>

            <div className="space-y-4">
              <p className="text-lg leading-relaxed text-muted-foreground">
                Add your main description here. Explain the key benefits and why users 
                should care about this feature. Keep it clear and concise.
              </p>
              <p className="text-lg leading-relaxed text-muted-foreground">
                You can add additional paragraphs to provide more context or highlight 
                specific capabilities that make this feature stand out.
              </p>
            </div>

            <div className="pt-4">
              <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity">
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
