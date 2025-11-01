// FEATURE SECTION COMPONENT
// Simple image-left, text-right layout

"use client";

import React from "react";
import Image from "next/image";
import { Download } from "lucide-react";

export function FeatureSection() {
  return (
    <section className="pt-8 pb-0 px-0">
      <div className="container mx-auto max-w-[94rem]">
        {/* Header */}
        <div className="mx-auto max-w-2xl text-center mb-14">
          <h2 className="font-parkinsans-semibold font-bold tracking-tight text-[84px] mb-4">
            Reflections
          </h2>
          <div>
            <p className="text-xl">
              We handle the data, you write the story. Real people are already finding clarity in patterns they never knew existed.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-0 items-left">
          {/* Left Side - Empty Container */}
          <div className="relative bg-[#1E1E1E] border border-zinc-700 h-[545px] w-[520px] rounded-2xl ml-20 p-2 flex flex-col items-center">
            {/* Date */}
            <p className="text-[#969696] text-xs mb-2">November 1, 2025</p>
            
            {/* Container with white border and download icon */}
            <div className="flex gap-5 self-start items-center mb-4">
              {/* Inner Container */}
              <div className="h-[335px] w-[280px] border border-zinc-500 rounded-lg">
              </div>
              
              {/* Download Icon */}
              <Download className="p-1 text-zinc-500 border w-7 h-7 rounded-full" />
            </div>

            {/* 5 Rows */}
            <div className="w-full space-y-1.5 px-1">
              <div className="h-8 bg-[#3d3d3d] border border-zinc-500 rounded-2xl px-3 flex items-center w-fit">
                <p className="text-white text-sm pt-2 pb-2">
                  Holy f<span className="relative"> *ck <span className="absolute inset-0 bg-red-600 mx-0.25"></span></span> <span className="pl-1"> this is Dope!!!!</span>
                </p>
              </div>
              <div className="h-8 bg-[#3d3d3d] border border-zinc-500 rounded-2xl px-3 flex items-center w-fit">
                <p className="text-white text-sm pt-2 pb-2">like its sooooooo good</p>
              </div>
              <div className="h-8 bg-[#3d3d3d] border border-zinc-500 rounded-2xl px-3 flex items-center w-fit">
                <p className="text-white text-sm pt-2 pb-2">The predictions are so acurate it's wild. I'm so IMPRESSED!!!!!! </p>
              </div>
            </div>
          </div>

          {/* Right Side - Text Content */}
          <div className="space-y-6 mr-12 -ml-12">
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
