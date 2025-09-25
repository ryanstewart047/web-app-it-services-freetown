'use client';

import React, { useEffect, useRef, useState } from 'react';

interface FacebookFeedProps {
  pageUrl?: string;
  width?: number;
  height?: number;
  showPosts?: boolean;
  showCover?: boolean;
  showFacepile?: boolean;
  smallHeader?: boolean;
  adaptContainerWidth?: boolean;
  hideCta?: boolean;
  className?: string;
}

const FacebookFeed: React.FC<FacebookFeedProps> = ({
  pageUrl = 'https://www.facebook.com/itservicefreetownfeed',
  width = 500,
  height = 700,
  showPosts = true,
  showCover = true,
  showFacepile = true,
  smallHeader = false,
  adaptContainerWidth = true,
  hideCta = false,
  className = '',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize Facebook SDK
    const initFacebookSDK = () => {
      return new Promise<void>((resolve) => {
        // Check if FB SDK is already loaded
        if (window.FB) {
          resolve();
          return;
        }

        // Load Facebook SDK script
        const script = document.createElement('script');
        script.src = 'https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v18.0';
        script.async = true;
        script.defer = true;
        script.crossOrigin = 'anonymous';
        
        script.onload = () => {
          window.FB.init({
            appId: process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || 'your-app-id', // You'll need to set this
            cookie: true,
            xfbml: true,
            version: 'v18.0'
          });
          resolve();
        };

        script.onerror = () => {
          console.error('Failed to load Facebook SDK');
          setError('Failed to load Facebook integration');
          setIsLoading(false);
        };

        document.head.appendChild(script);
      });
    };

    const loadFacebookFeed = async () => {
      try {
        await initFacebookSDK();
        
        // Parse Facebook plugins
        if (window.FB && window.FB.XFBML) {
          window.FB.XFBML.parse();
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error loading Facebook feed:', err);
        setError('Unable to load Facebook feed');
        setIsLoading(false);
      }
    };

    loadFacebookFeed();
  }, []);

  const tabs = [];
  if (showPosts) tabs.push('timeline');
  if (showPosts) tabs.push('events');
  if (showPosts) tabs.push('messages');

  if (error) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center space-x-3">
          <div className="text-red-500">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-red-800 font-semibold">Unable to Load Facebook Feed</h3>
            <p className="text-red-600 text-sm mt-1">{error}</p>
            <a 
              href={pageUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 inline-block"
            >
              Visit our Facebook page directly →
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`facebook-feed-container ${className}`} ref={containerRef}>
      {isLoading && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 animate-pulse">
          <div className="flex items-center justify-center space-x-3">
            <div className="text-blue-600">
              <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <div>
              <p className="text-gray-600 font-medium">Loading Facebook feed...</p>
              <p className="text-gray-500 text-sm">Connecting to IT Services Freetown</p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="h-32 bg-gray-300 rounded"></div>
          </div>
        </div>
      )}
      
      {/* Facebook Page Plugin */}
      <div
        className="fb-page"
        data-href={pageUrl}
        data-tabs={tabs.join(',')}
        data-width={width}
        data-height={height}
        data-small-header={smallHeader}
        data-adapt-container-width={adaptContainerWidth}
        data-hide-cover={!showCover}
        data-show-facepile={showFacepile}
        data-hide-cta={hideCta}
      ></div>

      {/* Backup link if plugin fails */}
      <div className="mt-4 text-center">
        <a 
          href={pageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span>Visit IT Services Freetown on Facebook</span>
        </a>
      </div>
    </div>
  );
};

export default FacebookFeed;