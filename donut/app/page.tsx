// Donut Package Main Page - Welcome page with donut chart demonstration
// /Users/matthewsimon/Projects/acdc-digital/donut/app/page.tsx

import { DonutChart } from "@/components/donutChart"

export default function DonutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Welcome to donutChart</h1>
          <p className="text-lg text-muted-foreground">
            This is the Donut package - part of the{" "}
            <a 
              href="https://github.com/acdc-digital" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 underline transition-colors"
            >
              ACDC Digital
            </a>{" "}
            workspace.
          </p>
        </div>
        
        <DonutChart data={[]} />
      </div>
    </div>
  );
}