"use client";

export function Header() {
  return (
    <header className="h-8 bg-[#181818] border-b border-[#2d2d2d] flex items-center px-4">
      <div className="flex items-center gap-2">
        <span className="text-xl">📝</span>
        <span className="text-xs text-[#858585]">On The Go | SMS Notes</span>
      </div>
    </header>
  );
}
