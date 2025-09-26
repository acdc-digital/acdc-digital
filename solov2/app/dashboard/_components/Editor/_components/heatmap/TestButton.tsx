// Simple test component to verify the heatmap works
"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function TestButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>("");
  
  const cleanup = useMutation(api.cleanup.cleanupDuplicateUsers);
  const seed = useMutation(api.demo.seedDemoData);

  const handleCleanupAndSeed = async () => {
    setIsLoading(true);
    setStatus("Initializing...");
    
    try {
      setStatus("Cleaning up duplicates...");
      const cleanupResult = await cleanup({});
      console.log("Cleanup result:", cleanupResult);
      
      setStatus("Creating demo data...");
      const seedResult = await seed({});
      console.log("Seed result:", seedResult);
      
      setStatus("Complete! Refreshing page...");
      
      // Small delay before refresh
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error:", error);
      setStatus(`Error: ${error}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCleanupAndSeed}
        disabled={isLoading}
        className="px-2 py-1 text-xs bg-[#2d2d2d] text-[#858585] rounded hover:bg-[#3d3d3d] hover:text-[#cccccc] disabled:bg-[#1a1a1a] disabled:text-[#555555] disabled:cursor-not-allowed transition-colors"
      >
        {isLoading ? "..." : "Reset"}
      </button>
      {status && (
        <span className="text-xs text-[#858585]">
          {status}
        </span>
      )}
    </div>
  );
}