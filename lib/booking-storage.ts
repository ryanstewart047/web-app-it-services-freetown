// Simple booking storage system using localStorage for static deployment
// In production, this would be replaced with a proper database

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
}

const STORAGE_KEY = 'its_bookings';

// Get all bookings from localStorage
export function getAllBookings(): BookingData[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error reading bookings from localStorage:', error);
    return [];
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
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
  } catch (error) {
    console.error('Error saving booking to localStorage:', error);
  }

  return booking;
}

// Get a booking by tracking ID
export function getBookingByTrackingId(trackingId: string): BookingData | null {
  const bookings = getAllBookings();
  return bookings.find(booking => booking.trackingId === trackingId) || null;
}

// Check if a tracking ID exists
export function isValidTrackingId(trackingId: string): boolean {
  return getBookingByTrackingId(trackingId) !== null;
}

// Update booking status (for demo purposes)
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
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
    return true;
  } catch (error) {
    console.error('Error updating booking:', error);
    return false;
  }
}