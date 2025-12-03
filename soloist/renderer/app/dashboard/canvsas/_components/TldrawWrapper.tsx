// TLDRAW WRAPPER
// /Users/matthewsimon/Projects/acdc-digital/soloist/renderer/app/dashboard/canvsas/_components/TldrawWrapper.tsx

"use client";

import React from "react";
import { Tldraw } from "tldraw";
import "tldraw/tldraw.css";

export default function TldrawWrapper() {
  return (
    <div className="w-full h-full">
      <Tldraw />
    </div>
  );
}
