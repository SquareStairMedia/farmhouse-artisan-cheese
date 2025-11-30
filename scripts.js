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