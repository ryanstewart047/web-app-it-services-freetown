<?php
// Set error reporting for debugging (you can remove this in production)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Configuration for emails
$admin_email = "info@itservicesfreetown.com"; // Change this to your email
$website_name = "IT Services Freetown";
$no_reply_email = "no-reply@itservicesfreetown.com";

// Process form submission
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Collect form data
    $customer_name = filter_input(INPUT_POST, 'customerName', FILTER_SANITIZE_STRING);
    $email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
    $phone = filter_input(INPUT_POST, 'phone', FILTER_SANITIZE_STRING);
    $address = filter_input(INPUT_POST, 'address', FILTER_SANITIZE_STRING);
    $device_type = filter_input(INPUT_POST, 'deviceType', FILTER_SANITIZE_STRING);
    $device_model = filter_input(INPUT_POST, 'deviceModel', FILTER_SANITIZE_STRING);
    $service_type = filter_input(INPUT_POST, 'serviceType', FILTER_SANITIZE_STRING);
    $issue_description = filter_input(INPUT_POST, 'issueDescription', FILTER_SANITIZE_STRING);
    $preferred_date = filter_input(INPUT_POST, 'preferredDate', FILTER_SANITIZE_STRING);
    $preferred_time = filter_input(INPUT_POST, 'preferredTime', FILTER_SANITIZE_STRING);
    
    // Validate required fields
    if (!$customer_name || !$email || !$phone || !$device_type || !$device_model || !$service_type || 
        !$issue_description || !$preferred_date || !$preferred_time) {
        respond(false, "Please fill in all required fields");
        exit;
    }
    
    // Validate email format
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        respond(false, "Invalid email format");
        exit;
    }
    
    // Generate appointment and tracking IDs
    $appointment_id = 'AP-' . substr(time(), -8);
    $tracking_id = 'TR-' . strtoupper(substr(md5(uniqid()), 0, 8));
    
    // Prepare appointment details (you could save this to a database)
    $appointment_details = [
        'appointmentId' => $appointment_id,
        'trackingId' => $tracking_id,
        'customerName' => $customer_name,
        'email' => $email,
        'phone' => $phone,
        'address' => $address,
        'deviceType' => $device_type,
        'deviceModel' => $device_model,
        'serviceType' => $service_type,
        'issueDescription' => $issue_description,
        'preferredDate' => $preferred_date,
        'preferredTime' => $preferred_time,
        'status' => 'pending',
        'createdAt' => date('Y-m-d H:i:s')
    ];
    
    // Save the appointment details to a file (as a simple database alternative)
    // In a real production environment, you would use a proper database
    $appointments_file = 'appointments.json';
    
    if (file_exists($appointments_file)) {
        $appointments = json_decode(file_get_contents($appointments_file), true);
    } else {
        $appointments = [];
    }
    
    $appointments[] = $appointment_details;
    file_put_contents($appointments_file, json_encode($appointments, JSON_PRETTY_PRINT));
    
    // Send confirmation email to customer
    $customer_subject = "Your Appointment Confirmation - $appointment_id";
    $customer_message = createCustomerEmail($appointment_details);
    $customer_headers = createEmailHeaders($no_reply_email, $website_name);
    
    // Send notification email to admin
    $admin_subject = "New Appointment Request - $appointment_id";
    $admin_message = createAdminEmail($appointment_details);
    $admin_headers = createEmailHeaders($no_reply_email, $website_name);
    
    // Send emails
    $customer_mail_sent = mail($email, $customer_subject, $customer_message, $customer_headers);
    $admin_mail_sent = mail($admin_email, $admin_subject, $admin_message, $admin_headers);
    
    // Log the email sending status (for debugging)
    $log_message = date('Y-m-d H:i:s') . " - Appointment: $appointment_id\n";
    $log_message .= "Customer Email Sent: " . ($customer_mail_sent ? 'Yes' : 'No') . "\n";
    $log_message .= "Admin Email Sent: " . ($admin_mail_sent ? 'Yes' : 'No') . "\n\n";
    file_put_contents('email_log.txt', $log_message, FILE_APPEND);
    
    // Respond with success
    respond(true, "Appointment booked successfully", [
        'appointmentId' => $appointment_id,
        'trackingId' => $tracking_id,
        'message' => "We'll confirm your appointment within 2 hours and send you an email with further details.",
        'customerName' => $customer_name,
        'deviceType' => $device_type,
        'deviceModel' => $device_model,
        'preferredDate' => $preferred_date,
        'preferredTime' => $preferred_time
    ]);
} else {
    // Not a POST request
    respond(false, "Invalid request method");
}

// Helper function to respond with JSON
function respond($success, $message, $data = []) {
    $response = [
        'success' => $success,
        'message' => $message
    ];
    
    if (!empty($data)) {
        $response = array_merge($response, $data);
    }
    
    header('Content-Type: application/json');
    echo json_encode($response);
    exit;
}

// Helper function to create email headers
function createEmailHeaders($from_email, $from_name) {
    $headers = "From: $from_name <$from_email>\r\n";
    $headers .= "Reply-To: $from_email\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/html; charset=UTF-8\r\n";
    return $headers;
}

// Helper function to create customer confirmation email
function createCustomerEmail($appointment) {
    $date_formatted = date('l, F j, Y', strtotime($appointment['preferredDate']));
    
    $html = '
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
                <p>Dear ' . htmlspecialchars($appointment['customerName']) . ',</p>
                <p>Thank you for booking an appointment with IT Services Freetown. We have received your request and will confirm your appointment shortly.</p>
                
                <div class="appointment-details">
                    <h3>Appointment Details:</h3>
                    <p><strong>Appointment ID:</strong> ' . htmlspecialchars($appointment['appointmentId']) . '</p>
                    <p><strong>Tracking ID:</strong> ' . htmlspecialchars($appointment['trackingId']) . '</p>
                    <p><strong>Service Type:</strong> ' . htmlspecialchars($appointment['serviceType']) . '</p>
                    <p><strong>Device:</strong> ' . htmlspecialchars($appointment['deviceType']) . ' - ' . htmlspecialchars($appointment['deviceModel']) . '</p>
                    <p><strong>Date & Time:</strong> ' . $date_formatted . ' at ' . htmlspecialchars($appointment['preferredTime']) . '</p>
                </div>
                
                <p>You can track the status of your repair using your Tracking ID on our website:</p>
                <p style="text-align: center;">
                    <a href="https://itservicesfreetown.com/track-repair.html?id=' . htmlspecialchars($appointment['trackingId']) . '" class="button">Track Your Repair</a>
                </p>
                
                <p>If you have any questions or need to make changes to your appointment, please contact us at info@itservicesfreetown.com or call +232 33 399 391.</p>
                
                <p>Best regards,<br>The IT Services Freetown Team</p>
            </div>
            <div class="footer">
                <p>© ' . date('Y') . ' IT Services Freetown. All rights reserved.</p>
                <p>1 Regent Highway, Jui Junction, Freetown, Sierra Leone</p>
            </div>
        </div>
    </body>
    </html>';
    
    return $html;
}

// Helper function to create admin notification email
function createAdminEmail($appointment) {
    $date_formatted = date('l, F j, Y', strtotime($appointment['preferredDate']));
    
    $html = '
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
                    <p><strong>Name:</strong> ' . htmlspecialchars($appointment['customerName']) . '</p>
                    <p><strong>Email:</strong> ' . htmlspecialchars($appointment['email']) . '</p>
                    <p><strong>Phone:</strong> ' . htmlspecialchars($appointment['phone']) . '</p>
                    <p><strong>Address:</strong> ' . htmlspecialchars($appointment['address']) . '</p>
                    
                    <h3>Appointment Details:</h3>
                    <p><strong>Appointment ID:</strong> ' . htmlspecialchars($appointment['appointmentId']) . '</p>
                    <p><strong>Tracking ID:</strong> ' . htmlspecialchars($appointment['trackingId']) . '</p>
                    <p><strong>Service Type:</strong> ' . htmlspecialchars($appointment['serviceType']) . '</p>
                    <p><strong>Device:</strong> ' . htmlspecialchars($appointment['deviceType']) . ' - ' . htmlspecialchars($appointment['deviceModel']) . '</p>
                    <p><strong>Issue Description:</strong> ' . htmlspecialchars($appointment['issueDescription']) . '</p>
                    <p><strong>Date & Time:</strong> ' . $date_formatted . ' at ' . htmlspecialchars($appointment['preferredTime']) . '</p>
                </div>
                
                <p>Please review this appointment and confirm it with the customer.</p>
                
                <p style="text-align: center;">
                    <a href="https://itservicesfreetown.com/admin/appointments" class="button">View All Appointments</a>
                </p>
            </div>
            <div class="footer">
                <p>© ' . date('Y') . ' IT Services Freetown. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>';
    
    return $html;
}
?>
