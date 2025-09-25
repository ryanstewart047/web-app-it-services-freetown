/**
 * Facebook SDK Configuration and Utilities
 * Professional Facebook integration service for IT Services Freetown
 */

interface FacebookSDKConfig {
  appId: string;
  version: string;
  cookie: boolean;
  xfbml: boolean;
  autoLogAppEvents?: boolean;
}

interface FacebookPageInfo {
  id: string;
  name: string;
  about?: string;
  link: string;
  picture?: {
    data: {
      url: string;
    };
  };
  cover?: {
    source: string;
  };
  fan_count?: number;
  is_verified?: boolean;
}

class FacebookService {
  private config: FacebookSDKConfig;
  private isInitialized = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    this.config = {
      appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || '1234567890', // Default for development
      version: 'v18.0',
      cookie: true,
      xfbml: true,
      autoLogAppEvents: false, // For privacy compliance
    };
  }

  /**
   * Initialize Facebook SDK
   */
  async init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this.loadSDK();
    return this.initPromise;
  }

  private async loadSDK(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Check if running on server side
      if (typeof window === 'undefined') {
        reject(new Error('Facebook SDK can only be loaded in the browser'));
        return;
      }

      // Check if already loaded
      if (window.FB && this.isInitialized) {
        resolve();
        return;
      }

      // Create Facebook root element if it doesn't exist
      if (!document.getElementById('fb-root')) {
        const fbRoot = document.createElement('div');
        fbRoot.id = 'fb-root';
        document.body.appendChild(fbRoot);
      }

      // Load SDK script
      const script = document.createElement('script');
      script.src = `https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=${this.config.version}&appId=${this.config.appId}`;
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      script.nonce = this.generateNonce(); // Security enhancement

      script.onload = () => {
        if (window.FB) {
          window.FB.init({
            appId: this.config.appId,
            cookie: this.config.cookie,
            xfbml: this.config.xfbml,
            version: this.config.version,
            autoLogAppEvents: this.config.autoLogAppEvents,
          });

          this.isInitialized = true;
          console.log('✅ Facebook SDK initialized successfully');
          resolve();
        } else {
          reject(new Error('Facebook SDK failed to initialize'));
        }
      };

      script.onerror = () => {
        console.error('❌ Failed to load Facebook SDK');
        reject(new Error('Failed to load Facebook SDK'));
      };

      document.head.appendChild(script);
    });
  }

  /**
   * Parse Facebook XFBML elements on the page
   */
  parseXFBML(element?: Element): void {
    if (window.FB && window.FB.XFBML) {
      window.FB.XFBML.parse(element);
    }
  }

  /**
   * Get Facebook page information
   */
  async getPageInfo(pageId: string): Promise<FacebookPageInfo | null> {
    try {
      await this.init();
      
      return new Promise((resolve) => {
        window.FB.api(
          `/${pageId}`,
          'GET',
          {
            fields: 'id,name,about,link,picture,cover,fan_count,is_verified'
          },
          (response: FacebookPageInfo | { error: any }) => {
            if (response && !(response as any).error) {
              resolve(response as FacebookPageInfo);
            } else {
              console.error('Error fetching page info:', (response as any).error);
              resolve(null);
            }
          }
        );
      });
    } catch (error) {
      console.error('Error getting page info:', error);
      return null;
    }
  }

  /**
   * Generate a random nonce for security
   */
  private generateNonce(): string {
    return btoa(Math.random().toString()).substring(0, 16);
  }

  /**
   * Check if SDK is ready
   */
  isReady(): boolean {
    return this.isInitialized && !!window.FB;
  }

  /**
   * Resize Facebook plugins (useful for responsive design)
   */
  resizePlugins(): void {
    if (this.isReady()) {
      window.FB.XFBML.parse();
    }
  }

  /**
   * Clean up Facebook SDK
   */
  cleanup(): void {
    if (window.FB) {
      // Remove event listeners if any
      this.isInitialized = false;
      this.initPromise = null;
    }
  }
}

// Export singleton instance
export const facebookService = new FacebookService();
export default facebookService;

// Type declarations
declare global {
  interface Window {
    FB: {
      init: (config: FacebookSDKConfig) => void;
      XFBML: {
        parse: (element?: Element) => void;
      };
      api: (
        path: string,
        method: string,
        params: any,
        callback: (response: any) => void
      ) => void;
    };
  }
}