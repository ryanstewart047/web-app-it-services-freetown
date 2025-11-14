'use client'

import Link from 'next/link'

export default function Services() {
  const services = [
    {
      icon: 'fas fa-laptop',
      title: 'Computer Repair in Freetown',
      description: 'Expert laptop and desktop repair services for all major brands in Freetown, Sierra Leone',
      features: [
        'Hardware diagnostics',
        'Software troubleshooting', 
        'Virus removal',
        'Performance optimization'
      ],
      gradientColors: 'from-blue-900 to-blue-950',
      accentColor: 'blue',
      href: undefined
    },
    {
      icon: 'fas fa-mobile-alt', 
      title: 'Mobile Repair & Unlocking',
      description: 'iPhone repair, mobile unlock, iCloud removal, FRP bypass. Professional mobile technician in Freetown',
      features: [
        'Screen replacement',
        'iCloud removal',
        'FRP unlock & removal', 
        'Network unlocking'
      ],
      gradientColors: 'from-red-600 to-red-700',
      accentColor: 'red',
      href: undefined
    },
    {
      icon: 'fas fa-network-wired',
      title: 'Home Repair Services', 
      description: 'Professional home repair and network installation services in Freetown',
      features: [
        'Wi-Fi setup',
        'Network security',
        'Cable installation',
        'System integration'
      ],
      gradientColors: 'from-blue-900 to-blue-950',
      accentColor: 'blue',
      href: undefined
    },
    {
      icon: 'fas fa-usb',
      title: 'Device Detection', 
      description: 'Advanced USB device diagnostics for Android smartphones and tablets',
      features: [
        'Real-time device info',
        'Support 15+ brands',
        'USB diagnostics',
        'Browser-based tool'
      ],
      gradientColors: 'from-green-600 to-green-700',
      accentColor: 'green',
      href: '/device-detection'
    }
  ]

  return (
    <section className="py-24 relative overflow-hidden services-bg-pattern">
      {/* Background Design Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 opacity-70"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6" data-animate="fade">
            Professional IT Services
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed" data-animate="fade">
            From simple fixes to complex repairs, we provide comprehensive IT solutions 
            with cutting-edge technology and expert craftsmanship
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div 
              key={index}
              data-animate="zoom"
              className="service-card bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden transition-all duration-500 p-8 group cursor-pointer relative"
            >
              {/* Card accent decoration */}
              <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full bg-gradient-to-br ${service.gradientColors} opacity-20 group-hover:opacity-40 transition-opacity duration-500`}></div>
              <div className={`absolute bottom-0 left-0 w-32 h-32 -ml-8 -mb-8 rounded-full bg-gradient-to-tr ${service.gradientColors} opacity-10 group-hover:opacity-30 transition-opacity duration-500`}></div>
              
              {/* Card Content */}
              <div className="relative z-10">
                <div className={`icon-container w-16 h-16 rounded-xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-500 bg-gradient-to-br ${service.gradientColors}`}>
                  <i className={`${service.icon} text-2xl`}></i>
                </div>
                
                <h3 className={`text-xl font-bold mb-3 group-hover:text-${service.accentColor}-600 transition-colors duration-300`}>
                  {service.title}
                </h3>
                
                <p className="text-gray-600 mb-4">
                  {service.description}
                </p>
                
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-sm text-gray-700">
                      <i className={`fas fa-check-circle text-${service.accentColor}-${service.accentColor === 'red' || service.accentColor === 'green' ? '500' : '600'} mr-2 group-hover:scale-110 transition-all duration-300`}></i>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link 
                  href={service.href || "/learn-more"}
                  className="rounded-full px-5 py-2.5 bg-white shadow-md font-medium transition-all duration-300 flex items-center justify-center group-hover:shadow-lg border-2 border-blue-900 text-blue-900 hover:bg-blue-900 hover:text-white"
                >
                  {service.href ? 'Try Now' : 'Learn More'} <i className="fas fa-arrow-right ml-2 transition-transform duration-300 group-hover:translate-x-1"></i>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
