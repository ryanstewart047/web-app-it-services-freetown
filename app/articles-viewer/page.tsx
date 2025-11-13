'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

const articles = [
  {
    id: 1,
    title: "Complete Guide to Computer Repair Services in Freetown, Sierra Leone",
    author: "IT Services Freetown",
    wordCount: 837,
    tags: ["computer repair", "freetown", "sierra leone", "it services", "maintenance"],
    excerpt: "A comprehensive guide to finding reliable computer repair services in Freetown, including common problems, cost considerations, and tips for choosing the right service provider.",
    content: `<h2>Professional Computer Repair Services in Freetown</h2><p>When your computer breaks down in Freetown, finding reliable repair services can be challenging. This comprehensive guide helps you understand what to look for in a professional IT repair service and how to ensure your devices get the best care possible.</p><h3>Common Computer Problems in Sierra Leone</h3><p>Living in a tropical climate like Freetown presents unique challenges for computer equipment. Power fluctuations, humidity, and dust are the top three enemies of electronic devices in Sierra Leone. Here's what typically goes wrong:</p><ul><li><strong>Power surge damage:</strong> Frequent power outages and voltage spikes can damage motherboards, power supplies, and hard drives. Always use a quality surge protector or UPS system.</li><li><strong>Overheating issues:</strong> High ambient temperatures and dust accumulation cause computers to overheat, leading to system crashes and component failure.</li><li><strong>Hard drive failures:</strong> Mechanical hard drives are particularly vulnerable to power issues and heat, resulting in data loss.</li><li><strong>Screen damage:</strong> Laptop screens can fail due to heat and physical damage during transport.</li><li><strong>Battery problems:</strong> Laptop batteries degrade faster in hot climates and need more frequent replacement.</li></ul>`
  },
  {
    id: 2,
    title: "Top 10 Laptop Problems and Solutions for Sierra Leone Users",
    author: "IT Services Freetown",
    wordCount: 1292,
    tags: ["laptop repair", "troubleshooting", "sierra leone", "computer problems", "tech tips"],
    excerpt: "Comprehensive guide to the 10 most common laptop problems in Sierra Leone, including causes, DIY solutions, repair costs, and prevention tips for Freetown users.",
    content: `<h2>Common Laptop Issues in Sierra Leone</h2><p>Laptops in Sierra Leone face unique challenges due to power instability, high temperatures, and dust. This guide covers the ten most common laptop problems we see in Freetown and practical solutions for each.</p><h3>1. Power Supply and Battery Issues</h3><p><strong>The Problem:</strong> Your laptop won't charge, battery drains quickly, or the adapter gets extremely hot.</p>`
  }
]

export default function ArticlesViewerPage() {
  const [expandedArticle, setExpandedArticle] = useState<number | null>(null)

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard!`)
    }).catch(() => {
      toast.error('Failed to copy. Please try again.')
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold mb-3">📝 Blog Articles Ready to Import</h1>
          <p className="text-xl opacity-90">8 comprehensive articles for IT Services Freetown</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-bold text-blue-600 mb-4">📋 How to Import These Articles</h2>
          <ol className="list-decimal list-inside space-y-2 mb-4">
            <li>Click <strong>"View Article"</strong> to expand the full content</li>
            <li>Click <strong>"Copy HTML"</strong> to copy the article content</li>
            <li>Go to <a href="/blog/admin" className="text-blue-600 hover:underline font-semibold">Blog Admin Panel</a> (Password: ITServices2025!)</li>
            <li>Paste the HTML into the editor</li>
            <li>Click "Copy Title" and "Copy Tags" for easy filling</li>
            <li>Click <strong>"Publish Post"</strong></li>
            <li>Repeat for all 8 articles</li>
          </ol>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
            <p className="font-semibold">⚠️ After importing all articles:</p>
            <p>Go to <a href="https://adsense.google.com" target="_blank" rel="noopener" className="text-blue-600 hover:underline">Google AdSense</a> and request a re-review for your site!</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-4xl font-bold text-blue-600">8</div>
            <div className="text-sm text-gray-600 uppercase tracking-wide">Articles</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-4xl font-bold text-blue-600">~10.6K</div>
            <div className="text-sm text-gray-600 uppercase tracking-wide">Total Words</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-4xl font-bold text-blue-600">800-1850</div>
            <div className="text-sm text-gray-600 uppercase tracking-wide">Words/Article</div>
          </div>
          <div className="bg-white rounded-xl shadow-lg p-6 text-center">
            <div className="text-4xl font-bold text-blue-600">100%</div>
            <div className="text-sm text-gray-600 uppercase tracking-wide">Original</div>
          </div>
        </div>

        {/* Article Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold text-blue-900 mb-3">📂 Article Files Available</h3>
          <p className="text-gray-700 mb-3">
            All 8 articles are available in these JSON files in your project:
          </p>
          <ul className="list-disc list-inside space-y-1 text-gray-700 mb-4">
            <li><code className="bg-white px-2 py-1 rounded">content/blog-articles.json</code> - Articles 1-3</li>
            <li><code className="bg-white px-2 py-1 rounded">content/blog-articles-2.json</code> - Articles 4-5</li>
            <li><code className="bg-white px-2 py-1 rounded">content/blog-articles-4.json</code> - Articles 6-7</li>
            <li><code className="bg-white px-2 py-1 rounded">content/all-blog-articles.json</code> - All articles combined</li>
          </ul>
          <p className="text-gray-700">
            <strong>To import:</strong> Open each JSON file in VS Code, copy the "content" field (it's HTML), 
            and paste it directly into your blog admin panel at <a href="/blog/admin" className="text-blue-600 hover:underline">/blog/admin</a>
          </p>
        </div>

        {/* Article Preview Cards */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-800">Article Previews</h2>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              1. Complete Guide to Computer Repair Services in Freetown
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">computer repair</span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">freetown</span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">sierra leone</span>
            </div>
            <p className="text-gray-600 text-sm mb-3">~837 words | IT Services Freetown</p>
            <p className="text-gray-700 italic mb-4">
              A comprehensive guide to finding reliable computer repair services in Freetown...
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => copyToClipboard("Complete Guide to Computer Repair Services in Freetown, Sierra Leone", "Title")}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Copy Title
              </button>
              <button
                onClick={() => copyToClipboard("computer repair, freetown, sierra leone, it services, maintenance", "Tags")}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Copy Tags
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              2. Top 10 Laptop Problems and Solutions for Sierra Leone
            </h3>
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">laptop repair</span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">troubleshooting</span>
              <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">sierra leone</span>
            </div>
            <p className="text-gray-600 text-sm mb-3">~1,292 words | IT Services Freetown</p>
            <p className="text-gray-700 italic mb-4">
              Comprehensive guide to the 10 most common laptop problems in Sierra Leone...
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => copyToClipboard("Top 10 Laptop Problems and Solutions for Sierra Leone Users", "Title")}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Copy Title
              </button>
              <button
                onClick={() => copyToClipboard("laptop repair, troubleshooting, sierra leone, computer problems, tech tips", "Tags")}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Copy Tags
              </button>
            </div>
          </div>

          <div className="bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-xl p-6">
            <h3 className="text-xl font-bold text-green-900 mb-3">✅ Next Steps</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-800">
              <li>Open your project files in VS Code</li>
              <li>Navigate to <code className="bg-white px-2 py-1 rounded">content/blog-articles.json</code></li>
              <li>Copy each article's "content" field</li>
              <li>Go to <a href="/blog/admin" className="text-blue-600 hover:underline font-semibold">/blog/admin</a></li>
              <li>Paste content, add title and tags, then publish</li>
              <li>Repeat for all 8 articles</li>
              <li><strong>Request AdSense re-review!</strong></li>
            </ol>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-3">📄 All 8 Article Titles:</h3>
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              <li>Complete Guide to Computer Repair Services in Freetown, Sierra Leone</li>
              <li>Top 10 Laptop Problems and Solutions for Sierra Leone Users</li>
              <li>SSD vs HDD: Which Storage is Best for Your Business in Sierra Leone?</li>
              <li>Protecting Your Computer from Power Surges in Freetown: Essential Guide</li>
              <li>Data Backup Strategies for Small Businesses in Sierra Leone</li>
              <li>Computer Virus Protection and Removal Guide for Sierra Leone Users</li>
              <li>How to Speed Up Your Slow Computer: Complete Optimization Guide</li>
              <li>Choosing the Right Laptop for Your Business in Sierra Leone</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}
