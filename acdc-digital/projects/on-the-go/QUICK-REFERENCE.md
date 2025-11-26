# 📱 on-the-go Quick Reference

## 🔗 Important URLs

| Resource | URL |
|----------|-----|
| **Dashboard** | http://localhost:6060 |
| **Convex Dashboard** | https://dashboard.convex.dev/t/acdc-digital/on-the-go |
| **Convex Deployment** | https://unique-dog-520.convex.cloud |
| **Twilio Console** | https://console.twilio.com |
| **Phone Number Config** | https://console.twilio.com/us1/develop/phone-numbers/manage/incoming |

## 📞 Phone Number

**Your SMS Number**: `+12294587352`

## 🔧 Development

```bash
# Start everything
cd on-the-go

# Terminal 1 - Convex backend
npm run convex

# Terminal 2 - Next.js frontend  
npm run dev

# Visit: http://localhost:6060
```

## 📨 Send SMS (from code)

```typescript
// Anywhere in Convex functions
await ctx.runAction(internal.notes.sendSms, {
  to: "+1234567890",
  body: "Your message here"
});
```

## 🧪 Test Functions

Use from Convex Dashboard:

1. **testSendMessage** - Send SMS to any number
   ```json
   {
     "to": "+1234567890",
     "message": "Hello!"
   }
   ```

2. **sendTestToSelf** - Quick self-test (update phone first)
   ```json
   {}
   ```

## 🔍 Debugging

```bash
# View Convex logs
npx convex logs

# Check environment
npx convex env list

# Health check
curl https://unique-dog-520.convex.cloud/health
```

## 📋 Webhook URL

**Set this in Twilio Console**:
```
https://unique-dog-520.convex.cloud/twilio/sms
```

## 🗂️ Key Files

| File | Purpose |
|------|---------|
| `convex/twilio.ts` | Twilio client config |
| `convex/notes.ts` | Notes CRUD + sendSms |
| `convex/http.ts` | Webhook endpoint |
| `convex/testSms.ts` | Test functions |

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| SMS not received | Configure webhook in Twilio Console |
| Can't send SMS | Check `npx convex env list` for credentials |
| Dashboard not updating | Verify `NEXT_PUBLIC_CONVEX_URL` in `.env.local` |
| TypeScript errors | Run `npx convex dev` to regenerate types |

## 📚 Documentation

- [Setup Checklist](.docs/TWILIO-CHECKLIST.md)
- [Complete Guide](.docs/TWILIO-SETUP.md)  
- [Integration Status](.docs/INTEGRATION-COMPLETE.md)
- [Main README](README.md)

## 🎯 Next Steps

1. [ ] Configure webhook in Twilio Console (5 min)
2. [ ] Test receiving: Send SMS to +12294587352
3. [ ] Test sending: Run `testSendMessage` from dashboard
4. [ ] Explore the UI at http://localhost:6060

---

**Built with**: Next.js 15 • Convex • Twilio • TypeScript • Tailwind CSS
