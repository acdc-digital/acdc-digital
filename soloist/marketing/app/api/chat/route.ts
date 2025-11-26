import { anthropic } from '@ai-sdk/anthropic';
import { streamText, convertToCoreMessages } from 'ai';
import { ROLE_SYSTEM_PROMPT, getComponentGenerationPrompt } from '@/lib/prompts/systemPrompts';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Convert to core messages
    const coreMessages = convertToCoreMessages(messages);

    // Use Vercel AI SDK streamText
    const result = await streamText({
      model: anthropic('claude-haiku-4-5-20251001'),
      system: `${ROLE_SYSTEM_PROMPT}\n\n${getComponentGenerationPrompt()}`,
      messages: coreMessages,
      temperature: 0.7,
    });

    return result.toUIMessageStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(JSON.stringify({ error: 'Error processing request' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
