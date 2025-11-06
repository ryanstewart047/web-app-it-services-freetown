import Link from 'next/link';
import { Home, Search, ShoppingBag, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full text-center">
        {/* 404 Animation */}
        <div className="mb-8 relative">
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 animate-pulse">
            404
          </h1>
          <div className="absolute inset-0 blur-3xl bg-purple-500/20 animate-pulse" />
        </div>

        {/* Error Message */}
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-300 text-lg mb-8">
          Sorry, we couldn't find the page you're looking for. 
          It might have been moved or doesn't exist.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
          
          <Link
            href="/marketplace"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 text-white rounded-lg font-semibold hover:bg-white/20 transition-all backdrop-blur-sm"
          >
            <ShoppingBag className="w-5 h-5" />
            Browse Products
          </Link>
        </div>

        {/* Helpful Links */}
        <div className="text-left bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Search className="w-5 h-5" />
            Helpful Links
          </h3>
          <ul className="space-y-2">
            <li>
              <Link href="/marketplace" className="text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Browse our Marketplace
              </Link>
            </li>
            <li>
              <Link href="/services" className="text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                View our Services
              </Link>
            </li>
            <li>
              <Link href="/repair" className="text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Device Repair Services
              </Link>
            </li>
            <li>
              <Link href="/contact" className="text-gray-300 hover:text-purple-400 transition-colors flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="mt-8 text-gray-400 text-sm">
          <p>Need help? Contact us:</p>
          <p className="text-purple-400 font-semibold">
            WhatsApp: +232 33 399 391
          </p>
        </div>
      </div>
    </div>
  );
}
