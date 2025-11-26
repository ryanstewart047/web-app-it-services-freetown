import { Metadata } from 'next';
import Link from 'next/link';
import { AlertTriangle, Phone, Mail, MapPin } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Disclaimer | IT Services Freetown',
  description: 'Important disclaimer and legal information for IT Services Freetown repair and sales services.',
};

export default function DisclaimerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-600 rounded-full mb-6">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Disclaimer</h1>
          <p className="text-gray-300 text-lg">Last Updated: November 26, 2025</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 space-y-8">
          
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Important Information</h2>
            <p className="text-gray-700 leading-relaxed">
              The information provided by IT Services Freetown ("we," "us," or "our") on our website and through our services 
              is for general informational purposes only. All information is provided in good faith; however, we make no 
              representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, 
              reliability, availability, or completeness of any information on the website or our services.
            </p>
          </section>

          {/* Service Disclaimer */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Repair Services Disclaimer</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">No Guarantee of Data Recovery</h3>
            <p className="text-gray-700 mb-4">
              While we make every effort to protect your data during repairs, we cannot guarantee the recovery or preservation 
              of data on any device brought in for service. We strongly recommend that you back up all important data before 
              bringing your device to us for repair. IT Services Freetown is not responsible for any data loss that may occur 
              during the repair process.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Diagnostic Accuracy</h3>
            <p className="text-gray-700 mb-4">
              Our diagnostic services are performed to the best of our ability using industry-standard tools and techniques. 
              However, some issues may not be apparent during initial diagnosis and may only become evident during or after 
              repair. We reserve the right to revise our diagnosis and repair estimates if additional issues are discovered.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Warranty Limitations</h3>
            <p className="text-gray-700 mb-4">
              Our 30-day warranty covers parts and labor for the specific repair performed. It does not cover:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>Damage caused by misuse, accidents, or improper handling after repair</li>
              <li>Water damage or liquid exposure after repair</li>
              <li>Software issues or viruses</li>
              <li>Issues unrelated to the original repair</li>
              <li>Normal wear and tear</li>
              <li>Damage caused by third-party repairs or modifications</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Repair Timeline</h3>
            <p className="text-gray-700 mb-4">
              Estimated repair times are approximate and may vary depending on parts availability, complexity of the repair, 
              and current workload. We will make every effort to complete repairs within the estimated timeframe, but cannot 
              guarantee specific completion dates.
            </p>
          </section>

          {/* Product Sales Disclaimer */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Sales Disclaimer</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Product Descriptions</h3>
            <p className="text-gray-700 mb-4">
              We strive to display product information, including images, descriptions, and specifications, as accurately as 
              possible. However, we do not warrant that product descriptions, images, or other content are accurate, complete, 
              reliable, current, or error-free.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Refurbished Products</h3>
            <p className="text-gray-700 mb-4">
              Refurbished products have been previously used and professionally restored to working condition. While we test 
              all refurbished products thoroughly, they may have minor cosmetic imperfections. All refurbished products come 
              with our standard warranty unless otherwise stated.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Pricing and Availability</h3>
            <p className="text-gray-700 mb-4">
              Prices and product availability are subject to change without notice. We reserve the right to limit quantities 
              and to refuse or cancel orders at our discretion.
            </p>
          </section>

          {/* Website Disclaimer */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Website Content Disclaimer</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Technical Information</h3>
            <p className="text-gray-700 mb-4">
              Technical advice, tips, and guides provided on our website or blog are for informational purposes only. 
              While we strive for accuracy, technology is constantly evolving, and information may become outdated. 
              Always verify information before making decisions based on content from our website.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">External Links</h3>
            <p className="text-gray-700 mb-4">
              Our website may contain links to external websites that are not operated by us. We have no control over 
              the content and practices of these sites and cannot accept responsibility for their privacy policies or content.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6">Third-Party Advertisements</h3>
            <p className="text-gray-700 mb-4">
              We use third-party advertising companies (including Google AdSense) to serve ads when you visit our website. 
              These companies may use information about your visits to this and other websites to provide advertisements 
              about goods and services of interest to you. We do not endorse or take responsibility for the content of 
              third-party advertisements.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              To the fullest extent permitted by applicable law, IT Services Freetown shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred 
              directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
              <li>Your use or inability to use our services</li>
              <li>Any unauthorized access to or use of our servers and/or any personal information stored therein</li>
              <li>Any interruption or cessation of transmission to or from our services</li>
              <li>Any bugs, viruses, or other harmful code that may be transmitted through our services</li>
              <li>Any errors or omissions in any content or for any loss or damage incurred as a result of the use of any content posted, emailed, transmitted, or otherwise made available through our services</li>
            </ul>
          </section>

          {/* Professional Advice */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Not Professional Advice</h2>
            <p className="text-gray-700">
              The information on our website and services is not intended to replace professional technical consultation. 
              While our technicians are experienced and trained, complex issues may require manufacturer support or specialized 
              services. For critical business systems or data, we recommend consulting with IT professionals and maintaining 
              proper backups.
            </p>
          </section>

          {/* Changes to Disclaimer */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Disclaimer</h2>
            <p className="text-gray-700">
              We reserve the right to modify this disclaimer at any time. Changes will be effective immediately upon posting 
              to the website. Your continued use of our services following any changes constitutes your acceptance of the 
              new disclaimer.
            </p>
          </section>

          {/* Contact Information */}
          <section className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Questions or Concerns?</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about this disclaimer or our services, please don't hesitate to contact us:
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-700">
                <Phone className="w-5 h-5 text-yellow-600" />
                <span><strong>Phone:</strong> +232 33 399 391</span>
              </div>
              <div className="flex items-center gap-3 text-gray-700">
                <Mail className="w-5 h-5 text-yellow-600" />
                <span><strong>Email:</strong> itservicesfreetown@gmail.com</span>
              </div>
              <div className="flex items-start gap-3 text-gray-700">
                <MapPin className="w-5 h-5 text-yellow-600 mt-1" />
                <span><strong>Address:</strong> #1 Regent Highway Jui Junction, Freetown, Sierra Leone</span>
              </div>
            </div>
          </section>

          {/* Agreement Notice */}
          <section className="bg-blue-50 border-l-4 border-blue-600 p-6 rounded-r-lg">
            <p className="text-gray-700 font-semibold">
              By using our services, you acknowledge that you have read, understood, and agree to be bound by this disclaimer.
            </p>
          </section>

          {/* Back to Home */}
          <div className="text-center pt-6">
            <Link 
              href="/"
              className="inline-block px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
