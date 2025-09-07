// Main JavaScript for IT Services Freetown Website

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
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

    // Mobile Menu Toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const menuIcon = document.getElementById('menu-icon');
    const closeIcon = document.getElementById('close-icon');

    if (mobileMenuButton) {
        mobileMenuButton.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
            menuIcon.classList.toggle('hidden');
            closeIcon.classList.toggle('hidden');
        });
    }

    // Image Slider Functionality
    let currentSlide = 0;
    const slides = document.querySelectorAll('.image-slide');
    const dots = document.querySelectorAll('.slider-dot');
    const prevBtn = document.querySelector('.slider-prev');
    const nextBtn = document.querySelector('.slider-next');
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
        
        // Set up event listeners for dots
        dots.forEach((dot, index) => {
            dot.addEventListener('click', () => {
                showSlide(index);
            });
        });
        
        // Auto-advance slides
        setInterval(() => {
            showSlide(currentSlide + 1);
        }, 5000);
    }

    // Show a specific slide
    function showSlide(index) {
        if (slides.length === 0) return;
        
        // Handle wrapping
        if (index < 0) {
            index = totalSlides - 1;
        } else if (index >= totalSlides) {
            index = 0;
        }
        
        // Update current slide index
        currentSlide = index;
        
        // Hide all slides
        slides.forEach(slide => {
            slide.classList.remove('active');
        });
        
        // Show current slide
        slides[currentSlide].classList.add('active');
        
        // Update dots
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentSlide);
        });
    }

    // Initialize the slider
    initSlider();

    // Scroll Animation
    function handleScrollAnimations() {
        const elements = document.querySelectorAll('.scroll-animate, .section-title, .service-card');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, { threshold: 0.1 });
        
        elements.forEach(el => {
            observer.observe(el);
        });
    }

    // Initialize scroll animations
    handleScrollAnimations();

    // Statistics Counter Animation
    function animateCounters() {
        const counters = document.querySelectorAll('.counter');
        
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'), 10);
            const duration = 2000; // ms
            const step = target / (duration / 16); // Update roughly every 16ms for 60fps
            let current = 0;
            
            const updateCounter = () => {
                current += step;
                
                if (current < target) {
                    counter.textContent = Math.ceil(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            };
            
            // Start the animation when counter is in view
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        updateCounter();
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.5 });
            
            observer.observe(counter);
        });
    }
    
    // Initialize counter animations
    animateCounters();
});
