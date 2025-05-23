document.addEventListener('DOMContentLoaded', function() {
    // Navigation functionality
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // Sticky navigation
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });

    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Close mobile menu if open
                if (navLinks.classList.contains('active')) {
                    navLinks.classList.remove('active');
                    hamburger.classList.remove('active');
                }
                
                // Scroll to target
                window.scrollTo({
                    top: targetElement.offsetTop - 70, // Account for fixed header
                    behavior: 'smooth'
                });
            }
        });
    });

    // Contact form submission
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const organization = document.getElementById('organization').value;
            const message = document.getElementById('message').value;
            
            // Simple validation
            if (!name || !email || !message) {
                alert('Please fill in all required fields.');
                return;
            }
            
            // In a real implementation, you would send this data to a server
            console.log('Form submitted:', { name, email, organization, message });
            
            // Show success message
            alert('Thank you for your message! We will get back to you soon.');
            
            // Reset form
            contactForm.reset();
        });
    }

    // Animation on scroll
    const animateElements = document.querySelectorAll('.feature-card, .timeline-item, .about-content, .section-header');
    
    const animateOnScroll = function() {
        animateElements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;
            
            if (elementPosition < windowHeight - 100) {
                element.classList.add('fade-in');
            }
        });
    }
    
    // Run once on page load
    animateOnScroll();
    
    // Then on scroll
    window.addEventListener('scroll', animateOnScroll);
});

// Add CSS class for mobile navigation
document.addEventListener('DOMContentLoaded', function() {
    const style = document.createElement('style');
    style.innerHTML = `
        @media (max-width: 768px) {
            .nav-links.active {
                display: block;
                position: absolute;
                top: 70px;
                left: 0;
                width: 100%;
                background-color: white;
                box-shadow: 0 10px 15px rgba(0,0,0,0.1);
                padding: 20px;
            }
            
            .nav-links.active ul {
                flex-direction: column;
            }
            
            .nav-links.active li {
                margin: 10px 0;
            }
            
            .hamburger.active span:nth-child(1) {
                transform: rotate(45deg) translate(5px, 6px);
            }
            
            .hamburger.active span:nth-child(2) {
                opacity: 0;
            }
            
            .hamburger.active span:nth-child(3) {
                transform: rotate(-45deg) translate(5px, -6px);
            }
            
            nav.scrolled {
                padding: 10px 0;
                background-color: rgba(255, 255, 255, 0.95);
            }
        }
    `;
    document.head.appendChild(style);
});
