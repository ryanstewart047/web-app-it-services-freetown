// Repair tracking ID generator and utilities

export function generateRepairId(): string {
  const prefix = 'RT';
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}${random}`;
}

export function generateAppointmentId(): string {
  const prefix = 'TRK';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}${random}`;
}

export function generateSessionId(): string {
  const prefix = 'CS';
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}${random}`;
}

// Repair status definitions
export const REPAIR_STATUSES = {
  RECEIVED: 'received',
  DIAGNOSTIC: 'diagnostic', 
  PARTS_ORDERED: 'parts-ordered',
  IN_REPAIR: 'in-repair',
  TESTING: 'testing',
  COMPLETED: 'completed',
  READY_PICKUP: 'ready-pickup',
  COLLECTED: 'collected',
  DELIVERED: 'delivered'
} as const;

export const APPOINTMENT_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in-progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
} as const;

export const CHAT_STATUSES = {
  ACTIVE: 'active',
  WAITING_AGENT: 'waiting-agent',
  AGENT_JOINED: 'agent-joined',
  ENDED: 'ended'
} as const;

// Status messages for customers
export const STATUS_MESSAGES = {
  [REPAIR_STATUSES.RECEIVED]: 'Your device has been received and logged into our system.',
  [REPAIR_STATUSES.DIAGNOSTIC]: 'Our technicians are diagnosing the issue with your device.',
  [REPAIR_STATUSES.PARTS_ORDERED]: 'Required parts have been ordered for your repair.',
  [REPAIR_STATUSES.IN_REPAIR]: 'Your device is currently being repaired by our expert technicians.',
  [REPAIR_STATUSES.TESTING]: 'Repair completed. Running final tests to ensure everything works perfectly.',
  [REPAIR_STATUSES.COMPLETED]: 'Your device has been successfully repaired and tested.',
  [REPAIR_STATUSES.READY_PICKUP]: 'Your device is ready for pickup! Please bring your ID and repair receipt.',
  [REPAIR_STATUSES.COLLECTED]: 'Your device has been collected. Thank you for choosing IT Services Freetown!',
  [REPAIR_STATUSES.DELIVERED]: 'Your repaired device has been delivered successfully.'
};

// Timeline steps for repair process
export const REPAIR_TIMELINE_STEPS = [
  { step: 'received', label: 'Device Received', description: 'Device logged into our system' },
  { step: 'diagnostic', label: 'Diagnostic', description: 'Identifying the issue' },
  { step: 'parts-ordered', label: 'Parts Ordered', description: 'Ordering required components' },
  { step: 'in-repair', label: 'Under Repair', description: 'Actively fixing the device' },
  { step: 'testing', label: 'Testing', description: 'Quality assurance testing' },
  { step: 'completed', label: 'Completed', description: 'Repair finished successfully' },
  { step: 'ready-pickup', label: 'Ready for Pickup', description: 'Ready for customer collection' },
  { step: 'collected', label: 'Collected', description: 'Device collected by customer' }
];

// Utility function to get status message for customers
export function getStatusMessage(status: string): string {
  return STATUS_MESSAGES[status as keyof typeof STATUS_MESSAGES] || 'Status update available.';
}

// Utility function to get next status in the repair workflow
export function getNextRepairStatus(currentStatus: string): string | null {
  const statuses = Object.values(REPAIR_STATUSES);
  const currentIndex = statuses.indexOf(currentStatus as any);
  if (currentIndex === -1 || currentIndex === statuses.length - 1) {
    return null;
  }
  return statuses[currentIndex + 1];
}

// Utility function to check if status can be updated
export function canUpdateStatus(currentStatus: string, newStatus: string): boolean {
  const statuses = Object.values(REPAIR_STATUSES);
  const currentIndex = statuses.indexOf(currentStatus as any);
  const newIndex = statuses.indexOf(newStatus as any);
  
  // Can move forward in the process or stay at the same status
  return newIndex >= currentIndex;
}

// Device type mappings
export const DEVICE_TYPES = {
  LAPTOP: 'laptop',
  DESKTOP: 'desktop',
  SMARTPHONE: 'smartphone',
  TABLET: 'tablet',
  GAMING_CONSOLE: 'gaming-console',
  OTHER: 'other'
} as const;

// Service type mappings
export const SERVICE_TYPES = {
  HARDWARE_REPAIR: 'hardware-repair',
  SOFTWARE_REPAIR: 'software-repair',
  DATA_RECOVERY: 'data-recovery',
  VIRUS_REMOVAL: 'virus-removal',
  SCREEN_REPLACEMENT: 'screen-replacement',
  BATTERY_REPLACEMENT: 'battery-replacement',
  NETWORK_SETUP: 'network-setup',
  CONSULTATION: 'consultation'
} as const;
