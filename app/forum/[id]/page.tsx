import { Metadata } from 'next';
import { fetchForumTopicById } from '@/lib/github-forum-storage';
import TopicClient from './TopicClient';

interface PageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const topic = await fetchForumTopicById(params.id);

  if (!topic) {
    return {
      title: 'Post Not Found | IT Services Freetown',
    };
  }

  // Strip HTML and metadata from content for a clean description
  const cleanDescription = topic.content
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/^\[Author: .*?\]/, '') // Remove author metadata
    .replace(/^\[Category: .*?\]/, '') // Remove category metadata
    .trim()
    .substring(0, 160) + '...';

  const images = topic.images && topic.images.length > 0 
    ? [topic.images[0]] // Use the first image from the post
    : ['/forum-favicon.svg']; // Fallback to logo

  return {
    title: `${topic.title} | Technicians Forum`,
    description: cleanDescription,
    openGraph: {
      title: topic.title,
      description: cleanDescription,
      url: `https://www.itservicesfreetown.com/forum/${params.id}`,
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
