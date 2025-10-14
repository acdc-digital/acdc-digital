/**
 * FEDS Seed Data - Sample documents for vector search
 * 
 * Action to populate the FEDS corpus with sample documents
 * about mental health, productivity, and technology statistics.
 */

"use node";

import { action } from "../_generated/server";
import { v } from "convex/values";
import { api } from "../_generated/api";

// Sample FEDS documents
const SAMPLE_DOCUMENTS = [
  {
    title: "Mental Health Statistics: Depression and Anxiety Rates",
    content: "According to the National Institute of Mental Health, approximately 21.0 million adults in the United States had at least one major depressive episode in 2020. This represents 8.4% of all U.S. adults. Depression is more prevalent among females (10.5%) compared to males (6.2%). Anxiety disorders affect 19.1% of adults in the U.S. annually. The median age of onset for anxiety disorders is 11 years. These conditions often co-occur, with about 60% of people with depression also experiencing anxiety.",
    summary: "Depression affects 8.4% of U.S. adults, anxiety affects 19.1%, with significant overlap between conditions.",
    documentType: "statistic" as const,
    category: "mental-health",
    tags: ["depression", "anxiety", "statistics", "prevalence", "mental health"],
    source: "National Institute of Mental Health (NIMH)",
    relevanceScore: 95,
  },
  {
    title: "Productivity Statistics: Remote Work Impact",
    content: "A Stanford study found that remote workers are 13% more productive than their office-based counterparts. Employees working from home completed 13.5% more calls than in the office. Additionally, remote workers took fewer sick days and shorter breaks, while reporting higher work satisfaction. However, the study also found that creativity and innovation may suffer in fully remote environments. Hybrid models combining 2-3 days of remote work per week showed the highest satisfaction and productivity scores. Companies implementing flexible work policies reported 25% lower employee turnover.",
    summary: "Remote workers are 13% more productive but hybrid models show highest satisfaction.",
    documentType: "statistic" as const,
    category: "productivity",
    tags: ["remote work", "productivity", "hybrid work", "work from home", "efficiency"],
    source: "Stanford University",
    relevanceScore: 90,
  },
  {
    title: "Sleep and Cognitive Performance Guidelines",
    content: "The National Sleep Foundation recommends adults aged 18-64 get 7-9 hours of sleep per night for optimal health and cognitive function. Studies show that sleep deprivation of even one hour per night can reduce cognitive performance by up to 25%. Chronic sleep loss is associated with decreased attention span, impaired memory consolidation, and reduced problem-solving abilities. Regular sleep schedules improve learning and memory by up to 40%. The first 90 minutes of sleep are crucial for memory consolidation, while REM sleep enhances creative problem-solving.",
    summary: "Adults need 7-9 hours of sleep; even 1 hour loss can reduce cognitive performance by 25%.",
    documentType: "guideline" as const,
    category: "health",
    tags: ["sleep", "cognitive performance", "memory", "guidelines", "health"],
    source: "National Sleep Foundation",
    relevanceScore: 92,
  },
  {
    title: "Digital Wellness: Screen Time Recommendations",
    content: "The American Academy of Pediatrics recommends limiting recreational screen time to 2 hours per day for optimal mental and physical health. Adults spend an average of 11 hours per day interacting with media and screens. Excessive screen time before bed disrupts circadian rhythms and reduces sleep quality by 30%. Blue light exposure in the evening suppresses melatonin production by up to 50%. Implementing a 'digital sunset' 2 hours before bed can improve sleep quality and reduce anxiety symptoms. Taking 5-minute screen breaks every hour improves focus and reduces eye strain.",
    summary: "Limit screen time to 2 hours/day for recreation; avoid screens 2 hours before bed.",
    documentType: "guideline" as const,
    category: "digital-wellness",
    tags: ["screen time", "digital wellness", "sleep", "blue light", "recommendations"],
    source: "American Academy of Pediatrics",
    relevanceScore: 88,
  },
  {
    title: "Exercise and Mental Health Connection",
    content: "Regular physical activity reduces symptoms of depression by 26% and anxiety by 20%, according to meta-analysis of 49 studies. Even 15 minutes of moderate exercise per day can reduce depression risk by 26%. The optimal dose for mental health benefits is 150 minutes of moderate exercise per week. Exercise increases production of endorphins and brain-derived neurotrophic factor (BDNF), which supports neuron growth. Group exercise provides additional mental health benefits through social connection. Morning exercise has been shown to improve mood throughout the day and enhance sleep quality.",
    summary: "Exercise reduces depression by 26% and anxiety by 20%; optimal dose is 150 min/week.",
    documentType: "statistic" as const,
    category: "mental-health",
    tags: ["exercise", "mental health", "depression", "anxiety", "physical activity"],
    source: "Journal of Clinical Psychiatry",
    relevanceScore: 94,
  },
  {
    title: "Nutrition and Cognitive Function",
    content: "Research shows that Mediterranean diets rich in omega-3 fatty acids improve cognitive function by 23%. Diets high in processed foods and sugar are associated with 33% higher risk of depression. The gut microbiome influences mental health through the gut-brain axis. Probiotic-rich foods can reduce anxiety symptoms by 18%. Adequate hydration (8 glasses of water daily) improves concentration and cognitive performance by 14%. Vitamin D deficiency is linked to 14% higher depression risk. Regular consumption of leafy greens and fatty fish supports brain health and reduces cognitive decline.",
    summary: "Mediterranean diet improves cognition by 23%; processed foods increase depression risk by 33%.",
    documentType: "statistic" as const,
    category: "health",
    tags: ["nutrition", "cognitive function", "diet", "mental health", "brain health"],
    source: "American Journal of Clinical Nutrition",
    relevanceScore: 91,
  },
  {
    title: "Meditation and Stress Reduction Practices",
    content: "Meta-analysis of 47 trials shows that mindfulness meditation reduces anxiety symptoms by 38% and depression symptoms by 30%. Just 10 minutes of daily meditation can decrease stress levels by 27%. Regular meditation practice increases gray matter in brain regions associated with emotional regulation. Meditation has been shown to reduce cortisol levels by 20-25%. Apps and guided meditation show similar benefits to in-person instruction. Consistency is key: daily practice for 8 weeks shows maximum benefit. Combining meditation with exercise provides synergistic effects on mental health.",
    summary: "10 minutes daily meditation reduces stress by 27% and anxiety by 38%.",
    documentType: "guideline" as const,
    category: "mental-health",
    tags: ["meditation", "mindfulness", "stress", "anxiety", "mental health"],
    source: "JAMA Internal Medicine",
    relevanceScore: 93,
  },
  {
    title: "Social Connection and Loneliness Statistics",
    content: "Loneliness affects 33% of adults globally and has health impacts equivalent to smoking 15 cigarettes per day. Strong social connections increase survival probability by 50%. Social isolation increases risk of depression by 29% and anxiety by 26%. Regular social interaction (at least 3 meaningful conversations per week) improves mental health outcomes. Quality of relationships matters more than quantity: one close friendship can reduce depression risk by 18%. Virtual social connections provide 40% of the mental health benefits of in-person interactions. Community involvement reduces cognitive decline risk by 30%.",
    summary: "Loneliness affects 33% of adults; social connections increase survival by 50%.",
    documentType: "statistic" as const,
    category: "mental-health",
    tags: ["loneliness", "social connection", "relationships", "mental health", "isolation"],
    source: "American Journal of Epidemiology",
    relevanceScore: 89,
  },
  {
    title: "Time Management and Productivity Techniques",
    content: "The Pomodoro Technique (25-minute focused work sessions with 5-minute breaks) increases productivity by 25%. Time blocking can improve task completion rates by 35%. Multi-tasking reduces productivity by 40% and increases error rates. Single-tasking with deep focus improves work quality by 50%. The two-minute rule (immediately complete tasks under 2 minutes) reduces procrastination. Batch processing similar tasks saves 20% of work time. Setting clear priorities using the Eisenhower Matrix helps focus on high-impact work. Regular breaks every 90 minutes align with natural ultradian rhythms and maintain peak performance.",
    summary: "Pomodoro Technique boosts productivity by 25%; multi-tasking reduces it by 40%.",
    documentType: "guideline" as const,
    category: "productivity",
    tags: ["time management", "productivity", "focus", "pomodoro", "efficiency"],
    source: "Journal of Organizational Behavior",
    relevanceScore: 87,
  },
  {
    title: "Workplace Stress and Burnout Prevention",
    content: "Work-related stress affects 83% of U.S. workers, with 25% citing it as the number one stressor in their lives. Burnout rates have increased to 42% of employees across all industries. Clear boundaries between work and personal life reduce burnout risk by 38%. Taking regular vacations (at least 2 weeks annually) decreases stress by 29%. Organizations with strong mental health support see 30% lower turnover. Flexible work schedules reduce stress levels by 20%. Regular check-ins with managers about workload improve employee satisfaction by 31%. Companies investing in wellness programs see $3.27 return for every dollar spent.",
    summary: "83% of workers experience stress; clear work-life boundaries reduce burnout by 38%.",
    documentType: "statistic" as const,
    category: "workplace",
    tags: ["stress", "burnout", "workplace", "work-life balance", "mental health"],
    source: "American Psychological Association",
    relevanceScore: 92,
  },
];

/**
 * Seed the FEDS corpus with sample documents
 */
export const seedCorpus = action({
  args: {
    clearExisting: v.optional(v.boolean()),
  },
  returns: v.object({
    created: v.number(),
    failed: v.number(),
    totalTokenUsage: v.number(),
    errors: v.array(v.string()),
  }),
  handler: async (ctx, args) => {
    let created = 0;
    let failed = 0;
    let totalTokenUsage = 0;
    const errors: string[] = [];

    console.log(`Seeding FEDS corpus with ${SAMPLE_DOCUMENTS.length} documents...`);

    // Optionally clear existing documents
    if (args.clearExisting) {
      console.log("Clearing existing documents...");
      const existingDocs = await ctx.runQuery(api.feds.documents.list, {
        verificationStatus: "draft",
        limit: 100,
      });
      
      for (const doc of existingDocs) {
        try {
          await ctx.runMutation(api.feds.documents.deleteDocument, {
            documentId: doc._id,
          });
        } catch (error) {
          console.error(`Failed to delete document ${doc._id}:`, error);
        }
      }
    }

    // Create documents with embeddings
    for (const doc of SAMPLE_DOCUMENTS) {
      try {
        console.log(`Creating document: ${doc.title}`);
        
        const result = await ctx.runAction(api.feds.embeddings.createWithEmbedding, {
          ...doc,
          verificationStatus: "verified", // Mark sample docs as verified
        });

        created++;
        totalTokenUsage += result.tokenUsage;
        
        console.log(`✓ Created document ${result.documentId}`);
      } catch (error) {
        failed++;
        const errorMsg = `Failed to create "${doc.title}": ${error instanceof Error ? error.message : String(error)}`;
        errors.push(errorMsg);
        console.error(errorMsg);
      }
    }

    const summary = {
      created,
      failed,
      totalTokenUsage,
      errors,
    };

    console.log("\n=== Seeding Complete ===");
    console.log(`Created: ${created}`);
    console.log(`Failed: ${failed}`);
    console.log(`Total tokens used: ${totalTokenUsage}`);
    
    if (errors.length > 0) {
      console.log("\nErrors:");
      errors.forEach(err => console.log(`  - ${err}`));
    }

    return summary;
  },
});

/**
 * Test vector search with a sample query
 */
export const testVectorSearch = action({
  args: {
    query: v.string(),
    limit: v.optional(v.number()),
  },
  returns: v.object({
    query: v.string(),
    results: v.array(v.object({
      title: v.string(),
      summary: v.optional(v.string()),
      category: v.string(),
      similarityScore: v.number(),
    })),
    totalFound: v.number(),
    tokenUsage: v.number(),
  }),
  handler: async (ctx, args) => {
    console.log(`\n=== Testing Vector Search ===`);
    console.log(`Query: "${args.query}"`);

    const searchResult = await ctx.runAction(api.feds.embeddings.semanticSearch, {
      query: args.query,
      limit: args.limit || 5,
      minScore: 0.7,
    });

    console.log(`\nFound ${searchResult.totalFound} results:`);
    searchResult.results.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.title}`);
      console.log(`   Category: ${result.category}`);
      console.log(`   Similarity: ${(result.similarityScore * 100).toFixed(1)}%`);
      if (result.summary) {
        console.log(`   Summary: ${result.summary}`);
      }
    });

    return {
      query: args.query,
      results: searchResult.results.map(r => ({
        title: r.title,
        summary: r.summary,
        category: r.category,
        similarityScore: r.similarityScore,
      })),
      totalFound: searchResult.totalFound,
      tokenUsage: searchResult.tokenUsage,
    };
  },
});
