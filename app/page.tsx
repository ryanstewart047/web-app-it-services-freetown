'use client'

import Hero from '@/components/sections/Hero'
import Services from '@/components/sections/Services'
import WhyChooseUs from '@/components/sections/WhyChooseUs'
import WhyFreetown from '@/components/sections/WhyFreetown'
import CommonIssues from '@/components/sections/CommonIssues'
import TrackRecord from '@/components/sections/TrackRecord'
import MobileRepairPricing from '@/components/sections/MobileRepairPricing'
import CallToAction from '@/components/sections/CallToAction'
import Contact from '@/components/sections/Contact'
import PWAInstallBanner from '@/components/PWAInstallBanner'
import LoadingOverlay from '@/components/LoadingOverlay'
import { useScrollAnimations } from '@/hooks/useScrollAnimations'
import { usePageLoader } from '@/hooks/usePageLoader'

import { DisplayAd, MultiplexAd, SponsoredAdBlock } from '@/components/AdSense'

export default function Home() {
  const { isLoading, progress } = usePageLoader({
    minLoadTime: 2000
  })
  
  // Initialize scroll animations
  useScrollAnimations()

  return (
    <>
      <LoadingOverlay show={isLoading} progress={progress} variant="modern" />
      <Hero />
      <Services />
      
      <section className="mx-auto max-w-7xl px-4 py-8 sm:py-10">
        <SponsoredAdBlock
          eyebrow="Sponsored"
          title="Useful technology offers for device owners"
          description="Relevant promotions help support our free repair advice, diagnostics, and pricing guides while you browse."
        >
          <DisplayAd className="mx-auto max-w-5xl" />
        </SponsoredAdBlock>
      </section>

      <MobileRepairPricing />
      <WhyFreetown />
      <CommonIssues />
      <WhyChooseUs />
      <TrackRecord />

      <section className="mx-auto max-w-7xl px-4 py-12">
        <SponsoredAdBlock
          eyebrow="Partner offers"
          title="More tools, accessories, and device-care deals"
          description="You may see offers related to protection, storage, connectivity, or other products that fit the devices we service."
        >
          <MultiplexAd />
        </SponsoredAdBlock>
      </section>

      <CallToAction />
      <Contact />
      <PWAInstallBanner />
    </>
  )
}
