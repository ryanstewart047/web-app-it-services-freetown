import { useEffect } from 'react'

export function useScrollAnimations() {
  useEffect(() => {
    // Modern scroll animation system
    const initScrollAnimations = () => {
      // Add ready class to enable animations
      document.documentElement.classList.add('scroll-animations-ready');
      
      // Select elements with explicit animation classes only
      const animatedElements = document.querySelectorAll(
        '.scroll-fade-in, .scroll-slide-up, .scroll-slide-left, .scroll-slide-right, .scroll-scale-in'
      );
      
      const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Add animation class based on element type or data attribute
            const element = entry.target as HTMLElement;
            
            if (element.classList.contains('scroll-fade-in')) {
              element.classList.add('animate-fade-in');
            } else if (element.classList.contains('scroll-slide-up')) {
              element.classList.add('animate-slide-up');
            } else if (element.classList.contains('scroll-slide-left')) {
              element.classList.add('animate-slide-left');
            } else if (element.classList.contains('scroll-slide-right')) {
              element.classList.add('animate-slide-right');
            } else if (element.classList.contains('scroll-scale-in')) {
              element.classList.add('animate-scale-in');
            } else {
              // Default animation for cards and sections
              element.classList.add('animate-slide-up');
            }
            
            // Add stagger delay for elements in the same container
            const container = element.parentElement;
            if (container && container.children.length > 1) {
              const siblings = Array.from(container.children) as HTMLElement[];
              const index = siblings.indexOf(element);
              if (index !== -1) {
                element.style.animationDelay = `${index * 0.1}s`;
              }
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
      
      // Cleanup function
      return () => {
        scrollObserver.disconnect();
      };
    };
    
    // Initialize animations after a small delay to ensure DOM is ready
    const timer = setTimeout(initScrollAnimations, 100);
    
    return () => {
      clearTimeout(timer);
    };
  }, []);
}
