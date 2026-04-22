import fs from 'fs/promises';
import path from 'path';

export interface BannerSettings {
  enabled: boolean;
  message: string;
  link?: string;
  color: string;
  lastUpdated: string;
}

const DEFAULT_BANNER: BannerSettings = {
  enabled: false,
  message: 'Welcome to IT Services Freetown!',
  color: 'bg-red-600',
  lastUpdated: new Date().toISOString()
};

const DATA_FILE_PATH = process.env.APP_DATA_FILE
  ? path.resolve(process.cwd(), path.dirname(process.env.APP_DATA_FILE), 'banner-settings.json')
  : path.resolve(process.cwd(), 'data/banner-settings.json');

export async function getBannerSettings(): Promise<BannerSettings> {
  try {
    const dir = path.dirname(DATA_FILE_PATH);
    await fs.mkdir(dir, { recursive: true });
    
    const content = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    const parsed = JSON.parse(content);
    return { ...DEFAULT_BANNER, ...parsed };
  } catch {
    return DEFAULT_BANNER;
  }
}

export async function updateBannerSettings(settings: Partial<BannerSettings>): Promise<BannerSettings> {
  try {
    const current = await getBannerSettings();
    const updated: BannerSettings = {
      ...current,
      ...settings,
      lastUpdated: new Date().toISOString()
    };

    const dir = path.dirname(DATA_FILE_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(updated, null, 2), 'utf-8');
    
    return updated;
  } catch (error) {
    console.error('[BannerStore] Failed to write banner settings:', error);
    throw new Error('Failed to update banner settings');
  }
}
