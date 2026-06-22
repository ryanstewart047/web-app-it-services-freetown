import { prisma } from '@/lib/prisma';

const db = prisma as any;

const DEFAULT_TOPICS = [
  '5 signs your laptop needs a professional service',
  'How to protect your phone charging port from damage',
  'Why same-day diagnostics can save repair costs',
  'Simple ways to keep your computer running faster',
  'When to repair a phone screen before the damage spreads',
  'How to keep your files safer before a device repair',
];

const DEFAULT_PHOTO_URLS = [
  'https://www.itservicesfreetown.com/assets/images/iphone-repair.jpg',
  'https://www.itservicesfreetown.com/assets/images/slider001.jpg',
  'https://www.itservicesfreetown.com/assets/images/slide01.jpg',
  'https://www.itservicesfreetown.com/assets/images/slide02.jpg',
];

const DEFAULT_HASHTAGS = [
  'ITServicesFreetown',
  'FreetownTech',
  'PhoneRepair',
  'ComputerRepair',
  'SierraLeone',
];

const DEFAULT_TEMPLATE =
  '{topic}\n\nNeed help with a phone, laptop, or computer in Freetown? Book a diagnostic with IT Services Freetown today.\n\n{link}\n\n{hashtags}';

const DEFAULT_LINK = 'https://www.itservicesfreetown.com/book-appointment';

export interface FacebookAutoPostSettingsDto {
  enabled: boolean;
  intervalHours: number;
  messageTemplate: string;
  linkUrl: string;
  topics: string[];
  photoUrls: string[];
  hashtags: string[];
  lastPostAt: string | null;
  nextPostAfter: string | null;
  updatedAt: string | null;
}

export interface FacebookAutoPostConfigStatus {
  hasPageId: boolean;
  hasAccessToken: boolean;
  graphVersion: string;
  ready: boolean;
}

export interface FacebookAutoPostLogDto {
  id: string;
  status: string;
  triggeredBy: string;
  topic: string | null;
  message: string | null;
  photoUrl: string | null;
  facebookPostId: string | null;
  facebookPhotoId: string | null;
  error: string | null;
  createdAt: string;
}

function clampNumber(value: unknown, min: number, max: number, fallback: number): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.round(parsed)));
}

function asStringList(value: unknown, fallback: string[]): string[] {
  const rawValues = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(/\r?\n/)
      : fallback;

  const cleaned = rawValues
    .map(item => String(item || '').trim())
    .filter(Boolean)
    .slice(0, 50);

  return cleaned.length > 0 ? cleaned : fallback;
}

function normalizeHashtags(value: unknown): string[] {
  return asStringList(value, DEFAULT_HASHTAGS).map(tag =>
    tag.replace(/^#+/, '').replace(/\s+/g, '').slice(0, 40)
  ).filter(Boolean);
}

function randomItem(values: string[]): string {
  return values[Math.floor(Math.random() * values.length)];
}

function normalizeLinkUrl(value: unknown): string {
  const raw = String(value || '').trim();
  if (!raw) {
    return DEFAULT_LINK;
  }

  try {
    const url = new URL(raw);
    return ['http:', 'https:'].includes(url.protocol) ? url.href : DEFAULT_LINK;
  } catch {
    return DEFAULT_LINK;
  }
}

function serializeSettings(settings?: any): FacebookAutoPostSettingsDto {
  return {
    enabled: Boolean(settings?.enabled ?? false),
    intervalHours: clampNumber(settings?.intervalHours, 1, 168, 24),
    messageTemplate: String(settings?.messageTemplate || DEFAULT_TEMPLATE).slice(0, 2000),
    linkUrl: normalizeLinkUrl(settings?.linkUrl),
    topics: asStringList(settings?.topics, DEFAULT_TOPICS),
    photoUrls: asStringList(settings?.photoUrls, DEFAULT_PHOTO_URLS),
    hashtags: normalizeHashtags(settings?.hashtags),
    lastPostAt: settings?.lastPostAt ? settings.lastPostAt.toISOString() : null,
    nextPostAfter: settings?.nextPostAfter ? settings.nextPostAfter.toISOString() : null,
    updatedAt: settings?.updatedAt ? settings.updatedAt.toISOString() : null,
  };
}

function serializeLog(log: any): FacebookAutoPostLogDto {
  return {
    id: log.id,
    status: log.status,
    triggeredBy: log.triggeredBy,
    topic: log.topic,
    message: log.message,
    photoUrl: log.photoUrl,
    facebookPostId: log.facebookPostId,
    facebookPhotoId: log.facebookPhotoId,
    error: log.error,
    createdAt: log.createdAt.toISOString(),
  };
}

export function getFacebookConfigStatus(): FacebookAutoPostConfigStatus {
  const hasPageId = Boolean(process.env.FACEBOOK_PAGE_ID);
  const hasAccessToken = Boolean(process.env.FACEBOOK_PAGE_ACCESS_TOKEN);
  const graphVersion = process.env.FACEBOOK_GRAPH_API_VERSION || 'v23.0';

  return {
    hasPageId,
    hasAccessToken,
    graphVersion,
    ready: hasPageId && hasAccessToken,
  };
}

export async function getFacebookAutoPostDashboard() {
  const [settings, logs] = await Promise.all([
    db.facebookAutoPostSettings.findUnique({ where: { id: 'active' } }),
    db.facebookAutoPostLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 12,
    }),
  ]);

  return {
    settings: serializeSettings(settings),
    config: getFacebookConfigStatus(),
    logs: logs.map(serializeLog),
  };
}

export async function updateFacebookAutoPostSettings(input: Partial<FacebookAutoPostSettingsDto>) {
  const intervalHours = clampNumber(input.intervalHours, 1, 168, 24);
  const topics = asStringList(input.topics, DEFAULT_TOPICS);
  const photoUrls = asStringList(input.photoUrls, DEFAULT_PHOTO_URLS);
  const hashtags = normalizeHashtags(input.hashtags);
  const messageTemplate = String(input.messageTemplate || DEFAULT_TEMPLATE).slice(0, 2000);
  const linkUrl = normalizeLinkUrl(input.linkUrl);

  const current = await db.facebookAutoPostSettings.findUnique({ where: { id: 'active' } });
  const nextPostAfter = current?.lastPostAt
    ? new Date(current.lastPostAt.getTime() + intervalHours * 60 * 60 * 1000)
    : current?.nextPostAfter || null;

  const settings = await db.facebookAutoPostSettings.upsert({
    where: { id: 'active' },
    update: {
      enabled: Boolean(input.enabled),
      intervalHours,
      messageTemplate,
      linkUrl,
      topics,
      photoUrls,
      hashtags,
      nextPostAfter,
    },
    create: {
      id: 'active',
      enabled: Boolean(input.enabled),
      intervalHours,
      messageTemplate,
      linkUrl,
      topics,
      photoUrls,
      hashtags,
    },
  });

  return serializeSettings(settings);
}

function buildMessage(settings: FacebookAutoPostSettingsDto, topic: string): string {
  const hashtags = settings.hashtags.map(tag => `#${tag}`).join(' ');
  const message = settings.messageTemplate
    .split('{topic}').join(topic)
    .split('{link}').join(settings.linkUrl)
    .split('{hashtags}').join(hashtags)
    .trim();

  return message.slice(0, 5000);
}

async function publishPhotoToFacebook(message: string, photoUrl: string) {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  const graphVersion = process.env.FACEBOOK_GRAPH_API_VERSION || 'v23.0';

  if (!pageId || !accessToken) {
    throw new Error('Facebook page ID or page access token is not configured');
  }

  const endpoint = `https://graph.facebook.com/${graphVersion}/${encodeURIComponent(pageId)}/photos`;
  const body = new URLSearchParams({
    access_token: accessToken,
    url: photoUrl,
    caption: message,
    published: 'true',
  });

  const response = await fetch(endpoint, {
    method: 'POST',
    body,
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok || data.error) {
    const details = [
      data?.error?.message || `Facebook API returned ${response.status}`,
      data?.error?.type ? `type: ${data.error.type}` : '',
      data?.error?.code ? `code: ${data.error.code}` : '',
      data?.error?.error_subcode ? `subcode: ${data.error.error_subcode}` : '',
      data?.error?.fbtrace_id ? `trace: ${data.error.fbtrace_id}` : '',
    ].filter(Boolean);
    const message = details.join(' | ');
    throw new Error(message);
  }

  return {
    facebookPhotoId: data.id ? String(data.id) : null,
    facebookPostId: data.post_id ? String(data.post_id) : null,
  };
}

export async function runFacebookAutoPost(options: { force?: boolean; triggeredBy?: string } = {}) {
  const { force = false, triggeredBy = 'cron' } = options;
  const dashboard = await getFacebookAutoPostDashboard();
  const settings = dashboard.settings;
  const now = new Date();

  if (!settings.enabled && !force) {
    return {
      status: 'skipped',
      reason: 'Facebook auto posting is disabled',
      settings,
      config: dashboard.config,
    };
  }

  if (!dashboard.config.ready) {
    const error = 'Facebook environment variables are not configured';
    const log = await db.facebookAutoPostLog.create({
      data: {
        status: 'error',
        triggeredBy,
        error,
      },
    });

    return {
      status: 'error',
      error,
      log: serializeLog(log),
      settings,
      config: dashboard.config,
    };
  }

  if (!force && settings.nextPostAfter && now < new Date(settings.nextPostAfter)) {
    return {
      status: 'skipped',
      reason: 'Next scheduled post time has not arrived',
      settings,
      config: dashboard.config,
    };
  }

  const topic = randomItem(settings.topics);
  const photoUrl = randomItem(settings.photoUrls);
  const message = buildMessage(settings, topic);

  try {
    const result = await publishPhotoToFacebook(message, photoUrl);
    const nextPostAfter = new Date(now.getTime() + settings.intervalHours * 60 * 60 * 1000);

    const [updatedSettings, log] = await Promise.all([
      db.facebookAutoPostSettings.upsert({
        where: { id: 'active' },
        update: {
          lastPostAt: now,
          nextPostAfter,
        },
        create: {
          id: 'active',
          enabled: settings.enabled,
          intervalHours: settings.intervalHours,
          messageTemplate: settings.messageTemplate,
          linkUrl: settings.linkUrl,
          topics: settings.topics,
          photoUrls: settings.photoUrls,
          hashtags: settings.hashtags,
          lastPostAt: now,
          nextPostAfter,
        },
      }),
      db.facebookAutoPostLog.create({
        data: {
          status: 'success',
          triggeredBy,
          topic,
          message,
          photoUrl,
          facebookPhotoId: result.facebookPhotoId,
          facebookPostId: result.facebookPostId,
        },
      }),
    ]);

    return {
      status: 'success',
      log: serializeLog(log),
      settings: serializeSettings(updatedSettings),
      config: dashboard.config,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown Facebook posting error';
    console.error('[FacebookAutoPost] Publish failed:', errorMessage);
    const log = await db.facebookAutoPostLog.create({
      data: {
        status: 'error',
        triggeredBy,
        topic,
        message,
        photoUrl,
        error: errorMessage.slice(0, 1000),
      },
    });

    return {
      status: 'error',
      error: errorMessage,
      log: serializeLog(log),
      settings,
      config: dashboard.config,
    };
  }
}
