import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';

export interface ShortUrlMetadata {
  title?: string;
  description?: string;
  price?: string;
  tag?: string;
  image?: string;
  theme?: string;
  fit?: string;
  scale?: number;
  positionX?: number;
  positionY?: number;
  layout?: string;
  previewType?: string;
}

export interface ShortUrlRecord {
  url: string;
  metadata?: ShortUrlMetadata;
}

export type ShortUrlMap = Record<string, string | ShortUrlRecord>;

const GITHUB_TOKEN =
  process.env.SOCIAL_SHARE_GITHUB_TOKEN ||
  process.env.ITS_GITHUB_TOKEN ||
  process.env.NEXT_PUBLIC_GITHUB_TOKEN ||
  process.env.GITHUB_TOKEN ||
  '';

const GITHUB_OWNER = process.env.SOCIAL_SHARE_GITHUB_OWNER || 'ryanstewart047';
const GITHUB_REPO = process.env.SOCIAL_SHARE_GITHUB_REPO || 'web-app-it-services-freetown';
const GITHUB_BRANCH = process.env.SOCIAL_SHARE_GITHUB_BRANCH || 'main';
const SHORT_URL_REPO_PATH = process.env.SOCIAL_SHARE_LINKS_PATH || 'data/short-urls.json';
const SOCIAL_SHARE_MEDIA_DIR = 'public/social-share';
const IS_VERCEL_DEPLOYMENT = Boolean(process.env.VERCEL);
const HAS_DATABASE = Boolean(process.env.DATABASE_URL);

interface DatabaseShortUrlRow {
  code: string;
  url: string;
  metadata: unknown;
}

let databaseTableReady: Promise<boolean> | null = null;

export const SHORT_URL_STORAGE_FILE = path.join(process.cwd(), SHORT_URL_REPO_PATH);

function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };

  if (GITHUB_TOKEN) {
    headers.Authorization = `token ${GITHUB_TOKEN}`;
  }

  return headers;
}

function ensureShortUrlStorage() {
  const storageDir = path.dirname(SHORT_URL_STORAGE_FILE);
  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  if (!fs.existsSync(SHORT_URL_STORAGE_FILE)) {
    fs.writeFileSync(SHORT_URL_STORAGE_FILE, JSON.stringify({}, null, 2), 'utf8');
  }
}

function normalizeShortUrlMap(payload: unknown): ShortUrlMap {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) return {};

  return Object.entries(payload as Record<string, unknown>).reduce<ShortUrlMap>((map, [code, entry]) => {
    if (typeof entry === 'string') {
      map[code] = entry;
      return map;
    }

    if (entry && typeof entry === 'object' && typeof (entry as ShortUrlRecord).url === 'string') {
      map[code] = entry as ShortUrlRecord;
    }

    return map;
  }, {});
}

function normalizeDatabaseRecord(row: DatabaseShortUrlRow): ShortUrlRecord | null {
  if (!row || typeof row.code !== 'string' || typeof row.url !== 'string') return null;

  const metadata = row.metadata && typeof row.metadata === 'object' && !Array.isArray(row.metadata)
    ? row.metadata as ShortUrlMetadata
    : undefined;

  return { url: row.url, metadata };
}

async function ensureDatabaseTable(): Promise<boolean> {
  if (!HAS_DATABASE) return false;

  if (!databaseTableReady) {
    databaseTableReady = (async () => {
      try {
        await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "SocialShareLink" (
            "code" TEXT PRIMARY KEY,
            "url" TEXT NOT NULL,
            "metadata" JSONB,
            "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
          )
        `);
        return true;
      } catch (error) {
        console.warn('[Social Share Storage] Database initialization warning:', error);
        return false;
      }
    })();
  }

  return databaseTableReady;
}

async function readDatabaseRecord(code: string): Promise<ShortUrlRecord | null> {
  if (!(await ensureDatabaseTable())) return null;

  try {
    const rows = await prisma.$queryRawUnsafe<DatabaseShortUrlRow[]>(
      'SELECT "code", "url", "metadata" FROM "SocialShareLink" WHERE "code" = $1 LIMIT 1',
      code
    );
    return rows[0] ? normalizeDatabaseRecord(rows[0]) : null;
  } catch (error) {
    console.warn('[Social Share Storage] Database read warning:', error);
    return null;
  }
}

async function readDatabaseMap(): Promise<ShortUrlMap | null> {
  if (!(await ensureDatabaseTable())) return null;

  try {
    const rows = await prisma.$queryRawUnsafe<DatabaseShortUrlRow[]>(
      'SELECT "code", "url", "metadata" FROM "SocialShareLink"'
    );

    return rows.reduce<ShortUrlMap>((map, row) => {
      const record = normalizeDatabaseRecord(row);
      if (record) map[row.code] = record;
      return map;
    }, {});
  } catch (error) {
    console.warn('[Social Share Storage] Database list warning:', error);
    return null;
  }
}

async function writeDatabaseMap(map: ShortUrlMap): Promise<boolean> {
  if (!(await ensureDatabaseTable())) return false;

  try {
    for (const [code, entry] of Object.entries(normalizeShortUrlMap(map))) {
      const record = normalizeShortUrlRecord(entry);
      if (!record) continue;

      await prisma.$executeRawUnsafe(
        `
          INSERT INTO "SocialShareLink" ("code", "url", "metadata", "updatedAt")
          VALUES ($1, $2, $3::jsonb, CURRENT_TIMESTAMP)
          ON CONFLICT ("code") DO UPDATE SET
            "url" = EXCLUDED."url",
            "metadata" = EXCLUDED."metadata",
            "updatedAt" = CURRENT_TIMESTAMP
        `,
        code,
        record.url,
        JSON.stringify(record.metadata || null)
      );
    }
    return true;
  } catch (error) {
    console.warn('[Social Share Storage] Database save warning:', error);
    return false;
  }
}

async function readFromGitHub(): Promise<ShortUrlMap | null> {
  if (!GITHUB_TOKEN) return null;

  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${SHORT_URL_REPO_PATH}?ref=${GITHUB_BRANCH}`,
      {
        headers: githubHeaders(),
        cache: 'no-store',
      }
    );

    if (response.status === 404) return {};
    if (!response.ok) return null;

    const data = await response.json();
    if (!data.content) return {};

    const decoded = Buffer.from(data.content, 'base64').toString('utf8');
    return normalizeShortUrlMap(JSON.parse(decoded || '{}'));
  } catch (error) {
    console.warn('[Social Share Storage] GitHub read warning:', error);
    return null;
  }
}

async function readFromRawGitHub(): Promise<ShortUrlMap | null> {
  try {
    const response = await fetch(
      `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${SHORT_URL_REPO_PATH}`,
      {
        cache: 'no-store',
      }
    );

    if (!response.ok) return null;

    const text = await response.text();
    if (!text.trim()) return {};
    return normalizeShortUrlMap(JSON.parse(text));
  } catch {
    return null;
  }
}

function readFromLocalDisk(): ShortUrlMap | null {
  try {
    if (!fs.existsSync(SHORT_URL_STORAGE_FILE)) return null;
    return normalizeShortUrlMap(JSON.parse(fs.readFileSync(SHORT_URL_STORAGE_FILE, 'utf8')));
  } catch (error) {
    console.warn('[Social Share Storage] Local read warning:', error);
    return null;
  }
}

export async function readShortUrlMap(): Promise<ShortUrlMap> {
  const databaseMap = await readDatabaseMap();
  const githubMap = await readFromGitHub();
  if (githubMap) return { ...githubMap, ...(databaseMap || {}) };

  const localMap = readFromLocalDisk();
  if (localMap) return { ...localMap, ...(databaseMap || {}) };

  const rawGithubMap = await readFromRawGitHub();
  if (rawGithubMap) return { ...rawGithubMap, ...(databaseMap || {}) };

  return databaseMap || {};
}

export async function writeShortUrlMap(map: ShortUrlMap) {
  if (await writeDatabaseMap(map)) return;

  if (IS_VERCEL_DEPLOYMENT && !GITHUB_TOKEN) {
    throw new Error(
      'Social share storage is not configured. Connect the production database or add SOCIAL_SHARE_GITHUB_TOKEN to Vercel.'
    );
  }

  const json = JSON.stringify(normalizeShortUrlMap(map), null, 2);
  let localSaved = false;

  try {
    ensureShortUrlStorage();
    fs.writeFileSync(SHORT_URL_STORAGE_FILE, json, 'utf8');
    localSaved = true;
  } catch (error) {
    console.warn('[Social Share Storage] Local save warning:', error);
  }

  if (GITHUB_TOKEN) {
    const checkResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${SHORT_URL_REPO_PATH}?ref=${GITHUB_BRANCH}`,
      {
        headers: githubHeaders(),
        cache: 'no-store',
      }
    );

    let sha: string | undefined;
    if (checkResponse.ok) {
      const existingFile = await checkResponse.json();
      sha = existingFile.sha;
    } else if (checkResponse.status !== 404) {
      throw new Error(`Could not read existing short-link storage from GitHub (${checkResponse.status}).`);
    }

    const saveResponse = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${SHORT_URL_REPO_PATH}`,
      {
        method: 'PUT',
        headers: {
          ...githubHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Update social sharing short links',
          content: Buffer.from(json).toString('base64'),
          branch: GITHUB_BRANCH,
          ...(sha ? { sha } : {}),
        }),
      }
    );

    if (!saveResponse.ok) {
      throw new Error(`Could not save short-link storage to GitHub (${saveResponse.status}).`);
    }
  } else if (!localSaved) {
    throw new Error('Could not save short-link storage.');
  }
}

export function normalizeShortUrlRecord(entry?: string | ShortUrlRecord): ShortUrlRecord | null {
  if (!entry) return null;
  if (typeof entry === 'string') return { url: entry };
  if (typeof entry.url === 'string') return entry;
  return null;
}

export async function getShortUrlRecord(code: string): Promise<ShortUrlRecord | null> {
  const databaseRecord = await readDatabaseRecord(code);
  if (databaseRecord) return databaseRecord;

  const map = await readShortUrlMap();
  return normalizeShortUrlRecord(map[code]);
}

function sanitizeFileName(fileName: string) {
  const clean = fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return clean || 'social-share-image.jpg';
}

export async function uploadSocialShareMedia(base64Content: string, fileName: string) {
  // The image is stored with its product metadata in PostgreSQL when available.
  // It is exposed through /api/social-share-image only after its short link exists.
  if (HAS_DATABASE) {
    return {
      fileName: `${Date.now()}-${sanitizeFileName(fileName)}`,
      url: base64Content,
    };
  }

  if (IS_VERCEL_DEPLOYMENT && !GITHUB_TOKEN) {
    throw new Error(
      'Social share storage is not configured. Connect the production database or add SOCIAL_SHARE_GITHUB_TOKEN to Vercel.'
    );
  }

  const cleanBase64 = base64Content.includes(',')
    ? base64Content.split(',').pop() || ''
    : base64Content;
  const uniqueFileName = `${Date.now()}-${sanitizeFileName(fileName)}`;
  const relativeUrl = `/social-share/${uniqueFileName}`;
  const fileBuffer = Buffer.from(cleanBase64, 'base64');
  let localSaved = false;

  try {
    const mediaDir = path.join(process.cwd(), SOCIAL_SHARE_MEDIA_DIR);
    if (!fs.existsSync(mediaDir)) {
      fs.mkdirSync(mediaDir, { recursive: true });
    }

    fs.writeFileSync(path.join(mediaDir, uniqueFileName), fileBuffer);
    localSaved = true;
  } catch (error) {
    console.warn('[Social Share Storage] Local media save warning:', error);
  }

  if (GITHUB_TOKEN) {
    const repoPath = `${SOCIAL_SHARE_MEDIA_DIR}/${uniqueFileName}`;
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${repoPath}`,
      {
        method: 'PUT',
        headers: {
          ...githubHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Upload social share image: ${uniqueFileName}`,
          content: cleanBase64,
          branch: GITHUB_BRANCH,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Could not upload social share image to GitHub (${response.status}).`);
    }

    const data = await response.json();
    return {
      fileName: uniqueFileName,
      url:
        data.content?.download_url ||
        `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${repoPath}`,
    };
  }

  if (!localSaved) {
    throw new Error('Could not upload social share image.');
  }

  return {
    fileName: uniqueFileName,
    url: relativeUrl,
  };
}
