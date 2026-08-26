// Cloudflare Turnstile integration for protected Farmhouse forms
(function () {
    const SITE_KEY = '0x4AAAAAAEc-nxZGguvkII8J';
    const protectedForms = [
        { formId: 'contactForm', action: 'contact', endpoint: '/api/contact' },
        { formId: 'newsletterForm', action: 'newsletter', endpoint: '/api/newsletter' },
        { formId: 'giftBoxForm', action: 'gift_box_order', endpoint: '/api/gift-box-order' }
    ];

    function renderTurnstileWidgets() {
        if (typeof window.turnstile === 'undefined') return;

        protectedForms.forEach(({ formId, action }) => {
            const form = document.getElementById(formId);
            if (!form || form.querySelector('.cf-turnstile')) return;

            const widget = document.createElement('div');
            widget.className = 'cf-turnstile';
            widget.style.margin = '0 0 18px';

            const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
            if (submitButton) {
                submitButton.parentNode.insertBefore(widget, submitButton);
            } else {
                form.appendChild(widget);
            }

            window.turnstile.render(widget, {
                sitekey: SITE_KEY,
                action
            });
        });
    }

    function loadTurnstile() {
        if (document.querySelector('script[data-farmhouse-turnstile]')) return;
        const script = document.createElement('script');
        script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        script.dataset.farmhouseTurnstile = 'true';
        script.onload = renderTurnstileWidgets;
        document.head.appendChild(script);
    }

    const originalFetch = window.fetch.bind(window);
    window.fetch = async function (input, init = {}) {
        const url = typeof input === 'string' ? input : input?.url || '';
        const match = protectedForms.find(({ endpoint }) => url.includes(endpoint));

        if (match && init.body && typeof init.body === 'string') {
            const form = document.getElementById(match.formId);
            const token = form?.querySelector('[name="cf-turnstile-response"]')?.value || '';

            try {
                const body = JSON.parse(init.body);
                body.turnstileToken = token;
                body.turnstileAction = match.action;
                init = { ...init, body: JSON.stringify(body) };
            } catch (error) {
                console.error('Unable to attach Turnstile token:', error);
            }
        }

        return originalFetch(input, init);
    };

    document.addEventListener('DOMContentLoaded', loadTurnstile);
})();

// Cookie Consent Banner (PIPEDA Compliant)
document.addEventListener('DOMContentLoaded', function() {
    const cookieBanner = document.getElementById('cookieConsentBanner');
    const acceptBtn = document.getElementById('cookieAccept');
    const declineBtn = document.getElementById('cookieDecline');

    // Check if user has already made a choice
    const cookieConsent = localStorage.getItem('cookieConsent');

    if (!cookieConsent && cookieBanner) {
        // Show banner after a short delay for better UX
        setTimeout(function() {
            cookieBanner.classList.add('active');
        }, 1000);
    } else if (cookieConsent === 'accepted') {
        // Load analytics if previously accepted
        loadGoogleAnalytics();
    }

    // Handle Accept button
    if (acceptBtn) {
        acceptBtn.addEventListener('click', function() {
            localStorage.setItem('cookieConsent', 'accepted');
            cookieBanner.classList.remove('active');
            loadGoogleAnalytics();
        });
    }

    // Handle Decline button
    if (declineBtn) {
        declineBtn.addEventListener('click', function() {
            localStorage.setItem('cookieConsent', 'declined');
            cookieBanner.classList.remove('active');
        });
    }
});

// Function to load Google Analytics after consent
function loadGoogleAnalytics() {
    // Only load if not already loaded
    if (window.gaLoaded) return;
    window.gaLoaded = true;

    // Load gtag script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-T8DVQVJV9S';
    document.head.appendChild(script);

    script.onload = function() {
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        window.gtag = gtag;
        gtag('js', new Date());
        gtag('config', 'G-T8DVQVJV9S');
    };
}

// Hamburger menu toggle
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const dropdown = document.querySelector('.dropdown');
    const dropdownTrigger = dropdown ? dropdown.querySelector('.dropdown-trigger') : null;
    
    // Toggle hamburger menu
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navLinks.classList.toggle('active');
            document.body.classList.toggle('menu-open');
        });
    }
    
    // Dropdown menu handling — supports multiple dropdowns
    const dropdowns = document.querySelectorAll('.dropdown');
    dropdowns.forEach(function(dd) {
        const trigger = dd.querySelector('.dropdown-trigger');
        if (!trigger) return;

        // Toggle on mobile tap
        trigger.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                e.stopPropagation();
                // Close any other open dropdowns first
                dropdowns.forEach(function(other) {
                    if (other !== dd) other.classList.remove('active');
                });
                dd.classList.toggle('active');
            }
        });
    });

    // Close all dropdowns when clicking outside on mobile
    document.addEventListener('click', function(e) {
        if (window.innerWidth <= 768) {
            dropdowns.forEach(function(dd) {
                if (!dd.contains(e.target)) dd.classList.remove('active');
            });
        }
    });
    
    // Close menu when clicking on a link
    const allNavLinks = document.querySelectorAll('.nav-links a');
    allNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth <= 768) {
                hamburger.classList.remove('active');
                navLinks.classList.remove('active');
                document.body.classList.remove('menu-open');
            }
        });
    });

    // Gift box toggle for touch devices
    const giftBoxToggle = document.querySelector('.gift-box-toggle');
    if (giftBoxToggle && window.matchMedia('(hover: none)').matches) {
        giftBoxToggle.addEventListener('click', function() {
            const closed = this.querySelector('.gift-box-closed');
            const open = this.querySelector('.gift-box-open');
            
            if (closed.style.opacity !== '0') {
                closed.style.opacity = '0';
                open.style.opacity = '1';
            } else {
                closed.style.opacity = '1';
                open.style.opacity = '0';
            }
        });
    }
});

// Newsletter modal functionality
document.addEventListener('DOMContentLoaded', function() {
    const newsletterButton = document.getElementById('newsletterButton');
    const newsletterModal = document.getElementById('newsletterModal');
    const newsletterClose = document.querySelector('.newsletter-modal-close');
    const newsletterForm = document.getElementById('newsletterForm');
    
    if (newsletterButton) {
        newsletterButton.addEventListener('click', function() {
            newsletterModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (newsletterClose) {
        newsletterClose.addEventListener('click', function() {
            newsletterModal.classList.remove('active');
            document.body.style.overflow = '';
        });
    }
    
if (newsletterModal) {
    newsletterModal.addEventListener('click', function(e) {
        if (e.target === newsletterModal) {
            newsletterModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('newsletter-name').value,
                email: document.getElementById('newsletter-email').value,
                phone: document.getElementById('newsletter-phone').value,
                seasonalOfferings: document.getElementById('seasonal-offerings').checked,
                website: document.getElementById('newsletter-honeypot').value
            };
            
            const statusDiv = document.getElementById('newsletterStatus');
            statusDiv.textContent = 'Subscribing...';
            
            try {
                const response = await fetch('https://farmhouse-backend.onrender.com/api/newsletter', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                
                if (response.ok) {
                        gtag('event', 'sign_up', {
                            'method': 'Newsletter'
                        });
                    statusDiv.textContent = 'Thank you for subscribing!';
                    statusDiv.style.color = 'green';
                    newsletterForm.reset();
                    if (typeof turnstile !== 'undefined') turnstile.reset();
                    setTimeout(() => {
                        newsletterModal.classList.remove('active');
                        document.body.style.overflow = '';
                        statusDiv.textContent = '';
                    }, 2000);
                } else {
                    throw new Error('Failed to subscribe');
                }
            } catch (error) {
                statusDiv.textContent = 'Sorry, something went wrong. Please try again.';
                statusDiv.style.color = 'red';
                if (typeof turnstile !== 'undefined') turnstile.reset();
            }
        });
    }

});

// FAQ Page Accordion Toggle
document.querySelectorAll('.faq-question').forEach(button => {
    button.addEventListener('click', () => {
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        const answer = button.nextElementSibling;
        const icon = button.querySelector('.faq-icon');
        
        button.setAttribute('aria-expanded', !isExpanded);
        answer.style.maxHeight = isExpanded ? '0' : answer.scrollHeight + 'px';
        icon.textContent = isExpanded ? '+' : '−';
    });
});