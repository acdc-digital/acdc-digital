"use client";

export function Header() {
  return (
    <header className="h-8 bg-card border-b border-border flex items-center px-0 select-none">
      {/* Title */}
      <div className="flex-1 flex justify-start items-center ml-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-primary">Soloist</span>
          <span className="text-xs text-muted-foreground">
            Marketing Content Management
          </span>
        </div>
      </div>
      
      {/* Future: Theme Toggle */}
      <div className="flex items-center pr-4">
        {/* ThemeToggle component can be added here */}
      </div>
    </header>
  );
}
