import type { ReactNode } from 'react';

// Metadata for each shared product belongs to the page so there is one
// authoritative set of Open Graph tags for social crawlers.
export default function ShortUrlLayout({ children }: { children: ReactNode }) {
  return children;
}
