# PHP Form Handler Setup Guide

This guide explains how to set up the PHP form handler for the IT Services Freetown website.

## Files Overview

- `process-appointment.php`: Main form handler that processes appointment submissions
- `backup-appointments.php`: Script to backup the appointments data
- `.htaccess`: Apache configuration for security and PHP processing

## Requirements

- Web server with PHP 7.0+ support (Apache or Nginx)
- PHP with mail() function enabled
- Write permissions for the web server user on the directory

## Installation Steps

1. **Upload Files to Server**
   
   Upload all the PHP files to your web server alongside your HTML files.

2. **Set Permissions**
   
   Make sure the directory has proper permissions to allow the PHP script to create files:
   
   ```bash
   chmod 755 /path/to/your/website
   ```

3. **Configure Email Settings**
   
   Edit `process-appointment.php` and update the following values:
   
   ```php
   $admin_email = "your-email@example.com"; // Change to your email
   $website_name = "IT Services Freetown";
   $no_reply_email = "no-reply@yourdomain.com";
   ```

4. **Test Form Submission**
   
   Submit a test form to make sure everything is working correctly.

5. **Set Up Backup Cron Job (Optional but Recommended)**
   
   Set up a daily cron job to backup your appointment data:
   
   ```
   0 0 * * * php /path/to/your/website/backup-appointments.php >> /path/to/your/website/backup-log.txt 2>&1
   ```

## Security Considerations

- The `.htaccess` file is configured to prevent direct access to the JSON data file.
- All user inputs are sanitized to prevent XSS attacks.
- Ensure your server has HTTPS enabled for secure form submissions.

## Troubleshooting

- **Emails Not Sending**: Check if the mail() function is enabled in your PHP configuration.
- **Permission Errors**: Make sure the web server has write permission to create the JSON file.
- **Form Not Processing**: Check the PHP error logs for details.

## Support

If you encounter any issues, please contact your web developer for assistance.
