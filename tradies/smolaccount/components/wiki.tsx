"use client";

import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const sample = [
  { id: "getting-started", title: "Getting Started", excerpt: "How to use this wiki" },
  { id: "editor-guides", title: "Editor Guides", excerpt: "Tips for writing and formatting" },
];

export default function Wiki() {
  return (
    <div className="container mx-auto py-8 w-full">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Wiki</h1>
        <Link href="/wiki/new">
          <Button>New Page</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {sample.map((item) => (
          <Card key={item.id} className="hover:shadow-md transition">
            <CardHeader>
              <CardTitle>{item.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-3">{item.excerpt}</p>
              <Link href={`/wiki/${item.id}`} className="text-primary underline">
                View
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
