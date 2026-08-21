'use client';

import React, { useState, useEffect, useRef, type CSSProperties } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Share2,
  Download,
  Copy,
  Check,
  ExternalLink,
  Search,
  Image as ImageIcon,
  Upload,
  ZoomIn,
  ZoomOut,
  Move,
  RefreshCw,
  Eye,
  MessageCircle,
  Smartphone,
  Globe,
  Tag,
  Sparkles,
  Link2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import html2canvas from 'html2canvas';

type ImageFit = 'contain' | 'cover';

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  comparePrice?: number;
  condition: string;
  brand?: string;
  images: { url: string; alt?: string; order: number }[];
  category: { name: string };
}

interface BlogPost {
  id: string;
  title: string;
  author: string;
  date: string;
  content: string;
  image?: string;
  likes: number;
}

const clampNumber = (value: unknown, min: number, max: number, fallback: number) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue)) return fallback;
  return Math.min(max, Math.max(min, numericValue));
};

const getImageStyle = (
  imageFit: ImageFit,
  imageScale: number,
  imagePositionX: number,
  imagePositionY: number
): CSSProperties => ({
  width: '100%',
  height: '100%',
  objectFit: imageFit,
  objectPosition: `${imagePositionX}% ${imagePositionY}%`,
  transform: `scale(${imageScale / 100})`,
  transformOrigin: `${imagePositionX}% ${imagePositionY}%`,
});

export default function SocialSharingAdminPage() {
  // Main form fields
  const [title, setTitle] = useState('Apple iPhone 15 Pro Max - 256GB Natural Titanium');
  const [description, setDescription] = useState('Brand new, factory unlocked with 1-year Apple warranty. In stock now at BridgeTech IT Services.');
  const [price, setPrice] = useState('24,500,000');
  const [tagText, setTagText] = useState('✨ BRAND NEW');
  const [landingUrl, setLandingUrl] = useState('https://www.itservicesfreetown.com/marketplace');

  // Image controls
  const [imageUrl, setImageUrl] = useState('/assets/images/slide01.jpg');
  const [imageFit, setImageFit] = useState<ImageFit>('contain');
  const [imageScale, setImageScale] = useState(100);
  const [imagePositionX, setImagePositionX] = useState(50);
  const [imagePositionY, setImagePositionY] = useState(50);

  // Card theme styling
  const [cardTheme, setCardTheme] = useState<'navy' | 'dark' | 'emerald' | 'crimson'>('navy');
  const [previewTab, setPreviewTab] = useState<'card' | 'whatsapp' | 'imessage'>('card');

  // Quick picker drawer / modal
  const [showPicker, setShowPicker] = useState(false);
  const [pickerTab, setPickerTab] = useState<'products' | 'blog'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [pickerSearch, setPickerSearch] = useState('');
  const [loadingData, setLoadingData] = useState(false);

  // Sharing states
  const [shortUrl, setShortUrl] = useState('');
  const [generatingShort, setGeneratingShort] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const cardRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getBaseUrl = () => {
    if (typeof window !== 'undefined') return window.location.origin;
    return process.env.NEXT_PUBLIC_BASE_URL || 'https://www.itservicesfreetown.com';
  };

  // Load products & blogs for quick autofill
  useEffect(() => {
    setLoadingData(true);
    Promise.all([
      fetch('/api/products?status=active').then((res) => (res.ok ? res.json() : [])),
      fetch('/api/blog').then((res) => (res.ok ? res.json() : [])),
    ])
      .then(([prods, blogs]) => {
        setProducts(Array.isArray(prods) ? prods : []);
        setBlogPosts(Array.isArray(blogs) ? blogs : blogs.posts || []);
      })
      .catch((e) => console.error(e))
      .finally(() => setLoadingData(false));
  }, []);

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 8 * 1024 * 1024) {
      toast.error('Image size must be less than 8MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setImageUrl(result);
      toast.success('Image loaded from desktop!');
    };
    reader.readAsDataURL(file);
  };

  // Apply autofill from product
  const applyProduct = (p: Product) => {
    const base = getBaseUrl();
    const rawImg = p.images?.[0]?.url || '';
    let finalImg = rawImg;
    if (finalImg.startsWith('/')) finalImg = `${base}${finalImg}`;
    if (finalImg.includes('github.com') && finalImg.includes('/blob/')) {
      finalImg = finalImg.replace('https://github.com/', 'https://raw.githubusercontent.com/').replace('/blob/', '/').replace(/[?&]raw=true/, '');
    }

    setTitle(p.name);
    setDescription(p.description ? p.description.slice(0, 140) : 'Available at BridgeTech IT Services');
    setPrice(p.price ? p.price.toLocaleString() : '0');
    setTagText(p.condition === 'new' ? '✨ BRAND NEW' : p.condition === 'refurbished' ? '♻️ REFURBISHED' : '📦 USED / TESTED');
    setLandingUrl(`${base}/marketplace/${p.slug}`);
    if (finalImg) setImageUrl(finalImg);
    setImageFit('contain');
    setImageScale(100);
    setImagePositionX(50);
    setImagePositionY(50);
    setShortUrl('');
    setShowPicker(false);
    toast.success(`Loaded "${p.name}"`);
  };

  // Apply autofill from blog
  const applyBlog = (b: BlogPost) => {
    const base = getBaseUrl();
    let img = b.image || '';
    if (!img && b.content) {
      const match = b.content.match(/<img[^>]+src=["']([^"']+)["']/i) || b.content.match(/!\[.*?\]\((.*?)\)/);
      if (match && match[1]) img = match[1];
    }
    if (img.startsWith('/')) img = `${base}${img}`;

    const excerpt = b.content ? b.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 140) : '';

    setTitle(b.title);
    setDescription(excerpt || 'Read the full guide on our official blog.');
    setPrice('');
    setTagText('📝 TECH BLOG');
    setLandingUrl(`${base}/blog/${b.id}`);
    if (img) setImageUrl(img);
    setImageFit('cover');
    setImageScale(100);
    setImagePositionX(50);
    setImagePositionY(50);
    setShortUrl('');
    setShowPicker(false);
    toast.success(`Loaded blog: "${b.title.slice(0, 30)}..."`);
  };

  const copyToClipboard = async (text: string, key: string, msg = 'Copied to clipboard!') => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-999999px';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        textarea.remove();
      }
      setCopiedKey(key);
      toast.success(msg);
      setTimeout(() => setCopiedKey(null), 2500);
    } catch {
      toast.error('Failed to copy');
    }
  };

  const generateShortLink = async () => {
    if (!landingUrl) {
      toast.error('Please specify a Landing Page URL');
      return;
    }
    setGeneratingShort(true);
    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: landingUrl }),
      });
      if (res.ok) {
        const data = await res.json();
        setShortUrl(data.shortUrl);
        toast.success('Short link generated!');
      } else {
        toast.error('Failed to generate short link');
      }
    } catch {
      toast.error('Network error creating short link');
    } finally {
      setGeneratingShort(false);
    }
  };

  const downloadCardImage = async () => {
    if (!cardRef.current) return;
    try {
      toast.loading('Rendering high-res card image...');
      const canvas = await html2canvas(cardRef.current, {
        useCORS: true,
        allowTaint: true,
        scale: 2,
        backgroundColor: '#040e40',
        logging: false,
      });
      canvas.toBlob((blob) => {
        toast.dismiss();
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `share-card-${Date.now()}.png`;
          a.click();
          URL.revokeObjectURL(url);
          toast.success('Share image downloaded!');
        }
      }, 'image/png');
    } catch (e) {
      toast.dismiss();
      toast.error('Failed to generate card image');
    }
  };

  const buildWhatsAppMessage = () => {
    const link = shortUrl || landingUrl;
    const priceText = price ? `\n💰 *Price:* Le ${price}` : '';
    const tag = tagText ? `\n🏷️ ${tagText}` : '';
    return `🔥 *${title}*${priceText}${tag}\n\n${description}\n\n👉 *View & Order Here:*\n${link}`;
  };

  const handleNativeShare = async () => {
    const waText = buildWhatsAppMessage();
    const link = shortUrl || landingUrl;

    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: waText,
          url: link,
        });
        toast.success('Shared successfully!');
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          copyToClipboard(waText, 'wa', 'Message copied to clipboard!');
        }
      }
    } else {
      copyToClipboard(waText, 'wa', 'Share message copied to clipboard!');
    }
  };

  const themeGradients = {
    navy: 'from-[#040e40] via-[#091a63] to-[#040e40]',
    dark: 'from-[#090d16] via-[#131b2e] to-[#090d16]',
    emerald: 'from-[#062c1d] via-[#0b4d34] to-[#062c1d]',
    crimson: 'from-[#3b0d11] via-[#5c131a] to-[#3b0d11]',
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      p.category?.name?.toLowerCase().includes(pickerSearch.toLowerCase())
  );

  const filteredBlogs = blogPosts.filter(
    (b) =>
      b.title.toLowerCase().includes(pickerSearch.toLowerCase()) ||
      b.author.toLowerCase().includes(pickerSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-red-600" />
                Social Share Card &amp; OG Builder
              </h1>
              <p className="text-xs text-gray-500">
                Design custom branded share cards, upload images, resize, and copy WhatsApp-ready short links
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPicker(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg hover:bg-purple-100 font-semibold text-xs transition-colors"
            >
              <Sparkles className="w-4 h-4 text-purple-600" />
              Autofill from Product / Blog
            </button>
            <button
              onClick={downloadCardImage}
              className="flex items-center gap-1.5 px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-black font-semibold text-xs shadow-sm transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Card (PNG)
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT 6 COLS: Image & Content Controls */}
          <div className="lg:col-span-6 space-y-6">
            {/* 1. Image Settings Card */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-5">
              <h3 className="text-base font-bold text-gray-900 flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="flex items-center gap-2">
                  <ImageIcon className="w-5 h-5 text-red-600" />
                  1. Share Card Image
                </span>
                <span className="text-xs text-gray-400 font-normal">Custom upload or URL</span>
              </h3>

              {/* Upload buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs shadow-sm transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Upload from Desktop
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => {
                    const url = prompt('Enter image URL (PNG, JPG, WebP):');
                    if (url) setImageUrl(url.trim());
                  }}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold text-xs transition-colors"
                >
                  <Link2 className="w-4 h-4" />
                  Paste Image URL
                </button>
              </div>

              {/* Direct image input */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Image URL</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://... or /assets/images/..."
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent font-mono"
                />
              </div>

              {/* Image Resizing & Zoom Controls */}
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="flex items-center gap-2 text-xs font-bold text-gray-900 uppercase tracking-wider">
                    <Move className="h-4 w-4 text-red-600" />
                    Image Fit &amp; Scaling
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      setImageFit('contain');
                      setImageScale(100);
                      setImagePositionX(50);
                      setImagePositionY(50);
                    }}
                    className="rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-[11px] font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                  >
                    Reset
                  </button>
                </div>

                {/* Fit buttons */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'contain' as const, label: 'Fit Inside (Contain)' },
                    { value: 'cover' as const, label: 'Fill Box (Cover)' },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setImageFit(opt.value)}
                      className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                        imageFit === opt.value
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                {/* Zoom range */}
                <div>
                  <div className="mb-1 flex items-center justify-between text-xs font-semibold text-gray-700">
                    <span>Zoom Scale</span>
                    <span>{imageScale}%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setImageScale((c) => clampNumber(c - 5, 40, 200, 100))}
                      className="rounded-lg border border-gray-300 bg-white p-1.5 text-gray-700 hover:bg-gray-100"
                    >
                      <ZoomOut className="h-3.5 w-3.5" />
                    </button>
                    <input
                      type="range"
                      min={40}
                      max={200}
                      step={5}
                      value={imageScale}
                      onChange={(e) => setImageScale(clampNumber(e.target.value, 40, 200, 100))}
                      className="w-full accent-red-600"
                    />
                    <button
                      type="button"
                      onClick={() => setImageScale((c) => clampNumber(c + 5, 40, 200, 100))}
                      className="rounded-lg border border-gray-300 bg-white p-1.5 text-gray-700 hover:bg-gray-100"
                    >
                      <ZoomIn className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>

                {/* Position X / Y */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs font-semibold text-gray-700">
                      <span>Position X</span>
                      <span>{imagePositionX}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={imagePositionX}
                      onChange={(e) => setImagePositionX(clampNumber(e.target.value, 0, 100, 50))}
                      className="w-full accent-red-600"
                    />
                  </div>
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs font-semibold text-gray-700">
                      <span>Position Y</span>
                      <span>{imagePositionY}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={imagePositionY}
                      onChange={(e) => setImagePositionY(clampNumber(e.target.value, 0, 100, 50))}
                      className="w-full accent-red-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Text & Landing Link Controls */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
              <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">
                2. Header, Description &amp; Landing Page
              </h3>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Headline / Product Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Dell Latitude 5420 Core i5 11th Gen"
                  className="w-full px-3 py-2 text-sm font-bold border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>

              {/* Tag / Condition & Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Badge / Tag</label>
                  <input
                    type="text"
                    value={tagText}
                    onChange={(e) => setTagText(e.target.value)}
                    placeholder="e.g. ✨ BRAND NEW or 20% OFF"
                    className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Price (Leones)</label>
                  <input
                    type="text"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 24,500,000"
                    className="w-full px-3 py-2 text-xs font-bold text-red-600 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Short Description (for Social Cards)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Brief high-impact product summary..."
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                />
                <div className="text-right text-[10px] text-gray-400 mt-0.5">{description.length}/160 characters</div>
              </div>

              {/* Landing Page URL */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Landing Page URL (Opens when clicked on social post)
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={landingUrl}
                      onChange={(e) => setLandingUrl(e.target.value)}
                      placeholder="https://www.itservicesfreetown.com/marketplace/..."
                      className="w-full pl-8 pr-3 py-2 text-xs font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                    <Globe className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <a
                    href={landingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                    title="Open landing link"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Card Color Theme */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Card Theme</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'navy' as const, label: 'BridgeTech Navy', bg: 'bg-[#040e40]' },
                    { id: 'dark' as const, label: 'Charcoal Dark', bg: 'bg-slate-900' },
                    { id: 'emerald' as const, label: 'Forest Green', bg: 'bg-emerald-950' },
                    { id: 'crimson' as const, label: 'Crimson Red', bg: 'bg-red-950' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setCardTheme(t.id)}
                      className={`flex items-center gap-2 px-2.5 py-2 rounded-lg border text-xs font-semibold transition-all ${
                        cardTheme === t.id
                          ? 'border-red-500 ring-2 ring-red-500/20 bg-white text-gray-900 shadow-sm'
                          : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-white'
                      }`}
                    >
                      <span className={`w-3 h-3 rounded-full ${t.bg} shrink-0`} />
                      <span className="truncate">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT 6 COLS: Live Visual Preview & Social Action Deck */}
          <div className="lg:col-span-6 space-y-6">
            {/* Visual Preview Box */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-red-600" />
                  Live Preview
                </h3>
                {/* Preview tab switcher */}
                <div className="flex bg-gray-100 p-1 rounded-lg gap-1">
                  <button
                    onClick={() => setPreviewTab('card')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                      previewTab === 'card' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    1200×630 Card
                  </button>
                  <button
                    onClick={() => setPreviewTab('whatsapp')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                      previewTab === 'whatsapp' ? 'bg-[#25D366] text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={() => setPreviewTab('imessage')}
                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${
                      previewTab === 'imessage' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    iMessage / Link
                  </button>
                </div>
              </div>

              {/* 1. 1200x630 Card Render */}
              {previewTab === 'card' && (
                <div className="overflow-hidden rounded-2xl border border-gray-300 shadow-lg">
                  <div
                    ref={cardRef}
                    className={`bg-gradient-to-br ${themeGradients[cardTheme]} p-6 text-white aspect-[1200/630] w-full flex flex-row items-center justify-between select-none relative`}
                  >
                    {/* Left Frame: Product Image */}
                    <div className="w-[42%] h-full bg-white rounded-xl p-4 flex items-center justify-center overflow-hidden shadow-2xl relative">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={title}
                          className="transition-transform duration-200"
                          style={getImageStyle(imageFit, imageScale, imagePositionX, imagePositionY)}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/assets/images/slide01.jpg';
                          }}
                        />
                      ) : (
                        <div className="text-gray-400 text-center">
                          <ImageIcon className="w-12 h-12 mx-auto mb-1 opacity-50" />
                          <span className="text-[10px]">No image</span>
                        </div>
                      )}
                    </div>

                    {/* Right Info: Details */}
                    <div className="w-[55%] h-full flex flex-col justify-between pl-4 py-1">
                      {/* Badge */}
                      <div className="flex items-center justify-between">
                        {tagText && (
                          <span className="px-2.5 py-1 bg-red-600/90 text-white font-bold text-[11px] rounded-full uppercase tracking-wider shadow">
                            {tagText}
                          </span>
                        )}
                        <span className="text-[10px] text-gray-300 font-semibold tracking-wider uppercase">
                          BridgeTech Official Store
                        </span>
                      </div>

                      {/* Title & Desc */}
                      <div className="my-auto space-y-1">
                        <h2 className="text-lg sm:text-xl font-extrabold text-white leading-tight line-clamp-2">
                          {title || 'Your Product Title'}
                        </h2>
                        {description && (
                          <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                            {description}
                          </p>
                        )}
                      </div>

                      {/* Price & Action Footer */}
                      <div className="pt-2 border-t border-white/20 flex items-center justify-between">
                        <div>
                          {price && (
                            <div className="text-xl font-extrabold text-red-400 tracking-tight">
                              Le {price}
                            </div>
                          )}
                          <div className="text-[9px] text-gray-400">
                            itservicesfreetown.com · Freetown, SL
                          </div>
                        </div>
                        <div className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg shadow-sm">
                          Order Now ↗
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. WhatsApp Preview Render */}
              {previewTab === 'whatsapp' && (
                <div className="bg-[#075E54] rounded-2xl p-5 max-w-sm mx-auto shadow-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <MessageCircle className="w-5 h-5 text-[#25D366]" />
                    <span className="text-white text-xs font-bold">WhatsApp Shared Bubble</span>
                  </div>
                  <div className="bg-white rounded-xl overflow-hidden shadow-md">
                    <div className="h-44 bg-slate-100 overflow-hidden relative flex items-center justify-center">
                      <img
                        src={imageUrl || '/assets/images/slide01.jpg'}
                        alt={title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3 border-l-4 border-[#25D366] bg-[#f0fdf4]">
                      <div className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider mb-0.5">
                        itservicesfreetown.com
                      </div>
                      <div className="font-bold text-slate-900 text-sm leading-tight line-clamp-2">
                        {title}
                      </div>
                      {price && <div className="text-red-600 font-extrabold text-sm mt-0.5">Le {price}</div>}
                      <div className="text-slate-600 text-xs mt-1 line-clamp-2">{description}</div>
                    </div>
                    <div className="px-3 py-1.5 bg-[#f0fdf4] text-[10px] text-slate-400 font-mono truncate border-t border-emerald-100">
                      {shortUrl || landingUrl}
                    </div>
                  </div>
                  <div className="mt-2 text-[11px] text-emerald-200 text-center font-medium">
                    ⚡ Tap link opens exact landing page
                  </div>
                </div>
              )}

              {/* 3. iMessage / Link Preview Render */}
              {previewTab === 'imessage' && (
                <div className="bg-slate-900 rounded-2xl p-5 max-w-sm mx-auto shadow-2xl">
                  <div className="flex items-center gap-2 mb-3">
                    <Smartphone className="w-5 h-5 text-blue-400" />
                    <span className="text-slate-300 text-xs font-bold">iMessage / Telegram Link</span>
                  </div>
                  <div className="bg-slate-800 rounded-xl overflow-hidden border border-slate-700">
                    <div className="h-40 bg-slate-700 overflow-hidden flex items-center justify-center">
                      <img
                        src={imageUrl || '/assets/images/slide01.jpg'}
                        alt={title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <div className="text-[10px] text-blue-400 font-bold uppercase tracking-wider mb-0.5">
                        itservicesfreetown.com
                      </div>
                      <div className="font-bold text-white text-sm line-clamp-2">{title}</div>
                      <div className="text-slate-400 text-xs mt-1 line-clamp-2">{description}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Social Share & WhatsApp Action Deck */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
              <h3 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-emerald-600" />
                3. Social Media Sharing Deck
              </h3>

              {/* Short link generator */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  WhatsApp Short Link (<span className="text-emerald-600 font-mono">/s/code</span>)
                </label>
                <div className="flex gap-2">
                  {shortUrl ? (
                    <>
                      <input
                        type="text"
                        readOnly
                        value={shortUrl}
                        className="flex-1 px-3 py-2 text-xs font-mono text-emerald-800 bg-emerald-50 border border-emerald-300 rounded-lg"
                      />
                      <button
                        onClick={() => copyToClipboard(shortUrl, 'short', 'Short link copied!')}
                        className="flex items-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        {copiedKey === 'short' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedKey === 'short' ? 'Copied' : 'Copy'}
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={generateShortLink}
                      disabled={generatingShort}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition-colors"
                    >
                      {generatingShort ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                      {generatingShort ? 'Generating...' : 'Generate Short Link for WhatsApp'}
                    </button>
                  )}
                </div>
              </div>

              {/* Formatted WhatsApp Message */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Ready-to-Post WhatsApp Status &amp; Message
                </label>
                <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono text-gray-800 whitespace-pre-wrap leading-relaxed max-h-36 overflow-y-auto">
                  {buildWhatsAppMessage()}
                </div>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => copyToClipboard(buildWhatsAppMessage(), 'wa', 'WhatsApp text copied!')}
                  className="flex items-center justify-center gap-2 py-3 bg-[#25D366] hover:bg-[#1da853] text-white rounded-xl text-xs font-bold shadow-md transition-colors"
                >
                  {copiedKey === 'wa' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copiedKey === 'wa' ? 'Copied WhatsApp Message!' : 'Copy WhatsApp Message'}
                </button>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(buildWhatsAppMessage())}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 bg-[#128C7E] hover:bg-[#0e7065] text-white rounded-xl text-xs font-bold shadow-md transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  Open in WhatsApp
                </a>
              </div>

              {/* Native mobile share */}
              <button
                onClick={handleNativeShare}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors"
              >
                <Share2 className="w-4 h-4 text-gray-600" />
                Share to Instagram / Facebook / Twitter / Telegram
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QUICK AUTOFILL MODAL DRAWER */}
      {showPicker && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                  Pick an Existing Item to Autofill
                </h3>
                <p className="text-xs text-gray-500">
                  Select any product or blog post to load its title, pricing, image, and landing URL
                </p>
              </div>
              <button
                onClick={() => setShowPicker(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs & Search */}
            <div className="p-4 bg-gray-50 border-b border-gray-100 space-y-3">
              <div className="flex gap-2">
                <button
                  onClick={() => setPickerTab('products')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    pickerTab === 'products'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5 inline mr-1" /> Products ({products.length})
                </button>
                <button
                  onClick={() => setPickerTab('blog')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    pickerTab === 'blog'
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  📝 Blog Posts ({blogPosts.length})
                </button>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder={pickerTab === 'products' ? 'Search products by name...' : 'Search blog posts by title...'}
                  className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Modal List */}
            <div className="flex-1 overflow-y-auto p-4 divide-y divide-gray-100">
              {loadingData ? (
                <div className="py-12 text-center text-gray-400 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" /> Loading items...
                </div>
              ) : pickerTab === 'products' ? (
                filteredProducts.length === 0 ? (
                  <div className="py-8 text-center text-xs text-gray-400">No products found</div>
                ) : (
                  filteredProducts.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => applyProduct(p)}
                      className="w-full flex items-center gap-3 p-3 hover:bg-red-50/60 rounded-xl text-left transition-colors group"
                    >
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200 flex items-center justify-center">
                        {p.images?.[0]?.url ? (
                          <img src={p.images[0].url} alt={p.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-bold text-gray-900 truncate group-hover:text-red-600">{p.name}</h4>
                        <div className="text-[11px] text-gray-500">{p.category?.name} · {p.condition}</div>
                        <div className="text-xs font-bold text-red-600">Le {p.price.toLocaleString()}</div>
                      </div>
                      <span className="text-xs text-gray-400 group-hover:text-red-600 font-bold">Use →</span>
                    </button>
                  ))
                )
              ) : filteredBlogs.length === 0 ? (
                <div className="py-8 text-center text-xs text-gray-400">No blog posts found</div>
              ) : (
                filteredBlogs.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => applyBlog(b)}
                    className="w-full flex items-center gap-3 p-3 hover:bg-red-50/60 rounded-xl text-left transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-purple-50 text-purple-600 overflow-hidden shrink-0 border border-purple-100 flex items-center justify-center font-bold text-sm">
                      📝
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-gray-900 truncate group-hover:text-red-600">{b.title}</h4>
                      <div className="text-[11px] text-gray-500">{b.author} · {new Date(b.date).toLocaleDateString()}</div>
                    </div>
                    <span className="text-xs text-gray-400 group-hover:text-red-600 font-bold">Use →</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}