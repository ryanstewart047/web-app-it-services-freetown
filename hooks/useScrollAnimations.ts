import { useEffect } from 'react';

export function useScrollAnimations() {
  useEffect(() => {
    const initAnimations = () => {
      const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
      };

      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
            observer.unobserve(entry.target);
          }
        });
      }, observerOptions);

      const animatedElements = document.querySelectorAll('[data-animate]');
      animatedElements.forEach((el) => observer.observe(el));

      return () => {
        animatedElements.forEach((el) => observer.unobserve(el));
      };
    };

    // Run immediately
    const cleanup1 = initAnimations();
    
    // Also run after a short delay to catch dynamically rendered elements
    const timeout = setTimeout(() => {
      initAnimations();
    }, 500);

    return () => {
      clearTimeout(timeout);
      if (cleanup1) cleanup1();
    };
  }, []);
}
