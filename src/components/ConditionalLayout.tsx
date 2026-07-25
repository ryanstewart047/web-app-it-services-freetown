'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import CookiePopup from '@/components/CookiePopup';
import StaticChatFloat from '@/components/StaticChatFloat';
import FloatingScrollToTop from '@/components/FloatingScrollToTop';
import PWAInstallBanner from '@/components/PWAInstallBanner';
import NetworkMonitor from '@/components/NetworkMonitor';
import ServiceWorkerRegistration from '@/components/ServiceWorkerRegistration';
import OfferPopup from '@/components/OfferPopup';
import NewsletterPopup from '@/components/NewsletterPopup';
import GlobalBanner from '@/components/GlobalBanner';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import SplashScreen from '@/components/SplashScreen';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

function ConditionalLayoutInner({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isIframeMode = searchParams?.get('iframe') === '1';

  // Paths that are "admin-adjacent" but not under /admin — suppress chrome when in iframe
  const isAdminAdjacentPage =
    pathname?.startsWith('/banner-admin') ||
    pathname?.startsWith('/offer-admin') ||
    pathname?.startsWith('/ads-admin') ||
    pathname?.startsWith('/receipt') ||
    pathname?.startsWith('/blog/admin') ||
    pathname?.startsWith('/blog/admin') ||
    pathname?.startsWith('/forum/admin') ||
    pathname?.startsWith('/madinaface3bridgeproject/admin');

  const isAdminPage = pathname?.startsWith('/admin') || isAdminAdjacentPage;
  const isPortfolioPage = pathname === '/ryanjstewart';
  const isForumPage = pathname === '/forum' || pathname?.startsWith('/forum/');
  const isDonationPage = pathname === '/madinaface3bridgeproject' || pathname?.startsWith('/madinaface3bridgeproject/');

  // In iframe mode, always render bare children with no chrome
  if (isIframeMode) {
    return (
      <>
        <main className="w-full">{children}</main>
        <ServiceWorkerRegistration />
        <NetworkMonitor />
      </>
    );
  }

  if (isAdminPage || isPortfolioPage || isDonationPage || isForumPage) {
    // Admin pages, Portfolio, Donation, and Forum page - clean layout with minimal components
    return (
      <>
        <SplashScreen />
        <div className="sticky top-0 z-50">
          <GlobalBanner />
        </div>
        <main className="w-full pb-16 md:pb-0">
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
      <SplashScreen />
      <div className="min-h-screen w-full flex flex-col">
        <div className="sticky top-0 z-50">
          <GlobalBanner />
          <Navbar />
        </div>
        <main className="flex-1 w-full main-content pb-16 md:pb-0">
          {children}
        </main>
        <Footer />
      </div>
      <CookiePopup />
      <OfferPopup delay={5000} />
      <NewsletterPopup delay={8000} />
      <StaticChatFloat />
      <FloatingScrollToTop />
      <PWAInstallBanner />
      <NetworkMonitor />
      <ServiceWorkerRegistration />
      <MobileBottomNav />
    </>
  );
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  return (
    <Suspense fallback={<main className="w-full">{children}</main>}>
      <ConditionalLayoutInner>{children}</ConditionalLayoutInner>
    </Suspense>
  );
}