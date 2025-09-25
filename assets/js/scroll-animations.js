// Modern Scroll Animations System
// Clean, smooth animations that trigger as user scrolls

(function() {
    'use strict';
    
    // Configuration
    const ANIMATION_CONFIG = {
        threshold: 0.15,
        rootMargin: '0px 0px -100px 0px',
        staggerDelay: 100, // milliseconds
        animationDuration: 600 // milliseconds
    };
    
    // Animation classes mapping
    const ANIMATION_TYPES = {
        'scroll-fade-in': 'animate-fade-in',
        'scroll-slide-up': 'animate-slide-up',
        'scroll-slide-left': 'animate-slide-left',
        'scroll-slide-right': 'animate-slide-right',
        'scroll-scale-in': 'animate-scale-in',
        'default': 'animate-slide-up'
    };
    
    // Initialize scroll animations
    function initScrollAnimations() {
        // Add ready class to enable animations
        document.documentElement.classList.add('scroll-animations-ready');
        
        // Select elements with explicit animation classes only
        const animatedElements = document.querySelectorAll([
            '.scroll-fade-in',
            '.scroll-slide-up',
            '.scroll-slide-left',
            '.scroll-slide-right',
            '.scroll-scale-in'
        ].join(', '));
        
        if (animatedElements.length === 0) {
            return;
        }
        
        // Create intersection observer
        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateElement(entry.target);
                    
                    // Stop observing once animated (one-time animation)
                    scrollObserver.unobserve(entry.target);
                }
            });
        }, ANIMATION_CONFIG);
        
        // Observe all elements
        animatedElements.forEach(element => {
            scrollObserver.observe(element);
        });
        
        // Store observer for cleanup
        window.scrollAnimationObserver = scrollObserver;
    }
    
    // Animate individual element
    function animateElement(element) {
        // Determine animation type
        let animationClass = ANIMATION_TYPES.default;
        
        for (const [className, animationName] of Object.entries(ANIMATION_TYPES)) {
            if (className !== 'default' && element.classList.contains(className)) {
                animationClass = animationName;
                break;
            }
        }
        
        // Add stagger delay for grouped elements
        const staggerDelay = calculateStaggerDelay(element);
        if (staggerDelay > 0) {
            element.style.animationDelay = `${staggerDelay}ms`;
        }
        
        // Apply animation
        element.classList.add(animationClass);
        
        // Add completion event listener
        element.addEventListener('animationend', () => {
            element.style.animationDelay = '';
        }, { once: true });
    }
    
    // Calculate stagger delay based on element position
    function calculateStaggerDelay(element) {
        const container = element.parentElement;
        if (!container) return 0;
        
        // Only apply stagger to containers with multiple animated children
        const siblings = Array.from(container.children).filter(child => 
            child !== element && isAnimatedElement(child)
        );
        
        if (siblings.length === 0) return 0;
        
        // Find index of current element among animated siblings
        const animatedSiblings = Array.from(container.children).filter(isAnimatedElement);
        const index = animatedSiblings.indexOf(element);
        
        return index > 0 ? index * ANIMATION_CONFIG.staggerDelay : 0;
    }
    
    // Check if element should be animated
    function isAnimatedElement(element) {
        const animatedSelectors = [
            'scroll-fade-in',
            'scroll-slide-up', 
            'scroll-slide-left',
            'scroll-slide-right',
            'scroll-scale-in',
            'service-card'
        ];
        
        return animatedSelectors.some(selector => element.classList.contains(selector)) ||
               (element.tagName === 'H2' && !element.classList.contains('no-animate')) ||
               (element.tagName === 'H3' && !element.classList.contains('no-animate')) ||
               (element.classList.contains('card') && !element.classList.contains('no-animate'));
    }
    
    // Cleanup function
    function cleanup() {
        if (window.scrollAnimationObserver) {
            window.scrollAnimationObserver.disconnect();
            delete window.scrollAnimationObserver;
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScrollAnimations);
    } else {
        // DOM already loaded
        setTimeout(initScrollAnimations, 100);
    }
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', cleanup);
    
    // Re-initialize if needed (for SPA navigation)
    window.reinitScrollAnimations = function() {
        cleanup();
        setTimeout(initScrollAnimations, 100);
    };
    
    // Export for external access
    window.ScrollAnimations = {
        init: initScrollAnimations,
        cleanup: cleanup,
        config: ANIMATION_CONFIG
    };
    
})();