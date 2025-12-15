"use client";

import React, { useState, useMemo } from "react";
import { FunctionTable, SearchBar, TableOfContents } from "./_components";
import type { FunctionDocumentation } from "./_components";

export default function WikiPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // User Management Functions
  const userFunctions: FunctionDocumentation[] = [
    {
      name: "viewer",
      type: "query",
      description: "Get the current authenticated user (viewer)",
      parameters: [],
      returns: "User | null",
      example: `const user = useQuery(api.shared.users.users.viewer);`,
      explanation: "This function checks who is currently logged into the app and returns their user information. If nobody is logged in, it returns null. It's commonly used to display user information in the UI or to check if someone is authenticated before showing certain features.",
    },
    {
      name: "currentUser",
      type: "query",
      description: "Get the current authenticated user",
      parameters: [],
      returns: "User | null",
      example: `const user = useQuery(api.shared.users.users.currentUser);`,
      explanation: "Similar to the viewer function, this retrieves information about whoever is currently signed in. It's useful when you need to access the logged-in user's details like their name, email, or profile picture anywhere in your application.",
    },
    {
      name: "getProfile",
      type: "query",
      description: "Get user profile information for the authenticated user",
      parameters: [],
      returns: "User",
      example: `const profile = useQuery(api.shared.users.users.getProfile);`,
      explanation: "This function fetches the complete profile information for the person who is currently logged in. Unlike viewer or currentUser, this will throw an error if no one is authenticated, making it suitable for protected pages where you know someone must be logged in.",
    },
    {
      name: "getAllUsers",
      type: "query",
      description: "Get all users (admin function)",
      parameters: [],
      returns: "User[]",
      example: `const users = useQuery(api.shared.users.users.getAllUsers);`,
      explanation: "This retrieves a list of every user registered in the system. It's intended for administrative purposes, like viewing all users in an admin dashboard. In a production app, this should be restricted to admin users only with proper permission checks.",
    },
    {
      name: "getUserByEmailPublic",
      type: "query",
      description: "Check if user exists by email (public query)",
      parameters: [
        { name: "email", type: "string", description: "User's email address" },
      ],
      returns: "User | null",
      example: `const user = useQuery(api.shared.users.users.getUserByEmailPublic, { email: "user@example.com" });`,
      explanation: "This looks up a user by their email address and returns their public profile information if found. It's useful for checking whether someone has already signed up with a particular email or for finding users by email in features like invitations or mentions.",
    },
    {
      name: "getUserSubscriptionStatus",
      type: "query",
      description: "Get user's subscription status",
      parameters: [],
      returns: "{ hasActiveSubscription: boolean, subscriptionType: string | null, subscription: Subscription }",
      example: `const status = useQuery(api.shared.users.users.getUserSubscriptionStatus);`,
      explanation: "This checks whether the current user has an active paid subscription. It returns detailed information about their subscription status, which is useful for determining whether to show premium features or prompt them to upgrade their plan.",
    },
    {
      name: "getUser",
      type: "query",
      description: "Get user by ID (public function)",
      parameters: [
        { name: "id", type: "string", description: "User ID" },
      ],
      returns: "User | null",
      example: `const user = useQuery(api.shared.users.users.getUser, { id: "user_123" });`,
      explanation: "This retrieves a user's information using their unique ID. For security, it only allows users to access their own data - if you request someone else's ID, it returns null. This prevents users from viewing other people's private information.",
    },
    {
      name: "exportUserData",
      type: "query",
      description: "Export all user data including profile, logs, attributes, and subscription",
      parameters: [],
      returns: "{ profile: User, dailyLogs: Log[], userAttributes: UserAttributes, subscription: Subscription, exportedAt: string, totalLogs: number }",
      example: `const data = useQuery(api.shared.users.users.exportUserData);`,
      explanation: "This gathers all of the current user's data from across the entire system - their profile, all their daily mood logs, custom attributes, and subscription info - and packages it into a single export. This is useful for GDPR compliance, allowing users to download all their data, or for creating backups.",
    },
    {
      name: "upsertUser",
      type: "mutation",
      description: "Upsert user (public function)",
      parameters: [
        { name: "name", type: "string", optional: true, description: "User's name" },
        { name: "email", type: "string", optional: true, description: "User's email" },
        { name: "image", type: "string", optional: true, description: "User's profile image URL" },
      ],
      returns: "Id<'users'>",
      example: `const userId = await upsertUser({ name: "John Doe", email: "john@example.com" });`,
      explanation: "This updates the authenticated user's profile information with any new values you provide. You can update their name, email, or profile picture. It only modifies the fields you include in the request, leaving other fields unchanged.",
    },
    {
      name: "updateUserProfile",
      type: "mutation",
      description: "Update user profile (public mutation for authenticated users)",
      parameters: [
        { name: "name", type: "string", optional: true, description: "User's name" },
        { name: "phone", type: "string", optional: true, description: "User's phone number" },
        { name: "image", type: "string", optional: true, description: "User's profile image URL" },
      ],
      returns: "User",
      example: `const updated = await updateUserProfile({ name: "Jane Doe" });`,
      explanation: "This allows the current user to update their profile details like name, phone number, or profile picture. After making the changes, it returns the updated user object so you can see the new values. Only authenticated users can call this, and they can only update their own profile.",
    },
    {
      name: "getUserByEmail",
      type: "internalQuery",
      description: "Get user by email (internal function)",
      parameters: [
        { name: "email", type: "string", description: "User's email address" },
      ],
      returns: "User | null",
      explanation: "This is an internal function used by the backend to look up users by email. It's marked as internal so it can only be called by other Convex functions, not directly from the client. This helps protect sensitive operations like authentication and user lookups.",
    },
    {
      name: "updateProfile",
      type: "internalMutation",
      description: "Update user profile",
      parameters: [
        { name: "userId", type: "Id<'users'>", description: "User ID" },
        { name: "name", type: "string", optional: true, description: "User's name" },
        { name: "email", type: "string", optional: true, description: "User's email" },
        { name: "image", type: "string", optional: true, description: "User's profile image URL" },
        { name: "phone", type: "string", optional: true, description: "User's phone number" },
      ],
      returns: "void",
      explanation: "This internal function handles the core logic of updating a user's profile information. It's used by other backend functions and removes any undefined values before saving, ensuring only the fields you want to change actually get updated in the database.",
    },
    {
      name: "deleteAccount",
      type: "internalMutation",
      description: "Delete user account and all associated data",
      parameters: [
        { name: "userId", type: "Id<'users'>", description: "User ID to delete" },
      ],
      returns: "void",
      explanation: "This permanently removes a user's account and all their associated data from the system. It first deletes related records like subscriptions, then removes the user itself. This is a sensitive operation that's kept internal for security reasons.",
    },
    {
      name: "completeUserDeletion",
      type: "internalMutation",
      description: "Completely delete a user and all associated data by email",
      parameters: [
        { name: "email", type: "string", description: "User's email address" },
      ],
      returns: "DeletionSummary",
      explanation: "This is a comprehensive deletion function that removes a user and absolutely everything associated with them - subscriptions, payments, logs, forecasts, feed entries, and more. It returns a summary of what was deleted, which is useful for debugging and confirming the deletion was complete.",
    },
  ];

  // Daily Logs Functions
  const dailyLogsFunctions: FunctionDocumentation[] = [
    {
      name: "listDailyLogs",
      type: "query",
      description: "Fetch all logs for a given user and year",
      parameters: [
        { name: "userId", type: "string", description: "User ID" },
        { name: "year", type: "string", description: "Year in YYYY format (e.g., '2025')" },
      ],
      returns: "Log[]",
      example: `const logs = useQuery(api.dailyLogs.listDailyLogs, { userId: "user_123", year: "2025" });`,
      explanation: "This retrieves all mood logs for a specific user during a particular year. For example, if you want to see all of someone's entries from 2025, this will fetch every log from January 1st through December 31st. It's useful for yearly review features or visualizing long-term patterns.",
    },
    {
      name: "getDailyLog",
      type: "query",
      description: "Fetch a single daily log for a given user and date",
      parameters: [
        { name: "userId", type: "string", description: "User ID" },
        { name: "date", type: "string", description: "Date in YYYY-MM-DD format" },
      ],
      returns: "Log | null",
      example: `const log = useQuery(api.dailyLogs.getDailyLog, { userId: "user_123", date: "2025-01-15" });`,
      explanation: "This fetches a single mood log entry for a specific date. If the user has logged their mood on that day, you'll get their entry back. If they haven't logged anything for that date yet, it returns null. This is perfect for showing today's log or checking if a particular day has been filled in.",
    },
    {
      name: "getLogsByDateRange",
      type: "query",
      description: "Fetch all daily logs for a user between two ISO dates (inclusive)",
      parameters: [
        { name: "userId", type: "string", description: "User ID" },
        { name: "startDate", type: "string", description: "Start date in YYYY-MM-DD format" },
        { name: "endDate", type: "string", description: "End date in YYYY-MM-DD format" },
      ],
      returns: "Log[]",
      example: `const logs = useQuery(api.dailyLogs.getLogsByDateRange, { userId: "user_123", startDate: "2025-01-01", endDate: "2025-01-31" });`,
      explanation: "This gets all logs between two dates, including both the start and end dates. For example, you could fetch all logs from the past week, month, or any custom date range. It's great for showing trends over specific time periods or creating custom reports.",
    },
    {
      name: "getLogCount",
      type: "query",
      description: "Get the total number of logs for a user",
      parameters: [
        { name: "userId", type: "string", description: "User ID" },
      ],
      returns: "number",
      example: `const count = useQuery(api.dailyLogs.getLogCount, { userId: "user_123" });`,
      explanation: "This simply counts how many total log entries a user has created. It's useful for displaying statistics like 'You've logged your mood 45 times!' or tracking user engagement over time.",
    },
    {
      name: "listScores",
      type: "query",
      description: "List all dates and scores for a user",
      parameters: [
        { name: "userId", type: "string", description: "User ID" },
      ],
      returns: "Array<{ date: string, score: number | null }>",
      example: `const scores = useQuery(api.dailyLogs.listScores, { userId: "user_123" });`,
      explanation: "This returns a simplified list of just the dates and mood scores for all of a user's logs, leaving out the detailed answers and other information. It's perfect for creating charts and graphs of mood over time without loading unnecessary data.",
    },
    {
      name: "listAllUserLogs",
      type: "query",
      description: "Debugging helper: Show all logs for a user",
      parameters: [
        { name: "userId", type: "string", description: "User ID" },
      ],
      returns: "Log[]",
      example: `const logs = useQuery(api.dailyLogs.listAllUserLogs, { userId: "user_123" });`,
      explanation: "This is a debugging tool that fetches every single log for a user with all details formatted in a readable way. It includes timestamps and converts them to human-readable dates. Use this when troubleshooting issues or inspecting the raw data structure.",
    },
    {
      name: "getLogById",
      type: "query",
      description: "Debugging helper: Get log details by ID",
      parameters: [
        { name: "logId", type: "string", description: "Log document ID" },
      ],
      returns: "Log | null",
      example: `const log = useQuery(api.dailyLogs.getLogById, { logId: "log_abc123" });`,
      explanation: "This debugging function looks up a specific log using its unique database ID rather than by date and user. It's useful when you're investigating a particular log entry and have its ID, or when building admin tools that need to reference specific records.",
    },
    {
      name: "dailyLog",
      type: "mutation",
      description: "Upserts a daily log record. If a log with (userId, date) already exists, patch it; otherwise insert a new record",
      parameters: [
        { name: "userId", type: "string", description: "User ID" },
        { name: "date", type: "string", description: "Date in YYYY-MM-DD format" },
        { name: "answers", type: "any", description: "Log answers data" },
        { name: "score", type: "number", optional: true, description: "Emotion score (0-100)" },
      ],
      returns: "Log",
      example: `const log = await dailyLog({ userId: "user_123", date: "2025-01-15", answers: {...}, score: 85 });`,
      explanation: "This saves or updates a daily mood log. If the user already logged their mood for this date, it updates that existing entry. If not, it creates a new one. This smart behavior means users can always safely save their mood without worrying about creating duplicates.",
    },
  ];

  // Forecast Functions
  const forecastFunctions: FunctionDocumentation[] = [
    {
      name: "testDatabaseConnection",
      type: "query",
      description: "Test database connection",
      parameters: [],
      returns: "{ success: boolean, message: string }",
      example: `const test = useQuery(api.forecast.testDatabaseConnection);`,
      explanation: "This is a simple health check function that confirms the database is working properly. It returns a success message if everything is connected correctly. Useful for debugging or monitoring the system's health.",
    },
    {
      name: "getLogsForUser",
      type: "query",
      description: "Get recent logs for a user up to a specific end date",
      parameters: [
        { name: "userId", type: "Id<'users'>", description: "User ID" },
        { name: "endDate", type: "string", description: "End date in YYYY-MM-DD format" },
      ],
      returns: "Log[]",
      example: `const logs = useQuery(api.forecast.getLogsForUser, { userId: userId, endDate: "2025-01-31" });`,
      explanation: "This retrieves all logs up to a specific date, ordered with the most recent first. It's particularly useful for the forecasting system, which needs to analyze recent mood patterns to predict future moods.",
    },
    {
      name: "getLogsForUserInRange",
      type: "query",
      description: "Get logs for a user in a date range (inclusive)",
      parameters: [
        { name: "userId", type: "Id<'users'>", description: "User ID" },
        { name: "startDate", type: "string", description: "Start date in YYYY-MM-DD format" },
        { name: "endDate", type: "string", description: "End date in YYYY-MM-DD format" },
      ],
      returns: "Log[]",
      example: `const logs = useQuery(api.forecast.getLogsForUserInRange, { userId, startDate: "2025-01-01", endDate: "2025-01-31" });`,
      explanation: "Similar to the dailyLogs version, but this one normalizes the dates to ensure they're in a consistent format (removing any time components). This is specifically designed for the forecast system which requires clean date formatting.",
    },
    {
      name: "getSevenDayForecast",
      type: "query",
      description: "Get the 7-day forecast data (3 days before today, today, 3 days after today)",
      parameters: [
        { name: "userId", type: "Id<'users'>", description: "User ID" },
        { name: "startDate", type: "string", optional: true, description: "Optional start date override" },
        { name: "endDate", type: "string", optional: true, description: "Optional end date override" },
        { name: "today", type: "string", optional: true, description: "Optional today date override" },
      ],
      returns: "ForecastDay[]",
      example: `const forecast = useQuery(api.forecast.getSevenDayForecast, { userId });`,
      explanation: "This creates a 7-day view: your past 3 days (with actual mood data), today, and the next 3 days (with AI-predicted moods). It's like a weather forecast but for your emotional state. If forecasts haven't been generated yet, it shows placeholder text prompting you to generate them.",
    },
    {
      name: "getForecastFeedback",
      type: "query",
      description: "Get feedback for forecast dates",
      parameters: [
        { name: "userId", type: "Id<'users'>", description: "User ID" },
        { name: "forecastDates", type: "string[]", description: "Array of forecast dates" },
      ],
      returns: "Record<string, 'up' | 'down'>",
      example: `const feedback = useQuery(api.forecast.getForecastFeedback, { userId, forecastDates: ["2025-01-16", "2025-01-17"] });`,
      explanation: "This retrieves thumbs up/down feedback that users have given on forecast predictions. When users rate whether a forecast was accurate, this function lets you see those ratings. It's useful for displaying feedback indicators and for training the AI to improve predictions.",
    },
    {
      name: "generateForecast",
      type: "action",
      description: "Generate forecast for a user based on historical logs",
      parameters: [
        { name: "userId", type: "Id<'users'>", description: "User ID" },
        { name: "startDate", type: "string", optional: true, description: "Start date for log range" },
        { name: "endDate", type: "string", optional: true, description: "End date for log range" },
      ],
      returns: "{ success: boolean, error?: string, forecastDates?: string[] }",
      example: `const result = await generateForecast({ userId });`,
      explanation: "This is the core forecasting action. It analyzes your recent mood logs (default is the last 4 days) and uses AI to predict your mood for the next 3 days. It checks that you have logs for all required days, sends the data to the AI, and saves the predictions. Returns success or an error message if something goes wrong (like missing log data).",
    },
    {
      name: "generateRetrospectiveForecastAnalysis",
      type: "action",
      description: "Generate retrospective forecasts for historical analysis",
      parameters: [
        { name: "userId", type: "Id<'users'>", description: "User ID" },
        { name: "startDate", type: "string", optional: true, description: "Start date for analysis" },
        { name: "endDate", type: "string", optional: true, description: "End date for analysis" },
      ],
      returns: "{ success: boolean, error?: string, analysis?: AnalysisResult }",
      example: `const analysis = await generateRetrospectiveForecastAnalysis({ userId });`,
      explanation: "This is a testing tool that validates forecast accuracy. It goes back through your historical logs, pretends each day is 'today', generates a forecast for the next day, then compares that prediction to what actually happened. It creates an accuracy report showing how well the AI predictions match reality, helping improve the forecasting system.",
    },
    {
      name: "submitForecastFeedback",
      type: "mutation",
      description: "Submit feedback for a forecast (thumbs up/down)",
      parameters: [
        { name: "userId", type: "Id<'users'>", description: "User ID" },
        { name: "forecastDate", type: "string", description: "Forecast date" },
        { name: "feedback", type: "'up' | 'down'", description: "Feedback type" },
      ],
      returns: "{ updated?: boolean, created?: boolean }",
      example: `const result = await submitForecastFeedback({ userId, forecastDate: "2025-01-16", feedback: "up" });`,
      explanation: "This lets users rate whether a forecast was accurate with a thumbs up (good prediction) or thumbs down (inaccurate). If they've already rated that date, it updates their rating. If not, it creates a new rating. This feedback helps track forecast accuracy over time.",
    },
  ];

  // Template Functions
  const templateFunctions: FunctionDocumentation[] = [
    {
      name: "getUserTemplates",
      type: "query",
      description: "Get all templates for a user",
      parameters: [
        { name: "userId", type: "string", description: "User ID" },
      ],
      returns: "Template[]",
      example: `const templates = useQuery(api.templates.getUserTemplates, { userId: "user_123" });`,
      explanation: "This retrieves all custom log templates that a user has created. Templates let users define their own questions for mood logging (like 'Did I exercise?' or 'How much did I sleep?'). This function returns them ordered by most recent first.",
    },
    {
      name: "getTemplateById",
      type: "query",
      description: "Get a specific template by ID",
      parameters: [
        { name: "templateId", type: "Id<'templates'>", description: "Template document ID" },
      ],
      returns: "Template | null",
      example: `const template = useQuery(api.templates.getTemplateById, { templateId });`,
      explanation: "This fetches a single template using its unique ID. Useful when you want to load a specific template to edit it or use it for logging. Returns null if the template doesn't exist or was deleted.",
    },
    {
      name: "saveTemplate",
      type: "mutation",
      description: "Save a new template or update existing one",
      parameters: [
        { name: "name", type: "string", description: "Template name" },
        { name: "userId", type: "string", description: "User ID" },
        { name: "questions", type: "CustomQuestion[]", description: "Array of custom questions" },
      ],
      returns: "Id<'templates'>",
      example: `const id = await saveTemplate({ name: "Morning Routine", userId, questions: [...] });`,
      explanation: "This saves a custom template with its questions. If a template with the same name already exists for this user, it updates that one instead of creating a duplicate. This smart behavior means users can modify their templates without losing the original ID or creating clutter.",
    },
    {
      name: "deleteTemplate",
      type: "mutation",
      description: "Delete a template",
      parameters: [
        { name: "templateId", type: "Id<'templates'>", description: "Template document ID" },
        { name: "userId", type: "string", description: "User ID (for permission check)" },
      ],
      returns: "boolean",
      example: `await deleteTemplate({ templateId, userId });`,
      explanation: "This permanently removes a template. It includes a security check to ensure users can only delete their own templates, not someone else's. This prevents unauthorized deletions and keeps user data private.",
    },
  ];

  // Payment Functions
  const paymentFunctions: FunctionDocumentation[] = [
    {
      name: "getUserPayments",
      type: "query",
      description: "Get all payments for the authenticated user",
      parameters: [],
      returns: "Payment[]",
      example: `const payments = useQuery(api.shared.payments.payments.getUserPayments);`,
      explanation: "This retrieves the complete payment history for the current user, ordered from newest to oldest. It shows all their transactions, including successful payments, pending ones, and any failed attempts. Useful for displaying a billing history page.",
    },
    {
      name: "getPaymentById",
      type: "query",
      description: "Get payment details by ID",
      parameters: [
        { name: "paymentId", type: "Id<'payments'>", description: "Payment document ID" },
      ],
      returns: "Payment | null",
      example: `const payment = useQuery(api.shared.payments.payments.getPaymentById, { paymentId });`,
      explanation: "This fetches detailed information about a specific payment. It includes a security check - users can only view their own payment records, not someone else's. If you try to access another user's payment, it returns null.",
    },
    {
      name: "createCheckoutSession",
      type: "action",
      description: "Create a Stripe checkout session for the authenticated user",
      parameters: [
        { name: "priceId", type: "string", description: "Stripe price ID" },
        { name: "paymentMode", type: "string", optional: true, description: "Payment mode ('subscription' or 'payment')" },
        { name: "embeddedCheckout", type: "boolean", optional: true, description: "Whether to use embedded checkout" },
      ],
      returns: "{ clientSecret: string, sessionId: string }",
      example: `const session = await createCheckoutSession({ priceId: "price_123" });`,
      explanation: "This creates a Stripe checkout session, which is like opening a secure payment window. It initializes the payment process, creates a pending payment record, and returns credentials needed to display the Stripe payment form. The user completes payment in Stripe's secure interface.",
    },
    {
      name: "getBySessionId",
      type: "internalQuery",
      description: "Get payment by Stripe session ID",
      parameters: [
        { name: "sessionId", type: "string", description: "Stripe session ID" },
      ],
      returns: "Payment | null",
      explanation: "This internal function looks up a payment record using Stripe's session ID. It's used by webhook handlers to find and update the correct payment when Stripe sends notifications about payment status changes.",
    },
    {
      name: "create",
      type: "internalMutation",
      description: "Create a new payment record",
      parameters: [
        { name: "userId", type: "Id<'users'>", description: "User ID" },
        { name: "stripeSessionId", type: "string", description: "Stripe session ID" },
        { name: "priceId", type: "string", description: "Stripe price ID" },
        { name: "status", type: "string", description: "Payment status" },
        { name: "productName", type: "string", description: "Product name" },
        { name: "paymentMode", type: "string", description: "Payment mode" },
        { name: "createdAt", type: "number", description: "Creation timestamp" },
      ],
      returns: "Id<'payments'>",
      explanation: "This internal function creates the initial payment record when a checkout session starts. It stores all the essential details about the payment attempt, including what's being purchased and who's purchasing it. The status typically starts as 'pending' until the payment completes.",
    },
    {
      name: "recordStripePayment",
      type: "internalMutation",
      description: "Record a payment from Stripe webhook",
      parameters: [
        { name: "stripeSessionId", type: "string", description: "Stripe session ID" },
        { name: "userIdOrEmail", type: "string", description: "User ID or email" },
        { name: "priceId", type: "string", optional: true, description: "Stripe price ID" },
        { name: "productName", type: "string", description: "Product name" },
        { name: "paymentMode", type: "string", description: "Payment mode" },
        { name: "amount", type: "number", description: "Payment amount" },
        { name: "currency", type: "string", description: "Currency code" },
        { name: "customerId", type: "string", optional: true, description: "Stripe customer ID" },
        { name: "customerEmail", type: "string", optional: true, description: "Customer email" },
        { name: "subscriptionId", type: "string", optional: true, description: "Stripe subscription ID" },
        { name: "subscriptionStatus", type: "string", optional: true, description: "Subscription status" },
      ],
      returns: "Id<'payments'>",
      explanation: "This is called by Stripe webhooks when a payment completes. It intelligently finds the user (trying multiple lookup methods), prevents duplicate records, and saves all the payment details. This ensures the database accurately reflects what happened in Stripe.",
    },
    {
      name: "updatePaymentStatus",
      type: "internalMutation",
      description: "Update payment status after checkout completion",
      parameters: [
        { name: "sessionId", type: "string", description: "Stripe session ID" },
        { name: "status", type: "string", description: "New payment status" },
        { name: "customerId", type: "string", optional: true, description: "Stripe customer ID" },
        { name: "subscriptionId", type: "string", optional: true, description: "Stripe subscription ID" },
      ],
      returns: "Id<'payments'>",
      explanation: "This updates an existing payment record after a checkout is completed. It finds the payment by session ID and updates its status (like changing from 'pending' to 'complete'), and can also store additional information like the customer ID or subscription ID that Stripe provides.",
    },
  ];

  // Subscription Functions
  const subscriptionFunctions: FunctionDocumentation[] = [
    {
      name: "hasActiveSubscription",
      type: "query",
      description: "Check if current user has an active subscription",
      parameters: [],
      returns: "boolean",
      example: `const isActive = useQuery(api.shared.users.userSubscriptions.hasActiveSubscription);`,
      explanation: "This is a simple yes/no check: does the current user have an active paid subscription? It checks both that the subscription status is 'active' or 'trialing' AND that it hasn't expired. Use this to control access to premium features or prompt users to upgrade.",
    },
    {
      name: "getCurrentSubscription",
      type: "query",
      description: "Get current user's subscription details",
      parameters: [],
      returns: "Subscription | null",
      example: `const subscription = useQuery(api.shared.users.userSubscriptions.getCurrentSubscription);`,
      explanation: "This retrieves the full subscription record for the current user, including details like when it expires, what status it's in, and the Stripe subscription ID. Returns null if the user doesn't have a subscription. Useful for displaying detailed subscription information in account settings.",
    },
    {
      name: "createOrUpdate",
      type: "internalMutation",
      description: "Create or update a user subscription",
      parameters: [
        { name: "userId", type: "string", description: "Auth user ID" },
        { name: "subscriptionId", type: "string", description: "Stripe subscription ID" },
        { name: "status", type: "string", description: "Subscription status" },
        { name: "currentPeriodEnd", type: "number", optional: true, description: "Current period end timestamp" },
      ],
      returns: "Id<'userSubscriptions'>",
      explanation: "This internal function handles creating new subscriptions or updating existing ones. It includes smart user lookup logic to handle different ID formats from authentication systems. If a subscription already exists for the user, it updates it; otherwise it creates a new one.",
    },
    {
      name: "createOrUpdateFromStripe",
      type: "internalMutation",
      description: "Create or update a subscription from Stripe webhook data",
      parameters: [
        { name: "userIdOrEmail", type: "string", description: "User ID or email" },
        { name: "subscriptionId", type: "string", description: "Stripe subscription ID" },
        { name: "status", type: "string", description: "Subscription status" },
        { name: "currentPeriodEnd", type: "number", optional: true, description: "Current period end timestamp" },
        { name: "customerEmail", type: "string", optional: true, description: "Customer email" },
      ],
      returns: "Id<'userSubscriptions'>",
      explanation: "This is called by Stripe webhooks when subscription events occur (new subscription, renewal, cancellation, etc.). It has robust user lookup logic that tries multiple methods to find the right user, handles different authentication formats, and properly updates or creates subscription records to keep the database in sync with Stripe.",
    },
    {
      name: "cancelByStripeId",
      type: "internalMutation",
      description: "Cancel a subscription by Stripe subscription ID",
      parameters: [
        { name: "stripeSubscriptionId", type: "string", description: "Stripe subscription ID" },
        { name: "currentPeriodEnd", type: "number", optional: true, description: "Current period end timestamp" },
      ],
      returns: "Id<'userSubscriptions'>",
      explanation: "This marks a subscription as canceled when Stripe notifies us of a cancellation. It finds the subscription by Stripe's ID and updates its status to 'canceled'. Often, canceled subscriptions remain active until the current billing period ends, which is tracked by the currentPeriodEnd timestamp.",
    },
    {
      name: "updateSubscription",
      type: "internalMutation",
      description: "Update subscription from Stripe webhook",
      parameters: [
        { name: "userId", type: "string", description: "User ID" },
        { name: "subscriptionId", type: "string", description: "Stripe subscription ID" },
        { name: "status", type: "string", description: "Subscription status" },
        { name: "currentPeriodEnd", type: "number", description: "Current period end timestamp" },
        { name: "metadata", type: "object", description: "Subscription metadata" },
      ],
      returns: "Id<'userSubscriptions'>",
      explanation: "Another webhook handler that processes subscription updates from Stripe. It's similar to createOrUpdateFromStripe but takes the user ID directly. This handles events like subscription renewals, plan changes, or status updates, keeping our database synchronized with Stripe's records.",
    },
    {
      name: "getUserIdBySubscriptionId",
      type: "internalQuery",
      description: "Get a user ID by subscription ID",
      parameters: [
        { name: "subscriptionId", type: "string", description: "Stripe subscription ID" },
      ],
      returns: "Id<'users'> | undefined",
      explanation: "This looks up which user owns a particular Stripe subscription. It's useful in webhook handlers when Stripe sends us an event about a subscription, and we need to figure out which user in our database it belongs to.",
    },
  ];

  // Waitlist Functions
  const waitlistFunctions: FunctionDocumentation[] = [
    {
      name: "isOnWaitlist",
      type: "query",
      description: "Check if current user is on waitlist for a specific feature",
      parameters: [
        { name: "feature", type: "string", description: "Feature name" },
      ],
      returns: "boolean",
      example: `const onWaitlist = useQuery(api.website.public.waitlist.isOnWaitlist, { feature: "ai-coach" });`,
      explanation: "This checks whether the current user has already joined the waitlist for a specific feature. It's useful for showing different UI - if they're already on the waitlist, show 'You're on the list!' instead of a 'Join Waitlist' button.",
    },
    {
      name: "getWaitlistStats",
      type: "query",
      description: "Get waitlist stats for a specific feature",
      parameters: [
        { name: "feature", type: "string", description: "Feature name" },
      ],
      returns: "{ totalCount: number, recentSignups: number }",
      example: `const stats = useQuery(api.website.public.waitlist.getWaitlistStats, { feature: "ai-coach" });`,
      explanation: "This provides statistics about a feature's waitlist - how many total people have signed up, and how many joined in the last 7 days. Great for showing social proof ('Join 247 others waiting for this feature!') or tracking interest over time.",
    },
    {
      name: "getAllWaitlistEntries",
      type: "query",
      description: "Get all waitlist entries (admin only)",
      parameters: [],
      returns: "WaitlistEntry[]",
      example: `const entries = useQuery(api.website.public.waitlist.getAllWaitlistEntries);`,
      explanation: "This retrieves every waitlist entry across all features. It's protected - only users with admin role can access it. Use this in admin dashboards to see who's interested in what features and plan development priorities accordingly.",
    },
    {
      name: "joinWaitlist",
      type: "mutation",
      description: "Join the waitlist for a specific feature",
      parameters: [
        { name: "feature", type: "string", description: "Feature name" },
      ],
      returns: "{ success: boolean, message: string, waitlistId: Id<'waitlist'> }",
      example: `const result = await joinWaitlist({ feature: "ai-coach" });`,
      explanation: "This adds the current user to the waitlist for a specific upcoming feature. It saves their user info (name and email) and when they signed up. It prevents duplicate entries - if you're already on that waitlist, it throws an error instead of adding you again.",
    },
    {
      name: "leaveWaitlist",
      type: "mutation",
      description: "Remove user from waitlist",
      parameters: [
        { name: "feature", type: "string", description: "Feature name" },
      ],
      returns: "{ success: boolean, message: string }",
      example: `await leaveWaitlist({ feature: "ai-coach" });`,
      explanation: "This removes the current user from a feature's waitlist. Maybe they changed their mind or aren't interested anymore. If they're not actually on the waitlist, it throws an error. This gives users control over their waitlist signups.",
    },
  ];

  // Combine all functions for search
  const allFunctions = useMemo(
    () => [
      ...userFunctions,
      ...dailyLogsFunctions,
      ...forecastFunctions,
      ...templateFunctions,
      ...paymentFunctions,
      ...subscriptionFunctions,
      ...waitlistFunctions,
    ],
    []
  );

  // Filter functions based on search query
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) {
      return {
        users: userFunctions,
        dailyLogs: dailyLogsFunctions,
        forecast: forecastFunctions,
        templates: templateFunctions,
        payments: paymentFunctions,
        subscriptions: subscriptionFunctions,
        waitlist: waitlistFunctions,
      };
    }

    const query = searchQuery.toLowerCase();
    const filterFns = (fns: FunctionDocumentation[]) =>
      fns.filter(
        (fn) =>
          fn.name.toLowerCase().includes(query) ||
          fn.description.toLowerCase().includes(query) ||
          fn.type.toLowerCase().includes(query)
      );

    return {
      users: filterFns(userFunctions),
      dailyLogs: filterFns(dailyLogsFunctions),
      forecast: filterFns(forecastFunctions),
      templates: filterFns(templateFunctions),
      payments: filterFns(paymentFunctions),
      subscriptions: filterFns(subscriptionFunctions),
      waitlist: filterFns(waitlistFunctions),
    };
  }, [searchQuery, userFunctions, dailyLogsFunctions, forecastFunctions, templateFunctions, paymentFunctions, subscriptionFunctions, waitlistFunctions]);

  const tableOfContentsSections = [
    { id: "users", title: "User Management", count: filteredSections.users.length },
    { id: "dailylogs", title: "Daily Logs", count: filteredSections.dailyLogs.length },
    { id: "forecast", title: "Forecast & AI", count: filteredSections.forecast.length },
    { id: "templates", title: "Templates", count: filteredSections.templates.length },
    { id: "payments", title: "Payments", count: filteredSections.payments.length },
    { id: "subscriptions", title: "Subscriptions", count: filteredSections.subscriptions.length },
    { id: "waitlist", title: "Waitlist", count: filteredSections.waitlist.length },
  ];

  return (
    <div className="max-w-7xl ml-8">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold tracking-tight mb-4">API Documentation</h1>
        <p className="text-xl text-muted-foreground">
          Complete reference for all Convex functions in Soloist application
        </p>
      </div>

      {/* Search */}
      <SearchBar value={searchQuery} onChange={setSearchQuery} />

      {/* Main Content */}
      <div>
          {/* User Management */}
          {filteredSections.users.length > 0 && (
            <div id="users">
              <FunctionTable
                title="User Management"
                description="Functions for managing user accounts, profiles, and authentication"
                functions={filteredSections.users}
              />
            </div>
          )}

          {/* Daily Logs */}
          {filteredSections.dailyLogs.length > 0 && (
            <div id="dailylogs">
              <FunctionTable
                title="Daily Logs"
                description="Functions for creating, reading, and managing daily mood logs"
                functions={filteredSections.dailyLogs}
              />
            </div>
          )}

          {/* Forecast */}
          {filteredSections.forecast.length > 0 && (
            <div id="forecast">
              <FunctionTable
                title="Forecast & AI"
                description="AI-powered forecasting and mood prediction functions"
                functions={filteredSections.forecast}
              />
            </div>
          )}

          {/* Templates */}
          {filteredSections.templates.length > 0 && (
            <div id="templates">
              <FunctionTable
                title="Templates"
                description="Functions for managing custom log templates"
                functions={filteredSections.templates}
              />
            </div>
          )}

          {/* Payments */}
          {filteredSections.payments.length > 0 && (
            <div id="payments">
              <FunctionTable
                title="Payments"
                description="Stripe payment processing and payment record management"
                functions={filteredSections.payments}
              />
            </div>
          )}

          {/* Subscriptions */}
          {filteredSections.subscriptions.length > 0 && (
            <div id="subscriptions">
              <FunctionTable
                title="Subscriptions"
                description="User subscription management and status checking"
                functions={filteredSections.subscriptions}
              />
            </div>
          )}

          {/* Waitlist */}
          {filteredSections.waitlist.length > 0 && (
            <div id="waitlist">
              <FunctionTable
                title="Waitlist"
                description="Feature waitlist management functions"
                functions={filteredSections.waitlist}
              />
            </div>
          )}

          {/* No Results */}
          {Object.values(filteredSections).every((section) => section.length === 0) && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                No functions found matching &quot;{searchQuery}&quot;
              </p>
            </div>
          )}
        </div>
    </div>
  );
}
