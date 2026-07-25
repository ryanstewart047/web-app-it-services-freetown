import fs from 'fs'
import path from 'path'

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
  ''
const DUMMY_GIST_ID = '741d3c2e3203df10a318d3dae1a94c66'
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
  isAvailableProduct?: boolean
  price?: string
  orderButtonText?: string
  orderUrl?: string
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
        isAvailableProduct: Boolean(item.isAvailableProduct),
        price: item.price || '',
        orderButtonText: item.orderButtonText || '',
        orderUrl: item.orderUrl || '',
      }))
  )
}

function getLocalDataFilePath(): string {
  return path.join(process.cwd(), 'data', 'shirleys-gallery.json')
}

function getLocalPublicFilePath(): string {
  return path.join(process.cwd(), 'public', 'shirleys-gallery', 'gallery.json')
}

export async function getShirleyGalleryItems(options: { includeInactive?: boolean } = {}) {
  let items: ShirleyGalleryItem[] = []

  // 1. Try local disk first
  try {
    const dataPath = getLocalDataFilePath()
    const publicPath = getLocalPublicFilePath()
    let raw = ''

    if (fs.existsSync(dataPath)) {
      raw = fs.readFileSync(dataPath, 'utf8')
    } else if (fs.existsSync(publicPath)) {
      raw = fs.readFileSync(publicPath, 'utf8')
    }

    if (raw.trim()) {
      items = normalizeGalleryPayload(JSON.parse(raw))
    }
  } catch (error) {
    console.warn('[Shirley Gallery] Local FS read warning:', error)
  }

  // 2. Fallback to GitHub repository raw content if local file was empty
  if (items.length === 0 && GITHUB_TOKEN) {
    try {
      const rawUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/data/shirleys-gallery.json`
      const response = await fetch(rawUrl, {
        headers: githubHeaders(false),
        cache: 'no-store',
      })

      if (response.ok) {
        const content = await response.text()
        if (content.trim()) {
          items = normalizeGalleryPayload(JSON.parse(content))
        }
      }
    } catch (error) {
      console.warn('[Shirley Gallery] GitHub raw fetch warning:', error)
    }
  }

  // 3. Fallback to Gist if valid GIST ID configured
  if (
    items.length === 0 &&
    GITHUB_GIST_ID &&
    GITHUB_GIST_ID !== DUMMY_GIST_ID
  ) {
    try {
      const response = await fetch(`https://api.github.com/gists/${GITHUB_GIST_ID}`, {
        headers: githubHeaders(Boolean(GITHUB_TOKEN)),
        cache: 'no-store',
      })

      if (response.ok) {
        const gist = await response.json()
        const galleryFile = gist.files?.[GALLERY_FILENAME]
        if (galleryFile?.content) {
          items = normalizeGalleryPayload(JSON.parse(galleryFile.content))
        }
      }
    } catch (error) {
      console.warn('[Shirley Gallery] Gist fetch warning:', error)
    }
  }

  return options.includeInactive ? items : items.filter((item) => item.active)
}

export async function getPublicShirleyGalleryItems() {
  return getShirleyGalleryItems({ includeInactive: false })
}

export async function saveShirleyGalleryItems(items: ShirleyGalleryItem[]) {
  const sortedItems = sortGalleryItems(items)
  const payload: ShirleyGalleryFile = {
    items: sortedItems,
    updatedAt: new Date().toISOString(),
  }
  const jsonString = JSON.stringify(payload, null, 2)

  // 1. Save to local file system (data/ directory & public/shirleys-gallery/)
  try {
    const dataPath = getLocalDataFilePath()
    const dataDir = path.dirname(dataPath)
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true })
    }
    fs.writeFileSync(dataPath, jsonString, 'utf8')

    const publicPath = getLocalPublicFilePath()
    const publicDir = path.dirname(publicPath)
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true })
    }
    fs.writeFileSync(publicPath, jsonString, 'utf8')
  } catch (fsError) {
    console.warn('[Shirley Gallery] Local FS write warning:', fsError)
  }

  // 2. Save to GitHub repository if GITHUB_TOKEN is available
  if (GITHUB_TOKEN) {
    try {
      const repoFilePath = 'data/shirleys-gallery.json'
      const checkRes = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${repoFilePath}?ref=${GITHUB_BRANCH}`,
        { headers: githubHeaders() }
      )

      let sha: string | undefined
      if (checkRes.ok) {
        const fileData = await checkRes.json()
        sha = fileData.sha
      }

      await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${repoFilePath}`,
        {
          method: 'PUT',
          headers: {
            ...githubHeaders(),
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: 'Update Shirley gallery items',
            content: Buffer.from(jsonString).toString('base64'),
            branch: GITHUB_BRANCH,
            ...(sha ? { sha } : {}),
          }),
        }
      )
    } catch (ghError) {
      console.warn('[Shirley Gallery] GitHub Repo save warning:', ghError)
    }
  }

  // 3. Optional update to GitHub Gist (only if explicitly set & not dummy)
  if (GITHUB_GIST_ID && GITHUB_GIST_ID !== DUMMY_GIST_ID && GITHUB_TOKEN) {
    try {
      const response = await fetch(`https://api.github.com/gists/${GITHUB_GIST_ID}`, {
        method: 'PATCH',
        headers: {
          ...githubHeaders(),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          files: {
            [GALLERY_FILENAME]: {
              content: jsonString,
            },
          },
        }),
      })

      if (!response.ok) {
        console.warn('[Shirley Gallery] Gist update notice:', response.status, await response.text())
      }
    } catch (gistError) {
      console.warn('[Shirley Gallery] Gist update warning:', gistError)
    }
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
  const cleanBase64 = base64Content.includes(',')
    ? base64Content.split(',').pop() || ''
    : base64Content
  const uniqueFileName = `${Date.now()}-${sanitizeFileName(fileName)}`
  const relativeUrl = `/shirleys-gallery/${uniqueFileName}`

  // 1. Save to local disk in public/shirleys-gallery/
  try {
    const mediaDir = path.join(process.cwd(), 'public', 'shirleys-gallery')
    if (!fs.existsSync(mediaDir)) {
      fs.mkdirSync(mediaDir, { recursive: true })
    }
    const filePath = path.join(mediaDir, uniqueFileName)
    const fileBuffer = Buffer.from(cleanBase64, 'base64')
    fs.writeFileSync(filePath, fileBuffer)
  } catch (fsError) {
    console.warn('[Shirley Gallery] Local media FS write warning:', fsError)
  }

  // 2. If GITHUB_TOKEN is configured, upload to GitHub Repo for remote persistence
  if (GITHUB_TOKEN) {
    try {
      const repoPath = `public/shirleys-gallery/${uniqueFileName}`
      const response = await fetch(
        `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${repoPath}`,
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

      if (response.ok) {
        const data = await response.json()
        return {
          fileName: uniqueFileName,
          url: data.content?.download_url || `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/${repoPath}`,
        }
      } else {
        console.warn('[Shirley Gallery] GitHub media upload notice:', response.status, await response.text())
      }
    } catch (ghError) {
      console.warn('[Shirley Gallery] GitHub media upload warning:', ghError)
    }
  }

  return {
    fileName: uniqueFileName,
    url: relativeUrl,
  }
}
