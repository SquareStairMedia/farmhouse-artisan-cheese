# Farmhouse Artisan Cheese - AI Coding Agent Instructions

## Architecture Overview

This is a **static website + Node.js backend** for a luxury artisan cheese shop in Oakville.

- **Frontend**: Vanilla HTML/CSS/JavaScript (no framework), deployed to Render as static site
- **Backend**: Express.js API (`server/index.js`), handles forms and email integration
- **Data Flow**: Frontend forms → Render backend API → Resend (email service) + Campaign Monitor (email list)

### Key Services
- **Resend**: Email delivery for contact/newsletter/order confirmations, welcome emails and owner notifications
- **Campaign Monitor**: Subscriber list management (API endpoint: `api.createsend.com`)
- **Cloudflare Turnstile**: Bot check on the contact, newsletter and gift box forms. `scripts.js` adds the widget and attaches the token to each request; the backend verifies it and rejects the request if it fails
- **Google Analytics**: Tracking via GTM ID `G-T8DVQVJV9S` (included in all pages)

## File Structure

```
├── index.html, about.html, cheeses.html, ... (6 main pages)
├── styles.css (1,394 lines - comprehensive styling, 1-based)
├── scripts.js (136 lines - menu/modal interactions)
├── server/
│   ├── index.js (193 lines - Express API with rate limiting)
│   └── package.json (Express, Resend, Campaign Monitor, Helmet, CORS)
├── assets/images/ (logos, product photos, social sharing images)
└── assets/options/videos/ (hero video: cheese-hero.mp4)
```

## Critical Patterns & Conventions

### 1. Form Submission Flow
All forms POST JSON to `https://farmhouse-backend.onrender.com`. The backend checks the Turnstile token and a hidden honeypot field, validates input, then sends email through Resend.
- **Newsletter signup** (`/api/newsletter`): the popup form (on nearly every page) and the form on `newsletter.html`, handled in `scripts.js`. Subscribes to Campaign Monitor, emails the owner a consent record, sends the welcome email.
- **Contact form** (`/api/contact`): `contact.html`, plus the Contact Us modals in `faq.html` and `boards.html`. Emails the owner and sends the visitor a confirmation.
- **Gift box order** (`/api/gift-box-order`): the order modal in `gift-boxes.html`. Emails the owner an order summary and sends the visitor a confirmation.
- **Newsletter opt-in on the contact and gift box forms**: an optional, unticked checkbox sends `newsletterOptIn`. Only an explicit `true` subscribes the person (`handleNewsletterOptIn` in `server/index.js`). Never pre-tick it, never make it required, and never subscribe anyone who did not tick it. Consent is recorded in the owner email (date, form, page, wording shown). If Campaign Monitor fails, the message or order still succeeds and the owner email asks for a manual add.
- **Consent wording lives in two places that must match**: the page HTML (the 4 checkboxes and the popup consent line) and `NEWSLETTER_CONSENT_TEXT` in `server/index.js`. Change both together.
- Rate limiting: 5 requests per hour per IP, with a separate limit for each of the three endpoints.
- `window.gtag` is a no-op until analytics loads (top of `scripts.js`). Google Analytics only loads after cookie consent, so do not call `gtag` without that stub or visitors who decline cookies lose the modals.

### 2. Navigation & Menu Pattern
- **Responsive hamburger menu** (styles.css lines 55-82, scripts.js lines 1-45)
  - Mobile: `max-width: 768px` triggers hamburger
  - Dropdown menus close when clicking links on mobile
  - Applied to all pages with inherited header structure
- **Dropdown trigger**: Click-to-toggle on mobile, hover on desktop

### 3. Page Structure (Consistent Across All Pages)
```
<header> → nav with logo, hamburger, dropdown menu
<section> → hero or category content
<section> → about/features content
<footer> → newsletter CTA, social links, location info
```

### 4. Modal Implementation
- Newsletter modal (newsletter handler in `scripts.js`): `.newsletter-modal` with `.active` class toggle. The popup markup is repeated in every page, so a change to it means editing all pages
- Contact and gift box modals are defined inline in their own pages (`faq.html`, `boards.html`, `gift-boxes.html`)
- Clicking outside or X button closes modal
- Form submission clears input and auto-closes after 2 seconds

### 5. Environment Variables (Backend)
Required in `server/` deployment:
- `RESEND_API_KEY`: Resend email API key
- `CLOUDFLARE_TURNSTILE_SECRET_KEY`: Turnstile verification. If it is missing, every form is rejected
- `OWNER_EMAIL`, `BACKUP_EMAIL`: Notification recipients
- `CAMPAIGN_MONITOR_API_KEY`: Campaign Monitor auth
- `CAMPAIGN_MONITOR_LIST_ID`: Subscriber list ID
- `PORT`: Defaults to 3000
- `NODE_ENV`: Set to `production` to restrict CORS to the live domain only

### 6. Security Headers (Render Deployment)
- `render.yaml` configures strict CSP: `nosniff`, `DENY` framing, `strict-origin-when-cross-origin` referrer
- Backend uses Helmet.js with restrictive Permissions-Policy (all features disabled by default)
- **Note in server code**: "If new browser features or third-party integrations are introduced, this section MUST be reviewed"

### 7. Email Templates
All in `server/index.js`, all sent from `farmhouse-auto-reply@radarmagnet.com`.
- Contact confirmation, gift box order confirmation: sent to the visitor. They include a newsletter line only when the visitor opted in.
- Welcome email (`sendWelcomeEmail`): one shared template. Sent after a direct signup, and separately after a contact or order opt-in that was added to Campaign Monitor.
- Owner notifications: sent to `OWNER_EMAIL` and `BACKUP_EMAIL`, with the newsletter consent record where relevant.

### 8. Styling Conventions
- **Typography**: Helvetica Neue, light weight (300), generous letter-spacing
- **Colors**: Black (#000) header/footer, white (#fff) body, gray (#999, #666) accents
- **Layout**: Max-width 1600px, padding 5% on nav, centered content
- **Images**: Lazy loading with `loading="lazy"` attribute
- **Hero Section**: Full-width video (`cheese-hero.mp4`) with autoplay, muted, loop

## Before Making Changes

1. **Environment-specific URLs**: Newsletter endpoint is hardcoded to `https://farmhouse-backend.onrender.com`. Update if backend URL changes.
2. **GTM Tracking**: Ensure Google Analytics ID `G-T8DVQVJV9S` is present in `<head>` of all pages (check for duplicates)
3. **Email Sender Address**: All emails from `farmhouse-auto-reply@radarmagnet.com` (Resend verified domain)
4. **Form Validation**: Minimal on frontend; all validation happens in backend (contact: `name`, `email`, `message`; newsletter: `name`, `email`; gift box: `name`, `email`, `phone` and at least one box)
5. **Backup Files**: old `BACKUP*.html` / `SANDBOX.html` snapshots were removed (Oct 2026); use git history for rollback

## Common Tasks

**Add a new page**: Copy structure from `index.html` (head metadata, nav, footer) → update navigation links on all pages

**Update email templates**: Edit the HTML strings in `server/index.js` (the `/api/contact`, `/api/gift-box-order` handlers and `sendWelcomeEmail`)

**Fix responsive behavior**: Modify breakpoints in `styles.css` (currently 768px for mobile)

**Debug form issues**: Check `scripts.js` endpoint URL + Turnstile (token attached, secret set) + backend rate limiting + environment variables
