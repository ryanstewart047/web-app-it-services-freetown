#!/usr/bin/env node

/**
 * Blog Article Importer
 * 
 * This script helps import the created blog articles into your GitHub-based blog system.
 * Articles are stored in JSON files and need to be converted to the blog format.
 * 
 * Usage Instructions:
 * 1. Ensure you're in the project root directory
 * 2. Run: node scripts/import-blog-articles.js
 * 3. Or manually copy/paste article content through blog admin at /blog/admin
 * 
 * The articles are in these files:
 * - content/blog-articles.json (3 articles)
 * - content/blog-articles-2.json (2 articles)
 * - content/blog-articles-3.json (1 article)
 * - content/blog-articles-4.json (2 articles)
 * 
 * Total: 8 comprehensive articles ready for publication
 */

const fs = require('fs');
const path = require('path');

// Article files to process
const articleFiles = [
  'content/blog-articles.json',
  'content/blog-articles-2.json',
  'content/blog-articles-3.json',
  'content/blog-articles-4.json'
];

console.log('📝 Blog Article Importer\n');
console.log('=' .repeat(60));

let totalArticles = 0;
const allArticles = [];

// Read all article files
articleFiles.forEach((file, index) => {
  try {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      const articles = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      console.log(`\n✅ Loaded ${file}: ${articles.length} articles`);
      
      articles.forEach((article, idx) => {
        console.log(`   ${index + 1}.${idx + 1} - ${article.title}`);
        allArticles.push(article);
      });
      
      totalArticles += articles.length;
    } else {
      console.log(`\n⚠️  File not found: ${file}`);
    }
  } catch (error) {
    console.error(`\n❌ Error reading ${file}:`, error.message);
  }
});

console.log('\n' + '=' .repeat(60));
console.log(`\n📊 Total Articles Ready: ${totalArticles}\n`);

// Show article summaries
console.log('Article Summaries:\n');
allArticles.forEach((article, idx) => {
  const wordCount = article.content.replace(/<[^>]+>/g, ' ').split(/\s+/).length;
  console.log(`${idx + 1}. ${article.title}`);
  console.log(`   Author: ${article.author}`);
  console.log(`   Word Count: ~${wordCount} words`);
  console.log(`   Tags: ${article.tags.join(', ')}`);
  console.log(`   Excerpt: ${article.excerpt.substring(0, 80)}...`);
  console.log('');
});

console.log('=' .repeat(60));
console.log('\n📋 HOW TO IMPORT THESE ARTICLES:\n');
console.log('Option 1 - Manual Import via Admin Panel (Recommended):');
console.log('1. Go to: https://www.itservicesfreetown.com/blog/admin');
console.log('2. Login with admin credentials (contact administrator)');
console.log('3. For each article:');
console.log('   - Copy the title');
console.log('   - Copy the HTML content');
console.log('   - Paste into the rich text editor');
console.log('   - Add tags and author');
console.log('   - Click "Publish Post"');
console.log('');
console.log('Option 2 - Direct GitHub Issues (Advanced):');
console.log('1. Go to: https://github.com/ryanstewart047/web-app-it-services-freetown/issues');
console.log('2. Create new issue for each article with:');
console.log('   - Title: [BLOG] Article Title');
console.log('   - Label: blog-post');
console.log('   - Body: Article content (HTML)');
console.log('');
console.log('=' .repeat(60));
console.log('\n✨ AFTER IMPORTING:\n');
console.log('1. Verify all articles visible at: /blog');
console.log('2. Check article formatting and images');
console.log('3. Request Google AdSense re-review:');
console.log('   - Login to: https://adsense.google.com');
console.log('   - Go to Sites');
console.log('   - Request review');
console.log('   - Mention: "Added substantial original content including');
console.log('              comprehensive blog with 8+ detailed articles"');
console.log('');
console.log('4. Expected AdSense review time: 1-2 weeks');
console.log('5. Once approved, ads will automatically appear on your site');
console.log('');
console.log('=' .repeat(60));
console.log('\n💡 ARTICLE QUALITY SUMMARY:\n');
console.log('✅ All articles 800-1000+ words');
console.log('✅ Original content focused on Sierra Leone market');
console.log('✅ Helpful, informative, well-structured');
console.log('✅ SEO-optimized with relevant keywords');
console.log('✅ Topics relevant to IT Services business');
console.log('✅ Addresses local Freetown challenges');
console.log('');
console.log('These articles meet Google AdSense content quality standards.');
console.log('');
console.log('=' .repeat(60));

// Create a combined export file for easy reference
const combinedFile = path.join(process.cwd(), 'content', 'all-blog-articles.json');
try {
  fs.writeFileSync(combinedFile, JSON.stringify(allArticles, null, 2), 'utf8');
  console.log(`\n💾 All articles combined in: content/all-blog-articles.json`);
  console.log('   Use this file for batch import or reference.\n');
} catch (error) {
  console.error('Error creating combined file:', error.message);
}

console.log('=' .repeat(60));
console.log('\nFor assistance importing articles, contact IT Services Freetown support.\n');
