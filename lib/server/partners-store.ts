import { prisma } from '@/lib/prisma';

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
    logoUrl: '/images/brands/apple.svg',
    websiteUrl: 'https://www.apple.com',
    active: true,
    order: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'partner-samsung',
    name: 'Samsung',
    logoUrl: '/images/brands/samsung.svg',
    websiteUrl: 'https://www.samsung.com',
    active: true,
    order: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'partner-huawei',
    name: 'Huawei',
    logoUrl: '/images/brands/huawei.svg',
    websiteUrl: 'https://consumer.huawei.com',
    active: true,
    order: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'partner-xiaomi',
    name: 'Xiaomi / Redmi',
    logoUrl: '/images/brands/xiaomi.svg',
    websiteUrl: 'https://www.mi.com',
    active: true,
    order: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'partner-oppo',
    name: 'OPPO',
    logoUrl: '/images/brands/oppo.svg',
    websiteUrl: 'https://www.oppo.com',
    active: true,
    order: 4,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'partner-motorola',
    name: 'Motorola',
    logoUrl: '/images/brands/motorola.svg',
    websiteUrl: 'https://www.motorola.com',
    active: true,
    order: 5,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Helper: map Prisma DB record → PartnerItem
// ─────────────────────────────────────────────────────────────────────────────
function mapDbPartner(p: {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl?: string | null;
  colorMode?: string | null;
  active: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}): PartnerItem {
  return {
    id: p.id,
    name: p.name,
    logoUrl: p.logoUrl,
    websiteUrl: p.websiteUrl ?? undefined,
    colorMode: (p.colorMode as PartnerColorMode) ?? undefined,
    active: p.active,
    order: p.order,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: map Prisma DB record → PartnersSectionSettings
// ─────────────────────────────────────────────────────────────────────────────
function mapDbSettings(s: {
  id: string;
  enabled: boolean;
  title: string;
  subtitle?: string | null;
  colorMode: string;
  layout: string;
  backgroundStyle: string;
  updatedAt: Date;
}): PartnersSectionSettings {
  return {
    enabled: s.enabled,
    title: s.title,
    subtitle: s.subtitle ?? undefined,
    colorMode: s.colorMode as PartnerColorMode,
    layout: s.layout as 'grid' | 'marquee',
    backgroundStyle: s.backgroundStyle as 'light' | 'gray' | 'dark' | 'transparent',
    updatedAt: s.updatedAt.toISOString(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Ensure default partners are seeded once when DB is empty
// ─────────────────────────────────────────────────────────────────────────────
async function seedDefaultsIfEmpty(): Promise<void> {
  const count = await prisma.partnerLogo.count();
  if (count === 0) {
    await prisma.partnerLogo.createMany({
      data: INITIAL_DEFAULT_PARTNERS.map((p) => ({
        id: p.id,
        name: p.name,
        logoUrl: p.logoUrl,
        websiteUrl: p.websiteUrl,
        colorMode: p.colorMode ?? null,
        active: p.active,
        order: p.order,
      })),
      skipDuplicates: true,
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Fetch all partners data (settings + list)
// ─────────────────────────────────────────────────────────────────────────────
export async function getPartnersData(): Promise<PartnersData> {
  try {
    await seedDefaultsIfEmpty();

    const [dbSettings, dbPartners] = await Promise.all([
      prisma.partnersSectionSettings.findUnique({ where: { id: 'active' } }),
      prisma.partnerLogo.findMany({ orderBy: [{ order: 'asc' }, { createdAt: 'asc' }] }),
    ]);

    const settings: PartnersSectionSettings = dbSettings
      ? mapDbSettings(dbSettings)
      : { ...DEFAULT_PARTNERS_SETTINGS };

    return {
      settings,
      partners: dbPartners.map(mapDbPartner),
    };
  } catch (error) {
    console.error('[PartnersStore] getPartnersData error:', error);
    return {
      settings: { ...DEFAULT_PARTNERS_SETTINGS },
      partners: [...INITIAL_DEFAULT_PARTNERS],
    };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Public function: only active partners + settings
// ─────────────────────────────────────────────────────────────────────────────
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

// ─────────────────────────────────────────────────────────────────────────────
// Update global section settings (including enabled toggle)
// ─────────────────────────────────────────────────────────────────────────────
export async function updatePartnersSettings(
  updates: Partial<PartnersSectionSettings>
): Promise<PartnersSectionSettings> {
  const updated = await prisma.partnersSectionSettings.upsert({
    where: { id: 'active' },
    update: {
      ...(updates.enabled !== undefined && { enabled: updates.enabled }),
      ...(updates.title !== undefined && { title: updates.title }),
      ...(updates.subtitle !== undefined && { subtitle: updates.subtitle }),
      ...(updates.colorMode !== undefined && { colorMode: updates.colorMode }),
      ...(updates.layout !== undefined && { layout: updates.layout }),
      ...(updates.backgroundStyle !== undefined && { backgroundStyle: updates.backgroundStyle }),
    },
    create: {
      id: 'active',
      enabled: updates.enabled ?? DEFAULT_PARTNERS_SETTINGS.enabled,
      title: updates.title ?? DEFAULT_PARTNERS_SETTINGS.title,
      subtitle: updates.subtitle ?? DEFAULT_PARTNERS_SETTINGS.subtitle,
      colorMode: updates.colorMode ?? DEFAULT_PARTNERS_SETTINGS.colorMode,
      layout: updates.layout ?? DEFAULT_PARTNERS_SETTINGS.layout,
      backgroundStyle: updates.backgroundStyle ?? DEFAULT_PARTNERS_SETTINGS.backgroundStyle,
    },
  });
  return mapDbSettings(updated);
}

// ─────────────────────────────────────────────────────────────────────────────
// Add a new partner logo
// ─────────────────────────────────────────────────────────────────────────────
export async function addPartner(item: {
  name: string;
  logoUrl: string;
  websiteUrl?: string;
  colorMode?: PartnerColorMode;
  active?: boolean;
}): Promise<PartnerItem> {
  const highest = await prisma.partnerLogo.aggregate({ _max: { order: true } });
  const nextOrder = (highest._max.order ?? -1) + 1;

  const created = await prisma.partnerLogo.create({
    data: {
      name: item.name.trim(),
      logoUrl: item.logoUrl.trim(),
      websiteUrl: item.websiteUrl?.trim() || null,
      colorMode: item.colorMode ?? null,
      active: item.active !== false,
      order: nextOrder,
    },
  });
  return mapDbPartner(created);
}

// ─────────────────────────────────────────────────────────────────────────────
// Update an existing partner logo (including active toggle)
// ─────────────────────────────────────────────────────────────────────────────
export async function updatePartner(
  id: string,
  updates: Partial<Omit<PartnerItem, 'id' | 'createdAt'>>
): Promise<PartnerItem | null> {
  try {
    const updated = await prisma.partnerLogo.update({
      where: { id },
      data: {
        ...(updates.name !== undefined && { name: updates.name }),
        ...(updates.logoUrl !== undefined && { logoUrl: updates.logoUrl }),
        ...(updates.websiteUrl !== undefined && { websiteUrl: updates.websiteUrl || null }),
        ...(updates.colorMode !== undefined && { colorMode: updates.colorMode ?? null }),
        ...(updates.active !== undefined && { active: updates.active }),
        ...(updates.order !== undefined && { order: updates.order }),
      },
    });
    return mapDbPartner(updated);
  } catch (error: any) {
    if (error?.code === 'P2025') return null; // Record not found
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Delete a partner logo
// ─────────────────────────────────────────────────────────────────────────────
export async function deletePartner(id: string): Promise<boolean> {
  try {
    await prisma.partnerLogo.delete({ where: { id } });
    return true;
  } catch (error: any) {
    if (error?.code === 'P2025') return false;
    throw error;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Reorder partners by providing an ordered list of IDs
// ─────────────────────────────────────────────────────────────────────────────
export async function reorderPartners(orderedIds: string[]): Promise<PartnerItem[]> {
  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.partnerLogo.update({
        where: { id },
        data: { order: index },
      })
    )
  );

  const reordered = await prisma.partnerLogo.findMany({
    orderBy: [{ order: 'asc' }, { createdAt: 'asc' }],
  });
  return reordered.map(mapDbPartner);
}

