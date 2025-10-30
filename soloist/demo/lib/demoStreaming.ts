/**
 * Demo Streaming Utility
 * Simulates text streaming for demo mode without backend API calls
 */

const DEMO_MESSAGES = [
  "This is example output only. Predictive output is disabled in demo mode. Sign-up to unlock real time, research-backed forecasting and personalized guidance that helps you focus on what's coming next before it hits you. Unlock real-time insights and personalized guidance that helps you focus on what's coming next. Let's get started.",
  "Demo output: Sign up to experience live, research-backed insights. Our AI analyzes patterns in your daily logs to surface actionable predictions about your energy, focus, and upcoming challenges. Get personalized guidance that adapts to your unique rhythms and helps you stay ahead of what's coming.",
  "This is a simulated response. Unlock adaptive forecasts in the full app. Real-time analysis tracks your wellness trends, productivity patterns, and potential stressors before they impact your day. Experience personalized insights that evolve with you.",
  "Preview mode active — real predictive analysis available on upgrade. The full version learns from your daily entries to identify patterns you might miss, offering research-backed suggestions to optimize your routines and navigate challenges proactively."
];

/**
 * Get a random demo message with subtle variation
 */
export function getRandomDemoMessage(): string {
  return DEMO_MESSAGES[Math.floor(Math.random() * DEMO_MESSAGES.length)];
}

/**
 * Stream text character by character with realistic timing
 * @param text - The full text to stream
 * @param onChunk - Callback for each character chunk
 * @param onComplete - Callback when streaming completes
 * @param speed - Characters per chunk (default: 2-4 for natural variation)
 */
export async function streamText(
  text: string,
  onChunk: (chunk: string, fullTextSoFar: string) => void,
  onComplete?: () => void,
  speed: { min: number; max: number } = { min: 2, max: 4 }
): Promise<void> {
  let currentText = "";
  let index = 0;

  while (index < text.length) {
    // Random chunk size for natural variation
    const chunkSize = Math.floor(Math.random() * (speed.max - speed.min + 1)) + speed.min;
    const chunk = text.slice(index, index + chunkSize);
    
    currentText += chunk;
    onChunk(chunk, currentText);
    
    index += chunkSize;

    // Variable delay for natural reading rhythm
    // Balanced speed for comfortable reading
    const lastChar = chunk[chunk.length - 1];
    const isPunctuation = ['.', '!', '?', ',', ':', ';'].includes(lastChar);
    const delay = isPunctuation 
      ? Math.random() * 150 + 100  // 100-250ms after punctuation
      : Math.random() * 30 + 20;    // 20-50ms for regular text

    await new Promise(resolve => setTimeout(resolve, delay));
  }

  if (onComplete) {
    onComplete();
  }
}

/**
 * Create a demo feed message with streaming animation
 * @param date - The date for the feed message
 * @param onUpdate - Callback for each streaming update
 * @param onComplete - Callback when streaming completes with final message
 */
export async function streamDemoFeedMessage(
  date: string,
  onUpdate: (partialMessage: string) => void,
  onComplete: (finalMessage: string) => void
): Promise<void> {
  const message = getRandomDemoMessage();
  
  await streamText(
    message,
    (_chunk, fullTextSoFar) => {
      onUpdate(fullTextSoFar);
    },
    () => {
      onComplete(message);
    }
  );
}
