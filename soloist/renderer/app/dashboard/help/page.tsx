"use client";

import { HelpLayoutClient } from "./components/HelpLayoutClient";
import { UserGuide } from "./components/UserGuide";

export default function HelpPage() {
  return (
    <HelpLayoutClient>
      <UserGuide />
    </HelpLayoutClient>
  );
}
