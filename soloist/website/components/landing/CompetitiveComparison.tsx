"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Check, X, Circle, CheckCircle } from "lucide-react";

export default function CompetitiveComparison() {
  const competitors = [
    { name: "Day One", key: "dayOne" },
    { name: "Daylio", key: "daylio" },
    { name: "Youper", key: "youper" },
    { name: "Fabulous", key: "fabulous" },
    { name: "Reflectly", key: "reflectly" },
  ];

  const data = [
    {
      feature: "Purpose",
      soloist: "Smart Journaling + Predictive Insights + Habit Forming",
      dayOne: "Journaling",
      daylio: "Mood Tracking",
      youper: "AI Therapy",
      fabulous: "Habit Coaching",
      reflectly: "Guided Reflection",
    },
    {
      feature: "Emotional Depth",
      soloist: "Experiential reflection & reframing",
      soloistIcon: "green",
      dayOne: "Rich journaling",
      dayOneIcon: "check",
      daylio: "Surface-level moods",
      daylioIcon: "circle",
      youper: "Text-based CBT",
      youperIcon: "circle",
      fabulous: "Motivational tone",
      fabulousIcon: "circle",
      reflectly: "Prompted journaling",
      reflectlyIcon: "circle",
    },
    {
      feature: "Adaptive Feedback",
      soloist: "Research-backed predictive insights",
      soloistIcon: "green",
      dayOne: "None",
      dayOneIcon: "x",
      daylio: "Charts only",
      daylioIcon: "circle",
      youper: "Reactive AI",
      youperIcon: "circle",
      fabulous: "Goal reminders",
      fabulousIcon: "circle",
      reflectly: "Basic insights",
      reflectlyIcon: "circle",
    },
    {
      feature: "Daily Reflection Engine",
      soloist: "Evolving analysis with each entry",
      soloistIcon: "green",
      dayOne: "Manual reflection",
      dayOneIcon: "x",
      daylio: "Weekly stats",
      daylioIcon: "circle",
      youper: "Chat prompts",
      youperIcon: "check",
      fabulous: "Behavioral nudges",
      fabulousIcon: "check",
      reflectly: "Daily prompts",
      reflectlyIcon: "check",
    },
    {
      feature: "Physiological Awareness",
      soloist: "Mind–Body link (stress, gut, sleep)",
      soloistIcon: "green",
      dayOne: "None",
      dayOneIcon: "x",
      daylio: "Mood trends",
      daylioIcon: "circle",
      youper: "Sleep mention",
      youperIcon: "circle",
      fabulous: "Sleep & focus coaching",
      fabulousIcon: "check",
      reflectly: "Mood patterns",
      reflectlyIcon: "circle",
    },
    {
      feature: "Privacy & Data",
      soloist: "End-to-end encrypted cloud storage",
      soloistIcon: "green",
      dayOne: "Encrypted",
      dayOneIcon: "check",
      daylio: "Cloud storage",
      daylioIcon: "check",
      youper: "Server-based",
      youperIcon: "check",
      fabulous: "Cloud sync",
      fabulousIcon: "check",
      reflectly: "Cloud storage",
      reflectlyIcon: "check",
    },
    {
      feature: "Pricing",
      soloist: "$36 / yr",
      soloistHighlight: true,
      dayOne: "$49.99 / yr",
      daylio: "$24 / yr",
      youper: "$119.88 / yr",
      fabulous: "$59 / yr",
      reflectly: "$71.88 / yr",
    },
  ];

  const renderIcon = (icon: string | undefined) => {
    if (!icon) return null;

    switch (icon) {
      case "check":
        return <Check className="h-4 w-4 text-green-600" />;
      case "x":
        return <X className="h-4 w-4 text-red-600" />;
      case "circle":
        return <Circle className="h-4 w-4 text-muted-foreground" />;
      case "green":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return null;
    }
  };

  return (
    <section id="comparison" className="py-8 md:py-10 bg-background mt-4 md:mt-6">
      <div className="container mx-auto px-4 md:px-16">
        <div className="mb-6 md:mb-8 text-center space-y-4">
          <h2 className="text-[clamp(3rem,8vw,4rem)] tracking-tight font-parkinsans-semibold">
            Why it works
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Others track. Soloist understands. 
            Combine the depth of journaling with adaptive insight for private, data-driven growth.
          </p>
        </div>

        {/* Mobile: Compact Comparison Cards */}
        <div className="lg:hidden space-y-6 px-4 md:px-0">
          {competitors.filter(comp => comp.key !== "reflectly").map((competitor) => {
            const pricingRow = data.find(item => item.feature === "Pricing");
            // Top 3 differentiating features per competitor
            const topFeatures = [
              data.find(item => item.feature === "Purpose"),
              data.find(item => item.feature === "Adaptive Feedback"),
              data.find(item => item.feature === "Daily Reflection Engine"),
            ].filter(Boolean);

            return (
              <Card
                key={competitor.key}
                className="border border-border bg-yellow-50/10 overflow-hidden rounded-none rounded-b-lg"
              >
                {/* Header */}
                <div className="bg-muted/30 px-3 py-2 border-b border-border">
                  <h3 className="text-sm font-parkinsans-semibold text-foreground text-center">
                    Soloist vs {competitor.name}
                  </h3>
                </div>

                {/* Comparison Table */}
                <div className="p-2.5 space-y-2.5">
                  {topFeatures.map((item) => {
                    if (!item) return null;
                    const competitorValue = item[competitor.key as keyof typeof item];
                    const competitorIcon = item[`${competitor.key}Icon` as keyof typeof item];

                    return (
                      <div key={item.feature} className="space-y-1.5">
                        <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">
                          {item.feature}
                        </div>
                        <div className="grid grid-cols-2 gap-1.5">
                          {/* Soloist */}
                          <div className="bg-blue-50 dark:bg-blue-950/20 p-2 border border-blue-200 dark:border-blue-900">
                            <div className="flex items-start gap-1 mb-0.5">
                              {renderIcon(item.soloistIcon as string)}
                              <span className="text-[9px] font-semibold text-blue-600 dark:text-blue-400 uppercase leading-tight">
                                Soloist
                              </span>
                            </div>
                            <p className="text-[11px] text-foreground leading-tight">
                              {item.soloist}
                            </p>
                          </div>

                          {/* Competitor */}
                          <div className="bg-muted/30 p-2 border border-border">
                            <div className="flex items-start gap-1 mb-0.5">
                              {renderIcon(competitorIcon as string)}
                              <span className="text-[9px] font-semibold text-muted-foreground uppercase leading-tight">
                                {competitor.name}
                              </span>
                            </div>
                            <p className="text-[11px] text-muted-foreground leading-tight">
                              {competitorValue as string}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Pricing Row */}
                  <div className="pt-1.5 border-t border-border">
                    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                      Pricing (Annual)
                    </div>
                    <div className="flex items-center justify-between bg-gradient-to-r from-blue-50 to-muted/20 dark:from-blue-950/20 dark:to-muted/20 p-2 border border-border">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-semibold text-blue-600 dark:text-blue-400">Soloist:</span>
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">$36/yr</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-medium text-muted-foreground">{competitor.name}:</span>
                        <span className="text-xs font-semibold text-muted-foreground">
                          {pricingRow?.[competitor.key as keyof typeof pricingRow] as string}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Desktop: Original Table */}
        <Card className="hidden lg:block w-full overflow-hidden border border-border bg-yellow-50/10 rounded-t-none rounded-b-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-b border-border hover:bg-transparent">
                    <TableHead className="w-[180px] py-4 px-6 text-lg font-semibold text-foreground bg-muted/50">
                      Feature
                    </TableHead>
                    <TableHead className="py-4 px-6 text-center text-lg font-parkinsans-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20">
                      Soloist
                    </TableHead>
                    <TableHead className="py-4 px-6 text-center font-parkinsans-semibold text-lg text-muted-foreground">
                      Day One
                    </TableHead>
                    <TableHead className="py-4 px-6 text-center font-medium text-lg text-muted-foreground">
                      Daylio
                    </TableHead>
                    <TableHead className="py-4 px-6 text-center font-parkinsans-semibold  text-lg text-muted-foreground">
                      Youper
                    </TableHead>
                    <TableHead className="py-4 px-6 text-center font-parkinsans-semibold text-lg text-muted-foreground">
                      Fabulous
                    </TableHead>
                    <TableHead className="py-4 px-6 text-center font-parkinsans-semibold text-lg text-muted-foreground">
                      Reflectly
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((item, index) => (
                    <TableRow
                      key={item.feature}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <TableCell className="py-4 px-6 font-semibold text-foreground bg-muted/20">
                        {item.feature}
                      </TableCell>
                      <TableCell className="py-4 px-6 text-center text-sm font-medium text-foreground bg-blue-50 dark:bg-blue-950/20">
                        <div className="flex flex-col items-center gap-2">
                          {renderIcon(item.soloistIcon)}
                          <span className={item.soloistHighlight ? "text-blue-600 dark:text-blue-400 font-semibold" : ""}>
                            {item.soloist}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="py-0 px-6 text-center text-sm text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-1 py-4 min-h-[80px]">
                          {renderIcon(item.dayOneIcon)}
                          <span className="px-2">{item.dayOne}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-0 px-6 text-center text-sm text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-1 py-4 min-h-[80px]">
                          {renderIcon(item.daylioIcon)}
                          <span className="px-2">{item.daylio}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-0 px-6 text-center text-sm text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-1 py-4 min-h-[80px]">
                          {renderIcon(item.youperIcon)}
                          <span className="px-2">{item.youper}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-0 px-6 text-center text-sm text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-1 py-4 min-h-[80px]">
                          {renderIcon(item.fabulousIcon)}
                          <span className="px-2">{item.fabulous}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-0 px-6 text-center text-sm text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-1 py-4 min-h-[80px]">
                          {renderIcon(item.reflectlyIcon)}
                          <span className="px-2">{item.reflectly}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Legend */}
        <div className="mt-6 px-4 md:px-0">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs md:text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-600 flex-shrink-0" />
              <span className="whitespace-nowrap">Enhanced</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="h-3.5 w-3.5 md:h-4 md:w-4 text-green-600 flex-shrink-0" />
              <span className="whitespace-nowrap">Available</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Circle className="h-3.5 w-3.5 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
              <span className="whitespace-nowrap">Limited</span>
            </div>
            <div className="flex items-center gap-1.5">
              <X className="h-3.5 w-3.5 md:h-4 md:w-4 text-red-600 flex-shrink-0" />
              <span className="whitespace-nowrap">Not Available</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
