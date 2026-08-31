import React from 'react';
import type { Metadata } from 'next';
import dynamicImport from 'next/dynamic';

export const dynamic = 'force-dynamic';

const CardStudio = dynamicImport(
  () => import('@/components/digital-tools/CardStudio'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-400">Loading 300 DPI Card Studio...</p>
        </div>
      </div>
    ),
  }
);

export const metadata: Metadata = {
  title: 'Smart Business & ID Card Generator | 300 DPI Print Studio | BridgeTec',
  description: 'Design and download high-resolution 300 DPI executive business cards, staff ID badges, complement cards & VIP event passes with scannable vCard QR codes and printable A4 sheets.',
  keywords: [
    'business card maker',
    'id card generator',
    'print business cards',
    '300 dpi business card',
    'vcard qr code generator',
    'staff id badge maker',
    'freetown printing',
    'bridgetec digital tools',
  ],
  openGraph: {
    title: 'Smart Business & ID Card Generator — BridgeTec Studio',
    description: 'Design luxury business cards & corporate badges with scannable vCard QR codes. Download print-ready PDFs with cutting guides.',
    url: 'https://www.itservicesfreetown.com/digital-tools/card-studio',
    type: 'website',
  },
};

export default function CardStudioPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white py-8 px-4 sm:px-6 lg:px-8">
      <CardStudio />
    </div>
  );
}

