# Cloud Sync Setup Guide

## Overview
Your booking system now has automatic cloud synchronization using GitHub Gist as a free cloud storage solution. This eliminates the need for manual device access and JSON copy/paste.

## How It Works

### For Customers
- When a customer books an appointment on any device (phone, desktop, etc.)
- The booking is automatically saved locally AND pushed to cloud storage
- No action required from the customer

### For Admin
- When you open the admin panel, it automatically checks for new bookings in the cloud
- Any new bookings are automatically downloaded and merged with your local data
- When you update a booking status, it's automatically synced back to the cloud
- All devices with admin access will see the same data

## One-Time Setup (Takes 5 minutes)

### Step 1: Create a GitHub Gist
1. Go to [https://gist.github.com](https://gist.github.com)
2. Create a new **public** gist
3. Set the filename to: `its-bookings.json`
4. Add this initial content:
   ```json
   {"bookings":[],"lastUpdated":"","version":0}
   ```
5. Click "Create public gist"
6. Copy the Gist ID from the URL (the part after `/gist/`)
   - Example: If URL is `https://gist.github.com/username/abc123def456`, the ID is `abc123def456`

### Step 2: Create GitHub Access Token
1. Go to [GitHub Settings > Personal Access Tokens](https://github.com/settings/tokens)
2. Click "Generate new token (classic)"
3. Give it a name like "ITS Booking Sync"
4. Check ONLY the "gist" permission
5. Click "Generate token"
6. Copy the token (starts with `ghp_`)

### Step 3: Configure in Admin Panel
1. Go to your admin dashboard
2. Find the "Cloud Sync Setup" section at the top
3. Click "Setup" button
4. Enter the Gist ID and Access Token
5. Check "Enable automatic cloud synchronization"
6. Click "Save Configuration"
7. Click "Test Connection" to verify it works

## Features

### ✅ Automatic Sync
- **New Bookings**: Instantly pushed to cloud when created
- **Status Updates**: Automatically synced when you update booking status
- **Admin Loading**: Automatically pulls new bookings when you open admin panel

### ✅ Manual Controls
- **Push to Cloud**: Force upload all local bookings to cloud
- **Pull from Cloud**: Force download all cloud bookings to local
- **Test Connection**: Verify your setup is working

### ✅ Status Indicators
- 🟢 Active: Cloud sync is working properly
- 🟡 Configured but incomplete: Missing Gist ID or token
- 🔴 Disabled: Cloud sync is turned off

### ✅ Smart Merging
- Prevents duplicate bookings
- Keeps track of last sync times
- Only downloads new bookings (efficient)

## Benefits

### Before (Manual Process)
❌ Admin had to physically access customer's phone  
❌ Manual JSON copy/paste required  
❌ Device-specific data isolation  
❌ Time-consuming and impractical  

### Now (Automatic Cloud Sync)
✅ Bookings automatically appear in admin panel  
✅ No device access required  
✅ Real-time synchronization  
✅ Works on any device with internet  
✅ Completely hands-off operation  

## Security & Privacy

- Uses GitHub's secure infrastructure
- Data is stored in your personal GitHub account
- Access token only has "gist" permission (limited scope)
- All communication is encrypted (HTTPS)
- You maintain full control of your data

## Troubleshooting

### "Cloud sync not configured"
- Make sure you've entered both Gist ID and Access Token
- Verify the access token has "gist" permission
- Check that you've enabled automatic sync

### "Cloud fetch failed: 404"
- Verify the Gist ID is correct
- Make sure the gist is public (not secret)
- Check that the filename is exactly `its-bookings.json`

### "Cloud sync failed: 401"
- The access token may be incorrect or expired
- Generate a new token and update the configuration
- Make sure the token has "gist" permission

### Bookings not syncing
1. Check the Cloud Sync status in admin panel
2. Try manual "Test Connection"
3. Use "Push to Cloud" to force upload
4. Verify your internet connection

## Support

If you encounter any issues:
1. Check the browser console for error messages
2. Try the manual sync buttons first
3. Verify your GitHub setup is correct
4. Test with a fresh browser tab

The system is designed to fail gracefully - if cloud sync isn't working, bookings are still saved locally and the manual backup options remain available.