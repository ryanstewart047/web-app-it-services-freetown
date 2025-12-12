import { Metadata } from 'next';
import Link from 'next/link';
import { Building2, Phone, Mail, MapPin, Users, Award, Clock, Shield } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About Us | IT Services Freetown',
  description: 'Learn about IT Services Freetown - Your trusted computer, laptop, and mobile device repair experts in Freetown, Sierra Leone.',
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#040e40] via-[#040e40] to-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-red-600 to-[#040e40] text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
            <Building2 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">About IT Services Freetown</h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            Your Trusted Technology Partner in Sierra Leone
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Our Story */}
        <section className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="mb-4">
              IT Services Freetown is Sierra Leone's premier computer, laptop, and mobile device repair service provider. 
              Established with a vision to make quality IT services accessible to everyone in Freetown, we have grown to 
              become the most trusted name in technology repairs and sales.
            </p>
            <p className="mb-4">
              Located at <strong>#1 Regent Highway Jui Junction</strong>, we serve customers throughout Freetown and beyond. 
              Our team of certified technicians has years of experience repairing all major brands including HP, Dell, Lenovo, 
              Samsung, Tecno, iTel, Infinix, and Apple devices.
            </p>
            <p>
              What started as a small repair shop has evolved into a full-service IT solutions provider, offering everything 
              from laptop sales and mobile phone repairs to data recovery and technical support. We pride ourselves on 
              fast, reliable service and competitive pricing.
            </p>
          </div>
        </section>

        {/* Why Choose Us */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-2xl transition-all">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Expert Technicians</h3>
              <p className="text-gray-600">
                Certified professionals with years of experience in device repairs
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-2xl transition-all">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Fast Service</h3>
              <p className="text-gray-600">
                Same-day repairs available for most common issues
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-2xl transition-all">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Warranty Backed</h3>
              <p className="text-gray-600">
                24hr LCD warranty | 72hr other repairs
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-2xl transition-all">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Customer First</h3>
              <p className="text-gray-600">
                Dedicated to providing exceptional customer service
              </p>
            </div>
          </div>
        </section>

        {/* Our Services */}
        <section className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold text-red-600 mb-3">Computer & Laptop Repairs</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Hardware diagnostics and repairs</li>
                <li>Screen replacement</li>
                <li>Keyboard and trackpad repair</li>
                <li>Battery replacement</li>
                <li>Hard drive and SSD upgrades</li>
                <li>RAM upgrades</li>
                <li>Motherboard repairs</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-red-600 mb-3">Mobile Phone Repairs</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Screen/LCD replacement</li>
                <li>Battery replacement</li>
                <li>Charging port repair</li>
                <li>Water damage repair</li>
                <li>Speaker and microphone repair</li>
                <li>Software troubleshooting</li>
                <li>Data recovery</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-red-600 mb-3">Sales & Marketplace</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>New and refurbished laptops</li>
                <li>Desktop computers</li>
                <li>Computer accessories</li>
                <li>Mobile phones and accessories</li>
                <li>Genuine spare parts</li>
                <li>Software licenses</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-red-600 mb-3">Additional Services</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Data backup and recovery</li>
                <li>Virus and malware removal</li>
                <li>Operating system installation</li>
                <li>Network setup and troubleshooting</li>
                <li>Free diagnostics</li>
                <li>Remote support</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="bg-gradient-to-r from-red-600 to-[#040e40] rounded-2xl shadow-2xl p-8 md:p-12 text-white">
          <h2 className="text-3xl font-bold mb-8 text-center">Get In Touch</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Phone</h3>
                <p className="text-blue-100">+232 33 399 391</p>
                <p className="text-sm text-blue-200 mt-1">Mon-Sat: 8:00 AM - 6:00 PM</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Email</h3>
                <p className="text-blue-100">support@itservicesfreetown.com</p>
                <p className="text-sm text-blue-200 mt-1">24/7 Support</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-1">Location</h3>
                <p className="text-blue-100">#1 Regent Highway</p>
                <p className="text-blue-100">Jui Junction, Freetown</p>
                <p className="text-sm text-blue-200 mt-1">Free parking available</p>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link 
              href="/contact"
              className="inline-block px-8 py-4 bg-white text-red-600 font-bold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Contact Us Today
            </Link>
          </div>
        </section>

        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link 
            href="/"
            className="inline-block px-8 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
