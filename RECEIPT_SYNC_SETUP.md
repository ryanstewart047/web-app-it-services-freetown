# Receipt Sync Setup Guide

## Overview
Receipt sync has been implemented to allow receipts created on one device to be accessible on all devices through your backend database.

## What's Been Added

### 1. Database Model (Prisma)
- Added `Receipt` model to `prisma/schema.prisma`
- Stores all receipt data including items, customer info, and payment details
- Indexed for fast searching by receipt number, customer name, and date

### 2. API Endpoints
- **GET /api/receipts** - Fetch all receipts (limit 100 most recent)
- **GET /api/receipts?search=query** - Search receipts by customer name, phone, or receipt number
- **POST /api/receipts** - Create or update a receipt
- **DELETE /api/receipts?receiptNumber=XXX** - Delete a receipt

### 3. Updated Receipt Page
- All receipt operations now use the API instead of localStorage
- Automatic fallback to localStorage if API fails (offline support)
- Real-time sync across all devices

## How It Works

1. **Save Receipt**: When you save a receipt, it's sent to the backend API and stored in the PostgreSQL database
2. **Load Receipts**: When you open the receipt page, it fetches all receipts from the database
3. **Search**: Searching queries the database for matching receipts
4. **Delete**: Deleting removes the receipt from the database

## Deployment Steps

### On Vercel (Your Current Platform)

The database environment variables should already be configured in your Vercel project. The receipt sync will work automatically once you deploy.

1. **Commit and push changes:**
   ```bash
   git add .
   git commit -m "Add receipt sync with backend database"
   git push origin main
   ```

2. **Vercel will automatically:**
   - Run `prisma generate` during build
   - Run `prisma db push` to create the Receipt table
   - Deploy the new API endpoints
   - Make receipt sync available

3. **Verify:**
   - Create a receipt on one device
   - Open the receipt admin page on another device
   - You should see the receipt from the first device

## Features

✅ **Cross-Device Sync** - Access receipts from any device
✅ **Search** - Find receipts by customer name, phone, or receipt number
✅ **Offline Support** - Falls back to localStorage if API is unavailable
✅ **Auto-Save** - Receipts are automatically saved to the database
✅ **Real-Time** - New receipts appear immediately after saving

## Fallback Behavior

If the API is unavailable (network issues, server down):
- Receipts will still save to localStorage on the current device
- You can continue working offline
- When the API comes back online, you can manually re-save receipts to sync them

## Database Schema

```prisma
model Receipt {
  id             String   @id @default(cuid())
  receiptNumber  String   @unique
  receiptType    String   // 'purchase' or 'repair'
  customerName   String
  customerPhone  String
  customerEmail  String?
  customerAddress String?
  receiptDate    String
  items          Json     // Store items as JSON array
  notes          String?
  paymentMethod  String
  amountPaid     Float
  subtotal       Float
  change         Float
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt
}
```

## Testing

1. **Create Receipt**: Save a receipt on Device A
2. **View on Another Device**: Open receipt admin on Device B and verify it appears
3. **Search**: Search for the receipt by customer name or receipt number
4. **Delete**: Delete the receipt and verify it's removed from all devices

## Migration from localStorage

Existing receipts in localStorage will remain as a backup. When you save or update a receipt, it will be synced to the database. If you want to migrate old receipts:

1. Open the receipt page
2. Load each old receipt from localStorage
3. Click "Save" to sync it to the database

## Support

If you encounter any issues:
- Check Vercel deployment logs
- Verify DATABASE_URL and POSTGRES_URL are set in Vercel environment variables
- Check browser console for error messages
