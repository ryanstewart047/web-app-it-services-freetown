import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search BridgeTech repair services, guides, digital tools, products, and articles.',
}

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children
}
