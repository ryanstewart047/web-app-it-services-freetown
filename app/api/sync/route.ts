import { NextRequest, NextResponse } from 'next/server';

// Server-side cloud sync - no client configuration needed
// This endpoint handles GitHub Gist sync on the server side

interface BookingData {
  trackingId: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  deviceType: string;
  deviceModel: string;
  serviceType: string;
  issueDescription: string;
  preferredDate: string;
  preferredTime: string;
  createdAt: string;
  status: string;
}

// GitHub Gist configuration - stored server-side
const GITHUB_CONFIG = {
  gistId: process.env.GITHUB_GIST_ID || '',
  accessToken: process.env.GITHUB_ACCESS_TOKEN || '',
};

const GIST_API_URL = 'https://api.github.com/gists';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, booking, bookings } = body;

    switch (action) {
      case 'sync_booking':
        return await syncSingleBooking(booking);
      case 'sync_all':
        return await syncAllBookings(bookings);
      case 'get_bookings':
        return await getAllBookings();
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Sync API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function syncSingleBooking(booking: BookingData) {
  if (!GITHUB_CONFIG.gistId || !GITHUB_CONFIG.accessToken) {
    return NextResponse.json({ 
      success: false, 
      message: 'Server cloud sync not configured' 
    });
  }

  try {
    // Get existing bookings from GitHub Gist
    const existingData = await fetchFromGist();
    const existingBookings = existingData.bookings || [];
    
    // Check if booking already exists
    const bookingIndex = existingBookings.findIndex((b: BookingData) => b.trackingId === booking.trackingId);
    
    if (bookingIndex >= 0) {
      // Update existing booking
      existingBookings[bookingIndex] = booking;
    } else {
      // Add new booking
      existingBookings.push(booking);
    }

    // Upload updated data
    const result = await uploadToGist(existingBookings);
    
    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Booking synced successfully' : result.message
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to sync booking'
    });
  }
}

async function syncAllBookings(bookings: BookingData[]) {
  if (!GITHUB_CONFIG.gistId || !GITHUB_CONFIG.accessToken) {
    return NextResponse.json({ 
      success: false, 
      message: 'Server cloud sync not configured' 
    });
  }

  try {
    const result = await uploadToGist(bookings);
    
    return NextResponse.json({
      success: result.success,
      message: result.success ? `Synced ${bookings.length} bookings` : result.message
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to sync bookings'
    });
  }
}

async function getAllBookings() {
  if (!GITHUB_CONFIG.gistId) {
    return NextResponse.json({ 
      success: false, 
      message: 'Server cloud sync not configured',
      bookings: []
    });
  }

  try {
    const data = await fetchFromGist();
    
    return NextResponse.json({
      success: true,
      message: `Found ${data.bookings.length} bookings`,
      bookings: data.bookings || []
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch bookings',
      bookings: []
    });
  }
}

async function fetchFromGist() {
  const response = await fetch(`${GIST_API_URL}/${GITHUB_CONFIG.gistId}`, {
    headers: {
      'Accept': 'application/vnd.github.v3+json'
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  const gist = await response.json();
  const fileContent = gist.files['its-bookings.json']?.content;
  
  if (fileContent) {
    return JSON.parse(fileContent);
  }
  
  return { bookings: [], lastUpdated: '', version: 0 };
}

async function uploadToGist(bookings: BookingData[]) {
  const cloudData = {
    bookings,
    lastUpdated: new Date().toISOString(),
    version: Date.now()
  };

  const response = await fetch(`${GIST_API_URL}/${GITHUB_CONFIG.gistId}`, {
    method: 'PATCH',
    headers: {
      'Authorization': `token ${GITHUB_CONFIG.accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.github.v3+json'
    },
    body: JSON.stringify({
      files: {
        'its-bookings.json': {
          content: JSON.stringify(cloudData, null, 2)
        }
      }
    })
  });

  if (response.ok) {
    return { success: true, message: 'Successfully synced to cloud' };
  } else {
    const error = await response.text();
    return { success: false, message: `GitHub API error: ${response.status}` };
  }
}