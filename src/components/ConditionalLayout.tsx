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
import GlobalBanner from '@/components/GlobalBanner';
import MobileBottomNav from '@/components/layout/MobileBottomNav';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');
  const isPortfolioPage = pathname === '/ryanjstewart';
  const isForumPage = pathname === '/forum' || pathname?.startsWith('/forum/');
  const isDonationPage = pathname === '/madinaface3bridgeproject' || pathname?.startsWith('/madinaface3bridgeproject/');

  if (isAdminPage || isPortfolioPage || isDonationPage || isForumPage) {
    // Admin pages, Portfolio, Donation, and Forum page - clean layout with minimal components
    return (
      <>
        <div className="sticky top-0 z-50">
          <GlobalBanner />
        </div>
        <main className="pb-16 md:pb-0">
          {children}
        </main>
        <ServiceWorkerRegistration />
        <NetworkMonitor />
        <MobileBottomNav />
      </>
    );
  }

  // Regular pages - full layout with navbar, footer, and all components
  return (
    <>
      <div className="min-h-screen flex flex-col">
        <div className="sticky top-0 z-50">
          <GlobalBanner />
          <Navbar />
        </div>
        <main className="flex-1 main-content pb-16 md:pb-0">
          {children}
        </main>
        <Footer />
      </div>
      <CookiePopup />
      <OfferPopup delay={5000} />
      <StaticChatFloat />
      <FloatingScrollToTop />
      <PWAInstallBanner />
      <NetworkMonitor />
      <ServiceWorkerRegistration />
      <MobileBottomNav />
    </>
  );
}