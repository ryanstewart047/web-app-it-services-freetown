# GitHub Issues Blog Storage Setup

This blog uses GitHub Issues as a database to sync posts and comments across all devices.

## Setup Steps

### 1. Create GitHub Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name: `Blog Admin Token`
4. Select scopes:
   - ✅ `public_repo` (for public repositories)
   - ✅ `repo` (if your repo is private)
5. Click **"Generate token"**
6. **Copy the token** (you won't see it again!)

### 2. Add Token to Your Project

Add this to your `.env.local` file:

```bash
NEXT_PUBLIC_GITHUB_TOKEN=ghp_your_token_here
```

### 3. How It Works

**Blog Posts = GitHub Issues**
- Each blog post is a GitHub Issue with the `blog-post` label
- Title = Issue title
- Content = Issue body
- Metadata (author, media) stored in HTML comment at top of body

**Comments = GitHub Issue Comments**
- Visitors' comments become issue comments
- Names are stored in the comment body

**Likes/Dislikes = GitHub Reactions**
- 👍 = Like
- 👎 = Dislike
- Reactions sync across all devices

### 4. Benefits

✅ **Works with Static Sites** - No server needed  
✅ **Free Forever** - GitHub's API is free  
✅ **Syncs Across Devices** - All data stored in GitHub  
✅ **Version Control** - Full history of posts/comments  
✅ **Moderation Tools** - Use GitHub's interface to manage  
✅ **No Database Setup** - Uses your existing GitHub repo  

### 5. Rate Limits

**Without Token:**
- 60 requests/hour per IP

**With Token:**
- 5,000 requests/hour

**Recommendation:** Always use a token for better limits.

### 6. Managing Blog Posts

**View All Posts:**
https://github.com/ryanstewart047/web-app-it-services-freetown/issues?q=label%3Ablog-post

**Create Post Manually:**
1. Go to Issues tab
2. Click "New Issue"
3. Add `blog-post` label
4. Add metadata comment (see format in code)

**Or use the Admin Panel** (requires token)

### 7. Privacy & Security

- ⚠️ Token gives write access to your repo
- ✅ Store token in `.env.local` (gitignored)
- ✅ For production, use GitHub Actions or Netlify env vars
- ✅ Never commit tokens to GitHub

### 8. Troubleshooting

**"GitHub token required" error:**
- Add `NEXT_PUBLIC_GITHUB_TOKEN` to `.env.local`
- Rebuild: `npm run build`

**Can't create posts:**
- Check token has `repo` or `public_repo` scope
- Verify token in GitHub settings

**Rate limit errors:**
- Add token to increase limit to 5,000/hour
- Or wait for limit to reset (1 hour)

---

## Production Deployment

For GitHub Pages, you can't use environment variables. Options:

1. **Hardcode token** (not recommended for public repos)
2. **Use GitHub Actions** to inject token at build time
3. **Accept read-only mode** - visitors can view but not comment/like
4. **Use personal repo** - keep blog-issues in separate private repo

---

**Current Setup:** Posts stored as Issues in `ryanstewart047/web-app-it-services-freetown`
