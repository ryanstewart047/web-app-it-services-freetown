'use client';

import React from 'react';

export default function CommonIssues() {
  const issues = [
    {
      icon: 'fa-battery-empty',
      title: 'Device Won\'t Turn On',
      description: 'If your laptop or phone won\'t power up, it could be a battery issue, charging port problem, or motherboard failure. Our technicians diagnose the root cause and provide cost-effective solutions, whether it\'s a simple battery replacement or more complex circuit board repair.',
      color: 'red'
    },
    {
      icon: 'fa-temperature-high',
      title: 'Overheating Issues',
      description: 'Freetown\'s hot climate can exacerbate device overheating, especially when dust accumulates in cooling vents. We perform thorough cleaning, replace thermal paste, repair or upgrade cooling fans, and provide recommendations for better heat management in tropical environments.',
      color: 'orange'
    },
    {
      icon: 'fa-desktop',
      title: 'Cracked/Broken Screens',
      description: 'Damaged screens are among the most common repairs. We replace laptop LCDs, phone touchscreens, and tablet displays with high-quality components. Most screen replacements are completed within hours, restoring your device to like-new condition.',
      color: 'blue'
    },
    {
      icon: 'fa-plug',
      title: 'Charging Port Problems',
      description: 'Loose or damaged charging ports prevent proper charging. This issue is common in mobile phones and laptops due to frequent plugging/unplugging. We repair or replace charging ports quickly, ensuring reliable power connection and eliminating frustrating charging issues.',
      color: 'green'
    },
    {
      icon: 'fa-tachometer-alt',
      title: 'Slow Performance',
      description: 'Is your device taking forever to start or run applications? Slow performance can result from insufficient RAM, hard drive issues, malware, or outdated software. We upgrade RAM, replace HDDs with faster SSDs, remove viruses, and optimize your system for maximum speed.',
      color: 'purple'
    },
    {
      icon: 'fa-tint',
      title: 'Water Damage',
      description: 'Liquid spills and rain exposure are serious threats to electronics. Our water damage repair service includes careful disassembly, ultrasonic cleaning, corrosion removal, and component replacement. Quick action is critical – bring your device to us immediately after water exposure.',
      color: 'cyan'
    },
    {
      icon: 'fa-keyboard',
      title: 'Keyboard/Touchpad Issues',
      description: 'Stuck keys, unresponsive keyboards, or malfunctioning touchpads disrupt productivity. We repair individual keys, replace entire keyboards, and fix touchpad connectivity issues. Dust cleaning, membrane replacement, and driver updates are common solutions.',
      color: 'indigo'
    },
    {
      icon: 'fa-volume-mute',
      title: 'Audio Problems',
      description: 'No sound, distorted audio, or microphone issues affect communication and entertainment. We diagnose speaker damage, audio jack problems, software conflicts, and driver issues. Solutions range from simple cleaning to speaker replacement.',
      color: 'pink'
    },
    {
      icon: 'fa-wifi',
      title: 'Network Connectivity',
      description: 'Can\'t connect to Wi-Fi or experiencing slow internet? Network adapter failures, driver issues, or router problems might be the culprit. We repair Wi-Fi cards, update network drivers, optimize wireless settings, and troubleshoot connection stability.',
      color: 'teal'
    },
    {
      icon: 'fa-lock',
      title: 'Device Locked/FRP',
      description: 'Forgotten passwords, iCloud locks, Google FRP locks, and screen locks can render devices unusable. Our specialized unlocking services help you regain access to your device safely and legally, preserving your data whenever possible.',
      color: 'red'
    },
    {
      icon: 'fa-hdd',
      title: 'Data Recovery',
      description: 'Lost important files due to accidental deletion, formatted drives, or hardware failure? Our data recovery specialists use advanced tools to retrieve photos, documents, videos, and other critical data from damaged storage devices with high success rates.',
      color: 'yellow'
    },
    {
      icon: 'fa-bug',
      title: 'Virus & Malware',
      description: 'Malware, viruses, and ransomware compromise security and performance. We perform comprehensive virus removal, install robust antivirus protection, educate you on safe browsing practices, and implement security measures to prevent future infections.',
      color: 'red'
    }
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-600 to-orange-600 text-white rounded-full mb-6">
            <i className="fas fa-tools text-2xl"></i>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Common Device Problems We Fix Daily
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            From simple software glitches to complex hardware failures, our expert technicians have seen and 
            successfully resolved thousands of tech problems. Here are the most common issues we encounter 
            in Freetown and how we fix them.
          </p>
        </div>

        {/* Issues Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {issues.map((issue, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-all duration-300 border-l-4 border-red-600 group"
            >
              <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 bg-${issue.color}-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
                  <i className={`fas ${issue.icon} text-${issue.color}-600 text-xl`}></i>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-red-600 transition-colors">
                    {issue.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-sm">
                    {issue.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Freetown-Specific Issues */}
        <div className="bg-gradient-to-r from-[#040e40] to-blue-900 rounded-3xl shadow-2xl p-12 text-white">
          <h3 className="text-3xl font-bold mb-8 text-center">
            Tech Challenges Unique to Freetown, Sierra Leone
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center mb-4">
                <i className="fas fa-bolt text-yellow-400 text-3xl mr-4"></i>
                <h4 className="text-2xl font-bold">Power Surge Damage</h4>
              </div>
              <p className="text-blue-100 leading-relaxed">
                Frequent power outages and voltage fluctuations in Freetown can damage laptop chargers, 
                motherboards, and internal components. We've repaired countless devices affected by power surges 
                and always recommend using surge protectors or UPS systems. Our repair process includes thorough 
                power circuit testing and component replacement when necessary.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center mb-4">
                <i className="fas fa-wind text-blue-300 text-3xl mr-4"></i>
                <h4 className="text-2xl font-bold">Dust & Humidity Issues</h4>
              </div>
              <p className="text-blue-100 leading-relaxed">
                Sierra Leone's tropical climate means high humidity and airborne dust that infiltrate devices. 
                This causes corrosion, short circuits, and clogged cooling systems. We provide specialized cleaning 
                services including ultrasonic cleaning for motherboards, dust removal from fans and vents, and 
                anti-corrosion treatments for better device longevity.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center mb-4">
                <i className="fas fa-sun text-orange-400 text-3xl mr-4"></i>
                <h4 className="text-2xl font-bold">Heat-Related Failures</h4>
              </div>
              <p className="text-blue-100 leading-relaxed">
                Ambient temperatures in Freetown often exceed optimal operating conditions for electronics. 
                This leads to accelerated battery degradation, thermal throttling, and component failure. 
                We educate customers on proper device ventilation, recommend cooling pads for laptops, and 
                perform heat management upgrades to extend device life in hot conditions.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="flex items-center mb-4">
                <i className="fas fa-network-wired text-green-400 text-3xl mr-4"></i>
                <h4 className="text-2xl font-bold">Network & Connectivity</h4>
              </div>
              <p className="text-blue-100 leading-relaxed">
                Inconsistent internet connectivity in some Freetown areas can cause software update failures 
                and incomplete downloads that corrupt systems. We help optimize network settings, configure 
                routers properly, troubleshoot ISP issues, and ensure your devices are set up for the best 
                possible connectivity in your location.
              </p>
            </div>
          </div>
        </div>

        {/* Prevention Tips */}
        <div className="mt-16 bg-white rounded-2xl shadow-lg p-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            Preventing Common Issues: Expert Tips for Freetown Device Owners
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="fas fa-check text-green-600"></i>
              </div>
              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">Invest in Surge Protection</h4>
                <p className="text-gray-600">
                  Use quality surge protectors or UPS systems to safeguard devices from Freetown's unpredictable 
                  power supply. A Le 100,000 investment in protection can save you from Le 1,000,000+ in repairs.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="fas fa-check text-green-600"></i>
              </div>
              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">Regular Cleaning & Maintenance</h4>
                <p className="text-gray-600">
                  Schedule professional cleaning every 6 months to remove dust buildup. Clean your device's exterior 
                  weekly with a soft cloth and keep vents unobstructed for optimal airflow.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="fas fa-check text-green-600"></i>
              </div>
              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">Backup Data Regularly</h4>
                <p className="text-gray-600">
                  Follow the 3-2-1 rule: 3 copies of data, 2 different storage types, 1 off-site backup. 
                  Use cloud storage (Google Drive, Dropbox) and external hard drives to protect against data loss.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="fas fa-check text-green-600"></i>
              </div>
              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">Use Protective Cases</h4>
                <p className="text-gray-600">
                  Invest in quality laptop bags and phone cases. Freetown's dusty roads and crowded public 
                  transport increase drop and impact risks. Prevention is cheaper than screen replacement.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="fas fa-check text-green-600"></i>
              </div>
              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">Update Software Regularly</h4>
                <p className="text-gray-600">
                  Keep your operating system, drivers, and security software up to date. Use Wi-Fi at cafes or 
                  offices for large updates to save mobile data costs.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-4">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <i className="fas fa-check text-green-600"></i>
              </div>
              <div>
                <h4 className="font-bold text-lg text-gray-900 mb-2">Proper Charging Habits</h4>
                <p className="text-gray-600">
                  Avoid overcharging batteries. Unplug devices once fully charged. Use original or certified chargers 
                  to prevent damage. Don't use devices while charging in hot conditions.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-xl text-gray-700 mb-6">
            Experiencing any of these issues? Don't wait – early repair prevents more costly damage.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/troubleshoot" 
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-[#040e40] to-blue-900 text-white text-lg font-semibold rounded-xl hover:from-blue-900 hover:to-[#040e40] transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <i className="fas fa-search-plus mr-3"></i>
              Get Free Diagnosis
            </a>
            <a 
              href="/book-appointment" 
              className="inline-flex items-center justify-center px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white text-lg font-semibold rounded-xl hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <i className="fas fa-calendar-check mr-3"></i>
              Book Repair Now
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
