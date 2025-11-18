import { anthropic } from '@ai-sdk/anthropic';
import { streamText, convertToModelMessages } from 'ai';
import { ROLE_SYSTEM_PROMPT, getComponentGenerationPrompt } from '@/lib/prompts/systemPrompts';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Convert UIMessages to ModelMessages
    const modelMessages = convertToModelMessages(messages);

    const result = await streamText({
      model: anthropic('claude-haiku-4-5-20251001'),
      system: `${ROLE_SYSTEM_PROMPT}\n\n${getComponentGenerationPrompt()}`,
      messages: modelMessages,
      temperature: 0.7,
      maxTokens: 4000,
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
