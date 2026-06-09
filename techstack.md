# Crowd FAQ — Tech Stack

## Frontend

| Technology | Version | Purpose |
|---|---|---|
| **React** | 18.x | UI framework |
| **Vite** | 5.x | Build tool + dev server |
| **React Router** | 6.x | Client-side routing |
| **Tailwind CSS** | 3.x | Utility-first styling |
| **Lucide React** | latest | Icon library |
| **Socket.io-client** | 4.x | Real-time client |
| **Framer Motion** | 11.x | Animations |
| **React Markdown** | 9.x | Render LLM answers with markdown |

### Why these choices?

- **React 18** — stable, vast ecosystem, concurrent features available
- **Vite** — fast HMR, lean production builds, native ESM dev server
- **Tailwind** — rapid styling, no context-switching, small CSS bundle with purging
- **Framer Motion** — declarative animations for toast notifications and card entrance
- **Socket.io-client** — matching server library, automatic reconnection, fallback transports

---

## Backend

| Technology | Version | Purpose |
|---|---|---|
| **Node.js** | 18+ | JavaScript runtime |
| **Express** | 4.x | HTTP server + routing |
| **Mongoose** | 8.x | MongoDB ODM |
| **Socket.io** | 4.x | Real-time server events |
| **jsonwebtoken** | 9.x | JWT authentication |
| **bcrypt** | 5.x | Password hashing |
| **form-data** | 4.x | Multipart form handling (Whisper audio) |
| **cors** | 2.x | Cross-origin resource sharing |

### Why these choices?

- **Express** — minimal, flexible, largest Node.js web framework ecosystem
- **Mongoose** — schema validation, middleware, rich query API for MongoDB
- **Socket.io** — rooms, automatic reconnection, event emitters matching the client
- **JWT** — stateless auth, works across load-balanced instances
- **bcrypt** — adaptive salt rounds, industry standard for password hashing

---

## Database

| Technology | Type | Purpose |
|---|---|---|
| **MongoDB** | Document DB | Primary data store |
| **Mongoose** | ODM | Schema enforcement + queries |

**Collections:** `users`, `faqs`, `activities`, `categories`

### Why MongoDB?

- Flexible schema — FAQ documents can evolve without migrations
- 2dsphere index for vector (embedding) similarity queries
- Text index for keyword search
- JSON-like documents map naturally to JavaScript objects
- MongoDB Atlas free tier (M0) covers MVP hosting

---

## LLM / AI

### Local Development (Ollama)

| Model | Size | Purpose |
|---|---|---|
| `qwen2.5:7b` (or `qwen2.5:3b`) | ~4.7GB / ~1.9GB | FAQ answer generation + category detection |
| `nomic-embed-text` | 274MB | Question embedding (768 dimensions) |

- Runs via **[Ollama](https://ollama.com)** v0.24+
- Uses **Apple Silicon Metal GPU** on M3 Macs (~4.7GB VRAM for 7b model)
- Zero API cost, fully offline

### Production (Cloud)

| Provider | Model | Purpose |
|---|---|---|
| **OpenAI** | `gpt-4o-mini` | FAQ generation + category |
| **OpenAI** | `text-embedding-3-small` | Embeddings |
| **Anthropic** (alt) | `claude-3-haiku` | FAQ generation only |

> Production uses OpenAI by default. Set `LLM_PROVIDER=openai` and `OPENAI_API_KEY` in environment.

### Why Ollama for dev?

- No API key management
- No per-token costs
- Runs entirely locally — full privacy during development
- Same model interface as OpenAI (via `ollama.js` abstraction layer)

---

## Development Tools

| Tool | Purpose |
|---|---|
| **npm** | Package management |
| **nodemon** | Backend auto-restart on file changes |
| **dotenv** | Environment variable loading |
| **cloudflared** | Expose local server via HTTPS tunnel (dev) |

---

## Deployment

| Service | Platform | Tier | Notes |
|---|---|---|---|
| Frontend (static) | **Render** or **Vercel/Netlify** | Free | `npm run build` → `dist/` |
| Backend (Node.js) | **Render** | Free | Port 10000, spins down after 15 min |
| Database | **MongoDB Atlas** | M0 (free) | AWS Singapore region |
| LLM (production) | **OpenAI API** | Pay-as-you-go | ~$0.15/1M tokens with gpt-4o-mini |

### Why Render?

- `render.yaml` Blueprint defines both services
- One-click deploy from GitHub
- Native Node.js runtime, no Docker needed
- Singapore region available (close to India)

### Why MongoDB Atlas?

- Free M0 tier sufficient for MVP
- No server maintenance
- Built-in backup, monitoring, connection pooling
- `mongodb+srv://` connection string works with Render env vars

---

## Environment Variables Summary

### Local Development

```bash
# server/.env
PORT=5001
MONGO_URI=mongodb://localhost:27017/crowd_faq
JWT_SECRET=<generate with openssl rand -hex 32>
NODE_ENV=development
OLLAMA_BASE_URL=http://localhost:11434
LLM_PROVIDER=ollama
LLM_MODEL=qwen2.5:7b
EMBED_MODEL=nomic-embed-text

# client/.env
VITE_API_URL=http://localhost:5001
```

### Production (Render)

```bash
# Backend
NODE_ENV=production
PORT=10000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.xxxxx.mongodb.net/crowd_faq
JWT_SECRET=<openssl rand -hex 32>
JWT_EXPIRES_IN=7d
CLIENT_URL=https://your-frontend.onrender.com
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-...
LLM_MODEL=gpt-4o-mini

# Frontend
VITE_API_URL=https://your-backend.onrender.com
VITE_GITHUB_USERNAME=Nancypaul08
```