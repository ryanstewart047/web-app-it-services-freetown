import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';

export interface SurpriseReveal {
  code: string;
  recipientName: string;
  achievement: string;
  message: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

interface SurpriseRevealRow {
  code: string;
  recipientName: string;
  achievement: string;
  message: string | null;
  imageUrl: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

const HAS_DATABASE = Boolean(process.env.DATABASE_URL);
const IS_VERCEL_DEPLOYMENT = Boolean(process.env.VERCEL);
const LOCAL_STORAGE_PATH = path.join(process.cwd(), 'data', 'surprise-reveals.json');

let databaseTableReady: Promise<boolean> | null = null;

function asIsoDate(value: Date | string | undefined) {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function normalizeReveal(value: unknown): SurpriseReveal | null {
  if (!value || typeof value !== 'object') return null;

  const candidate = value as Partial<SurpriseRevealRow>;
  if (
    typeof candidate.code !== 'string' ||
    typeof candidate.recipientName !== 'string' ||
    typeof candidate.achievement !== 'string' ||
    typeof candidate.imageUrl !== 'string'
  ) {
    return null;
  }

  return {
    code: candidate.code,
    recipientName: candidate.recipientName,
    achievement: candidate.achievement,
    message: typeof candidate.message === 'string' ? candidate.message : '',
    imageUrl: candidate.imageUrl,
    createdAt: asIsoDate(candidate.createdAt),
    updatedAt: asIsoDate(candidate.updatedAt),
  };
}

function readLocalReveals(): SurpriseReveal[] {
  try {
    if (!fs.existsSync(LOCAL_STORAGE_PATH)) return [];
    const raw = JSON.parse(fs.readFileSync(LOCAL_STORAGE_PATH, 'utf8'));
    const entries = Array.isArray(raw) ? raw : raw?.items;
    if (!Array.isArray(entries)) return [];

    return entries
      .map(normalizeReveal)
      .filter((reveal): reveal is SurpriseReveal => Boolean(reveal))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (error) {
    console.warn('[Surprise Reveal] Local storage read warning:', error);
    return [];
  }
}

function writeLocalReveals(reveals: SurpriseReveal[]) {
  const storageDir = path.dirname(LOCAL_STORAGE_PATH);
  if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });
  fs.writeFileSync(LOCAL_STORAGE_PATH, JSON.stringify({ items: reveals }, null, 2), 'utf8');
}

async function ensureDatabaseTable(): Promise<boolean> {
  if (!HAS_DATABASE) return false;

  if (!databaseTableReady) {
    databaseTableReady = (async () => {
      try {
        await prisma.$executeRawUnsafe(`
          CREATE TABLE IF NOT EXISTS "SurpriseReveal" (
            "code" TEXT PRIMARY KEY,
            "recipientName" TEXT NOT NULL,
            "achievement" TEXT NOT NULL,
            "message" TEXT,
            "imageUrl" TEXT NOT NULL,
            "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
          )
        `);
        return true;
      } catch (error) {
        console.error('[Surprise Reveal] Database initialization failed:', error);
        return false;
      }
    })();
  }

  return databaseTableReady;
}

async function readDatabaseReveals(): Promise<SurpriseReveal[] | null> {
  if (!(await ensureDatabaseTable())) return null;

  try {
    const rows = await prisma.$queryRawUnsafe<SurpriseRevealRow[]>(
      `SELECT "code", "recipientName", "achievement", "message", "imageUrl", "createdAt", "updatedAt"
       FROM "SurpriseReveal" ORDER BY "createdAt" DESC`
    );
    return rows
      .map(normalizeReveal)
      .filter((reveal): reveal is SurpriseReveal => Boolean(reveal));
  } catch (error) {
    console.error('[Surprise Reveal] Database read failed:', error);
    return null;
  }
}

async function readDatabaseReveal(code: string): Promise<SurpriseReveal | null> {
  if (!(await ensureDatabaseTable())) return null;

  try {
    const rows = await prisma.$queryRawUnsafe<SurpriseRevealRow[]>(
      `SELECT "code", "recipientName", "achievement", "message", "imageUrl", "createdAt", "updatedAt"
       FROM "SurpriseReveal" WHERE "code" = $1 LIMIT 1`,
      code
    );
    return rows[0] ? normalizeReveal(rows[0]) : null;
  } catch (error) {
    console.error('[Surprise Reveal] Database lookup failed:', error);
    return null;
  }
}

async function insertDatabaseReveal(reveal: SurpriseReveal): Promise<boolean> {
  if (!(await ensureDatabaseTable())) return false;

  try {
    await prisma.$executeRawUnsafe(
      `INSERT INTO "SurpriseReveal"
        ("code", "recipientName", "achievement", "message", "imageUrl", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6::timestamptz, $7::timestamptz)`,
      reveal.code,
      reveal.recipientName,
      reveal.achievement,
      reveal.message || null,
      reveal.imageUrl,
      reveal.createdAt,
      reveal.updatedAt
    );
    return true;
  } catch (error) {
    console.error('[Surprise Reveal] Database save failed:', error);
    return false;
  }
}

async function deleteDatabaseReveal(code: string): Promise<boolean | null> {
  if (!(await ensureDatabaseTable())) return null;

  try {
    const deleted = await prisma.$executeRawUnsafe(
      'DELETE FROM "SurpriseReveal" WHERE "code" = $1',
      code
    );
    return deleted > 0;
  } catch (error) {
    console.error('[Surprise Reveal] Database delete failed:', error);
    return null;
  }
}

function createCode() {
  return `celebrate-${crypto.randomBytes(5).toString('hex')}`;
}

export async function getSurpriseReveals(): Promise<SurpriseReveal[]> {
  const databaseReveals = await readDatabaseReveals();
  return databaseReveals || readLocalReveals();
}

export async function getSurpriseReveal(code: string): Promise<SurpriseReveal | null> {
  const databaseReveal = await readDatabaseReveal(code);
  if (databaseReveal) return databaseReveal;
  return readLocalReveals().find((reveal) => reveal.code === code) || null;
}

export async function createSurpriseReveal(input: Omit<SurpriseReveal, 'code' | 'createdAt' | 'updatedAt'>) {
  const existing = await getSurpriseReveals();
  let code = createCode();
  while (existing.some((reveal) => reveal.code === code)) code = createCode();

  const now = new Date().toISOString();
  const reveal: SurpriseReveal = { ...input, code, createdAt: now, updatedAt: now };

  if (await insertDatabaseReveal(reveal)) return reveal;
  if (IS_VERCEL_DEPLOYMENT) {
    throw new Error('Surprise Reveal storage is unavailable. Connect the production database and try again.');
  }

  writeLocalReveals([reveal, ...existing]);
  return reveal;
}

export async function removeSurpriseReveal(code: string): Promise<boolean> {
  const databaseDeleted = await deleteDatabaseReveal(code);
  if (databaseDeleted !== null) return databaseDeleted;
  if (IS_VERCEL_DEPLOYMENT) {
    throw new Error('Surprise Reveal storage is unavailable. The reveal was not removed.');
  }

  const reveals = readLocalReveals();
  const nextReveals = reveals.filter((reveal) => reveal.code !== code);
  if (nextReveals.length === reveals.length) return false;
  writeLocalReveals(nextReveals);
  return true;
}
