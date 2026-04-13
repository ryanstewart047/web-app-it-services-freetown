import { marked } from 'marked';
import { sendForumNotification } from './notifications';

const GITHUB_OWNER = 'ryanstewart047';
const GITHUB_REPO = 'web-app-it-services-freetown';
const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN || '';

export interface ForumTopic {
  id: string; // Issue number as string
  title: string;
  content: string; // Markdown parsed HTML
  author: string;
  date: string;
  category: string;
  repliesCount: number;
  images: string[];
}

export interface ForumReply {
  id: string; // Comment ID
  author: string;
  content: string; // Markdown parsed
  createdAt: string;
}

/**
 * Fetch all Forum Topics
 */
export async function fetchForumTopics(): Promise<ForumTopic[]> {
  try {
    const headers: HeadersInit = { 'Accept': 'application/vnd.github.v3+json' };
    if (GITHUB_TOKEN) headers['Authorization'] = `token ${GITHUB_TOKEN}`;

    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues?labels=forum-post&state=open&sort=updated&direction=desc`,
      { headers, cache: 'no-store' }
    );

    if (!res.ok) throw new Error('Failed to fetch topics');

    const issues: any[] = await res.json();

    return await Promise.all(issues.map(async issue => {
      const parsedContent = await marked.parse(issue.body || '', { async: true, breaks: true, gfm: true });
      const metadataMatches = issue.body?.match(/\[Author: (.+?)\]/);
      const author = metadataMatches ? metadataMatches[1] : issue.user.login;

      const categoryMatches = issue.body?.match(/\[Category: (.+?)\]/);
      const category = categoryMatches ? categoryMatches[1] : 'General';

      // Extract image tags natively from Markdown to show thumbnails
      const imageRegex = /!\[.*?\]\((.*?)\)/g;
      const images: string[] = [];
      let match;
      while ((match = imageRegex.exec(issue.body || '')) !== null) {
        images.push(match[1]);
      }

      return {
        id: issue.number.toString(),
        title: issue.title,
        content: parsedContent,
        author: author,
        category: category,
        date: new Date(issue.created_at).toISOString(),
        repliesCount: issue.comments,
        images: images.slice(0, 2) // Max 2 per spec requirement
      };
    }));
  } catch (error) {
    console.error('Forum fetch error:', error);
    return [];
  }
}

/**
 * Fetch Replies for a specific Topic
 */
export async function fetchForumReplies(issueNumber: number): Promise<ForumReply[]> {
  try {
    const headers: HeadersInit = { 'Accept': 'application/vnd.github.v3+json' };
    if (GITHUB_TOKEN) headers['Authorization'] = `token ${GITHUB_TOKEN}`;

    const res = await fetch(
      `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues/${issueNumber}/comments`,
      { headers, cache: 'no-store' }
    );

    if (!res.ok) throw new Error('Failed to fetch replies');

    const comments: any[] = await res.json();

    return await Promise.all(comments.map(async comment => {
      const parsedContent = await marked.parse(comment.body || '', { async: true, breaks: true, gfm: true });
      const metadataMatches = comment.body?.match(/\[Author: (.+?)\]/);
      const author = metadataMatches ? metadataMatches[1] : comment.user.login;
      
      // Clean hidden metadata from actual displayed HTML
      const displayContent = parsedContent.replace(/<p>\[Author: .*?\]<\/p>/, '');

      return {
        id: comment.id.toString(),
        author: author,
        content: displayContent,
        createdAt: new Date(comment.created_at).toISOString()
      };
    }));
  } catch (error) {
    console.error('Replies fetch error:', error);
    return [];
  }
}

/**
 * Create a new Forum Topic
 */
export async function createForumTopic(title: string, content: string, author: string, images: string[] = [], category: string = 'General'): Promise<{ success: boolean; id?: string }> {
  try {
    let finalBody = `[Author: ${author}]\n[Category: ${category}]\n\n${content}`;
    
    // Append markdown images at the bottom of the body
    if (images.length > 0) {
      finalBody += `\n\n---`;
      images.forEach((imgUrl, idx) => {
         if (idx < 2) finalBody += `\n\n![Forum Attachment ${idx+1}](${imgUrl})`; // Capped at 2 per requirements
      });
    }

    const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues`, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title,
        body: finalBody,
        labels: ['forum-post']
      })
    });

    if (!res.ok) throw new Error('API failure');
    const issue = await res.json();

    // Trigger Notifications
    await sendForumNotification({
      title: 'New Forum Post',
      body: `${author} posted: ${title}`,
      data: { url: `/forum/${issue.number}` }
    });

    return { success: true, id: issue.number.toString() };
  } catch (error) {
    console.error('Create topic error:', error);
    return { success: false };
  }
}

/**
 * Add a Reply to a Forum Topic
 */
export async function addForumReply(issueNumber: number, content: string, author: string, images: string[] = []): Promise<{ success: boolean }> {
  try {
    let finalBody = `[Author: ${author}]\n\n${content}`;
    
    if (images.length > 0) {
      finalBody += `\n\n---`;
      images.forEach((imgUrl, idx) => {
         if (idx < 2) finalBody += `\n\n![Attachment ${idx+1}](${imgUrl})`;
      });
    }

    const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/issues/${issueNumber}/comments`, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ body: finalBody })
    });

    if (!res.ok) throw new Error('API failure');
    
    // Trigger Notifications
    await sendForumNotification({
      title: 'New Reply',
      body: `${author} replied to a topic you follow.`,
      data: { url: `/forum/${issueNumber}` }
    });

    return { success: true };
  } catch (error) {
    console.error('Add reply error:', error);
    return { success: false };
  }
}

/**
 * Upload an Image directly into the GitHub repository public folder via Base64.
 * This ensures permanent, highly available, and free hosting attached directly to the git history.
 */
export async function uploadForumImage(base64Content: string, fileName: string): Promise<{ success: boolean; url?: string }> {
  try {
    // base64Content usually has prefix data:image/png;base64,..... We must strip that for GitHub REST API
    const cleanBase64 = base64Content.replace(/^data:image\/\w+;base64,/, "");

    const uniqueFileName = `${Date.now()}-${fileName.replace(/\s+/g, '-')}`;
    const path = `public/forum-uploads/${uniqueFileName}`;

    const res = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`, {
      method: 'PUT',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `Upload forum media: ${uniqueFileName}`,
        content: cleanBase64
      })
    });

    if (!res.ok) {
       console.error("GitHub file upload failed:", await res.text());
       throw new Error('Upload failed');
    }

    // Convert github path to public frontend path served directly by Vercel!
    // GitHub pushes it to master, Vercel pulls it on next deploy, BUT while waiting it can be served via raw github user content.
    // For immediate access without waiting for a redeploy, serve it natively through GitHub raw!
    const directUrl = `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/main/${path}`;

    return { success: true, url: directUrl };
  } catch (error) {
    console.error('Upload image error:', error);
    return { success: false };
  }
}
