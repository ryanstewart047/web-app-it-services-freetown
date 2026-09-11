import fs from 'fs';
import path from 'path';
import { prisma } from '@/lib/prisma';

export interface TrackRecordSettings {
  baselineDevices: number;
  offlineDevices: number;
  baselineCustomers: number;
  offlineCustomers: number;
  successRate: number;
  responseTimeHours: number;
  updatedAt?: string;
}

export interface TrackRecordTotals {
  devices: number;
  customers: number;
  successRate: number;
  responseTime: number;
  breakdown: {
    baselineDevices: number;
    offlineDevices: number;
    liveDevices: number;
    baselineCustomers: number;
    offlineCustomers: number;
    liveCustomers: number;
    totalOnlineRepairs: number;
    totalOnlineAppointments: number;
    totalOnlineCustomers: number;
  };
  updatedAt: string;
}

export const DEFAULT_TRACK_RECORD_SETTINGS: TrackRecordSettings = {
  baselineDevices: 450,
  offlineDevices: 0,
  baselineCustomers: 300,
  offlineCustomers: 0,
  successRate: 98,
  responseTimeHours: 2,
};

function getStoragePaths(): string[] {
  return [
    path.join(process.cwd(), 'data', 'track-record-settings.json'),
    path.join('/tmp', 'track-record-settings.json'),
  ];
}

export function loadTrackRecordSettings(): TrackRecordSettings {
  for (const filePath of getStoragePaths()) {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          return {
            ...DEFAULT_TRACK_RECORD_SETTINGS,
            ...parsed,
          };
        }
      }
    } catch (_) {}
  }
  return { ...DEFAULT_TRACK_RECORD_SETTINGS };
}

export function saveTrackRecordSettings(settings: Partial<TrackRecordSettings>): TrackRecordSettings {
  const current = loadTrackRecordSettings();
  const updated: TrackRecordSettings = {
    ...current,
    ...settings,
    updatedAt: new Date().toISOString(),
  };

  for (const filePath of getStoragePaths()) {
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf8');
    } catch (_) {}
  }

  return updated;
}

/**
 * Calculates real live numbers from the database combined with baseline & offline additions.
 * Per business rules:
 * - Every repair and appointment in the database is counted towards devices/bookings.
 * - Every customer and booking is counted as a happy customer, even if cancelled.
 */
export async function getTrackRecordData(): Promise<TrackRecordTotals> {
  const settings = loadTrackRecordSettings();

  let totalOnlineRepairs = 0;
  let totalOnlineAppointments = 0;
  let totalOnlineCustomers = 0;

  try {
    const [repairCount, appointmentCount, customerCount] = await Promise.all([
      prisma.repair.count().catch(() => 0),
      prisma.appointment.count().catch(() => 0),
      prisma.customer.count().catch(() => 0),
    ]);

    totalOnlineRepairs = repairCount;
    totalOnlineAppointments = appointmentCount;
    totalOnlineCustomers = customerCount;
  } catch (err) {
    console.error('[TrackRecordStore] Error reading live DB counts:', err);
  }

  // Count live devices: All online repairs logged + any standalone appointments
  // (In practice, some appointments may link to a repair. To be comprehensive and conservative,
  // we count total online repairs plus any additional appointments).
  const liveDevices = Math.max(totalOnlineRepairs, totalOnlineAppointments) || (totalOnlineRepairs + totalOnlineAppointments);

  // Count live customers: Every customer and booking counts
  const liveCustomers = Math.max(totalOnlineCustomers, totalOnlineAppointments) || totalOnlineCustomers;

  const totalDevices = (settings.baselineDevices || 450) + (settings.offlineDevices || 0) + liveDevices;
  const totalCustomers = (settings.baselineCustomers || 300) + (settings.offlineCustomers || 0) + liveCustomers;

  return {
    devices: totalDevices,
    customers: totalCustomers,
    successRate: settings.successRate || 98,
    responseTime: settings.responseTimeHours || 2,
    breakdown: {
      baselineDevices: settings.baselineDevices || 450,
      offlineDevices: settings.offlineDevices || 0,
      liveDevices,
      baselineCustomers: settings.baselineCustomers || 300,
      offlineCustomers: settings.offlineCustomers || 0,
      liveCustomers,
      totalOnlineRepairs,
      totalOnlineAppointments,
      totalOnlineCustomers,
    },
    updatedAt: settings.updatedAt || new Date().toISOString(),
  };
}
