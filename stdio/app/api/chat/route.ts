import { anthropic } from '@ai-sdk/anthropic';
import { streamText } from 'ai';
import { ROLE_SYSTEM_PROMPT, getComponentGenerationPrompt } from '@/lib/prompts/systemPrompts';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const result = streamText({
      model: anthropic('claude-3-5-sonnet-20241022'),
      messages: [
        { role: 'system', content: ROLE_SYSTEM_PROMPT },
        { role: 'system', content: getComponentGenerationPrompt() },
        ...messages,
      ],
      temperature: 0.7,
      maxTokens: 4000,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response('Error processing request', { status: 500 });
  }
}
