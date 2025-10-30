"use client";

import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUp, ThumbsUp, ThumbsDown, Tag } from "lucide-react";

export function FeedCard() {
  return (
    <Card className="w-full h-[500px] bg-zinc-900 border-zinc-800 rounded-xl shadow-md flex flex-col justify-between">
      {/* Header */}
      <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between">
        <div className="flex flex-col space-y-1">
          <span className="text-sm text-zinc-300 font-medium">Feed</span>
          <span className="text-xs text-zinc-500">Oct 28, 2025</span>
        </div>
        <div className="bg-emerald-600 text-white text-[11px] px-2 py-1 rounded-md font-medium">
          50
        </div>
      </CardHeader>

      {/* Main Message */}
      <CardContent className="px-4 flex-1 overflow-hidden">
        <div className="border border-zinc-800 rounded-lg p-3 h-full flex flex-col justify-between bg-zinc-900/60">
          <p className="text-[13px] text-zinc-300 leading-relaxed">
            Hi there! I see you&apos;ve had a fantastic day across all dimensions.
            Your perfect balance and mood ratings show you&apos;re really in sync
            today. Even though you didn&apos;t log specific highlights or exercise,
            your overall sense of satisfaction is wonderfully aligned.
          </p>

          <div className="mt-4 flex items-center gap-3 text-zinc-400">
            <ThumbsUp className="h-3.5 w-3.5 cursor-pointer hover:text-zinc-200" />
            <ThumbsDown className="h-3.5 w-3.5 cursor-pointer hover:text-zinc-200" />
          </div>
        </div>
      </CardContent>

      {/* Comment Input */}
      <CardFooter className="flex flex-col gap-1 px-4 pb-4">
        <span className="text-[10px] text-zinc-500 self-start">about 4 hours ago</span>
        <div className="flex items-center gap-2 w-full">
          <input
            placeholder="Add a comment..."
            disabled
            className="flex-1 text-[12px] bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-zinc-300 placeholder-zinc-500 cursor-default"
          />
          <Button disabled className="h-8 w-8 bg-emerald-600 p-0 flex items-center justify-center rounded-md cursor-default opacity-60">
            <ArrowUp className="h-4 w-4 text-white" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
