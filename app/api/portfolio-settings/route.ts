import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const SETTINGS_FILE = path.join(process.cwd(), 'data', 'portfolio-settings.json');

// Ensure data directory exists
function ensureDataDir() {
  const dir = path.dirname(SETTINGS_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Default settings
const DEFAULT_SETTINGS = {
  email: 'support@itservicesfreetown.com',
  phone: '+232 76 123 456',
  location: 'Freetown, Sierra Leone',
  profilePhoto: '/assets/profile-ryan.jpg',
  logoText: 'RJS',
};

// GET settings
export async function GET() {
  try {
    ensureDataDir();
    
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return NextResponse.json(JSON.parse(data));
    }
    
    // Return defaults if file doesn't exist
    return NextResponse.json(DEFAULT_SETTINGS);
  } catch (error) {
    console.error('Error reading settings:', error);
    return NextResponse.json(DEFAULT_SETTINGS);
  }
}

// POST/PUT settings (requires password)
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

    ensureDataDir();
    
    // Read existing settings or use defaults
    let currentSettings = DEFAULT_SETTINGS;
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      currentSettings = JSON.parse(data);
    }

    // Merge with new settings
    const updatedSettings = {
      ...currentSettings,
      ...settings,
      updatedAt: new Date().toISOString(),
    };

    // Save to file
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(updatedSettings, null, 2));

    return NextResponse.json({
      success: true,
      settings: updatedSettings,
    });
  } catch (error) {
    console.error('Error saving settings:', error);
    return NextResponse.json(
      { success: false, message: 'Error saving settings' },
      { status: 500 }
    );
  }
}
