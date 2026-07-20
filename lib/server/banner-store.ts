import { prisma } from '@/lib/prisma';

export interface BannerSettings {
  enabled: boolean;
  message: string;
  link?: string | null;
  color: string;
  lastUpdated: string;
}

const DEFAULT_BANNER: BannerSettings = {
  enabled: false,
  message: 'Welcome to IT Services Freetown!',
  color: 'bg-red-600',
  lastUpdated: new Date().toISOString()
};

export async function getBannerSettings(): Promise<BannerSettings> {
  try {
    const banner = await prisma.bannerSettings.findUnique({
      where: { id: 'active' }
    });
    
    if (!banner) return DEFAULT_BANNER;
    
    return {
      enabled: banner.enabled,
      message: banner.message,
      link: banner.link,
      color: banner.color,
      lastUpdated: banner.updatedAt.toISOString()
    };
  } catch (error) {
    console.error('[BannerStore] Failed to fetch banner settings:', error);
    return DEFAULT_BANNER;
  }
}

export async function updateBannerSettings(settings: Partial<BannerSettings>): Promise<BannerSettings> {
  try {
    const updated = await prisma.bannerSettings.upsert({
      where: { id: 'active' },
      update: {
        enabled: settings.enabled,
        message: settings.message,
        link: settings.link,
        color: settings.color,
      },
      create: {
        id: 'active',
        enabled: settings.enabled ?? false,
        message: settings.message ?? 'Welcome to IT Services Freetown!',
        link: settings.link,
        color: settings.color ?? 'bg-red-600',
      }
    });
    
    return {
      enabled: updated.enabled,
      message: updated.message,
      link: updated.link,
      color: updated.color,
      lastUpdated: updated.updatedAt.toISOString()
    };
  } catch (error) {
    console.error('[BannerStore] Failed to update banner settings:', error);
    throw new Error('Failed to update banner settings');
  }
}
