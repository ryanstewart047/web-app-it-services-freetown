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
    <section className="py-12 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Freetown-Specific Issues */}
        <div className="bg-gradient-to-r from-[#040e40] to-[#0a1a5c] rounded-3xl shadow-2xl p-12 text-white">
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
      </div>
    </section>
  );
}
