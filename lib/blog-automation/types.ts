export interface FeedItem {
  guid: string;
  guidHash: string;
  title: string;
  link: string;
  pubDate?: string;
  source: string;
  summary?: string;
}

export interface ScrapedArticle {
  title: string;
  url: string;
  source: string;
  cleanText: string;
  wordCount: number;
}

export interface GeneratedBlogDraft {
  metaTitle: string;
  metaDescription: string;
  tldr: string;
  h1Title: string;
  bodyContent: string;
  bottomLine: string;
  editorNotes: string;
  combinedContent: string;
}

export interface PipelineResult {
  success: boolean;
  feedItemsFound: number;
  newArticlesScraped: number;
  draftsCreated: number;
  drafts: Array<{
    id: string;
    title: string;
    slug: string;
    sourceUrl: string;
  }>;
  skipped: number;
  errors: string[];
}
