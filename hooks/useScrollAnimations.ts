import { useEffect } from 'react';

export function useScrollAnimations() {
  useEffect(() => {
    console.log('🎬 Scroll animations initialized');
    
    const initAnimations = () => {
      // Initialize scroll animations for elements with data-animate attribute
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          console.log('👀 Observing element:', entry.target, 'Intersecting:', entry.isIntersecting);
          if (entry.isIntersecting) {
            console.log('✅ Adding animate-in class to:', entry.target);
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      // Observe all elements with data-animate attribute
      const animatedElements = document.querySelectorAll('[data-animate]');
      console.log('📊 Found', animatedElements.length, 'elements with data-animate');
      
      animatedElements.forEach((el) => {
        console.log('🔍 Observing:', el);
        observer.observe(el);
      });

      return () => {
        console.log('🧹 Cleaning up scroll animations');
        animatedElements.forEach((el) => observer.unobserve(el));
      };
    };

    // Run immediately
    const cleanup1 = initAnimations();
    
    // Also run after a short delay to catch dynamically rendered elements
    const timeout = setTimeout(() => {
      console.log('🔄 Re-checking for animated elements after delay');
      initAnimations();
    }, 500);

    return () => {
      clearTimeout(timeout);
      if (cleanup1) cleanup1();
    };
  }, []);
}
