// Stub API for demo mode - no backend calls are actually made
// The demo uses Zustand stores and localStorage instead

// Use a type that will work with Convex React hooks but won't throw type errors
type StubFunction = (...args: any[]) => any;

export const api = {
  users: {
    viewer: (null as any) as StubFunction,
    getCurrentUser: (null as any) as StubFunction,
    createUser: (null as any) as StubFunction,
    getUserById: (null as any) as StubFunction,
    updateUser: (null as any) as StubFunction,
  },
  dailyLogs: {
    dailyLog: (null as any) as StubFunction,
    createDailyLog: (null as any) as StubFunction,
    getDailyLog: (null as any) as StubFunction,
    getDailyLogs: (null as any) as StubFunction,
    listDailyLogs: (null as any) as StubFunction,
    listAllUserLogs: (null as any) as StubFunction,
    listScores: (null as any) as StubFunction,
    getLogsByDateRange: (null as any) as StubFunction,
    updateDailyLog: (null as any) as StubFunction,
    deleteDailyLog: (null as any) as StubFunction,
  },
  userAttributes: {
    getAttributes: (null as any) as StubFunction,
    getUserAttributes: (null as any) as StubFunction,
    setAttributes: (null as any) as StubFunction,
    updateUserAttributes: (null as any) as StubFunction,
  },
  templates: {
    getTemplates: (null as any) as StubFunction,
    createTemplate: (null as any) as StubFunction,
    updateTemplate: (null as any) as StubFunction,
    deleteTemplate: (null as any) as StubFunction,
  },
  dailyLogTemplates: {
    getTemplates: (null as any) as StubFunction,
    createTemplate: (null as any) as StubFunction,
    updateTemplate: (null as any) as StubFunction,
  },
  feed: {
    getFeed: (null as any) as StubFunction,
    getFeedTags: (null as any) as StubFunction,
    listFeedMessages: (null as any) as StubFunction,
    addComment: (null as any) as StubFunction,
    getComments: (null as any) as StubFunction,
    addTag: (null as any) as StubFunction,
    removeTag: (null as any) as StubFunction,
    generateFeedItem: (null as any) as StubFunction,
    generateFeedForDailyLog: (null as any) as StubFunction,
  },
  score: {
    scoreDailyLog: (null as any) as StubFunction,
  },
  forecast: {
    generateForecast: (null as any) as StubFunction,
    getSevenDayForecast: (null as any) as StubFunction,
    getLogsForUserInRangeSimple: (null as any) as StubFunction,
    getForecastFeedback: (null as any) as StubFunction,
    submitForecastFeedback: (null as any) as StubFunction,
  },
  testing: {
    consultChat: (null as any) as StubFunction,
    getInsights: (null as any) as StubFunction,
    getTestSevenDayForecast: (null as any) as StubFunction,
  },
  generator: {
    generateWeeklyInsights: (null as any) as StubFunction,
    generateDailyConsultation: (null as any) as StubFunction,
  },
  randomizer: {
    generateRandomLog: (null as any) as StubFunction,
    getInstructions: (null as any) as StubFunction,
    saveInstructions: (null as any) as StubFunction,
  },
  feedback: {
    submitFeedback: (null as any) as StubFunction,
    submitUserFeedback: (null as any) as StubFunction,
    getUserFeedback: (null as any) as StubFunction,
  },
  stripe: {
    simulateSuccessfulCheckout: (null as any) as StubFunction,
  },
  payments: {
    createCheckoutSession: (null as any) as StubFunction,
  },
  webhooks: {
    processStripeWebhook: (null as any) as StubFunction,
  },
} as const;

export const internal = {} as const;
