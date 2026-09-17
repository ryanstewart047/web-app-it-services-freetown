import fs from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';

export type PartnerColorMode =
  | 'grayscale-hover-color' // Black & White with full color on hover
  | 'black-white'           // Permanent Black & White / Grayscale
  | 'monochrome'            // High contrast crisp monochrome silhouette
  | 'original-color';       // Full original vibrant colors

export interface PartnerItem {
  id: string;
  name: string;
  logoUrl: string;          // Direct URL or data:image/... base64
  websiteUrl?: string;      // Optional external destination URL
  colorMode?: PartnerColorMode; // Optional per-logo override
  active: boolean;          // Visibility toggle
  order: number;            // Sequencing index
  createdAt: string;
  updatedAt: string;
}

export interface PartnersSectionSettings {
  enabled: boolean;
  title: string;
  subtitle?: string;
  colorMode: PartnerColorMode;
  layout: 'grid' | 'marquee';
  backgroundStyle: 'light' | 'gray' | 'dark' | 'transparent';
  updatedAt: string;
}

export interface PartnersData {
  settings: PartnersSectionSettings;
  partners: PartnerItem[];
}

export const DEFAULT_PARTNERS_SETTINGS: PartnersSectionSettings = {
  enabled: true,
  title: 'Trusted Brands & Technology Partners',
  subtitle: 'We service, support, and collaborate with leading global technology brands',
  colorMode: 'grayscale-hover-color',
  layout: 'grid',
  backgroundStyle: 'light',
  updatedAt: new Date().toISOString(),
};

export const INITIAL_DEFAULT_PARTNERS: PartnerItem[] = [
  {
    id: 'partner-apple',
    name: 'Apple',
    logoUrl: '/images/brands/iphone.png',
    websiteUrl: 'https://www.apple.com',
    active: true,
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'partner-samsung',
    name: 'Samsung',
    logoUrl: '/images/brands/samsung.png',
    websiteUrl: 'https://www.samsung.com',
    active: true,
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'partner-huawei',
    name: 'Huawei',
    logoUrl: '/images/brands/huawei.png',
    websiteUrl: 'https://consumer.huawei.com',
    active: true,
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'partner-xiaomi',
    name: 'Xiaomi / Redmi',
    logoUrl: '/images/brands/redmi.png',
    websiteUrl: 'https://www.mi.com',
    active: true,
    order: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'partner-oppo',
    name: 'OPPO',
    logoUrl: '/images/brands/oppo.png',
    websiteUrl: 'https://www.oppo.com',
    active: true,
    order: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'partner-motorola',
    name: 'Motorola',
    logoUrl: '/images/brands/motorola.png',
    websiteUrl: 'https://www.motorola.com',
    active: true,
    order: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

function getFilePaths(): string[] {
  return [
    path.join(process.cwd(), 'data', 'partners.json'),
    path.join('/tmp', 'partners.json'),
  ];
}

export function loadPartnersFromFile(): PartnersData {
  for (const filePath of getFilePaths()) {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return {
            settings: {
              ...DEFAULT_PARTNERS_SETTINGS,
              ...(parsed.settings || {}),
            },
            partners: Array.isArray(parsed.partners) ? parsed.partners : INITIAL_DEFAULT_PARTNERS,
          };
        }
      }
    } catch (_) {}
  }

  return {
    settings: { ...DEFAULT_PARTNERS_SETTINGS },
    partners: [...INITIAL_DEFAULT_PARTNERS],
  };
}

export function savePartnersToFile(data: PartnersData): void {
  for (const filePath of getFilePaths()) {
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    } catch (_) {}
  }
}

/**
 * Fetch all partners data (settings + list)
 */
export async function getPartnersData(): Promise<PartnersData> {
  const fileData = loadPartnersFromFile();
  
  const sortedPartners = [...fileData.partners].sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return {
    settings: fileData.settings,
    partners: sortedPartners,
  };
}

/**
 * Public function to get only active partners and current settings
 */
export async function getPublicPartnersData(): Promise<{
  settings: PartnersSectionSettings;
  partners: PartnerItem[];
}> {
  const data = await getPartnersData();
  return {
    settings: data.settings,
    partners: data.partners.filter((p) => p.active),
  };
}

/**
 * Update global section settings
 */
export async function updatePartnersSettings(
  settings: Partial<PartnersSectionSettings>
): Promise<PartnersSectionSettings> {
  const current = await getPartnersData();
  const updatedSettings: PartnersSectionSettings = {
    ...current.settings,
    ...settings,
    updatedAt: new Date().toISOString(),
  };

  const updatedData: PartnersData = {
    settings: updatedSettings,
    partners: current.partners,
  };

  savePartnersToFile(updatedData);
  return updatedSettings;
}

/**
 * Add a new partner
 */
export async function addPartner(item: {
  name: string;
  logoUrl: string;
  websiteUrl?: string;
  colorMode?: PartnerColorMode;
  active?: boolean;
}): Promise<PartnerItem> {
  const current = await getPartnersData();
  const highestOrder = current.partners.reduce((max, p) => Math.max(max, p.order), -1);
  const now = new Date().toISOString();

  const newPartner: PartnerItem = {
    id: `partner-${randomUUID()}`,
    name: item.name.trim(),
    logoUrl: item.logoUrl.trim(),
    websiteUrl: item.websiteUrl ? item.websiteUrl.trim() : '',
    colorMode: item.colorMode,
    active: item.active !== false,
    order: highestOrder + 1,
    createdAt: now,
    updatedAt: now,
  };

  const updatedPartners = [...current.partners, newPartner];
  savePartnersToFile({
    settings: current.settings,
    partners: updatedPartners,
  });

  return newPartner;
}

/**
 * Update an existing partner
 */
export async function updatePartner(
  id: string,
  updates: Partial<Omit<PartnerItem, 'id' | 'createdAt'>>
): Promise<PartnerItem | null> {
  const current = await getPartnersData();
  const partnerIndex = current.partners.findIndex((p) => p.id === id);

  if (partnerIndex === -1) {
    return null;
  }

  const existing = current.partners[partnerIndex];
  const updated: PartnerItem = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  current.partners[partnerIndex] = updated;
  savePartnersToFile(current);

  return updated;
}

/**
 * Delete a partner by id
 */
export async function deletePartner(id: string): Promise<boolean> {
  const current = await getPartnersData();
  const filtered = current.partners.filter((p) => p.id !== id);

  if (filtered.length === current.partners.length) {
    return false;
  }

  savePartnersToFile({
    settings: current.settings,
    partners: filtered,
  });

  return true;
}

/**
 * Reorder partners
 */
export async function reorderPartners(orderedIds: string[]): Promise<PartnerItem[]> {
  const current = await getPartnersData();
  const partnerMap = new Map(current.partners.map((p) => [p.id, p]));

  const reordered: PartnerItem[] = [];
  orderedIds.forEach((id, index) => {
    const partner = partnerMap.get(id);
    if (partner) {
      reordered.push({
        ...partner,
        order: index,
        updatedAt: new Date().toISOString(),
      });
      partnerMap.delete(id);
    }
  });

  // Append any remaining items
  partnerMap.forEach((partner) => {
    reordered.push({
      ...partner,
      order: reordered.length,
    });
  });

  savePartnersToFile({
    settings: current.settings,
    partners: reordered,
  });

  return reordered;
}
