<?php
// Script to backup the appointments JSON file
// You can set this up as a cron job to run daily

// Configuration
$source_file = 'appointments.json';
$backup_dir = 'backups';
$retention_days = 30; // How many days of backups to keep

// Ensure backup directory exists
if (!file_exists($backup_dir)) {
    mkdir($backup_dir, 0755, true);
}

// Check if source file exists
if (!file_exists($source_file)) {
    echo "Source file not found: $source_file\n";
    exit(1);
}

// Create backup file with timestamp
$date = date('Y-m-d_H-i-s');
$backup_file = "$backup_dir/appointments_$date.json";

// Copy the file
if (copy($source_file, $backup_file)) {
    echo "Backup created: $backup_file\n";
} else {
    echo "Failed to create backup\n";
    exit(1);
}

// Remove old backups
$files = glob("$backup_dir/appointments_*.json");
foreach ($files as $file) {
    $file_time = filemtime($file);
    if ($file_time < time() - ($retention_days * 86400)) {
        if (unlink($file)) {
            echo "Removed old backup: $file\n";
        }
    }
}

echo "Backup process completed successfully.\n";
?>
