import fs from 'fs';
import path from 'path';

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
  const githubMap = await readFromGitHub();
  if (githubMap) return githubMap;

  const localMap = readFromLocalDisk();
  if (localMap) return localMap;

  const rawGithubMap = await readFromRawGitHub();
  if (rawGithubMap) return rawGithubMap;

  return {};
}

export async function writeShortUrlMap(map: ShortUrlMap) {
  if (IS_VERCEL_DEPLOYMENT && !GITHUB_TOKEN) {
    throw new Error(
      'Social share storage is not configured. Add SOCIAL_SHARE_GITHUB_TOKEN to Vercel before generating links.'
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
  if (IS_VERCEL_DEPLOYMENT && !GITHUB_TOKEN) {
    throw new Error(
      'Social share storage is not configured. Add SOCIAL_SHARE_GITHUB_TOKEN to Vercel before uploading images.'
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
