'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CookiePopup from '@/components/CookiePopup';
import StaticChatFloat from '@/components/StaticChatFloat';
import FloatingScrollToTop from '@/components/FloatingScrollToTop';
import PWAInstallBanner from '@/components/PWAInstallBanner';
import NetworkMonitor from '@/components/NetworkMonitor';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';
import OfferPopup from '@/components/OfferPopup';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');
  const isPortfolioPage = pathname === '/ryanjstewart';

  if (isAdminPage || isPortfolioPage) {
    // Admin pages and Portfolio - clean layout with minimal components
    return (
      <>
        {children}
        <ServiceWorkerRegistration />
        <NetworkMonitor />
      </>
    );
  }

  // Regular pages - full layout with navbar, footer, and all components
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 main-content">
          {children}
        </main>
        <Footer />
      </div>
      <CookiePopup />
      <OfferPopup delay={30000} />
      <StaticChatFloat />
      <FloatingScrollToTop />
      <PWAInstallBanner />
      <NetworkMonitor />
      <ServiceWorkerRegistration />
    </>
  );
}