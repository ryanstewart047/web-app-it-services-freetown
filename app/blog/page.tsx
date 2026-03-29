import { fetchBlogPosts, fetchPostComments } from '@/lib/github-blog-storage';
import BlogClient from './BlogClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog | IT Services Freetown',
  description: 'Read the latest tech news, tutorials, and IT service insights from Freetown\'s leading repair shop.',
};

// Revalidate this page every hour (ISR) so it statically caches but updates
export const revalidate = 3600;

export default async function BlogPage() {
  try {
    // 1. Fetch posts and filter out drafts
    const rawPosts = await fetchBlogPosts();
    const publishedPosts = rawPosts.filter(post => !post.title.startsWith('[DRAFT]'));

    // 2. Fetch comments for all published posts so SSR includes them
    const postsWithComments = await Promise.all(
      publishedPosts.map(async (post) => {
        try {
          const comments = await fetchPostComments(parseInt(post.id));
          return {
            ...post,
            comments: comments.map(c => ({
              id: c.id.toString(),
              author: c.author,
              content: c.content,
              // Convert to ISO string so we can pass it as JSON to Client Component
              timestamp: c.timestamp instanceof Date ? c.timestamp.toISOString() : c.timestamp
            }))
          };
        } catch (e) {
          console.error(`Failed to load comments for post ${post.id}`, e);
          return { ...post, comments: [] };
        }
      })
    );

    return <BlogClient initialPosts={postsWithComments} />;
  } catch (error) {
    console.error('Error rendering blog page SSR:', error);
    // If GitHub API fails, render the client component with empty posts
    // so it can fall back to its internal localStorage mechanism
    return <BlogClient initialPosts={[]} />;
  }
}
