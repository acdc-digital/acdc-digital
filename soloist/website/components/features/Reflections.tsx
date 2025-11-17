// FEATURE SECTION COMPONENT
// Simple image-left, text-right layout

"use client";

import React from "react";
import Image from "next/image";
import { Download, CirclePlus, Smile } from "lucide-react";

export function FeatureSection() {
  return (
    <section className="pt-8 pb-0 px-4 md:px-0 mt-8 md:mt-12 overflow-hidden">
      <div className="container mx-auto max-w-[94rem]">
        {/* Header */}
        <div className="mx-auto max-w-4xl text-center mb-8 md:mb-14 px-4">
          <h2 className="font-parkinsans-semibold font-bold tracking-tight text-[clamp(3rem,8vw,4rem)] mb-4">
            Reflections
          </h2>
          <div>
            <p className="text-base md:text-xl">
              We handle the data, you write the story. Real people are already finding clarity in patterns they never knew existed.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-0 items-start md:items-left px-4 md:px-0">
          {/* Left Side - Empty Container */}
          <div className="relative bg-[#1E1E1E] border border-zinc-700 w-full max-w-[520px] mx-auto md:ml-20 md:mr-0 h-auto md:h-[560px] rounded-2xl p-2 flex flex-col items-center">
            {/* Date */}
            <p className="text-[#969696] text-xs mb-2">November 1, 2025</p>
            
            {/* Container with white border and download icon */}
            <div className="flex gap-3 md:gap-5 self-start items-center ml-2 mb-4 w-full">
              {/* Inner Container */}
              <div className="h-[280px] md:h-[335px] w-full max-w-[280px] border border-zinc-500 rounded-lg overflow-hidden">
                <img
                  src="/Reflections1.svg"
                  alt="Reflection"
                  className="w-full h-full object-cover"
                />
              </div>

            {/* Download Icon */}
            <Download className="p-1 text-zinc-500 border w-7 h-7 rounded-full flex-shrink-0" strokeWidth={1.5} />
            </div>

            {/* Text Rows */}
            <div className="w-full space-y-1.5 px-1 mb-6">
              <div className="h-auto min-h-8 bg-[#3d3d3d] border border-zinc-500 rounded-2xl px-3 py-2 flex items-center w-fit max-w-full">
                <p className="text-white text-xs md:text-sm break-words">
                  Holy f<span className="relative"> *ck <span className="absolute inset-0 bg-red-600 mx-0.25"></span></span> <span className="pl-1"> this is Dope!!!!</span>
                </p>
              </div>
              <div className="h-auto min-h-8 bg-[#3d3d3d] border border-zinc-500 rounded-2xl px-3 py-2 flex items-center w-fit max-w-full">
                <p className="text-white text-xs md:text-sm break-words">like its sooooooo good</p>
              </div>
              <div className="h-auto min-h-8 bg-[#3d3d3d] border border-zinc-500 rounded-2xl px-3 py-2 flex items-center w-fit max-w-full">
                <p className="text-white text-xs md:text-sm break-words">The predictions are so acurate it's wild. I'm so IMPRESSED!!!!!! </p>
              </div>
            </div>

            {/* Bottom Message Row */}
            <div className="w-full px-1 flex gap-2 items-center">
              <CirclePlus className="text-zinc-500 w-6 h-6 flex-shrink-0" strokeWidth={1.5} />
              <div className="h-8 border border-zinc-500 rounded-2xl px-3 flex items-center flex-1">
                <p className="text-zinc-400 text-xs md:text-sm pt-2 pb-2">Message</p>
              </div>
              <Smile className="text-zinc-500 w-6 h-6 flex-shrink-0" strokeWidth={1.5} />
            </div>
          </div>

          {/* Right Side - Text Content */}
          <div className="space-y-2 md:mr-20 md:-ml-12 w-full">
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-parkinsans-semibold tracking-tight">
                How the data clicks...
              </h2>
              <p className="text-base md:text-xl text-muted-foreground">
                Soloist helps you make sense of the past while bringing clarity and focus to what’s ahead.
              </p>
            </div>

            <div className="space-y-4">
              <p className="pt-1 text-base md:text-lg leading-relaxed text-muted-foreground">
                Not just another journal, habit tracker, or AI-powered productivity tool — Soloist blends modern technology with a calm, human-centered interface 
                designed to help you understand yourself better, one day at a time.
              </p>
            </div>


              <button className="pb-4 bg-primary text-primary-foreground rounded-lg font-medium hover:opacity-90 transition-opacity text-sm md:text-base">
                Learn More ─────▶
              </button>

            {/* Bottom Container */}
            <div className="h-auto md:h-72 w-full rounded-b-2xl bg-yellow-50/10 border border-black p-3 md:pl-4 md:pr-6">
              <h3 className="text-xl md:text-2xl font-parkinsans-semibold mb-2">
                Help us improve
              </h3>
              <p className="text-sm md:text-base text-muted-foreground mb-4">
                Share your thoughts, feedback, or bugs. We read and respond to every message.
              </p>
              <textarea
                placeholder="Want to say hi, share feedback, or report a bug..."
                className="w-full h-32 p-3 border bg-white border-border rounded-b-lg rounded-tr-lg bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary mb-2 text-sm md:text-base"
              />
              <button className="px-4 md:px-6 py-2 bg-white text-primary-foreground rounded-lg font-medium hover:bg-white hover:text-foreground transition-all border border-primary text-sm md:text-base">
                Submit Feedback
              </button>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
