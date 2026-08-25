# Form spam protection

All public forms on the site (contact, newsletter, gift box orders) are
protected by five layers. Four of them work immediately. The fifth,
Cloudflare Turnstile, needs two keys added before it does anything.

## Setup you still need to do

1. Go to the Cloudflare dashboard, open **Turnstile**, and add a widget for
   `farmhouseartisancheese.com`. Choose the **Managed** widget type.
2. Copy the **site key** into `form-security.js`, replacing
   `REPLACE_WITH_TURNSTILE_SITE_KEY` near the top of the file.
3. Copy the **secret key** into the Render backend service as an environment
   variable named `TURNSTILE_SECRET_KEY`, then redeploy the backend.

Until step 3 is done the backend logs a warning and skips the Turnstile check.
The other four layers still run.

## The layers

| Layer | Where | What it stops |
|---|---|---|
| Cloudflare Turnstile | Every form | Automated scripts and headless browsers. No puzzle for real visitors. |
| Honeypot field | Every form | Bots that fill in every field they find. |
| Timing check | Every form | Submissions posted faster than a person could type. |
| Content check | Contact form name and message | Keyword spam, link spam, and random-character filler. |
| Rate limits | Backend | Floods from one IP address or one email address. |

Spam is rejected silently. The bot gets a normal-looking success response, so it
never learns which layer caught it, and no email is sent.

## What changed in this pass

- Added Turnstile to every form, front end and back end.
- Added the honeypot and timing fields to the contact forms on `boards.html` and
  `faq.html`, which had no spam protection at all.
- Set `trust proxy` on the backend. Without it, Render's load balancer hid the
  real visitor IP and the per-IP rate limits were doing nothing.
- Added per-email flood control, so one mailbox cannot submit repeatedly from
  rotating IP addresses.
- Pointed the `newsletter.html` form at the live backend. It was posting to a
  relative path that does not exist on a static site.
- Spam attempts are logged with a hashed IP, never with message content.
