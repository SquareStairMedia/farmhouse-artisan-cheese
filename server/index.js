// /server/index.js
const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Rate limiting for contact form - 3 submissions per hour per IP
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each IP to 10 requests per windowMs
  message: 'Too many contact form submissions from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limiting for newsletter signup - 2 signups per hour per IP
const newsletterLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many newsletter signup attempts from this IP, please try again later.',
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
    const { name, email, phone, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    // Send notification email to shop owner (commented out during testing)
    await resend.emails.send({
      from: 'farmhouse-test@radarmagnet.com',
      to: process.env.OWNER_EMAIL,
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    }); 

    // Send auto-reply to customer
    await resend.emails.send({
      from: 'farmhouse-test@radarmagnet.com',
      to: email,
      subject: 'Thank you for contacting Farmhouse Artisan Cheese',
      html: `
        <h2>Thank you for reaching out!</h2>
        <p>Dear ${name},</p>
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
    const { name, email, phone, seasonalOfferings } = req.body;

    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    // Send notification email to shop owner (commented out during testing)
    await resend.emails.send({
      from: 'farmhouse-test@radarmagnet.com',
      to: process.env.OWNER_EMAIL,
      subject: `New Newsletter Signup from ${name}`,
      html: `
        <h2>New Newsletter Signup</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
        <p><strong>Seasonal Offerings:</strong> ${seasonalOfferings ? 'Yes' : 'No'}</p>
      `
    });

    // Send welcome email to subscriber
    await resend.emails.send({
      from: 'farmhouse-test@radarmagnet.com',
      to: email,
      subject: 'Welcome to Farmhouse Artisan Cheese',
      html: `
        <h2>Welcome, ${name}!</h2>
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});