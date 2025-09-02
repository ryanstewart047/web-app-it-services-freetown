# Migrating from Railway to Vercel

This guide will help you migrate your IT Services Freetown application from Railway to Vercel, as your Railway free trial has ended.

## Why Vercel?

1. **Free Tier Available**: Vercel offers a generous free tier that includes:
   - Unlimited personal projects
   - Serverless functions
   - Automatic HTTPS
   - Global CDN
   - Continuous deployment from GitHub

2. **Built for Next.js**: Your project is a Next.js application, and Vercel is built by the creators of Next.js, making it the perfect hosting platform.

3. **Simple Deployment**: Direct integration with GitHub for continuous deployment.

## Migration Steps

### 1. Export Your Data from Railway

Before your Railway account is fully closed:

```bash
# Export your database data (if using Postgres)
pg_dump -U postgres -h your-railway-postgres-host -p your-port -d railway > railway_backup.sql
```

### 2. Set Up a New Database

Since your application uses Prisma, you'll need a new database. Here are free options:

- **PlanetScale** (MySQL, free tier): https://planetscale.com
- **Neon** (PostgreSQL, free tier): https://neon.tech
- **Supabase** (PostgreSQL, free tier): https://supabase.com
- **Vercel Postgres** (PostgreSQL, free tier): Built into Vercel

#### Using Vercel Postgres (Recommended)

1. Go to the [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on "Storage" in the sidebar
3. Click "Create Database"
4. Select "Postgres"
5. Configure your database (region, name)
6. Link it to your project

After creating your database, get your connection string, which will look like:
```
postgresql://username:password@host:port/database
```

### 3. Prepare Your Project for Vercel

Your project is already well-structured for Vercel deployment with the Next.js framework. The key steps are:

1. Ensure you have the proper configuration in `next.config.js`
2. Configure your API routes (already in place in your `/api` directory)
3. Set up environment variables

### 4. Connect Your Local Project to Vercel

1. Install the Vercel CLI globally if you haven't already:
   ```bash
   npm install -g vercel
   ```

2. Link your local project to Vercel:
   ```bash
   vercel link
   ```
   This will prompt you to:
   - Select or create a Vercel scope (team or personal account)
   - Set up a new project or link to an existing one
   - Confirm the project settings

3. Pull environment variables from Vercel, including your database URL:
   ```bash
   vercel env pull .env.development.local
   ```

4. Apply your database schema to the Vercel Postgres instance:
   ```bash
   npx prisma migrate dev --name init
   ```

5. (Optional) Seed your database with initial data:
   ```bash
   npx prisma db seed
   ```
   Note: This requires a seed script in your package.json and a seed file.

### 5. Generate Additional Environment Variables

Run the provided script to generate secure environment variables:

```bash
./generate-vercel-vars.sh
```

### 5. Deploy to Vercel

1. **Sign up for Vercel**:
   - Go to https://vercel.com
   - Sign up using your GitHub account

2. **Import Your Repository**:
   - Click "Add New" > "Project"
   - Select your GitHub repository
   - Configure the project:
     - Framework Preset: Next.js
     - Root Directory: ./
     - Build Command: `npm run build`
     - Output Directory: .next

3. **Add Environment Variables**:
   - Add all the variables you generated in step 4
   - Most importantly, add your new `DATABASE_URL` (if not already linked via Vercel Postgres)
   - Add SMTP settings for email functionality

4. **Deploy**:
   - Click "Deploy" in the Vercel dashboard
   - Or use the CLI to deploy directly from your local project:
     ```bash
     vercel deploy
     ```

### 6. Run Database Migrations

After deployment:

1. Go to your Vercel project dashboard
2. Click on "Deployments" > your latest deployment
3. Select "Functions" tab
4. Find and click the "Shell" button to open a shell
5. Run migrations:

```bash
npx prisma migrate deploy
```

### 7. Update Form Submission in Static HTML

If you're using the static HTML form in `book-appointment.html`, update the form action to point to your Next.js API route:

```html
<form id="appointmentForm" class="space-y-6" action="/api/appointments" method="post">
```

### 8. Test Your Application

1. Visit your new Vercel URL
2. Test the appointment booking form
3. Verify emails are being sent
4. Check that data is being saved in your database

## Using Form Handler in Next.js

Your Next.js application already has an API route structure. Here's how to adapt your form handler for Next.js:

1. Create or update `/src/app/api/appointments/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';

const prisma = new PrismaClient();

// Email transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Extract form data
    const customerName = formData.get('customerName') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string || '';
    const deviceType = formData.get('deviceType') as string;
    const deviceModel = formData.get('deviceModel') as string;
    const serviceType = formData.get('serviceType') as string;
    const issueDescription = formData.get('issueDescription') as string;
    const preferredDate = formData.get('preferredDate') as string;
    const preferredTime = formData.get('preferredTime') as string;
    
    // Validate required fields
    if (!customerName || !email || !phone || !deviceType || !deviceModel || 
        !serviceType || !issueDescription || !preferredDate || !preferredTime) {
      return NextResponse.json(
        { success: false, message: 'Please fill in all required fields' },
        { status: 400 }
      );
    }
    
    // Generate appointment and tracking IDs
    const appointmentId = 'AP-' + Date.now().toString().slice(-8);
    const trackingId = 'TR-' + Math.random().toString(36).substring(2, 8).toUpperCase();
    
    // Save appointment to database
    const appointment = await prisma.appointment.create({
      data: {
        appointmentId,
        trackingId,
        customerName,
        email,
        phone,
        address,
        deviceType,
        deviceModel,
        serviceType,
        issueDescription,
        preferredDate,
        preferredTime,
        status: 'pending',
      },
    });
    
    // Send confirmation emails
    await sendConfirmationEmails(appointment);
    
    return NextResponse.json({
      success: true,
      message: "Appointment booked successfully",
      appointmentId,
      trackingId,
      message: "We'll confirm your appointment within 2 hours and send you an email with further details.",
      customerName,
      deviceType,
      deviceModel,
      preferredDate,
      preferredTime
    });
  } catch (error) {
    console.error('Error processing appointment:', error);
    return NextResponse.json(
      { success: false, message: 'Server error processing your request' },
      { status: 500 }
    );
  }
}

async function sendConfirmationEmails(appointment: any) {
  // Format date for email
  const dateFormatted = new Date(appointment.preferredDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  // Customer email
  await transporter.sendMail({
    from: `"IT Services Freetown" <${process.env.FROM_EMAIL}>`,
    to: appointment.email,
    subject: `Your Appointment Confirmation - ${appointment.appointmentId}`,
    html: createCustomerEmail(appointment, dateFormatted),
  });
  
  // Admin email
  await transporter.sendMail({
    from: `"IT Services Freetown" <${process.env.FROM_EMAIL}>`,
    to: process.env.ADMIN_EMAIL || 'info@itservicesfreetown.com',
    subject: `New Appointment Request - ${appointment.appointmentId}`,
    html: createAdminEmail(appointment, dateFormatted),
  });
}

// Email template functions
function createCustomerEmail(appointment: any, dateFormatted: string) {
  // HTML template similar to your PHP version
  return `
  <!DOCTYPE html>
  <html>
  <head>
      <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #040e40; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; border: 1px solid #ddd; }
          .appointment-details { background-color: #f9f9f9; padding: 15px; margin: 15px 0; border-left: 4px solid #040e40; }
          .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #777; }
          .button { display: inline-block; background-color: #ff0000; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>Appointment Confirmation</h1>
          </div>
          <div class="content">
              <p>Dear ${appointment.customerName},</p>
              <p>Thank you for booking an appointment with IT Services Freetown. We have received your request and will confirm your appointment shortly.</p>
              
              <div class="appointment-details">
                  <h3>Appointment Details:</h3>
                  <p><strong>Appointment ID:</strong> ${appointment.appointmentId}</p>
                  <p><strong>Tracking ID:</strong> ${appointment.trackingId}</p>
                  <p><strong>Service Type:</strong> ${appointment.serviceType}</p>
                  <p><strong>Device:</strong> ${appointment.deviceType} - ${appointment.deviceModel}</p>
                  <p><strong>Date & Time:</strong> ${dateFormatted} at ${appointment.preferredTime}</p>
              </div>
              
              <p>You can track the status of your repair using your Tracking ID on our website.</p>
              
              <p>If you have any questions or need to make changes to your appointment, please contact us.</p>
              
              <p>Best regards,<br>The IT Services Freetown Team</p>
          </div>
          <div class="footer">
              <p>© ${new Date().getFullYear()} IT Services Freetown. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>`;
}

function createAdminEmail(appointment: any, dateFormatted: string) {
  // HTML template similar to your PHP version
  return `
  <!DOCTYPE html>
  <html>
  <head>
      <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #040e40; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; border: 1px solid #ddd; }
          .appointment-details { background-color: #f9f9f9; padding: 15px; margin: 15px 0; border-left: 4px solid #ff0000; }
          .footer { margin-top: 20px; text-align: center; font-size: 12px; color: #777; }
      </style>
  </head>
  <body>
      <div class="container">
          <div class="header">
              <h1>New Appointment Request</h1>
          </div>
          <div class="content">
              <p>A new appointment request has been submitted.</p>
              
              <div class="appointment-details">
                  <h3>Customer Information:</h3>
                  <p><strong>Name:</strong> ${appointment.customerName}</p>
                  <p><strong>Email:</strong> ${appointment.email}</p>
                  <p><strong>Phone:</strong> ${appointment.phone}</p>
                  <p><strong>Address:</strong> ${appointment.address || 'Not provided'}</p>
                  
                  <h3>Appointment Details:</h3>
                  <p><strong>Appointment ID:</strong> ${appointment.appointmentId}</p>
                  <p><strong>Tracking ID:</strong> ${appointment.trackingId}</p>
                  <p><strong>Service Type:</strong> ${appointment.serviceType}</p>
                  <p><strong>Device:</strong> ${appointment.deviceType} - ${appointment.deviceModel}</p>
                  <p><strong>Issue Description:</strong> ${appointment.issueDescription}</p>
                  <p><strong>Date & Time:</strong> ${dateFormatted} at ${appointment.preferredTime}</p>
              </div>
              
              <p>Please review this appointment and confirm it with the customer.</p>
          </div>
          <div class="footer">
              <p>© ${new Date().getFullYear()} IT Services Freetown. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>`;
}
```

## Troubleshooting

1. **Database Connection Issues**:
   - Check your connection string format
   - Ensure your IP is allowed in database firewall settings
   - Verify the database user has proper permissions

2. **Email Sending Issues**:
   - Check SMTP credentials
   - Many email providers require "less secure apps" setting or app passwords
   - Consider using a service like SendGrid or Mailgun

3. **Deployment Failures**:
   - Check Vercel build logs
   - Ensure all dependencies are properly listed in package.json
   - Check for any environment variables referenced but not defined

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js API Routes Documentation](https://nextjs.org/docs/api-routes/introduction)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Nodemailer Documentation](https://nodemailer.com/about/)
