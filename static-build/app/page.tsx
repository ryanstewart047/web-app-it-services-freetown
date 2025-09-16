'use client'

import { useState, useEffect } from 'react'
import Hero from '@/components/sections/Hero'
import Services from '@/components/sections/Services'
import WhyChooseUs from '@/components/sections/WhyChooseUs'
import TrackRecord from '@/components/sections/TrackRecord'
import CallToAction from '@/components/sections/CallToAction'
import Contact from '@/components/sections/Contact'
import PWAInstallBanner from '@/components/PWAInstallBanner'
import LoadingOverlay from '@/components/LoadingOverlay'
import { useScrollAnimations } from '@/hooks/useScrollAnimations'

export default function Home() {
  const [loading, setLoading] = useState(true)
  
  // Initialize scroll animations
  useScrollAnimations()

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (loading) {
    return <LoadingOverlay />
  }

  return (
    <>
      <Hero />
      <Services />
      <WhyChooseUs />
      <TrackRecord />
      <CallToAction />
      <Contact />
      <PWAInstallBanner />
    </>
  )
}
