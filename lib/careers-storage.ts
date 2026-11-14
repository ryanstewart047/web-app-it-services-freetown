import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';
import { saveOnDemandPro, OnDemandPro } from '@/lib/on-demand-storage';

export interface JobApplication {
  id: string; // e.g. 'APP-2026-7491'
  jobId: string; // e.g. 'printer-tech'
  jobTitle: string; // 'Printer & Copier Repair'
  fullName: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  gender?: string;
  dateOfBirth?: string;
  locationArea: string; // e.g. 'Central Freetown', 'Lumley'
  residentialAddress: string; // Mandatory physical address
  yearsExperience: number | string;
  secondarySkills?: string;
  toolOwnership: 'fully_equipped' | 'partially_equipped' | 'basic_tools' | 'need_tools';
  transportMode?: 'motorbike' | 'commercial' | 'private_car' | 'on_foot';
  availability: 'immediate_fulltime' | 'part_time' | 'weekends_only' | 'emergency_oncall';
  workSummary?: string;
  pastWorkPhotos?: string[]; // base64 or photo URLs
  nationalIdNumber?: string;
  idCardPhoto?: string;
  resumeUrlOrData?: string;
  mobileMoneyProvider: 'orange' | 'afrimoney';
  mobileMoneyNumber: string;
  status: 'pending' | 'reviewed' | 'shortlisted' | 'interview_scheduled' | 'hired' | 'rejected';
  adminNotes?: string;
  rating?: number; // 1 to 5 stars
  interviewDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CareersStats {
  totalApplications: number;
  pendingCount: number;
  reviewedCount: number;
  shortlistedCount: number;
  hiredCount: number;
  rejectedCount: number;
  applicationsByJob: Record<string, number>;
  applicationsByArea: Record<string, number>;
}

const APPLICATIONS_FILE = path.join(process.cwd(), 'data', 'job_applications.json');
const TMP_APPLICATIONS_FILE = path.join('/tmp', 'job_applications.json');

function ensureDir(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

let tablesInitialized = false;

export async function ensureCareersTables(): Promise<boolean> {
  if (tablesInitialized) return true;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "job_applications" (
        "id" TEXT PRIMARY KEY,
        "jobId" TEXT NOT NULL,
        "jobTitle" TEXT NOT NULL,
        "fullName" TEXT NOT NULL,
        "phone" TEXT NOT NULL,
        "whatsapp" TEXT,
        "email" TEXT,
        "gender" TEXT,
        "dateOfBirth" TEXT,
        "locationArea" TEXT NOT NULL,
        "residentialAddress" TEXT NOT NULL,
        "yearsExperience" TEXT NOT NULL DEFAULT '1-2',
        "secondarySkills" TEXT,
        "toolOwnership" TEXT NOT NULL DEFAULT 'basic_tools',
        "transportMode" TEXT DEFAULT 'commercial',
        "availability" TEXT NOT NULL DEFAULT 'immediate_fulltime',
        "workSummary" TEXT,
        "pastWorkPhotos" TEXT,
        "nationalIdNumber" TEXT,
        "idCardPhoto" TEXT,
        "resumeUrlOrData" TEXT,
        "mobileMoneyProvider" TEXT NOT NULL DEFAULT 'orange',
        "mobileMoneyNumber" TEXT NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'pending',
        "adminNotes" TEXT,
        "rating" INTEGER DEFAULT 5,
        "interviewDate" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS "job_applications_jobId_idx" ON "job_applications"("jobId");
      CREATE INDEX IF NOT EXISTS "job_applications_status_idx" ON "job_applications"("status");
      CREATE INDEX IF NOT EXISTS "job_applications_createdAt_idx" ON "job_applications"("createdAt" DESC);
    `);

    tablesInitialized = true;
    return true;
  } catch (err) {
    console.warn('[Careers Storage] PostgreSQL table setup failed, using local file backup:', err);
    return false;
  }
}

// ── LOCAL FILE READ / WRITE ────────────────────────────────────────────────

function readLocalApplications(): JobApplication[] {
  try {
    if (fs.existsSync(APPLICATIONS_FILE)) {
      const data = JSON.parse(fs.readFileSync(APPLICATIONS_FILE, 'utf-8'));
      if (Array.isArray(data)) return data;
    }
  } catch {}
  try {
    if (fs.existsSync(TMP_APPLICATIONS_FILE)) {
      const data = JSON.parse(fs.readFileSync(TMP_APPLICATIONS_FILE, 'utf-8'));
      if (Array.isArray(data)) return data;
    }
  } catch {}
  return [];
}

function writeLocalApplications(apps: JobApplication[]): void {
  try {
    ensureDir(APPLICATIONS_FILE);
    fs.writeFileSync(APPLICATIONS_FILE, JSON.stringify(apps, null, 2), 'utf-8');
  } catch {}
  try {
    ensureDir(TMP_APPLICATIONS_FILE);
    fs.writeFileSync(TMP_APPLICATIONS_FILE, JSON.stringify(apps, null, 2), 'utf-8');
  } catch {}
}

function rowToApplication(row: any): JobApplication {
  let pastWorkPhotos: string[] = [];
  if (Array.isArray(row.pastWorkPhotos)) {
    pastWorkPhotos = row.pastWorkPhotos;
  } else if (typeof row.pastWorkPhotos === 'string' && row.pastWorkPhotos.trim()) {
    try {
      pastWorkPhotos = JSON.parse(row.pastWorkPhotos);
    } catch {
      pastWorkPhotos = [row.pastWorkPhotos];
    }
  }

  return {
    id: String(row.id),
    jobId: String(row.jobId || ''),
    jobTitle: String(row.jobTitle || ''),
    fullName: String(row.fullName || ''),
    phone: String(row.phone || ''),
    whatsapp: row.whatsapp ? String(row.whatsapp) : undefined,
    email: row.email ? String(row.email) : undefined,
    gender: row.gender ? String(row.gender) : undefined,
    dateOfBirth: row.dateOfBirth ? String(row.dateOfBirth) : undefined,
    locationArea: String(row.locationArea || 'Freetown'),
    residentialAddress: String(row.residentialAddress || ''),
    yearsExperience: row.yearsExperience || '1-2',
    secondarySkills: row.secondarySkills ? String(row.secondarySkills) : undefined,
    toolOwnership: (row.toolOwnership as any) || 'basic_tools',
    transportMode: (row.transportMode as any) || 'commercial',
    availability: (row.availability as any) || 'immediate_fulltime',
    workSummary: row.workSummary ? String(row.workSummary) : undefined,
    pastWorkPhotos,
    nationalIdNumber: row.nationalIdNumber ? String(row.nationalIdNumber) : undefined,
    idCardPhoto: row.idCardPhoto ? String(row.idCardPhoto) : undefined,
    resumeUrlOrData: row.resumeUrlOrData ? String(row.resumeUrlOrData) : undefined,
    mobileMoneyProvider: (row.mobileMoneyProvider as any) || 'orange',
    mobileMoneyNumber: String(row.mobileMoneyNumber || row.phone || ''),
    status: (row.status as any) || 'pending',
    adminNotes: row.adminNotes ? String(row.adminNotes) : undefined,
    rating: row.rating !== null && row.rating !== undefined ? Number(row.rating) : 5,
    interviewDate: row.interviewDate ? String(row.interviewDate) : undefined,
    createdAt: row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt || new Date().toISOString()),
    updatedAt: row.updatedAt instanceof Date ? row.updatedAt.toISOString() : String(row.updatedAt || new Date().toISOString()),
  };
}

// ── CRUD OPERATIONS ────────────────────────────────────────────────────────

export async function getJobApplications(filters?: {
  status?: string;
  jobId?: string;
  locationArea?: string;
  search?: string;
}): Promise<JobApplication[]> {
  const dbReady = await ensureCareersTables();
  let apps: JobApplication[] = [];

  if (dbReady) {
    try {
      const rows: any[] = await prisma.$queryRawUnsafe(`
        SELECT * FROM "job_applications" ORDER BY "createdAt" DESC;
      `);
      if (Array.isArray(rows)) {
        apps = rows.map(rowToApplication);
      }
    } catch (err) {
      console.error('[Careers Storage] Error querying job applications from DB:', err);
      apps = readLocalApplications();
    }
  } else {
    apps = readLocalApplications();
  }

  // Apply in-memory filtering if requested
  if (filters) {
    const { status, jobId, locationArea, search } = filters;
    if (status && status !== 'all') {
      apps = apps.filter(a => a.status === status);
    }
    if (jobId && jobId !== 'all') {
      apps = apps.filter(a => a.jobId === jobId);
    }
    if (locationArea && locationArea !== 'all') {
      apps = apps.filter(a => a.locationArea.toLowerCase().includes(locationArea.toLowerCase()));
    }
    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      apps = apps.filter(a => 
        a.fullName.toLowerCase().includes(q) ||
        a.phone.includes(q) ||
        (a.email && a.email.toLowerCase().includes(q)) ||
        a.jobTitle.toLowerCase().includes(q) ||
        a.residentialAddress.toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q)
      );
    }
  }

  return apps;
}

export async function getJobApplicationById(id: string): Promise<JobApplication | null> {
  const cleanId = id?.trim();
  if (!cleanId) return null;

  const dbReady = await ensureCareersTables();
  if (dbReady) {
    try {
      const rows: any[] = await prisma.$queryRawUnsafe(`
        SELECT * FROM "job_applications" WHERE "id" = $1 OR LOWER("id") = LOWER($1) LIMIT 1;
      `, cleanId);
      if (rows && rows.length > 0) {
        return rowToApplication(rows[0]);
      }
    } catch (err) {
      console.error('[Careers Storage] Error getting application by ID:', err);
    }
  }

  const local = readLocalApplications();
  return local.find(a => a.id.toLowerCase() === cleanId.toLowerCase()) || null;
}

export async function createJobApplication(data: Omit<JobApplication, 'id' | 'createdAt' | 'updatedAt' | 'status'> & { id?: string }): Promise<JobApplication> {
  const now = new Date().toISOString();
  const id = data.id || `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

  const newApp: JobApplication = {
    ...data,
    id,
    status: 'pending',
    rating: 5,
    createdAt: now,
    updatedAt: now,
  };

  // 1. Save to local file backup
  const current = readLocalApplications();
  const filtered = current.filter(a => a.id !== id);
  filtered.unshift(newApp);
  writeLocalApplications(filtered);

  // 2. Save to PostgreSQL
  const dbReady = await ensureCareersTables();
  if (dbReady) {
    try {
      await prisma.$executeRawUnsafe(`
        INSERT INTO "job_applications" (
          "id", "jobId", "jobTitle", "fullName", "phone", "whatsapp", "email",
          "gender", "dateOfBirth", "locationArea", "residentialAddress",
          "yearsExperience", "secondarySkills", "toolOwnership", "transportMode",
          "availability", "workSummary", "pastWorkPhotos", "nationalIdNumber",
          "idCardPhoto", "resumeUrlOrData", "mobileMoneyProvider", "mobileMoneyNumber",
          "status", "adminNotes", "rating", "interviewDate", "createdAt", "updatedAt"
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
          $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28::timestamp, $29::timestamp
        )
        ON CONFLICT ("id") DO UPDATE SET
          "jobTitle" = EXCLUDED."jobTitle",
          "fullName" = EXCLUDED."fullName",
          "phone" = EXCLUDED."phone",
          "status" = EXCLUDED."status",
          "updatedAt" = EXCLUDED."updatedAt";
      `,
        newApp.id,
        newApp.jobId,
        newApp.jobTitle,
        newApp.fullName,
        newApp.phone,
        newApp.whatsapp || null,
        newApp.email || null,
        newApp.gender || null,
        newApp.dateOfBirth || null,
        newApp.locationArea,
        newApp.residentialAddress,
        String(newApp.yearsExperience),
        newApp.secondarySkills || null,
        newApp.toolOwnership,
        newApp.transportMode || null,
        newApp.availability,
        newApp.workSummary || null,
        newApp.pastWorkPhotos && newApp.pastWorkPhotos.length > 0 ? JSON.stringify(newApp.pastWorkPhotos) : null,
        newApp.nationalIdNumber || null,
        newApp.idCardPhoto || null,
        newApp.resumeUrlOrData || null,
        newApp.mobileMoneyProvider,
        newApp.mobileMoneyNumber,
        newApp.status,
        newApp.adminNotes || null,
        newApp.rating || 5,
        newApp.interviewDate || null,
        new Date(newApp.createdAt),
        new Date(newApp.updatedAt)
      );
    } catch (err) {
      console.error('[Careers Storage] Error inserting job application into DB:', err);
    }
  }

  return newApp;
}

export async function updateJobApplication(id: string, updates: Partial<JobApplication>): Promise<JobApplication | null> {
  const current = await getJobApplicationById(id);
  if (!current) return null;

  const updated: JobApplication = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  // 1. Update local file
  const local = readLocalApplications();
  const idx = local.findIndex(a => a.id.toLowerCase() === id.toLowerCase());
  if (idx !== -1) {
    local[idx] = updated;
  } else {
    local.unshift(updated);
  }
  writeLocalApplications(local);

  // 2. Update PostgreSQL
  const dbReady = await ensureCareersTables();
  if (dbReady) {
    try {
      await prisma.$executeRawUnsafe(`
        UPDATE "job_applications" SET
          "status" = $1,
          "adminNotes" = $2,
          "rating" = $3,
          "interviewDate" = $4,
          "updatedAt" = $5::timestamp
        WHERE "id" = $6;
      `,
        updated.status,
        updated.adminNotes || null,
        updated.rating || 5,
        updated.interviewDate || null,
        new Date(updated.updatedAt),
        updated.id
      );
    } catch (err) {
      console.error('[Careers Storage] Error updating application in DB:', err);
    }
  }

  return updated;
}

export async function deleteJobApplication(id: string): Promise<boolean> {
  const cleanId = id?.trim();
  if (!cleanId) return false;

  // 1. Remove from local file
  const local = readLocalApplications();
  const filtered = local.filter(a => a.id.toLowerCase() !== cleanId.toLowerCase());
  writeLocalApplications(filtered);

  // 2. Remove from PostgreSQL
  const dbReady = await ensureCareersTables();
  if (dbReady) {
    try {
      await prisma.$executeRawUnsafe(`
        DELETE FROM "job_applications" WHERE "id" = $1 OR LOWER("id") = LOWER($1);
      `, cleanId);
    } catch (err) {
      console.error('[Careers Storage] Error deleting application from DB:', err);
    }
  }

  return true;
}

export async function getCareersStats(): Promise<CareersStats> {
  const all = await getJobApplications();

  const stats: CareersStats = {
    totalApplications: all.length,
    pendingCount: 0,
    reviewedCount: 0,
    shortlistedCount: 0,
    hiredCount: 0,
    rejectedCount: 0,
    applicationsByJob: {},
    applicationsByArea: {},
  };

  for (const app of all) {
    if (app.status === 'pending') stats.pendingCount++;
    else if (app.status === 'reviewed') stats.reviewedCount++;
    else if (app.status === 'shortlisted' || app.status === 'interview_scheduled') stats.shortlistedCount++;
    else if (app.status === 'hired') stats.hiredCount++;
    else if (app.status === 'rejected') stats.rejectedCount++;

    stats.applicationsByJob[app.jobTitle] = (stats.applicationsByJob[app.jobTitle] || 0) + 1;
    stats.applicationsByArea[app.locationArea] = (stats.applicationsByArea[app.locationArea] || 0) + 1;
  }

  return stats;
}

/**
 * One-Click Conversion: Converts a hired/shortlisted applicant directly into an active OnDemandPro
 */
export async function convertApplicantToPro(applicationId: string): Promise<{ success: boolean; pro?: OnDemandPro; error?: string }> {
  const app = await getJobApplicationById(applicationId);
  if (!app) {
    return { success: false, error: 'Application not found' };
  }

  try {
    // Generate a secure temporary password
    const tempPassword = `Pro${Math.floor(100000 + Math.random() * 900000)}!`;
    const tempExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days

    const proData: Omit<OnDemandPro, 'id' | 'createdAt' | 'updatedAt'> = {
      fullName: app.fullName,
      phone: app.phone,
      password: tempPassword,
      mustChangePassword: true,
      tempPasswordExpiresAt: tempExpires,
      whatsapp: app.whatsapp || app.phone,
      email: app.email,
      address: app.residentialAddress,
      mobileMoneyNumber: app.mobileMoneyNumber || app.phone,
      mobileMoneyProvider: app.mobileMoneyProvider === 'afrimoney' ? 'afri' : 'orange',
      primaryTrade: app.jobId,
      secondarySkills: app.secondarySkills,
      yearsOfExperience: typeof app.yearsExperience === 'number' ? app.yearsExperience : parseInt(String(app.yearsExperience), 10) || 2,
      coverageAreas: [app.locationArea || 'Central Freetown'],
      nationalIdNumber: app.nationalIdNumber,
      idCardFrontPhoto: app.idCardPhoto,
      idCardPhoto: app.idCardPhoto,
      onboardingFeeAmount: 30,
      onboardingFeeStatus: 'paid',
      status: 'verified_active', // Direct onboarding as active vetted pro
      rating: 5.0,
      completedJobsCount: 0,
      totalEarned: 0,
      bioOrWorkSummary: app.workSummary || `Certified ${app.jobTitle} specialist covering ${app.locationArea}.`,
    };

    const savedPro = await saveOnDemandPro(proData);

    // Update application status to 'hired'
    await updateJobApplication(app.id, {
      status: 'hired',
      adminNotes: (app.adminNotes ? app.adminNotes + ' | ' : '') + `Converted to active Pro #${savedPro.id} on ${new Date().toLocaleDateString()}`,
    });

    return { success: true, pro: savedPro };
  } catch (err: any) {
    console.error('[Careers Storage] Failed to convert applicant to pro:', err);
    return { success: false, error: err.message || 'Failed to convert applicant to pro' };
  }
}
