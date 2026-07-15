export interface SEOService {
  slug: string
  title: string
  metaDescription: string
  heroTitle: string
  heroSubtitle: string
  deviceType: 'Phone' | 'Laptop' | 'Tablet'
  brand?: string
  problem: string
  estimatedPriceRange: string
  estimatedTime: string
  realAdvice: string[]
  faqs: { question: string; answer: string }[]
  beforeAfterCaseId?: string
}

export const seoServices: SEOService[] = [
  {
    slug: 'iphone-screen-replacement-freetown',
    title: 'iPhone Screen Replacement in Freetown | Fast & Reliable',
    metaDescription: 'Get fast, reliable iPhone screen replacement in Freetown, Sierra Leone. Original parts, 1-month warranty, and same-day service. Book an appointment today!',
    heroTitle: 'Expert iPhone Screen Replacement in Freetown',
    heroSubtitle: 'Smashed your iPhone screen? We fix broken glass and LCDs fast using high-quality parts with a 1-month warranty.',
    deviceType: 'Phone',
    brand: 'Apple',
    problem: 'Screen Replacement',
    estimatedPriceRange: 'Le 400,000 - Le 1,800,000',
    estimatedTime: '1 - 3 Hours',
    realAdvice: [
      'Stop using the phone if the glass is actively shattering to prevent glass splinters.',
      'Freetown humidity can quickly enter a cracked screen and damage the motherboard. Tape over the crack temporarily if you cannot fix it today.',
      'We test Face ID and True Tone sensors before and after repair to ensure all functions remain intact.'
    ],
    faqs: [
      {
        question: 'Will I lose my data during a screen repair?',
        answer: 'No, a screen replacement only involves the external display components. Your photos, contacts, and apps are perfectly safe.'
      },
      {
        question: 'Do you use original Apple screens?',
        answer: 'We offer both high-quality OEM screens (best value) and original pulled screens depending on your budget and preference.'
      },
      {
        question: 'What if the screen stops working after a week?',
        answer: 'We provide a 1-month warranty covering any touch issues or display defects (not covering accidental drops).'
      }
    ]
  },
  {
    slug: 'tecno-charging-port-repair-freetown',
    title: 'Tecno Charging Port Repair in Freetown | IT Services',
    metaDescription: 'Is your Tecno phone not charging? We offer fast charging port repair in Freetown. Avoid further damage and get it fixed today.',
    heroTitle: 'Fast Tecno Charging Port Repair in Freetown',
    heroSubtitle: 'Phone not charging? Cable feeling loose? We replace damaged charging ports for all Tecno models quickly and affordably.',
    deviceType: 'Phone',
    brand: 'Tecno',
    problem: 'Charging Port',
    estimatedPriceRange: 'Le 75,000 - Le 150,000',
    estimatedTime: '1 - 2 Hours',
    realAdvice: [
      'Do not use needles or pins to clean out the charging port yourself, as this can permanently damage the pins inside.',
      'Freetown dust is the #1 cause of Tecno charging failures. We often find packed dust preventing the cable from connecting fully.',
      'If your phone only charges at a specific angle, the port is severely loose and needs immediate replacement to avoid short-circuiting the motherboard.'
    ],
    faqs: [
      {
        question: 'How do I know if it\'s the port or the battery?',
        answer: 'If the cable feels loose or only works at an angle, it\'s the port. If it plugs in fine but dies quickly, it\'s likely the battery. We run a free diagnostic to be sure.'
      },
      {
        question: 'Can you fix the fast charging feature?',
        answer: 'Yes! When we replace the charging sub-board with an OEM part, your Tecno fast charging (Flash Charge) will work exactly as it did before.'
      }
    ]
  },
  {
    slug: 'laptop-not-turning-on-freetown',
    title: 'Laptop Not Turning On Repair in Freetown | Sierra Leone',
    metaDescription: 'Laptop won\'t turn on? From power surges to motherboard issues, IT Services Freetown diagnoses and fixes dead laptops fast.',
    heroTitle: 'Laptop Not Turning On? We Fix Dead Laptops in Freetown',
    heroSubtitle: 'Don\'t panic. Whether it was a power surge or a sudden shutdown, our experts can diagnose and repair your dead laptop.',
    deviceType: 'Laptop',
    problem: 'Power/Motherboard',
    estimatedPriceRange: 'Le 200,000 - Le 1,500,000 (Diagnostics starting at Le 100,000)',
    estimatedTime: '1 - 3 Days',
    realAdvice: [
      'Power surges from the EDSA grid or unstable generators are the most common cause of dead laptops in Sierra Leone. We strongly recommend using a surge protector.',
      'If the laptop has a removable battery, try taking it out, holding the power button for 30 seconds, plugging it in without the battery, and turning it on.',
      'Do not keep trying to turn it on if it smells like burnt plastic. Bring it in immediately.'
    ],
    faqs: [
      {
        question: 'Will I lose my files if the laptop is dead?',
        answer: 'Usually not! The hard drive (where data is stored) is separate from the power circuitry. Even if the motherboard is completely fried, we can usually extract your data.'
      },
      {
        question: 'How much does it cost to fix a dead laptop?',
        answer: 'It depends on the cause. A blown capacitor is a cheap fix, while a completely burnt motherboard CPU may require a board replacement. We diagnose first and quote you before proceeding.'
      }
    ]
  },
  {
    slug: 'samsung-battery-replacement-freetown',
    title: 'Samsung Battery Replacement in Freetown | Original Parts',
    metaDescription: 'Is your Samsung phone dying fast or shutting down? Get a high-quality battery replacement in Freetown with IT Services.',
    heroTitle: 'Professional Samsung Battery Replacement',
    heroSubtitle: 'Restore your Samsung Galaxy to all-day battery life with our guaranteed battery replacement service in Freetown.',
    deviceType: 'Phone',
    brand: 'Samsung',
    problem: 'Battery Replacement',
    estimatedPriceRange: 'Le 150,000 - Le 400,000',
    estimatedTime: '1 - 2 Hours',
    realAdvice: [
      'If the back glass of your Samsung is lifting or bulging, your battery is swollen. This is a severe fire hazard and must be replaced immediately.',
      'Freetown\'s extreme heat degrades lithium batteries faster. Avoid leaving your phone in direct sunlight or charging it under a pillow.',
      'We use high-quality cells that support Samsung\'s original Fast Charging technology.'
    ],
    faqs: [
      {
        question: 'Will a new battery make my phone waterproof again?',
        answer: 'We re-apply specialized adhesive when sealing the phone, which restores water resistance, but we advise against submerging repaired phones as a precaution.'
      },
      {
        question: 'How long does a new battery last?',
        answer: 'A high-quality replacement battery should give you 1.5 to 2 years of solid performance, depending on your charging habits and usage.'
      }
    ]
  },
  {
    slug: 'data-recovery-freetown',
    title: 'Data Recovery Services in Freetown | Retrieve Lost Files',
    metaDescription: 'Lost photos or documents? IT Services Freetown provides expert data recovery for dead phones, external hard drives, and laptops.',
    heroTitle: 'Expert Data Recovery Services in Freetown',
    heroSubtitle: 'Accidentally deleted files, formatted a drive, or have a completely dead device? We can help get your memories and documents back.',
    deviceType: 'Laptop',
    problem: 'Data Recovery',
    estimatedPriceRange: 'Le 300,000 - Le 1,500,000 (Based on complexity)',
    estimatedTime: '1 - 5 Days',
    realAdvice: [
      'If you accidentally deleted files or formatted a drive, STOP USING IT IMMEDIATELY. Continuing to use the device overwrites the hidden files, making recovery impossible.',
      'We can recover data from water-damaged phones even if the screen doesn\'t turn on by accessing the motherboard directly.',
      'Always keep a backup of important files on a secondary drive or cloud service (Google Drive) as a precaution against hardware failure.'
    ],
    faqs: [
      {
        question: 'Can you recover data from a dead phone?',
        answer: 'Yes. As long as the internal memory chip is not physically cracked, we can often repair the power circuitry just enough to extract the data.'
      },
      {
        question: 'Do I have to pay if you cannot recover my data?',
        answer: 'No. We operate on a "No Data, No Fee" basis. If we cannot retrieve your important files, you only pay the baseline diagnostic fee.'
      }
    ]
  }
]
