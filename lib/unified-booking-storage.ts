// Unified booking storage system that works across devices
// Uses localStorage as primary storage with export/import capabilities

export interface BookingData {
  trackingId: string;
  customerName: string;
  email: string;
  phone: string;
  address?: string;
  deviceType: string;
  deviceModel: string;
  serviceType: string;
  issueDescription: string;
  preferredDate: string;
  preferredTime: string;
  status: 'received' | 'diagnosed' | 'in-progress' | 'completed' | 'ready-for-pickup';
  createdAt: string;
  updatedAt: string;
  cost?: number;
  estimatedCompletion?: string;
  notes?: string;
  diagnosticImages?: Array<{ data: string; uploadedAt: string }>; // Array of timestamped base64 images
  diagnosticNotes?: string; // Detailed diagnostic notes for the customer
}

const STORAGE_KEY = 'its_bookings';
const EXPORT_KEY = 'its_bookings_export';

// Get all bookings from localStorage
export function getAllBookings(): BookingData[] {
  if (typeof window === 'undefined') return [];
  
  try {
    if (typeof Storage === 'undefined' || !window.localStorage) {
      console.warn('localStorage not available on this browser');
      return [];
    }
    
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
      console.log('No bookings found in localStorage');
      return [];
    }
    
    const bookings = JSON.parse(data);
    console.log('Retrieved bookings from localStorage:', bookings.length, 'items');
    return bookings;
  } catch (error) {
    console.error('Error reading bookings from localStorage:', error);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (clearError) {
      console.error('Error clearing corrupted localStorage data:', clearError);
    }
    return [];
  }
}

// Save bookings to localStorage
function saveBookings(bookings: BookingData[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    
    // Also save to export key for sharing between devices
    const exportData = {
      lastUpdated: new Date().toISOString(),
      bookings: bookings
    };
    localStorage.setItem(EXPORT_KEY, JSON.stringify(exportData));
  } catch (error) {
    console.error('Error saving bookings to localStorage:', error);
  }
}

// Save a new booking
export function saveBooking(bookingData: Omit<BookingData, 'createdAt' | 'updatedAt' | 'status'>): BookingData {
  const booking: BookingData = {
    ...bookingData,
    status: 'received',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    estimatedCompletion: 'We will contact you within 2 hours to confirm your appointment',
    notes: `${bookingData.serviceType} requested for ${bookingData.deviceType} ${bookingData.deviceModel}. Issue: ${bookingData.issueDescription}`
  };

  const bookings = getAllBookings();
  bookings.push(booking);
  saveBookings(bookings);

  return booking;
}

// Get a booking by tracking ID
export function getBookingByTrackingId(trackingId: string): BookingData | null {
  console.log('Looking for tracking ID:', trackingId);
  
  const bookings = getAllBookings();
  console.log('Total bookings available:', bookings.length);
  
  if (bookings.length > 0) {
    console.log('Available tracking IDs:', bookings.map(b => b.trackingId));
  }
  
  // Try exact match first
  let booking = bookings.find(booking => booking.trackingId === trackingId);
  
  if (!booking) {
    // Try case-insensitive match as fallback
    booking = bookings.find(booking => 
      booking.trackingId.toLowerCase() === trackingId.toLowerCase()
    );
    
    if (booking) {
      console.log('Found booking with case-insensitive match');
    }
  } else {
    console.log('Found booking with exact match');
  }
  
  if (!booking) {
    console.log('No booking found for tracking ID:', trackingId);
  }
  
  return booking || null;
}

// Check if a tracking ID exists
export function isValidTrackingId(trackingId: string): boolean {
  return getBookingByTrackingId(trackingId) !== null;
}

// Update booking status
export function updateBookingStatus(trackingId: string, status: BookingData['status'], notes?: string, estimatedCompletion?: string, cost?: number): boolean {
  const bookings = getAllBookings();
  const bookingIndex = bookings.findIndex(b => b.trackingId === trackingId);
  
  if (bookingIndex === -1) return false;
  
  bookings[bookingIndex] = {
    ...bookings[bookingIndex],
    status,
    updatedAt: new Date().toISOString(),
    ...(notes && { notes }),
    ...(estimatedCompletion && { estimatedCompletion }),
    ...(cost && { cost })
  };
  
  saveBookings(bookings);
  return true;
}

// Update booking with diagnostic information
export function updateBookingDiagnostics(
  trackingId: string, 
  diagnosticNotes?: string, 
  diagnosticImages?: string[]
): boolean {
  const bookings = getAllBookings();
  const bookingIndex = bookings.findIndex(b => b.trackingId === trackingId);
  
  if (bookingIndex === -1) return false;
  
  // Convert string array to timestamped format
  const timestampedImages = diagnosticImages?.map(data => ({
    data,
    uploadedAt: new Date().toISOString()
  }));
  
  bookings[bookingIndex] = {
    ...bookings[bookingIndex],
    updatedAt: new Date().toISOString(),
    ...(diagnosticNotes !== undefined && { diagnosticNotes }),
    ...(timestampedImages !== undefined && { diagnosticImages: timestampedImages })
  };
  
  saveBookings(bookings);
  return true;
}

// Clean up images older than 5 days from all bookings
export function cleanupOldImages(): number {
  const bookings = getAllBookings();
  const fiveDaysAgo = Date.now() - (5 * 24 * 60 * 60 * 1000);
  let totalCleaned = 0;
  
  bookings.forEach(booking => {
    if (booking.diagnosticImages && booking.diagnosticImages.length > 0) {
      const originalCount = booking.diagnosticImages.length;
      
      // Support both old format (string[]) and new format (timestamped)
      booking.diagnosticImages = booking.diagnosticImages.filter(img => {
        // If it's an old format string, convert it to timestamped format with current date
        if (typeof img === 'string') {
          return true; // Keep old format images for now (they'll be migrated on next update)
        }
        
        // Check if image is newer than 5 days
        const uploadDate = new Date(img.uploadedAt).getTime();
        return uploadDate > fiveDaysAgo;
      });
      
      const deletedCount = originalCount - booking.diagnosticImages.length;
      if (deletedCount > 0) {
        totalCleaned += deletedCount;
        booking.updatedAt = new Date().toISOString();
      }
    }
  });
  
  if (totalCleaned > 0) {
    saveBookings(bookings);
    console.log(`Cleaned up ${totalCleaned} images older than 5 days`);
  }
  
  return totalCleaned;
}

// Export bookings as JSON string for sharing between devices
export function exportBookingsData(): string {
  const bookings = getAllBookings();
  const exportData = {
    exportedAt: new Date().toISOString(),
    bookingCount: bookings.length,
    bookings: bookings
  };
  return JSON.stringify(exportData, null, 2);
}

// Import bookings from JSON string (merge with existing data)
export function importBookingsData(jsonData: string): { success: boolean; message: string; importedCount: number } {
  try {
    const importData = JSON.parse(jsonData);
    
    if (!importData.bookings || !Array.isArray(importData.bookings)) {
      return { success: false, message: 'Invalid data format', importedCount: 0 };
    }
    
    const existingBookings = getAllBookings();
    const existingIds = new Set(existingBookings.map(b => b.trackingId));
    
    // Only add new bookings (avoid duplicates)
    const newBookings = importData.bookings.filter((booking: BookingData) => 
      !existingIds.has(booking.trackingId)
    );
    
    if (newBookings.length === 0) {
      return { success: true, message: 'No new bookings to import', importedCount: 0 };
    }
    
    const mergedBookings = [...existingBookings, ...newBookings];
    saveBookings(mergedBookings);
    
    return { 
      success: true, 
      message: `Successfully imported ${newBookings.length} new bookings`, 
      importedCount: newBookings.length 
    };
  } catch (error) {
    return { success: false, message: 'Error parsing import data', importedCount: 0 };
  }
}

// Get export data for admin panel
export function getExportData(): { lastUpdated: string; bookings: BookingData[] } | null {
  try {
    const data = localStorage.getItem(EXPORT_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return null;
  }
}