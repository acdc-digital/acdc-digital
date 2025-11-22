import { anthropic } from '@ai-sdk/anthropic';
import { streamText, convertToCoreMessages } from 'ai';
import { ROLE_SYSTEM_PROMPT, getComponentGenerationPrompt } from '@/lib/prompts/systemPrompts';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

export const runtime = 'edge';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

    // Extract file attachments from the latest user message
    let designFilesContext = '';
    const lastMessage = messages[messages.length - 1];
    
    if (lastMessage?.role === 'user' && lastMessage.experimental_attachments && lastMessage.experimental_attachments.length > 0) {
      const fileContents: string[] = [];
      
      for (const attachment of lastMessage.experimental_attachments) {
        const fileId = attachment.url.split('/').pop();
        const file = await convex.query(api.files.getByAnthropicFileId, { anthropicFileId: fileId });
        
        if (file) {
          fileContents.push(`\n\n=== DESIGN FILE: ${file.filename} ===\n${file.content}\n=== END OF ${file.filename} ===`);
        }
      }
      
      if (fileContents.length > 0) {
        designFilesContext = `\n\n## ATTACHED DESIGN FILES - MANDATORY REQUIREMENTS\n${fileContents.join('\n')}\n\n**YOU MUST FOLLOW ALL SPECIFICATIONS FROM THE DESIGN FILES ABOVE. THEY OVERRIDE ALL DEFAULT STYLING.**\n`;
      }
    }

    // Convert to core messages (without modifying content)
    const coreMessages = convertToCoreMessages(messages);

    // Use Vercel AI SDK streamText with design files in system prompt
    const result = await streamText({
      model: anthropic('claude-haiku-4-5-20251001'),
      system: `${ROLE_SYSTEM_PROMPT}\n\n${getComponentGenerationPrompt()}${designFilesContext}`,
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
