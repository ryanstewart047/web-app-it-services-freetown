'use client';

import React, { useEffect, useState } from 'react';
import facebookService from '../../lib/facebook-service';

interface FacebookPagePluginProps {
  pageUrl?: string;
  variant?: 'timeline' | 'events' | 'messages' | 'full';
  width?: number;
  height?: number;
  showHeader?: boolean;
  showCover?: boolean;
  showFacepile?: boolean;
  smallHeader?: boolean;
  adaptContainerWidth?: boolean;
  hideCta?: boolean;
  className?: string;
}

const FacebookPagePlugin: React.FC<FacebookPagePluginProps> = ({
  pageUrl = 'https://www.facebook.com/itservicefreetown',
  variant = 'full',
  width = 500,
  height = 700,
  showHeader = true,
  showCover = true,
  showFacepile = true,
  smallHeader = false,
  adaptContainerWidth = true,
  hideCta = false,
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageInfo, setPageInfo] = useState<any>(null);

  // Define tabs based on variant
  const getTabsForVariant = (variant: string) => {
    switch (variant) {
      case 'timeline':
        return ['timeline'];
      case 'events':
        return ['events'];
      case 'messages':
        return ['messages'];
      case 'full':
      default:
        return ['timeline', 'events', 'messages'];
    }
  };

  useEffect(() => {
    const initializeFacebook = async () => {
      try {
        setIsLoading(true);
        await facebookService.init();
        
        // Parse the Facebook plugins
        facebookService.parseXFBML();
        
        // Get page information if possible
        const pageId = extractPageIdFromUrl(pageUrl);
        if (pageId) {
          const info = await facebookService.getPageInfo(pageId);
          setPageInfo(info);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing Facebook:', err);
        setError(err instanceof Error ? err.message : 'Failed to load Facebook integration');
        setIsLoading(false);
      }
    };

    initializeFacebook();

    // Cleanup on unmount
    return () => {
      // Facebook SDK cleanup is handled by the service
    };
  }, [pageUrl]);

  // Extract page ID from URL for API calls
  const extractPageIdFromUrl = (url: string): string | null => {
    const match = url.match(/facebook\.com\/([^/?]+)/);
    return match ? match[1] : null;
  };

  // Handle resize for responsive design
  useEffect(() => {
    const handleResize = () => {
      if (adaptContainerWidth && facebookService.isReady()) {
        facebookService.resizePlugins();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [adaptContainerWidth]);

  if (error) {
    return (
      <div className={`bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-6 shadow-sm ${className}`}>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-800 mb-2">Facebook Feed Unavailable</h3>
            <p className="text-red-700 mb-4">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a 
                href={pageUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Visit Facebook Page
              </a>
              <button 
                onClick={() => window.location.reload()} 
                className="inline-flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`facebook-page-plugin ${className}`}>
      {/* Header with page info */}
      {pageInfo && showHeader && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-t-xl p-6 text-white">
          <div className="flex items-center space-x-4">
            {pageInfo.picture && (
              <img 
                src={pageInfo.picture.data.url} 
                alt={pageInfo.name}
                className="w-16 h-16 rounded-full border-3 border-white shadow-lg"
              />
            )}
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-1">{pageInfo.name}</h2>
              {pageInfo.about && (
                <p className="text-blue-100 text-sm">{pageInfo.about}</p>
              )}
              <div className="flex items-center space-x-4 mt-2">
                {pageInfo.fan_count && (
                  <span className="text-blue-100 text-sm">
                    👥 {pageInfo.fan_count.toLocaleString()} followers
                  </span>
                )}
                {pageInfo.is_verified && (
                  <span className="text-blue-100 text-sm flex items-center">
                    <svg className="w-4 h-4 mr-1 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Verified
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="bg-white rounded-b-xl p-8 border border-gray-200 shadow-sm">
          <div className="animate-pulse">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-8 h-8 bg-blue-600 rounded-full animate-bounce"></div>
              <div className="text-gray-600 font-medium">Loading Facebook feed...</div>
            </div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              <div className="h-32 bg-gray-300 rounded"></div>
              <div className="h-24 bg-gray-300 rounded"></div>
              <div className="h-40 bg-gray-300 rounded"></div>
            </div>
          </div>
        </div>
      )}

      {/* Facebook Page Plugin */}
      <div className={`${showHeader ? 'rounded-b-xl' : 'rounded-xl'} overflow-hidden shadow-lg`}>
        <div
          className="fb-page"
          data-href={pageUrl}
          data-tabs={getTabsForVariant(variant).join(',')}
          data-width={width}
          data-height={height}
          data-small-header={smallHeader}
          data-adapt-container-width={adaptContainerWidth}
          data-hide-cover={!showCover}
          data-show-facepile={showFacepile}
          data-hide-cta={hideCta}
        ></div>
      </div>

      {/* Footer with additional actions */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        <a 
          href={pageUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          Follow on Facebook
        </a>
        <a 
          href={`${pageUrl}/posts`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          Message Us
        </a>
      </div>
    </div>
  );
};

export default FacebookPagePlugin;