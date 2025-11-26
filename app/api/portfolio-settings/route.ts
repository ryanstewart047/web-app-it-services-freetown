import { NextRequest, NextResponse } from 'next/server';

// Use Airtable for portfolio settings storage
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = 'PortfolioSettings';

// Default settings
const DEFAULT_SETTINGS = {
  email: 'support@itservicesfreetown.com',
  phone: '+232 76 123 456',
  location: 'Freetown, Sierra Leone',
  profilePhoto: '/assets/profile-ryan.jpg',
  logoText: 'RJS',
};

// GET settings from Airtable
export async function GET() {
  try {
    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      console.log('Airtable not configured, returning defaults');
      return NextResponse.json(DEFAULT_SETTINGS);
    }

    const response = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?maxRecords=1`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      console.error('Airtable fetch error:', response.status);
      return NextResponse.json(DEFAULT_SETTINGS);
    }

    const data = await response.json();
    
    if (data.records && data.records.length > 0) {
      const record = data.records[0].fields;
      return NextResponse.json({
        email: record.email || DEFAULT_SETTINGS.email,
        phone: record.phone || DEFAULT_SETTINGS.phone,
        location: record.location || DEFAULT_SETTINGS.location,
        profilePhoto: record.profilePhoto || DEFAULT_SETTINGS.profilePhoto,
        logoText: record.logoText || DEFAULT_SETTINGS.logoText,
      });
    }

    return NextResponse.json(DEFAULT_SETTINGS);
  } catch (error) {
    console.error('Error reading settings:', error);
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

// POST/PUT settings to Airtable
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password, settings } = body;

    // Verify admin password
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    if (password !== adminPassword) {
      return NextResponse.json(
        { success: false, message: 'Invalid password' },
        { status: 401 }
      );
    }

    if (!AIRTABLE_API_KEY || !AIRTABLE_BASE_ID) {
      return NextResponse.json(
        { success: false, message: 'Database not configured' },
        { status: 500 }
      );
    }

    // Check if record exists
    const listResponse = await fetch(
      `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}?maxRecords=1`,
      {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
        },
      }
    );

    const listData = await listResponse.json();
    const recordId = listData.records && listData.records.length > 0 ? listData.records[0].id : null;

    const settingsToSave = {
      email: settings.email,
      phone: settings.phone,
      location: settings.location,
      profilePhoto: settings.profilePhoto,
      logoText: settings.logoText,
      updatedAt: new Date().toISOString(),
    };

    let result;

    if (recordId) {
      // Update existing record
      result = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}/${recordId}`,
        {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fields: settingsToSave,
          }),
        }
      );
    } else {
      // Create new record
      result = await fetch(
        `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${AIRTABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fields: settingsToSave,
          }),
        }
      );
    }

    if (!result.ok) {
      const errorData = await result.json();
      console.error('Airtable save error:', errorData);
      return NextResponse.json(
        { success: false, message: 'Failed to save settings to database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      settings: settingsToSave,
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { success: false, message: 'Error saving settings: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
