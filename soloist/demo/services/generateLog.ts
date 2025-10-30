/**
 * Demo Log Generation Service
 * Client-side log generation for demo mode (no backend required)
 * Generates realistic daily log data based on templates
 */

export interface GeneratedLogData {
  overallMood: number;
  workSatisfaction: number;
  personalLifeSatisfaction: number;
  balanceRating: number;
  sleep: number;
  exercise: boolean;
  highlights: string;
  challenges: string;
  tomorrowGoal: string;
}

/**
 * Generate a realistic daily log entry
 * This runs entirely in the browser - no API calls, no persistence beyond session
 * Data is ephemeral and will be lost on page refresh
 */
export async function generateDailyLog(
  date: string,
  userInstructions?: string
): Promise<GeneratedLogData> {
  console.log("🎲 Generating demo log for:", date, "with instructions:", !!userInstructions);

  // Simulate API delay for realism
  await new Promise(resolve => setTimeout(resolve, 800));

  // Parse date to get day of week and month for variation
  const dateObj = new Date(date);
  const dayOfWeek = dateObj.getDay(); // 0-6 (Sunday-Saturday)
  const dayOfMonth = dateObj.getDate(); // 1-31
  const month = dateObj.getMonth(); // 0-11

  // Create realistic variation based on date patterns
  // Weekends typically have different patterns than weekdays
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  const isMonday = dayOfWeek === 1;
  const isFriday = dayOfWeek === 5;

  // Base mood varies throughout the month (reflecting natural cycles)
  const baseEnergy = 50 + (Math.sin(dayOfMonth / 31 * Math.PI * 2) * 20);
  
  // Add some randomness but keep it realistic
  const randomFactor = (Math.random() - 0.5) * 30;
  const moodBase = Math.max(3, Math.min(9, Math.round((baseEnergy + randomFactor) / 10)));

  // Generate correlated metrics
  const overallMood = moodBase;
  const workSatisfaction = isWeekend 
    ? Math.max(1, moodBase - Math.floor(Math.random() * 2)) // Lower on weekends (not working)
    : Math.max(1, Math.min(10, moodBase + Math.floor(Math.random() * 3) - 1));
  
  const personalLifeSatisfaction = isWeekend
    ? Math.max(1, Math.min(10, moodBase + Math.floor(Math.random() * 2))) // Higher on weekends
    : Math.max(1, Math.min(10, moodBase + Math.floor(Math.random() * 2) - 1));
  
  const balanceRating = Math.max(1, Math.min(10, 
    Math.round((workSatisfaction + personalLifeSatisfaction) / 2)
  ));

  // Sleep varies more on weekends
  const sleepBase = isWeekend ? 8 : 7;
  const sleep = Math.max(4, Math.min(10, 
    sleepBase + (Math.random() - 0.5) * 2
  ));

  // Exercise more likely on weekends and certain days
  const exerciseChance = isWeekend ? 0.7 : (dayOfWeek === 2 || dayOfWeek === 4 ? 0.6 : 0.4);
  const exercise = Math.random() < exerciseChance;

  // Generate realistic text based on mood and context
  const highlights = generateHighlight(overallMood, isWeekend, isFriday, exercise);
  const challenges = generateChallenge(overallMood, isMonday, isWeekend, sleep);
  const tomorrowGoal = generateGoal(dayOfWeek, overallMood, isWeekend);

  const generatedData: GeneratedLogData = {
    overallMood,
    workSatisfaction,
    personalLifeSatisfaction,
    balanceRating,
    sleep: Math.round(sleep * 2) / 2, // Round to nearest 0.5
    exercise,
    highlights,
    challenges,
    tomorrowGoal,
  };

  console.log("✅ Generated demo log data:", generatedData);
  return generatedData;
}

function generateHighlight(mood: number, isWeekend: boolean, isFriday: boolean, exercise: boolean): string {
  const weekendHighlights = [
    "Had a relaxing morning with coffee and no alarms.",
    "Spent quality time with friends catching up.",
    "Enjoyed a leisurely brunch and good conversation.",
    "Made progress on a personal project I've been excited about.",
    "Took a long walk and cleared my mind completely.",
    "Watched a great movie and felt totally recharged.",
    "Had an amazing workout session that left me energized.",
  ];

  const fridayHighlights = [
    "Wrapped up the week strong with all key tasks completed.",
    "Team lunch was fun - great way to end the work week.",
    "Hit all my goals for the week and feeling accomplished.",
    "Looking forward to the weekend after a productive week.",
  ];

  const workdayHighlights = [
    "Solved a challenging problem that's been blocking progress.",
    "Had a breakthrough moment on a complex project.",
    "Great team collaboration led to innovative solutions.",
    "Completed a major milestone ahead of schedule.",
    "Received positive feedback on recent work.",
    "Deep focus session was incredibly productive.",
    "Made meaningful progress on long-term goals.",
  ];

  const lowMoodHighlights = [
    "Managed to complete the essentials despite low energy.",
    "Found a small win in an otherwise challenging day.",
    "Practiced self-compassion and took things slow.",
    "Made it through the day - that's enough.",
  ];

  if (mood <= 4) {
    return lowMoodHighlights[Math.floor(Math.random() * lowMoodHighlights.length)];
  }

  if (isWeekend) {
    return weekendHighlights[Math.floor(Math.random() * weekendHighlights.length)];
  }

  if (isFriday) {
    return fridayHighlights[Math.floor(Math.random() * fridayHighlights.length)];
  }

  return workdayHighlights[Math.floor(Math.random() * workdayHighlights.length)];
}

function generateChallenge(mood: number, isMonday: boolean, isWeekend: boolean, sleep: number): string {
  if (mood >= 8 && sleep >= 7) {
    const noChallenges = [
      "No major challenges - smooth day overall.",
      "Everything flowed well today.",
      "Pretty straightforward day with no significant obstacles.",
    ];
    return noChallenges[Math.floor(Math.random() * noChallenges.length)];
  }

  const mondayChallenges = [
    "Tough to get back into work mode after the weekend.",
    "Motivation was low coming off the weekend.",
    "Took a while to regain focus and momentum.",
  ];

  const sleepChallenges = [
    "Poor sleep really affected my energy and focus today.",
    "Felt sluggish all day from not sleeping well.",
    "Sleep deprivation made everything feel harder than it should.",
  ];

  const commonChallenges = [
    "Struggled with procrastination on less interesting tasks.",
    "Had trouble maintaining focus in the afternoon.",
    "Dealing with some stress about upcoming deadlines.",
    "Felt scattered trying to juggle multiple priorities.",
    "Energy dipped significantly after lunch.",
    "Difficult conversation drained my energy.",
    "Technical issues disrupted my workflow.",
  ];

  if (sleep < 6) {
    return sleepChallenges[Math.floor(Math.random() * sleepChallenges.length)];
  }

  if (isMonday && mood < 7) {
    return mondayChallenges[Math.floor(Math.random() * mondayChallenges.length)];
  }

  return commonChallenges[Math.floor(Math.random() * commonChallenges.length)];
}

function generateGoal(dayOfWeek: number, mood: number, isWeekend: boolean): string {
  const weekendGoals = [
    "Recharge and prepare mentally for the week ahead.",
    "Finish that personal project I've been working on.",
    "Spend quality time on hobbies and relaxation.",
    "Get outside and move my body.",
  ];

  const fridayGoals = [
    "Close out the week strong and tie up loose ends.",
    "Set myself up for a relaxing weekend.",
    "Complete critical tasks so I can disconnect.",
  ];

  const mondayGoals = [
    "Start the week with clear priorities and good energy.",
    "Set the tone for a productive week.",
    "Tackle the most important task first thing.",
  ];

  const generalGoals = [
    "Make progress on the highest-priority project.",
    "Maintain focus and avoid distractions.",
    "Complete deep work session on complex problem.",
    "Ship the feature I've been working on.",
    "Have meaningful conversations with team members.",
    "Balance productivity with self-care.",
    "Stay organized and work systematically through my list.",
  ];

  if (isWeekend) {
    return weekendGoals[Math.floor(Math.random() * weekendGoals.length)];
  }

  if (dayOfWeek === 5) { // Friday
    return fridayGoals[Math.floor(Math.random() * fridayGoals.length)];
  }

  if (dayOfWeek === 1) { // Monday
    return mondayGoals[Math.floor(Math.random() * mondayGoals.length)];
  }

  return generalGoals[Math.floor(Math.random() * generalGoals.length)];
}

/**
 * Validate generated data matches expected template fields
 * Returns validated data that can be safely used in the form
 */
export function validateGeneratedData(
  data: GeneratedLogData,
  templateFields: Array<{ id: string; type: string; min?: number; max?: number; defaultValue?: any }>
): Record<string, any> {
  const validated: Record<string, any> = {};

  templateFields.forEach(field => {
    const value = data[field.id as keyof GeneratedLogData];

    switch (field.type) {
      case "slider":
      case "number":
        if (typeof value === 'number') {
          const min = field.min || 0;
          const max = field.max || 10;
          validated[field.id] = Math.max(min, Math.min(max, Math.round(value)));
        } else {
          validated[field.id] = field.defaultValue;
        }
        break;

      case "checkbox":
        validated[field.id] = typeof value === 'boolean' ? value : field.defaultValue;
        break;

      case "textarea":
      case "text":
        validated[field.id] = typeof value === 'string' ? value : field.defaultValue || "";
        break;

      default:
        validated[field.id] = value !== undefined ? value : field.defaultValue;
    }
  });

  return validated;
}
