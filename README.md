# Farmhouse Artisan Cheese Website

A luxury, minimalist website for Farmhouse Artisan Cheese, a boutique cheese shop in Oakville, Ontario.

## Project Structure
```
farmhouse-artisan-cheese/
├── server/              # Node.js backend API
│   ├── index.js        # Express server with contact form endpoint
│   ├── package.json    # Backend dependencies
│   └── .env           # Environment variables (not in git)
├── BlogPages/          # Blog post templates
├── assets/             # Images, videos, and static assets
├── *.html             # Main site pages
├── styles.css         # Global styles
└── scripts.js         # Global JavaScript
```

## Features

- **Static Frontend**: Clean, responsive design with video hero sections
- **Contact Forms**: Multiple contact points (contact page + modal forms)
- **Email Integration**: Automated emails via Resend API
  - Notification to shop owner
  - Auto-reply to customer
- **Blog System**: Notes/blog section with post templates
- **Product Categories**: Six main product sections with dedicated pages

## Tech Stack

- **Frontend**: HTML, CSS, JavaScript (vanilla)
- **Backend**: Node.js + Express
- **Email**: Resend API
- **Hosting**: Render (static site + web service)
- **Version Control**: GitHub

## Local Development

### Prerequisites
- Node.js v22+ installed
- Git configured
- Resend account with API key

### Setup

1. **Clone the repository**
```bash
   git clone https://github.com/SquareStairMedia/farmhouse-artisan-cheese.git
   cd farmhouse-artisan-cheese
```

2. **Install backend dependencies**
```bash
   cd server
   npm install
```

3. **Configure environment variables**
   Create `server/.env`:
```
   RESEND_API_KEY=your_api_key_here
   OWNER_EMAIL=info@farmhouseartisancheese.com
   PORT=3000
```

4. **Start the backend server**
```bash
   node index.js
```
   Server runs at http://localhost:3000

5. **Update frontend for local testing**
   In contact.html, boards.html, and gift-boxes.html, temporarily change:
```javascript
   fetch('https://farmhouse-backend.onrender.com/api/contact'
```
   to:
```javascript
   fetch('http://localhost:3000/api/contact'
```

6. **Open the site**
   Open any HTML file in your browser or use a local server like Live Server in VS Code

## Contact Form Locations

1. **contact.html** - Main contact page with success modal
2. **boards.html** - "Contact Us" modal button
3. **gift-boxes.html** - "Contact Us" modal button

All forms submit to `/api/contact` endpoint.

## Email Configuration

**Current Setup (Temporary):**
- Sender: Uses verified radarmagnet.com domain
- From address: `contact@radarmagnet.com` or similar

**Production Setup (After DNS Transfer):**
- Sender: info@farmhouseartisancheese.com
- Requires: DNS records added to farmhouseartisancheese.com domain
- See DEPLOYMENT.md for instructions

## Future Features

- Newsletter signup functionality
- Blog post management system (admin panel)
- Customer list backup system
- Custom admin dashboard for client

## Contributing

This is a client project managed by SquareStair Media. Contact stephen@squarestairmedia.com for access.

## License

Proprietary - © 2025 SquareStair Media / Farmhouse Artisan Cheese