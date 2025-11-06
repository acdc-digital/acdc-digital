"use client";

import React from "react";

interface TableOfContentsProps {
  sections: Array<{
    id: string;
    title: string;
    count: number;
  }>;
}

export function TableOfContents({ sections }: TableOfContentsProps) {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <nav className="sticky top-20 mb-8 p-6 border rounded-lg bg-card">
      <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide text-muted-foreground">
        Table of Contents
      </h3>
      <ul className="space-y-2">
        {sections.map((section) => (
          <li key={section.id}>
            <button
              onClick={() => scrollToSection(section.id)}
              className="text-sm hover:text-primary transition-colors text-left w-full flex items-center justify-between group"
            >
              <span className="group-hover:underline">{section.title}</span>
              <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">
                {section.count}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
