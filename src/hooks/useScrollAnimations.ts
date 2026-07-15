import { useEffect } from 'react';

export function useScrollAnimations() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    document.body.classList.add('scroll-animations-ready');

    const observerOptions = {
      threshold: 0.05,
      rootMargin: '50px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const observeElements = () => {
      const animatedElements = document.querySelectorAll('[data-animate]:not(.animate-in), .scroll-animate:not(.animate-in)');
      animatedElements.forEach((el) => observer.observe(el));
    };

    // Initial run
    observeElements();

    // Watch for new elements added dynamically to the DOM
    const mutationObserver = new MutationObserver(() => {
      observeElements();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      observer.disconnect();
      mutationObserver.disconnect();
    };
  }, []);
}
