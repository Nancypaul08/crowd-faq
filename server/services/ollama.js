/**
 * Production LLM service — routes to OpenAI / Anthropic / Ollama
 * based on LLM_PROVIDER environment variable.
 *
 * Local dev:    LLM_PROVIDER=ollama  (default, uses qwen2.5:3b locally)
 * Production:   LLM_PROVIDER=openai  (uses OPENAI_API_KEY from env)
 */

const OLLAMA_BASE  = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const LLM_PROVIDER = process.env.LLM_PROVIDER || 'ollama';
const LLM_MODEL    = process.env.LLM_MODEL    || (LLM_PROVIDER === 'ollama' ? 'qwen2.5:3b' : 'gpt-4o-mini');
const EMBED_MODEL  = process.env.EMBED_MODEL  || 'nomic-embed-text';

// ── Ollama helpers (local dev) ────────────────────────────────────────────────

function ollamaFetch(path, body) {
  return fetch(`${OLLAMA_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).then(r => {
    if (!r.ok) throw new Error(`Ollama ${path} failed: ${r.status}`);
    return r.json();
  });
}

async function ollamaChat(userQuery, systemPrompt, conversationHistory = [], opts = {}) {
  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.map(m => ({ role: m.role, content: m.content })),
    { role: 'user',   content: userQuery },
  ];

  const res = await ollamaFetch('/api/chat', {
    model: LLM_MODEL,
    messages,
    stream: false,
    options: opts,
  });

  return (res.message?.content || '').trim();
}

// ── OpenAI helpers (production) ───────────────────────────────────────────────

const OPENAI_KEY = process.env.OPENAI_API_KEY;

async function openaiChat(userQuery, systemPrompt, conversationHistory = [], opts = {}) {
  if (!OPENAI_KEY) throw new Error('OPENAI_API_KEY is not set');

  const messages = [
    { role: 'system', content: systemPrompt },
    ...conversationHistory.map(m => ({ role: m.role, content: m.content })),
    { role: 'user',   content: userQuery },
  ];

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: LLM_MODEL,
      messages,
      ...(opts.temperature !== undefined && { temperature: opts.temperature }),
      ...(opts.max_tokens   !== undefined && { max_tokens: opts.max_tokens }),
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${err}`);
  }

  const data = await res.json();
  return (data.choices?.[0]?.message?.content || '').trim();
}

// ── OpenAI Embeddings (production) ────────────────────────────────────────────

async function openaiEmbed(text) {
  if (!OPENAI_KEY) throw new Error('OPENAI_API_KEY is not set');

  const res = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_KEY}`,
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });

  if (!res.ok) throw new Error(`OpenAI embeddings error ${res.status}`);

  const data = await res.json();
  return data.data?.[0]?.embedding;
}

// ── Ollama Embeddings (local dev) ─────────────────────────────────────────────

async function ollamaEmbed(text) {
  const res = await ollamaFetch('/api/embeddings', {
    model: EMBED_MODEL,
    prompt: text,
  });
  return res.embedding;
}

// ── Public API ─────────────────────────────────────────────────────────────────

const FAQ_SYSTEM_PROMPT = `You are a professional FAQ answer generator for "Crowd FAQ" — a community knowledge portal.
Generate a formal, concise, accurate answer (2-4 sentences, max 1 short paragraph).
Tone: professional, non-conversational, factual.
Never say "I am" or "As an AI". Just answer directly.
If a question is unclear, make a reasonable professional interpretation.`;

const CATEGORY_SYSTEM_PROMPT = `Respond with ONLY the single best category name from this list:
AI/ML, Programming, Finance, Education, Healthcare, Cloud/DevOps, Design, General.
Nothing else. No punctuation. No explanation.`;

/** Generate a formal FAQ answer */
async function generateAnswer(userQuery, conversationHistory = []) {
  if (LLM_PROVIDER === 'openai' || LLM_PROVIDER === 'anthropic') {
    return openaiChat(userQuery, FAQ_SYSTEM_PROMPT, conversationHistory);
  }
  return ollamaChat(userQuery, FAQ_SYSTEM_PROMPT, conversationHistory, { num_gpu: 100 });
}

/** Detect the best FAQ category from a question */
async function detectCategory(userQuery) {
  let raw;
  if (LLM_PROVIDER === 'openai' || LLM_PROVIDER === 'anthropic') {
    raw = await openaiChat(userQuery, CATEGORY_SYSTEM_PROMPT, [], { temperature: 0.1, max_tokens: 20 });
  } else {
    raw = await ollamaChat(userQuery, CATEGORY_SYSTEM_PROMPT, [], { temperature: 0.1, num_predict: 20 });
  }

  const valid = ['AI/ML','Programming','Finance','Education','Healthcare','Cloud/DevOps','Design','General'];
  const found = valid.find(c => raw.toLowerCase().includes(c.toLowerCase()));
  return found || 'General';
}

/** Generate text embedding */
async function getEmbedding(text) {
  if (LLM_PROVIDER === 'openai' || LLM_PROVIDER === 'anthropic') {
    return openaiEmbed(text);
  }
  return ollamaEmbed(text);
}

/** Transcribe audio — only available with Ollama/Whisper locally */
async function transcribeAudio(buffer) {
  if (LLM_PROVIDER !== 'ollama') {
    throw new Error('Audio transcription is only available in local Ollama mode');
  }

  const fs   = require('fs');
  const path = `/tmp/whisper-${Date.now()}.wav`;
  fs.writeFileSync(path, buffer);

  const FormData = require('form-data');
  const form = new FormData();
  form.append('file', fs.createReadStream(path), { filename: 'audio.wav', contentType: 'audio/wav' });

  let res;
  try {
    res = await fetch(`${OLLAMA_BASE}/api/audio/transcriptions`, { method: 'POST', body: form });
  } finally {
    try { fs.unlinkSync(path); } catch {}
  }

  if (!res.ok) throw new Error(`Whisper failed (${res.status})`);
  const data = await res.json();
  return (data.text || '').trim();
}

module.exports = { generateAnswer, detectCategory, getEmbedding, transcribeAudio };