'use client';

import { useState } from 'react';
import Link from 'next/link';
import { HelpCircle, Phone, Mail, Clock, MapPin, ChevronDown } from 'lucide-react';

export default function FAQPage() {
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  const toggleQuestion = (questionId: string) => {
    setOpenQuestion(openQuestion === questionId ? null : questionId);
  };
  const faqCategories = [
    {
      category: 'General Repairs & Services',
      questions: [
        {
          q: 'What types of devices do you repair?',
          a: 'We repair all major brands of computers (HP, Dell, Lenovo, Acer, Asus), laptops, mobile phones (iPhone, Samsung, Tecno, iTel, Infinix, Huawei), tablets, and other electronic devices. Our expert technicians handle both hardware and software issues across all operating systems including Windows, macOS, Android, and iOS.'
        },
        {
          q: 'How long does a typical repair take?',
          a: 'Repair time varies by issue complexity. Simple repairs like screen replacements, battery changes, or software fixes typically take 1-4 hours. More complex repairs involving motherboard issues or hard-to-source parts may take 24-72 hours. We always provide an estimated timeline upfront and keep you informed if any delays occur.'
        },
        {
          q: 'Do I need to book an appointment or can I walk in?',
          a: 'Both! Walk-ins are always welcome during business hours (Monday-Saturday, 9:00 AM - 6:00 PM). However, booking an appointment through our website or phone ensures faster service and guaranteed technician availability, especially during busy periods. Appointments also receive priority handling.'
        },
        {
          q: 'What should I bring when dropping off my device?',
          a: 'Please bring: 1) The device itself (laptop, phone, tablet, etc.), 2) Original charger and cables if available, 3) Any relevant accessories (stylus, protective case), 4) A valid ID for verification, 5) Password/PIN if the device is locked (for diagnostics). We also recommend backing up important data before repair.'
        },
        {
          q: 'Will my data be safe during repair?',
          a: 'We prioritize data security and privacy. Our technicians only access necessary areas for repair diagnostics and fixes. However, we strongly recommend backing up all important data before any repair, as we cannot be held responsible for data loss during hardware repairs (especially motherboard or storage device repairs). We never access, copy, or share customer data.'
        }
      ]
    },
    {
      category: 'Pricing & Payment',
      questions: [
        {
          q: 'How much do repairs cost?',
          a: 'Repair costs vary based on the device type, issue complexity, and required parts. For example: Screen replacements range from Le 350-700 for budget phones to Le 1,400-5,000+ for iPhones. Battery replacements cost Le 150-800+. We offer FREE diagnostic assessment with repair, providing a detailed quote before any work begins. Check our pricing page for detailed ranges.'
        },
        {
          q: 'Do you charge for diagnostics?',
          a: 'Our diagnostic service is 100% FREE if you proceed with the recommended repair. If you decide not to repair your device after diagnostics, there\'s a minimal diagnostic fee of Le 50,000 to cover our technician\'s time and equipment usage. This honest pricing model ensures you\'re never surprised by unexpected charges.'
        },
        {
          q: 'What payment methods do you accept?',
          a: 'We accept multiple payment options for your convenience: Cash (Leones), Orange Money, Africell Money, bank transfers (all major Sierra Leone banks), and debit/credit cards. Payment is due upon device collection after repair completion. For corporate clients, we offer invoice billing with NET 30 terms.'
        },
        {
          q: 'Are there any hidden fees?',
          a: 'Absolutely not. We believe in transparent pricing. The quote we provide includes all labor costs, replacement parts, and testing. If we discover additional issues during repair, we contact you immediately for approval before proceeding. You only pay for what you\'ve approved – no surprise charges, no hidden fees.'
        },
        {
          q: 'Do you offer payment plans for expensive repairs?',
          a: 'For repairs exceeding Le 500,000, we offer flexible payment arrangements on a case-by-case basis. Contact our office to discuss payment plan options. We understand that unexpected repair costs can be challenging, and we work with customers to find affordable solutions.'
        }
      ]
    },
    {
      category: 'Warranty & Guarantees',
      questions: [
        {
          q: 'What warranty do you provide on repairs?',
          a: 'Every repair includes our comprehensive 30-day parts and labor warranty. This means if the same issue reoccurs within 30 days due to our workmanship or part defect, we\'ll fix it free of charge. The warranty covers the specific component repaired, not unrelated issues. Accidental damage, liquid damage, or physical drops after repair are not covered.'
        },
        {
          q: 'What if my device has problems after I pick it up?',
          a: 'If you notice any issues within 1 hour of collection, bring the device back immediately for re-inspection at no charge. For issues appearing within the 30-day warranty period, contact us to schedule a warranty repair. We stand behind our work and will make it right if there\'s a workmanship issue.'
        },
        {
          q: 'Do you use genuine parts?',
          a: 'Yes! We exclusively use genuine manufacturer-approved parts or high-quality OEM alternatives that meet or exceed original specifications. All parts are thoroughly tested before installation. We never use cheap counterfeit components that could damage your device or fail quickly. Your warranty coverage reflects our confidence in parts quality.'
        },
        {
          q: 'What voids the warranty?',
          a: 'Warranty is voided by: 1) Physical damage or drops after repair, 2) Liquid/water damage after repair, 3) Unauthorized repairs or modifications by third parties, 4) Normal wear and tear, 5) Failure to follow care instructions provided. Our warranty specifically covers defects in parts and workmanship related to our repair service.'
        }
      ]
    },
    {
      category: 'Specific Issues & Services',
      questions: [
        {
          q: 'Can you remove iCloud locks and Google FRP locks?',
          a: 'Yes, we provide specialized unlocking services for iCloud-locked iPhones and Google FRP-locked Android devices. However, we require proof of ownership (purchase receipt, previous usage photos, etc.) to ensure the device is legitimately yours. We do not unlock stolen devices. Pricing varies by device model and lock complexity.'
        },
        {
          q: 'Do you recover data from damaged devices?',
          a: 'Yes! Our data recovery service can retrieve lost files from damaged hard drives, SSDs, flash drives, memory cards, and phones. Success rates vary based on damage severity. We offer free assessment to determine recovery possibilities. Pricing depends on storage size and damage type. Recovered data is transferred to your external drive or cloud storage.'
        },
        {
          q: 'Can you upgrade my computer\'s RAM or hard drive?',
          a: 'Absolutely! We offer hardware upgrade services including RAM expansion (4GB to 32GB+), HDD to SSD conversion, battery replacement, and component upgrades. Upgrades significantly improve performance and extend device life. We assess your device\'s compatibility, recommend optimal upgrades within your budget, and install components professionally.'
        },
        {
          q: 'Do you repair water-damaged devices?',
          a: 'Yes, water damage repair is one of our specialties. Immediate action is critical – turn off the device and bring it to us ASAP. Our process includes: disassembly, ultrasonic cleaning, corrosion removal, component testing and replacement. Success depends on damage extent and how quickly you bring it in. Water damage repair starts at Le 150 plus any necessary parts.'
        },
        {
          q: 'Can you remove viruses and malware?',
          a: 'Yes, we provide comprehensive virus and malware removal services. Our process includes: full system scan with professional tools, malware removal, system restoration, security software installation, browser cleanup, and optimization. We also educate you on safe browsing practices to prevent future infections. Service typically takes 2-4 hours.'
        },
        {
          q: 'Do you sell laptops and computers?',
          a: 'Yes! We sell brand new and certified refurbished laptops, desktops, and accessories at competitive prices. All devices come with warranty and professional setup. We help you choose the right device for your needs and budget. Check our marketplace for current inventory or visit our showroom at #1 Regent Highway, Jui Junction.'
        }
      ]
    },
    {
      category: 'Location & Operations',
      questions: [
        {
          q: 'Where are you located in Freetown?',
          a: 'We\'re conveniently located at #1 Regent Highway, Jui Junction, Freetown, Sierra Leone. The shop is easily accessible by car, poda-poda, or okada from all parts of Freetown including downtown, Lumley, Aberdeen, Wilberforce, and surrounding areas. Look for our red and blue signage near the main junction.'
        },
        {
          q: 'What are your business hours?',
          a: 'We\'re open Monday through Saturday from 9:00 AM to 6:00 PM. We\'re closed on Sundays and public holidays. For urgent corporate repairs, we offer emergency services with additional fees – call +232 33 399391 to inquire about after-hours emergency support.'
        },
        {
          q: 'Do you offer pick-up and delivery services?',
          a: 'Yes! For customers unable to visit our shop, we offer pick-up and delivery services within Freetown at a nominal fee (Le 50,000-100,000 depending on distance). This service is particularly popular with corporate clients and busy professionals. Schedule pick-up by calling us or booking online.'
        },
        {
          q: 'Do you provide on-site repair services for businesses?',
          a: 'Yes, we offer on-site IT support for businesses, schools, NGOs, and government offices. Services include computer repairs, network setup, software installation, and IT consulting. On-site service rates depend on location and service scope. Contact us to discuss your organization\'s specific needs and receive a customized quote.'
        }
      ]
    },
    {
      category: 'Freetown-Specific Questions',
      questions: [
        {
          q: 'How do you protect devices from Freetown\'s power surges?',
          a: 'Power stability is a major challenge in Freetown. We strongly recommend using surge protectors or UPS (Uninterruptible Power Supply) systems. We sell quality surge protectors (from Le 50,000) and UPS units (from Le 350,000). For repaired devices, we test all power circuits and can install surge protection components. We also educate customers on safe power management.'
        },
        {
          q: 'Do you clean devices affected by dust and humidity?',
          a: 'Yes! Freetown\'s tropical climate causes dust accumulation and corrosion. We offer professional cleaning services: 1) Internal component cleaning (fans, heatsinks, motherboards), 2) Ultrasonic cleaning for corroded circuits, 3) Thermal paste replacement, 4) Preventive maintenance packages. Regular cleaning every 6 months significantly extends device life in our climate.'
        },
        {
          q: 'What brands are most popular in Sierra Leone?',
          a: 'The most common devices we repair are: Laptops – HP, Dell, Lenovo, Toshiba; Phones – Tecno, iTel, Infinix, Samsung, iPhone, Huawei. We maintain extensive parts inventory for these brands, ensuring faster repairs. We also service less common brands, though parts may take longer to source.'
        },
        {
          q: 'Do you work with local businesses and schools?',
          a: 'Absolutely! We partner with numerous Freetown businesses, educational institutions, and NGOs providing: bulk repair discounts, preventive maintenance contracts, IT consulting, emergency support, and hardware sales. We understand local business needs and offer flexible payment terms for established partnerships. Contact us to discuss corporate service packages.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#040e40] to-blue-900 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-6">
            <HelpCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            Get quick answers about our computer, laptop, and mobile repair services in Freetown
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Quick Contact */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl shadow-2xl p-8 mb-16 text-white">
          <h2 className="text-2xl font-bold mb-6 text-center">Can't Find Your Answer? Contact Us Directly</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-red-100">Call Us</p>
                <p className="font-bold">+232 33 399391</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-red-100">Email Us</p>
                <p className="font-bold text-sm">support@itservicesfreetown.com</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-red-100">Visit Us</p>
                <p className="font-bold text-sm">#1 Regent Highway, Jui Junction</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Categories */}
        {faqCategories.map((category, catIndex) => (
          <div key={catIndex} className="mb-16">
            <div className="flex items-center mb-8">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center mr-4">
                <span className="text-white font-bold text-lg">{catIndex + 1}</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900">{category.category}</h2>
            </div>

            <div className="space-y-4">
              {category.questions.map((faq, faqIndex) => {
                const questionId = `${catIndex}-${faqIndex}`;
                const isOpen = openQuestion === questionId;
                
                return (
                  <div 
                    key={faqIndex}
                    className="bg-white rounded-xl shadow-lg overflow-hidden border-l-4 border-[#040e40] transition-all duration-300 hover:shadow-2xl"
                  >
                    {/* Question - Clickable */}
                    <button
                      onClick={() => toggleQuestion(questionId)}
                      className="w-full text-left px-6 py-5 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                    >
                      <h3 className="text-lg font-bold text-gray-900 flex items-start flex-1 pr-4">
                        <span className="text-red-600 mr-3">Q:</span>
                        <span>{faq.q}</span>
                      </h3>
                      <ChevronDown 
                        className={`w-6 h-6 text-[#040e40] flex-shrink-0 transition-transform duration-300 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    
                    {/* Answer - Expandable with Dark Mode */}
                    <div 
                      className={`overflow-hidden transition-all duration-300 ease-in-out ${
                        isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
                      }`}
                    >
                      <div className="px-6 pb-6 pt-2">
                        <div className="bg-gradient-to-br from-gray-800 via-gray-900 to-[#040e40] rounded-lg p-6 shadow-inner">
                          <div className="flex items-start">
                            <span className="font-bold text-red-400 mr-3 text-lg">A:</span>
                            <p className="text-gray-100 leading-relaxed flex-1">
                              {faq.a}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Still Have Questions CTA */}
        <div className="bg-gradient-to-br from-[#040e40] to-gray-900 rounded-3xl shadow-2xl p-12 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
          <p className="text-blue-100 text-lg mb-8 max-w-2xl mx-auto">
            Our friendly customer service team is ready to help. Contact us through any of these channels 
            for personalized assistance with your specific repair needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/chat"
              className="inline-flex items-center justify-center px-8 py-4 bg-red-600 hover:bg-red-700 text-white text-lg font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <i className="fas fa-comments mr-3"></i>
              Chat with Expert
            </Link>
            <Link
              href="/book-appointment"
              className="inline-flex items-center justify-center px-8 py-4 bg-white hover:bg-gray-100 text-[#040e40] text-lg font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <i className="fas fa-calendar-check mr-3"></i>
              Book Appointment
            </Link>
          </div>
        </div>

        {/* Business Hours Reminder */}
        <div className="mt-12 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-4">
            <Clock className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Business Hours</h3>
              <p className="text-gray-700 mb-2">
                <strong>Monday - Saturday:</strong> 9:00 AM - 6:00 PM
              </p>
              <p className="text-gray-700">
                <strong>Sunday:</strong> Closed
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Emergency corporate support available after hours – call for details
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
