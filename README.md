# LLM Coding Platform

A client-side coding learning platform for AI/ML and backend engineers. No server. User brings their own API key (Groq or Gemini). Everything runs in the browser.

---

<div align="center">

## **CodeLearn**

**A browser-only coding learning platform for AI/ML and backend engineers.**

![GitHub Pages](https://img.shields.io/badge/demo-GitHub%20Pages-2ea44f?style=for-the-badge&logo=githubpages)
![React](https://img.shields.io/badge/React-18-149eca?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-ready-3178c6?style=for-the-badge&logo=typescript)
![No Backend](https://img.shields.io/badge/no%20backend-browser%20only-0f766e?style=for-the-badge)

</div>

### **Quick Start**

```bash
npm install
npm run dev
npm run build
```

### **Highlights**

- 🔐 **Bring your own key**: Groq and Gemini keys are stored only in your browser.
- 🧭 **Personalized curriculum**: Generate tiered paths from your level, goals, and weekly time.
- 💻 **Monaco practice loop**: Solve Python or SQL problems in an embedded editor.
- ✅ **AI code review**: Reviews end with `PASS` or `NEEDS_WORK` to unlock progress.
- 📚 **Handbook side panel**: Pair every problem with owner-maintained HTML notes.

> **Security:** Your API key never leaves your browser. CodeLearn sends requests directly from the client to Groq or Gemini and has no backend, proxy, database, or server-side key handling.

**Handbook list:** [Browse handbook pages](./handbook)

### **Tech Stack**

| Area | Tooling |
|---|---|
| App | React 18, Vite, TypeScript |
| UI | Tailwind CSS, lucide-react |
| Routing | React Router v6 |
| State | Zustand, localStorage, sessionStorage |
| Editor | `@monaco-editor/react` |
| LLMs | Direct browser `fetch` to Groq and Gemini |
| Deploy | GitHub Pages, `gh-pages` |

---

## What It Does

1. User pastes their API key -> platform detects provider, shows available models
2. User fills a brief (current level, goals, time/week)
3. LLM generates a personalized curriculum (5-ish learning paths, structured topic order)
4. Each topic has tiered problems (basic to advanced, no skipping)
5. User writes code in an embedded Monaco editor, submits, LLM reviews it
6. Alongside each topic, a handbook page is shown (hand-written HTML by the repo owner)
7. Progress is saved to localStorage

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | React + Vite | Fast SPA, easy GitHub Pages deploy |
| Language | TypeScript | Required for anything serious |
| Editor | Monaco Editor (`@monaco-editor/react`) | Same as VS Code, handles syntax well |
| Styling | Tailwind CSS | No extra build config needed |
| Routing | React Router v6 | Client-side routing for handbook pages |
| State | Zustand | Lightweight, no boilerplate |
| Persistence | localStorage | No backend needed |
| LLM: Groq | REST via `fetch` to `api.groq.com/openai/v1/chat/completions` | OpenAI-compatible |
| LLM: Gemini | REST via `fetch` to `generativelanguage.googleapis.com` | Google's SDK not needed |
| Deploy | GitHub Pages via `gh-pages` package | Static, free |

No backend. No database. No auth server.

---

## Project Structure

```
/
├── public/
├── src/
│   ├── components/
│   │   ├── ApiKeySetup.tsx       # Key input, provider detection, model dropdown
│   │   ├── Brief.tsx             # Onboarding form -> sends to LLM
│   │   ├── CurriculumView.tsx    # Renders paths + progress
│   │   ├── ProblemEditor.tsx     # Monaco editor + submit + LLM feedback
│   │   └── HandbookViewer.tsx    # Loads and renders handbook HTML
│   ├── lib/
│   │   ├── llm.ts                # Unified caller for Groq + Gemini
│   │   ├── curriculum.ts         # Parses LLM curriculum JSON, stores to localStorage
│   │   ├── progress.ts           # Read/write progress per topic/tier
│   │   └── detectProvider.ts     # Key prefix -> provider + model list
│   ├── store/
│   │   └── appStore.ts           # Zustand store (key, provider, curriculum, progress)
│   ├── pages/
│   │   ├── Home.tsx
│   │   ├── Learn.tsx
│   │   └── Handbook.tsx
│   └── main.tsx
├── handbook/                     # Hand-written HTML per topic (owner-maintained)
│   ├── python-oop.html
│   ├── python-decorators.html
│   └── ...
├── index.html
├── vite.config.ts
└── README.md
```

---

## API Key Detection Logic

```ts
// detectProvider.ts
if (key.startsWith("gsk_"))  -> provider: "groq"
if (key.startsWith("AIza")) -> provider: "gemini"
```

Groq model list is fetched from `api.groq.com/openai/v1/models` using the user's key. Gemini model list is hardcoded (stable enough).

---

## LLM Unified Caller (`llm.ts`)

Both providers receive the same input shape:

```ts
type LLMInput = {
  systemPrompt: string
  userMessage: string
  json?: boolean  // if true, prompt model to return only JSON
}
```

Groq uses the OpenAI-compatible endpoint. Gemini maps to `generateContent`. The caller normalizes both responses into `{ text: string }`.

---

## Curriculum JSON Schema

LLM is prompted to return this exact shape (no markdown, no preamble):

```json
{
  "paths": [
    {
      "id": "python-oop",
      "title": "Python OOP",
      "handbookPage": "python-oop.html",
      "topics": ["classes", "inheritance", "dunder methods"],
      "problems": [
        { "tier": 1, "title": "Create a class", "prompt": "..." },
        { "tier": 2, "title": "Add inheritance", "prompt": "..." },
        { "tier": 3, "title": "Implement __repr__ and __eq__", "prompt": "..." }
      ]
    }
  ]
}
```

`handbookPage` maps directly to a file in `/handbook/`. If the file doesn't exist, HandbookViewer shows a "coming soon" state.

---

## Code Review Prompt (ProblemEditor)

When user submits:

```
System: You are a code reviewer for a learning platform.
        Be direct. Point out what's wrong first, then what's right.
        End with: PASS or NEEDS_WORK.

User: Problem: {problem.prompt}
      Tier: {tier}
      Code:
      {userCode}
```

If LLM returns `PASS`, progress.ts marks that tier complete and unlocks the next.

---

## Handbook Pages

Owner writes these manually as plain HTML files in `/handbook/`. No framework, just HTML + inline CSS. HandbookViewer loads them via `fetch("/handbook/{slug}.html")` and renders with `dangerouslySetInnerHTML` (content is owner-controlled, not user input).

Each file should follow this rough structure:
- What is this topic
- When to use it
- Code examples
- Common mistakes
- Quick reference

---

## Security Model

- API keys live in localStorage (or sessionStorage if user opts out of persistence)
- All LLM requests go directly from the user's browser to Groq/Gemini -- this app never sees the key
- No analytics, no telemetry, no third-party scripts
- Open source: users can audit before entering anything
- Recommend users create a dedicated/limited API key for this platform

---

## Getting Started (Dev)

```bash
git clone https://github.com/your-handle/llm-coding-platform
cd llm-coding-platform
npm install
npm run dev
```

Deploy:

```bash
npm run build
npm run deploy   # uses gh-pages to push /dist to gh-pages branch
```

Set `base` in `vite.config.ts` to your repo name:

```ts
export default defineConfig({
  base: "/llm-coding-platform/",
  ...
})
```

---

## What's Not Here (By Design)

- No user accounts
- No server
- No stored submissions
- No leaderboard
- No code execution sandbox (LLM reviews code statically)

If you want to add code execution, look into Pyodide (Python in WASM) -- it runs entirely client-side too.

---

## Handbook Writing Guide (for contributors)

Each `/handbook/*.html` file covers one topic. Write it assuming the reader just finished the brief and got assigned this topic. Keep it scannable. Real code examples only -- no pseudocode. If a topic maps to a problem tier, note which tier it supports at the top.

File naming: `{language}-{topic}.html` e.g. `python-generators.html`, `fastapi-routing.html`.
