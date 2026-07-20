// Main JavaScript for IT Services Freetown Website

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log("main.js loaded successfully");
    
    // Remove loading overlay after page load
    setTimeout(function() {
        const loadingOverlay = document.getElementById('loadingOverlay');
        if (loadingOverlay) {
            loadingOverlay.classList.add('fade-out');
            setTimeout(() => {
                loadingOverlay.style.display = 'none';
            }, 500);
        }
    }, 800);

    // NOTE: Mobile menu handling is now done in each HTML file directly.
    // This code is kept for reference but is now disabled.
    /*
    // Simple Mobile Menu Toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');
    const closeMenuButton = document.getElementById('close-mobile-menu');
    const body = document.body;

    if (mobileMenuButton && mobileMenu) {
        console.log("Mobile menu elements found");
        
        // Simple click handler for opening menu
        mobileMenuButton.addEventListener('click', function() {
            console.log("Mobile menu button clicked");
            
            // Toggle menu visibility class
            mobileMenu.classList.toggle('hidden');
            mobileMenu.classList.toggle('mobile-menu-visible');
            
            // Toggle body class for scrolling
            body.classList.toggle('menu-open');
            
            // Toggle icon visibility
            menuIcon.classList.toggle('hidden');
            closeIcon.classList.toggle('hidden');
        });
        
        // Close menu when clicking close button
        if (closeMenuButton) {
            closeMenuButton.addEventListener('click', function() {
                console.log("Close menu button clicked");
                
                mobileMenu.classList.add('hidden');
                mobileMenu.classList.remove('mobile-menu-visible');
                body.classList.remove('menu-open');
                menuIcon.classList.remove('hidden');
                closeIcon.classList.add('hidden');
            });
        }
        
        // Close menu when clicking on menu items
        const menuLinks = mobileMenu.querySelectorAll('a, button');
        menuLinks.forEach(link => {
            if (link.getAttribute('onclick') !== 'showServicesPopup()') {
                link.addEventListener('click', function() {
                    console.log("Menu link clicked, closing menu");
                    
                    mobileMenu.classList.add('hidden');
                    mobileMenu.classList.remove('mobile-menu-visible');
                    body.classList.remove('menu-open');
                    menuIcon.classList.remove('hidden');
                    closeIcon.classList.add('hidden');
                });
            }
        });
    }
    */

    // Image Slider Functionality
    const slides = document.querySelectorAll('.image-slide');
    const dots = document.querySelectorAll('.slider-dot');
    const prevBtn = document.querySelector('.slider-prev');
    const nextBtn = document.querySelector('.slider-next');
    let currentSlide = 0;
    const totalSlides = slides.length;

    // Initialize slider
    function initSlider() {
        if (slides.length === 0) return;
        
        // Show first slide
        showSlide(0);
        
        // Set up event listeners for navigation
        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                showSlide(currentSlide - 1);
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                showSlide(currentSlide + 1);
            });
        }
        
        // Set up dots navigation
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showSlide(index);
            });
        });
        
        // Auto slide
        setInterval(() => {
            showSlide(currentSlide + 1);
        }, 5000);
    }

    // Show a specific slide
    function showSlide(index) {
        // Handle looping
        if (index < 0) index = totalSlides - 1;
        if (index >= totalSlides) index = 0;
        
        // Hide all slides
        slides.forEach(slide => {
            slide.classList.remove('active');
        });
        
        // Remove active class from all dots
        dots.forEach(dot => {
            dot.classList.remove('active');
        });
        
        // Show the current slide and dot
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        
        // Update current slide index
        currentSlide = index;
    }

    // Initialize slider
    if (slides.length > 0) {
        initSlider();
    }

    // Initialize modern scroll animations
    initScrollAnimations();
    
    // Initialize the new comprehensive animation system
    if (typeof window.ScrollAnimations !== 'undefined') {
        window.ScrollAnimations.init();
    }

    // Counter Animation
    const counters = document.querySelectorAll('.counter');
    
    function animateCounter(counter) {
        const target = +counter.getAttribute('data-target');
        const count = +counter.innerText;
        const increment = target / 100;
        
        if (count < target) {
            counter.innerText = Math.ceil(count + increment);
            setTimeout(() => animateCounter(counter), 20);
        } else {
            counter.innerText = target;
        }
    }
    
    // Trigger counter animation when in view
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.5
    });
    
    // Observe all counters
    counters.forEach(counter => {
        counterObserver.observe(counter);
    });

    // Services Info Popup
    const servicesPopup = document.getElementById('services-popup');
    const popupContent = document.getElementById('popup-content');
    
    // Open services popup
    window.showServicesPopup = function() {
        if (servicesPopup) {
            servicesPopup.classList.remove('hidden');
            setTimeout(() => {
                if (popupContent) popupContent.classList.add('scale-100', 'opacity-100');
            }, 10);
        }
    };
    
    // Close services popup
    window.closeServicesPopup = function() {
        if (popupContent) {
            popupContent.classList.remove('scale-100', 'opacity-100');
            setTimeout(() => {
                if (servicesPopup) servicesPopup.classList.add('hidden');
            }, 300);
        }
    };
    
    // Cookie handling functions
    function showCookiePopup() {
        const cookiePopup = document.getElementById('cookie-popup');
        if (cookiePopup) {
            setTimeout(() => {
                cookiePopup.classList.remove('translate-y-full');
            }, 2000);
        }
    }
    
    window.acceptCookies = function() {
        const cookiePopup = document.getElementById('cookie-popup');
        if (cookiePopup) {
            cookiePopup.classList.add('translate-y-full');
            localStorage.setItem('cookiesAccepted', 'true');
        }
    };
    
    window.openCookieSettings = function() {
        const cookiePopup = document.getElementById('cookie-popup');
        const cookieSettingsModal = document.getElementById('cookie-settings-modal');
        
        if (cookiePopup) cookiePopup.classList.add('translate-y-full');
        if (cookieSettingsModal) cookieSettingsModal.classList.remove('hidden');
    };
    
    window.closeCookieSettings = function() {
        const cookieSettingsModal = document.getElementById('cookie-settings-modal');
        if (cookieSettingsModal) cookieSettingsModal.classList.add('hidden');
    };
    
    window.savePreferences = function() {
        closeCookieSettings();
        localStorage.setItem('cookiesAccepted', 'true');
    };
    
    window.acceptAllCookies = function() {
        closeCookieSettings();
        localStorage.setItem('cookiesAccepted', 'true');
    };
    
    // Check if cookies have been accepted
    if (!localStorage.getItem('cookiesAccepted')) {
        showCookiePopup();
    }
    
    // Privacy Policy Modal
    window.openPrivacyPolicy = function() {
        const privacyModal = document.getElementById('privacy-modal');
        if (privacyModal) privacyModal.classList.remove('hidden');
    };
    
    window.closePrivacyPolicy = function() {
        const privacyModal = document.getElementById('privacy-modal');
        if (privacyModal) privacyModal.classList.add('hidden');
    };
    
    // Terms & Conditions Modal
    window.openTermsConditions = function() {
        const termsModal = document.getElementById('terms-modal');
        if (termsModal) termsModal.classList.remove('hidden');
    };
    
    window.closeTermsConditions = function() {
        const termsModal = document.getElementById('terms-modal');
        if (termsModal) termsModal.classList.add('hidden');
    };
    
    // Helper function to hide the loader
    function hideLoader() {
        const loader = document.getElementById('loadingOverlay');
        if (loader) {
            loader.classList.add('opacity-0');
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }
    }
    
    // Hide loader after content is loaded
    setTimeout(hideLoader, 1000);
    

    // Enhanced scroll animation system
    function initScrollAnimations() {
        // Add ready class to <html> for CSS transitions
        document.documentElement.classList.add('scroll-animations-ready');

        // Only animate elements with explicit animation classes
        const animatedElements = document.querySelectorAll(
            '.scroll-fade-in, .scroll-slide-up, .scroll-slide-left, .scroll-slide-right, .scroll-scale-in'
        );

        // Fallback: If IntersectionObserver is not supported, show all content immediately
        if (!('IntersectionObserver' in window)) {
            animatedElements.forEach(el => {
                el.style.opacity = '1';
                el.style.transform = 'none';
            });
            return;
        }

        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Only animate once
                    if (!entry.target.classList.contains('scroll-animated')) {
                        entry.target.classList.add('scroll-animated');
                        // Add animation class based on element type
                        if (entry.target.classList.contains('scroll-fade-in')) {
                            entry.target.classList.add('animate-fade-in');
                        } else if (entry.target.classList.contains('scroll-slide-up')) {
                            entry.target.classList.add('animate-slide-up');
                        } else if (entry.target.classList.contains('scroll-slide-left')) {
                            entry.target.classList.add('animate-slide-left');
                        } else if (entry.target.classList.contains('scroll-slide-right')) {
                            entry.target.classList.add('animate-slide-right');
                        } else if (entry.target.classList.contains('scroll-scale-in')) {
                            entry.target.classList.add('animate-scale-in');
                        } else {
                            entry.target.classList.add('animate-slide-up');
                        }
                        // Add stagger delay for elements in the same container
                        const container = entry.target.parentElement;
                        if (container) {
                            const siblings = Array.from(container.children);
                            const index = siblings.indexOf(entry.target);
                            entry.target.style.animationDelay = `${index * 0.1}s`;
                        }
                        // Optional: callback for animation end
                        entry.target.addEventListener('animationend', () => {
                            entry.target.style.animationDelay = '';
                        }, { once: true });
                    }
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -100px 0px'
        });

        // Observe all elements
        animatedElements.forEach(element => {
            scrollObserver.observe(element);
        });
    }
});
