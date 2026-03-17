# Pre-Deployment Checklist: Security & SEO

Use this checklist to ensure your Beatmaker app is ready for production.

---

## 🔒 Security & User Data

### API Keys & Secrets

| Item | Status | Notes |
|------|--------|-------|
| Supabase anon key exposure | ✅ Expected | The anon key is **designed** for client-side use. Supabase relies on Row Level Security (RLS) to protect data—never use the service role key in frontend code. |
| Environment variables | ⚠️ Consider | For Vercel/Netlify/etc., move `SUPABASE_URL` and `SUPABASE_ANON_KEY` to build-time env vars so they’re not hardcoded in repo. |
| .gitignore for secrets | ✅ Good | `.env` is gitignored. Ensure `supabase-config.js` is not committed with real keys if you switch to env-based config. |

### User Data & Privacy

| Item | Action |
|------|--------|
| **Privacy Policy** | Add a link to a Privacy Policy describing what you collect (email, beat data), how it’s used, Supabase as data processor, and retention. |
| **Terms of Service** | Optional but recommended for apps with user accounts. |
| **Password handling** | ✅ Handled by Supabase—never touches your server. |
| **Sensitive data in beats** | Beat data (sound, timing) is not personally identifiable; RLS keeps it scoped to the owner. |

### Backend Security (Supabase)

| Item | Status |
|------|--------|
| RLS enabled on `beats` | ✅ Via SUPABASE_SETUP.md |
| Auth via Supabase | ✅ Email/password managed by Supabase Auth |
| `user_id` always from server | ✅ RLS uses `auth.uid()`; frontend-sent `user_id` is checked against it |

### Hosting & Headers

| Item | Action |
|------|--------|
| **HTTPS** | Use a host that serves over HTTPS (Vercel, Netlify, etc.). |
| **Security headers** | Configure headers via host or `_headers` / `netlify.toml` / `vercel.json`: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`. |
| **CSP (Content-Security-Policy)** | Optional but useful—allow your domain, Supabase, and CDNs (e.g. jsdelivr, fonts.googleapis.com). |

**Example `_headers` (Netlify)** or equivalent:
```
/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
```

---

## 🔍 SEO (Basic)

### Meta Tags & Page Identity

| Item | Status |
|------|--------|
| `<title>` | ✅ Set to "Beatmaker – Create & Save Drum Beats Online" |
| Meta description | ✅ Present |
| Open Graph (og:title, og:description, og:type) | ✅ Present |
| **og:image** | Add when you have a domain—e.g. `https://yourdomain.com/og-image.png` (1200×630px) for link previews |
| **Canonical URL** | Add `<link rel="canonical" href="https://yourdomain.com/">` once deployed |

### Checklist Items

| Item | Action |
|------|--------|
| **Meta description** | 150–160 chars describing the app (e.g. “Create, record, and save drum beats in your browser. Free online beatmaker with kick, snare, toms, and hi-hats.”). |
| **og:title, og:description, og:image** | Improve link previews on Facebook, LinkedIn, etc. |
| **Twitter Card** | `twitter:card`, `twitter:title`, `twitter:description` for Twitter. |
| **Canonical URL** | Add `<link rel="canonical" href="https://yourdomain.com/">` to avoid duplicate content. |
| **robots** | `<meta name="robots" content="index, follow">` if you want indexing (default). |
| **Semantic HTML** | ✅ Already using `<main>`, `<header>`, `<section>`. |
| **lang** | ✅ Already set `lang="en"` on `<html>`. |
| **Accessibility** | ✅ Buttons have `aria-label`. |

### Sitemap & Performance

| Item | When Needed |
|------|-------------|
| **Sitemap** | For multi-page sites; optional for a single-page app. |
| **Structured data (JSON-LD)** | Optional; useful for rich search results (e.g. software app schema). |

---

## Quick Wins

1. Update `<title>` and add a meta description in `index.html`.
2. Add a Privacy Policy (even a simple page or link to a hosted policy).
3. Use environment variables for Supabase config in production builds.
4. Set security headers via your hosting provider.

---

## Optional: Deployment-Specific Config

If you deploy to **Vercel**, **Netlify**, or similar:

- Add `SUPABASE_URL` and `SUPABASE_ANON_KEY` as environment variables.
- Build a small script or config that injects them at build time instead of hardcoding in `supabase-config.js`.
- Keep `supabase-config.js` as a fallback for local development.
