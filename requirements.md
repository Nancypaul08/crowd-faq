# Crowd FAQ — Requirements

## 1. Product Overview

**Name:** Crowd FAQ
**Type:** AI-powered FAQ knowledge portal (web app)
**Core function:** Users ask questions → AI resolves them → FAQs auto-added to a living knowledge base with deduplication
**Target users:** Communities, students, support teams, internal knowledge bases

---

## 2. User Roles & Permissions

| Role | Capabilities |
|---|---|
| **User** | Ask AI questions (text + voice), browse/search/filter FAQs, view FAQ detail, see real-time AI FAQ updates, login/register |
| **Admin** | All user capabilities + delete any FAQ, manage categories, view analytics |

---

## 3. Functional Requirements

### 3.1 Authentication

- [x] User registration with name, email, password
- [x] User login with email + password → JWT returned
- [x] JWT stored in localStorage, sent as `Authorization: Bearer <token>`
- [x] Passwords hashed with bcrypt
- [x] Demo accounts seeded: `admin@crowd.faq` / `demo@crowd.faq` (password: `password123`)

### 3.2 AI Chat (ChatBot Page)

- [x] Text input — user types question, sends to `POST /api/chat`
- [x] Voice input — Web Speech API (Chrome/Edge) transcribes client-side, sends transcribed text to API
- [x] AI generates formal FAQ answer via LLM
- [x] LLM auto-detects category (8 predefined categories)
- [x] Cosine similarity check against all stored FAQ embeddings
  - similarity ≥ 0.82 → return existing FAQ answer (no new entry)
  - similarity < 0.82 → generate new answer, save as new FAQ
- [x] Response shows: answer text, source badge ("existing" / "generated"), category, similarity score, isNew flag
- [x] Chat history stored in MongoDB (future: threaded conversations)
- [x] Markdown rendering in answer display

### 3.3 FAQ Browser (FAQBrowser Page)

- [x] Grid of FAQ cards, newest first
- [x] Real-time updates via Socket.io — new AI FAQs appear instantly without refresh
- [x] Filter by category (8 categories)
- [x] Search by keyword (MongoDB text index)
- [x] Pagination (20 FAQs per page)
- [x] Sort: newest / most viewed
- [x] Click card → expand to show full answer

### 3.4 FAQ Cards (FAQCard Component)

- [x] Show: question, answer preview, category badge, view count, created date
- [x] 🤖 AI badge on AI-generated FAQs
- [x] ✨ New sparkle badge with purple glow for 30 seconds after creation
- [x] Source indicator: "AI Generated" vs "Community"

### 3.5 Duplicate Detection

- [x] Embed incoming question with `nomic-embed-text` (local) or `text-embedding-3-small` (cloud)
- [x] Cosine similarity against all stored FAQ embeddings
- [x] Threshold: 0.82
- [x] If match found → return existing FAQ, do not create duplicate
- [x] If no match → LLM generates answer, saved with embedding

### 3.6 Real-Time Notifications

- [x] Purple toast notification on new AI FAQ creation
- [x] Toast shows question + "Added to FAQ knowledge base"
- [x] Toast auto-dismisses after 5 seconds

### 3.7 Manual FAQ Creation (Admin)

- [x] POST `/api/faqs` — create FAQ manually (question, answer, category)
- [x] PUT `/api/faqs/:id` — update FAQ
- [x] DELETE `/api/faqs/:id` — delete FAQ (admin only)

### 3.8 LLM Provider Abstraction

- [x] `ollama.js` service routes to Ollama (local) or OpenAI/Anthropic (cloud)
- [x] Toggle via `LLM_PROVIDER` env var (`ollama` | `openai` | `anthropic`)
- [x] Same function signatures regardless of provider

---

## 4. Non-Functional Requirements

### 4.1 Performance

- FAQ similarity search: < 500ms (local Ollama)
- Chat response: < 3s for first token (Ollama on M3 Metal GPU)
- Frontend page load: < 2s (Vite production build)
- Socket.io event propagation: < 100ms

### 4.2 Privacy & Cost (Local Dev)

- All LLM inference runs locally via Ollama — no data leaves the machine
- No OpenAI API costs in local dev mode
- `qwen2.5:7b` runs on Apple Silicon Metal GPU (~4.7GB VRAM)

### 4.3 Scalability

- Free tier: Render spins down after 15 min inactivity (cold start ~30s)
- MongoDB Atlas M0: shared cluster, sufficient for MVP
- Stateless backend — add load balancer for horizontal scaling

### 4.4 Security

- JWT with 7-day expiry
- bcrypt password hashing (salt rounds: 12)
- CORS restricted to known origins
- No secrets in code — all via `.env`
- Rate limiting recommended for production

---

## 5. Edge Cases & Error Handling

| Scenario | Behavior |
|---|---|
| Ollama not running | API returns 503, frontend shows "AI service unavailable" |
| MongoDB not running | API returns 500, frontend shows "Database error" |
| No matching FAQ + low similarity | LLM generates answer, saves new FAQ |
| Very similar FAQ found | Return existing FAQ, `source: "existing"`, `isNew: false` |
| Voice permission denied | Fall back to text input, show permission prompt |
| Empty question submitted | API returns 400, frontend shows validation error |
| Unauthenticated request | API returns 401, frontend redirects to login |
| LLM generates malformed response | Catch error, return "Could not generate answer. Try rephrasing." |

---

## 6. Out of Scope (Future)

- Threaded chat conversations
- User upvoting / downvoting FAQs
- Comments on FAQs
- Multilingual support
- RAG pipelines
- Redis caching
- Vector database (Pinecone / Weaviate)
- Mobile native app
- SSO / OAuth providers