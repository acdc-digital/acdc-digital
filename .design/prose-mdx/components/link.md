Link
Framework-aware links for MDX content.
Prose UI converts Markdown links into the Link MDX component and renders it differently based on your framework:

With @prose-ui/next, it becomes the Next.js Link component so internal routes prefetch automatically.
With @prose-ui/react (no Next.js), it renders a plain <a> element to keep links working in any React environment.
If you need a custom implementation, override the Link MDX component:

import { createMdxComponents } from '@prose-ui/react'
import { Link as RouterLink } from 'your-router'
export const mdxComponents = createMdxComponents({
  Link: (props) => <RouterLink {...props} />,
})

