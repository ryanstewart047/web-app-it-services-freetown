import { randomUUID } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { sanitizeText } from '@/lib/admin-guard'
import { requireShirleyGalleryAdmin } from '@/lib/shirley-gallery-auth'
import {
  getShirleyGalleryItems,
  saveShirleyGalleryItems,
  ShirleyGalleryItem,
  ShirleyGalleryMediaType,
  uploadShirleyGalleryMedia,
} from '@/lib/shirley-gallery-storage'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const MAX_IMAGE_BYTES = 8 * 1024 * 1024
const MAX_VIDEO_BYTES = 40 * 1024 * 1024

function sanitizeUrl(input: unknown) {
  const value = sanitizeText(input).slice(0, 2000)

  if (!value) return ''

  try {
    const url = new URL(value)
    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return url.toString()
    }
  } catch {
    if (value.startsWith('/') && !value.startsWith('//')) {
      return value
    }
  }

  return ''
}

function inferTypeFromFile(file: File): ShirleyGalleryMediaType | null {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('video/')) return 'video'
  return null
}

function maxBytesForType(type: ShirleyGalleryMediaType) {
  return type === 'video' ? MAX_VIDEO_BYTES : MAX_IMAGE_BYTES
}

export async function GET(request: NextRequest) {
  const authError = requireShirleyGalleryAdmin(request)
  if (authError) return authError

  try {
    const items = await getShirleyGalleryItems({ includeInactive: true })
    return NextResponse.json({ success: true, items })
  } catch (error) {
    console.error('[Shirley Gallery Admin API] Fetch error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load gallery items.' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const authError = requireShirleyGalleryAdmin(request)
  if (authError) return authError

  try {
    const formData = await request.formData()
    const title = sanitizeText(formData.get('title')).slice(0, 120)
    const caption = sanitizeText(formData.get('caption')).slice(0, 500)
    const selectedType: ShirleyGalleryMediaType = formData.get('type') === 'video' ? 'video' : 'image'
    const active = formData.get('active') !== 'false'
    const isAvailableProduct = formData.get('isAvailableProduct') === 'true'
    const price = sanitizeText(formData.get('price')).slice(0, 50)
    const orderButtonText = sanitizeText(formData.get('orderButtonText')).slice(0, 50)
    const orderUrl = sanitizeUrl(formData.get('orderUrl'))
    const fileEntry = formData.get('file')
    const mediaUrl = sanitizeUrl(formData.get('mediaUrl'))

    if (!title) {
      return NextResponse.json({ success: false, error: 'Title is required.' }, { status: 400 })
    }

    let type = selectedType
    let url = mediaUrl
    let source: ShirleyGalleryItem['source'] = mediaUrl ? 'url' : 'upload'
    let fileName: string | undefined

    if (fileEntry instanceof File && fileEntry.size > 0) {
      const inferredType = inferTypeFromFile(fileEntry)

      if (!inferredType) {
        return NextResponse.json(
          { success: false, error: 'Please upload an image or video file.' },
          { status: 400 }
        )
      }

      if (fileEntry.size > maxBytesForType(inferredType)) {
        return NextResponse.json(
          {
            success: false,
            error:
              inferredType === 'video'
                ? 'Video files must be 40MB or smaller. For large videos, paste a video link instead.'
                : 'Image files must be 8MB or smaller.',
          },
          { status: 413 }
        )
      }

      type = inferredType
      source = 'upload'
      const buffer = Buffer.from(await fileEntry.arrayBuffer())
      const base64Content = `data:${fileEntry.type};base64,${buffer.toString('base64')}`
      const upload = await uploadShirleyGalleryMedia(base64Content, fileEntry.name)
      url = upload.url
      fileName = upload.fileName
    }

    if (!url) {
      return NextResponse.json(
        { success: false, error: 'Upload a file or paste a valid media URL.' },
        { status: 400 }
      )
    }

    const items = await getShirleyGalleryItems({ includeInactive: true })
    const nextOrder = items.reduce((highest, item) => Math.max(highest, item.order), -1) + 1
    const now = new Date().toISOString()
    const item: ShirleyGalleryItem = {
      id: randomUUID(),
      title,
      caption,
      type,
      url,
      source,
      active,
      order: nextOrder,
      isAvailableProduct,
      price,
      orderButtonText,
      orderUrl,
      fileName,
      createdAt: now,
      updatedAt: now,
    }

    await saveShirleyGalleryItems([...items, item])
    return NextResponse.json({ success: true, item }, { status: 201 })
  } catch (error) {
    console.error('[Shirley Gallery Admin API] Create error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save gallery item.',
      },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  const authError = requireShirleyGalleryAdmin(request)
  if (authError) return authError

  try {
    let body: any = {}
    let fileEntry: File | null = null

    const contentType = request.headers.get('content-type') || ''
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData()
      body = {
        id: formData.get('id'),
        title: formData.get('title'),
        caption: formData.get('caption'),
        type: formData.get('type'),
        active: formData.get('active') !== null ? formData.get('active') === 'true' : undefined,
        isAvailableProduct: formData.get('isAvailableProduct') !== null ? formData.get('isAvailableProduct') === 'true' : undefined,
        price: formData.get('price'),
        orderButtonText: formData.get('orderButtonText'),
        orderUrl: formData.get('orderUrl'),
        order: formData.get('order') !== null ? Number(formData.get('order')) : undefined,
        mediaUrl: formData.get('mediaUrl'),
      }
      const rawFile = formData.get('file')
      if (rawFile instanceof File && rawFile.size > 0) {
        fileEntry = rawFile
      }
    } else {
      body = await request.json()
    }

    const id = sanitizeText(body.id)

    if (!id) {
      return NextResponse.json({ success: false, error: 'Gallery item ID is required.' }, { status: 400 })
    }

    const items = await getShirleyGalleryItems({ includeInactive: true })
    let existingItem = items.find((item) => item.id === id)

    if (!existingItem) {
      return NextResponse.json({ success: false, error: 'Gallery item not found.' }, { status: 404 })
    }

    let url = existingItem.url
    let type = existingItem.type
    let source = existingItem.source
    let fileName = existingItem.fileName

    if (fileEntry) {
      const inferredType = inferTypeFromFile(fileEntry)
      if (!inferredType) {
        return NextResponse.json({ success: false, error: 'Invalid file type.' }, { status: 400 })
      }
      if (fileEntry.size > maxBytesForType(inferredType)) {
        return NextResponse.json({ success: false, error: 'File size exceeds maximum limit.' }, { status: 413 })
      }
      type = inferredType
      source = 'upload'
      const buffer = Buffer.from(await fileEntry.arrayBuffer())
      const base64Content = `data:${fileEntry.type};base64,${buffer.toString('base64')}`
      const upload = await uploadShirleyGalleryMedia(base64Content, fileEntry.name)
      url = upload.url
      fileName = upload.fileName
    } else if (body.mediaUrl) {
      const sanitizedMediaUrl = sanitizeUrl(body.mediaUrl)
      if (sanitizedMediaUrl) {
        url = sanitizedMediaUrl
        source = 'url'
      }
    }

    const now = new Date().toISOString()
    const updatedItems = items.map((item) => {
      if (item.id !== id) return item

      return {
        ...item,
        title: body.title !== undefined ? sanitizeText(body.title).slice(0, 120) : item.title,
        caption: body.caption !== undefined ? sanitizeText(body.caption).slice(0, 500) : item.caption,
        type: body.type === 'video' || body.type === 'image' ? body.type : type,
        url,
        source,
        fileName,
        active: typeof body.active === 'boolean' ? body.active : item.active,
        isAvailableProduct: typeof body.isAvailableProduct === 'boolean' ? body.isAvailableProduct : item.isAvailableProduct,
        price: body.price !== undefined ? sanitizeText(body.price).slice(0, 50) : item.price,
        orderButtonText: body.orderButtonText !== undefined ? sanitizeText(body.orderButtonText).slice(0, 50) : item.orderButtonText,
        orderUrl: body.orderUrl !== undefined ? sanitizeUrl(body.orderUrl) : item.orderUrl,
        order: Number.isFinite(body.order) ? Number(body.order) : item.order,
        updatedAt: now,
      }
    })

    await saveShirleyGalleryItems(updatedItems)
    return NextResponse.json({ success: true, items: updatedItems })
  } catch (error) {
    console.error('[Shirley Gallery Admin API] Update error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update gallery item.',
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const authError = requireShirleyGalleryAdmin(request)
  if (authError) return authError

  try {
    const id = sanitizeText(new URL(request.url).searchParams.get('id'))

    if (!id) {
      return NextResponse.json({ success: false, error: 'Gallery item ID is required.' }, { status: 400 })
    }

    const items = await getShirleyGalleryItems({ includeInactive: true })
    const nextItems = items.filter((item) => item.id !== id)

    if (nextItems.length === items.length) {
      return NextResponse.json({ success: false, error: 'Gallery item not found.' }, { status: 404 })
    }

    await saveShirleyGalleryItems(nextItems)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Shirley Gallery Admin API] Delete error:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete gallery item.',
      },
      { status: 500 }
    )
  }
}
