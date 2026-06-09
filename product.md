# Crowd FAQ — Product

## 1. What It Is

**Crowd FAQ** is a real-time, AI-powered FAQ knowledge portal. When a user asks a question, the AI either finds a semantically similar existing FAQ or generates and saves a new one — automatically growing the knowledge base with zero manual curation.

Think of it as a self-updating wiki meets ChatGPT: community + AI driven, deduplicated, and live.

---

## 2. Core Value Proposition

> **One place for questions. Each answer, once given, lives forever.**

Every AI response is stored as a permanent FAQ. No duplicate questions. No repeated answers. The more people ask, the smarter the knowledge base gets — automatically.

---

## 3. User Journey

### First-time user

```
Opens app → Sees empty/welcome FAQ grid
        ↓
Clicks "Ask AI" → Goes to ChatBot
        ↓
Types: "How do I reset my password?"
        ↓
AI responds + saves FAQ (if unique)
        ↓
Returns to FAQ Browser → sees new card with ✨ badge
```

### Returning user

```
Opens app → FAQ Browser shows knowledge base
        ↓
Searches: "reset password" → existing FAQ appears
        ↓
Clicks card → reads full answer
```

### Voice user

```
Clicks microphone → speaks question
        ↓
Web Speech API transcribes
        ↓
Same AI flow as text
        ↓
Heard answer (TTS — future)
```

---

## 4. Screens

### Landing / Login (`/`)
- App name + tagline
- Email + password login form
- Link to register
- Demo credentials shown: `demo@crowd.faq` / `password123`

### ChatBot (`/chat`)
- Full-screen chat interface
- Text input at bottom with send button
- Voice input button (microphone icon)
- Chat bubble shows question + AI answer
- Source badge: "Existing FAQ" (green) or "AI Generated" (purple)
- Similarity score shown for existing FAQ matches
- Category tag on each response

### FAQ Browser (`/faqs`)
- Top bar: search input + category filter dropdown
- Card grid (2-3 columns responsive)
- Each card: question, answer preview, category badge, view count, date
- 🤖 badge on AI-generated cards
- ✨ "New" badge (30s) on freshly created cards
- Real-time: new AI FAQs appear without page refresh
- Pagination at bottom

### FAQ Detail (Card expand)
- Full question + full answer
- Category, view count, created date
- "Source: AI Generated" or "Source: Community"

---

## 5. FAQ Card States

| State | Visual |
|---|---|
| Standard | White card, category badge, view count |
| AI Generated | 🤖 badge top-right |
| New (< 30s old) | ✨ sparkle badge + purple glow pulse |
| Community (manual) | No AI badge |
| Expanded | Full answer visible |

---

## 6. Toast Notifications

Purple toast slides in from top-right on every new AI FAQ:
- Title: "🤖 New FAQ Added"
- Body: Question text (truncated to 60 chars)
- Duration: 5 seconds, auto-dismiss
- Color: Purple gradient theme

---

## 7. Deduplication UX

When similarity ≥ 0.82 is found:

- Response shows **"Found similar FAQ"** header
- Similarity percentage shown: "87% match"
- Existing FAQ answer returned
- No new FAQ created
- FAQ card highlighted in browser

When similarity < 0.82 (new FAQ generated):

- Response shows **"AI Generated"** badge
- Answer displayed with category tag
- FAQ saved + appears live in browser
- Toast notification fires

---

## 8. Search & Filter

- **Search:** MongoDB text index on question + answer. Matches keywords, not semantic meaning.
- **Category filter:** Dropdown with 8 categories. "All" default.
- **Sort:** Newest first (default), Most viewed (future toggle)
- **No results:** "No FAQs found. Ask the AI to create one!" prompt

---

## 9. AI Categories

| Category | Example questions |
|---|---|
| AI/ML | How does backpropagation work? |
| Programming | How do I sort an array in JavaScript? |
| Finance | How does compound interest work? |
| Education | What is the Pythagorean theorem? |
| Healthcare | How does blood pressure affect health? |
| Cloud/DevOps | How do I set up a CI/CD pipeline? |
| Design | What is the golden ratio in design? |
| General | How do I reset my router? |

---

## 10. Competitive Differentiation

| Traditional FAQ Portal | Crowd FAQ |
|---|---|
| Manual FAQ creation | AI auto-generates from questions |
| Duplicates accumulate | Semantic deduplication at 0.82 threshold |
| Static content | Live Socket.io updates |
| Text-only input | Voice + text via Web Speech API |
| External API costs | Local Ollama (dev) = free |
| No context awareness | Chat history + similarity context |

---

## 11. Roadmap (Future)

| Feature | Priority | Effort |
|---|---|---|
| Threaded chat conversations | High | Medium |
| FAQ upvoting / downvoting | Medium | Low |
| User comments on FAQs | Medium | Low |
| Multilingual FAQ responses | Medium | High |
| RAG pipeline (context from docs) | Medium | High |
| Redis caching for hot FAQs | Low | Medium |
| Dedicated vector DB (Pinecone) | Low | High |
| TTS for answer audio playback | Low | Low |
| Mobile PWA | Low | High |

---

## 12. Success Metrics (Future)

- FAQs created per day
- Unique user questions per session
- Deduplication hit rate (existing vs new)
- Average similarity score of matches
- Time-to-answer (P95 < 3s)
- FAQ reuse rate — how often existing FAQs answer questions