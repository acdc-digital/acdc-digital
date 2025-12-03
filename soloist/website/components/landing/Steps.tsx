// STEPS COMPONENT
// /Users/matthewsimon/Projects/acdc-digital/soloist/website/components/landing/Steps.tsx

'use client'

import { FileTextIcon } from "lucide-react"
import { BellIcon, Share2Icon, Check } from "lucide-react"

import { BentoCard, BentoGrid } from "@/components/ui/bento-grid"
import { BaselineAssessmentDemo } from "@/components/features/BaselineAssessmentDemo"
import { HeatmapJournalDemo } from "@/components/features/HeatmapJournalDemo"
import { ForecastDemo } from "@/components/features/ForecastDemo"

const features = [
  {
    Icon: FileTextIcon,
    name: "Baseline Assessment",
    description: "Establish your psychological baseline with AI-powered analysis.",
    href: "#",
    cta: "Learn more",
    className: "col-span-5 lg:col-span-2",
    background: <BaselineAssessmentDemo />,
    hideInfo: true, // Hide the default text/icon overlay
  },
  {
    Icon: BellIcon,
    name: "Track & Reflect",
    description: "Visualize your journey with an interactive calendar and daily journal.",
    href: "#",
    cta: "Learn more",
    className: "col-span-5 lg:col-span-3",
    background: <HeatmapJournalDemo />,
    hideInfo: true,
  },
  {
    Icon: Share2Icon,
    name: "Mood Forecasting",
    description: "AI-powered predictions to help you understand and plan ahead.",
    href: "#",
    cta: "Learn more",
    className: "col-span-5 lg:col-span-3",
    background: <ForecastDemo />,
    hideInfo: true,
  },
  {
    Icon: FileTextIcon, // Placeholder icon, won't be visible with hideInfo
    name: "Customize",
    description: "",
    className: "col-span-5 lg:col-span-1",
    href: "#",
    cta: "Learn more",
    hideInfo: true,
    background: (
      <div className="absolute inset-0 pt-3 pl-3 flex flex-col">
        {/* Header Text */}
        <div className="mb-3 px-2 flex items-start gap-3 flex-shrink-0">
          {/* Number */}
          <div className="flex-shrink-0">
            <span className="text-4xl font-bold text-neutral-700">4</span>
          </div>
          
          {/* Text Content */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-neutral-800 mb-1">
              Customize
            </h3>
            <p className="text-sm text-neutral-600">
              Tailor to your lifestyle
            </p>
          </div>
        </div>

        {/* Subtext above features container */}
        {/* <div className="px-2 mb-2 flex-shrink-0">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Specific to your lifestyle
          </p>
        </div> */}
        
        {/* Features List */}
        <div className="flex-1 overflow-hidden">
          <div className="border border-zinc-700 bg-zinc-900 rounded-tl-lg p-5 h-full">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-xs text-zinc-300 leading-relaxed">
                  → Create daily-log templates tailored to your lifestyle and goals
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-xs text-zinc-300 leading-relaxed">
                  → Update and track your personal goals in your profile
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-xs text-zinc-300 leading-relaxed">
                  → Monitor progress and make real-time adjustments
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-xs text-zinc-300 leading-relaxed">
                  → Personalize tracking metrics for what matters most
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-xs text-zinc-300 leading-relaxed">
                  →Set reminders and notifications for consistency
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },
  {
    Icon: FileTextIcon, // Placeholder icon, won't be visible with hideInfo
    name: "Learn",
    description: "",
    className: "col-span-5 lg:col-span-1",
    href: "#",
    cta: "Learn more",
    hideInfo: true,
    background: (
      <div className="absolute inset-0 pt-3 plt-3 pl-3 flex flex-col">
        {/* Header Text */}
        <div className="mb-3 px-2 flex items-start gap-3 flex-shrink-0">
          {/* Number */}
          <div className="flex-shrink-0">
            <span className="text-4xl font-bold text-neutral-700">5</span>
          </div>
          
          {/* Text Content */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-neutral-800 mb-1">
              Learn
            </h3>
            <p className="text-sm text-neutral-600">
              Evolve with each entry
            </p>
          </div>
        </div>
        
        {/* Features List */}
        <div className="flex-1 overflow-hidden">
          <div className="border border-zinc-700 bg-zinc-900 rounded-tl-lg p-5 h-full">
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-xs text-zinc-300 leading-relaxed">
                  → Discover patterns in your emotional journey over time
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-xs text-zinc-300 leading-relaxed">
                  → Understand triggers and what influences your wellbeing
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-xs text-zinc-300 leading-relaxed">
                  → Receive personalized insights & recommendations
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-xs text-zinc-300 leading-relaxed">
                  → Build self-awareness through reflection and analysis
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-xs text-zinc-300 leading-relaxed">
                  → Access personalized growth strategies and coping tools
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    ),
  },
]

export function Steps() {
  return (
    <section id="how-it-works" className="w-full pt-0 mt-0 md:mt-0">
      <div className="container-mobile py-4 md:py-8">
        <div className="w-full md:max-w-[76rem] mx-auto">
          {/* Header */}
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-[clamp(3rem,8vw,4rem)] tracking-tight font-parkinsans-semibold mb-4">
              How it works
            </h2>
            <p className="text-base md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Four step process to transform your daily routine into powerful predictions.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="px-4 md:px-0">
            <div className="grid w-full auto-rows-[32rem] grid-cols-5 gap-4 mb-1">
              {features.slice(0, 1).map((feature, idx) => (
                <BentoCard key={idx} {...feature} index={idx} />
              ))}
              {features.slice(1, 2).map((feature, idx) => (
                <BentoCard key={idx + 1} {...feature} index={idx + 1} />
              ))}
            </div>
            
            {/* Footer text under grid #1 and #2 */}
            <div className="grid grid-cols-5 gap-4 mb-16">
              <div className="col-span-5 lg:col-span-2 px-2">
                <p className="text-sm text-neutral-900">
                  *5-minutes to get started
                </p>
              </div>
              <div className="col-span-5 lg:col-span-3 px-2">
                <p className="text-sm text-neutral-900">
                  *start generating predictions after just 4-days of logs
                </p>
              </div>
            </div>
            
            <BentoGrid>
              {features.slice(2).map((feature, idx) => (
                <BentoCard key={idx + 2} {...feature} index={idx + 2} />
              ))}
            </BentoGrid>
            
            {/* Footer text under grid #3 */}
            <div className="grid grid-cols-5 gap-4 mt-1">
              <div className="col-span-5 lg:col-span-3 px-2">
                <p className="text-sm text-neutral-900">
                  *Meaningful insights with every log generated
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Text */}
          <div className="text-center mt-4 md:mt-10">
            <p className="text-base md:text-xl text-foreground max-w-5xl mx-auto px-4">
              Stop wondering why you feel the way you do. Start predicting and preparing for it.
            </p>
            <p className="text-base md:text-xl text-foreground max-w-4xl mx-auto mt-1 px-4">
              Like a weather forecast, but for your thoughts.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}