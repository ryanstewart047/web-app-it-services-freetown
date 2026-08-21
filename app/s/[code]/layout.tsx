import { Metadata } from 'next';

interface Props {
  params: { code: string };
}

// Helper to get URL mapping from file
async function getOriginalUrl(code: string): Promise<string | null> {
  try {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(process.cwd(), 'data', 'short-urls.json');
    
    if (!fs.existsSync(filePath)) {
      return null;
    }
    
    const data = fs.readFileSync(filePath, 'utf-8');
    const urlMap = JSON.parse(data);
    return urlMap[code] || null;
  } catch (error) {
    console.error('Error reading short URL mapping:', error);
    return null;
  }
}

// Helper to get product data from URL
async function getProductFromUrl(url: string) {
  try {
    // Extract slug from URL like /marketplace/dell-laptop-i5
    const match = url.match(/\/marketplace\/([^/?]+)/);
    if (!match) return null;
    
    const slug = match[1];
    
    // Fetch product data
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
  const originalUrl = await getOriginalUrl(params.code);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.itservicesfreetown.com';
  
  if (!originalUrl) {
    return {
      title: 'Redirecting... | BridgeTech IT Services',
      description: 'BridgeTech IT Services - Professional Computer & Mobile Repair Services',
    };
  }

  // 1. Check if it's a product URL
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

  // 2. Check if it's a blog post URL
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
