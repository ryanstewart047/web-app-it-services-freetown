import { Metadata } from 'next';
import { notFound } from 'next/navigation';

interface Props {
  params: { slug: string };
}

async function getProduct(slug: string) {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'https://itservicesfreetown.com'}/api/products`, {
      cache: 'no-store'
    });
    
    if (!res.ok) return null;
    
    const products = await res.json();
    return products.find((p: any) => p.slug === slug);
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

  const productImage = product.images?.[0]?.url || 'https://itservicesfreetown.com/default-product.jpg';
  const price = new Intl.NumberFormat('en-SL', {
    style: 'currency',
    currency: 'SLL',
    minimumFractionDigits: 0,
  }).format(product.price);

  return {
    title: `${product.name} - ${price} | IT Services Freetown`,
    description: product.description.length > 160 
      ? `${product.description.substring(0, 157)}...`
      : product.description,
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
      url: `https://itservicesfreetown.com/marketplace/${params.slug}`,
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
      description: product.description.substring(0, 200),
      images: [productImage],
    },
    alternates: {
      canonical: `https://itservicesfreetown.com/marketplace/${params.slug}`,
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
