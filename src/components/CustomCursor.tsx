'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function CustomCursor() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if the device is a touch screen. If so, don't show custom cursor.
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    const updateMousePosition = (e: MouseEvent) => {
      // Show cursor as soon as mouse moves
      if (!isVisible) setIsVisible(true);
      setMousePosition({ x: e.clientX, y: e.clientY });

      // Check if hovering over clickable element
      const target = e.target as HTMLElement;
      setIsHovering(
        window.getComputedStyle(target).cursor === 'pointer' ||
        target.tagName.toLowerCase() === 'a' ||
        target.tagName.toLowerCase() === 'button'
      );
    };

    const handleMouseLeave = () => setIsVisible(false);
    const handleMouseEnter = () => setIsVisible(true);

    window.addEventListener('mousemove', updateMousePosition);
    document.body.addEventListener('mouseleave', handleMouseLeave);
    document.body.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
      document.body.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* The main tiny red dot that perfectly follows the cursor */}
      <motion.div
        className="fixed top-0 left-0 w-3 h-3 bg-red-600 rounded-full pointer-events-none z-[9999]"
        animate={{
          x: mousePosition.x - 6, // center the 12px dot (3*4 = 12px)
          y: mousePosition.y - 6,
          scale: isHovering ? 0 : 1, // hide tiny dot when hovering over links
        }}
        transition={{ type: 'tween', ease: 'backOut', duration: 0.1 }}
      />

      {/* The larger red ring that "follows" the mouse with a delay */}
      <motion.div
        className="fixed top-0 left-0 w-8 h-8 border-2 border-red-600 rounded-full pointer-events-none z-[9998]"
        animate={{
          x: mousePosition.x - 16, // center the 32px ring (8*4 = 32px)
          y: mousePosition.y - 16,
          scale: isHovering ? 1.5 : 1,
          backgroundColor: isHovering ? 'rgba(220, 38, 38, 0.1)' : 'transparent',
        }}
        transition={{ type: 'spring', stiffness: 150, damping: 15, mass: 0.5 }}
      />
      
      {/* Hide the default cursor so we only see the custom red dot */}
      <style dangerouslySetInnerHTML={{ __html: `
        * {
          cursor: none !important;
        }
      `}} />
    </>
  );
}
