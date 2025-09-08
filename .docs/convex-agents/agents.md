heres some guides on agents from convex:
1. Run npm create convex or follow any of the quickstarts to set one up.

Installation
Install the component package:

npm install @convex-dev/agent

Create a convex.config.ts file in your app's convex/ folder and install the component by calling use:

// convex/convex.config.ts
import { defineApp } from "convex/server";
import agent from "@convex-dev/agent/convex.config";

const app = defineApp();
app.use(agent);

export default app;

Then run npx convex dev to generate code for the component. This needs to successfully run once before you start defining Agents.

Defining your first Agent
import { components } from "./_generated/api";
import { Agent } from "@convex-dev/agent";
import { openai } from "@ai-sdk/openai";

const agent = new Agent(components.agent, {
  name: "My Agent",
  languageModel: openai.chat("gpt-4o-mini"),
});

Using it:

import { action } from "./_generated/server";
import { v } from "convex/values";

export const helloWorld = action({
  args: { prompt: v.string() },
  handler: async (ctx, { prompt }) => {
    const threadId = await createThread(ctx, components.agent);
    const result = await agent.generateText(ctx, { threadId }, { prompt });
    return result.text;
  },
});

If you get type errors about components.agent, ensure you've run npx convex dev to generate code for the component.

That's it! Next check out creating Threads and Messages.

Customizing the agent
The agent by default only needs a chat model to be configured. However, for vector search, you'll need a textEmbeddingModel model. A name is helpful to attribute each message to a specific agent. Other options are defaults that can be over-ridden at each LLM call-site.

import { tool, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod/v3";
import { Agent, createTool, type Config } from "@convex-dev/agent";
import { components } from "./_generated/api";

const sharedDefaults = {
  // The chat completions model to use for the agent.
  languageModel: openai.chat("gpt-4o-mini"),
  // Embedding model to power vector search of message history (RAG).
  textEmbeddingModel: openai.embedding("text-embedding-3-small"),
  // Used for fetching context messages. See https://docs.convex.dev/agents/context
  contextOptions,
  // Used for storing messages. See https://docs.convex.dev/agents/messages
  storageOptions,
  // Used for tracking token usage. See https://docs.convex.dev/agents/usage-tracking
  usageHandler: async (ctx, args) => {
    const { usage, model, provider, agentName, threadId, userId } = args;
    // ... log, save usage to your database, etc.
  },
  // Useful if you want to log or record every request and response.
  rawResponseHandler: async (ctx, args) => {
    const { request, response, agentName, threadId, userId } = args;
    // ... log, save request/response to your database, etc.
  },
  // Used for limiting the number of retries when a tool call fails. Default: 3.
  callSettings: { maxRetries: 3, temperature: 1.0 },
  // Used for setting default provider-specific options to the LLM calls.
  providerOptions: { openai: { cacheControl: { type: "ephemeral" } } },
} satisfies Config;

// Define an agent similarly to the AI SDK
const supportAgent = new Agent(components.agent, {
  // The default system prompt if not over-ridden.
  instructions: "You are a helpful assistant.",
  tools: {
    // Convex tool
    myConvexTool: createTool({
      description: "My Convex tool",
      args: z.object({...}),
      // Note: annotate the return type of the handler to avoid type cycles.
      handler: async (ctx, args): Promise<string> => {
        return "Hello, world!";
      },
    }),
    // Standard AI SDK tool
    myTool: tool({ description, parameters, execute: () => {}}),
  },
  // Used for limiting the number of steps when tool calls are involved.
  // NOTE: if you want tool calls to happen automatically with a single call,
  // you need to set this to something greater than 1 (the default).
  stopWhen: stepCountIs(5),
  ...sharedDefaults,
});

2. for threads, other than the conversation history, we can also stored extra snippets on 'edits' performed on the canvas as reference point for later edits
Threads
Threads are a way to group messages together in a linear history. All messages saved in the Agent component are associated with a thread. When a message is generated based on a prompt, it saves the user message and generated agent message(s) automatically.

Threads can be associated with a user, and messages can each individually be associated with a user. By default, messages are associated with the thread's user.

Creating a thread
You can create a thread in a mutation or action. If you create it in an action, it will also return a thread (see below) and you can start calling LLMs and generating messages. If you specify a userId, the thread will be associated with that user and messages will be saved to the user's history.

import { createThread } from "@convex-dev/agent";

const threadId = await createThread(ctx, components.agent);

You may also pass in metadata to set on the thread:

const userId = await getAuthUserId(ctx);
const threadId = await createThread(ctx, components.agent, {
  userId,
  title: "My thread",
  summary: "This is a summary of the thread",
});

Metadata may be provided as context to the agent automatically in the future, but for now it's a convenience that helps organize threads in the Playground.

Generating a message in a thread
You can generate a message in a thread via the agent functions: agent.generateText, agent.generateObject, agent.streamText, and agent.streamObject. Any agent can generate a message in a thread created by any other agent.

const agent = new Agent(components.agent, { languageModel, instructions });

export const generateReplyToPrompt = action({
  args: { prompt: v.string(), threadId: v.string() },
  handler: async (ctx, { prompt, threadId }) => {
    // await authorizeThreadAccess(ctx, threadId);
    const result = await agent.generateText(ctx, { threadId }, { prompt });
    return result.text;
  },
});

See Messages for more details on creating and saving messages.

Continuing a thread using the thread object from agent.continueThread
You can also continue a thread by creating an agent-specific thread object, either when calling agent.createThread or agent.continueThread from within an action. This allows calling methods without specifying those parameters each time.

const { thread } = await agent.continueThread(ctx, { threadId });
const result = await thread.generateText({ prompt });

The thread from continueThread or createThread (available in actions only) is a Thread object, which has convenience methods that are thread-specific:

thread.getMetadata() to get the userId, title, summary etc.
thread.updateMetadata({ patch: { title, summary, userId} }) to update the metadata
thread.generateText({ prompt, ... }) - equivalent to agent.generateText(ctx, { threadId }, { prompt, ... })
thread.streamText({ prompt, ... }) - equivalent to agent.streamText(ctx, { threadId }, { prompt, ... })
thread.generateObject({ prompt, ... }) - equivalent to agent.generateObject(ctx, { threadId }, { prompt, ... })
thread.streamObject({ prompt, ... }) - equivalent to agent.streamObject(ctx, { threadId }, { prompt, ... })
See Messages docs for more details on generating messages.

Deleting threads
You can delete threads by their threadId.

Asynchronously (from a mutation or action):

await agent.deleteThreadAsync(ctx, { threadId });

Synchronously in batches (from an action):

await agent.deleteThreadSync(ctx, { threadId });

You can also delete all threads by a user by their userId.

await agent.deleteThreadsByUserId(ctx, { userId });

Getting all threads owned by a user
const threads = await ctx.runQuery(
  components.agent.threads.listThreadsByUserId,
  { userId, paginationOpts: args.paginationOpts },
);

Deleting all threads and messages associated with a user
Asynchronously (from a mutation or action):

await ctx.runMutation(components.agent.users.deleteAllForUserIdAsync, {
  userId,
});

Synchronously (from an action):

await ctx.runMutation(components.agent.users.deleteAllForUserId, { userId });

Getting messages in a thread
See messages.mdx for more details.

import { listMessages } from "@convex-dev/agent";

const messages = await listMessages(ctx, components.agent, {
  threadId,
  excludeToolMessages: true,
  paginationOpts: { cursor: null, numItems: 10 }, // null means start from the beginning
});

3. tools
Tools
The Agent component supports tool calls, which are a way to allow an LLM to call out to external services or functions. This can be useful for:

Retrieving data from the database
Writing or updating data in the database
Searching the web for more context
Calling an external API
Requesting that a user takes an action before proceeding (human-in-the-loop)
Defining tools
You can provide tools at different times:

Agent constructor: (new Agent(components.agent, { tools: {...} }))
Creating a thread: createThread(ctx, { tools: {...} })
Continuing a thread: continueThread(ctx, { tools: {...} })
On thread functions: thread.generateText({ tools: {...} })
Outside of a thread: supportAgent.generateText(ctx, {}, { tools: {...} })
Specifying tools at each layer will overwrite the defaults. The tools will be args.tools ?? thread.tools ?? agent.options.tools. This allows you to create tools in a context that is convenient.

Using tools
The Agent component will automatically handle passing tool call results back in and re-generating if you pass stopWhen: stepCountIs(num) where num > 1 to generateText or streamText.

The tool call and result will be stored as messages in the thread associated with the source message. See Messages for more details.

Creating a tool with a Convex context
There are two ways to create a tool that has access to the Convex context.

Use the createTool function, which is a wrapper around the AI SDK's tool function.
export const ideaSearch = createTool({
  description: "Search for ideas in the database",
  args: z.object({ query: z.string().describe("The query to search for") }),
  handler: async (ctx, args, options): Promise<Array<Idea>> => {
    // ctx has agent, userId, threadId, messageId
    // as well as ActionCtx properties like auth, storage, runMutation, and runAction
    const ideas = await ctx.runQuery(api.ideas.searchIdeas, {
      query: args.query,
    });
    console.log("found ideas", ideas);
    return ideas;
  },
});

Define tools at runtime in a context with the variables you want to use.
async function createTool(ctx: ActionCtx, teamId: Id<"teams">) {
  const myTool = tool({
    description: "My tool",
    parameters: z.object({...}).describe("The arguments for the tool"),
    execute: async (args, options) => {
      return await ctx.runQuery(internal.foo.bar, args);
    },
  });
}

In both cases, the args and options match the underlying AI SDK's tool function.

Note: it's highly recommended to use zod with .describe to provide details about each parameter. This will be used to provide a description of the tool to the LLM.

Adding custom context to tools
It's often useful to have extra metadata in the context of a tool.

By default, the context passed to a tool is a ToolCtx with:

agent - the Agent instance calling it
userId - the user ID associated with the call, if any
threadId - the thread ID, if any
messageId - the message ID of the prompt message passed to generate/stream.
Everything in ActionCtx, such as auth, storage, runQuery, etc. Note: in scheduled functions, workflows, etc, the auth user will be null.
To add more fields to the context, you can pass a custom context to the call, such as agent.generateText({ ...ctx, orgId: "123" }).

You can enforce the type of the context by passing a type when constructing the Agent.

const myAgent = new Agent<{ orgId: string }>(...);

Then, in your tools, you can use the orgId field.

type MyCtx = ToolCtx & { orgId: string };

const myTool = createTool({
  args: z.object({ ... }),
  description: "...",
  handler: async (ctx: MyCtx, args) => {
    // use ctx.orgId
  },
});

4. workflows:
Agentic Workflows can be decomposed into two elements:

Prompting an LLM (including message history, context, etc.).
Deciding what to do with the LLM's response.
We generally call them workflows when there are multiple steps involved, they involve dynamically deciding what to do next, are long-lived, or have a mix of business logic and LLM calls.

Tool calls and MCP come into play when the LLM's response is a specific request for an action to take. The list of available tools and result of the calls are used in the prompt to the LLM.

One especially powerful form of Workflows are those that can be modeled as durable functions that can be long-lived, survive server restarts, and have strong guarantees around retrying, idempotency, and completing.

The simplest version of this could be doing a couple pre-defined steps, such as first getting the weather forecast, then getting fashion advice based on the weather. For a code example, see workflows/chaining.ts.

export const getAdvice = action({
  args: { location: v.string(), threadId: v.string() },
  handler: async (ctx, { location, threadId }) => {
    // This uses tool calls to get the weather forecast.
    await weatherAgent.generateText(
      ctx,
      { threadId },
      { prompt: `What is the weather in ${location}?` },
    );
    // This includes previous message history from the thread automatically and
    // uses tool calls to get user-specific fashion advice.
    await fashionAgent.generateText(
      ctx,
      { threadId },
      { prompt: `What should I wear based on the weather?` },
    );
    // We don't need to return anything, since the messages are saved
    // automatically and clients will get the response via subscriptions.
  },
});

Building reliable workflows
One common pitfall when working with LLMs is their unreliability. API providers have outages, and LLMs can be flaky. To build reliable workflows, you often need three properties:

Reliable retries
Load balancing
Durability and idempotency for multi-step workflows
Thankfully there are Convex components to leverage for these properties.

Retries
By default, Convex mutations have these properties by default. However, calling LLMs require side-effects and using the network calls, which necessitates using actions. If you are only worried about retries, you can use the Action Retrier component.

However, keep reading, as the Workpool and Workflow components provide more robust solutions, including retries.

Load balancing
With long-running actions in a serverless environment, you may consume a lot of resources. And with tasks like ingesting data for RAG or other spiky workloads, there's a risk of running out of resources. To mitigate this, you can use the Workpool component. You can set a limit on the number of concurrent workers and add work asynchronously, with configurable retries and a callback to handle eventual success / failure.

However, if you also want to manage multi-step workflows, you should use the Workflow component, which also provides retries and load balancing out of the box.

Durability and idempotency for multi-step workflows
When doing multi-step workflows that can fail mid-way, you need to ensure that the workflow can be resumed from where it left off, without duplicating work. The Workflow builds on the Workpool to provide durable execution of long running functions with retries and delays.

Each step in the workflow is run, with the result recorded. Even if the server fails mid-way, it will resume with the latest incomplete step, with configurable retry settings.

Using the Workflow component for long-lived durable workflows
The Workflow component is a great way to build long-lived, durable workflows. It handles retries and guarantees of eventually completing, surviving server restarts, and more. Read more about durable workflows in this Stack post.

To use the agent alongside workflows, you can run individual idempotent steps that the workflow can run, each with configurable retries, with guarantees that the workflow will eventually complete. Even if the server crashes mid-workflow, the workflow will pick up from where it left off and run the next step. If a step fails and isn't caught by the workflow, the workflow's onComplete handler will get the error result.

Exposing the agent as Convex actions
You can expose the agent's capabilities as Convex functions to be used as steps in a workflow.

To create a thread as a standalone mutation, similar to createThread:

export const createThread = supportAgent.createThreadMutation();

For an action that generates text in a thread, similar to thread.generateText:

export const getSupport = supportAgent.asTextAction({
  stopWhen: stepCountIs(10),
});

You can also expose a standalone action that generates an object.

export const getStructuredSupport = supportAgent.asObjectAction({
  schema: z.object({
    analysis: z.string().describe("A detailed analysis of the user's request."),
    suggestion: z.string().describe("A suggested action to take."),
  }),
});

To save messages explicitly as a mutation, similar to agent.saveMessages:

export const saveMessages = supportAgent.asSaveMessagesMutation();

This is useful for idempotency, as you can first create the user's message, then generate a response in an unreliable action with retries, passing in the existing messageId instead of a prompt.

Using the agent actions within a workflow
You can use the Workflow component to run agent flows. It handles retries and guarantees of eventually completing, surviving server restarts, and more. Read more about durable workflows in this Stack post.

const workflow = new WorkflowManager(components.workflow);

export const supportAgentWorkflow = workflow.define({
  args: { prompt: v.string(), userId: v.string() },
  handler: async (step, { prompt, userId }) => {
    const { threadId } = await step.runMutation(internal.example.createThread, {
      userId,
      title: "Support Request",
    });
    const suggestion = await step.runAction(internal.example.getSupport, {
      threadId,
      userId,
      prompt,
    });
    const { object } = await step.runAction(
      internal.example.getStructuredSupport,
      {
        userId,
        message: suggestion,
      },
    );
    await step.runMutation(internal.example.sendUserMessage, {
      userId,
      message: object.suggestion,
    });
  },
});

See the code in workflows/chaining.ts.

Complex workflow patterns
While there is only an example of a simple workflow here, there are many complex patterns that can be built with the Agent component:

Dynamic routing to agents based on an LLM call or vector search
Fanning out to LLM calls, then combining the results
Orchestrating multiple agents
Cycles of Reasoning and Acting (ReAct)
Modeling a network of agents messaging each other
Workflows that can be paused and resumed

5. usage:
Usage Tracking
You can provide a usageHandler to the agent to track token usage. See an example in this demo that captures usage to a table, then scans it to generate per-user invoices.

You can provide a usageHandler to the agent, per-thread, or per-message.

const supportAgent = new Agent(components.agent, {
  ...
  usageHandler: async (ctx, args) => {
    const {
      // Who used the tokens
      userId, threadId, agentName,
      // What LLM was used
      model, provider,
      // How many tokens were used (extra info is available in providerMetadata)
      usage, providerMetadata
    } = args;
    // ... log, save usage to your database, etc.
  },
});

Tip: Define the usageHandler within a function where you have more variables available to attribute the usage to a different user, team, project, etc.

Storing usage in a table
To track usage for e.g. billing, you can define a table in your schema and insert usage into it for later processing.

export const usageHandler: UsageHandler = async (ctx, args) => {
  if (!args.userId) {
    console.debug("Not tracking usage for anonymous user");
    return;
  }
  await ctx.runMutation(internal.example.insertRawUsage, {
    userId: args.userId,
    agentName: args.agentName,
    model: args.model,
    provider: args.provider,
    usage: args.usage,
    providerMetadata: args.providerMetadata,
  });
};

export const insertRawUsage = internalMutation({
  args: {
    userId: v.string(),
    agentName: v.optional(v.string()),
    model: v.string(),
    provider: v.string(),
    usage: vUsage,
    providerMetadata: v.optional(vProviderMetadata),
  },
  handler: async (ctx, args) => {
    const billingPeriod = getBillingPeriod(Date.now());
    return await ctx.db.insert("rawUsage", {
      ...args,
      billingPeriod,
    });
  },
});

function getBillingPeriod(at: number) {
  const now = new Date(at);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth());
  return startOfMonth.toISOString().split("T")[0];
}

With an associated schema in convex/schema.ts:

export const schema = defineSchema({
  rawUsage: defineTable({
    userId: v.string(),
    agentName: v.optional(v.string()),
    model: v.string(),
    provider: v.string(),

    // stats
    usage: vUsage,
    providerMetadata: v.optional(vProviderMetadata),

    // In this case, we're setting it to the first day of the current month,
    // using UTC time for the month boundaries.
    // You could alternatively store it as a timestamp number.
    // You can then fetch all the usage at the end of the billing period
    // and calculate the total cost.
    billingPeriod: v.string(), // When the usage period ended
  }).index("billingPeriod_userId", ["billingPeriod", "userId"]),

  invoices: defineTable({
    userId: v.string(),
    billingPeriod: v.string(),
    amount: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("paid"),
      v.literal("failed"),
    ),
  }).index("billingPeriod_userId", ["billingPeriod", "userId"]),
  // ... other tables
});

Generating invoices via a cron job
You can use a cron job to generate invoices at the end of the billing period.

See usage_tracking/invoicing.ts for an example of how to generate invoices.

You can then add it to convex/crons.ts:

import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Generate invoices for the previous month
crons.monthly(
  "generateInvoices",
  // Wait a day after the new month starts to generate invoices
  { day: 2, hourUTC: 0, minuteUTC: 0 },
  internal.usage.generateInvoices,
  {},
);

export default crons;