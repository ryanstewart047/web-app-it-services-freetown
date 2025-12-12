'use client';

import React from 'react';
import { Shield, Clock, Award, Users, Wrench, MapPin } from 'lucide-react';

export default function WhyFreetown() {
  return (
    <section className="py-20 bg-gradient-to-br from-white via-blue-50 to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-[#040e40] to-red-600 text-white rounded-full mb-6">
            <Shield className="w-8 h-8" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Why Choose IT Services Freetown?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're not just another repair shop. We're your trusted technology partner in Sierra Leone, 
            providing expert solutions tailored to the unique challenges of Freetown's environment.
          </p>
        </div>

        {/* Main Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* Benefit 1 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 border-t-4 border-red-600">
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mr-4">
                <Award className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Certified Expertise</h3>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our team consists of certified technicians with over 10 years of combined experience in computer, 
              laptop, and mobile device repairs. We've successfully repaired thousands of devices across all major 
              brands including HP, Dell, Lenovo, Samsung, Apple, Tecno, iTel, and Infinix.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Each technician undergoes rigorous training and stays updated with the latest repair techniques and 
              technologies. We specialize in both hardware and software issues, ensuring comprehensive solutions 
              for any tech problem you encounter.
            </p>
          </div>

          {/* Benefit 2 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 border-t-4 border-[#040e40]">
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                <Clock className="w-7 h-7 text-[#040e40]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Fast Turnaround</h3>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              We understand that your devices are essential to your daily life and business operations. That's why 
              we offer same-day repair services for most common issues like screen replacements, battery changes, 
              charging port repairs, and software troubleshooting.
            </p>
            <p className="text-gray-700 leading-relaxed">
              For more complex repairs requiring specialized parts, we provide accurate time estimates upfront and 
              keep you informed throughout the repair process. Most laptop repairs are completed within 24-48 hours, 
              while mobile phone repairs often take just 1-3 hours.
            </p>
          </div>

          {/* Benefit 3 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 border-t-4 border-green-600">
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mr-4">
                <Shield className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">30-Day Warranty</h3>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Every repair comes with our comprehensive 30-day parts and labor warranty. If you experience any issues 
              with the repaired component within 30 days, we'll fix it free of charge. This warranty demonstrates 
              our confidence in the quality of our work and genuine parts.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We use only high-quality, tested replacement parts sourced from reliable suppliers. Our warranty covers 
              manufacturing defects and workmanship issues, giving you complete peace of mind. Please note that 
              accidental damage is not covered under warranty.
            </p>
          </div>

          {/* Benefit 4 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 border-t-4 border-purple-600">
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mr-4">
                <Users className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Customer-Focused Service</h3>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              At IT Services Freetown, customer satisfaction is our top priority. We believe in transparent 
              communication, honest pricing, and treating every customer with respect. Before starting any repair, 
              we provide a detailed diagnostic report and cost estimate, so you know exactly what to expect.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Our friendly staff is always ready to answer your questions, provide technical advice, and guide you 
              through the repair process. We also offer free consultations to help you make informed decisions about 
              repairs versus replacements, ensuring you get the best value for your money.
            </p>
          </div>

          {/* Benefit 5 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 border-t-4 border-orange-600">
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mr-4">
                <Wrench className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Climate-Adapted Solutions</h3>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Freetown's tropical climate presents unique challenges for electronic devices. High humidity, dust, 
              frequent power outages, and heat exposure can significantly impact device performance and longevity. 
              We've developed specialized repair and maintenance techniques specifically for Sierra Leone's environment.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Our services include thorough cleaning of internal components affected by dust and moisture, 
              recommendations for surge protectors and UPS systems to combat power issues, and heat management 
              solutions to prevent overheating. We also educate customers on proper device care in tropical conditions.
            </p>
          </div>

          {/* Benefit 6 */}
          <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-2xl transition-all duration-300 border-t-4 border-red-600">
            <div className="flex items-center mb-6">
              <div className="w-14 h-14 bg-red-100 rounded-xl flex items-center justify-center mr-4">
                <MapPin className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">Convenient Location</h3>
            </div>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our repair center is strategically located at #1 Regent Highway, Jui Junction, making us easily 
              accessible from all parts of Freetown. Whether you're coming from downtown, Aberdeen, Lumley, Wilberforce, 
              or surrounding areas, we're just a short drive or poda-poda ride away.
            </p>
            <p className="text-gray-700 leading-relaxed">
              We maintain extended business hours Monday through Saturday (9:00 AM - 6:00 PM) to accommodate working 
              professionals and students. For urgent repairs or corporate clients, we also offer pick-up and delivery 
              services within Freetown at a nominal fee. Walk-ins are welcome, or book an appointment online for priority service.
            </p>
          </div>
        </div>

        {/* Additional Value Propositions */}
        <div className="bg-gradient-to-br from-[#040e40] to-gray-900 rounded-3xl shadow-2xl p-12 text-white">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div>
              <h3 className="text-3xl font-bold mb-6">Transparent Pricing, No Hidden Fees</h3>
              <p className="text-blue-100 leading-relaxed mb-4">
                We believe in honest, upfront pricing. Before we begin any repair work, you'll receive a detailed 
                quote outlining all costs including parts, labor, and any additional services. We never surprise 
                customers with unexpected charges. If we discover additional issues during the repair process, 
                we'll contact you immediately for approval before proceeding.
              </p>
              <p className="text-blue-100 leading-relaxed mb-6">
                Our diagnostic service is completely free if you choose to proceed with the repair. Even if you 
                decide not to repair your device, the diagnostic fee is minimal and helps us maintain our professional 
                equipment and expertise. We offer competitive rates that provide excellent value without compromising 
                on quality.
              </p>
              <div className="flex items-start space-x-3 mb-3">
                <i className="fas fa-check-circle text-green-400 text-xl mt-1"></i>
                <div>
                  <p className="font-semibold text-lg">Free Diagnostic (with repair)</p>
                  <p className="text-blue-200 text-sm">Comprehensive device assessment at no cost</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 mb-3">
                <i className="fas fa-check-circle text-green-400 text-xl mt-1"></i>
                <div>
                  <p className="font-semibold text-lg">No Hidden Charges</p>
                  <p className="text-blue-200 text-sm">What we quote is what you pay</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <i className="fas fa-check-circle text-green-400 text-xl mt-1"></i>
                <div>
                  <p className="font-semibold text-lg">Flexible Payment Options</p>
                  <p className="text-blue-200 text-sm">Cash, mobile money, and bank transfers accepted</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-3xl font-bold mb-6">Genuine Parts & Quality Assurance</h3>
              <p className="text-blue-100 leading-relaxed mb-4">
                We exclusively use genuine, manufacturer-approved replacement parts or high-quality OEM alternatives 
                that meet or exceed original specifications. Every component we install undergoes rigorous testing 
                before installation to ensure optimal performance and longevity.
              </p>
              <p className="text-blue-100 leading-relaxed mb-6">
                Our quality assurance process includes pre-repair diagnostics, careful component installation, 
                post-repair testing, and final quality checks before returning your device. We also keep detailed 
                records of all repairs, parts used, and warranty information for future reference and accountability.
              </p>
              <div className="flex items-start space-x-3 mb-3">
                <i className="fas fa-check-circle text-green-400 text-xl mt-1"></i>
                <div>
                  <p className="font-semibold text-lg">Authentic Components</p>
                  <p className="text-blue-200 text-sm">Original or certified OEM replacement parts</p>
                </div>
              </div>
              <div className="flex items-start space-x-3 mb-3">
                <i className="fas fa-check-circle text-green-400 text-xl mt-1"></i>
                <div>
                  <p className="font-semibold text-lg">Rigorous Testing</p>
                  <p className="text-blue-200 text-sm">Every repair tested before delivery</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <i className="fas fa-check-circle text-green-400 text-xl mt-1"></i>
                <div>
                  <p className="font-semibold text-lg">Detailed Documentation</p>
                  <p className="text-blue-200 text-sm">Complete repair records for warranty claims</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <p className="text-xl text-gray-700 mb-6">
            Experience the difference of professional, reliable IT services in Freetown
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/book-appointment" 
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white text-lg font-semibold rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <i className="fas fa-calendar-check mr-3"></i>
              Book Your Repair Now
            </a>
            <a 
              href="/chat" 
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[#040e40] to-blue-900 text-white text-lg font-semibold rounded-xl hover:from-blue-900 hover:to-[#040e40] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <i className="fas fa-comments mr-3"></i>
              Chat with Expert
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
