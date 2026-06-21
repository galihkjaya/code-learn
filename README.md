# PyGrind

A browser-only coding practice platform for AI/ML and backend engineers. No server. Bring your own API key (Groq or Gemini). Everything runs in the browser.

---

<div align="center">

## **PyGrind**

**Train like an engineer.**

![GitHub Pages](https://img.shields.io/badge/demo-GitHub%20Pages-2ea44f?style=for-the-badge&logo=githubpages)
![React](https://img.shields.io/badge/React-18-149eca?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-ready-3178c6?style=for-the-badge&logo=typescript)
![No Backend](https://img.shields.io/badge/no%20backend-browser%20only-0f766e?style=for-the-badge)

</div>

---

### **Quick Start**

```bash
git clone https://github.com/galihkjaya/pygrind.git
cd pygrind
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) and paste your Groq or Gemini API key.

---

### **How It Works**

1. **Setup** — Paste a Groq or Gemini API key. Provider is auto-detected. Models are fetched live.
2. **Brief** — Set your level, goals, and weekly hours. An LLM generates a personalized curriculum.
3. **Learn** — Browse your generated paths as an interactive row list.
4. **Practice** — Write code in Monaco. Submit. Get AI review. PASS unlocks the next tier.
5. **Handbook** — Reference HTML pages accompany every problem in a split-screen panel.

---

### **Features**

- 🔐 **Bring your own key** — Groq and Gemini keys are stored only in your browser (localStorage or sessionStorage).
- 🧭 **Personalized curriculum** — Tiered paths generated from your level, goals, and weekly time.
- 💻 **Monaco practice loop** — Solve Python or SQL problems in an embedded VS Code–style editor.
- ✅ **AI code review** — Reviews end with `PASS` or `NEEDS_WORK` to gatekeep progression.
- 📚 **Handbook side panel** — Every problem is paired with owner-maintained HTML reference notes.

> **Security:** Your API key never leaves your browser. PyGrind sends requests directly from the client to Groq or Gemini. No backend. No database. No proxy. [Audit the source →](https://github.com/galihkjaya/pygrind)

---

### **Tech Stack**

| Area | Tooling |
|---|---|
| App | React 18, Vite, TypeScript |
| UI | Tailwind CSS, lucide-react |
| Routing | React Router v6 |
| State | Zustand, localStorage |
| Editor | `@monaco-editor/react` |
| LLMs | Direct browser `fetch` to Groq + Gemini |
| Deploy | GitHub Pages, `gh-pages` |

---

### **Project Structure**

```
/
├── public/
│   └── 404.html             # SPA redirect fallback for GitHub Pages
├── src/
│   ├── components/
│   │   ├── CurriculumView.tsx   # Path rows with ink-fill hover
│   │   ├── ProblemEditor.tsx    # Monaco editor + LLM submit loop
│   │   └── HandbookViewer.tsx   # Fetches + renders handbook HTML
│   ├── lib/
│   │   ├── llm.ts               # Unified Groq + Gemini caller
│   │   ├── curriculum.ts        # Parses LLM JSON, stores to localStorage
│   │   ├── progress.ts          # Read/write per-tier progress
│   │   └── detectProvider.ts    # Key prefix → provider + model list
│   ├── pages/
│   │   ├── Splash.tsx           # Full-screen fade-in → /setup
│   │   ├── Setup.tsx            # API key + model selection
│   │   ├── BriefPage.tsx        # Curriculum brief form
│   │   ├── Learn.tsx            # Curriculum row list
│   │   └── Handbook.tsx         # Grouped handbook index
│   ├── store/
│   │   └── appStore.ts          # Zustand store (key, provider, curriculum, progress)
│   └── main.tsx                 # Router + layout
├── handbook/                    # Hand-written HTML per topic (owner-maintained)
│   ├── python-oop.html
│   ├── sql-joins-relational-thinking.html
│   └── ...
├── index.html
├── vite.config.ts               # base: '/pygrind/'
└── README.md
```

---

### **Page Flow**

```
/ (Splash, 1.8s) → /setup → /brief → /learn → /practice/:pathId
                                      ↕
                                /handbook
```

---

### **Curriculum JSON Schema**

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

---

### **Deploy**

```bash
npm run build
npm run deploy   # pushes /dist to gh-pages branch
```

Set `base` in `vite.config.ts` to match your repo name if forking:

```ts
export default defineConfig({
  base: "/your-repo-name/",
})
```

---

### **Handbook Writing Guide**

Each `/handbook/*.html` covers one topic. Write it as a scannable reference for someone who just got assigned that path. Real code examples only — no pseudocode. File naming: `{language}-{topic}.html` e.g. `python-generators.html`, `fastapi-routing.html`.

---

### **Security Model**

- API keys live in localStorage (or sessionStorage if user opts out of persistence).
- All LLM requests go directly from the user's browser to Groq/Gemini — PyGrind never sees the key.
- No analytics, no telemetry, no third-party tracking scripts.
- Recommend users create a dedicated/limited key for this platform.
