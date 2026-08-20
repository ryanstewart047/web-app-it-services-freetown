'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import {
  Share2,
  Copy,
  Check,
  ExternalLink,
  Search,
  ChevronRight,
  Image as ImageIcon,
  FileText,
  ArrowLeft,
  RefreshCw,
  Eye,
  MessageCircle,
  Smartphone,
  Globe,
  X,
  Star,
  Tag,
} from 'lucide-react';

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

interface ShareCard {
  type: 'product' | 'blog';
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  price?: string;
  tag?: string;
}

const BASE_URL =
  typeof window !== 'undefined'
    ? window.location.origin
    : 'https://www.itservicesfreetown.com';

function getExcerpt(content: string, maxLen = 160) {
  const text = content
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[([^\]]+)\]\(.*?\)/g, '$1')
    .replace(/#{1,6}\s+/g, '')
    .replace(/\*\*|__|\*|_|~~|`/g, '')
    .replace(/\n+/g, ' ')
    .trim();
  return text.length > maxLen ? text.slice(0, maxLen - 3) + '...' : text;
}

function fmtPrice(p: number) {
  return `Le ${p.toLocaleString()}`;
}

function WhatsAppPreview({ card, ogImageUrl }: { card: ShareCard; ogImageUrl: string }) {
  return (
    <div className="bg-[#075E54] rounded-2xl p-4 max-w-sm mx-auto shadow-2xl">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircle className="w-5 h-5 text-[#25D366]" />
        <span className="text-white text-xs font-semibold">WhatsApp Preview</span>
      </div>
      <div className="bg-white rounded-xl overflow-hidden shadow-lg">
        <div className="relative bg-slate-100 h-44 overflow-hidden">
          <img
            src={ogImageUrl}
            alt="OG Preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/images/slide01.jpg';
            }}
          />
        </div>
        <div className="p-3 border-l-4 border-[#25D366] bg-[#f0f7f0]">
          <div className="text-[10px] text-green-700 font-bold uppercase tracking-wide mb-1">
            itservicesfreetown.com
          </div>
          <div className="font-bold text-slate-900 text-sm leading-tight line-clamp-2">
            {card.title}
          </div>
          {card.price && (
            <div className="text-red-600 font-bold text-sm mt-0.5">{card.price}</div>
          )}
          <div className="text-slate-600 text-xs mt-1 line-clamp-2">{card.description}</div>
        </div>
        <div className="px-3 pb-2 pt-1 bg-[#f0f7f0]">
          <div className="text-[10px] text-slate-400 truncate">{card.targetUrl}</div>
        </div>
      </div>
      <div className="mt-2 text-xs text-green-200 text-center">Tap link → opens exact page ↗</div>
    </div>
  );
}

function LinkPreview({ card, ogImageUrl }: { card: ShareCard; ogImageUrl: string }) {
  return (
    <div className="bg-slate-800 rounded-2xl p-4 max-w-sm mx-auto shadow-2xl">
      <div className="flex items-center gap-2 mb-3">
        <Globe className="w-5 h-5 text-slate-400" />
        <span className="text-slate-300 text-xs font-semibold">Link Preview (iMessage / Telegram)</span>
      </div>
      <div className="bg-slate-700 rounded-xl overflow-hidden border border-slate-600">
        <div className="h-40 overflow-hidden bg-slate-600">
          <img
            src={ogImageUrl}
            alt="OG Preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).src = '/assets/images/slide01.jpg';
            }}
          />
        </div>
        <div className="p-3">
          <div className="text-[10px] text-slate-400 uppercase tracking-wide mb-1">
            itservicesfreetown.com
          </div>
          <div className="font-bold text-white text-sm line-clamp-2">{card.title}</div>
          <div className="text-slate-400 text-xs mt-1 line-clamp-2">{card.description}</div>
        </div>
      </div>
    </div>
  );
}

export default function SocialSharingAdminPage() {
  const [tab, setTab] = useState<'products' | 'blog'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCard, setSelectedCard] = useState<ShareCard | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedBlog, setSelectedBlog] = useState<BlogPost | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editImageUrl, setEditImageUrl] = useState('');
  const [shortUrl, setShortUrl] = useState('');
  const [generatingShort, setGeneratingShort] = useState(false);
  const [copied, setCopied] = useState<'link' | 'short' | 'wa' | null>(null);
  const [previewStyle, setPreviewStyle] = useState<'whatsapp' | 'link'>('whatsapp');
  const [ogImageRefreshKey, setOgImageRefreshKey] = useState(0);

  const loadProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/products?status=active');
      if (res.ok) setProducts(await res.json());
    } catch {}
  }, []);

  const loadBlog = useCallback(async () => {
    try {
      const res = await fetch('/api/blog');
      if (res.ok) {
        const data = await res.json();
        setBlogPosts(Array.isArray(data) ? data : data.posts || []);
      }
    } catch {}
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadProducts(), loadBlog()]).finally(() => setLoading(false));
  }, [loadProducts, loadBlog]);

  const selectProduct = (p: Product) => {
    const imgUrl = p.images?.[0]?.url || '';
    const fullImg = imgUrl.startsWith('http') ? imgUrl : imgUrl ? `${BASE_URL}${imgUrl}` : '';
    const fixedImg =
      fullImg.includes('github.com') && fullImg.includes('/blob/')
        ? fullImg
            .replace('https://github.com/', 'https://raw.githubusercontent.com/')
            .replace('/blob/', '/')
            .replace(/[?&]raw=true/, '')
        : fullImg;

    const card: ShareCard = {
      type: 'product',
      id: p.id,
      title: p.name,
      description: p.description.slice(0, 160),
      imageUrl: fixedImg,
      targetUrl: `${BASE_URL}/marketplace/${p.slug}`,
      price: fmtPrice(p.price),
      tag: p.condition === 'new' ? '🆕 New' : p.condition === 'refurbished' ? '♻️ Refurbished' : '📦 Used',
    };
    setSelectedCard(card);
    setSelectedProduct(p);
    setSelectedBlog(null);
    setEditTitle(card.title);
    setEditDesc(card.description);
    setEditImageUrl(card.imageUrl);
    setShortUrl('');
    setOgImageRefreshKey((k) => k + 1);
  };

  const selectBlog = (post: BlogPost) => {
    const imgUrl = post.image || '';
    const fullImg = imgUrl.startsWith('http') ? imgUrl : imgUrl ? `${BASE_URL}${imgUrl}` : '';
    const card: ShareCard = {
      type: 'blog',
      id: post.id,
      title: post.title,
      description: getExcerpt(post.content),
      imageUrl: fullImg,
      targetUrl: `${BASE_URL}/blog/${post.id}`,
      tag: '📝 Blog',
    };
    setSelectedCard(card);
    setSelectedBlog(post);
    setSelectedProduct(null);
    setEditTitle(card.title);
    setEditDesc(card.description);
    setEditImageUrl(card.imageUrl);
    setShortUrl('');
    setOgImageRefreshKey((k) => k + 1);
  };

  const ogImageUrl = (() => {
    if (!selectedCard) return '';
    if (selectedCard.type === 'product' && selectedProduct) {
      const params = new URLSearchParams({
        name: editTitle,
        price: selectedProduct.price.toString(),
        image: editImageUrl,
        description: editDesc.slice(0, 100),
        condition: selectedProduct.condition,
        _k: String(ogImageRefreshKey),
      });
      return `${BASE_URL}/api/og-product?${params}`;
    }
    if (selectedCard.type === 'blog' && selectedBlog) {
      const params = new URLSearchParams({
        id: selectedBlog.id,
        title: editTitle,
        excerpt: editDesc.slice(0, 200),
        image: editImageUrl,
        _k: String(ogImageRefreshKey),
      });
      return `${BASE_URL}/api/og-blog?${params}`;
    }
    return '';
  })();

  const copyText = (text: string, key: 'link' | 'short' | 'wa') => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2200);
    });
  };

  const generateShortUrl = async () => {
    if (!selectedCard) return;
    setGeneratingShort(true);
    try {
      const res = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: selectedCard.targetUrl }),
      });
      if (res.ok) {
        const data = await res.json();
        setShortUrl(data.shortUrl);
      }
    } catch {}
    setGeneratingShort(false);
  };

  const buildWaMessage = () => {
    if (!selectedCard) return '';
    const link = shortUrl || selectedCard.targetUrl;
    const priceStr = selectedCard.price ? `\n💰 ${selectedCard.price}` : '';
    const tagStr = selectedCard.tag ? `\n🏷️ ${selectedCard.tag}` : '';
    return `*${editTitle}*${priceStr}${tagStr}\n\n${editDesc}\n\n🔗 ${link}`;
  };

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.name?.toLowerCase().includes(search.toLowerCase()) ||
      (p.brand || '').toLowerCase().includes(search.toLowerCase())
  );

  const filteredBlogs = blogPosts.filter(
    (b) =>
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.author.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#040e40] to-slate-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-[#040e40]/90 backdrop-blur-sm border-b border-white/10 px-4 py-3 flex items-center gap-3">
        <Link href="/admin" className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-red-400" />
          <span className="font-bold text-lg">Social Sharing Admin</span>
        </div>
        <span className="ml-auto text-[10px] text-slate-400 bg-white/5 px-2 py-1 rounded-full border border-white/10">
          Configure &amp; Share Products &amp; Blog Posts
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 grid xl:grid-cols-2 gap-6 items-start">
        {/* ── LEFT: Picker ── */}
        <div className="space-y-4">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => { setTab('products'); setSearch(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'products' ? 'bg-red-600 text-white shadow-lg' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
              >
                <Tag className="w-4 h-4" /> Products
              </button>
              <button
                onClick={() => { setTab('blog'); setSearch(''); }}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all ${tab === 'blog' ? 'bg-red-600 text-white shadow-lg' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
              >
                <FileText className="w-4 h-4" /> Blog Posts
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={tab === 'products' ? 'Search products…' : 'Search blog posts…'}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-white/15 rounded-xl text-white text-sm focus:ring-2 focus:ring-red-500 placeholder-slate-500"
              />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center py-16 gap-3 text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Loading…</span>
              </div>
            ) : tab === 'products' ? (
              filteredProducts.length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-sm">No products found</div>
              ) : (
                <div className="divide-y divide-white/5 max-h-[60vh] overflow-y-auto">
                  {filteredProducts.map((p) => {
                    const imgUrl = p.images?.[0]?.url || '';
                    const isSelected = selectedCard?.type === 'product' && selectedCard.id === p.id;
                    return (
                      <button
                        key={p.id}
                        onClick={() => selectProduct(p)}
                        className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-all hover:bg-white/5 ${isSelected ? 'bg-red-900/30 border-l-4 border-red-500' : 'border-l-4 border-transparent'}`}
                      >
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-700 shrink-0">
                          {imgUrl ? (
                            <img
                              src={imgUrl.startsWith('http') ? imgUrl : `${BASE_URL}${imgUrl}`}
                              alt={p.name}
                              className="w-full h-full object-cover"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-500">
                              <ImageIcon className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-sm text-white truncate">{p.name}</div>
                          <div className="text-xs text-slate-400 mt-0.5">{p.category?.name} · {p.condition}</div>
                          <div className="text-red-400 font-bold text-sm mt-0.5">{fmtPrice(p.price)}</div>
                        </div>
                        <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-red-400' : 'text-slate-600'}`} />
                      </button>
                    );
                  })}
                </div>
              )
            ) : filteredBlogs.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-sm">No blog posts found</div>
            ) : (
              <div className="divide-y divide-white/5 max-h-[60vh] overflow-y-auto">
                {filteredBlogs.map((post) => {
                  const isSelected = selectedCard?.type === 'blog' && selectedCard.id === post.id;
                  return (
                    <button
                      key={post.id}
                      onClick={() => selectBlog(post)}
                      className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-all hover:bg-white/5 ${isSelected ? 'bg-red-900/30 border-l-4 border-red-500' : 'border-l-4 border-transparent'}`}
                    >
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-700 shrink-0 flex items-center justify-center">
                        <FileText className="w-7 h-7 text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-white line-clamp-2 leading-tight">{post.title}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{post.author} · {new Date(post.date).toLocaleDateString()}</div>
                        <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <Star className="w-3 h-3 text-yellow-500" fill="currentColor" />
                          {post.likes} likes
                        </div>
                      </div>
                      <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-red-400' : 'text-slate-600'}`} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Editor + Preview ── */}
        <div className="space-y-4">
          {!selectedCard ? (
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-10 text-center space-y-4">
              <Share2 className="w-14 h-14 mx-auto text-slate-600" />
              <div className="text-slate-400 font-medium">
                Select a product or blog post on the left to configure its social share card
              </div>
              <div className="text-xs text-slate-600">
                Customize title, description, and image — then copy a WhatsApp-ready link
              </div>
            </div>
          ) : (
            <>
              {/* Card Editor */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
                    <Eye className="w-4 h-4" /> Share Card Editor
                  </h2>
                  <button
                    onClick={() => { setSelectedCard(null); setSelectedProduct(null); setSelectedBlog(null); setShortUrl(''); }}
                    className="text-slate-500 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block font-medium">Share Title</label>
                    <input
                      value={editTitle}
                      onChange={(e) => { setEditTitle(e.target.value); setOgImageRefreshKey((k) => k + 1); }}
                      className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2.5 text-white text-sm font-bold focus:ring-2 focus:ring-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block font-medium">Short Description</label>
                    <textarea
                      value={editDesc}
                      onChange={(e) => { setEditDesc(e.target.value); setOgImageRefreshKey((k) => k + 1); }}
                      rows={3}
                      className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2.5 text-white text-sm focus:ring-2 focus:ring-red-500 resize-none"
                    />
                    <div className="text-right text-[10px] text-slate-500 mt-1">{editDesc.length}/160 chars</div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block font-medium">Image URL (for OG card)</label>
                    <div className="flex gap-2">
                      <input
                        value={editImageUrl}
                        onChange={(e) => { setEditImageUrl(e.target.value); setOgImageRefreshKey((k) => k + 1); }}
                        placeholder="https://..."
                        className="flex-1 bg-slate-900 border border-white/15 rounded-xl px-3 py-2.5 text-white text-xs font-mono focus:ring-2 focus:ring-red-500"
                      />
                      <button
                        onClick={() => setOgImageRefreshKey((k) => k + 1)}
                        className="px-3 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
                      >
                        <RefreshCw className="w-4 h-4 text-slate-400" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block font-medium">Target URL (opens when shared link is clicked)</label>
                    <div className="flex items-center gap-2 bg-slate-900 border border-white/10 rounded-xl px-3 py-2">
                      <ExternalLink className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="text-xs text-slate-300 font-mono truncate flex-1">{selectedCard.targetUrl}</span>
                      <a href={selectedCard.targetUrl} target="_blank" rel="noopener noreferrer" className="text-red-400 hover:text-red-300 shrink-0">
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xs font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
                    <ImageIcon className="w-4 h-4" /> OG Card Preview (1200×630)
                  </h2>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => setPreviewStyle('whatsapp')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 font-medium transition-all ${previewStyle === 'whatsapp' ? 'bg-[#25D366] text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                    </button>
                    <button
                      onClick={() => setPreviewStyle('link')}
                      className={`px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 font-medium transition-all ${previewStyle === 'link' ? 'bg-slate-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                    >
                      <Smartphone className="w-3.5 h-3.5" /> Link
                    </button>
                  </div>
                </div>
                <div className="rounded-xl overflow-hidden border border-white/10 mb-4 bg-slate-800">
                  <img
                    key={ogImageRefreshKey}
                    src={ogImageUrl}
                    alt="OG Card"
                    className="w-full object-cover"
                    style={{ aspectRatio: '1200/630' }}
                    onError={(e) => { (e.target as HTMLImageElement).src = '/assets/images/slide01.jpg'; }}
                  />
                </div>
                {previewStyle === 'whatsapp' ? (
                  <WhatsAppPreview
                    card={{ ...selectedCard, title: editTitle, description: editDesc, price: selectedCard.price }}
                    ogImageUrl={ogImageUrl}
                  />
                ) : (
                  <LinkPreview
                    card={{ ...selectedCard, title: editTitle, description: editDesc }}
                    ogImageUrl={ogImageUrl}
                  />
                )}
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 space-y-4">
                <h2 className="text-xs font-bold text-red-400 uppercase tracking-widest flex items-center gap-2">
                  <Share2 className="w-4 h-4" /> Share Actions
                </h2>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium">Direct Link</label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-300 truncate">
                      {selectedCard.targetUrl}
                    </div>
                    <button
                      onClick={() => copyText(selectedCard.targetUrl, 'link')}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all"
                    >
                      {copied === 'link' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied === 'link' ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium">Short Link (for WhatsApp)</label>
                  <div className="flex gap-2">
                    {shortUrl ? (
                      <>
                        <div className="flex-1 bg-slate-900 border border-emerald-500/40 rounded-xl px-3 py-2.5 text-xs font-mono text-emerald-300 truncate">
                          {shortUrl}
                        </div>
                        <button
                          onClick={() => copyText(shortUrl, 'short')}
                          className="flex items-center gap-1.5 px-3 py-2 bg-emerald-700/60 hover:bg-emerald-600 rounded-xl text-xs font-bold transition-all text-white"
                        >
                          {copied === 'short' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copied === 'short' ? 'Copied!' : 'Copy'}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={generateShortUrl}
                        disabled={generatingShort}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-xl text-sm font-bold transition-all text-white border border-white/10"
                      >
                        {generatingShort ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                        {generatingShort ? 'Generating…' : 'Generate Short Link'}
                      </button>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium">Ready-to-Send WhatsApp Message</label>
                  <div className="bg-slate-900 border border-white/10 rounded-xl p-3 text-xs text-slate-300 font-mono whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                    {buildWaMessage()}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyText(buildWaMessage(), 'wa')}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#25D366] hover:bg-[#1da853] rounded-xl text-sm font-bold transition-all text-white"
                    >
                      {copied === 'wa' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      {copied === 'wa' ? 'Copied!' : 'Copy WhatsApp Message'}
                    </button>
                    <a
                      href={`https://wa.me/?text=${encodeURIComponent(buildWaMessage())}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2.5 bg-[#128C7E] hover:bg-[#0a6b61] rounded-xl text-sm font-bold transition-all text-white"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Open in WA
                    </a>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-medium">OG Image URL (1200×630 card)</label>
                  <div className="flex gap-2">
                    <div className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2.5 text-xs font-mono text-slate-500 truncate">
                      {ogImageUrl}
                    </div>
                    <button
                      onClick={() => copyText(ogImageUrl, 'link')}
                      className="flex items-center gap-1.5 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}