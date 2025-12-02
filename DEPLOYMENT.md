# Deployment Guide - Farmhouse Artisan Cheese

## Overview

The site consists of two separate Render services:
1. **Static Site** (frontend) - Free tier
2. **Web Service** (backend API) - $7/month

## Render Services

### 1. Static Site (Frontend)

**Service Name:** farmhouse-artisan-cheese  
**URL:** https://farmhouse-artisan-cheese.onrender.com  
**Type:** Static Site  
**Cost:** Free

**Configuration:**
- Repository: SquareStairMedia/farmhouse-artisan-cheese
- Branch: main
- Root Directory: / (project root)
- Build Command: (none needed)
- Publish Directory: / (serves HTML files directly)

**Auto-Deploy:** Enabled (deploys on every push to main branch)

### 2. Backend API

**Service Name:** farmhouse-backend  
**URL:** https://farmhouse-backend.onrender.com  
**Type:** Web Service  
**Cost:** $7/month (after free trial)

**Configuration:**
- Repository: SquareStairMedia/farmhouse-artisan-cheese
- Branch: main
- Root Directory: `server`
- Environment: Node
- Build Command: `npm install`
- Start Command: `node index.js`

**Environment Variables:**
```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxx
OWNER_EMAIL=info@farmhouseartisancheese.com
PORT=3000
```

**Auto-Deploy:** Enabled (deploys when `server/` folder changes)

## Deployment Process

### Standard Updates (HTML/CSS/JS changes)

1. Make changes in VS Code
2. Commit changes:
```bash
   git add .
   git commit -m "Your commit message"
   git push
```
3. Render automatically deploys static site (~1-2 minutes)

### Backend Updates (server code changes)

1. Make changes in `server/index.js` or related files
2. Commit and push (same as above)
3. Render automatically deploys backend service (~2-3 minutes)

**Note:** One git push updates both services if both have changes.

## Environment Variables Management

### Viewing Current Variables
1. Go to Render Dashboard
2. Select `farmhouse-backend` service
3. Click "Environment" in left sidebar

### Updating Variables
1. Click "Add Environment Variable" or edit existing
2. Save changes
3. Service automatically redeploys

### Critical Variables

**RESEND_API_KEY**
- Location: Resend Dashboard → API Keys
- Never commit to git (in .gitignore)
- Required for email functionality

**OWNER_EMAIL**
- Current: info@farmhouseartisancheese.com
- Receives all contact form notifications

## Email Domain Setup

### Current Configuration (Temporary)

**Sender Domain:** radarmagnet.com  
**From Address:** Configured in `server/index.js`  
**Status:** Working but not ideal for production

### Production Configuration (When DNS Available)

**Goal:** Send from info@farmhouseartisancheese.com

#### Step 1: Add Domain to Resend

1. Log into Resend Dashboard
2. Go to "Domains"
3. Click "Add Domain"
4. Enter: farmhouseartisancheese.com
5. Resend provides DNS records to add

#### Step 2: Add DNS Records

Add these records to your domain DNS (at registrar or Cloudflare):

**Record 1 - SPF:**
- Type: TXT
- Name: @ (or root)
- Value: (provided by Resend)

**Record 2 - DKIM:**
- Type: TXT
- Name: resend._domainkey
- Value: (provided by Resend)

**Record 3 - MX (optional):**
- Type: MX
- Name: @
- Value: (provided by Resend)
- Priority: 10

Wait 24-48 hours for DNS propagation.

#### Step 3: Update Backend Code

In `server/index.js`, change both `from:` addresses:

**Find:**
```javascript
from: 'contact@radarmagnet.com',
```

**Replace with:**
```javascript
from: 'Farmhouse Artisan Cheese <info@farmhouseartisancheese.com>',
```

Do this in TWO places:
1. Owner notification email (~line 29)
2. Customer auto-reply email (~line 40)

#### Step 4: Deploy
```bash
git add server/index.js
git commit -m "Update to farmhouse email domain"
git push
```

Backend automatically redeploys with new email address.

#### Step 5: Verify in Resend

1. Go to Resend Dashboard → Domains
2. farmhouseartisancheese.com should show "Verified" status
3. Send test email to confirm

## Troubleshooting

### Contact Form Not Working

**Check 1: Backend URL**
- In contact.html, boards.html, gift-boxes.html
- Should be: `https://farmhouse-backend.onrender.com/api/contact`
- NOT: `http://localhost:3000/api/contact`

**Check 2: Resend Logs**
- Go to Resend Dashboard → Logs
- Look for 403 errors (domain not verified)
- Look for 200 status (success)

**Check 3: Browser Console**
- Press F12 in browser
- Look for fetch errors
- Check network tab for failed requests

### Backend Service Sleeping

Render free tier services "sleep" after 15 minutes of inactivity.

**Symptoms:**
- First form submission takes 30-60 seconds
- Subsequent submissions are fast

**Solutions:**
- Upgrade to paid tier ($7/month) - prevents sleeping
- Accept the delay on first submission
- Use a service like UptimeRobot to ping backend every 10 minutes (keeps it awake)

### Email Not Sending

**Check 1: Environment Variables**
- Verify RESEND_API_KEY is set in Render
- Check for typos

**Check 2: Domain Verification**
- Current: radarmagnet.com must be verified
- Production: farmhouseartisancheese.com must be verified

**Check 3: Resend Account Status**
- Free tier: 3,000 emails/month
- Check you haven't hit limit

## Monitoring

### Render Logs

**View Backend Logs:**
1. Render Dashboard → farmhouse-backend
2. Click "Logs" tab
3. See real-time server activity

**What to Monitor:**
- Server startup: "Server running on port 3000"
- Errors: Any red text or stack traces
- API calls: Watch for contact form submissions

### Resend Logs

**View Email Activity:**
1. Resend Dashboard → Logs
2. Filter by date, status, or endpoint
3. Click on individual emails for details

**Status Codes:**
- 200: Success
- 403: Domain not verified
- 500: Server error

## Costs Summary

**Current Monthly Costs:**
- Static Site: $0 (free)
- Backend Service: $7/month
- Resend Email: $0 (free tier, 3,000 emails/month)

**Total: $7/month**

**If Upgrading Resend:**
- Resend Pro: $20/month (10 domains, 50,000 emails/month)

**Total with Resend Pro: $27/month**

## Emergency Contacts

**SquareStair Media:**  
Stephen McDermott  
mcdermott.stephen.c@gmail.com

**Render Support:**  
https://render.com/support

**Resend Support:**  
https://resend.com/support

## Backup & Recovery

### Backup Code
Repository is on GitHub - all code is backed up automatically.

### Backup Environment Variables
Keep a secure copy of:
- RESEND_API_KEY
- Any other sensitive values

Store in password manager or secure document (NOT in git).

### Recovery Steps
1. Clone repository from GitHub
2. Create new Render services (follow setup above)
3. Add environment variables
4. Deploy

## Future Enhancements

### Newsletter Signup
- Add `/api/newsletter` endpoint to backend
- Create newsletter signup form component
- Store emails in database or CSV
- Send welcome email via Resend

### Admin Dashboard
- Password-protected admin panel
- Blog post creation/editing
- Customer list management
- Email campaign builder

### Custom Domain
- Point farmhouseartisancheese.com to Render
- Add custom domain in Render settings
- Update DNS records at registrar
- Enable HTTPS (automatic with Render)