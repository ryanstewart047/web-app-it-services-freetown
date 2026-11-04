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
import PartnersSection from '@/components/PartnersSection';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import SplashScreen from '@/components/SplashScreen';

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

function ConditionalLayoutInner({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isIframeMode = searchParams?.get('iframe') === '1';
  const currentPath = pathname || (typeof window !== 'undefined' ? window.location.pathname : '');

  // Paths that are "admin-adjacent" but not under /admin — suppress chrome when in iframe
  const isAdminAdjacentPage =
    currentPath?.startsWith('/banner-admin') ||
    currentPath?.startsWith('/partners-admin') ||
    currentPath?.startsWith('/offer-admin') ||
    currentPath?.startsWith('/ads-admin') ||
    currentPath?.startsWith('/receipt') ||
    currentPath?.startsWith('/blog/admin') ||
    currentPath?.startsWith('/forum/admin') ||
    currentPath?.startsWith('/madinaface3bridgeproject/admin');

  const isAdminPage = currentPath?.startsWith('/admin') || isAdminAdjacentPage;
  const isPortfolioPage = currentPath === '/ryanjstewart';
  const isForumPage = currentPath === '/forum' || currentPath?.startsWith('/forum/');
  const isDonationPage = currentPath === '/madinaface3bridgeproject' || currentPath?.startsWith('/madinaface3bridgeproject/');
  const isShirleyPage = currentPath === '/shirleys' || currentPath?.startsWith('/shirleys/');
  const isSurpriseRevealPage = currentPath?.startsWith('/surprise/');
  const isQuestionnairePage = currentPath?.startsWith('/website-questionnaire');

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

  if (isShirleyPage) {
    return (
      <>
        <main className="w-full">
          {children}
        </main>
        <ServiceWorkerRegistration />
        <NetworkMonitor />
      </>
    );
  }

  if (isSurpriseRevealPage || isQuestionnairePage) {
    return (
      <>
        <main className="w-full">{children}</main>
        <ServiceWorkerRegistration />
        <NetworkMonitor />
      </>
    );
  }

  if (isAdminPage || isPortfolioPage || isDonationPage || isForumPage) {
    // Custom standalone pages (Admin, Portfolio, Donation, Forum) - clean layout without IT Services header/footer
    return (
      <>
        <SplashScreen />
        <main className="w-full pb-16 md:pb-0">
          {children}
        </main>
        <ServiceWorkerRegistration />
        <NetworkMonitor />
      </>
    );
  }

  // Regular pages - full layout with navbar, footer, and all components
  return (
    <>
      <SplashScreen />
      <div className="min-h-screen w-full flex flex-col">
        <div id="site-sticky-header" className="sticky top-0 z-[10001] w-full sticky-header-container">
          <GlobalBanner />
          <Navbar />
        </div>
        <main className="flex-1 w-full main-content pb-16 md:pb-0">
          {children}
        </main>
        <PartnersSection />
        <Footer />
      </div>
      <CookiePopup />
      <OfferPopup delay={5000} />
      <NewsletterPopup delay={8000} />
      <StaticChatFloat />
      {/* <FloatingScrollToTop /> */}
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
