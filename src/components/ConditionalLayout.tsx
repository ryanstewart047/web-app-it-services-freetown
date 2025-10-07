'use client';

import { usePathname } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CookiePopup from '@/components/CookiePopup';
import BannerPopup from '@/components/BannerPopup';
import StaticChatFloat from '@/components/StaticChatFloat';
import FloatingScrollToTop from '@/components/FloatingScrollToTop';
import PWAInstallBanner from '@/components/PWAInstallBanner';
import NetworkMonitor from '@/components/NetworkMonitor';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith('/admin');

  if (isAdminPage) {
    // Admin pages - clean layout with minimal components
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
      <BannerPopup />
      <StaticChatFloat />
      <FloatingScrollToTop />
      <PWAInstallBanner />
      <NetworkMonitor />
      <ServiceWorkerRegistration />
    </>
  );
}