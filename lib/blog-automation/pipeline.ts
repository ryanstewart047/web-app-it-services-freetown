import { prisma } from '@/lib/prisma';
import { getUnprocessedFeedItems } from './rssParser';
import { scrapeArticleContent } from './scraper';
import { generateBlogDraft } from './llmWriter';
import { PipelineResult } from './types';

function createSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
  const shortId = Math.random().toString(36).substring(2, 7);
  return `${base.slice(0, 50)}-${shortId}`;
}

/**
 * Runs the end-to-end automated news pipeline:
 * 1. RSS check & deduplication
 * 2. Web scraping & HTML sanitization
 * 3. LLM generation with strict anti-AI rules
 * 4. DB insertion with status = 'draft' (NEVER auto-published)
 */
export async function runBlogAutomationPipeline(options: {
  maxArticles?: number;
} = {}): Promise<PipelineResult> {
  const maxArticles = options.maxArticles ?? 2;
  const errors: string[] = [];
  const createdDrafts: Array<{
    id: string;
    title: string;
    slug: string;
    sourceUrl: string;
  }> = [];

  console.log('[Blog Pipeline] Starting automated tech news scan...');

  // Step 1: Discover new unprocessed items
  const feedItems = await getUnprocessedFeedItems(5);
  console.log(`[Blog Pipeline] Found ${feedItems.length} unprocessed RSS items.`);

  if (feedItems.length === 0) {
    return {
      success: true,
      feedItemsFound: 0,
      newArticlesScraped: 0,
      draftsCreated: 0,
      drafts: [],
      skipped: 0,
      errors: [],
    };
  }

  let scrapedCount = 0;
  let skippedCount = 0;

  for (const item of feedItems) {
    if (createdDrafts.length >= maxArticles) {
      console.log(`[Blog Pipeline] Reached target limit of ${maxArticles} drafts.`);
      break;
    }

    try {
      console.log(`[Blog Pipeline] Scraping: "${item.title}" (${item.link})`);
      const article = await scrapeArticleContent(item.link, item.source, item.title);

      if (!article || article.wordCount < 100) {
        console.warn(`[Blog Pipeline] Content insufficient for ${item.link}, skipping.`);
        skippedCount++;
        // Record as processed so we don't repeatedly retry unparseable/paywalled stories
        await prisma.processedFeed.upsert({
          where: { guidHash: item.guidHash },
          update: {},
          create: {
            guidHash: item.guidHash,
            feedSource: item.source,
            sourceUrl: item.link,
            title: item.title,
          },
        });
        continue;
      }

      scrapedCount++;
      console.log(
        `[Blog Pipeline] Scraped ${article.wordCount} words. Generating article with LLM...`
      );

      const draftContent = await generateBlogDraft(article);
      const slug = createSlug(draftContent.h1Title);

      // Step 4: Transactional DB Injection with status = 'draft' and isPublished = false
      const savedDraft = await prisma.$transaction(async (tx) => {
        // Record feed as processed
        await tx.processedFeed.upsert({
          where: { guidHash: item.guidHash },
          update: {},
          create: {
            guidHash: item.guidHash,
            feedSource: item.source,
            sourceUrl: item.link,
            title: item.title,
          },
        });

        // Save draft with explicit draft safety locks
        return tx.automatedBlogDraft.create({
          data: {
            title: draftContent.metaTitle,
            h1Title: draftContent.h1Title,
            slug,
            metaTitle: draftContent.metaTitle,
            metaDescription: draftContent.metaDescription,
            tldr: draftContent.tldr,
            content: draftContent.combinedContent,
            editorNotes: draftContent.editorNotes,
            sourceUrl: item.link,
            sourceFeed: item.source,
            status: 'draft', // Critical safety flag
            isPublished: false, // Critical safety flag
          },
        });
      });

      console.log(
        `[Blog Pipeline] Successfully created draft: "${savedDraft.title}" (ID: ${savedDraft.id})`
      );

      createdDrafts.push({
        id: savedDraft.id,
        title: savedDraft.title,
        slug: savedDraft.slug,
        sourceUrl: savedDraft.sourceUrl || item.link,
      });
    } catch (err: any) {
      console.error(`[Blog Pipeline] Error processing item ${item.link}:`, err.message);
      errors.push(`Failed ${item.link}: ${err.message}`);
    }
  }

  return {
    success: errors.length === 0 || createdDrafts.length > 0,
    feedItemsFound: feedItems.length,
    newArticlesScraped: scrapedCount,
    draftsCreated: createdDrafts.length,
    drafts: createdDrafts,
    skipped: skippedCount,
    errors,
  };
}
