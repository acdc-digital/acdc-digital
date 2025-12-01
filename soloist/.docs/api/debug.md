# Debug Utilities API Reference

> Debug and diagnostic functions (internal only - not publicly exposed)

---

## Internal Functions

All debug utilities are internal and not publicly accessible:

### debugSubscription.ts

| Function | Type | Description |
|----------|------|-------------|
| `debugSubscription.checkSubscriptionDetails` | internalQuery | Check subscription details |

### debugUsers.ts

| Function | Type | Description |
|----------|------|-------------|
| `debugUsers.listAllUsers` | internalQuery | List all users for debugging |

### checkRateLimits.ts

| Function | Type | Description |
|----------|------|-------------|
| `checkRateLimits.listRateLimits` | internalQuery | List all rate limits |
| `checkRateLimits.clearAllRateLimits` | internalQuery | Get rate limits count |

### deleteRateLimits.ts

| Function | Type | Description |
|----------|------|-------------|
| `deleteRateLimits.deleteAllRateLimits` | internalMutation | Delete all rate limits |

### clearDatabase.ts

| Function | Type | Description |
|----------|------|-------------|
| `clearDatabase.clearAllTables` | internalMutation | Clear all database tables |
| `clearDatabase.clearDatabase` | internalAction | Action wrapper for clearAllTables |

### manualSubscription.ts

| Function | Type | Description |
|----------|------|-------------|
| `manualSubscription.manuallyCreateSubscription` | internalMutation | Manually create test subscription |
