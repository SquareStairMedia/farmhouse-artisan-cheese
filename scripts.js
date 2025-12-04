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
    
    // Dropdown menu handling
    if (dropdown && dropdownTrigger) {
        // Toggle on mobile tap
        dropdownTrigger.addEventListener('click', function(e) {
            if (window.innerWidth <= 768) {
                e.preventDefault();
                e.stopPropagation();
                dropdown.classList.toggle('active');
            }
        });
        
        // Close when clicking outside on mobile
        document.addEventListener('click', function(e) {
            if (window.innerWidth <= 768 && !dropdown.contains(e.target)) {
                dropdown.classList.remove('active');
            }
        });
    }
    
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
    
    newsletterModal.addEventListener('click', function(e) {
        if (e.target === newsletterModal) {
            newsletterModal.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('newsletter-name').value,
                email: document.getElementById('newsletter-email').value,
                phone: document.getElementById('newsletter-phone').value,
                seasonalOfferings: document.getElementById('seasonal-offerings').checked
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
            }
        });
    }
});