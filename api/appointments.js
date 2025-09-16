// Vercel API Route for handling appointment submissions
// This replaces your PHP backend and works with custom domains

import nodemailer from 'nodemailer';

// Email configuration - you'll need to set these as environment variables in Vercel
const transporter = nodemailer.createTransporter({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER, // Your email
        pass: process.env.SMTP_PASS  // Your app password
    }
});

export default async function handler(req, res) {
    // Set CORS headers for your custom domain
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Method not allowed' });
    }

    try {
        // Extract form data
        const {
            customerName,
            email,
            phone,
            address,
            deviceType,
            deviceModel,
            serviceType,
            issueDescription,
            preferredDate,
            preferredTime
        } = req.body;

        // Validate required fields
        if (!customerName || !email || !phone || !deviceType || !deviceModel || 
            !serviceType || !issueDescription || !preferredDate || !preferredTime) {
            return res.status(400).json({ 
                success: false, 
                message: 'Please fill in all required fields' 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Invalid email format' 
            });
        }

        // Generate appointment and tracking IDs
        const appointmentId = 'AP-' + Date.now().toString().slice(-8);
        const trackingId = 'TR-' + Math.random().toString(36).substr(2, 8).toUpperCase();

        // Prepare appointment details
        const appointmentDetails = {
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
            createdAt: new Date().toISOString()
        };

        // Store in database (you can integrate with Vercel Postgres, Airtable, or other services)
        // For now, we'll send the data via email and you can manually track

        // Create email templates
        const customerEmailHTML = createCustomerEmail(appointmentDetails);
        const adminEmailHTML = createAdminEmail(appointmentDetails);

        // Send emails
        const adminEmail = process.env.ADMIN_EMAIL || 'support@itservicesfreetown.com';
        
        // Send confirmation email to customer
        await transporter.sendMail({
            from: `"IT Services Freetown" <${process.env.SMTP_USER}>`,
            to: email,
            subject: `Your Appointment Confirmation - ${appointmentId}`,
            html: customerEmailHTML
        });

        // Send notification email to admin
        await transporter.sendMail({
            from: `"IT Services Freetown" <${process.env.SMTP_USER}>`,
            to: adminEmail,
            subject: `New Appointment Request - ${appointmentId}`,
            html: adminEmailHTML
        });

        // Return success response
        return res.status(200).json({
            success: true,
            appointmentId,
            trackingId,
            customerName,
            deviceType,
            deviceModel,
            preferredDate,
            preferredTime,
            message: "We'll confirm your appointment within 2 hours and send you an email with further details."
        });

    } catch (error) {
        console.error('Appointment booking error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
}

function createCustomerEmail(details) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #040e40, #ff0000); color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; }
            .footer { background: #040e40; color: white; padding: 15px; text-align: center; }
            .details { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; }
            .tracking-id { background: #040e40; color: white; padding: 10px; text-align: center; border-radius: 5px; font-weight: bold; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>IT Services Freetown</h1>
                <h2>Appointment Confirmation</h2>
            </div>
            <div class="content">
                <p>Dear ${details.customerName},</p>
                <p>Thank you for booking an appointment with IT Services Freetown. Your appointment has been successfully scheduled.</p>
                
                <div class="tracking-id">
                    <h3>Your Tracking ID: ${details.trackingId}</h3>
                    <p>Save this ID to track your repair progress</p>
                </div>
                
                <div class="details">
                    <h3>Appointment Details:</h3>
                    <p><strong>Appointment ID:</strong> ${details.appointmentId}</p>
                    <p><strong>Device:</strong> ${details.deviceType} - ${details.deviceModel}</p>
                    <p><strong>Service Type:</strong> ${details.serviceType}</p>
                    <p><strong>Preferred Date:</strong> ${details.preferredDate}</p>
                    <p><strong>Preferred Time:</strong> ${details.preferredTime}</p>
                    <p><strong>Issue Description:</strong> ${details.issueDescription}</p>
                </div>
                
                <p><strong>What's Next?</strong></p>
                <ul>
                    <li>We'll confirm your appointment within 2 hours</li>
                    <li>You'll receive email updates on your repair status</li>
                    <li>Use your tracking ID to monitor progress online</li>
                </ul>
                
                <p>If you have any questions, please contact us at +232 33 399391 or support@itservicesfreetown.com</p>
            </div>
            <div class="footer">
                <p>© 2025 IT Services Freetown. All rights reserved.</p>
                <p>1 Regent Highway, Jui Junction, Freetown, Sierra Leone</p>
            </div>
        </div>
    </body>
    </html>
    `;
}

function createAdminEmail(details) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #040e40; color: white; padding: 20px; text-align: center; }
            .content { background: #f9f9f9; padding: 20px; }
            .details { background: white; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #ff0000; }
            .urgent { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 5px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🔧 New Appointment Request</h1>
                <h2>IT Services Freetown</h2>
            </div>
            <div class="content">
                <div class="urgent">
                    <strong>⚡ Action Required:</strong> New appointment needs confirmation within 2 hours
                </div>
                
                <div class="details">
                    <h3>📋 Appointment Details</h3>
                    <p><strong>Appointment ID:</strong> ${details.appointmentId}</p>
                    <p><strong>Tracking ID:</strong> ${details.trackingId}</p>
                    <p><strong>Created:</strong> ${new Date(details.createdAt).toLocaleString()}</p>
                </div>
                
                <div class="details">
                    <h3>👤 Customer Information</h3>
                    <p><strong>Name:</strong> ${details.customerName}</p>
                    <p><strong>Email:</strong> ${details.email}</p>
                    <p><strong>Phone:</strong> ${details.phone}</p>
                    <p><strong>Address:</strong> ${details.address || 'Not provided'}</p>
                </div>
                
                <div class="details">
                    <h3>📱 Device Information</h3>
                    <p><strong>Device Type:</strong> ${details.deviceType}</p>
                    <p><strong>Device Model:</strong> ${details.deviceModel}</p>
                    <p><strong>Service Type:</strong> ${details.serviceType}</p>
                    <p><strong>Issue Description:</strong> ${details.issueDescription}</p>
                </div>
                
                <div class="details">
                    <h3>📅 Scheduling</h3>
                    <p><strong>Preferred Date:</strong> ${details.preferredDate}</p>
                    <p><strong>Preferred Time:</strong> ${details.preferredTime}</p>
                </div>
                
                <div class="urgent">
                    <strong>Next Steps:</strong>
                    <ol>
                        <li>Contact customer to confirm appointment</li>
                        <li>Add to repair tracking system</li>
                        <li>Send confirmation email if needed</li>
                    </ol>
                </div>
            </div>
        </div>
    </body>
    </html>
    `;
}
