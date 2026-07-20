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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const originalUrl = await getOriginalUrl(params.code);
  
  if (!originalUrl) {
    return {
      title: 'Redirecting... | IT Services Freetown',
      description: 'IT Services Freetown - Professional Computer & Mobile Repair Services',
    };
  }

  // Check if it's a product URL
  const product = await getProductFromUrl(originalUrl);
  
  if (product) {
    const productImage = product.images?.[0]?.url || 'https://www.itservicesfreetown.com/og-marketplace.jpg';
    const price = new Intl.NumberFormat('en-SL', {
      style: 'currency',
      currency: 'SLL',
      minimumFractionDigits: 0,
    }).format(product.price);

    return {
      title: `${product.name} - ${price} | IT Services Freetown`,
      description: product.description?.substring(0, 160) || 'Shop quality IT products in Freetown, Sierra Leone',
      openGraph: {
        title: `${product.name} - ${price}`,
        description: product.description || 'Shop quality IT products in Freetown, Sierra Leone',
        url: `https://www.itservicesfreetown.com/s/${params.code}`,
        siteName: 'IT Services Freetown',
        locale: 'en_SL',
        type: 'website',
        images: [
          {
            url: productImage,
            width: 1200,
            height: 630,
            alt: product.name,
          }
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${product.name} - ${price}`,
        description: product.description?.substring(0, 200) || 'Shop quality IT products in Freetown, Sierra Leone',
        images: [productImage],
      },
    };
  }

  // Fallback metadata
  return {
    title: 'IT Services Freetown - Professional Repair Services',
    description: 'Professional computer and mobile repair services in Freetown, Sierra Leone',
    openGraph: {
      title: 'IT Services Freetown',
      description: 'Professional computer and mobile repair services in Freetown',
      url: `https://www.itservicesfreetown.com/s/${params.code}`,
      siteName: 'IT Services Freetown',
      locale: 'en_SL',
      type: 'website',
      images: [
        {
          url: 'https://www.itservicesfreetown.com/assets/images/slide01.jpg',
          width: 1200,
          height: 630,
          alt: 'IT Services Freetown',
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'IT Services Freetown',
      description: 'Professional computer and mobile repair services in Freetown',
      images: ['https://www.itservicesfreetown.com/assets/images/slide01.jpg'],
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
