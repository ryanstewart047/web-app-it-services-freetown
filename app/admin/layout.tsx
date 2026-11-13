'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import ThemeToggle from './components/ThemeToggle';
import { BRAND_LOGO_SRC, BRAND_AVATAR_TRANSPARENT_SRC, BRAND_NAME } from '@/lib/brand';

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const isIframeMode = searchParams?.get('iframe') === '1';

  // When rendered inside the Master Admin Hub iframe, skip all chrome
  if (isIframeMode) {
    return (
      <>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('admin-theme') || 'light';
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                }
                let lastReportTime = 0;
                const report = () => {
                  const now = Date.now();
                  if (now - lastReportTime > 5000 && window.parent && window.parent !== window) {
                    lastReportTime = now;
                    window.parent.postMessage({ type: 'ADMIN_ACTIVITY' }, '*');
                  }
                };
                ['mousedown', 'keydown', 'touchstart', 'click'].forEach(e => {
                  document.addEventListener(e, report, { passive: true });
                });
              } catch (e) {}
            `,
          }}
        />
        <div id="admin-root">{children}</div>
      </>
    );
  }

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            try {
              const theme = localStorage.getItem('admin-theme') || 'light';
              if (theme === 'dark') {
                document.documentElement.classList.add('dark');
              }
            } catch (e) {}
          `,
        }}
      />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 transition-colors dark:from-gray-950 dark:via-gray-900 dark:to-gray-950" id="admin-root">
        <header className="sticky top-0 z-40 border-b border-gray-200/80 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70 dark:border-gray-800/80 dark:bg-gray-900/90">
          <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-6 lg:px-8">
            <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
              <div className="relative flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-lg sm:h-12 sm:w-12 dark:border-gray-700 dark:bg-gray-800 p-1">
                  <Image src={BRAND_AVATAR_TRANSPARENT_SRC} alt={`${BRAND_NAME} avatar`} width={40} height={40} className="object-contain" priority />
                </div>
              </div>
              <div className="flex min-w-0 flex-col gap-1">
                <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-red-600 dark:text-red-400 sm:text-xs">Admin Console</span>
                <h1 className="truncate text-lg font-semibold text-gray-900 dark:text-gray-100 sm:text-xl lg:text-2xl">
                  BridgeTech IT Services
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 sm:text-[15px]">
                  Manage operations, performance, and support in one place.
                </p>
              </div>
            </div>

            <div className="flex w-full items-center justify-between gap-3 md:w-auto md:justify-end">
              <p className="text-xs font-medium uppercase tracking-[0.3em] text-gray-500 dark:text-gray-500 md:hidden">
                Display
              </p>
              <ThemeToggle />
            </div>
          </div>

          <div className="border-t border-gray-200/60 bg-white/80 px-4 py-3 text-center text-sm text-gray-500 dark:border-gray-800/60 dark:bg-gray-900/80 dark:text-gray-400 md:hidden">
            Streamlined workspace — scroll to manage analytics, forms, and repairs.
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div id="admin-root">{children}</div>}>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </Suspense>
  );
}
