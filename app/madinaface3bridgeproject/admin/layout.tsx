import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin - Bridge Project Gallery',
  description: 'Manage project progress photos for the Madina Face 3 Community Bridge Project',
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
