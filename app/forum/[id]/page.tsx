import { Metadata } from 'next';
import { headers } from 'next/headers';
import { fetchForumTopicById } from '@/lib/github-forum-storage';
import TopicClient from './TopicClient';

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const topic = await fetchForumTopicById(params.id);
  const host = headers().get('host') || 'www.itservicesfreetown.com';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  if (!topic) {
    return {
      title: 'Post Not Found | IT Services Freetown',
    };
  }

  // Strip HTML and metadata from content for a clean description
  const cleanDescription = topic.content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/^\[Author: .*?\]/, '') 
    .replace(/^\[Category: .*?\]/, '')
    .trim()
    .substring(0, 160) + '...';

  // Social platforms (WhatsApp, Slack, FB) don't support SVGs for previews.
  // Always use a PNG for the fallback or fully qualified image URL.
  const rawImages = topic.images && topic.images.length > 0 
    ? [topic.images[0]] 
    : [`${baseUrl}/assets/forum-logo.png`];

  // Ensure all image URLs are absolute
  const images = rawImages.map(url => url.startsWith('http') ? url : `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`);

  return {
    title: `${topic.title} | Technicians Forum`,
    description: cleanDescription,
    openGraph: {
      title: topic.title,
      description: cleanDescription,
      url: `${baseUrl}/forum/${params.id}`,
      siteName: 'IT Services Freetown Forum',
      images: images.map(url => ({
        url,
        width: 1200,
        height: 630,
        alt: topic.title,
      })),
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: topic.title,
      description: cleanDescription,
      images: images,
    },
    alternates: {
      canonical: `/forum/${params.id}`,
    },
  };
}

export default async function Page({ params }: PageProps) {
  const topic = await fetchForumTopicById(params.id);
  
  return (
    <TopicClient 
      id={params.id} 
      initialTopic={topic} 
    />
  );
}
