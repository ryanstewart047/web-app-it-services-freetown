'use client'

import React, { useState, useRef } from 'react'
import { Play, Volume2, Video as VideoIcon } from 'lucide-react'
import { BlogPost, getPrimaryImage, getPrimaryVideo } from '../../app/blog/blog-utils'

interface NewsMediaCardProps {
  post: Partial<BlogPost>
  className?: string
  aspectRatio?: 'video' | 'square' | 'hero' | 'small'
  showBadge?: boolean
  altTitle?: string
}

export default function NewsMediaCard({
  post,
  className = '',
  aspectRatio = 'video',
  showBadge = true,
  altTitle,
}: NewsMediaCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [videoError, setVideoError] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const imageUrl = getPrimaryImage(post) || '/images/laptop-repair.jpg'
  const videoUrl = getPrimaryVideo(post)

  const handleMouseEnter = () => {
    setIsHovered(true)
    if (videoUrl && videoRef.current && !videoError) {
      videoRef.current.currentTime = 0
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setVideoError(true))
    }
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
    if (videoRef.current) {
      videoRef.current.pause()
      setIsPlaying(false)
    }
  }

  const aspectClasses = {
    hero: 'h-72 sm:h-96 md:h-[450px]',
    video: 'h-48 sm:h-64',
    square: 'h-44 sm:h-52',
    small: 'h-24 sm:h-28',
  }[aspectRatio]

  return (
    <div
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative overflow-hidden bg-slate-950 group select-none ${aspectClasses} ${className}`}
    >
      {/* Primary Image Poster */}
      <img
        src={imageUrl}
        alt={altTitle || post.title || 'News media'}
        className={`w-full h-full object-cover transition-transform duration-700 ease-out ${
          isHovered ? 'scale-105 filter brightness-95' : 'scale-100'
        }`}
        onError={(e) => {
          ;(e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1597733336794-12d05021d510?auto=format&fit=crop&w=1000&q=80'
        }}
      />

      {/* Hover Auto-Play Video Overlay */}
      {videoUrl && !videoError && (
        <video
          ref={videoRef}
          src={videoUrl}
          muted
          loop
          playsInline
          preload="metadata"
          onCanPlay={() => setVideoError(false)}
          onError={() => setVideoError(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out pointer-events-none ${
            isHovered && isPlaying ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}

      {/* Video Hover Indicator Badge */}
      {videoUrl && !videoError && (
        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-red-600/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-sm shadow-lg">
          <span className="relative flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75 ${isHovered ? 'block' : 'hidden'}`}></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <VideoIcon className="w-3 h-3" />
          <span>{isHovered && isPlaying ? 'PLAYING PREVIEW' : 'CNN VIDEO'}</span>
        </div>
      )}

      {/* CNN Play Overlay Button */}
      {videoUrl && !videoError && !isPlaying && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/25 group-hover:bg-black/10 transition-colors pointer-events-none">
          <div className="w-12 h-12 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-2xl transform group-hover:scale-110 transition-all duration-300 ring-4 ring-white/30">
            <Play className="w-5 h-5 fill-white ml-0.5" />
          </div>
        </div>
      )}

      {/* Playing Audio/Mute Badge Indicator */}
      {isHovered && isPlaying && (
        <div className="absolute bottom-3 right-3 z-10 bg-black/75 backdrop-blur-md text-white text-[10px] px-2 py-1 rounded flex items-center gap-1.5 pointer-events-none">
          <Volume2 className="w-3.5 h-3.5 text-red-400" />
          <span className="font-mono text-[9px] uppercase">Hover Autoplay</span>
        </div>
      )}

      {/* Gradient Overlay for Readable Text */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none opacity-80 group-hover:opacity-60 transition-opacity" />
    </div>
  )
}
