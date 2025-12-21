# Introduction
Beautiful, consistent styles for your Markdown and MDX content.
Prose UI is an open-source library of components and Remark plugins, designed to simplify rendering Markdown and MDX content with beautiful, consistent styles.

With Prose UI, you have a straightforward way to bring polished typography and thoughtfully designed components to your documentation, blog, or any content-focused site.

# About
Why Prose UI exists, where it's headed, and how you can help.
I started Prose UI while building a visual editor for dhub, a CMS for technical documentation. One of the biggest hurdles was consistency: every framework has its own conventions for MDX components, and most projects end up with a different (and often incomplete) set of building blocks.

Prose UI is my attempt to make that experience predictable: a shared set of polished, MDX-ready components and typography styles that can be used across frameworks, whether you're using Docusaurus or a plain Next.js app, while still being easy to customize.

If you want to follow updates or reach out, I'm Valdemaras (@vrepsys on X). I'm also available for contract work. I build full-stack products, from APIs and backend systems to real-time collaboration and complex UIs.

## Contributing
If something feels off, breaks in your setup, or could be improved, I'd really appreciate it if you open an issue on GitHub and share the details. Even better, open a PR if you already have a fix.

## Credits
Huge thanks to my friend Domas for his help with the design and for pushing the visual direction to be as clean and usable as it is.

# Installation overview
Set up Prose UI in your React + MDX project.
Prose UI works with any React + MDX setup. This page gives you a high‑level overview and generic installation steps.

If you're using Next.js or TanStack Start, follow the framework guides for Next.js or TanStack Start to get tailored instructions.

General overview
Prose UI has three main pieces:

React components

These components power callouts, code blocks, steps, and other rich elements in your MDX content.

Available as mdxComponents from @prose-ui/react for any React runtime, and @prose-ui/next for Next.js.

CSS styles

Provides typography and styling for both prose and components.

Available as prose-ui.css from @prose-ui/style. Wrap your content with the prose-ui CSS class.

Remark plugins

Enables code highlighting, math formulas, and other transformations during the Markdown/MDX build step.

remarkPlugins() is available from @prose-ui/core. Add these plugins to your Markdown/MDX pipeline.

The rest of this page walks through each of these pieces in a generic React + MDX setup.

React components
To get highlighted code blocks, callouts, math, and other components, you need to provide Prose UI components to your MDX renderer.

For any React app:

import { mdxComponents } from '@prose-ui/react'

For Next.js apps:

// Uses next/link and next/image internally
import { mdxComponents } from '@prose-ui/next'

Then pass mdxComponents to your MDX renderer. For example, with Content Collections:

import { MDXContent } from '@content-collections/mdx/react'
import { mdxComponents } from '@prose-ui/react'
<MDXContent code={markdownContent} components={mdxComponents} />

You can also import individual components
import {
  Callout,
  CodeBlock,
  Frame,
  Heading,
  Image,
  Link,
  InlineMath,
  BlockMath,
  // ...
} from '@prose-ui/react'

CSS styles
Prose UI ships default typography and component styles in a single stylesheet, scoped under the prose-ui class.

Import prose-ui.css into your global stylesheet and wrap your content in a container with the prose-ui class:

globals.css

@import '@prose-ui/style/prose-ui.css';
@import '@prose-ui/style/katex.min.css';
prose-ui.css – base typography and component styles
katex.min.css – only needed if you use math formulas
<div className="prose-ui">
  {/* Your rendered Markdown content */}
</div>

Prose UI uses the dark class on the <html> element to switch to dark mode, so it plugs into most existing theme toggles.

Customizing styles
The easiest way to customize Prose UI is by overriding the CSS variables defined in @prose-ui/style/prose-ui.css.

Remark plugins
The remarkPlugins(options) function from @prose-ui/core powers most of the "magic":

Syntax‑highlighted code blocks
LaTeX math formulas
Mapping basic Markdown to React components (e.g. images to <Image>)
You should initialize the plugins once and pass them into your Markdown/MDX pipeline.

For example, with Content Collections:

import { remarkPlugins } from '@prose-ui/core'
const plugins = remarkPlugins({
  // Optional config
  image: {
    imageDir: './public',
  },
})
const content = await compileMDX(ctx, post, {
  remarkPlugins: plugins,
})

In other setups (e.g. your own MDX bundler, Vite plugin, or a custom build step), you wire plugins into the place where you normally configure remarkPlugins. The exact API will differ, but the idea stays the same: create the plugins with remarkPlugins() and pass them to your MDX processor.

# Nextjs Setup

Set up MDX rendering with Content Collections
Content Collections helps you organize your MDX content and render MDX files. The setup below follows the official Next.js quickstart and MDX guides.

Prose UI works with any MDX renderer—Content Collections is not a prerequisite. This guide uses Content Collections because it keeps all Markdown files in a single place and provides a great developer experience, but you can use next/mdx, mdx-bundler, or any other MDX solution.

Install the required packages:

npm install @content-collections/core @content-collections/next @content-collections/mdx zod -D

Add the content-collections path to your tsconfig.json:

tsconfig.json

{
  "compilerOptions": {
    // ...
    "paths": {
      "@/*": ["./*"],
      "content-collections": ["./.content-collections/generated"]
    }
  }
}
Update your Next.js configuration:

next.config.ts

import type { NextConfig } from "next";
import { withContentCollections } from "@content-collections/next";
 
const nextConfig: NextConfig = {};
 
export default withContentCollections(nextConfig);
Add .content-collections to your .gitignore:

.gitignore

.content-collections
Create a content-collections.ts file in the root of your project:

content-collections.ts

import { defineCollection, defineConfig } from "@content-collections/core";
import { compileMDX } from "@content-collections/mdx";
import { z } from "zod";
 
const posts = defineCollection({
  name: "posts",
  directory: "content/posts",
  include: "**/*.mdx",
  schema: z.object({
    content: z.string(),
  }),
  transform: async (document, context) => {
    const mdx = await compileMDX(context, document);
    return {
      ...document,
      mdx,
    };
  },
});
 
export default defineConfig({
  collections: [posts],
});
Set up Prose UI and Markdown rendering
Install Prose UI dependencies:

npm install @prose-ui/core @prose-ui/next @prose-ui/style

Import the styles into your globals.css:

globals.css

@import "@prose-ui/style/prose-ui.css";
@import "@prose-ui/style/katex.min.css";
In content-collections.ts, initialize and pass remarkPlugins to the MDX compiler:

content-collections.ts

import { remarkPlugins } from '@prose-ui/core'
// ...
const mdx = await compileMDX(context, document, {
   remarkPlugins: remarkPlugins(),
})
// ...
Create the page that will render your Markdown at /app/posts/[[...path]]/page.tsx. Pass Prose UI mdxComponents to MDXContent, and wrap the content in an element with the prose-ui CSS class.

/app/posts/[[...path]]/page.tsx

import { notFound } from "next/navigation";
import { allPosts } from "content-collections";
import { mdxComponents } from "@prose-ui/next";
import { MDXContent } from "@content-collections/mdx/react";
type Params = Promise<{ path: string[] }>
type PageProps = {
  params: Params
}
const findPage = (pathArr: string[]) => {
  const path = pathArr ? `${pathArr.join('/')}` : '/'
  return allPosts.find((page) => page._meta.path === path)
}
export async function generateStaticParams() {
  return allPosts.map((page) => ({
    path: page._meta.path.slice(1).split('/'),
  }))
}
export default async function Page({
  params,
}: PageProps) {
  const { path } = await params
  let page = findPage(path)
  if (!page) notFound();
  return (
    <article className="prose-ui w-full max-w-5xl mx-auto">
      <MDXContent code={page.mdx} components={mdxComponents} />
    </article>
  )
}
Add your first page
Create a content/posts folder (if it doesn't exist yet) and add a page:

content/posts/hello.mdx

# Hello, world!
This stunning image is from [NASA's Juno mission](https://science.nasa.gov/mission/juno).
<Frame>
  <Image
    src="https://media.dhub.dev/jupiter-cropped.jpg"
    alt="Jupiter"
  />
  <Caption>Juno Captures Jupiter. Credits: NASA/JPL-Caltech/SwRI/MSSS, Thomas Thomopoulos © CC BY</Caption>
</Frame>
Run your project and open http://localhost:3000/posts/hello to view the rendered MDX page.