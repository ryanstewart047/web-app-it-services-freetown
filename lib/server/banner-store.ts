import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';

export interface BannerSettings {
  enabled: boolean;
  message: string;
  link?: string | null;
  buttonText?: string | null;
  color: string;
  lastUpdated: string;
}

export interface SavedAnnouncement {
  id: string;
  title?: string;
  message: string;
  link?: string | null;
  buttonText?: string | null;
  color: string;
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_BANNER: BannerSettings = {
  enabled: false,
  message: 'Welcome to BridgeTech IT Services!',
  link: '',
  buttonText: 'Learn More',
  color: 'bg-red-600',
  lastUpdated: new Date().toISOString(),
};

const DEFAULT_SAVED_ANNOUNCEMENTS: SavedAnnouncement[] = [
  {
    id: 'announcement-default-1',
    title: 'General Welcome',
    message: 'Welcome to BridgeTech IT Services — Sierra Leone\'s #1 Trusted Tech Repair & Digital Studio!',
    link: '/repair-showcase',
    buttonText: 'Book Repair',
    color: 'bg-blue-700',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'announcement-default-2',
    title: 'Special Discount Promo',
    message: '🚨 Special Discount: 20% off all iPhone, Samsung & MacBook screen repairs this week!',
    link: '/#book-repair',
    buttonText: 'Claim Deal',
    color: 'bg-red-600',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'announcement-default-3',
    title: '3D Digital Tools Studio',
    message: '🎉 New Feature: Design print-ready 300 DPI business cards, staff ID badges & VIP passes in our 3D Card Studio!',
    link: '/digital-tools',
    buttonText: 'Try Studio Free',
    color: 'bg-purple-600',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function getAnnouncementsStoragePaths(): string[] {
  return [
    path.join(process.cwd(), 'data', 'saved-announcements.json'),
    path.join('/tmp', 'saved-announcements.json'),
  ];
}

function loadAnnouncementsFromFile(): SavedAnnouncement[] | null {
  for (const filePath of getAnnouncementsStoragePaths()) {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
    } catch (_) {}
  }
  return null;
}

function saveAnnouncementsToFile(items: SavedAnnouncement[]): void {
  for (const filePath of getAnnouncementsStoragePaths()) {
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify(items, null, 2), 'utf8');
    } catch (err) {
      console.warn(`[BannerStore] Could not write to ${filePath}:`, err);
    }
  }
}

export async function getSavedAnnouncements(): Promise<SavedAnnouncement[]> {
  const fileData = loadAnnouncementsFromFile();
  if (fileData) {
    return fileData;
  }
  // Initialize default announcements
  saveAnnouncementsToFile(DEFAULT_SAVED_ANNOUNCEMENTS);
  return DEFAULT_SAVED_ANNOUNCEMENTS;
}

export async function saveAnnouncement(input: {
  id?: string;
  title?: string;
  message: string;
  link?: string | null;
  buttonText?: string | null;
  color?: string;
}): Promise<SavedAnnouncement> {
  const items = await getSavedAnnouncements();
  const now = new Date().toISOString();

  if (input.id) {
    // Update existing by ID
    const index = items.findIndex((i) => i.id === input.id);
    if (index !== -1) {
      const existing = items[index];
      const updated: SavedAnnouncement = {
        ...existing,
        title: input.title !== undefined ? input.title.trim() : existing.title,
        message: input.message.trim(),
        link: input.link !== undefined ? (input.link ? input.link.trim() : null) : existing.link,
        buttonText: input.buttonText !== undefined ? (input.buttonText ? input.buttonText.trim() : 'Learn More') : existing.buttonText,
        color: input.color || existing.color,
        updatedAt: now,
      };
      items[index] = updated;
      saveAnnouncementsToFile(items);
      return updated;
    }
  }

  // Check if an announcement with identical message already exists
  const existingIdx = items.findIndex((i) => i.message.trim().toLowerCase() === input.message.trim().toLowerCase());
  if (existingIdx !== -1) {
    const existing = items[existingIdx];
    const updated: SavedAnnouncement = {
      ...existing,
      title: input.title?.trim() || existing.title,
      link: input.link !== undefined ? (input.link ? input.link.trim() : null) : existing.link,
      buttonText: input.buttonText !== undefined ? (input.buttonText ? input.buttonText.trim() : 'Learn More') : existing.buttonText,
      color: input.color || existing.color,
      updatedAt: now,
    };
    items[existingIdx] = updated;
    saveAnnouncementsToFile(items);
    return updated;
  }

  // Create new
  const newId = `announcement-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
  const title = input.title?.trim() || (input.message.trim().length > 35 ? `${input.message.trim().slice(0, 35)}...` : input.message.trim());

  const newAnnouncement: SavedAnnouncement = {
    id: newId,
    title,
    message: input.message.trim(),
    link: input.link ? input.link.trim() : null,
    buttonText: input.buttonText ? input.buttonText.trim() : 'Learn More',
    color: input.color || 'bg-red-600',
    createdAt: now,
    updatedAt: now,
  };

  items.unshift(newAnnouncement);
  saveAnnouncementsToFile(items);
  return newAnnouncement;
}

export async function updateSavedAnnouncement(
  id: string,
  updates: Partial<SavedAnnouncement>
): Promise<SavedAnnouncement | null> {
  const items = await getSavedAnnouncements();
  const index = items.findIndex((i) => i.id === id);
  if (index === -1) return null;

  const existing = items[index];
  const updated: SavedAnnouncement = {
    ...existing,
    ...updates,
    title: updates.title !== undefined ? updates.title?.trim() : existing.title,
    message: updates.message !== undefined ? updates.message.trim() : existing.message,
    link: updates.link !== undefined ? (updates.link ? updates.link.trim() : null) : existing.link,
    buttonText: updates.buttonText !== undefined ? (updates.buttonText ? updates.buttonText.trim() : 'Learn More') : existing.buttonText,
    color: updates.color || existing.color,
    updatedAt: new Date().toISOString(),
  };

  items[index] = updated;
  saveAnnouncementsToFile(items);
  return updated;
}

export async function deleteSavedAnnouncement(id: string): Promise<boolean> {
  const items = await getSavedAnnouncements();
  const filtered = items.filter((i) => i.id !== id);
  if (filtered.length === items.length) {
    return false;
  }
  saveAnnouncementsToFile(filtered);
  return true;
}

export async function getBannerSettings(): Promise<BannerSettings> {
  try {
    const banner = await prisma.bannerSettings.findUnique({
      where: { id: 'active' },
    });

    if (!banner) return DEFAULT_BANNER;

    return {
      enabled: banner.enabled,
      message: banner.message,
      link: banner.link,
      buttonText: (banner as any).buttonText || 'Learn More',
      color: banner.color,
      lastUpdated: banner.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('[BannerStore] Failed to fetch banner settings:', error);
    return DEFAULT_BANNER;
  }
}

export async function updateBannerSettings(settings: Partial<BannerSettings>): Promise<BannerSettings> {
  try {
    const buttonText = settings.buttonText !== undefined ? settings.buttonText : 'Learn More';

    const updated = await prisma.bannerSettings.upsert({
      where: { id: 'active' },
      update: {
        enabled: settings.enabled,
        message: settings.message,
        link: settings.link,
        buttonText: buttonText,
        color: settings.color,
      },
      create: {
        id: 'active',
        enabled: settings.enabled ?? false,
        message: settings.message ?? 'Welcome to BridgeTech IT Services!',
        link: settings.link,
        buttonText: buttonText,
        color: settings.color ?? 'bg-red-600',
      },
    });

    // Auto-save to announcement library if a message is present
    if (settings.message && settings.message.trim().length > 0) {
      try {
        await saveAnnouncement({
          message: settings.message,
          link: settings.link,
          buttonText: buttonText,
          color: settings.color || updated.color,
        });
      } catch (saveErr) {
        console.warn('[BannerStore] Failed to auto-archive announcement message:', saveErr);
      }
    }

    return {
      enabled: updated.enabled,
      message: updated.message,
      link: updated.link,
      buttonText: (updated as any).buttonText || 'Learn More',
      color: updated.color,
      lastUpdated: updated.updatedAt.toISOString(),
    };
  } catch (error) {
    console.error('[BannerStore] Failed to update banner settings:', error);
    throw new Error('Failed to update banner settings');
  }
}

