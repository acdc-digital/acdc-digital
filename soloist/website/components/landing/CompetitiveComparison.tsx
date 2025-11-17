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
      soloist: "$3 / mo ($30 / yr)",
      soloistHighlight: true,
      dayOne: "$49.99 / yr",
      daylio: "$24 / yr",
      youper: "$9.99 / mo",
      fabulous: "$59 / yr",
      reflectly: "$5.99 / mo",
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
    <section id="comparison" className="py-8 md:py-12 bg-background mt-4 md:mt-6">
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

        <Card className="w-full overflow-hidden border border-border bg-yellow-50/10 rounded-t-none rounded-b-lg">
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
        <div className="mt-6 flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Enhanced Feature</span>
          </div>
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-green-600" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="h-4 w-4 text-muted-foreground" />
            <span>Limited Functionality</span>
          </div>
          <div className="flex items-center gap-2">
            <X className="h-4 w-4 text-red-600" />
            <span>Not Available</span>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 text-center">
          <p className="text-xl text-foreground max-w-5xl mx-auto italic">
            Progress has a rhythm. Find yours with Soloist.
          </p>
        </div>
      </div>
    </section>
  );
}
