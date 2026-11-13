import fs from 'fs';
import path from 'path';

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
  status: 'pending_payment' | 'pending_review' | 'verified_active' | 'inactive' | 'suspended';
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

const INITIAL_PROS: OnDemandPro[] = [
  {
    id: 'PRO-1001',
    fullName: 'Alpha Koroma',
    phone: '+23278123456',
    whatsapp: '+23278123456',
    email: 'alpha.koroma@freetowntech.sl',
    address: '14 Percival Street, Central Freetown',
    mobileMoneyNumber: '+23278123456',
    mobileMoneyProvider: 'orange',
    primaryTrade: 'Printer & Copier Technician',
    secondarySkills: 'LaserJet, InkTank, Plotters, Scanner repair',
    yearsOfExperience: 6,
    coverageAreas: ['Central', 'Wilberforce', 'Lumley', 'Aberdeen'],
    nationalIdNumber: 'VOT-782190',
    onboardingFeeAmount: 30,
    onboardingFeeStatus: 'paid',
    onboardingPaymentRef: 'OM-TXN-984210',
    status: 'verified_active',
    rating: 4.9,
    completedJobsCount: 14,
    totalEarned: 4800,
    bioOrWorkSummary: 'Certified HP and Canon hardware technician with 6+ years servicing corporate printers across Freetown.',
    createdAt: '2026-11-01T10:00:00Z',
    updatedAt: '2026-11-01T10:00:00Z',
  },
  {
    id: 'PRO-1002',
    fullName: 'Mohamed Sesay',
    phone: '+23276654321',
    whatsapp: '+23276654321',
    email: 'sesay.electrical@gmail.com',
    address: '28 Main Motor Road, Congo Cross, Freetown',
    mobileMoneyNumber: '+23276654321',
    mobileMoneyProvider: 'orange',
    primaryTrade: 'Certified Electrician',
    secondarySkills: 'Generator changeovers, Inverter wiring, Breaker panel troubleshooting',
    yearsOfExperience: 8,
    coverageAreas: ['Aberdeen', 'Lumley', 'Juba', 'Goderich', 'Wilberforce'],
    nationalIdNumber: 'VOT-541299',
    onboardingFeeAmount: 30,
    onboardingFeeStatus: 'paid',
    onboardingPaymentRef: 'OM-TXN-112344',
    status: 'verified_active',
    rating: 5.0,
    completedJobsCount: 22,
    totalEarned: 7650,
    bioOrWorkSummary: 'Experienced domestic and commercial electrical technician specializing in fault tracing and safe distribution.',
    createdAt: '2026-11-02T11:30:00Z',
    updatedAt: '2026-11-02T11:30:00Z',
  },
  {
    id: 'PRO-1003',
    fullName: 'Francis Conteh',
    phone: '+23288998877',
    whatsapp: '+23288998877',
    address: '7 Sanders Street, Central Freetown',
    mobileMoneyNumber: '+23288998877',
    mobileMoneyProvider: 'afri',
    primaryTrade: 'Gaming Console & Electronics Repair',
    secondarySkills: 'PS4, PS5, Xbox Series X, Nintendo Switch, HDMI port micro-soldering',
    yearsOfExperience: 5,
    coverageAreas: ['Central', 'Congo Cross', 'Kissy', 'Lumley'],
    nationalIdNumber: 'VOT-902143',
    onboardingFeeAmount: 30,
    onboardingFeeStatus: 'paid',
    onboardingPaymentRef: 'AFRI-998812',
    status: 'verified_active',
    rating: 4.8,
    completedJobsCount: 19,
    totalEarned: 5200,
    bioOrWorkSummary: 'Micro-soldering specialist for gaming consoles, liquid metal repasting, power supply repair, and motherboard reflow.',
    createdAt: '2026-11-03T14:15:00Z',
    updatedAt: '2026-11-03T14:15:00Z',
  },
];

const INITIAL_REQUESTS: OnDemandRequest[] = [
  {
    id: 'ODS-5001',
    category: 'printer-tech',
    categoryTitle: 'Printer & Copier Technician',
    customerName: 'Kallon Logistics Services',
    phone: '+23279112233',
    whatsapp: '+23279112233',
    email: 'operations@kallonlogistics.sl',
    locationArea: 'Central',
    addressDetails: '14 Siaka Stevens Street, 2nd Floor',
    urgency: '24h',
    problemDescription: 'HP LaserJet Enterprise roller is jamming on double-sided prints, and error 49.38.07 is showing.',
    status: 'assigned',
    assignedProId: 'PRO-1001',
    assignedProName: 'Alpha Koroma',
    assignedProPhone: '+23278123456',
    jobTotalCost: 750,
    platformCommissionRate: 0.15,
    platformCommissionAmount: 112.5,
    proPayoutAmount: 637.5,
    paymentStatus: 'part_payment',
    amountPaid: 300,
    adminNotes: 'Alpha dispatched for 10am diagnostic inspection.',
    createdAt: '2026-11-08T09:00:00Z',
    updatedAt: '2026-11-08T10:30:00Z',
  },
];

export async function getOnDemandRequests(): Promise<OnDemandRequest[]> {
  try {
    if (fs.existsSync(REQUESTS_FILE)) {
      const data = JSON.parse(fs.readFileSync(REQUESTS_FILE, 'utf-8'));
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {}

  try {
    if (fs.existsSync(TMP_REQUESTS_FILE)) {
      const data = JSON.parse(fs.readFileSync(TMP_REQUESTS_FILE, 'utf-8'));
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {}

  // Write initial seed
  await saveAllRequests(INITIAL_REQUESTS);
  return INITIAL_REQUESTS;
}

export async function saveAllRequests(requests: OnDemandRequest[]): Promise<void> {
  try {
    ensureDir(REQUESTS_FILE);
    fs.writeFileSync(REQUESTS_FILE, JSON.stringify(requests, null, 2), 'utf-8');
  } catch {}
  try {
    ensureDir(TMP_REQUESTS_FILE);
    fs.writeFileSync(TMP_REQUESTS_FILE, JSON.stringify(requests, null, 2), 'utf-8');
  } catch {}
}

export async function saveOnDemandRequest(input: Partial<OnDemandRequest>): Promise<OnDemandRequest> {
  const all = await getOnDemandRequests();
  const id = input.id || `ODS-${Math.floor(10000 + Math.random() * 90000)}`;
  const now = new Date().toISOString();

  const totalCost = input.jobTotalCost || 0;
  const commissionRate = input.platformCommissionRate || 0.15;
  const commissionAmount = totalCost > 0 ? Math.round(totalCost * commissionRate * 100) / 100 : undefined;
  const proPayout = totalCost > 0 ? Math.round(totalCost * (1 - commissionRate) * 100) / 100 : undefined;

  const newRecord: OnDemandRequest = {
    id,
    category: input.category || 'other',
    categoryTitle: input.categoryTitle || 'Specialized Service',
    customerName: input.customerName || 'Customer',
    phone: input.phone || '',
    whatsapp: input.whatsapp || input.phone || '',
    email: input.email,
    locationArea: input.locationArea || 'Freetown',
    addressDetails: input.addressDetails || '',
    urgency: input.urgency || '24h',
    problemDescription: input.problemDescription || '',
    preferredDate: input.preferredDate,
    preferredTime: input.preferredTime,
    status: input.status || 'pending',
    assignedProId: input.assignedProId,
    assignedProName: input.assignedProName,
    assignedProPhone: input.assignedProPhone,
    jobTotalCost: totalCost || undefined,
    platformCommissionRate: commissionRate,
    platformCommissionAmount: commissionAmount,
    proPayoutAmount: proPayout,
    paymentStatus: input.paymentStatus || 'pending',
    amountPaid: input.amountPaid || 0,
    adminNotes: input.adminNotes,
    createdAt: input.createdAt || now,
    updatedAt: now,
  };

  const updated = [newRecord, ...all];
  await saveAllRequests(updated);
  return newRecord;
}

export async function updateOnDemandRequest(id: string, updates: Partial<OnDemandRequest>): Promise<OnDemandRequest | null> {
  const all = await getOnDemandRequests();
  const index = all.findIndex(r => r.id === id);
  if (index === -1) return null;

  const current = all[index];
  const totalCost = updates.jobTotalCost !== undefined ? updates.jobTotalCost : current.jobTotalCost;
  const commissionRate = updates.platformCommissionRate !== undefined ? updates.platformCommissionRate : current.platformCommissionRate;
  
  let commissionAmount = current.platformCommissionAmount;
  let proPayout = current.proPayoutAmount;
  if (totalCost && totalCost > 0) {
    commissionAmount = Math.round(totalCost * commissionRate * 100) / 100;
    proPayout = Math.round(totalCost * (1 - commissionRate) * 100) / 100;
  }

  const updatedItem: OnDemandRequest = {
    ...current,
    ...updates,
    jobTotalCost: totalCost,
    platformCommissionRate: commissionRate,
    platformCommissionAmount: commissionAmount,
    proPayoutAmount: proPayout,
    updatedAt: new Date().toISOString(),
  };

  all[index] = updatedItem;
  await saveAllRequests(all);
  return updatedItem;
}

export async function deleteOnDemandRequest(id: string): Promise<boolean> {
  const all = await getOnDemandRequests();
  const filtered = all.filter(r => r.id !== id);
  if (filtered.length === all.length) return false;
  await saveAllRequests(filtered);
  return true;
}

// ── PROS ───────────────────────────────────────────────────────────────────

export async function getOnDemandPros(): Promise<OnDemandPro[]> {
  try {
    if (fs.existsSync(PROS_FILE)) {
      const data = JSON.parse(fs.readFileSync(PROS_FILE, 'utf-8'));
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {}

  try {
    if (fs.existsSync(TMP_PROS_FILE)) {
      const data = JSON.parse(fs.readFileSync(TMP_PROS_FILE, 'utf-8'));
      if (Array.isArray(data) && data.length > 0) return data;
    }
  } catch {}

  await saveAllPros(INITIAL_PROS);
  return INITIAL_PROS;
}

export async function saveAllPros(pros: OnDemandPro[]): Promise<void> {
  try {
    ensureDir(PROS_FILE);
    fs.writeFileSync(PROS_FILE, JSON.stringify(pros, null, 2), 'utf-8');
  } catch {}
  try {
    ensureDir(TMP_PROS_FILE);
    fs.writeFileSync(TMP_PROS_FILE, JSON.stringify(pros, null, 2), 'utf-8');
  } catch {}
}

export async function saveOnDemandPro(input: Partial<OnDemandPro>): Promise<OnDemandPro> {
  const all = await getOnDemandPros();
  const id = input.id || `PRO-${Math.floor(1000 + Math.random() * 9000)}`;
  const now = new Date().toISOString();

  const newRecord: OnDemandPro = {
    id,
    fullName: input.fullName || '',
    phone: input.phone || '',
    password: input.password || '',
    whatsapp: input.whatsapp || input.phone || '',
    email: input.email?.trim() || undefined,
    address: input.address?.trim() || '',
    mobileMoneyNumber: input.mobileMoneyNumber || input.phone || '',
    mobileMoneyProvider: input.mobileMoneyProvider || 'orange',
    primaryTrade: input.primaryTrade || 'General Technician',
    secondarySkills: input.secondarySkills,
    yearsOfExperience: input.yearsOfExperience || 1,
    coverageAreas: input.coverageAreas || ['Central Freetown'],
    nationalIdNumber: input.nationalIdNumber,
    profilePhoto: input.profilePhoto,
    idCardFrontPhoto: input.idCardFrontPhoto || input.idCardPhoto,
    idCardBackPhoto: input.idCardBackPhoto,
    idCardPhoto: input.idCardFrontPhoto || input.idCardPhoto,
    onboardingFeeAmount: 30, // Fixed Le 30 commitment fee
    onboardingFeeStatus: input.onboardingFeeStatus || 'pending_verification',
    onboardingPaymentRef: input.onboardingPaymentRef,
    status: input.status || 'pending_review',
    rating: 5.0,
    completedJobsCount: 0,
    totalEarned: 0,
    bioOrWorkSummary: input.bioOrWorkSummary,
    createdAt: input.createdAt || now,
    updatedAt: now,
  };

  const updated = [newRecord, ...all];
  await saveAllPros(updated);
  return newRecord;
}

export async function updateOnDemandPro(id: string, updates: Partial<OnDemandPro>): Promise<OnDemandPro | null> {
  const all = await getOnDemandPros();
  const index = all.findIndex(p => p.id === id);
  if (index === -1) return null;

  const current = all[index];
  const updatedItem: OnDemandPro = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  all[index] = updatedItem;
  await saveAllPros(all);
  return updatedItem;
}

export async function deleteOnDemandPro(id: string): Promise<boolean> {
  const all = await getOnDemandPros();
  const filtered = all.filter(p => p.id !== id);
  if (filtered.length === all.length) return false;
  await saveAllPros(filtered);
  return true;
}

// ── STATS ──────────────────────────────────────────────────────────────────

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
