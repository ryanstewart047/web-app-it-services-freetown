import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Book Appointment - Schedule Your Device Repair',
  description: 'Book a repair appointment with IT Services Freetown. Schedule same-day computer repair, mobile phone repair, iPhone screen replacement, iCloud removal, and more. Fast, reliable service in Freetown, Sierra Leone.',
  alternates: {
    canonical: 'https://www.itservicesfreetown.com/book-appointment',
  },
  keywords: [
    'book repair appointment Freetown',
    'schedule device repair',
    'computer repair booking',
    'mobile repair appointment',
    'same day repair Freetown',
    'iPhone repair booking Sierra Leone',
  ],
  openGraph: {
    title: 'Book Appointment - IT Services Freetown',
    description: 'Schedule your device repair online. Same-day service available for computer and mobile repairs in Freetown.',
    url: 'https://itservicesfreetown.com/book-appointment',
    type: 'website',
  },
}

export default function BookAppointmentLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
