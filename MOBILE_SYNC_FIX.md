// Mobile Device Sync Instructions

## Quick Fix for Mobile Booking Not Appearing

The mobile booking isn't appearing because the cloud sync configuration is device-specific. Here are two solutions:

### Solution 1: Trigger Mobile Sync (Immediate)

1. **On your mobile device**:
   - Go to: https://itservicesfreetown.com/admin/login
   - Login with admin credentials (set via environment variables)
   - This will load the cloud sync configuration on your mobile device
   - Go back to your admin dashboard on desktop - the booking should now appear

### Solution 2: Manual Admin Sync (Alternative)

1. **On your desktop admin panel**:
   - Look for "Cloud Sync Setup" section
   - Click "📱 Scan Devices" button
   - This will force pull all data from cloud

### Solution 3: Quick Mobile Setup

1. **On your mobile device**:
   - Go to: https://itservicesfreetown.com/admin
   - Login briefly to sync the configuration
   - The next bookings from mobile will automatically sync

## Why This Happened

- Cloud sync configuration is stored per device
- Mobile device didn't have the GitHub Gist configuration
- Bookings were saved locally on mobile but couldn't upload to cloud
- Desktop admin panel couldn't see mobile-only bookings

## Prevention

Once you login to admin on mobile device once, all future mobile bookings will automatically sync to cloud and appear in desktop admin panel immediately.
