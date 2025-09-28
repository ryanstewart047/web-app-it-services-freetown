// Cloud-based booking synchronization using GitHub Gist
// Provides automatic sync across all devices without manual intervention

export interface CloudSyncConfig {
  gistId?: string;
  accessToken?: string;
  enabled: boolean;
}

export interface CloudBookingData {
  bookings: any[];
  lastUpdated: string;
  version: number;
}

// GitHub Gist API endpoint
const GIST_API_URL = 'https://api.github.com/gists';

// Default config (can be overridden by admin)
const DEFAULT_CONFIG: CloudSyncConfig = {
  gistId: 'YOUR_GIST_ID', // Will be set by admin
  accessToken: 'YOUR_GITHUB_TOKEN', // Will be set by admin  
  enabled: false // Disabled by default until configured
};

// Get cloud sync configuration
export function getCloudSyncConfig(): CloudSyncConfig {
  if (typeof window === 'undefined') return DEFAULT_CONFIG;
  
  try {
    const config = localStorage.getItem('its_cloud_sync_config');
    return config ? { ...DEFAULT_CONFIG, ...JSON.parse(config) } : DEFAULT_CONFIG;
  } catch (error) {
    console.warn('Error loading cloud sync config:', error);
    return DEFAULT_CONFIG;
  }
}

// Save cloud sync configuration
export function saveCloudSyncConfig(config: Partial<CloudSyncConfig>): void {
  if (typeof window === 'undefined') return;
  
  try {
    const currentConfig = getCloudSyncConfig();
    const newConfig = { ...currentConfig, ...config };
    localStorage.setItem('its_cloud_sync_config', JSON.stringify(newConfig));
  } catch (error) {
    console.error('Error saving cloud sync config:', error);
  }
}

// Upload booking data to cloud (GitHub Gist)
export async function syncToCloud(bookings: any[]): Promise<{ success: boolean; message: string }> {
  const config = getCloudSyncConfig();
  
  if (!config.enabled || !config.gistId || !config.accessToken) {
    return { success: false, message: 'Cloud sync not configured' };
  }

  try {
    const cloudData: CloudBookingData = {
      bookings,
      lastUpdated: new Date().toISOString(),
      version: Date.now()
    };

    const response = await fetch(`${GIST_API_URL}/${config.gistId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${config.accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        files: {
          'its-bookings.json': {
            content: JSON.stringify(cloudData, null, 2)
          }
        }
      })
    });

    if (response.ok) {
      console.log('Successfully synced to cloud');
      return { success: true, message: 'Data synced to cloud successfully' };
    } else {
      const error = await response.text();
      console.error('Cloud sync failed:', error);
      return { success: false, message: `Cloud sync failed: ${response.status}` };
    }
  } catch (error) {
    console.error('Cloud sync error:', error);
    return { success: false, message: 'Cloud sync error: Network or configuration issue' };
  }
}

// Download booking data from cloud (GitHub Gist)
export async function syncFromCloud(): Promise<{ success: boolean; message: string; data?: any[] }> {
  const config = getCloudSyncConfig();
  
  if (!config.enabled || !config.gistId) {
    return { success: false, message: 'Cloud sync not configured' };
  }

  try {
    const response = await fetch(`${GIST_API_URL}/${config.gistId}`, {
      headers: {
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (response.ok) {
      const gist = await response.json();
      const fileContent = gist.files['its-bookings.json']?.content;
      
      if (fileContent) {
        const cloudData: CloudBookingData = JSON.parse(fileContent);
        console.log('Successfully fetched from cloud:', cloudData.bookings.length, 'bookings');
        return { 
          success: true, 
          message: `Found ${cloudData.bookings.length} bookings in cloud`,
          data: cloudData.bookings
        };
      } else {
        return { success: false, message: 'No booking data found in cloud' };
      }
    } else {
      return { success: false, message: `Cloud fetch failed: ${response.status}` };
    }
  } catch (error) {
    console.error('Cloud fetch error:', error);
    return { success: false, message: 'Cloud fetch error: Network issue' };
  }
}

// Auto-sync: Upload local data to cloud (called when booking is created/updated)
export async function autoSyncUp(bookings: any[]): Promise<void> {
  const config = getCloudSyncConfig();
  
  if (!config.enabled) {
    console.log('Auto-sync disabled');
    return;
  }

  console.log('Auto-syncing', bookings.length, 'bookings to cloud...');
  const result = await syncToCloud(bookings);
  
  if (result.success) {
    // Store last sync time
    localStorage.setItem('its_last_sync_up', new Date().toISOString());
  }
}

// Auto-sync: Download cloud data and merge (called on admin panel load)
export async function autoSyncDown(): Promise<{ success: boolean; message: string; newBookings: any[] }> {
  const config = getCloudSyncConfig();
  
  if (!config.enabled) {
    return { success: false, message: 'Auto-sync disabled', newBookings: [] };
  }

  console.log('Auto-syncing down from cloud...');
  const result = await syncFromCloud();
  
  if (result.success && result.data) {
    // Get existing local bookings
    const existingBookings = getLocalBookings();
    const existingIds = new Set(existingBookings.map((b: any) => b.trackingId));
    
    // Find new bookings from cloud
    const newBookings = result.data.filter((booking: any) => !existingIds.has(booking.trackingId));
    
    if (newBookings.length > 0) {
      // Merge with local data
      const mergedBookings = [...existingBookings, ...newBookings];
      saveLocalBookings(mergedBookings);
      
      localStorage.setItem('its_last_sync_down', new Date().toISOString());
      
      return { 
        success: true, 
        message: `Auto-synced ${newBookings.length} new bookings from cloud`,
        newBookings 
      };
    } else {
      return { success: true, message: 'No new bookings to sync', newBookings: [] };
    }
  }
  
  return { success: false, message: result.message, newBookings: [] };
}

// Helper functions for local storage
function getLocalBookings(): any[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem('its_bookings');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
}

function saveLocalBookings(bookings: any[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem('its_bookings', JSON.stringify(bookings));
  } catch (error) {
    console.error('Error saving bookings locally:', error);
  }
}

// Check if cloud sync is configured
export function isCloudSyncConfigured(): boolean {
  const config = getCloudSyncConfig();
  return !!(config.enabled && config.gistId && config.accessToken);
}

// Get sync status
export function getSyncStatus(): { lastSyncUp?: string; lastSyncDown?: string; configured: boolean } {
  return {
    lastSyncUp: localStorage.getItem('its_last_sync_up') || undefined,
    lastSyncDown: localStorage.getItem('its_last_sync_down') || undefined,
    configured: isCloudSyncConfigured()
  };
}