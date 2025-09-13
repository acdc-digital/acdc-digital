/**
 * Analytical Content Templates for AI Blog Generation
 * Pre-defined structures and prompts for creating comprehensive news analysis
 */

export interface ContentTemplate {
  name: string;
  description: string;
  structure: string[];
  prompt: string;
}

export const ANALYTICAL_TEMPLATES: Record<string, ContentTemplate> = {
  'breaking-news': {
    name: 'Breaking News Analysis',
    description: 'Fast-moving story with immediate implications',
    structure: [
      'BREAKING: [Compelling Headline]',
      'Quick Summary (2-3 sentences)',
      'What We Know So Far',
      'Immediate Implications', 
      'What to Watch Next',
      'Background Context',
      'Expert Commentary',
      'Social Media Reaction',
      'Key Takeaways'
    ],
    prompt: `Transform this breaking news story into a comprehensive analysis with:

1. **BREAKING: [Compelling Headline]** - Urgent, action-oriented headline
2. **Quick Summary** - Essential facts in 2-3 sentences  
3. **What We Know So Far** - Confirmed information with sources
4. **Immediate Implications** - Short-term consequences and impacts
5. **What to Watch Next** - Key developments to monitor
6. **Background Context** - Historical precedents and relevant background
7. **Expert Commentary** - Analysis of significance and broader implications
8. **Social Media Reaction** - Public sentiment and trending discussions
9. **Key Takeaways** - Bulleted main points for quick reference

Use engaging headlines, short paragraphs, and clear formatting. Focus on speed and clarity while maintaining analytical depth.`
  },

  'social-media-story': {
    name: 'Social Media Deep Dive',
    description: 'Stories originating from or heavily discussed on social platforms',
    structure: [
      'Viral Alert: [Catchy Headline]',
      'The Social Story',
      'Platform Analysis',
      'Viral Mechanics', 
      'Public Sentiment Breakdown',
      'Real-World Impact',
      'Historical Context',
      'What This Means',
      'Trending Predictions'
    ],
    prompt: `Create an in-depth analysis of this social media story with:

1. **Viral Alert: [Catchy Headline]** - Social media-style engaging headline
2. **The Social Story** - How this unfolded online, key moments
3. **Platform Analysis** - Different reactions across Twitter, Reddit, TikTok, etc.
4. **Viral Mechanics** - Why this caught fire (timing, emotion, shareability)
5. **Public Sentiment Breakdown** - Demographic responses, opinion splits
6. **Real-World Impact** - Offline consequences and institutional responses  
7. **Historical Context** - Similar viral moments and precedents
8. **What This Means** - Broader implications for society, politics, business
9. **Trending Predictions** - Where this conversation goes next

Focus on digital culture analysis, data-driven insights, and social psychology. Use modern, conversational tone with analytical rigor.`
  },

  'economic-impact': {
    name: 'Economic Impact Analysis',
    description: 'Stories with significant financial or market implications',
    structure: [
      'Market Movers: [Financial Headline]',
      'Economic Snapshot',
      'Market Response Analysis',
      'Sector-by-Sector Impact',
      'Consumer Implications',
      'Global Ripple Effects',
      'Historical Parallels',
      'Expert Predictions',
      'Investment Outlook'
    ],
    prompt: `Analyze the economic implications of this story with:

1. **Market Movers: [Financial Headline]** - Business-focused, impact-driven headline
2. **Economic Snapshot** - Key financial metrics and immediate market reaction
3. **Market Response Analysis** - Stock movements, currency impacts, commodity effects
4. **Sector-by-Sector Impact** - Which industries benefit or suffer
5. **Consumer Implications** - How this affects everyday spending and choices
6. **Global Ripple Effects** - International economic consequences
7. **Historical Parallels** - Similar events and their economic outcomes
8. **Expert Predictions** - Economist and analyst forecasts
9. **Investment Outlook** - Strategic implications for different asset classes

Include specific data, charts references, and quantifiable impacts. Balance technical analysis with accessible explanations.`
  },

  'political-analysis': {
    name: 'Political Deep Dive',
    description: 'Political developments requiring institutional context',
    structure: [
      'Political Pulse: [Policy Headline]',
      'The Political Play',
      'Stakeholder Positions',
      'Institutional Impact',
      'Public Opinion Dynamics',
      'Historical Precedent',
      'Coalition Analysis',
      'Future Scenarios',
      'Electoral Implications'
    ],
    prompt: `Provide comprehensive political analysis with:

1. **Political Pulse: [Policy Headline]** - Policy-focused, institutional headline
2. **The Political Play** - Strategic motivations and tactical considerations
3. **Stakeholder Positions** - Key players, their interests, and stated positions
4. **Institutional Impact** - Effects on government structures and processes
5. **Public Opinion Dynamics** - Polling data, demographic splits, messaging wars
6. **Historical Precedent** - How similar political moments played out
7. **Coalition Analysis** - Alliance formations and opposition strategies
8. **Future Scenarios** - Multiple paths forward with probability assessments
9. **Electoral Implications** - Impact on upcoming elections and political careers

Maintain strict neutrality while providing sharp analytical insights. Focus on process, strategy, and systemic implications.`
  },

  'tech-disruption': {
    name: 'Technology Disruption',
    description: 'Tech developments with transformative potential',
    structure: [
      'Tech Shift: [Innovation Headline]',
      'The Innovation Breakdown',
      'Technical Deep Dive',
      'Market Disruption Analysis',
      'Adoption Timeline',
      'Regulatory Landscape',
      'Competitive Response',
      'Societal Implications',
      'Future Tech Trajectory'
    ],
    prompt: `Analyze this technology story with focus on disruption and transformation:

1. **Tech Shift: [Innovation Headline]** - Future-focused, transformation-oriented headline
2. **The Innovation Breakdown** - Core technology explained in accessible terms
3. **Technical Deep Dive** - How it works, technical advantages, limitations
4. **Market Disruption Analysis** - Which industries face transformation
5. **Adoption Timeline** - Realistic rollout schedule and adoption barriers
6. **Regulatory Landscape** - Governance challenges and policy implications
7. **Competitive Response** - How incumbents and competitors will react
8. **Societal Implications** - Broader effects on work, privacy, human behavior
9. **Future Tech Trajectory** - What this enables next in the innovation cycle

Balance technical accuracy with strategic business insight. Focus on practical implications and transformation potential.`
  },

  'cultural-moment': {
    name: 'Cultural Analysis',
    description: 'Stories reflecting broader cultural shifts and social movements',
    structure: [
      'Culture Watch: [Social Headline]',
      'The Cultural Moment',
      'Generational Divide Analysis',
      'Media Narrative Evolution',
      'Institutional Responses',
      'Historical Context',
      'Cultural Indicators',
      'Counter-Narratives',
      'Long-Term Cultural Shift'
    ],
    prompt: `Examine this story as a cultural phenomenon with:

1. **Culture Watch: [Social Headline]** - Culture-focused, zeitgeist-capturing headline
2. **The Cultural Moment** - What makes this significant beyond the immediate facts
3. **Generational Divide Analysis** - How different age groups interpret and respond
4. **Media Narrative Evolution** - How coverage and framing has changed over time
5. **Institutional Responses** - How organizations and authorities are adapting
6. **Historical Context** - Cultural precedents and cyclical patterns
7. **Cultural Indicators** - What this reveals about broader social values
8. **Counter-Narratives** - Alternative interpretations and resistance movements
9. **Long-Term Cultural Shift** - How this fits into larger cultural transformation

Focus on anthropological insights, sociological analysis, and cultural criticism. Explore meaning-making and identity formation.`
  }
};

/**
 * Smart Template Selection
 * AI function to choose the most appropriate template based on story content
 */
export function selectTemplateForContent(content: string, metadata?: any): ContentTemplate {
  const contentLower = content.toLowerCase();
  const tags: string[] = metadata?.tags || [];
  const sentiment = metadata?.sentiment || 'neutral';
  
  // Breaking news indicators
  if (contentLower.includes('breaking') || contentLower.includes('urgent') || 
      contentLower.includes('developing') || tags.includes('breaking')) {
    return ANALYTICAL_TEMPLATES['breaking-news'];
  }
  
  // Social media story indicators  
  if (contentLower.includes('viral') || contentLower.includes('trending') ||
      contentLower.includes('twitter') || contentLower.includes('tiktok') ||
      tags.some((tag: string) => ['social', 'viral', 'reddit', 'twitter'].includes(tag))) {
    return ANALYTICAL_TEMPLATES['social-media-story'];
  }
  
  // Economic story indicators
  if (contentLower.includes('market') || contentLower.includes('economic') ||
      contentLower.includes('financial') || contentLower.includes('stock') ||
      tags.some((tag: string) => ['economy', 'markets', 'business', 'finance'].includes(tag))) {
    return ANALYTICAL_TEMPLATES['economic-impact'];
  }
  
  // Political story indicators
  if (contentLower.includes('political') || contentLower.includes('election') ||
      contentLower.includes('government') || contentLower.includes('policy') ||
      tags.some((tag: string) => ['politics', 'policy', 'election', 'government'].includes(tag))) {
    return ANALYTICAL_TEMPLATES['political-analysis'];
  }
  
  // Technology story indicators
  if (contentLower.includes('technology') || contentLower.includes('ai') ||
      contentLower.includes('innovation') || contentLower.includes('tech') ||
      tags.some((tag: string) => ['technology', 'ai', 'innovation', 'tech'].includes(tag))) {
    return ANALYTICAL_TEMPLATES['tech-disruption'];
  }
  
  // Cultural story indicators
  if (contentLower.includes('cultural') || contentLower.includes('social') ||
      sentiment === 'mixed' || tags.some((tag: string) => ['culture', 'society', 'social'].includes(tag))) {
    return ANALYTICAL_TEMPLATES['cultural-moment'];
  }
  
  // Default to social media analysis for general news
  return ANALYTICAL_TEMPLATES['social-media-story'];
}

/**
 * Generate contextual analysis prompts based on story characteristics
 */
export function generateContextualPrompt(content: string, metadata?: any): string {
  const template = selectTemplateForContent(content, metadata);
  const storyType = metadata?.tags?.[0] || 'general news';
  const priority = metadata?.priority || 'medium';
  const sentiment = metadata?.sentiment || 'neutral';
  
  return `${template.prompt}

STORY CONTEXT:
- Type: ${storyType}
- Priority: ${priority} 
- Sentiment: ${sentiment}
- Source: Social media news aggregation

Focus on analytical depth, data-driven insights, and professional newsletter formatting with proper HTML structure.`;
}

console.log('📋 Analytical content templates loaded with smart selection');