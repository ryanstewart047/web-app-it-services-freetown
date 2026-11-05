'use client';

import { useRef, useState, type ChangeEvent, type CSSProperties } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  Copy,
  ExternalLink,
  Image as ImageIcon,
  Link2,
  Move,
  RefreshCw,
  Upload,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { cleanSocialShareDestination } from '@/lib/social-share-url';

type ImageFit = 'contain' | 'cover';

const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

function getImageStyle(
  imageFit: ImageFit,
  imageScale: number,
  imagePositionX: number,
  imagePositionY: number
): CSSProperties {
  return {
    width: '100%',
    height: '100%',
    objectFit: imageFit,
    objectPosition: `${imagePositionX}% ${imagePositionY}%`,
    transform: `scale(${imageScale / 100})`,
    transformOrigin: `${imagePositionX}% ${imagePositionY}%`,
  };
}

function formatPrice(price: string) {
  const value = price.trim();
  if (!value) return '';
  return /^(le|sll|usd|\$|gbp)/i.test(value) ? value : `Le ${value}`;
}

function normalizeUrl(value: string) {
  const baseUrl = typeof window === 'undefined' ? undefined : window.location.origin;
  return cleanSocialShareDestination(value, baseUrl) || '';
}

function prepareUploadedImageDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      try {
        const maxSide = 1600;
        const ratio = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight));
        const width = Math.max(1, Math.round(image.naturalWidth * ratio));
        const height = Math.max(1, Math.round(image.naturalHeight * ratio));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d');

        if (!context) throw new Error('Canvas rendering is unavailable.');

        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.88));
      } catch (error) {
        reject(error);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('This image could not be read.'));
    };
    image.src = objectUrl;
  });
}

export default function SocialSharingAdminPage() {
  const [productName, setProductName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [landingUrl, setLandingUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageFit, setImageFit] = useState<ImageFit>('contain');
  const [imageScale, setImageScale] = useState(100);
  const [imagePositionX, setImagePositionX] = useState(50);
  const [imagePositionY, setImagePositionY] = useState(50);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [shortUrl, setShortUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const [generationError, setGenerationError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const previewDescription = description.trim() || 'Your short product description appears here.';
  const previewTitle = productName.trim() || 'Product name';
  const previewPrice = formatPrice(price);

  const invalidateLink = () => {
    setShortUrl('');
    setCopied(false);
    setGenerationError('');
  };

  const showGenerationError = (message: string) => {
    setGenerationError(message);
    toast.error(message);
  };

  const handleFileUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Choose an image file.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error('Image files must be 8MB or smaller.');
      return;
    }

    setUploadingImage(true);
    try {
      const optimizedImage = await prepareUploadedImageDataUrl(file);
      setImageUrl(optimizedImage);
      invalidateLink();

      const response = await fetch('/api/social-share-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: optimizedImage, fileName: file.name }),
      });
      const result = await response.json();

      if (!response.ok || !result.success || (!result.url && !result.inline)) {
        throw new Error(result.error || 'The image could not be stored for sharing.');
      }

      if (result.url) setImageUrl(result.url);
      toast.success('Image uploaded and ready for the link preview.');
    } catch (error) {
      // Keep the optimized in-browser image so the operator can still retry.
      toast.error(error instanceof Error ? error.message : 'Image upload failed.');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleGenerate = async () => {
    const destination = normalizeUrl(landingUrl);

    if (!productName.trim()) {
      showGenerationError('Add the product name before generating the link.');
      return;
    }
    if (!description.trim()) {
      showGenerationError('Add a short description before generating the link.');
      return;
    }
    if (!imageUrl.trim()) {
      showGenerationError('Upload a product image or paste its image URL before generating the link.');
      return;
    }
    try {
      new URL(destination);
    } catch {
      showGenerationError('Enter a valid landing page URL before generating the link.');
      return;
    }

    setGenerating(true);
    setGenerationError('');
    try {
      const response = await fetch('/api/shorten', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: destination,
          title: productName.trim(),
          description: description.trim(),
          price: price.trim(),
          image: imageUrl.trim(),
          fit: imageFit,
          scale: imageScale,
          positionX: imagePositionX,
          positionY: imagePositionY,
          layout: 'photo-only',
          previewType: 'product',
        }),
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.shortUrl) {
        throw new Error(result.error || `The short link could not be generated (server returned ${response.status}).`);
      }

      setShortUrl(result.shortUrl);
      setCopied(false);
      toast.success('New social-share link created.');
    } catch (error) {
      showGenerationError(error instanceof Error ? error.message : 'The short link could not be generated.');
    } finally {
      setGenerating(false);
    }
  };

  const copyShortUrl = async () => {
    if (!shortUrl) return;

    try {
      await navigator.clipboard.writeText(shortUrl);
      setCopied(true);
      toast.success('Short link copied.');
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      toast.error('Could not copy the link.');
    }
  };

  return (
    <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-5">
          <div className="flex min-w-0 items-center gap-3">
            <Link
              href="/admin"
              aria-label="Back to admin dashboard"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-xl font-black text-slate-950 sm:text-2xl">Social Share Link</h1>
              <p className="text-sm text-slate-600">Build a product link with a real social preview.</p>
            </div>
          </div>
          <Link
            href="/marketplace"
            className="inline-flex min-h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-bold text-slate-700 hover:bg-slate-50"
          >
            <ExternalLink className="h-4 w-4" />
            Marketplace
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.88fr)]">
          <section className="space-y-5">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-700 text-sm font-black text-white">1</span>
                <h2 className="text-lg font-black">Product details</h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-bold text-slate-700">Product name</span>
                  <input
                    value={productName}
                    onChange={(event) => { setProductName(event.target.value); invalidateLink(); }}
                    placeholder="Example: Apple iPhone 15 Pro Max"
                    className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none ring-blue-600 focus:border-blue-600 focus:ring-2"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-slate-700">Price</span>
                  <input
                    value={price}
                    onChange={(event) => { setPrice(event.target.value); invalidateLink(); }}
                    placeholder="24,500,000"
                    className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none ring-blue-600 focus:border-blue-600 focus:ring-2"
                  />
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-sm font-bold text-slate-700">Landing page URL</span>
                  <input
                    value={landingUrl}
                    onChange={(event) => { setLandingUrl(event.target.value); invalidateLink(); }}
                    placeholder="https://your-site.com/product"
                    inputMode="url"
                    className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none ring-blue-600 focus:border-blue-600 focus:ring-2"
                  />
                </label>
                <label className="block sm:col-span-2">
                  <span className="mb-1.5 block text-sm font-bold text-slate-700">Short description</span>
                  <textarea
                    value={description}
                    onChange={(event) => { setDescription(event.target.value); invalidateLink(); }}
                    placeholder="A clear one or two sentence description for customers."
                    rows={4}
                    className="w-full resize-y rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none ring-blue-600 focus:border-blue-600 focus:ring-2"
                  />
                </label>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-700 text-sm font-black text-white">2</span>
                <h2 className="text-lg font-black">Product photo</h2>
              </div>

              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
              <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="flex min-h-24 items-center justify-center gap-3 rounded-md border border-dashed border-slate-300 bg-slate-50 px-4 text-sm font-bold text-slate-700 hover:border-blue-500 hover:bg-blue-50 disabled:cursor-wait disabled:opacity-70"
                >
                  {uploadingImage ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Upload className="h-5 w-5" />}
                  {uploadingImage ? 'Uploading image' : 'Upload image'}
                </button>
                <div className="flex items-center gap-2 text-xs leading-5 text-slate-500 sm:w-44">
                  <ImageIcon className="h-4 w-4 shrink-0" />
                  Images are prepared on white for a clean social preview.
                </div>
              </div>
              <label className="mt-4 block">
                <span className="mb-1.5 block text-sm font-bold text-slate-700">Or paste image URL</span>
                <input
                  value={imageUrl.startsWith('data:') ? '' : imageUrl}
                  onChange={(event) => { setImageUrl(event.target.value); invalidateLink(); }}
                  placeholder="https://your-site.com/product-photo.jpg"
                  inputMode="url"
                  className="h-11 w-full rounded-md border border-slate-300 px-3 text-sm outline-none ring-blue-600 focus:border-blue-600 focus:ring-2"
                />
              </label>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-700 text-sm font-black text-white">3</span>
                <h2 className="text-lg font-black">Image scaling</h2>
              </div>

              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-bold text-slate-700">Fit</span>
                  <div className="inline-flex overflow-hidden rounded-md border border-slate-300 bg-white">
                    <button
                      type="button"
                      onClick={() => { setImageFit('contain'); invalidateLink(); }}
                      className={`min-h-10 px-4 text-sm font-bold ${imageFit === 'contain' ? 'bg-slate-950 text-white' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      Contain
                    </button>
                    <button
                      type="button"
                      onClick={() => { setImageFit('cover'); invalidateLink(); }}
                      className={`min-h-10 border-l border-slate-300 px-4 text-sm font-bold ${imageFit === 'cover' ? 'bg-slate-950 text-white' : 'text-slate-700 hover:bg-slate-50'}`}
                    >
                      Cover
                    </button>
                  </div>
                </div>

                <label className="block">
                  <span className="mb-2 flex items-center justify-between text-sm font-bold text-slate-700">
                    <span className="inline-flex items-center gap-2"><ZoomIn className="h-4 w-4" /> Zoom</span>
                    <span>{imageScale}%</span>
                  </span>
                  <div className="flex items-center gap-3">
                    <ZoomOut className="h-4 w-4 text-slate-500" />
                    <input
                      type="range"
                      min="55"
                      max="180"
                      value={imageScale}
                      onChange={(event) => { setImageScale(Number(event.target.value)); invalidateLink(); }}
                      className="h-2 w-full accent-blue-700"
                    />
                    <ZoomIn className="h-4 w-4 text-slate-500" />
                  </div>
                </label>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-2 flex items-center justify-between text-sm font-bold text-slate-700"><span>Horizontal</span><span>{imagePositionX}%</span></span>
                    <input type="range" min="0" max="100" value={imagePositionX} onChange={(event) => { setImagePositionX(Number(event.target.value)); invalidateLink(); }} className="h-2 w-full accent-blue-700" />
                  </label>
                  <label className="block">
                    <span className="mb-2 flex items-center justify-between text-sm font-bold text-slate-700"><span>Vertical</span><span>{imagePositionY}%</span></span>
                    <input type="range" min="0" max="100" value={imagePositionY} onChange={(event) => { setImagePositionY(Number(event.target.value)); invalidateLink(); }} className="h-2 w-full accent-blue-700" />
                  </label>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating || uploadingImage}
              className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-5 text-sm font-black text-white hover:bg-blue-800 disabled:cursor-wait disabled:opacity-70"
            >
              {generating ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Link2 className="h-5 w-5" />}
              {generating ? 'Generating short link' : 'Generate short link'}
            </button>

            {generationError ? (
              <p role="alert" className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold leading-6 text-red-800">
                {generationError}
              </p>
            ) : null}

            {shortUrl ? (
              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-black text-emerald-950">Your social-share link is ready</p>
                <div className="mt-3 flex min-w-0 gap-2">
                  <input readOnly value={shortUrl} className="h-11 min-w-0 flex-1 rounded-md border border-emerald-300 bg-white px-3 text-sm text-slate-700" />
                  <button type="button" onClick={copyShortUrl} aria-label="Copy short link" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-emerald-700 text-white hover:bg-emerald-800">
                    {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                  </button>
                  <a href={shortUrl} target="_blank" rel="noreferrer" aria-label="Open short link" className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-emerald-300 bg-white text-emerald-800 hover:bg-emerald-100">
                    <ExternalLink className="h-5 w-5" />
                  </a>
                </div>
                <p className="mt-3 text-xs leading-5 text-emerald-900">Paste this link in WhatsApp or Facebook. The platform receives the product image, bold product name, and the description with price.</p>
              </div>
            ) : null}
          </section>

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <h2 className="text-base font-black">Live social preview</h2>
                  <p className="mt-0.5 text-xs text-slate-500">This is the information sent with the short link.</p>
                </div>
                <Move className="h-5 w-5 text-slate-400" />
              </div>
              <div className="bg-slate-100 p-4 sm:p-6">
                <article className="overflow-hidden rounded-md bg-white shadow-md ring-1 ring-slate-200">
                  <div className="aspect-[1200/630] overflow-hidden bg-white">
                    {imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imageUrl} alt={previewTitle} style={getImageStyle(imageFit, imageScale, imagePositionX, imagePositionY)} />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-slate-50 text-sm font-bold text-slate-400">
                        Product photo
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 p-4">
                    <p className="text-xs font-bold uppercase text-slate-500">itservicesfreetown.com</p>
                    <h3 className="text-lg font-black leading-snug text-slate-950">{previewTitle}</h3>
                    <p className="text-sm leading-6 text-slate-600">{previewDescription}</p>
                    {previewPrice ? <p className="text-base font-black text-red-600">{previewPrice}</p> : null}
                  </div>
                </article>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
