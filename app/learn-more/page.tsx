"use client"

import { useScrollAnimations } from '@/hooks/useScrollAnimations'
import { usePageLoader } from '@/hooks/usePageLoader'
import LoadingOverlay from '@/components/LoadingOverlay'

export default function LearnMore() {
  const { isLoading, progress } = usePageLoader({
    minLoadTime: 1500
  });
  
  // Initialize scroll animations
  useScrollAnimations()

  if (isLoading) {
    return <LoadingOverlay progress={progress} variant="modern" />;
  }

  return (
    <>
      {/* Hero Section */}
      <section className="gradient-bg hero-pattern pt-24 pb-16" style={{background: 'linear-gradient(135deg, #040e40 0%, #dc2626 100%)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 scroll-animate" style={{color: 'white', textShadow: '0 2px 4px rgba(0,0,0,0.3)'}}>
              Learn More About{' '}
              <span className="text-yellow-300" style={{color: '#f59e0b', textShadow: '0 2px 4px rgba(0,0,0,0.3)'}}>IT Services Freetown</span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto scroll-animate" style={{color: '#f3f4f6', textShadow: '0 1px 2px rgba(0,0,0,0.2)'}}>
              Discover our expertise, commitment to excellence, and comprehensive IT solutions that have made us Freetown&apos;s trusted technology partner.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center scroll-animate">
              <a href="#about" className="bg-white text-primary-950 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-300 shadow-lg" style={{color: '#040e40'}}>
                About Our Company
              </a>
              <a href="#services" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors duration-300">
                Our Services
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="scroll-animate">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Who We Are
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                IT Services Freetown has been at the forefront of technology solutions in Sierra Leone since 2022. We&apos;re a dedicated team of certified technicians and IT professionals committed to providing exceptional service and innovative solutions.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                Our mission is simple: to make technology accessible, reliable, and affordable for everyone in Freetown and beyond. Whether you&apos;re dealing with a broken laptop, need mobile phone repairs, or require comprehensive IT support, we&apos;re here to help.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">500+</div>
                  <div className="text-gray-600">Devices Repaired</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-red-600">95%</div>
                  <div className="text-gray-600">Success Rate</div>
                </div>
              </div>
            </div>
            <div className="scroll-animate">
              <img 
                src="https://images.pexels.com/photos/3825582/pexels-photo-3825582.jpeg?auto=compress&cs=tinysrgb&w=800" 
                alt="IT Services Freetown Team" 
                className="rounded-2xl shadow-2xl w-full h-96 object-cover" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 scroll-animate">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Our Core Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We offer a comprehensive range of IT services designed to meet all your technology needs
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 scroll-animate">
              <div className="text-4xl text-red-600 mb-4">
                <i className="fas fa-laptop"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Laptop Repair</h3>
              <p className="text-gray-600 mb-4">
                Professional laptop repair services for all brands and models. From screen replacements to motherboard repairs.
              </p>
              <a href="/book-appointment" className="text-red-600 font-semibold hover:text-red-700 transition-colors">
                Book Repair →
              </a>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 scroll-animate">
              <div className="text-4xl text-red-600 mb-4">
                <i className="fas fa-mobile-alt"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Mobile Phone Services</h3>
              <p className="text-gray-600 mb-4">
                Complete mobile phone solutions including unlocking, motherboard repair, and software troubleshooting.
              </p>
              <a href="/book-appointment" className="text-red-600 font-semibold hover:text-red-700 transition-colors">
                Get Service →
              </a>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-xl hover:shadow-2xl transition-all duration-300 scroll-animate">
              <div className="text-4xl text-red-600 mb-4">
                <i className="fas fa-tools"></i>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Technical Support</h3>
              <p className="text-gray-600 mb-4">
                24/7 technical support and troubleshooting for all your IT issues. Remote and on-site support available.
              </p>
              <a href="/chat" className="text-red-600 font-semibold hover:text-red-700 transition-colors">
                Get Support →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 scroll-animate">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Why Choose IT Services Freetown?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We&apos;re not just another IT company - we&apos;re your technology partners committed to your success
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center scroll-animate">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-certificate text-2xl text-red-600"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Certified Experts</h3>
              <p className="text-gray-600">Our team consists of certified professionals with years of experience</p>
            </div>

            <div className="text-center scroll-animate">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-clock text-2xl text-red-600"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Fast Turnaround</h3>
              <p className="text-gray-600">Quick and efficient service with most repairs completed within 24-48 hours</p>
            </div>

            <div className="text-center scroll-animate">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-shield-alt text-2xl text-red-600"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Quality Guarantee</h3>
              <p className="text-gray-600">All our work comes with a comprehensive warranty and satisfaction guarantee</p>
            </div>

            <div className="text-center scroll-animate">
              <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-dollar-sign text-2xl text-red-600"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Affordable Pricing</h3>
              <p className="text-gray-600">Competitive rates with transparent pricing - no hidden fees or surprises</p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="scroll-animate">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Experience the difference of professional IT services. Book your appointment today and let us solve your technology challenges.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/book-appointment" 
                className="bg-gradient-to-r from-primary-950 via-primary-900 to-red-600 hover:from-primary-900 hover:via-primary-800 hover:to-red-500 text-white font-bold py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center"
              >
                <i className="fas fa-calendar-plus mr-3"></i>
                Book Appointment
              </a>
              <a 
                href="/chat" 
                className="border-2 border-gray-300 text-gray-700 hover:border-primary-950 hover:text-primary-950 font-semibold py-4 px-8 rounded-xl transition-all duration-300 flex items-center justify-center"
              >
                <i className="fas fa-comments mr-3"></i>
                Chat Support
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
