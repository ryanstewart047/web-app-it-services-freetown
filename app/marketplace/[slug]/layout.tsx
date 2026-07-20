import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';

interface Props {
  params: { slug: string };
}

async function getProduct(slug: string) {
  try {
    return await prisma.product.findFirst({
      where: {
        slug,
        status: 'active'
      },
      include: {
        category: true,
        images: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });
  } catch (error) {
    console.error('Error fetching product for metadata:', error);
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.slug);

  if (!product) {
    return {
      title: 'Product Not Found - IT Services Freetown',
      description: 'The product you are looking for could not be found.',
    };
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.itservicesfreetown.com';
  const productImage = product.images?.[0]?.url || '/assets/images/slide01.jpg';
  
  // Make product image URL absolute if relative
  const absoluteProductImage = productImage.startsWith('http')
    ? productImage
    : `${baseUrl}${productImage}`;

  const price = new Intl.NumberFormat('en-SL', {
    style: 'currency',
    currency: 'SLL',
    minimumFractionDigits: 0,
  }).format(product.price);

  // Generate dynamic OG image url
  const ogImageUrl = new URL('/api/og-product', baseUrl);
  ogImageUrl.searchParams.set('name', product.name);
  ogImageUrl.searchParams.set('price', product.price.toString());
  ogImageUrl.searchParams.set('image', absoluteProductImage);
  ogImageUrl.searchParams.set('description', product.description || '');
  ogImageUrl.searchParams.set('condition', product.condition || 'new');

  const formattedDescription = product.description.length > 160 
    ? `${product.description.substring(0, 157)}...`
    : product.description;

  return {
    title: `${product.name} - ${price} | IT Services Freetown`,
    description: formattedDescription,
    keywords: [
      product.name,
      product.brand || '',
      product.category?.name || '',
      'Freetown',
      'Sierra Leone',
      'buy',
      'shop',
      'IT products',
      product.sku || '',
    ].filter(Boolean),
    openGraph: {
      title: `${product.name} - ${price}`,
      description: product.description,
      url: `${baseUrl}/marketplace/${params.slug}`,
      siteName: 'IT Services Freetown',
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
      description: product.description.substring(0, 200),
      images: [ogImageUrl.toString()],
    },
    alternates: {
      canonical: `${baseUrl}/marketplace/${params.slug}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
