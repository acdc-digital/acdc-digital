# Internal Functions Reference

> Overview of all internal Convex functions (not publicly accessible)

---

## admin.ts

| Function | Type | Description |
|----------|------|-------------|
| `admin.promoteToAdmin` | internalMutation | Promote a user to admin role |
| `admin.setDefaultRole` | internalMutation | Set default role for new users |
| `admin.promoteFirstUserToAdmin` | internalMutation | Promote first user to admin |
| `admin.migrateExistingUsers` | internalMutation | Migrate existing users |

## baseline.ts

| Function | Type | Description |
|----------|------|-------------|
| `baseline.getLatestBaseline` | internalQuery | Get latest baseline for user |

## baselineChat.ts

| Function | Type | Description |
|----------|------|-------------|
| `baselineChat.getBaselineAnswers` | internalQuery | Get baseline answers |
| `baselineChat.trackAnthropicUsage` | internalMutation | Track AI API usage |

## checkRateLimits.ts

| Function | Type | Description |
|----------|------|-------------|
| `checkRateLimits.listRateLimits` | internalQuery | List all rate limits |
| `checkRateLimits.clearAllRateLimits` | internalQuery | Get rate limits count |

## clearDatabase.ts

| Function | Type | Description |
|----------|------|-------------|
| `clearDatabase.clearAllTables` | internalMutation | Clear all database tables |
| `clearDatabase.clearDatabase` | internalAction | Action wrapper for clearAllTables |

## debugSubscription.ts

| Function | Type | Description |
|----------|------|-------------|
| `debugSubscription.checkSubscriptionDetails` | internalQuery | Check subscription details |

## debugUsers.ts

| Function | Type | Description |
|----------|------|-------------|
| `debugUsers.listAllUsers` | internalQuery | List all users for debugging |

## deleteRateLimits.ts

| Function | Type | Description |
|----------|------|-------------|
| `deleteRateLimits.deleteAllRateLimits` | internalMutation | Delete all rate limits |

## forecast.ts

| Function | Type | Description |
|----------|------|-------------|
| `forecast.deleteExistingForecast` | internalMutation | Delete existing forecast |
| `forecast.insertForecast` | internalMutation | Insert new forecast |

## manualSubscription.ts

| Function | Type | Description |
|----------|------|-------------|
| `manualSubscription.manuallyCreateSubscription` | internalMutation | Manually create test subscription |

## payments.ts

| Function | Type | Description |
|----------|------|-------------|
| `payments.getBySessionId` | internalQuery | Get payment by session ID |
| `payments.create` | internalMutation | Create payment record |
| `payments.recordStripePayment` | internalMutation | Record Stripe payment |
| `payments.updatePaymentStatus` | internalMutation | Update payment status |

## stripe.ts

| Function | Type | Description |
|----------|------|-------------|
| `stripe.handleWebhookEvent` | internalAction | Handle Stripe webhook events |

## users.ts

| Function | Type | Description |
|----------|------|-------------|
| `users.getUserByEmail` | internalQuery | Get user by email |
| `users.updateProfile` | internalMutation | Update user profile |
| `users.deleteAccount` | internalMutation | Delete user account |
| `users.createUserFromAuth` | internalMutation | Create user from auth |
| `users.getUserByAuthId` | internalQuery | Get user by auth ID |
| `users.updateUserAuthIdForWebhook` | internalMutation | Update user auth ID for webhook |
| `users.clearAuthenticationData` | internalMutation | Clear authentication data |
| `users.debugAuthenticationData` | internalQuery | Debug authentication data |
| `users.completeUserDeletion` | internalMutation | Complete user deletion |
| `users.findAllUserData` | internalQuery | Find all user data |
| `users.findDuplicateUsers` | internalQuery | Find duplicate users |
| `users.cleanupDuplicateUser` | internalMutation | Cleanup duplicate user |
| `users.ensureUserFromAuth` | internalMutation | Ensure user from auth |
| `users.fixUserAuthId` | internalMutation | Fix user auth ID |
| `users.updateUserAuthId` | internalMutation | Update user auth ID |
| `users.debugSubscriptionData` | internalQuery | Debug subscription data |
| `users.setUserAuthId` | internalMutation | Set user auth ID |

## userSubscriptions.ts

| Function | Type | Description |
|----------|------|-------------|
| `userSubscriptions.createOrUpdate` | internalMutation | Create or update subscription |
| `userSubscriptions.createOrUpdateFromStripe` | internalMutation | Create/update from Stripe |
| `userSubscriptions.cancelByStripeId` | internalMutation | Cancel by Stripe ID |
| `userSubscriptions.updateSubscription` | internalMutation | Update subscription |
| `userSubscriptions.getUserIdBySubscriptionId` | internalQuery | Get user ID by subscription ID |
