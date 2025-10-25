// Offer storage using GitHub Gist
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN || process.env.GITHUB_TOKEN || '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'
const GITHUB_GIST_ID = process.env.OFFER_GIST_ID || process.env.GITHUB_GIST_ID || '5e3f8a2b1c4d9e6f7a8b9c0d1e2f3a4b'
const OFFER_FILENAME = 'current-offer.json'

export interface Offer {
  id: string
  title: string
  description: string
  imageUrl: string
  buttonText?: string
  buttonLink?: string
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

    return response.ok
  } catch (error) {
    console.error('Error saving offer:', error)
    return false
  }
}

export async function createOffer(title: string, description: string, imageUrl: string, buttonText?: string, buttonLink?: string): Promise<Offer> {
  const offer: Offer = {
    id: Date.now().toString(),
    title,
    description,
    imageUrl,
    buttonText,
    buttonLink,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await saveOffer(offer)
  return offer
}

export async function updateOffer(updates: Partial<Offer>): Promise<boolean> {
  const currentOffer = await getCurrentOffer()
  
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
