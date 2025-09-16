'use client'

export default function WhyChooseUs() {
  const features = [
    {
      icon: 'fas fa-clock',
      title: 'Real-Time Tracking',
      description: 'Monitor your repair status in real-time with detailed progress updates',
      gradientColors: 'from-blue-900 to-blue-950'
    },
    {
      icon: 'fas fa-comments', 
      title: 'Live Chat Support',
      description: 'Instant communication with our technicians and support team',
      gradientColors: 'from-red-600 to-red-700'
    },
    {
      icon: 'fas fa-brain',
      title: 'AI Troubleshooting', 
      description: 'Get instant repair suggestions powered by artificial intelligence',
      gradientColors: 'from-gray-700 to-blue-900'
    },
    {
      icon: 'fas fa-check-circle',
      title: 'Quality Guarantee',
      description: 'All repairs come with warranty and satisfaction guarantee', 
      gradientColors: 'from-white to-gray-100',
      textColor: 'text-red-600',
      border: true
    }
  ]

  return (
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
          {features.map((feature, index) => (
            <div 
              key={index}
              className="text-center group"
            >
              <div className="mb-6 flex justify-center">
                <div 
                  className={`w-16 h-16 bg-gradient-to-br ${feature.gradientColors} rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 ${feature.border ? 'border-2 border-gray-200' : ''}`}
                >
                  <i className={`${feature.icon} text-2xl ${feature.textColor || 'text-white'}`}></i>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
