import fs from 'fs';
import path from 'path';
import { redirect } from 'next/navigation';
import Script from 'next/script';

interface Props {
  params: { code: string };
}

function getOriginalUrl(code: string): string | null {
  try {
    const filePath = path.join(process.cwd(), 'data', 'short-urls.json');
    
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const data = fs.readFileSync(filePath, 'utf-8');
    const urlMap = JSON.parse(data);
    return urlMap[code] || null;
  } catch (error) {
    console.error('Error reading short URL mapping:', error);
    return null;
  }
}

function isValidRedirectUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    
    const allowedDomains = [
      'itservicesfreetown.com',
      'www.itservicesfreetown.com',
      'localhost',
      '127.0.0.1',
      'vercel.app',
      'web-app-it-services-freetown.vercel.app'
    ];
    
    const hostname = parsed.hostname.toLowerCase();
    const isAllowed = allowedDomains.some(domain => 
      hostname === domain || 
      hostname === `www.${domain}` ||
      hostname.endsWith(`.${domain}`)
    );
    
    return isAllowed;
  } catch (error) {
    return false;
  }
}

export default function ShortUrlRedirect({ params }: Props) {
  const originalUrl = getOriginalUrl(params.code);
  
  if (!originalUrl || !isValidRedirectUrl(originalUrl)) {
    redirect('/marketplace');
  }
  
  return (
    <>
      <Script id="redirect-script" strategy="afterInteractive">
        {`window.location.href = '${originalUrl}';`}
      </Script>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Redirecting...</p>
        </div>
      </div>
    </>
  );
}
