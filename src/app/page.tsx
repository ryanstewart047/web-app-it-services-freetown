import Image from 'next/image'
import Link from 'next/link'
import { 
  Smartphone, 
  Monitor, 
  Wrench, 
  Clock, 
  MessageSquare, 
  Brain,
  CheckCircle,
  Star
} from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary to-primary/80 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Professional IT Services in Freetown
            </h1>
            <p className="text-xl md:text-2xl mb-8 opacity-90">
              Expert computer and mobile repairs with real-time tracking and AI-powered support
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/book-appointment" className="btn-primary text-lg px-8 py-4">
                Book Repair Now
              </Link>
              <Link href="/track-repair" className="btn-secondary text-lg px-8 py-4">
                Track Your Repair
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We provide comprehensive IT repair services with cutting-edge technology and expert technicians
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <ServiceCard
              icon={<Monitor className="w-12 h-12 text-primary" />}
              title="Computer Repair"
              description="Desktop, laptop, and workstation repairs with genuine parts and warranty"
              features={["Hardware diagnostics", "Software troubleshooting", "Data recovery", "Performance optimization"]}
            />
            <ServiceCard
              icon={<Smartphone className="w-12 h-12 text-primary" />}
              title="Mobile Repair"
              description="Smartphone and tablet repairs for all major brands and models"
              features={["Screen replacement", "Battery service", "Water damage repair", "Software restoration"]}
            />
            <ServiceCard
              icon={<Wrench className="w-12 h-12 text-primary" />}
              title="Network Setup"
              description="Professional network installation and configuration services"
              features={["Wi-Fi setup", "Network security", "Cable installation", "System integration"]}
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose Us?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Advanced technology meets exceptional service for the best repair experience
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Clock className="w-8 h-8 text-primary" />}
              title="Real-Time Tracking"
              description="Monitor your repair status in real-time with detailed progress updates"
            />
            <FeatureCard
              icon={<MessageSquare className="w-8 h-8 text-primary" />}
              title="Live Chat Support"
              description="Instant communication with our technicians and support team"
            />
            <FeatureCard
              icon={<Brain className="w-8 h-8 text-primary" />}
              title="AI Troubleshooting"
              description="Get instant repair suggestions powered by artificial intelligence"
            />
            <FeatureCard
              icon={<CheckCircle className="w-8 h-8 text-primary" />}
              title="Quality Guarantee"
              description="All repairs come with warranty and satisfaction guarantee"
            />
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Get Your Device Fixed?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Book an appointment now and experience the future of IT repair services
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/book-appointment" className="btn-secondary text-lg px-8 py-4">
              Schedule Appointment
            </Link>
            <Link href="/troubleshoot" className="bg-white text-primary px-8 py-4 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200">
              Try AI Troubleshooting
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

function ServiceCard({ icon, title, description, features }: {
  icon: React.ReactNode
  title: string
  description: string
  features: string[]
}) {
  return (
    <div className="card hover:shadow-xl transition-shadow duration-300">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 mb-4">{description}</p>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center text-sm text-gray-700">
            <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>
    </div>
  )
}

function FeatureCard({ icon, title, description }: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="text-center">
      <div className="mb-4 flex justify-center">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-sm">{description}</p>
    </div>
  )
}
