import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';

export interface OnDemandRequest {
  id: string; // e.g. 'ODS-74921'
  category: string; // e.g. 'printer-tech', 'gaming-console', 'electrician'
  categoryTitle: string; // 'Printer & Copier Technician'
  customerName: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  locationArea: string; // e.g. 'Aberdeen', 'Lumley', 'Central'
  addressDetails: string;
  urgency: 'emergency' | '24h' | 'flexible';
  problemDescription: string;
  preferredDate?: string;
  preferredTime?: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  assignedProId?: string;
  assignedProName?: string;
  assignedProPhone?: string;
  jobTotalCost?: number; // Total billed to customer (Le)
  platformCommissionRate: number; // default 0.15 (15%)
  platformCommissionAmount?: number; // 15% cut
  proPayoutAmount?: number; // 85% payout
  paymentStatus: 'pending' | 'part_payment' | 'paid';
  amountPaid?: number;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OnDemandPro {
  id: string; // e.g. 'PRO-3819'
  fullName: string;
  phone: string;
  password?: string; // For pro sign-in
  whatsapp?: string;
  email?: string; // Optional email
  address: string; // Mandatory physical residential / workshop address
  mobileMoneyNumber: string;
  mobileMoneyProvider: 'orange' | 'afri' | 'other';
  primaryTrade: string;
  secondarySkills?: string;
  yearsOfExperience: number | string;
  coverageAreas: string[];
  nationalIdNumber?: string;
  profilePhoto?: string; // Full size photo of applicant
  idCardFrontPhoto?: string; // ID Card Front Side
  idCardBackPhoto?: string; // ID Card Back Side
  idCardPhoto?: string; // Legacy / Fallback
  onboardingFeeAmount: number; // 30 Leones
  onboardingFeeStatus: 'unpaid' | 'pending_verification' | 'paid';
  onboardingPaymentRef?: string;
  status: 'pending_payment' | 'pending_review' | 'verified_active' | 'inactive' | 'suspended' | 'blocked';
  resetCode?: string;
  resetCodeExpiresAt?: string;
  rating?: number;
  completedJobsCount?: number;
  totalEarned?: number;
  bioOrWorkSummary?: string;
  createdAt: string;
  updatedAt: string;
}

export interface OnDemandStats {
  totalRequests: number;
  activeRequests: number;
  completedRequests: number;
  totalPros: number;
  verifiedPros: number;
  totalCommissionEarned: number;
  totalOnboardingFeesCollected: number;
}

const REQUESTS_FILE = path.join(process.cwd(), 'data', 'on_demand_requests.json');
const PROS_FILE = path.join(process.cwd(), 'data', 'on_demand_pros.json');
const TMP_REQUESTS_FILE = path.join('/tmp', 'on_demand_requests.json');
const TMP_PROS_FILE = path.join('/tmp', 'on_demand_pros.json');

function ensureDir(filePath: string) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  } catch {}
}

const INITIAL_PROS: OnDemandPro[] = [];

const INITIAL_REQUESTS: OnDemandRequest[] = [];

let tablesInitialized = false;

async function ensureTables(): Promise<boolean> {
  if (tablesInitialized) return true;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "on_demand_pros" (
        "id" VARCHAR(64) PRIMARY KEY,
        "fullName" VARCHAR(255) NOT NULL,
        "phone" VARCHAR(64) NOT NULL,
        "password" VARCHAR(255),
        "whatsapp" VARCHAR(64),
        "email" VARCHAR(255),
        "address" TEXT NOT NULL DEFAULT '',
        "mobileMoneyNumber" VARCHAR(64) NOT NULL DEFAULT '',
        "mobileMoneyProvider" VARCHAR(32) NOT NULL DEFAULT 'orange',
        "primaryTrade" VARCHAR(255) NOT NULL,
        "secondarySkills" TEXT,
        "yearsOfExperience" VARCHAR(32) NOT NULL DEFAULT '1',
        "coverageAreas" JSONB NOT NULL DEFAULT '[]'::jsonb,
        "nationalIdNumber" VARCHAR(64),
        "profilePhoto" TEXT,
        "idCardFrontPhoto" TEXT,
        "idCardBackPhoto" TEXT,
        "idCardPhoto" TEXT,
        "onboardingFeeAmount" NUMERIC NOT NULL DEFAULT 30,
        "onboardingFeeStatus" VARCHAR(32) NOT NULL DEFAULT 'unpaid',
        "onboardingPaymentRef" VARCHAR(255),
        "status" VARCHAR(32) NOT NULL DEFAULT 'pending_review',
        "resetCode" VARCHAR(16),
        "resetCodeExpiresAt" VARCHAR(64),
        "rating" NUMERIC DEFAULT 5.0,
        "completedJobsCount" INT DEFAULT 0,
        "totalEarned" NUMERIC DEFAULT 0,
        "bioOrWorkSummary" TEXT,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "on_demand_requests" (
        "id" VARCHAR(64) PRIMARY KEY,
        "category" VARCHAR(64) NOT NULL,
        "categoryTitle" VARCHAR(255) NOT NULL,
        "customerName" VARCHAR(255) NOT NULL,
        "phone" VARCHAR(64) NOT NULL,
        "whatsapp" VARCHAR(64),
        "email" VARCHAR(255),
        "locationArea" VARCHAR(255) NOT NULL,
        "addressDetails" TEXT NOT NULL DEFAULT '',
        "urgency" VARCHAR(32) NOT NULL DEFAULT '24h',
        "problemDescription" TEXT NOT NULL,
        "preferredDate" VARCHAR(64),
        "preferredTime" VARCHAR(64),
        "status" VARCHAR(32) NOT NULL DEFAULT 'pending',
        "assignedProId" VARCHAR(64),
        "assignedProName" VARCHAR(255),
        "assignedProPhone" VARCHAR(64),
        "jobTotalCost" NUMERIC,
        "platformCommissionRate" NUMERIC NOT NULL DEFAULT 0.15,
        "platformCommissionAmount" NUMERIC,
        "proPayoutAmount" NUMERIC,
        "paymentStatus" VARCHAR(32) NOT NULL DEFAULT 'pending',
        "amountPaid" NUMERIC,
        "adminNotes" TEXT,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "on_demand_meta" (
        "key" VARCHAR(64) PRIMARY KEY,
        "value" TEXT NOT NULL
      );
    `);

    tablesInitialized = true;
    return true;
  } catch (err) {
    console.warn('[OnDemand Storage] PostgreSQL table check error, using fallback:', err);
    return false;
  }
}

function rowToPro(row: any): OnDemandPro {
  let coverageAreas: string[] = ['Central Freetown'];
  if (Array.isArray(row.coverageAreas)) {
    coverageAreas = row.coverageAreas;
  } else if (typeof row.coverageAreas === 'string') {
    try { coverageAreas = JSON.parse(row.coverageAreas); } catch {}
  }

  return {
    id: String(row.id),
    fullName: String(row.fullName || ''),
    phone: String(row.phone || ''),
    password: row.password ? String(row.password) : undefined,
    whatsapp: row.whatsapp ? String(row.whatsapp) : undefined,
    email: row.email ? String(row.email) : undefined,
    address: String(row.address || ''),
    mobileMoneyNumber: String(row.mobileMoneyNumber || row.phone || ''),
    mobileMoneyProvider: row.mobileMoneyProvider || 'orange',
    primaryTrade: String(row.primaryTrade || ''),
    secondarySkills: row.secondarySkills ? String(row.secondarySkills) : undefined,
    yearsOfExperience: row.yearsOfExperience || 1,
    coverageAreas,
    nationalIdNumber: row.nationalIdNumber ? String(row.nationalIdNumber) : undefined,
    profilePhoto: row.profilePhoto ? String(row.profilePhoto) : undefined,
    idCardFrontPhoto: row.idCardFrontPhoto ? String(row.idCardFrontPhoto) : undefined,
    idCardBackPhoto: row.idCardBackPhoto ? String(row.idCardBackPhoto) : undefined,
    idCardPhoto: row.idCardPhoto || row.idCardFrontPhoto || undefined,
    onboardingFeeAmount: Number(row.onboardingFeeAmount || 30),
    onboardingFeeStatus: row.onboardingFeeStatus || 'pending_verification',
    onboardingPaymentRef: row.onboardingPaymentRef ? String(row.onboardingPaymentRef) : undefined,
    status: row.status || 'pending_review',
    resetCode: row.resetCode ? String(row.resetCode) : undefined,
    resetCodeExpiresAt: row.resetCodeExpiresAt ? String(row.resetCodeExpiresAt) : undefined,
    rating: Number(row.rating || 5.0),
    completedJobsCount: Number(row.completedJobsCount || 0),
    totalEarned: Number(row.totalEarned || 0),
    bioOrWorkSummary: row.bioOrWorkSummary ? String(row.bioOrWorkSummary) : undefined,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt || new Date().toISOString()),
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt || new Date().toISOString()),
  };
}

function rowToRequest(row: any): OnDemandRequest {
  return {
    id: String(row.id),
    category: String(row.category || 'other'),
    categoryTitle: String(row.categoryTitle || 'Specialized Service'),
    customerName: String(row.customerName || ''),
    phone: String(row.phone || ''),
    whatsapp: row.whatsapp ? String(row.whatsapp) : undefined,
    email: row.email ? String(row.email) : undefined,
    locationArea: String(row.locationArea || 'Freetown'),
    addressDetails: String(row.addressDetails || ''),
    urgency: row.urgency || '24h',
    problemDescription: String(row.problemDescription || ''),
    preferredDate: row.preferredDate ? String(row.preferredDate) : undefined,
    preferredTime: row.preferredTime ? String(row.preferredTime) : undefined,
    status: row.status || 'pending',
    assignedProId: row.assignedProId ? String(row.assignedProId) : undefined,
    assignedProName: row.assignedProName ? String(row.assignedProName) : undefined,
    assignedProPhone: row.assignedProPhone ? String(row.assignedProPhone) : undefined,
    jobTotalCost: row.jobTotalCost !== null && row.jobTotalCost !== undefined ? Number(row.jobTotalCost) : undefined,
    platformCommissionRate: Number(row.platformCommissionRate || 0.15),
    platformCommissionAmount: row.platformCommissionAmount !== null && row.platformCommissionAmount !== undefined ? Number(row.platformCommissionAmount) : undefined,
    proPayoutAmount: row.proPayoutAmount !== null && row.proPayoutAmount !== undefined ? Number(row.proPayoutAmount) : undefined,
    paymentStatus: row.paymentStatus || 'pending',
    amountPaid: row.amountPaid !== null && row.amountPaid !== undefined ? Number(row.amountPaid) : undefined,
    adminNotes: row.adminNotes ? String(row.adminNotes) : undefined,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt || new Date().toISOString()),
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt || new Date().toISOString()),
  };
}

// ── LOCAL FILE HELPERS (FALLBACK) ──────────────────────────────────────────

function readLocalPros(): OnDemandPro[] {
  try {
    if (fs.existsSync(PROS_FILE)) {
      const data = JSON.parse(fs.readFileSync(PROS_FILE, 'utf-8'));
      if (Array.isArray(data)) return data;
    }
  } catch {}
  try {
    if (fs.existsSync(TMP_PROS_FILE)) {
      const data = JSON.parse(fs.readFileSync(TMP_PROS_FILE, 'utf-8'));
      if (Array.isArray(data)) return data;
    }
  } catch {}
  return [];
}

function writeLocalPros(pros: OnDemandPro[]): void {
  try {
    ensureDir(PROS_FILE);
    fs.writeFileSync(PROS_FILE, JSON.stringify(pros, null, 2), 'utf-8');
  } catch {}
  try {
    ensureDir(TMP_PROS_FILE);
    fs.writeFileSync(TMP_PROS_FILE, JSON.stringify(pros, null, 2), 'utf-8');
  } catch {}
}

function readLocalRequests(): OnDemandRequest[] {
  try {
    if (fs.existsSync(REQUESTS_FILE)) {
      const data = JSON.parse(fs.readFileSync(REQUESTS_FILE, 'utf-8'));
      if (Array.isArray(data)) return data;
    }
  } catch {}
  try {
    if (fs.existsSync(TMP_REQUESTS_FILE)) {
      const data = JSON.parse(fs.readFileSync(TMP_REQUESTS_FILE, 'utf-8'));
      if (Array.isArray(data)) return data;
    }
  } catch {}
  return [];
}

function writeLocalRequests(reqs: OnDemandRequest[]): void {
  try {
    ensureDir(REQUESTS_FILE);
    fs.writeFileSync(REQUESTS_FILE, JSON.stringify(reqs, null, 2), 'utf-8');
  } catch {}
  try {
    ensureDir(TMP_REQUESTS_FILE);
    fs.writeFileSync(TMP_REQUESTS_FILE, JSON.stringify(reqs, null, 2), 'utf-8');
  } catch {}
}

// ── ON-DEMAND PROS / ARTISANS (POSTGRESQL + LOCAL FALLBACK) ────────────────

export async function getOnDemandPros(): Promise<OnDemandPro[]> {
  const dbReady = await ensureTables();
  if (dbReady) {
    try {
      const rows: any[] = await prisma.$queryRawUnsafe(`
        SELECT * FROM "on_demand_pros" ORDER BY "createdAt" DESC;
      `);

      return Array.isArray(rows) ? rows.map(rowToPro) : [];
    } catch (err) {
      console.error('[OnDemand Storage] Error querying pros from database:', err);
    }
  }

  // Fallback to local files
  const local = readLocalPros();
  return local;
}

export async function getOnDemandPro(id: string): Promise<OnDemandPro | null> {
  const dbReady = await ensureTables();
  if (dbReady) {
    try {
      const rows: any[] = await prisma.$queryRawUnsafe(`
        SELECT * FROM "on_demand_pros" WHERE "id" = $1 LIMIT 1;
      `, id);
      if (rows && rows.length > 0) return rowToPro(rows[0]);
    } catch (err) {
      console.error('[OnDemand Storage] Error querying pro by ID:', err);
    }
  }

  const all = await getOnDemandPros();
  return all.find(p => p.id === id) || null;
}

export async function saveOnDemandPro(input: Partial<OnDemandPro>): Promise<OnDemandPro> {
  const id = input.id || `PRO-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  const newRecord: OnDemandPro = {
    id,
    fullName: input.fullName?.trim() || '',
    phone: input.phone?.trim() || '',
    password: input.password?.trim() || '',
    whatsapp: input.whatsapp?.trim() || input.phone?.trim() || '',
    email: input.email?.trim() || undefined,
    address: input.address?.trim() || '',
    mobileMoneyNumber: input.mobileMoneyNumber?.trim() || input.phone?.trim() || '',
    mobileMoneyProvider: input.mobileMoneyProvider || 'orange',
    primaryTrade: input.primaryTrade?.trim() || 'General Technician',
    secondarySkills: input.secondarySkills?.trim() || undefined,
    yearsOfExperience: input.yearsOfExperience || 1,
    coverageAreas: Array.isArray(input.coverageAreas) && input.coverageAreas.length > 0 ? input.coverageAreas : ['Central Freetown'],
    nationalIdNumber: input.nationalIdNumber?.trim() || undefined,
    profilePhoto: input.profilePhoto || undefined,
    idCardFrontPhoto: input.idCardFrontPhoto || input.idCardPhoto || undefined,
    idCardBackPhoto: input.idCardBackPhoto || undefined,
    idCardPhoto: input.idCardFrontPhoto || input.idCardPhoto || undefined,
    onboardingFeeAmount: 30, // Fixed Le 30 commitment fee
    onboardingFeeStatus: input.onboardingFeeStatus || 'pending_verification',
    onboardingPaymentRef: input.onboardingPaymentRef?.trim() || undefined,
    status: input.status || 'pending_review',
    rating: 5.0,
    completedJobsCount: 0,
    totalEarned: 0,
    bioOrWorkSummary: input.bioOrWorkSummary?.trim() || undefined,
    createdAt: input.createdAt || now,
    updatedAt: now,
  };

  const dbReady = await ensureTables();
  if (dbReady) {
    try {
      await prisma.$executeRawUnsafe(`
        INSERT INTO "on_demand_pros" (
          "id", "fullName", "phone", "password", "whatsapp", "email", "address",
          "mobileMoneyNumber", "mobileMoneyProvider", "primaryTrade", "secondarySkills",
          "yearsOfExperience", "coverageAreas", "nationalIdNumber", "profilePhoto",
          "idCardFrontPhoto", "idCardBackPhoto", "idCardPhoto", "onboardingFeeAmount",
          "onboardingFeeStatus", "onboardingPaymentRef", "status", "rating",
          "completedJobsCount", "totalEarned", "bioOrWorkSummary", "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb, $14, $15,
          $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27::timestamptz, $28::timestamptz
        ) ON CONFLICT ("id") DO UPDATE SET
          "fullName" = EXCLUDED."fullName",
          "phone" = EXCLUDED."phone",
          "password" = COALESCE(EXCLUDED."password", "on_demand_pros"."password"),
          "whatsapp" = EXCLUDED."whatsapp",
          "email" = EXCLUDED."email",
          "address" = EXCLUDED."address",
          "mobileMoneyNumber" = EXCLUDED."mobileMoneyNumber",
          "mobileMoneyProvider" = EXCLUDED."mobileMoneyProvider",
          "primaryTrade" = EXCLUDED."primaryTrade",
          "secondarySkills" = EXCLUDED."secondarySkills",
          "yearsOfExperience" = EXCLUDED."yearsOfExperience",
          "coverageAreas" = EXCLUDED."coverageAreas",
          "nationalIdNumber" = EXCLUDED."nationalIdNumber",
          "profilePhoto" = COALESCE(EXCLUDED."profilePhoto", "on_demand_pros"."profilePhoto"),
          "idCardFrontPhoto" = COALESCE(EXCLUDED."idCardFrontPhoto", "on_demand_pros"."idCardFrontPhoto"),
          "idCardBackPhoto" = COALESCE(EXCLUDED."idCardBackPhoto", "on_demand_pros"."idCardBackPhoto"),
          "idCardPhoto" = COALESCE(EXCLUDED."idCardPhoto", "on_demand_pros"."idCardPhoto"),
          "onboardingFeeStatus" = EXCLUDED."onboardingFeeStatus",
          "onboardingPaymentRef" = EXCLUDED."onboardingPaymentRef",
          "status" = EXCLUDED."status",
          "bioOrWorkSummary" = EXCLUDED."bioOrWorkSummary",
          "updatedAt" = CURRENT_TIMESTAMP;
      `,
        newRecord.id, newRecord.fullName, newRecord.phone, newRecord.password || null,
        newRecord.whatsapp || null, newRecord.email || null, newRecord.address,
        newRecord.mobileMoneyNumber, newRecord.mobileMoneyProvider, newRecord.primaryTrade,
        newRecord.secondarySkills || null, String(newRecord.yearsOfExperience),
        JSON.stringify(newRecord.coverageAreas), newRecord.nationalIdNumber || null,
        newRecord.profilePhoto || null, newRecord.idCardFrontPhoto || null,
        newRecord.idCardBackPhoto || null, newRecord.idCardPhoto || null,
        newRecord.onboardingFeeAmount, newRecord.onboardingFeeStatus,
        newRecord.onboardingPaymentRef || null, newRecord.status, newRecord.rating || 5.0,
        newRecord.completedJobsCount || 0, newRecord.totalEarned || 0,
        newRecord.bioOrWorkSummary || null, newRecord.createdAt, newRecord.updatedAt
      );
    } catch (err) {
      console.error('[OnDemand Storage] Error saving pro to database:', err);
    }
  }

  // Also update local file
  const local = readLocalPros();
  const filtered = local.filter(p => p.id !== id);
  writeLocalPros([newRecord, ...filtered]);

  return newRecord;
}

export async function updateOnDemandPro(id: string, updates: Partial<OnDemandPro>): Promise<OnDemandPro | null> {
  const current = await getOnDemandPro(id);
  if (!current) return null;

  const updatedItem: OnDemandPro = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  const dbReady = await ensureTables();
  if (dbReady) {
    try {
      await prisma.$executeRawUnsafe(`
        UPDATE "on_demand_pros" SET
          "fullName" = $1,
          "phone" = $2,
          "password" = $3,
          "whatsapp" = $4,
          "email" = $5,
          "address" = $6,
          "mobileMoneyNumber" = $7,
          "mobileMoneyProvider" = $8,
          "primaryTrade" = $9,
          "secondarySkills" = $10,
          "yearsOfExperience" = $11,
          "coverageAreas" = $12::jsonb,
          "nationalIdNumber" = $13,
          "profilePhoto" = $14,
          "idCardFrontPhoto" = $15,
          "idCardBackPhoto" = $16,
          "idCardPhoto" = $17,
          "onboardingFeeStatus" = $18,
          "onboardingPaymentRef" = $19,
          "status" = $20,
          "resetCode" = $21,
          "resetCodeExpiresAt" = $22,
          "bioOrWorkSummary" = $23,
          "updatedAt" = CURRENT_TIMESTAMP
        WHERE "id" = $24;
      `,
        updatedItem.fullName, updatedItem.phone, updatedItem.password || null,
        updatedItem.whatsapp || null, updatedItem.email || null, updatedItem.address,
        updatedItem.mobileMoneyNumber, updatedItem.mobileMoneyProvider, updatedItem.primaryTrade,
        updatedItem.secondarySkills || null, String(updatedItem.yearsOfExperience),
        JSON.stringify(updatedItem.coverageAreas), updatedItem.nationalIdNumber || null,
        updatedItem.profilePhoto || null, updatedItem.idCardFrontPhoto || null,
        updatedItem.idCardBackPhoto || null, updatedItem.idCardPhoto || null,
        updatedItem.onboardingFeeStatus, updatedItem.onboardingPaymentRef || null,
        updatedItem.status, updatedItem.resetCode || null, updatedItem.resetCodeExpiresAt || null,
        updatedItem.bioOrWorkSummary || null, id
      );
    } catch (err) {
      console.error('[OnDemand Storage] Error updating pro in database:', err);
    }
  }

  // Update local file
  const local = readLocalPros();
  const index = local.findIndex(p => p.id === id);
  if (index !== -1) {
    local[index] = updatedItem;
    writeLocalPros(local);
  }

  return updatedItem;
}

export async function deleteOnDemandPro(id: string): Promise<boolean> {
  let deletedFromDb = false;
  const dbReady = await ensureTables();
  if (dbReady) {
    try {
      const result: number = await prisma.$executeRawUnsafe(`
        DELETE FROM "on_demand_pros" WHERE "id" = $1;
      `, id);
      deletedFromDb = result > 0;
    } catch (err) {
      console.error('[OnDemand Storage] Error deleting pro from database:', err);
    }
  }

  // Always remove from local files as well
  const local = readLocalPros();
  const next = local.filter(p => p.id !== id);
  writeLocalPros(next);

  return deletedFromDb || next.length < local.length;
}

// ── ON-DEMAND CUSTOMER REQUESTS (POSTGRESQL + LOCAL FALLBACK) ──────────────

export async function getOnDemandRequests(): Promise<OnDemandRequest[]> {
  const dbReady = await ensureTables();
  if (dbReady) {
    try {
      const rows: any[] = await prisma.$queryRawUnsafe(`
        SELECT * FROM "on_demand_requests" ORDER BY "createdAt" DESC;
      `);

      return Array.isArray(rows) ? rows.map(rowToRequest) : [];
    } catch (err) {
      console.error('[OnDemand Storage] Error querying requests from database:', err);
    }
  }

  const local = readLocalRequests();
  return local;
}

export async function getOnDemandRequest(id: string): Promise<OnDemandRequest | null> {
  const dbReady = await ensureTables();
  if (dbReady) {
    try {
      const rows: any[] = await prisma.$queryRawUnsafe(`
        SELECT * FROM "on_demand_requests" WHERE "id" = $1 LIMIT 1;
      `, id);
      if (rows && rows.length > 0) return rowToRequest(rows[0]);
    } catch (err) {
      console.error('[OnDemand Storage] Error querying request by ID:', err);
    }
  }

  const all = await getOnDemandRequests();
  return all.find(r => r.id === id) || null;
}

export async function saveOnDemandRequest(input: Partial<OnDemandRequest>): Promise<OnDemandRequest> {
  const id = input.id || `ODS-${Math.floor(10000 + Math.random() * 90000)}`;
  const now = new Date().toISOString();

  const totalCost = input.jobTotalCost || undefined;
  const commRate = input.platformCommissionRate ?? 0.15;
  const commAmount = totalCost ? Math.round(totalCost * commRate * 100) / 100 : undefined;
  const payout = totalCost && commAmount ? Math.round((totalCost - commAmount) * 100) / 100 : undefined;

  const newRecord: OnDemandRequest = {
    id,
    category: input.category || 'other',
    categoryTitle: input.categoryTitle || 'Specialized Service',
    customerName: input.customerName || '',
    phone: input.phone || '',
    whatsapp: input.whatsapp || input.phone || '',
    email: input.email?.trim() || undefined,
    locationArea: input.locationArea || 'Central Freetown',
    addressDetails: input.addressDetails || '',
    urgency: input.urgency || '24h',
    problemDescription: input.problemDescription || '',
    preferredDate: input.preferredDate,
    preferredTime: input.preferredTime,
    status: input.status || 'pending',
    assignedProId: input.assignedProId,
    assignedProName: input.assignedProName,
    assignedProPhone: input.assignedProPhone,
    jobTotalCost: totalCost,
    platformCommissionRate: commRate,
    platformCommissionAmount: commAmount,
    proPayoutAmount: payout,
    paymentStatus: input.paymentStatus || 'pending',
    amountPaid: input.amountPaid || 0,
    adminNotes: input.adminNotes,
    createdAt: input.createdAt || now,
    updatedAt: now,
  };

  const dbReady = await ensureTables();
  if (dbReady) {
    try {
      await prisma.$executeRawUnsafe(`
        INSERT INTO "on_demand_requests" (
          "id", "category", "categoryTitle", "customerName", "phone", "whatsapp",
          "email", "locationArea", "addressDetails", "urgency", "problemDescription",
          "preferredDate", "preferredTime", "status", "assignedProId", "assignedProName",
          "assignedProPhone", "jobTotalCost", "platformCommissionRate",
          "platformCommissionAmount", "proPayoutAmount", "paymentStatus", "amountPaid",
          "adminNotes", "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
          $17, $18, $19, $20, $21, $22, $23, $24, $25::timestamptz, $26::timestamptz
        ) ON CONFLICT ("id") DO UPDATE SET
          "status" = EXCLUDED."status",
          "assignedProId" = EXCLUDED."assignedProId",
          "assignedProName" = EXCLUDED."assignedProName",
          "assignedProPhone" = EXCLUDED."assignedProPhone",
          "jobTotalCost" = EXCLUDED."jobTotalCost",
          "platformCommissionAmount" = EXCLUDED."platformCommissionAmount",
          "proPayoutAmount" = EXCLUDED."proPayoutAmount",
          "paymentStatus" = EXCLUDED."paymentStatus",
          "amountPaid" = EXCLUDED."amountPaid",
          "adminNotes" = EXCLUDED."adminNotes",
          "updatedAt" = CURRENT_TIMESTAMP;
      `,
        newRecord.id, newRecord.category, newRecord.categoryTitle, newRecord.customerName,
        newRecord.phone, newRecord.whatsapp || null, newRecord.email || null,
        newRecord.locationArea, newRecord.addressDetails, newRecord.urgency,
        newRecord.problemDescription, newRecord.preferredDate || null,
        newRecord.preferredTime || null, newRecord.status, newRecord.assignedProId || null,
        newRecord.assignedProName || null, newRecord.assignedProPhone || null,
        newRecord.jobTotalCost || null, newRecord.platformCommissionRate,
        newRecord.platformCommissionAmount || null, newRecord.proPayoutAmount || null,
        newRecord.paymentStatus, newRecord.amountPaid || null, newRecord.adminNotes || null,
        newRecord.createdAt, newRecord.updatedAt
      );
    } catch (err) {
      console.error('[OnDemand Storage] Error saving request to database:', err);
    }
  }

  const local = readLocalRequests();
  const filtered = local.filter(r => r.id !== id);
  writeLocalRequests([newRecord, ...filtered]);

  return newRecord;
}

export async function updateOnDemandRequest(id: string, updates: Partial<OnDemandRequest>): Promise<OnDemandRequest | null> {
  const current = await getOnDemandRequest(id);
  if (!current) return null;

  const totalCost = updates.jobTotalCost !== undefined ? updates.jobTotalCost : current.jobTotalCost;
  const commRate = updates.platformCommissionRate ?? current.platformCommissionRate ?? 0.15;
  const commAmount = totalCost ? Math.round(totalCost * commRate * 100) / 100 : current.platformCommissionAmount;
  const payout = totalCost && commAmount ? Math.round((totalCost - commAmount) * 100) / 100 : current.proPayoutAmount;

  const updatedItem: OnDemandRequest = {
    ...current,
    ...updates,
    jobTotalCost: totalCost,
    platformCommissionRate: commRate,
    platformCommissionAmount: commAmount,
    proPayoutAmount: payout,
    updatedAt: new Date().toISOString(),
  };

  const dbReady = await ensureTables();
  if (dbReady) {
    try {
      await prisma.$executeRawUnsafe(`
        UPDATE "on_demand_requests" SET
          "status" = $1,
          "assignedProId" = $2,
          "assignedProName" = $3,
          "assignedProPhone" = $4,
          "jobTotalCost" = $5,
          "platformCommissionRate" = $6,
          "platformCommissionAmount" = $7,
          "proPayoutAmount" = $8,
          "paymentStatus" = $9,
          "amountPaid" = $10,
          "adminNotes" = $11,
          "updatedAt" = CURRENT_TIMESTAMP
        WHERE "id" = $12;
      `,
        updatedItem.status, updatedItem.assignedProId || null,
        updatedItem.assignedProName || null, updatedItem.assignedProPhone || null,
        updatedItem.jobTotalCost || null, updatedItem.platformCommissionRate,
        updatedItem.platformCommissionAmount || null, updatedItem.proPayoutAmount || null,
        updatedItem.paymentStatus, updatedItem.amountPaid || null,
        updatedItem.adminNotes || null, id
      );
    } catch (err) {
      console.error('[OnDemand Storage] Error updating request in database:', err);
    }
  }

  const local = readLocalRequests();
  const index = local.findIndex(r => r.id === id);
  if (index !== -1) {
    local[index] = updatedItem;
    writeLocalRequests(local);
  }

  return updatedItem;
}

export async function deleteOnDemandRequest(id: string): Promise<boolean> {
  let deletedFromDb = false;
  const dbReady = await ensureTables();
  if (dbReady) {
    try {
      const result: number = await prisma.$executeRawUnsafe(`
        DELETE FROM "on_demand_requests" WHERE "id" = $1;
      `, id);
      deletedFromDb = result > 0;
    } catch (err) {
      console.error('[OnDemand Storage] Error deleting request from database:', err);
    }
  }

  const local = readLocalRequests();
  const next = local.filter(r => r.id !== id);
  writeLocalRequests(next);

  return deletedFromDb || next.length < local.length;
}

// ── STATS (POSTGRESQL + LOCAL FALLBACK) ────────────────────────────────────

export async function getOnDemandStats(): Promise<OnDemandStats> {
  const requests = await getOnDemandRequests();
  const pros = await getOnDemandPros();

  const totalRequests = requests.length;
  const activeRequests = requests.filter(r => r.status === 'pending' || r.status === 'assigned' || r.status === 'in_progress').length;
  const completedRequests = requests.filter(r => r.status === 'completed').length;

  const totalPros = pros.length;
  const verifiedPros = pros.filter(p => p.status === 'verified_active').length;

  // Commission earned from completed or paid jobs
  const totalCommissionEarned = requests
    .filter(r => r.status === 'completed' || r.paymentStatus === 'paid')
    .reduce((sum, r) => sum + (r.platformCommissionAmount || 0), 0);

  // Onboarding fees collected from verified / paid pros (Le 30 each)
  const totalOnboardingFeesCollected = pros
    .filter(p => p.onboardingFeeStatus === 'paid')
    .reduce((sum, p) => sum + (p.onboardingFeeAmount || 30), 0);

  return {
    totalRequests,
    activeRequests,
    completedRequests,
    totalPros,
    verifiedPros,
    totalCommissionEarned: Math.round(totalCommissionEarned * 100) / 100,
    totalOnboardingFeesCollected,
  };
}
