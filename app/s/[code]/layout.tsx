import { Metadata } from 'next';

interface Props {
  params: { code: string };
}

interface ShortUrlRecord {
  url: string;
  metadata?: {
    title?: string;
    description?: string;
    price?: string;
    tag?: string;
    image?: string;
    theme?: string;
    fit?: string;
    scale?: number;
  };
}

// Helper to get URL mapping and optional custom metadata from file
async function getShortUrlData(code: string): Promise<{ url: string; metadata?: ShortUrlRecord['metadata'] } | null> {
  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'data', 'short-urls.json');
    
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const data = fs.readFileSync(filePath, 'utf-8');
    const urlMap = JSON.parse(data);
    const item = urlMap[code];
    if (!item) return null;
    
    if (typeof item === 'string') {
      return { url: item };
    }
    return { url: item.url, metadata: item.metadata };
  } catch (error) {
    console.error('Error reading short URL mapping:', error);
    return null;
  }
}

// Helper to get product data from URL
async function getProductFromUrl(url: string) {
  try {
    const match = url.match(/\/marketplace\/([^/?]+)/);
    if (!match) return null;
    const slug = match[1];
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.itservicesfreetown.com';
    const res = await fetch(`${baseUrl}/api/products`, {
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    
    if (!res.ok) return null;
    const products = await res.json();
    return products.find((p: any) => p.slug === slug);
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

// Helper to get blog post data from URL
async function getBlogFromUrl(url: string) {
  try {
    const match = url.match(/\/blog\/([^/?#]+)/);
    if (!match) return null;
    const id = match[1];

    const { fetchBlogPosts } = await import('@/lib/github-blog-storage');
    const posts = await fetchBlogPosts();
    return posts.find((p: any) => p.id === id) || null;
  } catch (error) {
    console.error('Error fetching blog for short URL:', error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const shortData = await getShortUrlData(params.code);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.itservicesfreetown.com';
  
  if (!shortData) {
    return {
      title: 'Redirecting... | BridgeTech IT Services',
      description: 'BridgeTech IT Services - Professional Computer & Mobile Repair Services',
    };
  }

  const { url: originalUrl, metadata: customMeta } = shortData;

  // 1. If custom metadata was saved with the card in the Social Sharing Admin, prioritize it!
  if (customMeta && customMeta.title) {
    const title = customMeta.title;
    const baseDescription = customMeta.description || 'Shop quality IT products & services in Freetown, Sierra Leone';
    const priceFormatted = customMeta.price ? `Le ${customMeta.price}` : '';

    // Page title: "Product Name – Le 24,500,000 | BridgeTech IT Services"
    const fullTitle = priceFormatted
      ? `${title} – ${priceFormatted} | BridgeTech IT Services`
      : `${title} | BridgeTech IT Services`;

    // OG title shown in bold beneath image: "Product Name – Le 24,500,000"
    const ogTitle = priceFormatted ? `${title} – ${priceFormatted}` : title;

    // OG description shown as small text: price line + description
    const ogDescription = priceFormatted
      ? `💰 ${priceFormatted} · ${baseDescription}`
      : baseDescription;

    // Use the actual product photo as the OG image (not a branded card)
    // This makes WhatsApp/Facebook/Instagram show the real product photo in the link preview
    let ogImageUrl = customMeta.image || `${baseUrl}/assets/images/slide01.jpg`;
    // Make relative URLs absolute
    if (ogImageUrl.startsWith('/')) ogImageUrl = `${baseUrl}${ogImageUrl}`;
    // Convert GitHub blob URLs to raw content URLs
    if (ogImageUrl.includes('github.com') && ogImageUrl.includes('/blob/')) {
      ogImageUrl = ogImageUrl
        .replace('https://github.com/', 'https://raw.githubusercontent.com/')
        .replace('/blob/', '/')
        .replace(/[?&]raw=true/, '');
    }

    return {
      title: fullTitle,
      description: ogDescription,
      openGraph: {
        title: ogTitle,
        description: ogDescription,
        url: `${baseUrl}/s/${params.code}`,
        siteName: 'BridgeTech IT Services',
        locale: 'en_SL',
        type: 'website',
        images: [
          {
            url: ogImageUrl,
            alt: title,
          }
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: ogTitle,
        description: ogDescription,
        images: [ogImageUrl],
      },
    };
  }

  // 2. Fallback: Check if it's a product URL
  const product = await getProductFromUrl(originalUrl);
  if (product) {
    let productImage = product.images?.[0]?.url || '/assets/images/slide01.jpg';
    // Make absolute
    if (productImage.startsWith('/')) productImage = `${baseUrl}${productImage}`;
    // Convert GitHub blob to raw
    if (productImage.includes('github.com') && productImage.includes('/blob/')) {
      productImage = productImage
        .replace('https://github.com/', 'https://raw.githubusercontent.com/')
        .replace('/blob/', '/')
        .replace(/[?&]raw=true/, '');
    }

    const priceFormatted = `Le ${product.price.toLocaleString('en-SL')}`;
    const baseDesc = product.description?.substring(0, 140) || 'Shop quality IT products in Freetown, Sierra Leone';
    const ogTitle = `${product.name} – ${priceFormatted}`;
    const ogDesc = `💰 ${priceFormatted} · ${baseDesc}`;

    return {
      title: `${product.name} – ${priceFormatted} | BridgeTech IT Services`,
      description: ogDesc,
      openGraph: {
        title: ogTitle,
        description: ogDesc,
        url: `${baseUrl}/s/${params.code}`,
        siteName: 'BridgeTech IT Services',
        locale: 'en_SL',
        type: 'website',
        images: [{ url: productImage, alt: product.name }],
      },
      twitter: {
        card: 'summary_large_image',
        title: ogTitle,
        description: ogDesc,
        images: [productImage],
      },
    };
  }

  // 3. Fallback: Check if it's a blog post URL
  const blog = await getBlogFromUrl(originalUrl);
  if (blog) {
    const ogBlogUrl = new URL('/api/og-blog', baseUrl);
    ogBlogUrl.searchParams.set('id', blog.id);

    const excerpt = blog.content ? blog.content.replace(/<[^>]*>/g, '').substring(0, 160) : 'Read the latest tech insights from BridgeTech IT Services';

    return {
      title: `${blog.title} | BridgeTech IT Services`,
      description: excerpt,
      openGraph: {
        title: blog.title,
        description: excerpt,
        url: `${baseUrl}/s/${params.code}`,
        siteName: 'BridgeTech IT Services',
        locale: 'en_SL',
        type: 'article',
        images: [
          {
            url: ogBlogUrl.toString(),
            width: 1200,
            height: 630,
            alt: blog.title,
          }
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: blog.title,
        description: excerpt,
        images: [ogBlogUrl.toString()],
      },
    };
  }

  // 3. Fallback metadata
  return {
    title: 'BridgeTech IT Services - Professional Repair Services',
    description: 'Professional computer and mobile repair services in Freetown, Sierra Leone',
    openGraph: {
      title: 'BridgeTech IT Services',
      description: 'Professional computer and mobile repair services in Freetown',
      url: `${baseUrl}/s/${params.code}`,
      siteName: 'BridgeTech IT Services',
      locale: 'en_SL',
      type: 'website',
      images: [
        {
          url: `${baseUrl}/assets/images/slide01.jpg`,
          width: 1200,
          height: 630,
          alt: 'BridgeTech IT Services',
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'BridgeTech IT Services',
      description: 'Professional computer and mobile repair services in Freetown',
      images: [`${baseUrl}/assets/images/slide01.jpg`],
    },
  };
}

export default function ShortUrlLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
