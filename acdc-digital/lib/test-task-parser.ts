// Test the task parser with sample thinking text
import { parseThinkingToTasks } from './task-parser';

// Sample thinking text like what Claude might generate
const sampleThinking = `
Analyzing the user's request to implement streaming for their chat interface.

First, I need to understand the current architecture by examining key files.
Reading package.json to understand dependencies
Checking convex/schema.ts for database structure
Reviewing app/dashboard/_components/artifacts/chat-interface.tsx for current implementation

Next, I'll determine the best approach for implementing streaming.
The user wants real-time streaming responses
I need to integrate with their existing Convex backend
The streaming should work with their agent orchestrator system

Finally, I'll implement the solution step by step.
`;

console.log('=== Parsed Tasks ===');
const tasks = parseThinkingToTasks(sampleThinking);
console.log(JSON.stringify(tasks, null, 2));

export { tasks };