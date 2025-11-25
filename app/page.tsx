'use client'

import Hero from '@/components/sections/Hero'
import Services from '@/components/sections/Services'
import WhyChooseUs from '@/components/sections/WhyChooseUs'
import TrackRecord from '@/components/sections/TrackRecord'
import MobileRepairPricing from '@/components/sections/MobileRepairPricing'
import CallToAction from '@/components/sections/CallToAction'
import Contact from '@/components/sections/Contact'
import PWAInstallBanner from '@/components/PWAInstallBanner'
import LoadingOverlay from '@/components/LoadingOverlay'
import { useScrollAnimations } from '@/hooks/useScrollAnimations'
import { usePageLoader } from '@/hooks/usePageLoader'

export default function Home() {
  const { isLoading, progress } = usePageLoader({
    minLoadTime: 2000
  })
  
  // Initialize scroll animations
  useScrollAnimations()

  if (isLoading) {
    return <LoadingOverlay progress={progress} variant="modern" />
  }

  return (
    <>
      <Hero />
      <Services />
      <WhyChooseUs />
      <TrackRecord />
      <MobileRepairPricing />
      <CallToAction />
      <Contact />
      <PWAInstallBanner />
    </>
  )
}
