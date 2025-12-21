Code group
Display multiple code blocks as tabs with language switching.
Code groups let you display multiple code blocks as tabs, with optional language switching. This is useful for showing the same code in different languages, or grouping related code snippets together.

Basic usage
Wrap multiple code blocks in a <CodeGroup> component. Each code block's title becomes a tab. Example:

npm
pnpm
yarn

npm install @prose-ui/react
Source:

Markdown syntax

<CodeGroup>
```bash title='npm'
npm install @prose-ui/react
```
```bash title='pnpm'
pnpm add @prose-ui/react
```
```bash title='yarn'
yarn add @prose-ui/react
```
</CodeGroup>
Language variants
When multiple code blocks share the same title but have different languages, they are grouped into a single tab with a language selector. Switching languages updates all tabs to show the selected language variant (if available). Example:

Random
Format
Typescript

const roll = (sides: number) => Math.ceil(Math.random() * sides)
Source:

Markdown syntax

<CodeGroup>
```typescript title='Random'
const roll = (sides: number) => Math.ceil(Math.random() * sides)
```
```javascript title='Random'
const roll = (sides) => Math.ceil(Math.random() * sides)
```
```typescript title='Format'
const total = (n: number) => `$${n.toFixed(2)}`
```
```javascript title='Format'
const total = (n) => `$${n.toFixed(2)}`
```
</CodeGroup>
Language-only switching
When all code blocks share the same title, no tabs are displayed — only a language selector appears. This is useful when showing the same code example in multiple languages:

Example
Typescript

const greet = (name: string): string => `Hello, ${name}!`
Source:

Markdown syntax

<CodeGroup>
```typescript title='Example'
const greet = (name: string): string => `Hello, ${name}!`
```
```javascript title='Example'
const greet = (name) => `Hello, ${name}!`
```
```python title='Example'
def greet(name: str) -> str:
    return f"Hello, {name}!"
```
</CodeGroup>
Synced tabs with groupId
By default, all code groups share the selected language globally. To also sync the selected tab across multiple code groups, use the groupId prop. Code groups with the same groupId will keep their active tab in sync. Try clicking a tab below — the other code group will update:

npm
pnpm

npm install @prose-ui/react
npm
pnpm

npm install @prose-ui/style
Source:

Markdown syntax

<CodeGroup groupId="install">
```bash title='npm'
npm install @prose-ui/react
```
```bash title='pnpm'
pnpm add @prose-ui/react
```
</CodeGroup>
<CodeGroup groupId="install">
```bash title='npm'
npm install @prose-ui/style
```
```bash title='pnpm'
pnpm add @prose-ui/style
```
</CodeGroup>
