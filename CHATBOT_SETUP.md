# 🤖 AI Chatbot Setup Guide (Groq - FREE Edition)

## ✨ Why Groq?

- **100% FREE** - No credit card required!
- **Fast** - Blazing fast responses (faster than GPT-4!)
- **Generous limits** - 14,400 requests/day on free tier
- **Easy setup** - Get API key in 30 seconds

---

## 🚀 Quick Start (3 Steps)

### Step 1: Get Your Free Groq API Key

1. Go to **https://console.groq.com**
2. Sign up with Google/GitHub (takes 10 seconds)
3. Click **"API Keys"** in the sidebar
4. Click **"Create API Key"**
5. Copy your key (starts with `gsk_...`)

**No credit card needed! ✅**

---

### Step 2: Add API Key to Project

1. Open `backend/.env` file
2. Find this line:
   ```
   GROQ_API_KEY=your_groq_api_key_here
   ```
3. Replace with your actual key:
   ```
   GROQ_API_KEY=gsk_your_actual_key_here
   ```
4. Save the file

---

### Step 3: Restart Backend

```bash
# Stop the current server (Ctrl + C in the backend terminal)
node app.js
```

**That's it!** The chatbot is now powered by Groq AI! 🎉

---

## 🧪 Test the Chatbot

1. Open **http://localhost:3000**
2. Click the **purple chat button** (bottom-right)
3. Try these messages:
   - "What are your baggage policies?"
   - "How do I check in online?"
   - "Tell me about your loyalty program"

You should get **intelligent, conversational responses** instantly!

---

## 📊 Groq Free Tier Limits

| Metric              | Limit          |
| ------------------- | -------------- |
| **Requests/Day**    | 14,400         |
| **Requests/Minute** | 30             |
| **Tokens/Minute**   | 18,000         |
| **Cost**            | **$0** (FREE!) |

Perfect for development and small-scale production!

---

## 🎯 Available Models

The chatbot uses **Mixtral-8x7B** by default (fast & smart), but you can switch to:

- `llama-3.3-70b-versatile` - Most capable
- `llama-3.1-70b-versatile` - Balanced performance
- `mixtral-8x7b-32768` - Fast responses (default)
- `gemma2-9b-it` - Lightweight

To change the model, edit `backend/services/ai/chatbot.service.js` line 10.

---

## ❓ Troubleshooting

### "Missing credentials" error?

- Make sure you added `GROQ_API_KEY` to `.env`
- Restart the backend server

### "Rate limit exceeded"?

- Free tier: 30 requests/minute
- Wait 60 seconds or upgrade to paid tier

### Chatbot not responding?

- Check if backend is running (`node app.js`)
- Verify API key is correct in `.env`
- Check browser console for errors (F12)

---

## 🆚 Groq vs Others

| Feature         | Groq (FREE)     | OpenAI      | DeepSeek    |
| --------------- | --------------- | ----------- | ----------- |
| **Cost**        | ✅ $0           | ❌ Paid     | ❌ Paid     |
| **Speed**       | ✅ Very Fast    | 🟡 Medium   | 🟡 Medium   |
| **Free Tier**   | ✅ 14K/day      | ❌ No       | ❌ Limited  |
| **Credit Card** | ✅ Not Required | ❌ Required | ❌ Required |

---

## 🎉 Ready to Go!

Your chatbot is now powered by **100% free AI** from Groq!

**Next Steps:**

- Complete Feature 2: Payment Gateway Expansion
- Add more features from the implementation plan
- Deploy your airline reservation system

**Need help?** The chatbot code is production-ready and fully functional! 🚀
