/**
 * Simple Typography Test Component
 * This tests if Tailwind Typography classes are working correctly
 */

'use client';

export default function TypographyTest() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Typography Test</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="prose prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-h1:text-4xl prose-h1:mb-6 prose-h1:text-gray-900 dark:prose-h1:text-white prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:text-blue-600 dark:prose-h2:text-white prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-red-600 dark:prose-h3:text-white prose-p:mb-4 prose-p:leading-relaxed prose-p:text-gray-700 dark:prose-p:text-gray-300">
          
          <h1>🚀 Main Story Headline (Should be 4xl, gray)</h1>
          
          <p>This is a test paragraph. It should have proper spacing and gray color.</p>
          
          <h2>📊 Key Metrics (Should be 2xl, blue)</h2>
          
          <p>Another paragraph after H2. Testing the visual hierarchy.</p>
          
          <h3>🔍 Details (Should be xl, red)</h3>
          
          <p>Final paragraph after H3. This completes the hierarchy test.</p>
          
          <ul>
            <li>First bullet point</li>
            <li>Second bullet point</li>
            <li>Third bullet point</li>
          </ul>
          
          <blockquote>
            This is a blockquote to test styling.
          </blockquote>
          
        </div>
      </div>
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Expected results:
          <br />• H1: Large (4xl), gray/white text
          <br />• H2: Medium (2xl), blue/white text (colors in light mode, white in dark mode)
          <br />• H3: Smaller (xl), red/white text (colors in light mode, white in dark mode)
          <br />• Proper paragraph spacing
        </p>
      </div>
    </div>
  );
}