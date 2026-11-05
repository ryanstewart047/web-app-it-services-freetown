import { NextResponse } from 'next/server'
import { fetchBlogPosts } from '@/lib/github-blog-storage'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const posts = await fetchBlogPosts()
    return NextResponse.json(posts || [])
  } catch (error) {
    console.error('Error in /api/blog GET:', error)
    return NextResponse.json([], { status: 500 })
  }
}
