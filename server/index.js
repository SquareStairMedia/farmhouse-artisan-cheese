const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'Farmhouse Artisan Cheese API is running' });
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    // Send notification email to shop owner
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
        <p>In the meantime, feel free to visit us at our Oakville location or browse our selection online.</p>
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});