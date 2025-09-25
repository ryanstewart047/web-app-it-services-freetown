'use client';

import React, { useState } from 'react';
import FacebookPagePlugin from '../../src/components/FacebookPagePlugin';

const SocialPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'events' | 'full'>('full');

  return (
    <>      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white">
          <div className="container mx-auto px-4 py-16">
            <div className="max-w-4xl mx-auto text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </div>
                <h1 className="text-4xl md:text-6xl font-bold mb-4">
                  Stay Connected
                </h1>
                <p className="text-xl md:text-2xl text-blue-100 mb-6">
                  Follow our latest updates, tech tips, and community news
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a 
                    href="https://www.facebook.com/itservicefreetownfeed"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    Follow on Facebook
                  </a>
                  <a 
                    href="/connect-agent"
                    className="inline-flex items-center justify-center px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Contact Us Direct
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 bg-white">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
                <div className="text-gray-600">Devices Repaired</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">24/7</div>
                <div className="text-gray-600">Support Available</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">5★</div>
                <div className="text-gray-600">Customer Rating</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-orange-600 mb-2">100%</div>
                <div className="text-gray-600">Satisfaction Rate</div>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Navigation */}
        <section className="py-8 bg-gray-50">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">
                Our Social Media Feed
              </h2>
              
              {/* Tab Buttons */}
              <div className="flex flex-wrap justify-center gap-4 mb-8">
                <button
                  onClick={() => setActiveTab('full')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    activeTab === 'full'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-blue-50 shadow-md'
                  }`}
                >
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14-7l2 2m-2 0l2 2m-6-6v20"/>
                  </svg>
                  Complete Feed
                </button>
                <button
                  onClick={() => setActiveTab('timeline')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    activeTab === 'timeline'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-blue-50 shadow-md'
                  }`}
                >
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Timeline
                </button>
                <button
                  onClick={() => setActiveTab('events')}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-200 ${
                    activeTab === 'events'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-blue-50 shadow-md'
                  }`}
                >
                  <svg className="w-5 h-5 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                  </svg>
                  Events
                </button>
              </div>

              {/* Facebook Integration */}
              <div className="flex justify-center">
                <FacebookPagePlugin
                  variant={activeTab}
                  width={500}
                  height={700}
                  showHeader={true}
                  adaptContainerWidth={true}
                  className="w-full max-w-2xl"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 bg-gradient-to-r from-green-600 to-blue-600 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Need Immediate Tech Support?
            </h2>
            <p className="text-xl mb-8 text-green-100">
              Don&apos;t wait for a social media response - get instant help now!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/connect-agent"
                className="inline-flex items-center justify-center px-8 py-4 bg-white text-green-600 rounded-lg hover:bg-gray-100 transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h2m-4 0V4a2 2 0 012-2h6a2 2 0 012 2v4"/>
                </svg>
                Connect with Agent
              </a>
              <a 
                href="/troubleshoot"
                className="inline-flex items-center justify-center px-8 py-4 bg-yellow-500 text-yellow-900 rounded-lg hover:bg-yellow-400 transition-all duration-200 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                AI Troubleshoot
              </a>
            </div>
          </div>
        </section>

        {/* Social Links Section */}
        <section className="py-12 bg-gray-100">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">
                Connect With Us Everywhere
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <a 
                  href="https://www.facebook.com/itservicefreetownfeed"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center p-4 bg-white rounded-lg hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                >
                  <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mb-3">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <span className="font-medium text-gray-800">Facebook</span>
                </a>
                
                <a 
                  href="/chat"
                  className="flex flex-col items-center p-4 bg-white rounded-lg hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                >
                  <div className="w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center mb-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                    </svg>
                  </div>
                  <span className="font-medium text-gray-800">Live Chat</span>
                </a>

                <a 
                  href="tel:+1234567890"
                  className="flex flex-col items-center p-4 bg-white rounded-lg hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                >
                  <div className="w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center mb-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                    </svg>
                  </div>
                  <span className="font-medium text-gray-800">Phone</span>
                </a>

                <a 
                  href="mailto:info@itservicesfreetown.com"
                  className="flex flex-col items-center p-4 bg-white rounded-lg hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                >
                  <div className="w-12 h-12 bg-red-600 text-white rounded-full flex items-center justify-center mb-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                  </div>
                  <span className="font-medium text-gray-800">Email</span>
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default SocialPage;