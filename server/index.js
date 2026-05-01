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
    const { name, email, phone, message, website } = req.body;

    // Honeypot check: bots fill hidden fields, humans never see them
    if (website) {
      return res.json({ success: true, message: 'Email sent successfully' });
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
    const { name, email, phone, seasonalOfferings, website } = req.body;

    // Honeypot check: bots fill hidden fields, humans never see them
    if (website) {
      return res.json({ success: true, message: 'Newsletter signup successful' });
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
    const { name, email, phone, boxes, website } = req.body;

    // Honeypot check: bots fill hidden fields, humans never see them
    if (website) {
      return res.json({ success: true, message: 'Order received' });
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