# 🔧 GitHub Token Issue - Quick Fix Guide

## ❌ Problem Identified

Your GitHub token has **expired or is invalid**, causing these errors:
- `401 Unauthorized - Bad credentials`
- Blog admin cannot save posts to GitHub
- Today's Offer popup cannot load from GitHub Gist

## ✅ Solution: Generate New GitHub Token

### Step-by-Step Instructions:

#### 1. **Open GitHub Token Creation Page**
Click this link: https://github.com/settings/tokens/new

Or manually:
- Go to GitHub.com
- Click your profile picture (top right)
- Settings → Developer settings → Personal access tokens → Tokens (classic) → Generate new token

#### 2. **Fill in the Form**

**Note:** `IT Services Blog & Offer Token`

**Expiration:** Choose one:
- `90 days` (recommended - more secure)
- `No expiration` (convenient but less secure)

**Select Scopes (Permissions):**
- ✅ **repo** - Full control of private repositories
- ✅ **gist** - Create gists
- ✅ **public_repo** - Access public repositories

#### 3. **Generate Token**
- Click green "Generate token" button
- **IMPORTANT:** Copy the token immediately!
- It looks like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
- You'll never see it again once you leave the page

#### 4. **Update Your .env.local File**

Open `.env.local` in your editor and replace these three lines:

```bash
# Old (expired) token - REPLACE THIS
NEXT_PUBLIC_GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Replace with new token:
NEXT_PUBLIC_GITHUB_TOKEN=ghp_YOUR_NEW_TOKEN_HERE
GITHUB_TOKEN=ghp_YOUR_NEW_TOKEN_HERE
GITHUB_ACCESS_TOKEN=ghp_YOUR_NEW_TOKEN_HERE
```

**Quick edit command:**
```bash
code .env.local
```

Or use terminal editor:
```bash
nano .env.local
```

#### 5. **Restart Your Server**

1. Stop the current server: Press `Ctrl+C` in the terminal
2. Start it again: `npm run dev`
3. The errors should be gone!

---

## 🚀 Alternative: Publish Blog Locally (No GitHub Needed)

If you want to publish the blog post **right now** without fixing GitHub:

### The blog system has a fallback:
- If GitHub fails, it saves posts to **localStorage**
- Posts will appear on your blog page
- When you fix the GitHub token later, you can manually copy posts to GitHub

### How to publish locally:

1. Go to: http://localhost:3001/blog/admin
2. Login with password: `ITServices2025!`
3. Paste your blog content
4. Click "Publish"
5. You'll see a message: "GitHub publish failed, saving locally..."
6. The post will still appear on your blog page!

---

## 🔍 Verify Token Works

After updating the token, check the terminal output when you visit the blog admin:

**Good (working):**
```
✓ Fetching blog posts from GitHub
✓ Posts retrieved successfully
```

**Bad (still broken):**
```
❌ 401 Unauthorized - Bad credentials
```

---

## 📝 What Each Token Does

| Environment Variable | Purpose |
|---------------------|---------|
| `NEXT_PUBLIC_GITHUB_TOKEN` | Blog posts (GitHub Issues) |
| `GITHUB_TOKEN` | Today's Offer (GitHub Gist) |
| `GITHUB_ACCESS_TOKEN` | Bookings sync (optional) |

All three can use the **same token** - just copy it to all three places.

---

## ⚠️ Security Tips

1. **Never share your token** with anyone
2. **Don't commit** `.env.local` to Git (it's already in `.gitignore`)
3. **Set expiration** to 90 days for better security
4. **Regenerate token** if you think it's compromised

---

## 🎯 Quick Command Summary

```bash
# Open token creation page in browser
$BROWSER https://github.com/settings/tokens/new

# Edit .env.local file
code .env.local

# Or use nano
nano .env.local

# After updating, restart server
# Press Ctrl+C, then:
npm run dev
```

---

## ✅ After Fixing

Once you have a valid token:

1. ✅ Blog admin will work perfectly
2. ✅ Posts save to GitHub Issues automatically
3. ✅ Today's Offer popup loads correctly
4. ✅ No more 401 errors in terminal
5. ✅ Comments system works
6. ✅ All GitHub features work

---

## 🆘 Still Having Issues?

If you still see errors after updating:

**Check:**
- Token starts with `ghp_`
- No spaces before/after token
- You selected `repo` and `gist` scopes
- You saved the file
- You restarted the server

**Test your token:**
```bash
curl -H "Authorization: token YOUR_TOKEN" https://api.github.com/user
```

Should return your GitHub user info, not an error.

---

**Ready to fix? Run:** `./fix-github-token.sh` for a quick reminder!
