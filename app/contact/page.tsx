import type { Metadata } from 'next';
import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact Us - IT Services Freetown',
  description: 'Get in touch with IT Services Freetown. Visit us, call, email, or chat with our expert technicians for all your device repair needs.',
  keywords: 'contact IT services, freetown contact, tech support, repair service contact',
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#040e40] via-[#040e40] to-gray-900">
      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Get in Touch
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            We're here to help with all your IT service needs. Reach out to us through any of the channels below.
          </p>
        </div>
      </section>

      {/* Contact Methods Grid */}
      <section className="pb-16 px-4">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Phone */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Phone className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone</h3>
            <p className="text-gray-600 mb-3">Call us for immediate assistance</p>
            <a 
              href="tel:+23233399391" 
              className="text-red-600 hover:text-red-700 font-medium"
            >
              +232 33 399391
            </a>
            <p className="text-sm text-gray-500 mt-2">Mon-Sat: 9AM - 6PM</p>
          </div>

          {/* Email */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Email</h3>
            <p className="text-gray-600 mb-3">Send us a detailed message</p>
            <a 
              href="mailto:support@itservicesfreetown.com" 
              className="text-green-600 hover:text-green-700 font-medium break-all"
            >
              support@itservicesfreetown.com
            </a>
            <p className="text-sm text-gray-500 mt-2">24-48 hour response</p>
          </div>

          {/* Location */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Visit Us</h3>
            <p className="text-gray-600 mb-3">Come to our service center</p>
            <address className="text-red-600 not-italic">
              #1 Regent Highway, Jui Junction<br />
              Freetown, Sierra Leone
            </address>
            <p className="text-sm text-gray-500 mt-2">Walk-ins welcome</p>
          </div>

          {/* Live Chat */}
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="bg-red-100 w-12 h-12 rounded-full flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Live Chat</h3>
            <p className="text-gray-600 mb-3">Chat with our support team</p>
            <Link 
              href="/chat" 
              className="text-red-600 hover:text-red-700 font-medium"
            >
              Start Chat →
            </Link>
            <p className="text-sm text-gray-500 mt-2">Online support available</p>
          </div>
        </div>
      </section>

      {/* Business Hours */}
      <section className="pb-16 px-4">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-8 h-8 text-red-600" />
            <h2 className="text-2xl font-bold text-gray-900">Business Hours</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Service Center</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex justify-between">
                  <span>Monday - Friday</span>
                  <span className="font-medium">9:00 AM - 6:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span>Saturday</span>
                  <span className="font-medium">10:00 AM - 4:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span>Sunday</span>
                  <span className="font-medium text-red-600">Closed</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Online Support</h3>
              <ul className="space-y-2 text-gray-600">
                <li className="flex justify-between">
                  <span>Live Chat</span>
                  <span className="font-medium">9:00 AM - 6:00 PM</span>
                </li>
                <li className="flex justify-between">
                  <span>Email Support</span>
                  <span className="font-medium">24/7</span>
                </li>
                <li className="flex justify-between">
                  <span>Response Time</span>
                  <span className="font-medium">24-48 hours</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Map or Additional Info */}
      <section className="pb-16 px-4">
        <div className="max-w-4xl mx-auto bg-gradient-to-br from-red-600 to-[#040e40] rounded-lg shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Need Immediate Help?</h2>
          <p className="text-blue-100 mb-6">
            For urgent repairs or technical emergencies, call us directly or visit our service center. 
            We prioritize emergency cases and can often accommodate same-day service.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link 
              href="/book-appointment" 
              className="bg-white text-red-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Book Appointment
            </Link>
            <Link 
              href="/chat" 
              className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-400 transition-colors border-2 border-white"
            >
              Chat Now
            </Link>
            <a 
              href="tel:+23233399391" 
              className="bg-transparent text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors border-2 border-white"
            >
              Call Us
            </a>
          </div>
        </div>
      </section>

      {/* Services Quick Links */}
      <section className="pb-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            What Can We Help You With?
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Link 
              href="/marketplace" 
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center group"
            >
              <div className="text-3xl mb-2">🛒</div>
              <h3 className="font-semibold text-gray-900 group-hover:text-red-600">Shop Products</h3>
              <p className="text-sm text-gray-600 mt-2">Browse our marketplace</p>
            </Link>
            
            <Link 
              href="/troubleshoot" 
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center group"
            >
              <div className="text-3xl mb-2">🔧</div>
              <h3 className="font-semibold text-gray-900 group-hover:text-red-600">Troubleshoot</h3>
              <p className="text-sm text-gray-600 mt-2">Get instant solutions</p>
            </Link>
            
            <Link 
              href="/track-repair" 
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-center group"
            >
              <div className="text-3xl mb-2">📍</div>
              <h3 className="font-semibold text-gray-900 group-hover:text-red-600">Track Repair</h3>
              <p className="text-sm text-gray-600 mt-2">Check repair status</p>
            </Link>
          </div>
        </div>
      </section>

      {/* Back to Home */}
      <section className="pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Home
          </Link>
        </div>
      </section>
    </main>
  );
}
