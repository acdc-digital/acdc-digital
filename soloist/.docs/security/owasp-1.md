# OWASP ZAP Security Scan - Remediation Report

**Date:** November 30, 2025  
**Target:** https://soloist.acdc.digital  
**Tool:** OWASP ZAP (Zed Attack Proxy)  
**Status:** ✅ Remediated

---

## Executive Summary

A security scan using OWASP ZAP identified 11 potential vulnerabilities on the Soloist production website. After analysis, **6 required fixes**, **1 was a false positive**, and **4 were informational notices**. All actionable items have been remediated through configuration changes in `next.config.ts`.

---

## Vulnerability Summary

| # | Vulnerability | Severity | Status |
|---|---------------|----------|--------|
| 1 | CSP Header Not Set | Medium | ✅ **Fixed** |
| 2 | Cross-Domain Misconfiguration (CORS) | Medium | ✅ **Fixed** |
| 3 | Missing Anti-clickjacking Header | Medium | ✅ **Fixed** (with #1) |
| 4 | Mixed Content | Low | ✅ **Fixed** |
| 5 | X-Powered-By Header Leak | Low | ✅ **Fixed** |
| 6 | X-Content-Type-Options Missing | Low | ✅ **Fixed** (with #1) |
| 7 | Suspicious Comments | Informational | ⚪ **False Positive** |
| 8 | Modern Web Application | Informational | ⚪ **Informational** |
| 9 | Cache-control Directives | Low | ✅ **Fixed** |
| 10 | Retrieved from Cache | Informational | ⚪ **Informational** |
| 11 | User Agent Fuzzer | Informational | ⚪ **Informational** |

---

## Detailed Remediation

### 1. Content Security Policy (CSP) Header Not Set

**Issue:** No CSP header was present, leaving the site vulnerable to XSS and data injection attacks.

**Solution:** Added a comprehensive CSP header with the following directives:

```
default-src 'self';
script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.convex.cloud https://*.clerk.accounts.dev https://challenges.cloudflare.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com data:;
img-src 'self' data: blob: https:;
connect-src 'self' https://*.convex.cloud wss://*.convex.cloud https://*.clerk.accounts.dev https://api.stripe.com;
frame-src 'self' https://*.clerk.accounts.dev https://challenges.cloudflare.com https://js.stripe.com;
object-src 'none';
base-uri 'self';
form-action 'self';
frame-ancestors 'self';
block-all-mixed-content;
upgrade-insecure-requests
```

**Whitelisted Services:**
- Convex (backend/realtime)
- Clerk (authentication)
- Stripe (payments)
- Cloudflare (challenges/turnstile)
- Google Fonts

---

### 2. Cross-Domain Misconfiguration (CORS)

**Issue:** Static assets (fonts, JS, CSS) had permissive CORS settings allowing any origin to load them.

**Solution:** Added restrictive CORS headers for static assets:

```typescript
{
  source: "/_next/static/:path*",
  headers: [
    { key: "Access-Control-Allow-Origin", value: "https://soloist.acdc.digital" },
    { key: "Access-Control-Allow-Methods", value: "GET" },
    { key: "Access-Control-Allow-Headers", value: "Content-Type" },
  ],
}
```

---

### 3. Missing Anti-clickjacking Header

**Issue:** No protection against clickjacking attacks where the site could be embedded in malicious iframes.

**Solution:** Added two layers of protection:

1. **X-Frame-Options Header:**
   ```
   X-Frame-Options: SAMEORIGIN
   ```

2. **CSP frame-ancestors Directive:**
   ```
   frame-ancestors 'self'
   ```

---

### 4. Secure Pages Include Mixed Content

**Issue:** The CSP allowed loading images over HTTP (`http:`), creating mixed content vulnerabilities.

**Solution:** 
- Removed `http:` from `img-src` directive
- Added `block-all-mixed-content` directive to explicitly block any HTTP content on HTTPS pages

---

### 5. X-Powered-By Header Leak

**Issue:** The `X-Powered-By: Next.js` header exposed server technology, helping attackers target known vulnerabilities.

**Solution:** Disabled the header in Next.js config:

```typescript
const nextConfig: NextConfig = {
  poweredByHeader: false,
  // ...
};
```

---

### 6. X-Content-Type-Options Header Missing

**Issue:** Missing header allowed browsers to MIME-sniff responses, potentially executing malicious content.

**Solution:** Added the header to prevent MIME-sniffing:

```
X-Content-Type-Options: nosniff
```

---

### 7. Information Disclosure - Suspicious Comments ⚪

**Classification:** False Positive

**Explanation:** ZAP detected the word "FROM" in minified JavaScript, but it was part of a Next.js documentation URL (`nextjs.org/docs/messages/invalid-images-config`), not a SQL query or sensitive comment. This is framework code, not application code.

---

### 8. Modern Web Application ⚪

**Classification:** Informational

**Explanation:** ZAP detected that the site is a Single Page Application (SPA) and recommended using the Ajax Spider for better scan coverage. This is not a vulnerability.

---

### 9. Cache-control Directives

**Issue:** Missing or improper cache-control headers could lead to sensitive content being cached.

**Solution:** Implemented tiered caching strategy:

| Resource Type | Cache-Control Value |
|---------------|---------------------|
| `sitemap.xml`, `robots.txt` | `public, max-age=86400, must-revalidate` (24 hours) |
| `/_next/static/*` | `public, max-age=31536000, immutable` (1 year) |
| HTML pages (dynamic) | `no-cache, no-store, must-revalidate` |

---

### 10. Retrieved from Cache ⚪

**Classification:** Informational (Correct Behavior)

**Explanation:** ZAP noted that font files were being cached. This is correct and optimal behavior - static assets like fonts contain no sensitive data and should be cached for performance.

---

### 11. User Agent Fuzzer ⚪

**Classification:** Informational

**Explanation:** ZAP tested the site with various User-Agent strings (mobile, crawlers, etc.). Consistent responses indicate no cloaking or deceptive behavior. This is not a vulnerability.

---

## Complete Security Headers

The following headers are now applied to all routes:

| Header | Value | Purpose |
|--------|-------|---------|
| `Content-Security-Policy` | (see above) | Prevents XSS and injection attacks |
| `X-Content-Type-Options` | `nosniff` | Prevents MIME-sniffing |
| `X-Frame-Options` | `SAMEORIGIN` | Prevents clickjacking |
| `X-XSS-Protection` | `1; mode=block` | Legacy XSS filter |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | Controls referrer leakage |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` | Restricts browser APIs |

---

## Files Modified

- `soloist/website/next.config.ts` - Added security headers, CORS restrictions, cache controls, and disabled X-Powered-By

---

## Verification

To verify the fixes:

1. **Check headers manually:**
   ```bash
   curl -I https://soloist.acdc.digital/
   ```

2. **Re-run OWASP ZAP scan** against the production URL

3. **Test in browser DevTools:**
   - Network tab → Click document request → Response Headers

---

## References

- [OWASP Content Security Policy Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Content_Security_Policy_Cheat_Sheet.html)
- [MDN Content-Security-Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
- [OWASP ZAP Documentation](https://www.zaproxy.org/docs/)
