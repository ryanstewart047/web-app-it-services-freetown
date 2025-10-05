# Airtable Integration Guide

This guide will help you connect your IT Services website to Airtable for storing and managing repair bookings.

## Why Airtable?

- ✅ Free tier includes 1,200 records per base
- ✅ Mobile app for updating repairs on the go
- ✅ Easy-to-use interface (like Excel/Google Sheets)
- ✅ Built-in API for reading/writing data
- ✅ Can share with team members
- ✅ Automatic backups

## Setup Steps

### 1. Create Airtable Account

1. Go to [airtable.com](https://airtable.com)
2. Sign up for a free account
3. Create a new base called "IT Services Repairs"

### 2. Create Table Structure

Create a table with these fields:

| Field Name | Type | Description |
|------------|------|-------------|
| Tracking ID | Single line text | Unique identifier (e.g., ITS-2024-001234) |
| Customer Name | Single line text | Full name |
| Email | Email | Customer email |
| Phone | Phone number | Contact number |
| Device Type | Single select | Options: Laptop, Desktop, Phone, Tablet, Other |
| Issue | Long text | Problem description |
| Status | Single select | Options: Received, Diagnosing, In Progress, Awaiting Parts, Ready, Completed |
| Date Received | Date | When repair was submitted |
| Estimated Completion | Date | Expected completion date |
| Notes | Long text | Internal notes |

### 3. Get API Credentials

1. Click on your workspace name (top left)
2. Go to "Account" → "API"
3. Generate a Personal Access Token:
   - Click "Generate token"
   - Name it "IT Services Website"
   - Select scopes: `data.records:read` and `data.records:write`
   - Select your workspace
   - Click "Create token"
   - **Copy and save this token securely!**

4. Get your Base ID:
   - Go to [airtable.com/api](https://airtable.com/api)
   - Select your "IT Services Repairs" base
   - Copy the Base ID (starts with `app...`)

### 4. Add Environment Variables

Create a `.env.local` file in your project root:

```env
# Airtable Configuration
NEXT_PUBLIC_AIRTABLE_API_KEY=your_personal_access_token_here
NEXT_PUBLIC_AIRTABLE_BASE_ID=your_base_id_here
NEXT_PUBLIC_AIRTABLE_TABLE_NAME=Repairs
```

### 5. Install Airtable SDK

```bash
npm install airtable
```

### 6. Create Airtable Service

Create a new file `/lib/airtable-service.ts`:

```typescript
import Airtable from 'airtable';

// Initialize Airtable
const base = new Airtable({
  apiKey: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY
}).base(process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || '');

const table = base(process.env.NEXT_PUBLIC_AIRTABLE_TABLE_NAME || 'Repairs');

export interface RepairRecord {
  trackingId: string;
  customerName: string;
  email: string;
  phone: string;
  deviceType: string;
  issue: string;
  status: 'Received' | 'Diagnosing' | 'In Progress' | 'Awaiting Parts' | 'Ready' | 'Completed';
  dateReceived: string;
  estimatedCompletion?: string;
  notes?: string;
}

// Create a new repair record
export async function createRepair(repair: RepairRecord) {
  try {
    const record = await table.create([
      {
        fields: {
          'Tracking ID': repair.trackingId,
          'Customer Name': repair.customerName,
          'Email': repair.email,
          'Phone': repair.phone,
          'Device Type': repair.deviceType,
          'Issue': repair.issue,
          'Status': repair.status,
          'Date Received': repair.dateReceived,
          'Estimated Completion': repair.estimatedCompletion,
          'Notes': repair.notes
        }
      }
    ]);
    return record[0];
  } catch (error) {
    console.error('Error creating repair:', error);
    throw error;
  }
}

// Get repair by tracking ID
export async function getRepairByTrackingId(trackingId: string) {
  try {
    const records = await table
      .select({
        filterByFormula: `{Tracking ID} = '${trackingId}'`,
        maxRecords: 1
      })
      .firstPage();

    if (records.length === 0) return null;

    const record = records[0];
    return {
      id: record.id,
      trackingId: record.get('Tracking ID'),
      customerName: record.get('Customer Name'),
      email: record.get('Email'),
      phone: record.get('Phone'),
      deviceType: record.get('Device Type'),
      issue: record.get('Issue'),
      status: record.get('Status'),
      dateReceived: record.get('Date Received'),
      estimatedCompletion: record.get('Estimated Completion'),
      notes: record.get('Notes')
    };
  } catch (error) {
    console.error('Error fetching repair:', error);
    throw error;
  }
}

// Get all repairs (for admin)
export async function getAllRepairs() {
  try {
    const records = await table.select().all();
    
    return records.map(record => ({
      id: record.id,
      trackingId: record.get('Tracking ID'),
      customerName: record.get('Customer Name'),
      email: record.get('Email'),
      phone: record.get('Phone'),
      deviceType: record.get('Device Type'),
      issue: record.get('Issue'),
      status: record.get('Status'),
      dateReceived: record.get('Date Received'),
      estimatedCompletion: record.get('Estimated Completion'),
      notes: record.get('Notes')
    }));
  } catch (error) {
    console.error('Error fetching repairs:', error);
    throw error;
  }
}

// Update repair status
export async function updateRepairStatus(
  recordId: string,
  status: string,
  notes?: string
) {
  try {
    const updateFields: any = { Status: status };
    if (notes) updateFields.Notes = notes;

    const record = await table.update(recordId, updateFields);
    return record;
  } catch (error) {
    console.error('Error updating repair:', error);
    throw error;
  }
}

// Delete repair
export async function deleteRepair(recordId: string) {
  try {
    await table.destroy(recordId);
    return true;
  } catch (error) {
    console.error('Error deleting repair:', error);
    throw error;
  }
}
```

### 7. Update Your Booking Form

Modify your booking form to use Airtable:

```typescript
import { createRepair } from '@/lib/airtable-service';

// Generate tracking ID
const trackingId = `ITS-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

// Create repair in Airtable
await createRepair({
  trackingId,
  customerName: formData.name,
  email: formData.email,
  phone: formData.phone,
  deviceType: formData.deviceType,
  issue: formData.issue,
  status: 'Received',
  dateReceived: new Date().toISOString(),
});

// Show tracking ID to customer
alert(`Your repair has been submitted! Tracking ID: ${trackingId}`);
```

## Alternative: Using Airtable Web API (No SDK)

If you prefer not to install the SDK, you can use fetch:

```typescript
const AIRTABLE_API_KEY = process.env.NEXT_PUBLIC_AIRTABLE_API_KEY;
const BASE_ID = process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID;
const TABLE_NAME = 'Repairs';

async function createRepairWithAPI(data: any) {
  const response = await fetch(
    `https://api.airtable.com/v0/${BASE_ID}/${TABLE_NAME}`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AIRTABLE_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fields: data
      })
    }
  );
  
  return await response.json();
}
```

## Testing

1. Submit a test repair through your booking form
2. Check Airtable - you should see the new record
3. Update the status in Airtable
4. Use the tracking page - it should show the updated status

## Mobile Access

Download the Airtable mobile app (iOS/Android) to:
- View all repairs on your phone
- Update statuses while on the go
- Add notes during repairs
- Get notifications for new submissions

## Security Notes

- ⚠️ Keep your API key secret (use `.env.local`, don't commit to Git)
- ⚠️ Add `.env.local` to your `.gitignore` file
- ⚠️ Use read-only tokens for customer-facing features
- ⚠️ Use read-write tokens only for admin functions

## Cost

- Free tier: 1,200 records/month
- If you exceed, consider archiving completed repairs
- Or upgrade to Plus ($10/user/month) for unlimited records

## Need Help?

- Airtable Documentation: [airtable.com/developers](https://airtable.com/developers)
- API Documentation: [airtable.com/api](https://airtable.com/api)
- Contact support if you need assistance with setup

---

**Next Steps:**
1. Set up your Airtable base
2. Add the environment variables
3. Update your booking form to use Airtable
4. Test the complete flow
