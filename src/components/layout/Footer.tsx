import Link from 'next/link'
import { Smartphone, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-primary text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Smartphone className="w-8 h-8" />
              <span className="text-xl font-bold">IT Services Freetown</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Professional computer and mobile repair services in Freetown, Sierra Leone. 
              We provide expert repairs with real-time tracking and AI-powered support.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/book-appointment" className="text-gray-300 hover:text-white transition-colors">
                  Book Appointment
                </Link>
              </li>
              <li>
                <Link href="/track-repair" className="text-gray-300 hover:text-white transition-colors">
                  Track Repair
                </Link>
              </li>
              <li>
                <Link href="/troubleshoot" className="text-gray-300 hover:text-white transition-colors">
                  AI Troubleshooting
                </Link>
              </li>
              <li>
                <Link href="/chat" className="text-gray-300 hover:text-white transition-colors">
                  Chat Support
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-gray-300" />
                <span className="text-gray-300">+232 XX XXX XXXX</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-300" />
                <span className="text-gray-300">info@itservicesfreetown.com</span>
              </div>
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 text-gray-300 mt-1" />
                <span className="text-gray-300">
                  123 Main Street<br />
                  Freetown, Sierra Leone
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary/20 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            © {new Date().getFullYear()} IT Services Freetown. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
