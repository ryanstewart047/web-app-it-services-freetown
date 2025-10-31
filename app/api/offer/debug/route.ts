import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN || process.env.GITHUB_TOKEN || ''
  const GITHUB_GIST_ID = process.env.OFFER_GIST_ID || process.env.GITHUB_GIST_ID || '741d3c2e3203df10a318d3dae1a94c66'
  
  console.log('[Debug] Checking environment...')
  console.log('[Debug] Has GITHUB_TOKEN:', !!GITHUB_TOKEN)
  console.log('[Debug] Token starts with:', GITHUB_TOKEN ? GITHUB_TOKEN.substring(0, 10) + '...' : 'NONE')
  console.log('[Debug] GIST_ID:', GITHUB_GIST_ID)
  
  // Test Gist access
  try {
    console.log('[Debug] Testing Gist API access...')
    const response = await fetch(`https://api.github.com/gists/${GITHUB_GIST_ID}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    })
    
    console.log('[Debug] Gist API response status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Debug] Gist API error:', errorText)
      
      return NextResponse.json({
        success: false,
        error: 'Cannot access Gist',
        status: response.status,
        details: errorText,
        hasToken: !!GITHUB_TOKEN,
        tokenType: GITHUB_TOKEN ? (GITHUB_TOKEN.startsWith('ghp_') ? 'classic' : GITHUB_TOKEN.startsWith('github_pat_') ? 'fine-grained' : 'unknown') : 'none',
        gistId: GITHUB_GIST_ID
      })
    }
    
    const gist = await response.json()
    const hasOfferFile = 'current-offer.json' in gist.files
    
    return NextResponse.json({
      success: true,
      message: 'Gist accessible',
      hasToken: !!GITHUB_TOKEN,
      tokenType: GITHUB_TOKEN ? (GITHUB_TOKEN.startsWith('ghp_') ? 'classic' : GITHUB_TOKEN.startsWith('github_pat_') ? 'fine-grained' : 'unknown') : 'none',
      gistId: GITHUB_GIST_ID,
      gistOwner: gist.owner?.login,
      hasOfferFile,
      files: Object.keys(gist.files)
    })
  } catch (error) {
    console.error('[Debug] Exception:', error)
    return NextResponse.json({
      success: false,
      error: 'Exception occurred',
      details: error instanceof Error ? error.message : String(error),
      hasToken: !!GITHUB_TOKEN,
      gistId: GITHUB_GIST_ID
    }, { status: 500 })
  }
}
