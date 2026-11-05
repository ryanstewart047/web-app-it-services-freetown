import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';
import { fetchBlogPosts } from '@/lib/github-blog-storage';
import { seoServices } from '@/data/seo-services';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Revalidate every hour

// Fetch blog posts from GitHub Issues API
async function getBlogPosts() {
  try {
    return await fetchBlogPosts();
  } catch (error) {
    console.error('Error fetching blog posts for sitemap:', error);
    return [];
  }
}

async function getProducts() {
  try {
    // Direct database query instead of API call
    const products = await prisma.product.findMany({
      where: {
        status: 'active',
        stock: {
          gt: 0
        }
      },
      select: {
        slug: true,
        updatedAt: true,
        createdAt: true,
      },
      take: 1000, // Limit to 1000 products
    });
    return products;
  } catch (error) {
    console.error('Error fetching products for sitemap:', error);
    return [];
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.itservicesfreetown.com';
  
  let products: any[] = [];
  let blogPosts: any[] = [];
  
  try {
    [products, blogPosts] = await Promise.all([getProducts(), getBlogPosts()]);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    // Continue with empty arrays if fetches fail
  }

  // Static pages - only include pages that actually exist
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/digital-tools`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/digital-tools/card-studio`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.95,
    },
    {
      url: `${baseUrl}/forensics-pro/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/marketplace`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/repair-showcase`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/forum`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/book-appointment`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/remote-support`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/repair-cost-checker-freetown`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/troubleshoot`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/repair-guides`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/track-repair`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/chat`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/download-app`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/learn-more`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/shirleys`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.65,
    },
  ];

  // Product pages - already filtered by status and stock in query
  const productPages: MetadataRoute.Sitemap = products.map((product: any) => ({
    url: `${baseUrl}/marketplace/${product.slug}`,
    lastModified: new Date(product.updatedAt || product.createdAt),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // SEO repair service pages (e.g. /repairs/phone-screen-repair-freetown)
  const repairPages: MetadataRoute.Sitemap = seoServices.map((service) => ({
    url: `${baseUrl}/repairs/${service.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.85,
  }));

  // Blog post pages from GitHub Issues
  const blogPages: MetadataRoute.Sitemap = blogPosts.map((post: any) => ({
    url: `${baseUrl}/blog/${post.id}`,
    lastModified: post.date ? new Date(post.date) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  return [...staticPages, ...repairPages, ...blogPages, ...productPages];
}
