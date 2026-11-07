'use client';

import { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, GripHorizontal } from 'lucide-react';
import { usePathname } from 'next/navigation';

const WHATSAPP_GROUP_URL = 'https://chat.whatsapp.com/FuS9EBvCF455geNHqQl3Iz?s=cl&p=a&ilr=1';
const SHOW_DELAY_MS = 3000;
const STORAGE_KEY = 'whatsapp_popup_pos';

interface Position {
  x: number;
  y: number;
}

export default function WhatsAppGroupCard() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [position, setPosition] = useState<Position | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLButtonElement>(null);
  const dragDataRef = useRef<{
    startX: number;
    startY: number;
    origX: number;
    origY: number;
    hasMoved: boolean;
    elementWidth: number;
    elementHeight: number;
  } | null>(null);
  const hasDraggedRecentlyRef = useRef(false);

  // Load saved position from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed?.x === 'number' && typeof parsed?.y === 'number') {
          const maxX = Math.max(8, window.innerWidth - 270);
          const maxY = Math.max(8, window.innerHeight - 100);
          setPosition({
            x: Math.max(8, Math.min(maxX, parsed.x)),
            y: Math.max(8, Math.min(maxY, parsed.y)),
          });
        }
      }
    } catch {
      // ignore JSON parse errors
    }
  }, []);

  // Handle screen resize / orientation changes
  useEffect(() => {
    const handleResize = () => {
      setPosition((prev) => {
        if (!prev) return null;
        const currentEl = cardRef.current || pillRef.current;
        const width = currentEl ? currentEl.offsetWidth : 280;
        const height = currentEl ? currentEl.offsetHeight : 100;
        const maxX = Math.max(8, window.innerWidth - width - 8);
        const maxY = Math.max(8, window.innerHeight - height - 8);
        const clampedX = Math.max(8, Math.min(maxX, prev.x));
        const clampedY = Math.max(8, Math.min(maxY, prev.y));

        if (clampedX !== prev.x || clampedY !== prev.y) {
          return { x: clampedX, y: clampedY };
        }
        return prev;
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Initial visibility timing
  useEffect(() => {
    if (pathname?.startsWith('/surprise/') || pathname?.startsWith('/website-questionnaire')) {
      setVisible(false);
      return;
    }

    const wasDismissed = sessionStorage.getItem('whatsapp_group_card_dismissed');
    if (wasDismissed) {
      setDismissed(true);
      setMinimized(true);
      return;
    }

    const timer = setTimeout(() => {
      setVisible(true);
    }, SHOW_DELAY_MS);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (pathname?.startsWith('/surprise/') || pathname?.startsWith('/website-questionnaire')) return null;

  const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    const target = e.target as HTMLElement;
    if (target.closest('[data-no-drag="true"]')) {
      return;
    }

    const currentEl = e.currentTarget;
    const rect = currentEl.getBoundingClientRect();

    dragDataRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: rect.left,
      origY: rect.top,
      hasMoved: false,
      elementWidth: rect.width,
      elementHeight: rect.height,
    };

    try {
      currentEl.setPointerCapture(e.pointerId);
    } catch {
      // setPointerCapture may fail in rare test environments
    }
    setIsDragging(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!dragDataRef.current) return;
    const { startX, startY, origX, origY, elementWidth, elementHeight } = dragDataRef.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    if (!dragDataRef.current.hasMoved) {
      if (Math.hypot(dx, dy) > 5) {
        dragDataRef.current.hasMoved = true;
        hasDraggedRecentlyRef.current = true;
      } else {
        return;
      }
    }

    const margin = 8;
    const maxX = Math.max(margin, window.innerWidth - elementWidth - margin);
    const maxY = Math.max(margin, window.innerHeight - elementHeight - margin);

    const targetX = origX + dx;
    const targetY = origY + dy;

    const clampedX = Math.max(margin, Math.min(maxX, targetX));
    const clampedY = Math.max(margin, Math.min(maxY, targetY));

    setPosition({ x: Math.round(clampedX), y: Math.round(clampedY) });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLElement>) => {
    if (!dragDataRef.current) return;
    const hasMoved = dragDataRef.current.hasMoved;

    try {
      if (e.currentTarget.hasPointerCapture(e.pointerId)) {
        e.currentTarget.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }

    setIsDragging(false);
    dragDataRef.current = null;

    if (hasMoved) {
      hasDraggedRecentlyRef.current = true;
      setPosition((currentPos) => {
        if (currentPos) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(currentPos));
          } catch {
            // ignore
          }
        }
        return currentPos;
      });

      // Keep drag flag active briefly to swallow trailing click event
      setTimeout(() => {
        hasDraggedRecentlyRef.current = false;
      }, 200);
    } else {
      hasDraggedRecentlyRef.current = false;
    }
  };

  const handleDismiss = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setVisible(false);

    setTimeout(() => {
      setDismissed(true);
      setMinimized(true);
      sessionStorage.setItem('whatsapp_group_card_dismissed', '1');
    }, 400);
  };

  const handleExpand = () => {
    // When expanding, make sure the wider card doesn't overflow right screen edge
    setPosition((prev) => {
      if (!prev) return null;
      const cardWidth = 288;
      const maxX = Math.max(8, window.innerWidth - cardWidth - 8);
      if (prev.x > maxX) {
        const clamped = { ...prev, x: maxX };
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(clamped));
        } catch {
          // ignore
        }
        return clamped;
      }
      return prev;
    });

    setMinimized(false);
    setDismissed(false);
    setTimeout(() => setVisible(true), 50);
  };

  // Minimized trigger pill
  if (dismissed && minimized) {
    return (
      <button
        ref={pillRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onClick={(e) => {
          if (hasDraggedRecentlyRef.current) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          handleExpand();
        }}
        style={
          position
            ? {
                left: `${position.x}px`,
                top: `${position.y}px`,
                bottom: 'auto',
                right: 'auto',
              }
            : undefined
        }
        className={`fixed z-[95] flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full shadow-2xl border border-emerald-400/40 select-none touch-none ${
          !position ? 'bottom-40 right-4 sm:right-6' : ''
        } ${
          isDragging
            ? 'cursor-grabbing scale-105 shadow-[0_20px_40px_rgba(0,0,0,0.6)] ring-2 ring-emerald-300 transition-none'
            : 'cursor-grab hover:scale-105 transition-all duration-300'
        }`}
        title="Join Group (Drag anywhere on screen)"
      >
        <GripHorizontal className="w-3.5 h-3.5 text-emerald-200/80 -mr-0.5" />
        <i className="fab fa-whatsapp text-sm text-white" aria-hidden="true" />
        <span className="text-xs font-bold">Join Group</span>
      </button>
    );
  }

  return (
    <div
      ref={cardRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={
        position
          ? {
              left: `${position.x}px`,
              top: `${position.y}px`,
              bottom: 'auto',
              right: 'auto',
              transform: visible ? 'scale(1)' : 'scale(0.95)',
            }
          : undefined
      }
      className={`fixed z-[95] touch-none select-none ${
        !position ? 'bottom-40 right-4 sm:right-6' : ''
      } ${
        isDragging
          ? 'cursor-grabbing transition-none'
          : 'cursor-grab transition-all duration-500 ease-out transform'
      } ${
        visible
          ? 'opacity-100 pointer-events-auto'
          : 'opacity-0 pointer-events-none'
      } ${!position && visible ? 'translate-x-0 scale-100' : ''} ${
        !position && !visible ? 'translate-x-[120%] scale-95' : ''
      }`}
    >
      <div
        className={`relative bg-[#041d11] border-2 border-emerald-500/60 hover:border-emerald-400 rounded-2xl p-4 shadow-[0_15px_35px_rgba(0,0,0,0.8)] text-white backdrop-blur-xl transition-all duration-300 w-64 sm:w-72 ${
          isDragging ? 'shadow-[0_25px_50px_rgba(0,0,0,0.9)] ring-2 ring-emerald-400/60 scale-[1.02]' : ''
        }`}
      >
        {/* Drag Grip Indicator */}
        <div className="flex items-center justify-center -mt-2 pb-2 cursor-grab active:cursor-grabbing">
          <div className="w-10 h-1 rounded-full bg-emerald-400/40 hover:bg-emerald-400/70 transition-colors" />
        </div>

        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          onPointerDown={(e) => e.stopPropagation()}
          data-no-drag="true"
          className="absolute top-2.5 right-2.5 w-6 h-6 rounded-full bg-black/40 hover:bg-black text-gray-300 hover:text-white flex items-center justify-center transition-all z-10"
          title="Close"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {/* Card Content & Action */}
        <a
          href={WHATSAPP_GROUP_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => {
            if (hasDraggedRecentlyRef.current) {
              e.preventDefault();
              e.stopPropagation();
            }
          }}
          className="flex items-center gap-3 group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
            <i className="fab fa-whatsapp text-xl text-white" aria-hidden="true" />
          </div>

          <div className="flex-1 pr-4">
            <h4 className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors leading-snug">
              Join Group
            </h4>
            <span className="text-[11px] font-semibold text-emerald-400 flex items-center gap-1 mt-0.5">
              Click to join <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </a>
      </div>
    </div>
  );
}
