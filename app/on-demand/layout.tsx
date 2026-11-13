import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'On-Demand Services — Vetted Tech & Trade Pros in Freetown | BridgeTech',
  description: 'Book certified printer technicians, gaming console repair, certified electricians, plumbers, AC technicians, welders, and builders across Freetown, Sierra Leone. Guaranteed by BridgeTech.',
  keywords: [
    'on-demand services freetown',
    'printer repair freetown',
    'ps5 repair sierra leone',
    'gaming console technician freetown',
    'electrician freetown',
    'plumber freetown sierra leone',
    'ac repair freetown',
    'welder freetown',
    'bridgetech pro network',
  ],
  openGraph: {
    title: 'BridgeTech On-Demand Services — Certified Techs & Trades in Freetown',
    description: 'Connect with vetted technicians, electricians, plumbers, printer repairers, and artisans across Freetown. Fast response, guaranteed quality.',
    url: 'https://bridgetech.sl/on-demand',
    siteName: 'BridgeTech IT Services',
    locale: 'en_SL',
    type: 'website',
  },
};

export default function OnDemandLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
