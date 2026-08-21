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
    const description = customMeta.description || 'Shop quality IT products & services in Freetown, Sierra Leone';
    const priceFormatted = customMeta.price ? `Le ${customMeta.price}` : '';
    const fullTitle = priceFormatted ? `${title} - ${priceFormatted} | BridgeTech IT Services` : `${title} | BridgeTech IT Services`;

    const ogCustomUrl = new URL('/api/og-custom', baseUrl);
    ogCustomUrl.searchParams.set('title', title);
    if (customMeta.description) ogCustomUrl.searchParams.set('description', customMeta.description);
    if (customMeta.price) ogCustomUrl.searchParams.set('price', customMeta.price);
    if (customMeta.tag) ogCustomUrl.searchParams.set('tag', customMeta.tag);
    if (customMeta.image) ogCustomUrl.searchParams.set('image', customMeta.image);
    if (customMeta.theme) ogCustomUrl.searchParams.set('theme', customMeta.theme);
    if (customMeta.fit) ogCustomUrl.searchParams.set('fit', customMeta.fit);
    if (customMeta.scale) ogCustomUrl.searchParams.set('scale', String(customMeta.scale));

    return {
      title: fullTitle,
      description,
      openGraph: {
        title: priceFormatted ? `${title} - ${priceFormatted}` : title,
        description,
        url: `${baseUrl}/s/${params.code}`,
        siteName: 'BridgeTech IT Services',
        locale: 'en_SL',
        type: 'website',
        images: [
          {
            url: ogCustomUrl.toString(),
            width: 1200,
            height: 630,
            alt: title,
          }
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: priceFormatted ? `${title} - ${priceFormatted}` : title,
        description,
        images: [ogCustomUrl.toString()],
      },
    };
  }

  // 2. Fallback: Check if it's a product URL
  const product = await getProductFromUrl(originalUrl);
  if (product) {
    const productImage = product.images?.[0]?.url || '/assets/images/slide01.jpg';
    const absoluteProductImage = productImage.startsWith('http')
      ? productImage
      : `${baseUrl}${productImage}`;

    const price = new Intl.NumberFormat('en-SL', {
      style: 'currency',
      currency: 'SLL',
      minimumFractionDigits: 0,
    }).format(product.price);

    const ogImageUrl = new URL('/api/og-product', baseUrl);
    ogImageUrl.searchParams.set('name', product.name);
    ogImageUrl.searchParams.set('price', product.price.toString());
    ogImageUrl.searchParams.set('image', absoluteProductImage);
    ogImageUrl.searchParams.set('description', product.description || '');
    ogImageUrl.searchParams.set('condition', product.condition || 'new');

    const desc = product.description?.substring(0, 160) || 'Shop quality IT products in Freetown, Sierra Leone';

    return {
      title: `${product.name} - ${price} | BridgeTech IT Services`,
      description: desc,
      openGraph: {
        title: `${product.name} - ${price}`,
        description: desc,
        url: `${baseUrl}/s/${params.code}`,
        siteName: 'BridgeTech IT Services',
        locale: 'en_SL',
        type: 'website',
        images: [
          {
            url: ogImageUrl.toString(),
            width: 1200,
            height: 630,
            alt: product.name,
          }
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${product.name} - ${price}`,
        description: desc,
        images: [ogImageUrl.toString()],
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
