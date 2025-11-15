'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';

export default function ShortUrlRedirect() {
  const params = useParams();
  const router = useRouter();
  const code = params?.code as string;

  useEffect(() => {
    async function redirect() {
      try {
        // Try to get the original URL from the API
        const response = await fetch(`/api/shorten?code=${code}`);
        
        if (response.ok) {
          const data = await response.json();
          const url = data.originalUrl;
          
          // Validate URL before redirecting
          if (isValidRedirectUrl(url)) {
            window.location.href = url;
          } else {
            console.warn('Invalid redirect URL blocked:', url);
            router.push('/marketplace');
          }
        } else {
          // Fallback: try to reconstruct from local storage
          const stored = localStorage.getItem(`short_${code}`);
          if (stored && isValidRedirectUrl(stored)) {
            window.location.href = stored;
          } else {
            // Redirect to marketplace if not found
            router.push('/marketplace');
          }
        }
      } catch (error) {
        console.error('Error redirecting:', error);
        router.push('/marketplace');
      }
    }

    if (code) {
      redirect();
    }
  }, [code, router]);

  // Validate redirect URLs to prevent open redirect attacks
  function isValidRedirectUrl(url: string): boolean {
    try {
      const parsed = new URL(url);
      
      // Allow only HTTP/HTTPS protocols
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        return false;
      }
      
      // Whitelist of allowed domains for redirection
      const allowedDomains = [
        'itservicesfreetown.com',
        'www.itservicesfreetown.com',
        'localhost',
        '127.0.0.1',
        // Add your deployment domains
        'vercel.app',
        'web-app-it-services-freetown.vercel.app'
      ];
      
      // Check if hostname matches or is a subdomain of allowed domains
      const hostname = parsed.hostname.toLowerCase();
      const isAllowed = allowedDomains.some(domain => 
        hostname === domain || 
        hostname === `www.${domain}` ||
        hostname.endsWith(`.${domain}`)
      );
      
      return isAllowed;
    } catch (error) {
      // Invalid URL format
      return false;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Redirecting...</p>
      </div>
    </div>
  );
}
