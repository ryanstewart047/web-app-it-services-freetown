document.addEventListener('DOMContentLoaded', function() {
    console.log("main.js loaded");
    
    // ------------ MOBILE MENU FUNCTIONALITY ------------
    
    // Enhanced Mobile Menu Toggle with animations
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuBar1 = document.getElementById('menu-bar-1');
    const menuBar2 = document.getElementById('menu-bar-2');
    const menuBar3 = document.getElementById('menu-bar-3');
    const body = document.body;

    if (mobileMenuButton && mobileMenu) {
        // Add a more robust click event that works across all devices
        mobileMenuButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Toggle body class for preventing scroll when menu is open
            body.classList.toggle('menu-open');
            
            // Toggle the mobile menu visibility
            mobileMenu.classList.toggle('hidden');
            
            // Log for debugging
            console.log("Mobile menu button clicked, menu is now:", 
                mobileMenu.classList.contains('hidden') ? "hidden" : "visible");
        });
        
        // Close menu when clicking links
        mobileMenu.querySelectorAll('a, button').forEach(link => {
            link.addEventListener('click', () => {
                if (link.getAttribute('onclick') === 'showServicesPopup()') {
                    // Don't close menu when opening services popup
                    return;
                }
                
                body.classList.remove('menu-open');
                mobileMenu.classList.add('hidden');
            });
        });
    }
    
    // ------------ IMAGE SLIDER FUNCTIONALITY ------------
    
    initializeSlider();

    function initializeSlider() {
        const slides = document.querySelectorAll('.image-slide');
        const dots = document.querySelectorAll('.slider-dot');
        const prevBtn = document.querySelector('.slider-prev');
        const nextBtn = document.querySelector('.slider-next');
        let currentSlide = 0;
        let slideInterval;

        if (!slides.length) return;

        // Start automatic sliding
        startSlideTimer();

        // Update slide display
        function showSlide(index) {
            slides.forEach(slide => slide.classList.remove('active'));
            dots.forEach(dot => dot.classList.remove('active'));
            
            slides[index].classList.add('active');
            dots[index]?.classList.add('active');
        }

        // Go to previous slide
        function prevSlide() {
            currentSlide = (currentSlide === 0) ? slides.length - 1 : currentSlide - 1;
            showSlide(currentSlide);
            restartSlideTimer();
        }

        // Go to next slide
        function nextSlide() {
            currentSlide = (currentSlide === slides.length - 1) ? 0 : currentSlide + 1;
            showSlide(currentSlide);
            restartSlideTimer();
        }

        // Start automatic sliding
        function startSlideTimer() {
            slideInterval = setInterval(nextSlide, 5000); // Change slide every 5 seconds
        }

        // Restart the slide timer
        function restartSlideTimer() {
            clearInterval(slideInterval);
            startSlideTimer();
        }

        // Event listeners
        if (prevBtn) prevBtn.addEventListener('click', prevSlide);
        if (nextBtn) nextBtn.addEventListener('click', nextSlide);

        // Dot navigation
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                currentSlide = index;
                showSlide(currentSlide);
                restartSlideTimer();
            });
        });
    }
    
    // ------------ SCROLL ANIMATIONS ------------
    
    initScrollAnimations();

    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.scroll-animate');
        
        if (!animatedElements.length) return;
        
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    scrollObserver.unobserve(entry.target);
                }
            });
        }, observerOptions);
        
        animatedElements.forEach(element => {
            scrollObserver.observe(element);
        });
    }
    
    // ------------ COUNTER ANIMATIONS ------------
    
    initCounters();

    function initCounters() {
        const counters = document.querySelectorAll('.counter');
        
        if (!counters.length) return;
        
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = entry.target;
                    const target = parseInt(counter.getAttribute('data-target'));
                    const duration = 2000; // Animation duration in milliseconds
                    const step = Math.ceil(target / (duration / 16)); // Roughly 60fps
                    
                    let current = 0;
                    const updateCounter = () => {
                        current += step;
                        if (current > target) current = target;
                        counter.textContent = current;
                        
                        if (current < target) {
                            requestAnimationFrame(updateCounter);
                        }
                    };
                    
                    updateCounter();
                    counterObserver.unobserve(counter);
                }
            });
        }, { threshold: 0.5 });
        
        counters.forEach(counter => {
            counterObserver.observe(counter);
        });
    }
    
    // ------------ LOADING OVERLAY ------------
    
    function hideLoader() {
        const loader = document.getElementById('loadingOverlay');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 500);
        }
    }
    
    // Hide loader after content is loaded
    setTimeout(hideLoader, 1000);
});
