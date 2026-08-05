import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog Articles Viewer - BridgeTech IT Services',
  description: 'View and copy blog articles for import',
}

export default function ArticlesViewerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
