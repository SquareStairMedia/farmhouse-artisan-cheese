// /server/index.js
const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
// Security headers configured for current site capabilities.
// Permissions-Policy is intentionally restrictive.
// If new browser features or third-party integrations are introduced,
// this section MUST be reviewed and updated.
app.use(
  helmet({
    permissionsPolicy: {
      features: {
        camera: [],
        microphone: [],
        geolocation: [],
        payment: [],
        usb: [],
        bluetooth: [],
        accelerometer: [],
        gyroscope: [],
        magnetometer: [],
        fullscreen: [],
        autoplay: []
      }
    }
  })
);
const PORT = process.env.PORT || 3000;

// Render (and any host behind a load balancer) forwards the real client IP in
// X-Forwarded-For. Without this, express-rate-limit sees the proxy's IP for
// every request and the per-IP limits do nothing.
app.set('trust proxy', 1);

// --- Spam prevention helpers -------------------------------------------------

const crypto = require('crypto');

// Log spam attempts without storing message bodies or full email addresses.
function logSpamAttempt(reason, req) {
  const ipHash = crypto
    .createHash('sha256')
    .update(String(req.ip || ''))
    .digest('hex')
    .substring(0, 16);

  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      reason,
      route: req.path,
      ipHash,
      userAgent: (req.get('user-agent') || '').substring(0, 100)
    })
  );
}

// Cloudflare Turnstile verification.
// Returns true when the token is valid, false when it is missing or rejected.
async function verifyTurnstile(token, req) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  // If the secret is not configured the server cannot verify anything.
  // Log loudly and allow the request through so a missing env var never
  // silently breaks the live forms.
  if (!secret) {
    console.warn('TURNSTILE_SECRET_KEY is not set - Turnstile verification skipped');
    return true;
  }

  if (!token) return false;

  try {
    const response = await fetch(
      'https://challenges.cloudflare.com/turnstile/v0/siteverify',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          secret,
          response: token,
          remoteip: req.ip
        })
      }
    );
    const data = await response.json();
    return data.success === true;
  } catch (error) {
    console.error('Turnstile verification error:', error);
    return false;
  }
}

// Bots post the instant the page loads. Humans do not.
function submittedTooFast(formLoadedAt, minSeconds) {
  const loadedAt = parseInt(formLoadedAt, 10);
  if (isNaN(loadedAt)) return false; // missing timestamp is not proof of a bot
  const elapsed = (Date.now() - loadedAt) / 1000;
  return elapsed < minSeconds;
}

// Content heuristics. Catches the two common patterns: keyword/link spam and
// the random-character filler used by form-flooding bots.
const SPAM_PATTERNS = [
  /\b(viagra|cialis|casino|crypto wallet|seo services|backlinks|loan offer)\b/i,
  /(https?:\/\/[^\s]+.*){2,}/i,
  /\[url=|\[link=|<a\s+href/i,
  /(click here|buy now|limited time offer|make money fast)/i
];

// Random strings such as "VwDHUpbxyWMDqaJPWmUsw" have no vowel rhythm and mix
// cases mid-word. Real names and messages do not look like this.
function looksLikeGibberish(text) {
  if (!text) return false;
  const token = text.trim();
  if (token.length < 12) return false;
  if (/\s/.test(token)) return false; // multi-word text is judged elsewhere
  if (!/^[A-Za-z0-9]+$/.test(token)) return false;

  const letters = token.replace(/[^A-Za-z]/g, '');
  if (letters.length < 10) return false;

  const vowelRatio = (letters.match(/[aeiouAEIOU]/g) || []).length / letters.length;
  const caseSwitches = (letters.match(/[a-z][A-Z]|[A-Z][a-z]/g) || []).length;

  return vowelRatio < 0.28 || caseSwitches >= 4;
}

function detectSpam({ name, message }) {
  const haystack = [name, message].filter(Boolean).join(' ');
  if (SPAM_PATTERNS.some((pattern) => pattern.test(haystack))) return true;
  if (looksLikeGibberish(name)) return true;
  if (looksLikeGibberish(message)) return true;
  return false;
}

// Gmail and similar providers ignore dots in the local part, so a single
// mailbox can generate unlimited unique-looking addresses. Normalize before
// comparing so a flood from one mailbox is recognisable in the logs.
function normalizeEmail(email) {
  const [local, domain] = String(email).toLowerCase().split('@');
  if (!domain) return String(email).toLowerCase();
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    return `${local.replace(/\./g, '').split('+')[0]}@gmail.com`;
  }
  return `${local.split('+')[0]}@${domain}`;
}

// Short-term memory of recently seen senders, so the same address cannot
// submit repeatedly from rotating IP addresses.
const recentSubmissions = new Map();
const SUBMISSION_WINDOW_MS = 60 * 60 * 1000;
const MAX_PER_EMAIL_PER_WINDOW = 3;

function emailIsFlooding(email) {
  const key = normalizeEmail(email);
  const now = Date.now();
  const hits = (recentSubmissions.get(key) || []).filter(
    (t) => now - t < SUBMISSION_WINDOW_MS
  );
  hits.push(now);
  recentSubmissions.set(key, hits);

  // Keep the map from growing without bound.
  if (recentSubmissions.size > 5000) {
    for (const [k, v] of recentSubmissions) {
      if (v.every((t) => now - t >= SUBMISSION_WINDOW_MS)) recentSubmissions.delete(k);
    }
  }

  return hits.length > MAX_PER_EMAIL_PER_WINDOW;
}

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Basic email format validation
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// HTML escaping function to prevent injection in emails
function escapeHtml(text) {
  if (!text) return "";
  return text.replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[char];
  });
}

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production'
    ? 'https://farmhouseartisancheese.com'
    : ['https://farmhouseartisancheese.com', 'http://127.0.0.1:5500', 'http://localhost:5500']
}));
app.use(express.json());

// Rate limiting for contact form - 5 submissions per hour per IP
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, 
  message: 'Too many contact form submissions from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for newsletter signup - 5 signups per hour per IP
const newsletterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many newsletter signup attempts from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for gift box orders - 5 submissions per hour per IP
const giftBoxLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many gift box order submissions from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'Farmhouse Artisan Cheese API is running' });
});

// Contact form endpoint with rate limiting
app.post('/api/contact', contactLimiter, async (req, res) => {
  try {
    const { name, email, phone, message, website, form_loaded_at, turnstileToken } =
      req.body;

    // Honeypot check: bots fill hidden fields, humans never see them
    if (website) {
      logSpamAttempt('honeypot', req);
      return res.json({ success: true, message: 'Email sent successfully' });
    }

    // Timing check: a real person needs a few seconds to write a message
    if (submittedTooFast(form_loaded_at, 5)) {
      logSpamAttempt('timing', req);
      return res.json({ success: true, message: 'Email sent successfully' });
    }

    // Cloudflare Turnstile
    if (!(await verifyTurnstile(turnstileToken, req))) {
      logSpamAttempt('turnstile', req);
      return res
        .status(400)
        .json({ error: 'Verification failed. Please reload the page and try again.' });
    }

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    // Email format validation
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    // Input length limits
    if (name.length > 100 || email.length > 254 || (phone && phone.length > 20) || message.length > 2000) {
      return res.status(400).json({ error: 'One or more fields exceed the maximum allowed length' });
    }

    // Content heuristics: keyword spam, link spam, random-character filler
    if (detectSpam({ name, message })) {
      logSpamAttempt('content', req);
      return res.json({ success: true, message: 'Email sent successfully' });
    }

    // Per-sender flood control, independent of IP address
    if (emailIsFlooding(email)) {
      logSpamAttempt('email_flood', req);
      return res.json({ success: true, message: 'Email sent successfully' });
    }

    // Sanitize user input
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone);
    const safeMessage = escapeHtml(message);

    // Send notification email to shop owner (commented out during testing)
    await resend.emails.send({
      from: 'farmhouse-auto-reply@radarmagnet.com',
      to: [process.env.OWNER_EMAIL, process.env.BACKUP_EMAIL],
      subject: `New Contact Form Submission from ${safeName}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Phone:</strong> ${safePhone || 'Not provided'}</p>
        <p><strong>Message:</strong></p>
        <p>${safeMessage}</p>
      `
    }); 

    // Send auto-reply to customer
    await resend.emails.send({
      from: 'farmhouse-auto-reply@radarmagnet.com',
      to: email,
      subject: 'Thank you for contacting Farmhouse Artisan Cheese',
      html: `
        <h2>Thank you for reaching out!</h2>
        <p>Dear ${safeName},</p>
        <p>We've received your message and will get back to you shortly.</p>
        <p>Browse our selection online and stay connected with us on <a href="https://www.facebook.com/farmhouseartisancheese/">Facebook</a> and <a href="https://www.instagram.com/farmhouseartisancheese/">Instagram</a> for inspiration, seasonal offerings, and behind-the-scenes glimpses of our shop.</p>
        <p>And when you are in the neighbourhood, drop in and visit us at our Oakville location on Kerr Street just north of Lakeshore.</p>
        <br>
        <p>Best regards,</p>
        <p><strong>Farmhouse Artisan Cheese</strong></p>
        <p>345 Kerr Street, Oakville, ON L6K 3B7</p>
        <p>(905) 582-9600</p>
      `
    });

    res.json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Newsletter signup endpoint with rate limiting
app.post('/api/newsletter', newsletterLimiter, async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      seasonalOfferings,
      website,
      form_loaded_at,
      turnstileToken
    } = req.body;

    // Honeypot check: bots fill hidden fields, humans never see them
    if (website) {
      logSpamAttempt('honeypot', req);
      return res.json({ success: true, message: 'Newsletter signup successful' });
    }

    // Timing check
    if (submittedTooFast(form_loaded_at, 3)) {
      logSpamAttempt('timing', req);
      return res.json({ success: true, message: 'Newsletter signup successful' });
    }

    // Cloudflare Turnstile
    if (!(await verifyTurnstile(turnstileToken, req))) {
      logSpamAttempt('turnstile', req);
      return res
        .status(400)
        .json({ error: 'Verification failed. Please reload the page and try again.' });
    }

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Email format validation
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    // Input length limits
    if (name.length > 100 || email.length > 254 || (phone && phone.length > 20)) {
      return res.status(400).json({ error: 'One or more fields exceed the maximum allowed length' });
    }

    // Content heuristics
    if (detectSpam({ name })) {
      logSpamAttempt('content', req);
      return res.json({ success: true, message: 'Newsletter signup successful' });
    }

    // Per-sender flood control
    if (emailIsFlooding(email)) {
      logSpamAttempt('email_flood', req);
      return res.json({ success: true, message: 'Newsletter signup successful' });
    }

    // Sanitize user input
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone);

    const cmResponse = await fetch(
  `https://api.createsend.com/api/v3.3/subscribers/${process.env.CAMPAIGN_MONITOR_LIST_ID}.json`,
  {
    method: 'POST',
    headers: {
      'Authorization':
        'Basic ' +
        Buffer.from(
          process.env.CAMPAIGN_MONITOR_API_KEY + ':x'
        ).toString('base64'),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      EmailAddress: email,
      Name: safeName,
      Resubscribe: true,
      ConsentToTrack: 'Yes'
    })
  }
);

if (!cmResponse.ok) {
  const errorText = await cmResponse.text();
  throw new Error(`Campaign Monitor error: ${errorText}`);
}

    // Send notification email to shop owner (commented out during testing)
    await resend.emails.send({
      from: 'farmhouse-auto-reply@radarmagnet.com',
      to: [process.env.OWNER_EMAIL, process.env.BACKUP_EMAIL],
      subject: `New Newsletter Signup from ${safeName}`,
      html: `
        <h2>New Newsletter Signup</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Phone:</strong> ${safePhone || 'Not provided'}</p>
        <p><strong>Seasonal Offerings:</strong> ${seasonalOfferings ? 'Yes' : 'No'}</p>
      `
    });

    // Send welcome email to subscriber
    await resend.emails.send({
      from: 'farmhouse-auto-reply@radarmagnet.com',
      to: email,
      subject: 'Welcome to Farmhouse Artisan Cheese',
      html: `
        <h2>Welcome, ${safeName}!</h2>
        <p>Thank you for joining our email list. We're delighted to have you as part of our community.</p>
        <p>We look forward to providing you with exciting new arrivals, seasonal selections, and special events at our Oakville location.</p>
        <p>Browse our selection online and stay connected with us on <a href="https://www.facebook.com/farmhouseartisancheese/">Facebook</a> and <a href="https://www.instagram.com/farmhouseartisancheese/">Instagram</a> for inspiration, seasonal offerings, and behind-the-scenes glimpses of our shop.</p>
        <p>Curious what you missed? Catch up on past issues anytime in our <a href="https://farmhouseartisancheese.com/archives.html">newsletter archive</a>.</p>
        <p>And when you are in the neighbourhood, drop in and visit us at our Oakville location on Kerr Street just north of Lakeshore.</p>
        <br>
        <p>Best regards,</p>
        <p><strong>Farmhouse Artisan Cheese</strong></p>
        <p>345 Kerr Street, Oakville, ON L6K 3B7</p>
        <p>(905) 582-9600</p>
      `
    });

    res.json({ success: true, message: 'Newsletter signup successful' });
  } catch (error) {
    console.error('Error processing newsletter signup:', error);
    res.status(500).json({ error: 'Failed to process signup' });
  }
});

// Gift box order endpoint with rate limiting
app.post('/api/gift-box-order', giftBoxLimiter, async (req, res) => {
  try {
    const { name, email, phone, boxes, website, form_loaded_at, turnstileToken } =
      req.body;

    // Honeypot check: bots fill hidden fields, humans never see them
    if (website) {
      logSpamAttempt('honeypot', req);
      return res.json({ success: true, message: 'Order received' });
    }

    // Timing check
    if (submittedTooFast(form_loaded_at, 5)) {
      logSpamAttempt('timing', req);
      return res.json({ success: true, message: 'Order received' });
    }

    // Cloudflare Turnstile
    if (!(await verifyTurnstile(turnstileToken, req))) {
      logSpamAttempt('turnstile', req);
      return res
        .status(400)
        .json({ error: 'Verification failed. Please reload the page and try again.' });
    }

    // Validate required fields
    if (!name || !email || !phone) {
      return res.status(400).json({ error: 'Name, email, and phone are required' });
    }

    // Email format validation
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    // Input length limits
    if (name.length > 100 || email.length > 254 || phone.length > 20) {
      return res.status(400).json({ error: 'One or more fields exceed the maximum allowed length' });
    }

    // Validate box selection
    if (!Array.isArray(boxes) || boxes.length === 0) {
      return res.status(400).json({ error: 'Please select at least one gift box' });
    }

    const allowedBoxes = ['The Discovery', 'The Master', 'The Executive'];
    for (const box of boxes) {
      if (!box.name || !allowedBoxes.includes(box.name)) {
        return res.status(400).json({ error: 'Invalid gift box selection' });
      }
      if (box.name !== 'The Executive') {
        const qty = parseInt(box.qty, 10);
        if (isNaN(qty) || qty < 1 || qty > 99) {
          return res.status(400).json({ error: `Invalid quantity for ${box.name}` });
        }
      }
    }

    // Content heuristics
    if (detectSpam({ name })) {
      logSpamAttempt('content', req);
      return res.json({ success: true, message: 'Order received' });
    }

    // Per-sender flood control
    if (emailIsFlooding(email)) {
      logSpamAttempt('email_flood', req);
      return res.json({ success: true, message: 'Order received' });
    }

    // Sanitize user input
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone);

    // Build order summary table for store notification email
    const orderRows = boxes.map(box => {
      if (box.name === 'The Executive') {
        return `<tr>
          <td style="padding: 10px 16px 10px 0;"><strong>${escapeHtml(box.name)}</strong></td>
          <td style="padding: 10px 16px 10px 0;">Custom Pricing</td>
          <td style="padding: 10px 0; color: #666;">Team to discuss directly</td>
        </tr>`;
      }
      const price = box.name === 'The Discovery' ? '$79 + tax' : '$159 + tax';
      return `<tr>
        <td style="padding: 10px 16px 10px 0;"><strong>${escapeHtml(box.name)}</strong></td>
        <td style="padding: 10px 16px 10px 0;">${price}</td>
        <td style="padding: 10px 0;">Qty: ${parseInt(box.qty, 10)}</td>
      </tr>`;
    }).join('');

    // Send notification email to shop owner
    await resend.emails.send({
      from: 'farmhouse-auto-reply@radarmagnet.com',
      to: [process.env.OWNER_EMAIL, process.env.BACKUP_EMAIL],
      subject: `New Gift Box Order from ${safeName}`,
      html: `
        <h2>New Gift Box Order</h2>
        <p><strong>Name:</strong> ${safeName}</p>
        <p><strong>Email:</strong> ${safeEmail}</p>
        <p><strong>Phone:</strong> ${safePhone}</p>
        <h3>Order Summary</h3>
        <table style="border-collapse: collapse; width: 100%; max-width: 500px;">
          <thead>
            <tr style="border-bottom: 1px solid #e5e5e5;">
              <th style="text-align: left; padding: 8px 16px 8px 0; font-weight: 600;">Box</th>
              <th style="text-align: left; padding: 8px 16px 8px 0; font-weight: 600;">Price</th>
              <th style="text-align: left; padding: 8px 0; font-weight: 600;">Details</th>
            </tr>
          </thead>
          <tbody>${orderRows}</tbody>
        </table>
      `
    });

    // Send warm auto-reply to customer
    await resend.emails.send({
      from: 'farmhouse-auto-reply@radarmagnet.com',
      to: email,
      subject: 'Your Gift Box Order — Farmhouse Artisan Cheese',
      html: `
        <h2>Thank you, ${safeName}!</h2>
        <p>We've received your gift box order and a member of our team will be in touch within 24–48 hours to confirm the details.</p>
        <p>If you have any questions in the meantime, you're always welcome to reach us by phone at (905) 582-9600, or stop by our shop on Kerr Street in Oakville.</p>
        <p>We look forward to curating something wonderful for you.</p>
        <br>
        <p>Warmly,</p>
        <p><strong>Farmhouse Artisan Cheese</strong></p>
        <p>345 Kerr Street, Oakville, ON L6K 3B7</p>
        <p>(905) 582-9600</p>
      `
    });

    res.json({ success: true, message: 'Order received' });
  } catch (error) {
    console.error('Error processing gift box order:', error);
    res.status(500).json({ error: 'Failed to process order' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});