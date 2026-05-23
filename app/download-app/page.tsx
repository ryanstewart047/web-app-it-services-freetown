'use client';

import { Download, CheckCircle, Smartphone, Shield, Zap, Database, Monitor, ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import PageBanner from '@/components/PageBanner';

import {
  CURRENT_RELEASE_VERSION,
  GITHUB_RELEASES_URL,
  GITHUB_REPOSITORY_URL,
  downloadAssets,
} from '@/lib/device-detector-release';
import type { PlatformKey } from '@/lib/device-detector-release';

interface DownloadStatsResponse {
  assetCounts: Record<string, number>;
  totalDownloads: number;
  releaseTag: string;
  publishedAt?: string;
  source: 'github';
}

export default function DownloadAppPage() {
  const [os, setOS] = useState<PlatformKey>('windows');
  const [downloadStats, setDownloadStats] = useState<DownloadStatsResponse | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const selectedDownloads = downloadAssets[os];

  useEffect(() => {
    let isMounted = true;

    const loadDownloadStats = async () => {
      try {
        const response = await fetch('/api/download-app/stats');
        if (!response.ok) {
          throw new Error(`Failed to load download stats (${response.status})`);
        }

        const data = (await response.json()) as DownloadStatsResponse;
        if (isMounted) {
          setDownloadStats(data);
        }
      } catch (error) {
        console.error('Failed to load download stats:', error);
      } finally {
        if (isMounted) {
          setIsLoadingStats(false);
        }
      }
    };

    loadDownloadStats();

    return () => {
      isMounted = false;
    };
  }, []);

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
      <PageBanner
        title="IT Services Device Detector"
        subtitle="Professional desktop application for complete Android device diagnostics. Get IMEI, hardware specs, battery stats, and 50+ device properties!"
        icon="fas fa-desktop"
      />

      <div className="container mx-auto px-4 py-16">
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
                <div className="mb-3 flex justify-center">
                  <WindowsLogo className="h-10 w-10 text-white" />
                </div>
                <div className="text-lg font-semibold text-white">Windows</div>
                <div className="text-sm text-gray-400">10, 11 (64-bit)</div>
              </button>
              <button
                disabled
                aria-disabled="true"
                title="macOS download is not available yet"
                className="cursor-not-allowed rounded-xl border-2 border-gray-700 bg-gray-700/20 p-6 opacity-60 transition-all"
              >
                <div className="mb-3 flex justify-center">
                  <AppleLogo className="h-10 w-10 text-gray-200" />
                </div>
                <div className="text-lg font-semibold text-white">macOS</div>
                <div className="text-sm text-gray-400">Coming soon</div>
              </button>
              <button
                disabled
                aria-disabled="true"
                title="Linux download is not available yet"
                className="cursor-not-allowed rounded-xl border-2 border-gray-700 bg-gray-700/20 p-6 opacity-60 transition-all"
              >
                <div className="mb-3 flex justify-center">
                  <Monitor className="h-10 w-10 text-gray-200" />
                </div>
                <div className="text-lg font-semibold text-white">Linux</div>
                <div className="text-sm text-gray-400">Coming soon</div>
              </button>
            </div>

            {/* Download Buttons */}
            <div className="space-y-4">
              {selectedDownloads.map((asset) => (
                <a
                  key={asset.label}
                  href={asset.href}
                  className={`flex items-center justify-between px-8 py-4 rounded-xl transition-all ${
                    asset.featured
                      ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white transform hover:scale-105 shadow-lg'
                      : 'bg-gray-700 hover:bg-gray-600 text-white'
                  }`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="flex items-center gap-3">
                    <Download className="w-6 h-6" />
                    <div className="text-left">
                      <div className={`font-bold ${asset.featured ? 'text-lg' : ''}`}>{asset.label}</div>
                      <div className={`text-sm ${asset.featured ? 'text-blue-100' : 'text-gray-300'}`}>
                        {asset.description}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm ${asset.featured ? 'text-blue-100' : 'text-gray-300'}`}>{asset.size}</div>
                    <div className={`mt-2 text-xs font-semibold ${asset.featured ? 'text-blue-200' : 'text-gray-400'}`}>
                      {formatDownloadCount(downloadStats?.assetCounts[asset.id], isLoadingStats)}
                    </div>
                  </div>
                </a>
              ))}
            </div>

            {/* Release Status Notice */}
            <div className="mt-6 p-4 bg-green-500/10 border-2 border-green-500/50 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="text-2xl">✅</div>
                <div className="flex-1">
                  <p className="text-green-200 font-bold mb-2">
                    Windows Download Available
                  </p>
                  <p className="text-green-200 text-sm mb-2">
                    Download the latest Windows version of IT Services Device Detector from our official GitHub release.
                  </p>
                  <p className="mb-2 inline-flex rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-200">
                    {formatTotalDownloadCount(downloadStats?.totalDownloads, isLoadingStats)}
                  </p>
                  <p className="text-green-300 text-xs">
                    Fast, direct download with official release tracking.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-yellow-200 text-sm">
                ⚠️ <strong>Important:</strong> ADB (Android Debug Bridge) must be installed separately. 
                <a href="/adb-guide" className="text-yellow-400 hover:text-yellow-300 underline ml-1">
                  View installation guide →
                </a>
              </p>
            </div>

            {/* Alternate: Or wait for official release */}
            <div className="mt-4 p-3 bg-gray-800/50 border border-gray-700 rounded-lg">
              <p className="text-gray-300 text-xs text-center">
                💡 <strong>Need source code or future builds?</strong> Visit the
                <a 
                  href={GITHUB_REPOSITORY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline mx-1"
                >
                  GitHub repository
                </a>
                or browse
                <a
                  href={GITHUB_RELEASES_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline mx-1"
                >
                  all releases
                </a>
                for updates.
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

function formatDownloadCount(count: number | undefined, isLoading: boolean) {
  if (typeof count === 'number') {
    return `${count.toLocaleString()} GitHub download${count === 1 ? '' : 's'}`;
  }

  if (isLoading) {
    return 'Loading download count...';
  }

  return 'GitHub count unavailable';
}

function formatTotalDownloadCount(count: number | undefined, isLoading: boolean) {
  if (typeof count === 'number') {
    return `Official GitHub downloads: ${count.toLocaleString()}`;
  }

  if (isLoading) {
    return 'Loading official GitHub downloads...';
  }

  return 'Official GitHub download count unavailable';
}

function WindowsLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M1 3.5 10.5 2v9H1v-7.5Zm10.5 7.5H23V0L11.5 1.7V11ZM1 12.9h9.5V22L1 20.5v-7.6Zm10.5 0H23V24l-11.5-1.7v-9.4Z" />
    </svg>
  );
}

function AppleLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M16.37 12.58c.03 3.12 2.73 4.16 2.76 4.17-.02.07-.43 1.5-1.42 2.97-.86 1.27-1.75 2.53-3.16 2.56-1.39.03-1.84-.82-3.43-.82-1.6 0-2.09.8-3.4.85-1.36.05-2.4-1.37-3.27-2.63-1.78-2.57-3.13-7.27-1.31-10.43.9-1.57 2.53-2.57 4.3-2.59 1.34-.03 2.61.91 3.43.91.82 0 2.37-1.12 3.99-.96.68.03 2.59.28 3.81 2.06-.1.06-2.27 1.32-2.3 3.91ZM14.79 4.79c.72-.88 1.2-2.1 1.07-3.29-1.04.04-2.3.69-3.05 1.57-.67.77-1.25 2.01-1.09 3.2 1.16.09 2.35-.59 3.07-1.48Z" />
    </svg>
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
