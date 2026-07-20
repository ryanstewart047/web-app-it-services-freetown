// Offer storage using GitHub Gist
const GITHUB_TOKEN = process.env.ITS_FREETOWN_OFFER_TOKEN || process.env.ITS_GITHUB_TOKEN || process.env.NEXT_PUBLIC_GITHUB_TOKEN || process.env.GITHUB_TOKEN || ''
const GITHUB_GIST_ID = process.env.OFFER_GIST_ID || process.env.GITHUB_GIST_ID || '741d3c2e3203df10a318d3dae1a94c66'
const OFFER_FILENAME = 'current-offer.json'

export interface Offer {
  id: string
  title: string
  description: string
  imageUrl: string
  buttonText?: string
  buttonLink?: string
  buttonColor?: string
  backgroundColor?: string
  textColor?: string
  badgeColor?: string
  badgeText?: string
  termsText?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export async function getCurrentOffer(): Promise<Offer | null> {
  try {
    console.log('[Offer Storage] Fetching offer from Gist ID:', GITHUB_GIST_ID)
    console.log('[Offer Storage] Using token:', GITHUB_TOKEN ? 'Token present' : 'No token')
    
    const response = await fetch(`https://api.github.com/gists/${GITHUB_GIST_ID}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('[Offer Storage] Failed to fetch offer:', response.status, response.statusText)
      const errorText = await response.text()
      console.error('[Offer Storage] Error details:', errorText)
      return null
    }

    const gist = await response.json()
    console.log('[Offer Storage] Gist fetched, files:', Object.keys(gist.files))
    const offerFile = gist.files[OFFER_FILENAME]

    if (!offerFile) {
      console.error('[Offer Storage] Offer file not found. Available files:', Object.keys(gist.files))
      return null
    }

    const offer = JSON.parse(offerFile.content)
    console.log('[Offer Storage] Offer parsed:', { title: offer.title, isActive: offer.isActive })
    return offer.isActive ? offer : null
  } catch (error) {
    console.error('[Offer Storage] Error fetching offer:', error)
    return null
  }
}

export async function getOfferForAdmin(): Promise<Offer | null> {
  try {
    const response = await fetch(`https://api.github.com/gists/${GITHUB_GIST_ID}`, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
      },
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('[Offer Storage] Failed to fetch offer for admin:', response.status)
      return null
    }

    const gist = await response.json()
    const offerFile = gist.files[OFFER_FILENAME]

    if (!offerFile) {
      return null
    }

    const offer = JSON.parse(offerFile.content)
    return offer // Return regardless of isActive status
  } catch (error) {
    console.error('[Offer Storage] Error fetching offer for admin:', error)
    return null
  }
}

export async function saveOffer(offer: Offer): Promise<boolean> {
  try {
    console.log('[Offer Storage] Saving offer to Gist...')
    console.log('[Offer Storage] Gist ID:', GITHUB_GIST_ID)
    console.log('[Offer Storage] Has token:', !!GITHUB_TOKEN)
    
    if (!GITHUB_TOKEN) {
      console.error('[Offer Storage] ❌ No GitHub token available')
      return false
    }
    
    if (!GITHUB_GIST_ID) {
      console.error('[Offer Storage] ❌ No Gist ID configured')
      return false
    }
    
    const response = await fetch(`https://api.github.com/gists/${GITHUB_GIST_ID}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        files: {
          [OFFER_FILENAME]: {
            content: JSON.stringify(offer, null, 2),
          },
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Offer Storage] ❌ Failed to save:', response.status, errorText)
      return false
    }
    
    console.log('[Offer Storage] ✅ Offer saved successfully')
    return true
  } catch (error) {
    console.error('[Offer Storage] ❌ Error saving offer:', error)
    return false
  }
}

export async function createOffer(title: string, description: string, imageUrl: string, buttonText?: string, buttonLink?: string, buttonColor?: string, backgroundColor?: string, textColor?: string, badgeColor?: string, badgeText?: string, termsText?: string): Promise<Offer> {
  const offer: Offer = {
    id: Date.now().toString(),
    title,
    description,
    imageUrl,
    buttonText,
    buttonLink,
    buttonColor: buttonColor || '#9333ea',
    backgroundColor: backgroundColor || '#ffffff',
    textColor: textColor || '#1f2937',
    badgeColor: badgeColor || '#9333ea',
    badgeText: badgeText || "TODAY'S OFFER",
    termsText,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await saveOffer(offer)
  return offer
}

export async function updateOffer(updates: Partial<Offer>): Promise<boolean> {
  // Use getOfferForAdmin instead to get offer regardless of active status
  const currentOffer = await getOfferForAdmin()
  
  if (!currentOffer) {
    return false
  }

  const updatedOffer: Offer = {
    ...currentOffer,
    ...updates,
    updatedAt: new Date().toISOString(),
  }

  return await saveOffer(updatedOffer)
}

export async function deactivateOffer(): Promise<boolean> {
  return await updateOffer({ isActive: false })
}
