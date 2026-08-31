import React from 'react';
import type { Metadata } from 'next';
import CardStudio from '@/components/digital-tools/CardStudio';

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
