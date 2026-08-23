import { prisma } from '@/lib/prisma';
import ProductDetailClient from './ProductDetailClient';
import { Metadata } from 'next';
import Link from 'next/link';

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      images: {
        orderBy: {
          order: 'asc'
        }
      }
    }
  });

  if (!product) {
    return {
      title: 'Product Not Found | BridgeTech IT Services',
      description: 'The requested product could not be found.'
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.itservicesfreetown.com';
  const imageUrl = product.images?.[0]?.url || '';
  let fullImageUrl = imageUrl.startsWith('http') 
    ? imageUrl 
    : imageUrl ? `${baseUrl}${imageUrl}` : '';
  
  // Convert GitHub blob URLs to raw URLs so og-product can actually fetch the image
  if (fullImageUrl.includes('github.com') && fullImageUrl.includes('/blob/')) {
    fullImageUrl = fullImageUrl
      .replace('https://github.com/', 'https://raw.githubusercontent.com/')
      .replace('/blob/', '/')
      .replace(/[?&]raw=true/, '')
  }
  
  const truncatedDesc = product.description.length > 100 
    ? product.description.substring(0, 100) 
    : product.description;

  // Direct image URL for OG preview (prevents Vercel serverless image rendering origin transfer)
  const ogImageUrl = fullImageUrl || `${baseUrl}/assets/images/slide01.jpg`;

  return {
    title: `${product.name} - Le ${product.price.toLocaleString()} | BridgeTech IT Services`,
    description: truncatedDesc,
    openGraph: {
      title: `${product.name} - Le ${product.price.toLocaleString()}`,
      description: truncatedDesc,
      url: `${baseUrl}/marketplace/${product.slug}`,
      siteName: 'BridgeTech IT Services',
      images: [
        {
          url: ogImageUrl,
          alt: product.name,
        }
      ],
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} - Le ${product.price.toLocaleString()}`,
      description: truncatedDesc,
      images: [ogImageUrl],
    },
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      images: {
        orderBy: {
          order: 'asc'
        }
      }
    }
  });

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h2>
          <Link href="/marketplace" className="text-red-400 hover:text-red-300">
            ← Back to Marketplace
          </Link>
        </div>
      </div>
    );
  }

  // Convert prisma date fields or complex nested relations to simple objects for serializability if needed
  // Prisma model objects are plain objects so we can pass them directly.
  return <ProductDetailClient initialProduct={JSON.parse(JSON.stringify(product))} />;
}
