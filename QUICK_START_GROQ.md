# 🚀 Quick Start - Get Your Free Groq API Key (2 Minutes!)

## Your AI Chat is Almost Ready! Just Need 1 Thing...

Your website's AI chat and troubleshooting features are now configured to use **Groq** - which is:
- ✅ **100% FREE** (no credit card needed!)
- ✅ **10x FASTER** than Google AI
- ✅ **SUPER EASY** to set up

---

## 📝 3 Simple Steps:

### Step 1: Get Your Free API Key (1 minute)

1. **Click here**: 👉 **https://console.groq.com/keys** 👈

2. **Sign up** (if you don't have an account):
   - Click the "Sign Up" button
   - Use your email OR
   - Sign in with Google/GitHub (instant!)
   - ✅ **No credit card required!**

3. **Create your API key**:
   - Click "Create API Key" button
   - Give it a name: "IT Services Chat" (or anything you want)
   - Click "Submit"
   - **COPY THE KEY** (it looks like: `gsk_abc123xyz...`)
   - ⚠️ Save it somewhere - you won't see it again!

---

### Step 2: Add the Key to Your Website (30 seconds)

1. **Open this file**: `lib/groq-ai-client.ts`

2. **Find line 9** - it looks like this:
   ```typescript
   const GROQ_API_KEY = ''  // REPLACE THIS
   ```

3. **Paste your key** between the quotes:
   ```typescript
   const GROQ_API_KEY = 'gsk_YOUR_KEY_HERE_FROM_STEP_1'
   ```

4. **Save the file** (Ctrl+S or Cmd+S)

---

### Step 3: Rebuild and Deploy (30 seconds)

```bash
npm run build
git add lib/groq-ai-client.ts
git commit -m "Add Groq API key for AI chat"
git push
```

---

## ✅ That's It! Your AI Chat is Now Live!

### Test It:

1. **Go to your chat page**: `yourwebsite.com/chat`
2. **Ask a question**: "My computer is running slow"
3. **Watch the magic**: AI responds in < 1 second! ⚡

---

## 🎯 What You Get:

### AI-Powered Chat Support
- Instant responses to customer questions
- 24/7 availability
- Tech support expertise
- Appointment booking help
- Repair status tracking

### Smart Troubleshooting Tool
- Step-by-step repair guides
- AI diagnosis of device issues
- Difficulty and time estimates
- Professional recommendations

---

## 📊 Your Free Limits (Very Generous!)

- **30 requests per minute** = 1,800 per hour
- **14,400 requests per day** = 432,000 per month
- **Cost**: $0.00 forever (during beta)

That's enough for:
- ✅ Hundreds of customer chats per day
- ✅ 24/7 operation
- ✅ Multiple concurrent users
- ✅ Full-featured AI support

---

## 🆘 Need Help?

### If the AI doesn't respond:

1. **Check the browser console** (Press F12):
   - Look for red error messages
   - Common issue: "401 Unauthorized" = API key not set correctly

2. **Verify your API key**:
   - Make sure you copied the entire key (starts with `gsk_`)
   - No extra spaces before or after
   - Key is inside the quotes: `'gsk_...'`

3. **Test your key works**:
   - Go to: https://console.groq.com/playground
   - Try asking a question
   - If it works there, it should work on your site!

---

## 🎨 Want to Customize?

All AI behavior is in: `lib/groq-ai-client.ts`

**Change the AI's personality**:
```typescript
// Around line 65 - edit this message
const systemMessage = `You are a helpful IT support assistant...`
```

**Make it more formal/casual/funny** - just edit that message!

---

## 🚀 You're All Set!

Your customers can now:
- ✅ Get instant AI-powered help
- ✅ Receive smart troubleshooting guidance  
- ✅ Chat 24/7 even when you're offline
- ✅ Get faster service than ever before

**Questions?** Open an issue on GitHub or check `GROQ_API_SETUP.md` for detailed docs!

---

### 🎉 Congratulations!

You now have a **FREE, FAST, POWERFUL** AI assistant working for your business!

**Next**: Share your website and watch customers get instant help! 📱💻
