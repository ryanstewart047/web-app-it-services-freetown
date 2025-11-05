#!/bin/bash

# Convert blog post to GitHub Issue format

BLOG_FILE="blog-posts/best-laptops-freetown-2025.md"
OUTPUT_FILE="blog-posts/github-issue-format.txt"

echo "=================================="
echo "  Blog Post to GitHub Issue"
echo "  Converter"
echo "=================================="
echo ""

if [ ! -f "$BLOG_FILE" ]; then
    echo "❌ Error: Blog post file not found!"
    exit 1
fi

# Create the GitHub Issue format
cat > "$OUTPUT_FILE" << 'ISSUE_START'
<!--
BLOG_POST_METADATA
{
  "author": "IT Services Freetown",
  "date": "2025-11-05",
  "media": []
}
-->

ISSUE_START

# Append the blog content
cat "$BLOG_FILE" >> "$OUTPUT_FILE"

echo "✅ Conversion complete!"
echo ""
echo "📄 Output saved to: $OUTPUT_FILE"
echo ""
echo "=================================="
echo "  Next Steps:"
echo "=================================="
echo ""
echo "1. Copy the content:"
echo "   cat $OUTPUT_FILE | pbcopy"
echo "   (or manually open and copy)"
echo ""
echo "2. Create GitHub Issue:"
echo "   https://github.com/ryanstewart047/web-app-it-services-freetown/issues/new"
echo ""
echo "3. Fill in:"
echo "   - Title: Best Laptops in Freetown 2025: Complete Buying Guide"
echo "   - Label: blog-post (IMPORTANT!)"
echo "   - Body: Paste the copied content"
echo ""
echo "4. Submit the issue"
echo ""
echo "5. Your blog post will appear automatically!"
echo ""
echo "=================================="
echo ""
echo "View the formatted content now:"
echo ""

# Show preview
head -50 "$OUTPUT_FILE"
echo ""
echo "..."
echo "(Full content saved in $OUTPUT_FILE)"
echo ""
