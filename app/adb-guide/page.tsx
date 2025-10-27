'use client';

import Link from 'next/link';
import { ArrowLeft, Download, Terminal, CheckCircle, AlertCircle } from 'lucide-react';

export default function ADBGuidePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <Link
          href="/device-detection"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Device Detection
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full mb-4">
              <Terminal className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">ADB Installation Guide</h1>
            <p className="text-xl text-gray-600">
              Complete step-by-step instructions for Windows & Mac
            </p>
          </div>

          {/* Table of Contents */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
            <h2 className="font-bold text-lg text-blue-900 mb-4">📋 Table of Contents</h2>
            <ul className="space-y-2 text-blue-800">
              <li><a href="#what-is-adb" className="hover:underline">1. What is ADB?</a></li>
              <li><a href="#windows" className="hover:underline">2. Windows Installation</a></li>
              <li><a href="#mac" className="hover:underline">3. Mac Installation</a></li>
              <li><a href="#enable-usb" className="hover:underline">4. Enable USB Debugging</a></li>
              <li><a href="#commands" className="hover:underline">5. Common ADB Commands</a></li>
              <li><a href="#troubleshooting" className="hover:underline">6. Troubleshooting</a></li>
            </ul>
          </div>

          {/* What is ADB */}
          <section id="what-is-adb" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">What is ADB?</h2>
            <p className="text-gray-700 mb-4">
              <strong>ADB (Android Debug Bridge)</strong> is a command-line tool that allows you to communicate with Android devices. It's essential for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-gray-700 ml-4">
              <li>Getting detailed device information (IMEI, Android version, battery status)</li>
              <li>Installing/uninstalling apps</li>
              <li>Debugging applications</li>
              <li>Accessing device shell</li>
              <li>Transferring files</li>
            </ul>
          </section>

          {/* Windows Installation */}
          <section id="windows" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">🪟 Windows Installation</h2>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Method 1: Platform Tools (Recommended)</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Step 1: Download</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                    <li>Go to: <a href="https://developer.android.com/studio/releases/platform-tools" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Android Platform Tools</a></li>
                    <li>Click "Download SDK Platform-Tools for Windows"</li>
                    <li>Accept terms and download (10-15 MB)</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Step 2: Extract Files</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                    <li>Locate downloaded ZIP file (usually in Downloads)</li>
                    <li>Right-click → "Extract All..."</li>
                    <li>Choose destination: <code className="bg-gray-200 px-2 py-1 rounded">C:\platform-tools</code></li>
                    <li>Click "Extract"</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Step 3: Add to PATH</h4>
                  <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                    <li>Press Windows + S (search)</li>
                    <li>Type: "environment variables"</li>
                    <li>Click "Edit the system environment variables"</li>
                    <li>Click "Environment Variables" button</li>
                    <li>In "System variables", find and select "Path"</li>
                    <li>Click "Edit" → "New"</li>
                    <li>Type: <code className="bg-gray-200 px-2 py-1 rounded">C:\platform-tools</code></li>
                    <li>Click OK on all windows</li>
                  </ol>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Step 4: Verify Installation</h4>
                  <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
                    <div># Open Command Prompt (Windows + R, type "cmd")</div>
                    <div className="mt-2">adb version</div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    ✅ Expected: You should see "Android Debug Bridge version 1.0.41..."
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Method 2: Chocolatey (Alternative)</h3>
              <p className="text-gray-700 mb-4">If you have Chocolatey installed:</p>
              <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
                <div>choco install adb</div>
                <div className="mt-2">adb version</div>
              </div>
            </div>
          </section>

          {/* Mac Installation */}
          <section id="mac" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">🍎 Mac Installation</h2>
            
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border-l-4 border-green-500 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Method 1: Homebrew (Easiest)</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Step 1: Install Homebrew (if needed)</h4>
                  <p className="text-gray-700 mb-2">Check if Homebrew is installed:</p>
                  <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm mb-2">
                    <div>brew --version</div>
                  </div>
                  <p className="text-gray-700 mb-2">If not installed, run:</p>
                  <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
                    <div>/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Step 2: Install ADB</h4>
                  <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
                    <div>brew install android-platform-tools</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Step 3: Verify Installation</h4>
                  <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
                    <div>adb version</div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    ✅ Expected: "Android Debug Bridge version 1.0.41..."
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Method 2: Manual Installation</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Download & Extract</h4>
                  <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
                    <div>cd ~/Downloads</div>
                    <div>unzip platform-tools-latest-darwin.zip</div>
                    <div>sudo mv platform-tools /usr/local/</div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">Add to PATH</h4>
                  <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
                    <div>echo 'export PATH=$PATH:/usr/local/platform-tools' &gt;&gt; ~/.zshrc</div>
                    <div>source ~/.zshrc</div>
                    <div className="mt-2">adb version</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Enable USB Debugging */}
          <section id="enable-usb" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">📱 Enable USB Debugging on Android</h2>
            
            <div className="bg-orange-50 border-l-4 border-orange-400 rounded-lg p-6 space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Step 1: Enable Developer Options</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                  <li>Open <strong>Settings</strong> on your Android device</li>
                  <li>Scroll to <strong>"About phone"</strong> (or "About device")</li>
                  <li>Find <strong>"Build number"</strong></li>
                  <li>Tap "Build number" <strong>7 times</strong> rapidly</li>
                  <li>Enter PIN/password if prompted</li>
                  <li>You'll see: "You are now a developer!"</li>
                </ol>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Step 2: Enable USB Debugging</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                  <li>Go back to Settings</li>
                  <li>Find and tap <strong>"Developer options"</strong></li>
                  <li>Toggle ON: "Developer options"</li>
                  <li>Scroll down and find <strong>"USB debugging"</strong></li>
                  <li>Toggle ON: "USB debugging"</li>
                  <li>Tap OK on the warning dialog</li>
                </ol>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Step 3: Connect & Authorize</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                  <li>Connect your device to computer via USB cable</li>
                  <li>Unlock your device</li>
                  <li>On device, you'll see: "Allow USB debugging?"</li>
                  <li>✅ Check "Always allow from this computer"</li>
                  <li>Tap "OK" or "Allow"</li>
                </ol>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Step 4: Verify Connection</h3>
                <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm">
                  <div>adb devices</div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  ✅ Expected output: Your device serial number followed by "device"
                </p>
              </div>
            </div>
          </section>

          {/* Common Commands */}
          <section id="commands" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">🔧 Common ADB Commands</h2>
            
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Basic Device Information</h3>
                <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm space-y-2">
                  <div># Check connected devices</div>
                  <div>adb devices</div>
                  <div className="mt-4"># Get device model</div>
                  <div>adb shell getprop ro.product.model</div>
                  <div className="mt-4"># Get Android version</div>
                  <div>adb shell getprop ro.build.version.release</div>
                  <div className="mt-4"># Get manufacturer</div>
                  <div>adb shell getprop ro.product.manufacturer</div>
                </div>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">Advanced Information</h3>
                <div className="bg-gray-900 text-green-400 p-4 rounded font-mono text-sm space-y-2">
                  <div># Get all device properties</div>
                  <div>adb shell getprop</div>
                  <div className="mt-4"># Get IMEI (requires authorization)</div>
                  <div>adb shell service call iphonesubinfo 1</div>
                  <div className="mt-4"># Get battery information</div>
                  <div>adb shell dumpsys battery</div>
                  <div className="mt-4"># Get storage information</div>
                  <div>adb shell df</div>
                  <div className="mt-4"># Get RAM information</div>
                  <div>adb shell cat /proc/meminfo</div>
                  <div className="mt-4"># Get screen resolution</div>
                  <div>adb shell wm size</div>
                </div>
              </div>
            </div>
          </section>

          {/* Troubleshooting */}
          <section id="troubleshooting" className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">🔍 Troubleshooting</h2>
            
            <div className="space-y-4">
              <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-6">
                <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  "adb is not recognized" (Windows)
                </h3>
                <p className="text-red-800 mb-2"><strong>Solution:</strong></p>
                <ol className="list-decimal list-inside space-y-1 text-red-800 ml-4">
                  <li>Verify ADB location: <code>C:\platform-tools\adb.exe</code></li>
                  <li>Re-add to PATH (see Step 3 above)</li>
                  <li>Restart Command Prompt</li>
                  <li>Try full path: <code>C:\platform-tools\adb.exe version</code></li>
                </ol>
              </div>

              <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-6">
                <h3 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  "command not found: adb" (Mac)
                </h3>
                <p className="text-red-800 mb-2"><strong>Solution:</strong></p>
                <div className="bg-gray-900 text-green-400 p-3 rounded font-mono text-sm mb-2">
                  <div># Reinstall via Homebrew</div>
                  <div>brew install android-platform-tools</div>
                  <div className="mt-2"># Or add to PATH manually</div>
                  <div>echo 'export PATH=$PATH:/usr/local/platform-tools' &gt;&gt; ~/.zshrc</div>
                  <div>source ~/.zshrc</div>
                </div>
              </div>

              <div className="bg-orange-50 border-l-4 border-orange-400 rounded-lg p-6">
                <h3 className="font-bold text-orange-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Device shows "unauthorized"
                </h3>
                <p className="text-orange-800 mb-2"><strong>Solution:</strong></p>
                <ol className="list-decimal list-inside space-y-1 text-orange-800 ml-4">
                  <li>Disconnect device</li>
                  <li>Settings → Developer Options → Revoke USB debugging authorizations</li>
                  <li>Reconnect device</li>
                  <li>Accept authorization popup</li>
                </ol>
              </div>

              <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6">
                <h3 className="font-bold text-yellow-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Device not detected
                </h3>
                <p className="text-yellow-800 mb-2"><strong>Solutions:</strong></p>
                <ul className="list-disc list-inside space-y-1 text-yellow-800 ml-4">
                  <li>Try different USB cable (use original if possible)</li>
                  <li>Try different USB port (avoid USB hubs)</li>
                  <li>Enable "File Transfer" mode on Android</li>
                  <li>Install device-specific USB drivers (Windows)</li>
                  <li>Restart both device and computer</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Download Links */}
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">📥 Download Links</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <a href="https://developer.android.com/studio/releases/platform-tools" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
                <Download className="w-6 h-6 text-blue-600" />
                <div>
                  <div className="font-semibold text-gray-900">Windows Platform Tools</div>
                  <div className="text-sm text-gray-600">Official Download</div>
                </div>
              </a>
              <a href="https://developer.android.com/studio/releases/platform-tools" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
                <Download className="w-6 h-6 text-green-600" />
                <div>
                  <div className="font-semibold text-gray-900">Mac Platform Tools</div>
                  <div className="text-sm text-gray-600">Official Download</div>
                </div>
              </a>
            </div>
          </section>

          {/* Back Link */}
          <div className="text-center pt-8 border-t border-gray-200">
            <Link
              href="/device-detection"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Device Detection
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
