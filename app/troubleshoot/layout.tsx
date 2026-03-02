import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI Troubleshooter - Diagnose Device Problems Instantly',
  description: 'Use our AI-powered troubleshooter to diagnose computer and mobile phone problems instantly. Get step-by-step repair guidance from IT Services Freetown.',
  keywords: ['troubleshoot phone', 'diagnose computer problem', 'AI troubleshooter', 'device repair help', 'tech support Freetown'],
  openGraph: {
    title: 'AI-Powered Device Troubleshooter | IT Services Freetown',
    description: 'Diagnose your device problems instantly with our AI troubleshooter. Free step-by-step guidance.',
    type: 'website',
  },
}

export default function TroubleshootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
