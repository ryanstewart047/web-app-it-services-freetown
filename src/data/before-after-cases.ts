export interface BeforeAfterCase {
  id: string
  title: string
  device: string
  issue: string
  description: string
  beforeImage: string
  afterImage: string
  cost?: string
  turnaround?: string
}

export const beforeAfterCases: BeforeAfterCase[] = [
  {
    id: 'iphone-13-pro-screen',
    title: 'Smashed iPhone 13 Pro Screen Replacement',
    device: 'iPhone 13 Pro',
    issue: 'Severe Glass Damage & Dead Pixels',
    description: 'This iPhone 13 Pro was dropped on rocky ground, shattering the screen and causing dead pixels. We replaced it with an OEM OLED screen, restoring True Tone and Face ID functionality within 2 hours.',
    beforeImage: '/assets/images/before-after/iphone-screen-before.jpg', // Placeholder, user to update
    afterImage: '/assets/images/before-after/iphone-screen-after.jpg',
    cost: 'Le 1,500,000',
    turnaround: '2 Hours'
  },
  {
    id: 'hp-laptop-hinge',
    title: 'Broken HP Laptop Hinge Repair',
    device: 'HP Pavilion 15',
    issue: 'Broken Hinge & Case Separation',
    description: 'The left hinge completely snapped, lifting the plastic casing and exposing the screen cable. We repaired the mounting points and replaced the hinge, saving the customer from buying a whole new laptop body.',
    beforeImage: '/assets/images/before-after/laptop-hinge-before.jpg',
    afterImage: '/assets/images/before-after/laptop-hinge-after.jpg',
    cost: 'Le 400,000',
    turnaround: '1 Day'
  },
  {
    id: 'samsung-swollen-battery',
    title: 'Dangerous Swollen Samsung Battery',
    device: 'Samsung Galaxy S21',
    issue: 'Swollen Battery Lifting Back Glass',
    description: 'The customer noticed their phone case no longer fit because the battery had swollen so much it pushed the back glass off. We safely removed the hazard and installed a new original battery, resealing the device properly.',
    beforeImage: '/assets/images/before-after/samsung-battery-before.jpg',
    afterImage: '/assets/images/before-after/samsung-battery-after.jpg',
    cost: 'Le 350,000',
    turnaround: '1.5 Hours'
  },
  {
    id: 'tecno-charging-port',
    title: 'Burnt Tecno Charging Port',
    device: 'Tecno Spark 10',
    issue: 'Burnt Port due to Bad Cable',
    description: 'Using a cheap market cable caused this Tecno charging port to short circuit and melt slightly. We replaced the entire sub-board to guarantee fast charging speeds were restored safely.',
    beforeImage: '/assets/images/before-after/tecno-port-before.jpg',
    afterImage: '/assets/images/before-after/tecno-port-after.jpg',
    cost: 'Le 120,000',
    turnaround: '1 Hour'
  }
]
