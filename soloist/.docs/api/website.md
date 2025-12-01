# Website API Reference

> API endpoints and Convex functions used by the Soloist website

---

## HTTP API Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/create-checkout-session` | POST | Create Stripe checkout session |
| `/api/check-subscription-status` | GET | Check Stripe subscription by session ID |
| `/api/get-checkout-session` | GET | Retrieve Stripe checkout session details |
| `/api/export-data` | POST | Export user data as JSON download |

---

## Convex Functions

### Queries

| Function | Description |
|----------|-------------|
| `users.viewer` | Get current logged-in user |
| `users.currentUser` | Get current user data |
| `users.getUserSubscriptionStatus` | Get user subscription status |
| `userSubscriptions.hasActiveSubscription` | Check for active subscription |
| `userSubscriptions.getCurrentSubscription` | Get current subscription details |
| `dailyLogs.listDailyLogs` | List daily logs by user and year |
| `dailyLogs.getDailyLog` | Get specific daily log by date |
| `dailyLogTemplates.getActiveDailyLogTemplate` | Get active template |
| `baseline.getBaseline` | Get user's baseline data |
| `baseline.getLatestBaselineAnswers` | Get latest baseline answers |
| `feedback.getUserFeedback` | Get user's feedback |
| `newsletter.getAllEmails` | Get all newsletter emails |

### Mutations

| Function | Description |
|----------|-------------|
| `dailyLogs.dailyLog` | Create/update a daily log |
| `baseline.saveBaselineAnswers` | Save baseline survey answers |
| `feedback.submitFeedback` | Submit general feedback |
| `newsletter.addEmail` | Add email to newsletter |

### Server-side (API Routes)

| Function | Used In |
|----------|---------|
| `users.exportUserData` | `/api/export-data` |
| `userSubscriptions.hasActiveSubscription` | `/api/check-subscription-status` |

---

## Learn More

> Learn more email submission form

### Queries

| Function | Description |
|----------|-------------|
| `learnMore.getAllEmails` | Get all submitted emails |

### Mutations

| Function | Description |
|----------|-------------|
| `learnMore.submitEmail` | Submit email for learn more |

---

## Payments

> Stripe payments and checkout

### Queries

| Function | Description |
|----------|-------------|
| `payments.getUserPayments` | Get user's payment history |
| `payments.getPaymentById` | Get payment by ID |

### Actions

| Function | Description |
|----------|-------------|
| `payments.createCheckoutSession` | Create Stripe checkout session |

---

## Waitlist

> Feature waitlist management

### Queries

| Function | Description |
|----------|-------------|
| `waitlist.isOnWaitlist` | Check if user is on waitlist |
| `waitlist.getWaitlistStats` | Get waitlist statistics |
| `waitlist.getAllWaitlistEntries` | Get all waitlist entries |

### Mutations

| Function | Description |
|----------|-------------|
| `waitlist.joinWaitlist` | Join a feature waitlist |
| `waitlist.leaveWaitlist` | Leave a waitlist |
