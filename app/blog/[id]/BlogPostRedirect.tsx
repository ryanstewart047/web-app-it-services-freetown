'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function BlogPostRedirect({ params }: { params: { id: string } }) {
  const router = useRouter()
  
  useEffect(() => {
    // Redirect to main blog page with hash
    router.replace(`/blog#post-${params.id}`)
  }, [params.id, router])
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-red-50 to-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading post...</p>
      </div>
    </div>
  )
}
