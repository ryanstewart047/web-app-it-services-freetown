import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Chat Support - Get Instant Tech Help',
  description: 'Chat with our AI assistant for instant tech support. Get help with device issues, repair inquiries, and troubleshooting from IT Services Freetown.',
  keywords: ['tech chat support', 'AI tech help', 'repair chat', 'tech support Freetown', 'instant help'],
  openGraph: {
    title: 'AI Chat Support | IT Services Freetown',
    description: 'Get instant tech help and support through our AI-powered chat assistant.',
    type: 'website',
  },
}

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
