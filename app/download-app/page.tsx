'use client';

import { Download, CheckCircle, Smartphone, Shield, Zap, Database, Monitor, ArrowRight } from 'lucide-react';
import { useState } from 'react';

export default function DownloadAppPage() {
  const [os, setOS] = useState<'windows' | 'mac' | 'linux'>('windows');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <a href="/" className="inline-flex items-center text-blue-400 hover:text-blue-300 transition-colors">
          <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
          Back to Home
        </a>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl mb-6">
            <Monitor className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white mb-6">
            IT Services Device Detector
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-4">
            Professional desktop application for complete Android device diagnostics
          </p>
          <p className="text-lg text-blue-400 font-semibold">
            Get IMEI, hardware specs, battery stats, and 50+ device properties!
          </p>
        </div>

        {/* OS Selection */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">
              Choose Your Operating System
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <button
                onClick={() => setOS('windows')}
                className={`p-6 rounded-xl border-2 transition-all ${
                  os === 'windows'
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                }`}
              >
                <div className="text-4xl mb-3">🪟</div>
                <div className="text-lg font-semibold text-white">Windows</div>
                <div className="text-sm text-gray-400">10, 11 (64-bit)</div>
              </button>
              <button
                onClick={() => setOS('mac')}
                className={`p-6 rounded-xl border-2 transition-all ${
                  os === 'mac'
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                }`}
              >
                <div className="text-4xl mb-3">🍎</div>
                <div className="text-lg font-semibold text-white">macOS</div>
                <div className="text-sm text-gray-400">10.13+</div>
              </button>
              <button
                onClick={() => setOS('linux')}
                className={`p-6 rounded-xl border-2 transition-all ${
                  os === 'linux'
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'
                }`}
              >
                <div className="text-4xl mb-3">🐧</div>
                <div className="text-lg font-semibold text-white">Linux</div>
                <div className="text-sm text-gray-400">Ubuntu, Fedora, Debian</div>
              </button>
            </div>

            {/* Download Buttons */}
            <div className="space-y-4">
              {os === 'windows' && (
                <>
                  <a
                    href="#download"
                    className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-8 py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Download className="w-6 h-6" />
                      <div className="text-left">
                        <div className="font-bold text-lg">Windows Installer</div>
                        <div className="text-sm text-blue-100">Recommended - Full installation with shortcuts</div>
                      </div>
                    </div>
                    <div className="text-sm text-blue-100">~85 MB</div>
                  </a>
                  <a
                    href="#download"
                    className="flex items-center justify-between bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-xl transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Download className="w-6 h-6" />
                      <div className="text-left">
                        <div className="font-bold">Windows Portable</div>
                        <div className="text-sm text-gray-300">No installation required - Run anywhere</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-300">~85 MB</div>
                  </a>
                </>
              )}
              {os === 'mac' && (
                <>
                  <a
                    href="#download"
                    className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-8 py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Download className="w-6 h-6" />
                      <div className="text-left">
                        <div className="font-bold text-lg">macOS DMG</div>
                        <div className="text-sm text-blue-100">Recommended - Drag and drop installation</div>
                      </div>
                    </div>
                    <div className="text-sm text-blue-100">~90 MB</div>
                  </a>
                  <a
                    href="#download"
                    className="flex items-center justify-between bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-xl transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Download className="w-6 h-6" />
                      <div className="text-left">
                        <div className="font-bold">macOS ZIP</div>
                        <div className="text-sm text-gray-300">Portable archive</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-300">~90 MB</div>
                  </a>
                </>
              )}
              {os === 'linux' && (
                <>
                  <a
                    href="#download"
                    className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-8 py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg"
                  >
                    <div className="flex items-center gap-3">
                      <Download className="w-6 h-6" />
                      <div className="text-left">
                        <div className="font-bold text-lg">Linux AppImage</div>
                        <div className="text-sm text-blue-100">Recommended - Universal, run anywhere</div>
                      </div>
                    </div>
                    <div className="text-sm text-blue-100">~95 MB</div>
                  </a>
                  <a
                    href="#download"
                    className="flex items-center justify-between bg-gray-700 hover:bg-gray-600 text-white px-8 py-4 rounded-xl transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <Download className="w-6 h-6" />
                      <div className="text-left">
                        <div className="font-bold">Debian Package (.deb)</div>
                        <div className="text-sm text-gray-300">For Ubuntu, Debian, Linux Mint</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-300">~95 MB</div>
                  </a>
                </>
              )}
            </div>

            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-200 text-sm">
                ⚠️ <strong>Important:</strong> ADB (Android Debug Bridge) must be installed separately. 
                <a href="/adb-guide" className="text-yellow-400 hover:text-yellow-300 underline ml-1">
                  View installation guide →
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="max-w-6xl mx-auto mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Why Use the Desktop App?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard
              icon={<Smartphone className="w-8 h-8" />}
              title="Complete Device Info"
              description="Access 50+ device properties including IMEI, model, specs, and more"
              color="blue"
            />
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="100% Private"
              description="All processing happens locally. No data sent to servers"
              color="green"
            />
            <FeatureCard
              icon={<Zap className="w-8 h-8" />}
              title="Lightning Fast"
              description="Gather complete device information in just seconds"
              color="yellow"
            />
            <FeatureCard
              icon={<Database className="w-8 h-8" />}
              title="Export Data"
              description="Save device info as JSON or TXT files for records"
              color="purple"
            />
            <FeatureCard
              icon={<Monitor className="w-8 h-8" />}
              title="Professional UI"
              description="Beautiful dark mode interface with smooth animations"
              color="pink"
            />
            <FeatureCard
              icon={<CheckCircle className="w-8 h-8" />}
              title="No Limitations"
              description="Unlike web browsers, desktop app has full system access"
              color="indigo"
            />
          </div>
        </div>

        {/* Information Sections */}
        <div className="max-w-4xl mx-auto space-y-8">
          {/* What You Get */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Device Information You'll Get</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoItem text="Model & Manufacturer" />
              <InfoItem text="IMEI (both SIM slots)" />
              <InfoItem text="Android Version & SDK" />
              <InfoItem text="Build Number & Security Patch" />
              <InfoItem text="CPU Architecture & Hardware" />
              <InfoItem text="Screen Resolution & Density" />
              <InfoItem text="RAM (Total, Free, Available)" />
              <InfoItem text="Internal & SD Card Storage" />
              <InfoItem text="Battery (Level, Health, Temp)" />
              <InfoItem text="WiFi MAC & IP Address" />
              <InfoItem text="Serial Number & Fingerprint" />
              <InfoItem text="Timezone, Locale & Uptime" />
            </div>
          </div>

          {/* System Requirements */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">System Requirements</h3>
            <div className="space-y-4 text-gray-300">
              <div>
                <strong className="text-white">Operating System:</strong>
                <ul className="ml-6 mt-2 space-y-1">
                  <li>• Windows 10 or 11 (64-bit)</li>
                  <li>• macOS 10.13 (High Sierra) or later</li>
                  <li>• Linux (Ubuntu 18.04+, Fedora 32+, or equivalent)</li>
                </ul>
              </div>
              <div>
                <strong className="text-white">Prerequisites:</strong>
                <ul className="ml-6 mt-2 space-y-1">
                  <li>• ADB (Android Debug Bridge) installed</li>
                  <li>• USB cable to connect Android device</li>
                  <li>• USB Debugging enabled on Android device</li>
                </ul>
              </div>
              <div>
                <strong className="text-white">Disk Space:</strong> ~100 MB free space
              </div>
            </div>
          </div>

          {/* Quick Start */}
          <div className="bg-gradient-to-br from-blue-900/50 to-purple-900/50 backdrop-blur-sm border border-blue-700 rounded-2xl p-8">
            <h3 className="text-2xl font-bold text-white mb-6">Quick Start Guide</h3>
            <ol className="space-y-4 text-gray-200">
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold">1</span>
                <div>
                  <strong className="text-white">Install ADB</strong>
                  <p className="text-sm text-gray-300 mt-1">Download and install Android Debug Bridge on your computer</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold">2</span>
                <div>
                  <strong className="text-white">Download & Install App</strong>
                  <p className="text-sm text-gray-300 mt-1">Choose your OS above and download the appropriate installer</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold">3</span>
                <div>
                  <strong className="text-white">Enable USB Debugging</strong>
                  <p className="text-sm text-gray-300 mt-1">Enable Developer Options on your Android device and turn on USB Debugging</p>
                </div>
              </li>
              <li className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center font-bold">4</span>
                <div>
                  <strong className="text-white">Connect & Scan</strong>
                  <p className="text-sm text-gray-300 mt-1">Connect your device via USB, launch the app, and see instant results!</p>
                </div>
              </li>
            </ol>
          </div>

          {/* Source Code */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Open Source</h3>
            <p className="text-gray-300 mb-6">
              This application is open source. You can view the code, contribute, or build it yourself.
            </p>
            <a
              href="https://github.com/ryanstewart047/web-app-it-services-freetown/tree/main/desktop-app"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-all"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.840 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.430.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              View on GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

function FeatureCard({ icon, title, description, color }: FeatureCardProps) {
  const colorClasses: Record<string, string> = {
    blue: 'from-blue-600 to-blue-500',
    green: 'from-green-600 to-green-500',
    yellow: 'from-yellow-600 to-yellow-500',
    purple: 'from-purple-600 to-purple-500',
    pink: 'from-pink-600 to-pink-500',
    indigo: 'from-indigo-600 to-indigo-500',
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-gray-600 transition-all">
      <div className={`inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br ${colorClasses[color]} rounded-lg mb-4`}>
        <div className="text-white">{icon}</div>
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
}

function InfoItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2 text-gray-300">
      <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
      <span>{text}</span>
    </div>
  );
}
