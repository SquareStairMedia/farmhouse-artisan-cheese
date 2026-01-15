# Farmhouse Artisan Cheese - AI Coding Agent Instructions

## Architecture Overview

This is a **static website + Node.js backend** for a luxury artisan cheese shop in Oakville.

- **Frontend**: Vanilla HTML/CSS/JavaScript (no framework), deployed to Render as static site
- **Backend**: Express.js API (`server/index.js`), handles forms and email integration
- **Data Flow**: Frontend forms → Render backend API → Resend (email service) + Campaign Monitor (email list)

### Key Services
- **Resend**: Email delivery for contact/newsletter confirmations and owner notifications
- **Campaign Monitor**: Subscriber list management (API endpoint: `campaigns.createsend.com`)
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
- **Newsletter form** (`scripts.js` lines 65-136): Frontend sends POST to `https://farmhouse-backend.onrender.com/api/newsletter`
  - Subscribes user to Campaign Monitor list ID (env var)
  - Sends via Resend email service
  - Fires GTM event for tracking
- **Contact form** (contact.html): Similar POST to `/api/contact` endpoint
- Rate limiting: 55 requests/hour per IP (not 5 as configured—check for typo in server code)

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
- Newsletter modal (`scripts.js` lines 65-136): `.newsletter-modal` with `.active` class toggle
- Clicking outside or X button closes modal
- Form submission clears input and auto-closes after 2 seconds

### 5. Environment Variables (Backend)
Required in `server/` deployment:
- `RESEND_API_KEY`: Resend email API key
- `OWNER_EMAIL`, `BACKUP_EMAIL`: Notification recipients
- `CAMPAIGN_MONITOR_API_KEY`: Campaign Monitor auth
- `CAMPAIGN_MONITOR_LIST_ID`: Subscriber list ID
- `PORT`: Defaults to 3000

### 6. Security Headers (Render Deployment)
- `render.yaml` configures strict CSP: `nosniff`, `DENY` framing, `strict-origin-when-cross-origin` referrer
- Backend uses Helmet.js with restrictive Permissions-Policy (all features disabled by default)
- **Note in server code**: "If new browser features or third-party integrations are introduced, this section MUST be reviewed"

### 7. Email Templates
- Contact form email (server lines 83-110): HTML-based auto-reply to customer
- Newsletter welcome (server lines 151-171): Branded HTML with links to social media
- Owner notifications: Parallel emails sent to confirm receipt

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
4. **Form Validation**: Minimal on frontend; all validation happens in backend (`name`, `email`, `message` required)
5. **Backup Files**: `BACKUP*.html` files exist—never edit; they're version snapshots for rollback

## Common Tasks

**Add a new page**: Copy structure from `index.html` (head metadata, nav, footer) → update navigation links on all pages

**Update email templates**: Edit HTML strings in `server/index.js` (lines 83-110, 151-171)

**Fix responsive behavior**: Modify breakpoints in `styles.css` (currently 768px for mobile)

**Debug form issues**: Check `scripts.js` endpoint URL + backend rate limiting + environment variables
