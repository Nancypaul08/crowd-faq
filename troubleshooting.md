# Crowd FAQ — Troubleshooting

## Quick Diagnosis

```
Can't start frontend?   → Check port 5173 is free
Can't start backend?    → Check port 5001 is free + MongoDB is running
AI chat not working?    → Check Ollama is running (curl localhost:11434)
FAQ not saving?         → Check MongoDB is running + JWT is valid
Socket.io not updating? → Check CLIENT_URL matches frontend URL
```

---

## Frontend Issues

### `npm run dev` fails with "address already in use"

**Error:**
```
Error: listen EADDRINUSE :::5173
```

**Fix:**
```bash
# Find and kill the process on port 5173
lsof -ti :5173 | xargs kill -9
# Or use a different port
npm run dev -- --port 5174
```

### Vite shows blank page

**Check:**
1. Browser console for errors (F12 → Console)
2. Is the backend running? (`curl http://localhost:5001/api/health`)
3. Is `VITE_API_URL` in `client/.env` pointing to `http://localhost:5001`?

**Fix:**
```bash
# Restart frontend
npm run dev
# Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

### CORS error in browser console

**Error:**
```
Access to fetch at 'http://localhost:5001/api/chat' from origin 'http://localhost:5173'
has been blocked by CORS policy
```

**Fix:** Backend `CORS` configuration in `server/index.js` must include the frontend origin:
```js
const corsOptions = {
  origin: 'http://localhost:5173',  // your frontend URL
  credentials: true,
};
app.use(cors(corsOptions));
```
Restart the backend after changing.

---

## Backend Issues

### `node index.js` crashes immediately

**Error:**
```
MongoServerError: connect ECONNREFUSED 127.0.0.1:27017
```

**Fix:** Start MongoDB:
```bash
# macOS with Homebrew
brew services start mongodb-community

# Or manually
mongod --dbpath /usr/local/var/mongodb
```

### `node index.js` crashes with SyntaxError in ollama.js

**Error:**
```
SyntaxError: Unexpected token ')'
/server/services/ollama.js:31
```

**Fix:** Check for stray `)` in the `messages` array — the last item should not have a trailing comma + paren:
```js
// Wrong:
{ role: 'user', content: userQuery }),

// Correct:
{ role: 'user', content: userQuery },
```
Restart the backend after fixing.

### Backend returns 401 Unauthorized

**Cause:** JWT is missing, expired, or malformed.

**Fix:**
1. Check login page → verify you get a token back
2. Check localStorage: open DevTools → Application → Local Storage → `token`
3. Token format should be `eyJhbGc...`
4. If expired, re-login
5. If missing, check the login API response

### Backend returns 400 on `/api/chat`

**Cause:** Empty `message` field sent.

**Fix:** Frontend should prevent sending empty messages. Check `ChatBot.jsx` has a guard:
```js
if (!message.trim()) return;
```

---

## MongoDB Issues

### `MongoServerError: Authentication failed`

**Fix:** Check `MONGO_URI` in `server/.env`:
```
mongodb://username:password@host:27017/dbname
```
Make sure credentials are correct. For local dev:
```
MONGO_URI=mongodb://localhost:27017/crowd_faq
```
(No auth needed for local)

### `MongoServerError: connect ECONNREFUSED`

**Fix:** MongoDB is not running.
```bash
brew services start mongodb-community   # macOS
mongod --dbpath /usr/local/var/mongodb  # manual
```

### Database is empty / no FAQs loading

**Fix:** Seed the database:
```bash
cd server && node seeds/seed.js
```

Verify data:
```javascript
// In mongosh
use crowd_faq
db.faqs.find().pretty()
db.users.find().pretty()
```

---

## Ollama Issues

### `curl: (7) Failed to connect to localhost:11434`

**Fix:** Ollama is not running. Start it:
```bash
ollama serve
# Keep this terminal open
```

Verify:
```bash
curl http://localhost:11434/api/tags
```
Should return model list.

### `Error: Ollama /api/chat failed: 404`

**Cause:** Wrong model name.

**Fix:** Check available models:
```bash
ollama list
```
Verify `qwen2.5:3b` or `qwen2.5:7b` is present. If not, pull it:
```bash
ollama pull qwen2.5:3b
```

### `Error: Ollama /api/chat failed: 500`

**Cause:** Model is loaded but crashed (out of memory on CPU fallback).

**Fix:** Use smaller model:
```bash
# In server/.env
LLM_MODEL=qwen2.5:3b   # instead of qwen2.5:7b
```
Restart backend.

### `Error: Ollama /api/embeddings failed: 404`

**Fix:** `nomic-embed-text` is not installed:
```bash
ollama pull nomic-embed-text
```
Restart backend.

### Chat is very slow (> 10s)

**Causes:**
1. Using CPU instead of Metal GPU (Mac M3)
2. Model too large for available RAM

**Fix:**
```bash
# Verify Metal GPU is being used — Ollama logs should show "CUDA" or "Metal"
# If running on CPU, use smaller model:
ollama pull qwen2.5:3b
# Then in server/.env:
LLM_MODEL=qwen2.5:3b
```

### LLM returns empty response

**Fix:** Check `ollama.js` `generateAnswer` — the `num_gpu: 100` option may cause issues on some configs. Try removing `options` or set `num_gpu: 1`.

---

## Socket.io / Real-Time Issues

### FAQ Browser not updating in real-time

**Check:**
1. Socket.io connected? DevTools → Network → filter `socket.io` → `ws://localhost:5001` should show a WebSocket connection
2. Backend Socket.io initialized? Server log should show `🔌 Socket.io ready`
3. `CLIENT_URL` in backend env matches frontend URL

**Fix:**
```js
// server/index.js — Socket.io CORS must allow frontend
io cors({
  origin: 'http://localhost:5173',
  methods: ['GET', 'POST'],
});
```
Restart both frontend and backend.

### Toast notifications not showing

**Check:**
1. DevTools → Console → filter "toast" for errors
2. `ToastContext.jsx` properly wraps `App.jsx`
3. `FAQBrowser.jsx` subscribes to `socket.on('activity', ...)`

---

## Production (Render) Issues

### Frontend 500 on API calls

**Cause:** Backend cold-started and is still initializing.

**Fix:** Wait 30 seconds (free tier cold start). If it persists, check backend logs in Render dashboard.

### "CORS error" after deploying to Render

**Cause:** `CLIENT_URL` in backend env vars doesn't match the actual frontend URL.

**Fix:**
1. Get frontend URL from Render dashboard
2. Set `CLIENT_URL=https://your-frontend.onrender.com` in backend env
3. Save → backend auto-redeploys (~1 min)

### OpenAI 429 Rate Limit

**Cause:** Too many requests to OpenAI API on free tier.

**Fix:**
- Wait 60 seconds and retry
- Upgrade OpenAI plan for higher limits
- Implement request batching or caching

### OpenAI API key error

**Cause:** `OPENAI_API_KEY` is missing or malformed in Render dashboard.

**Fix:** Double-check the key starts with `sk-`. Re-paste it in Render → crowd-faq-backend → Environment.

### MongoDB Atlas connection fails

**Cause:** Network whitelist doesn't include Render's IPs.

**Fix:**
1. MongoDB Atlas → Security → Network Access
2. Add IP: `0.0.0.0/0` (allow all) — acceptable for MVP
3. Or add Render's outbound IP ranges

### App works locally but not on Render

**Checklist:**
- [ ] `NODE_ENV=production` set in backend
- [ ] `VITE_API_URL` points to production backend URL
- [ ] `CLIENT_URL` set in backend
- [ ] `MONGO_URI` uses `mongodb+srv://` format
- [ ] All required env vars present in Render dashboard

---

## Useful Debug Commands

```bash
# Check ports
lsof -i :5173   # frontend
lsof -i :5001   # backend
lsof -i :27017  # MongoDB
lsof -i :11434  # Ollama

# Test APIs
curl http://localhost:5001/api/health
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@crowd.faq","password":"password123"}'

# Check Ollama
curl http://localhost:11434/api/tags
curl http://localhost:11434/api/chat -d '{"model":"qwen2.5:3b","messages":[{"role":"user","content":"hi"}]}'

# MongoDB
mongosh crowd_faq --eval "db.faqs.countDocuments()"
```