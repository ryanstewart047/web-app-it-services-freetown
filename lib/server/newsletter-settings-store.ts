import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';

export interface NewsletterPopupSettings {
  id: string;
  enabled: boolean;
  delaySeconds: number;
  headline: string;
  bodyText: string;
  buttonText: string;
  updatedAt?: string;
}

export const DEFAULT_NEWSLETTER_SETTINGS: NewsletterPopupSettings = {
  id: 'active',
  enabled: true,
  delaySeconds: 8,
  headline: 'Stay in the Loop',
  bodyText:
    'Join thousands of Freetown residents getting weekly computer and mobile repair tips, exclusive service updates, and special offers delivered right to your inbox.',
  buttonText: 'Subscribe Now',
};

// In-memory cache
let cachedSettings: NewsletterPopupSettings = { ...DEFAULT_NEWSLETTER_SETTINGS };
let hasLoadedFromFile = false;

function getStoragePaths(): string[] {
  return [
    path.join(process.cwd(), 'data', 'newsletter-popup-settings.json'),
    path.join('/tmp', 'newsletter-popup-settings.json'),
  ];
}

function loadFromFileFallback(): NewsletterPopupSettings | null {
  for (const filePath of getStoragePaths()) {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return {
            ...DEFAULT_NEWSLETTER_SETTINGS,
            ...parsed,
          };
        }
      }
    } catch (_) {}
  }
  return null;
}

function saveToFileFallback(settings: NewsletterPopupSettings): void {
  for (const filePath of getStoragePaths()) {
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify(settings, null, 2), 'utf8');
    } catch (_) {}
  }
}

/**
 * Get newsletter popup settings with DB -> File -> Memory fallback
 */
export async function getNewsletterPopupSettings(): Promise<NewsletterPopupSettings> {
  // 1. Try Prisma DB
  try {
    const dbSettings = await prisma.newsletterSettings.findUnique({
      where: { id: 'active' },
    });

    if (dbSettings) {
      cachedSettings = {
        id: dbSettings.id,
        enabled: dbSettings.enabled,
        delaySeconds: dbSettings.delaySeconds,
        headline: dbSettings.headline,
        bodyText: dbSettings.bodyText,
        buttonText: dbSettings.buttonText,
        updatedAt: dbSettings.updatedAt.toISOString(),
      };
      saveToFileFallback(cachedSettings);
      return cachedSettings;
    }
  } catch (dbError) {
    console.warn('[NewsletterSettingsStore] DB read failed or table missing, using fallback:', (dbError as any)?.message || dbError);
  }

  // 2. Try File Fallback
  if (!hasLoadedFromFile) {
    const fileSettings = loadFromFileFallback();
    if (fileSettings) {
      cachedSettings = fileSettings;
      hasLoadedFromFile = true;
      return cachedSettings;
    }
    hasLoadedFromFile = true;
  }

  return cachedSettings;
}

/**
 * Save newsletter popup settings with DB -> File + Memory update
 */
export async function updateNewsletterPopupSettings(
  input: Partial<NewsletterPopupSettings>
): Promise<NewsletterPopupSettings> {
  const updated: NewsletterPopupSettings = {
    id: 'active',
    enabled: typeof input.enabled === 'boolean' ? input.enabled : cachedSettings.enabled,
    delaySeconds: typeof input.delaySeconds === 'number' ? Math.max(0, input.delaySeconds) : cachedSettings.delaySeconds,
    headline: String(input.headline || cachedSettings.headline || DEFAULT_NEWSLETTER_SETTINGS.headline).slice(0, 100),
    bodyText: String(input.bodyText || cachedSettings.bodyText || DEFAULT_NEWSLETTER_SETTINGS.bodyText).slice(0, 500),
    buttonText: String(input.buttonText || cachedSettings.buttonText || DEFAULT_NEWSLETTER_SETTINGS.buttonText).slice(0, 60),
    updatedAt: new Date().toISOString(),
  };

  // Always update memory and file fallback immediately
  cachedSettings = updated;
  saveToFileFallback(updated);

  // Try Prisma DB persistence
  try {
    const dbResult = await prisma.newsletterSettings.upsert({
      where: { id: 'active' },
      update: {
        enabled: updated.enabled,
        delaySeconds: updated.delaySeconds,
        headline: updated.headline,
        bodyText: updated.bodyText,
        buttonText: updated.buttonText,
      },
      create: {
        id: 'active',
        enabled: updated.enabled,
        delaySeconds: updated.delaySeconds,
        headline: updated.headline,
        bodyText: updated.bodyText,
        buttonText: updated.buttonText,
      },
    });

    if (dbResult) {
      cachedSettings.updatedAt = dbResult.updatedAt.toISOString();
    }
  } catch (dbError) {
    console.warn('[NewsletterSettingsStore] DB upsert failed, saved to persistent fallback:', (dbError as any)?.message || dbError);
  }

  return cachedSettings;
}
