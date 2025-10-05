# Simple Admin System - Quick Start Guide

Your IT Services website now has a lightweight, reliable admin system for managing repairs!

## 🎯 What's Been Set Up

### 1. Customer Tracking Page
**URL:** `http://localhost:3000/track-repair`

Customers can:
- Enter their tracking ID
- View real-time repair status
- See estimated completion dates
- View repair progress timeline

### 2. Admin Dashboard
**URL:** `http://localhost:3000/simple-admin`

**Login Credentials:**
- Password: `admin2024`

Admin features:
- View all repairs in a clean table
- Update repair statuses (6 status options)
- Edit repair details
- Delete completed repairs
- See quick statistics

### 3. Status Options
1. **Received** - Initial status when customer books
2. **Diagnosing** - Checking the issue
3. **In Progress** - Actively being repaired
4. **Awaiting Parts** - Waiting for replacement parts
5. **Ready** - Ready for customer pickup
6. **Completed** - Customer picked up

## 📱 How It Works

### Current Setup (localStorage)
Right now, data is stored in browser localStorage:
- ✅ Works immediately, no setup required
- ✅ Perfect for testing and development
- ⚠️ Data is per-device (not synced across devices)
- ⚠️ Data cleared if browser cache is cleared

### Recommended Production Setup (Airtable)
For production use, integrate with Airtable:
- ✅ Data synced across all devices
- ✅ Update repairs from your phone
- ✅ Automatic backups
- ✅ Team collaboration
- ✅ Export data anytime

See `AIRTABLE_SETUP_GUIDE.md` for setup instructions.

## 🚀 Getting Started

### Step 1: Test the System

1. Start your server:
   ```bash
   npm run dev
   ```

2. Go to `http://localhost:3000/simple-admin`
   - Login with password: `admin2024`

3. Create a test repair (manually add to localStorage):
   - Open browser console (F12)
   - Run this code:
   ```javascript
   const testRepair = {
     trackingId: 'ITS-2024-001234',
     customerName: 'John Doe',
     email: 'john@example.com',
     phone: '+232 76 123 456',
     deviceType: 'Laptop',
     issue: 'Screen not working',
     status: 'received',
     dateReceived: new Date().toISOString(),
     notes: 'Customer reports intermittent display issues'
   };
   
   const repairs = JSON.parse(localStorage.getItem('its_repairs') || '[]');
   repairs.push(testRepair);
   localStorage.setItem('its_repairs', JSON.stringify(repairs));
   
   location.reload();
   ```

4. You should now see the test repair in the admin dashboard

5. Try updating the status: Click "Edit" → Change status → Click "Save"

6. Test customer tracking:
   - Go to `http://localhost:3000/track-repair`
   - Enter tracking ID: `ITS-2024-001234`
   - You should see the repair status!

### Step 2: Update Your Booking Form

Your booking form needs to generate tracking IDs and store repairs. Add this to your form submission:

```typescript
// Generate unique tracking ID
const trackingId = `ITS-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

// Create repair object
const repair = {
  trackingId,
  customerName: formData.name,
  email: formData.email,
  phone: formData.phone,
  deviceType: formData.deviceType,
  issue: formData.issue,
  status: 'received',
  dateReceived: new Date().toISOString(),
  estimatedCompletion: '', // Optional
  notes: ''
};

// Save to localStorage
const repairs = JSON.parse(localStorage.getItem('its_repairs') || '[]');
repairs.push(repair);
localStorage.setItem('its_repairs', JSON.stringify(repairs));

// Show tracking ID to customer
alert(`Repair submitted! Your tracking ID is: ${trackingId}\n\nSave this ID to track your repair status.`);

// Or send via email (recommended)
```

### Step 3: Change Admin Password

For security, update the admin password:

1. Open `/app/simple-admin/page.tsx`
2. Find line 22: `const ADMIN_PASSWORD = 'admin2024';`
3. Change to a strong password
4. Save the file

## 📋 Daily Workflow

### For You (Admin):
1. Check admin dashboard daily
2. Update repair statuses as you progress
3. Add notes for internal tracking
4. Customer gets updated status instantly

### For Customers:
1. Receive tracking ID when they book
2. Visit tracking page anytime
3. Enter tracking ID
4. See current status and progress

## 🔄 Upgrading to Airtable (Recommended)

When ready for production:

1. Follow the `AIRTABLE_SETUP_GUIDE.md`
2. Set up your Airtable base (10 minutes)
3. Install Airtable SDK: `npm install airtable`
4. Add API credentials to `.env.local`
5. Update forms to use Airtable instead of localStorage

Benefits:
- Access from any device
- Mobile app for updates
- Automatic backups
- Better for multiple users
- Export to Excel anytime

## 🎨 Customization

### Change Colors
Edit `/app/simple-admin/page.tsx`:
- Line 131-134: Login form styling
- Line 211-214: Header styling
- Use your brand colors

### Add More Fields
Edit the RepairItem interface (line 8):
```typescript
interface RepairItem {
  // Add new fields here
  priority?: 'low' | 'medium' | 'high';
  cost?: number;
  // etc.
}
```

### Email Notifications
Consider adding email notifications when:
- Status changes to "Ready"
- Repair is completed
- Parts arrive

Use services like:
- SendGrid (free tier: 100 emails/day)
- Mailgun (free tier: 5,000 emails/month)
- Resend (free tier: 3,000 emails/month)

## 🛡️ Security Best Practices

1. **Change the default password** immediately
2. **Use HTTPS** in production
3. **Don't share login credentials** publicly
4. **Regular backups** if using localStorage
5. **Upgrade to Airtable** for better security

## 📞 Support

If you need help:
1. Check the `AIRTABLE_SETUP_GUIDE.md` for Airtable integration
2. Test thoroughly before going live
3. Keep this guide handy for reference

## ✅ Checklist Before Going Live

- [ ] Changed admin password from default
- [ ] Tested repair booking flow
- [ ] Tested tracking page
- [ ] Tested status updates in admin
- [ ] Decided on localStorage vs Airtable
- [ ] Set up email notifications (optional)
- [ ] Added tracking page link to website navigation
- [ ] Tested on mobile devices

---

**You're all set! 🎉**

Your admin system is simple, functional, and reliable. No complex authentication, no database setup required, and it just works!
