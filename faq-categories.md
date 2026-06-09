# Crowd FAQ — FAQ Categories

The system auto-classifies every question into one of 8 categories. The LLM receives a strict system prompt: respond with **only** the category name, nothing else.

---

## Category Definitions & Example Questions

---

### 1. AI/ML

**Description:** Artificial Intelligence, Machine Learning, Deep Learning, NLP, model training, inference, data science.

**Example questions:**

- How does backpropagation work in neural networks?
- What is the difference between supervised and unsupervised learning?
- How do I fine-tune a BERT model for sentiment analysis?
- What is the purpose of a validation set in machine learning?
- Explain gradient descent in simple terms
- How does attention mechanism work in transformers?
- What is the difference between CNN and RNN?
- How do I prevent overfitting in a deep learning model?

**Prompts that may trigger misclassification:** Questions about "AI" tools (ChatGPT, Midjourney) that are more General or Programming should be tagged AI/ML if the question is about the underlying model/technique.

---

### 2. Programming

**Description:** Software development, languages, frameworks, algorithms, data structures, debugging, DevOps tooling, CLI.

**Example questions:**

- How do I sort an array in JavaScript without using built-in methods?
- What is the difference between `let`, `const`, and `var` in JavaScript?
- How do I connect to a MongoDB database using Node.js?
- What is the time complexity of quicksort?
- How do I handle CORS errors in Express.js?
- How do I debug a memory leak in a Node.js application?
- What is the difference between SQL and NoSQL databases?
- How do I write a unit test for an async function in Python?

---

### 3. Finance

**Description:** Personal finance, investing, banking, accounting, budgeting, crypto, taxes, financial planning.

**Example questions:**

- How does compound interest work?
- What is the difference between stocks and bonds?
- How do I file taxes as a freelancer?
- What is the 50/30/20 budgeting rule?
- How does a index fund work?
- What is the difference between Traditional IRA and Roth IRA?
- How do I calculate my credit score?
- What is dollar-cost averaging?

---

### 4. Education

**Description:** Academic learning, study techniques, educational institutions, courses, certifications, pedagogy, research.

**Example questions:**

- What is the Pythagorean theorem?
- How do I write a research paper in APA format?
- What are the best study techniques for memorizing information?
- How do I prepare for GRE exam in 3 months?
- What is the difference between a university and a college?
- How do I calculate GPA?
- What are the benefits of spaced repetition?
- How do I cite a website in MLA format?

---

### 5. Healthcare

**Description:** Health, medicine, mental health, nutrition, fitness, wellness, first aid, medical conditions.

**Example questions:**

- How does blood pressure affect overall health?
- What is the recommended daily water intake?
- How do I lower my cholesterol naturally?
- What are the symptoms of vitamin D deficiency?
- How does meditation reduce stress?
- What is the difference between HIIT and steady-state cardio?
- How much sleep do adults actually need?
- What foods are high in protein?

> **Note:** AI-generated health FAQs should always include a disclaimer: *"Consult a medical professional for personalized advice."*

---

### 6. Cloud/DevOps

**Description:** Cloud infrastructure, CI/CD, containerization, networking, servers, deployment, monitoring, infrastructure-as-code.

**Example questions:**

- How do I set up a CI/CD pipeline with GitHub Actions?
- What is the difference between Docker and Kubernetes?
- How do I configure a Nginx reverse proxy?
- How do I set up SSL on a Linux server?
- What is infrastructure as code and why use it?
- How do I migrate a database to AWS RDS?
- What is the difference between SSH and SSL?
- How do I set up a MongoDB replica set?

---

### 7. Design

**Description:** UI/UX design, graphic design, product design, typography, color theory, design tools, accessibility.

**Example questions:**

- What is the golden ratio in design?
- How do I design a mobile-first responsive layout?
- What is the difference between UI and UX design?
- How do I choose a color palette for a brand?
- What are the best practices for accessibility (a11y) in web design?
- How do I use Figma components and variants?
- What is the 8-point grid system in design?
- How do I create a user persona?

---

### 8. General

**Description:** Everything else that doesn't fit neatly — daily life, consumer tech, travel, language, hobbies, customer service, miscellaneous.

**Example questions:**

- How do I reset my WiFi router?
- What is the best way to learn a new language?
- How do I cancel a subscription?
- How do I cook perfect rice?
- What are the best places to visit in Bali?
- How do I write a professional email?
- How do I remove a stain from clothing?
- What is the difference between a passport and a visa?

---

## Category Detection Prompt

The LLM receives this system prompt for category detection:

```
Respond with ONLY the single best category name from this list:
AI/ML, Programming, Finance, Education, Healthcare, Cloud/DevOps, Design, General.
Nothing else. No punctuation. No explanation.
```

**Valid responses:** exactly one of: `AI/ML`, `Programming`, `Finance`, `Education`, `Healthcare`, `Cloud/DevOps`, `Design`, `General`

**Fallback:** if the LLM returns anything else, default to `General`.

---

## Adding New Categories

1. Update `ollama.js` `CATEGORY_SYSTEM_PROMPT` — add the new category to the list
2. Add to `valid` array in `detectCategory()` function
3. Add a seed entry in `server/seeds/data.js` for the `categories` collection
4. Update the category filter dropdown in `FAQBrowser.jsx`
5. Update all documentation files that list the 8 categories

---

## Category Distribution (Future Analytics)

Track per-category FAQ counts to understand knowledge base coverage:

```
AI/ML:       ██████████ 12%
Programming: ████████████████ 24%
Finance:     ████████ 10%
Education:   ██████ 7%
Healthcare:  ████ 5%
Cloud/DevOps:██████████ 14%
Design:      █████ 6%
General:     ████████████ 22%
```

Gaps in Healthcare or Education may indicate opportunity for targeted FAQ campaigns.