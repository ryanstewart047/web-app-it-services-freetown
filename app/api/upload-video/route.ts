import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('video') as File
    
    if (!file) {
      return NextResponse.json(
        { error: 'No video file provided' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('video/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Must be a video file.' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB for Vercel compatibility)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create unique filename
    const timestamp = Date.now()
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}-${originalName}`
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), 'public', 'uploads', 'videos')
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Save file
    const filepath = join(uploadsDir, filename)
    await writeFile(filepath, buffer)
    
    // Return public URL
    const videoUrl = `/uploads/videos/${filename}`
    
    console.log('✅ Video uploaded successfully:', videoUrl)
    
    return NextResponse.json({ 
      videoUrl,
      message: 'Video uploaded successfully' 
    })
    
  } catch (error) {
    console.error('Error uploading video:', error)
    return NextResponse.json(
      { error: 'Failed to upload video', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
