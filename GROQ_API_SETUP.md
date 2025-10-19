# Groq API Setup Guide

This project uses **Groq** for AI-powered chat and troubleshooting features. Groq is completely **FREE**, extremely **FAST**, and requires **NO CREDIT CARD** to get started!

## Why Groq?

- ✅ **Completely Free** - No payment required, generous free tier
- ✅ **Blazing Fast** - Faster than OpenAI and Google AI
- ✅ **High Quality** - Uses Llama 3.1 model
- ✅ **No Credit Card** - Sign up instantly
- ✅ **Easy Integration** - OpenAI-compatible API

## Step 1: Get Your Free API Key

1. **Visit Groq Console**: Go to https://console.groq.com

2. **Sign Up** (Takes 1 minute):
   - Click "Sign Up" or "Get Started"
   - Use your email or sign in with Google/GitHub
   - No credit card required!

3. **Generate API Key**:
   - Once logged in, go to https://console.groq.com/keys
   - Click "Create API Key"
   - Give it a name (e.g., "IT Services Freetown Chat")
   - Copy the API key (starts with `gsk_...`)
   - **Important**: Save it somewhere safe - you can't see it again!

## Step 2: Add Your API Key to the Project

1. **Open the file**: `lib/groq-ai-client.ts`

2. **Find this line** (around line 9):
   ```typescript
   const GROQ_API_KEY = ''  // REPLACE THIS
   ```

3. **Replace with your key**:
   ```typescript
   const GROQ_API_KEY = 'gsk_YOUR_ACTUAL_KEY_HERE'
   ```

4. **Save the file**

## Step 3: Test It Out

1. **Rebuild the project**:
   ```bash
   npm run build
   ```

2. **Test the chat**:
   - Go to your website's chat page
   - Ask a question like "My computer is running slow"
   - The AI should respond with helpful troubleshooting advice!

3. **Test the troubleshooter**:
   - Go to the troubleshoot page
   - Select your device type
   - Describe an issue
   - Get step-by-step AI-powered guidance

## Features Using Groq AI

### 1. **Chat Support** (`/chat`)
- Real-time AI responses to customer questions
- Understands tech support queries
- Provides booking assistance
- Repair tracking integration

### 2. **Troubleshooting Tool** (`/troubleshoot`)
- AI-powered diagnostic analysis
- Step-by-step repair instructions
- Difficulty assessment
- Time estimates for repairs

## Troubleshooting

### AI Returns Fallback Responses
If you see generic responses instead of AI-generated ones:

1. **Check API Key**: Make sure you've added your Groq API key to `lib/groq-ai-client.ts`
2. **Check Browser Console**: Open Developer Tools (F12) and look for error messages
3. **Verify Key Works**: Test your key at https://console.groq.com/playground

### Common Issues

**"401 Unauthorized"**
- Your API key is invalid or not set
- Double-check you copied the entire key (starts with `gsk_`)

**"Rate Limit Exceeded"**
- Very unlikely with Groq's generous limits
- Wait a few minutes and try again
- Check your usage at https://console.groq.com/usage

**"CORS Error"**
- Groq allows CORS from browser, so this shouldn't happen
- If it does, make sure you're using the correct API URL

## API Usage & Limits

Groq's free tier is extremely generous:

- **Rate Limits**: 
  - 30 requests per minute
  - 14,400 requests per day
  - More than enough for most small businesses!

- **Token Limits**:
  - 6,000 tokens per minute
  - Each chat message uses ~200-500 tokens
  - Plenty for real-time customer support

- **Cost**: **$0.00** - Completely free!

## Model Information

This project uses: **`llama-3.1-8b-instant`**

- **Speed**: Ultra-fast (< 1 second response)
- **Quality**: Excellent for customer support
- **Context**: 8K tokens (plenty for conversations)
- **Specialization**: General purpose, great for tech support

## Alternative Models

If you want to try different models, change the `GROQ_MODEL` constant in `lib/groq-ai-client.ts`:

```typescript
// Current (recommended for speed)
const GROQ_MODEL = 'llama-3.1-8b-instant'

// More powerful (slightly slower)
const GROQ_MODEL = 'llama-3.1-70b-versatile'

// Very fast and efficient
const GROQ_MODEL = 'mixtral-8x7b-32768'
```

## Security Notes

⚠️ **Important Security Considerations**:

1. **API Key in Code**: The API key is currently in client-side code, which means it's visible in the browser. This is OK for:
   - GitHub Pages deployments
   - Low-risk applications
   - Free tier usage

2. **Better Security** (Optional): For production with sensitive data:
   - Move API calls to a server-side API route
   - Store API key in environment variables
   - Add rate limiting per user

3. **Monitor Usage**: Check https://console.groq.com/usage regularly to ensure no abuse

## Support

- **Groq Documentation**: https://console.groq.com/docs
- **Groq Discord**: https://groq.com/discord
- **API Status**: https://status.groq.com

## Next Steps

Once your AI is working:

1. **Customize Prompts**: Edit the system messages in `lib/groq-ai-client.ts` to match your business tone
2. **Add More Features**: Extend the AI to handle appointment booking, pricing quotes, etc.
3. **Monitor Performance**: Check Groq console for usage stats and response times
4. **Collect Feedback**: Ask customers how helpful the AI responses are

---

**Need Help?** The AI should now be working! If you have any issues, check the browser console (F12) for detailed error messages.
