// This is a Node.js serverless function version of your PHP form handler
// You can deploy this to Vercel, Netlify, or similar platforms

// api/process-appointment.js
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

// Configuration for emails
const adminEmail = "support@itservicesfreetown.com"; // Change this to your email
const websiteName = "IT Services Freetown";
const noReplyEmail = "no-reply@itservicesfreetown.com";

// Setup email transporter (you'll need to configure this with your email provider)
// For testing, you can use services like Mailtrap
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// Helper function to validate email
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(String(email).toLowerCase());
}

export default async function handler(req, res) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  try {
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
      return res.status(400).json({ success: false, message: 'Please fill in all required fields' });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    // Generate appointment and tracking IDs
    const appointmentId = 'AP-' + Date.now().toString().slice(-8);
    const trackingId = 'TR-' + Math.random().toString(36).substring(2, 8).toUpperCase();

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

    // Save the appointment details to a file or database
    // For Vercel/Netlify, you should use a database like MongoDB, Fauna, or Supabase
    // Here's an example using a simple in-memory array (not persistent across function calls)
    // In a real app, connect to a database here
    let appointments = [];
    try {
      // In a real app, this would be a database query
      // This is just for illustration - won't work in serverless environment
      // const data = await fs.readFile(path.join(process.cwd(), 'appointments.json'), 'utf8');
      // appointments = JSON.parse(data);
    } catch (error) {
      // File doesn't exist yet or other error
      console.log('Creating new appointments array');
    }
    
    appointments.push(appointmentDetails);
    
    // In a real app, save to database here
    // await db.appointments.insert(appointmentDetails);
    
    // For illustration only (won't work in serverless environment)
    // await fs.writeFile(
    //   path.join(process.cwd(), 'appointments.json'),
    //   JSON.stringify(appointments, null, 2)
    // );

    // Format date for email
    const dateFormatted = new Date(preferredDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // Send confirmation email to customer
    const customerSubject = `Your Appointment Confirmation - ${appointmentId}`;
    const customerMessage = createCustomerEmail(appointmentDetails, dateFormatted);
    
    // Send notification email to admin
    const adminSubject = `New Appointment Request - ${appointmentId}`;
    const adminMessage = createAdminEmail(appointmentDetails, dateFormatted);

    // Send emails
    try {
      await transporter.sendMail({
        from: `"${websiteName}" <${noReplyEmail}>`,
        to: email,
        subject: customerSubject,
        html: customerMessage
      });
      
      await transporter.sendMail({
        from: `"${websiteName}" <${noReplyEmail}>`,
        to: adminEmail,
        subject: adminSubject,
        html: adminMessage
      });
    } catch (error) {
      console.error('Email sending error:', error);
      // Continue processing even if email fails
    }

    // Respond with success
    return res.status(200).json({
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
    return res.status(500).json({ 
      success: false, 
      message: 'Server error processing your request'
    });
  }
}

// Helper function to create customer confirmation email
function createCustomerEmail(appointment, dateFormatted) {
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
              
              <p>You can track the status of your repair using your Tracking ID on our website:</p>
              <p style="text-align: center;">
                  <a href="https://itservicesfreetown.com/track-repair.html?id=${appointment.trackingId}" class="button">Track Your Repair</a>
              </p>
              
              <p>If you have any questions or need to make changes to your appointment, please contact us at support@itservicesfreetown.com or call +232 33 399391.</p>
              
              <p>Best regards,<br>The IT Services Freetown Team</p>
          </div>
          <div class="footer">
              <p>© ${new Date().getFullYear()} IT Services Freetown. All rights reserved.</p>
              <p>1 Regent Highway, Jui Junction, Freetown, Sierra Leone</p>
          </div>
      </div>
  </body>
  </html>`;
}

// Helper function to create admin notification email
function createAdminEmail(appointment, dateFormatted) {
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
          .button { display: inline-block; background-color: #040e40; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; }
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
              
              <p style="text-align: center;">
                  <a href="https://itservicesfreetown.com/admin/appointments" class="button">View All Appointments</a>
              </p>
          </div>
          <div class="footer">
              <p>© ${new Date().getFullYear()} IT Services Freetown. All rights reserved.</p>
          </div>
      </div>
  </body>
  </html>`;
}
