/**
 * Client-Side Browser Notifications & Chime Helper
 * Supports native Web Notifications API, Service Worker Push, and Web Audio API Chime
 */

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export async function requestBrowserNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return Notification.permission;
  }
}

/**
 * Plays a pleasant, two-tone notification chime using Web Audio API (D5 -> A5)
 * Completely zero-dependency and works without any external mp3/wav files.
 */
export function playNotificationSound(): void {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // First note: D5 (587.33 Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, now);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Second note: A5 (880.00 Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880.0, now + 0.12);
    gain2.gain.setValueAtTime(0.18, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.55);
  } catch (_) {
    // Audio context may be blocked by autoplay policies until user interaction
  }
}

export interface ShowNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  url?: string;
  tag?: string;
  silent?: boolean;
}

/**
 * Triggers a native system/browser notification and optional sound chime
 */
export async function showBrowserNotification(options: ShowNotificationOptions): Promise<boolean> {
  if (!isNotificationSupported()) return false;

  if (!options.silent) {
    playNotificationSound();
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  const icon = options.icon || '/favicon.ico';
  const badge = options.badge || '/favicon.svg';
  const tag = options.tag || 'bridgetech-notification-' + Date.now();
  const url = options.url || (typeof window !== 'undefined' ? window.location.href : '/');

  try {
    // If Service Worker is registered, use registration.showNotification for background support
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && reg.showNotification) {
        await reg.showNotification(options.title, {
          body: options.body,
          icon,
          badge,
          tag,
          data: { url },
          vibrate: [100, 50, 100],
        } as any);
        return true;
      }
    }

    // Fallback to standard window Notification constructor
    const notification = new Notification(options.title, {
      body: options.body,
      icon,
      tag,
    });

    notification.onclick = () => {
      window.focus();
      if (options.url) {
        window.location.href = options.url;
      }
      notification.close();
    };

    return true;
  } catch (err) {
    console.error('Failed to display browser notification:', err);
    return false;
  }
}
