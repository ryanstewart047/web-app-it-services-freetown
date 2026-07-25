const GITHUB_TOKEN =
  process.env.SHIRLEY_GALLERY_GITHUB_TOKEN ||
  process.env.ITS_GITHUB_TOKEN ||
  process.env.NEXT_PUBLIC_GITHUB_TOKEN ||
  process.env.GITHUB_TOKEN ||
  ''
const GITHUB_OWNER = process.env.SHIRLEY_GALLERY_GITHUB_OWNER || 'ryanstewart047'
const GITHUB_REPO = process.env.SHIRLEY_GALLERY_GITHUB_REPO || 'web-app-it-services-freetown'
const GITHUB_BRANCH = process.env.SHIRLEY_GALLERY_GITHUB_BRANCH || 'main'
const GITHUB_GIST_ID =
  process.env.SHIRLEY_GALLERY_GIST_ID ||
  process.env.GITHUB_GIST_ID ||
  '741d3c2e3203df10a318d3dae1a94c66'
const GALLERY_FILENAME = 'shirleys-gallery.json'

export type ShirleyGalleryMediaType = 'image' | 'video'

export interface ShirleyGalleryItem {
  id: string
  title: string
  caption?: string
  type: ShirleyGalleryMediaType
  url: string
  source: 'upload' | 'url'
  active: boolean
  order: number
  fileName?: string
  createdAt: string
  updatedAt: string
}

interface ShirleyGalleryFile {
  items: ShirleyGalleryItem[]
  updatedAt?: string
}

function githubHeaders(includeAuth = true): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  }

  if (includeAuth && GITHUB_TOKEN) {
    headers.Authorization = `token ${GITHUB_TOKEN}`
  }

  return headers
}

function sortGalleryItems(items: ShirleyGalleryItem[]) {
  return [...items].sort((a, b) => {
    if (a.order !== b.order) return a.order - b.order
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })
}

function normalizeGalleryPayload(payload: unknown): ShirleyGalleryItem[] {
  const rawItems = Array.isArray(payload)
    ? payload
    : payload && typeof payload === 'object' && Array.isArray((payload as ShirleyGalleryFile).items)
      ? (payload as ShirleyGalleryFile).items
      : []

  return sortGalleryItems(
    rawItems
      .filter((item): item is ShirleyGalleryItem => {
        if (!item || typeof item !== 'object') return false
        const candidate = item as Partial<ShirleyGalleryItem>
        return Boolean(candidate.id && candidate.title && candidate.url && candidate.type)
      })
      .map((item, index) => ({
        ...item,
        caption: item.caption || '',
        type: item.type === 'video' ? 'video' : 'image',
        source: item.source === 'upload' ? 'upload' : 'url',
        active: item.active !== false,
        order: Number.isFinite(item.order) ? item.order : index,
      }))
  )
}

export async function getShirleyGalleryItems(options: { includeInactive?: boolean } = {}) {
  try {
    if (!GITHUB_GIST_ID) {
      console.error('[Shirley Gallery] Missing Gist ID')
      return []
    }

    const response = await fetch(`https://api.github.com/gists/${GITHUB_GIST_ID}`, {
      headers: githubHeaders(Boolean(GITHUB_TOKEN)),
      cache: 'no-store',
    })

    if (!response.ok) {
      console.error('[Shirley Gallery] Failed to fetch Gist:', response.status, await response.text())
      return []
    }

    const gist = await response.json()
    const galleryFile = gist.files?.[GALLERY_FILENAME]

    if (!galleryFile?.content) {
      return []
    }

    const items = normalizeGalleryPayload(JSON.parse(galleryFile.content))
    return options.includeInactive ? items : items.filter((item) => item.active)
  } catch (error) {
    console.error('[Shirley Gallery] Error fetching gallery:', error)
    return []
  }
}

export async function getPublicShirleyGalleryItems() {
  return getShirleyGalleryItems({ includeInactive: false })
}

export async function saveShirleyGalleryItems(items: ShirleyGalleryItem[]) {
  if (!GITHUB_TOKEN) {
    throw new Error('GitHub token is not configured for Shirley gallery storage.')
  }

  if (!GITHUB_GIST_ID) {
    throw new Error('GitHub Gist ID is not configured for Shirley gallery storage.')
  }

  const payload: ShirleyGalleryFile = {
    items: sortGalleryItems(items),
    updatedAt: new Date().toISOString(),
  }

  const response = await fetch(`https://api.github.com/gists/${GITHUB_GIST_ID}`, {
    method: 'PATCH',
    headers: {
      ...githubHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      files: {
        [GALLERY_FILENAME]: {
          content: JSON.stringify(payload, null, 2),
        },
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`GitHub Gist rejected gallery save: ${response.status} ${await response.text()}`)
  }
}

function sanitizeFileName(fileName: string) {
  const cleanName = fileName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return cleanName || 'shirley-gallery-media'
}

export async function uploadShirleyGalleryMedia(base64Content: string, fileName: string) {
  if (!GITHUB_TOKEN) {
    throw new Error('GitHub token is not configured for Shirley gallery uploads.')
  }

  const cleanBase64 = base64Content.includes(',')
    ? base64Content.split(',').pop() || ''
    : base64Content
  const uniqueFileName = `${Date.now()}-${sanitizeFileName(fileName)}`
  const path = `public/shirleys-gallery/${uniqueFileName}`

  const response = await fetch(
    `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`,
    {
      method: 'PUT',
      headers: {
        ...githubHeaders(),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Upload Shirley gallery media: ${uniqueFileName}`,
        content: cleanBase64,
        branch: GITHUB_BRANCH,
      }),
    }
  )

  if (!response.ok) {
    throw new Error(`GitHub rejected gallery upload: ${response.status} ${await response.text()}`)
  }

  return {
    fileName: uniqueFileName,
    url: `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${path}`,
  }
}
