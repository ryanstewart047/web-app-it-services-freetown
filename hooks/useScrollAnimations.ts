import { useEffect } from 'react';

export function useScrollAnimations() {
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          intersectionObserver.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe all current data-animate elements
    const observeAll = () => {
      document.querySelectorAll('[data-animate]:not(.animate-in)').forEach((el) => {
        intersectionObserver.observe(el);
      });
    };

    observeAll();

    // Watch for new elements added to the DOM (e.g. after loading overlay hides)
    const mutationObserver = new MutationObserver(() => {
      observeAll();
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true
    });

    return () => {
      intersectionObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, []);
}
