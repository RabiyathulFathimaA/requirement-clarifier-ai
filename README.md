# 🧠 Requirement Clarifier AI

> **Turn a raw project idea into a complete, structured software requirement document — instantly.**

A production-quality, AI-powered frontend application that acts as a system analyst. Input any project idea and receive a fully structured SRS-style document covering user roles, system modules, feature specifications, and a detailed database schema — all generated client-side with zero backend.

---

## 🚀 Live Demo

> Deploy to GitHub Pages and update this link.
> [click Here to view Live Demo](https://rabiyathulfathimaa.github.io/requirement-clarifier-ai/)

---

## 📸 Screenshots

| Input Form | Output – Users & Modules |
|---|---|
| *(Add screenshot here)* | *(Add screenshot here)* |

| Features Card | Database Schema |
|---|---|
| *(Add screenshot here)* | *(Add screenshot here)* |

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎯 Smart Input Form | Project idea, type, industry, user roles & feature hints |
| 👥 Users Card | System actors with roles and responsibility descriptions |
| 🧩 Modules Card | Core functional modules with numbered listing |
| 📋 Features Card | Detailed feature list per module in grid layout |
| 🗄️ Database Schema | Tables, columns, data types, PKs and FK references |
| 📋 Copy Sections | Copy any card's content to clipboard |
| 💾 Export .txt | Download the full report as a formatted text file |
| 🔄 Reset Form | Clear all inputs and output with one click |
| 🧠 LocalStorage | Automatically saves and restores your last input |
| 📱 Responsive | Works on desktop, tablet, and mobile |

---

## 🧱 Tech Stack

- **HTML5** — Semantic structure
- **CSS3** — Custom properties, glassmorphism, animations
- **Bootstrap 5.3** — Grid system and utilities
- **Bootstrap Icons** — Icon library
- **Vanilla JavaScript (ES6+)** — All generation logic, DOM manipulation
- **LocalStorage API** — Session persistence
- **Clipboard API** — Copy to clipboard
- **Blob API** — Client-side file download

> ⚡ No backend. No API calls. No build step. Runs entirely in the browser.

---

## 📁 Project Structure

```
requirement-clarifier-ai/
├── index.html       — Main HTML structure and layout
├── style.css        — All styles (glassmorphism, dark UI, responsive)
├── script.js        — Generation logic, DOM rendering, export
└── README.md        — This file
```

---

## ▶️ How to Run

### Option 1 — Open locally
```bash
git clone https://github.com/<your-username>/requirement-clarifier-ai.git
cd requirement-clarifier-ai
# Open index.html in any browser
open index.html
```

### Option 2 — GitHub Pages
1. Fork / push this repo to GitHub
2. Go to **Settings → Pages**
3. Set Source to `main` branch, root `/`
4. Your site will be live at `https://<username>.github.io/requirement-clarifier-ai`

### Option 3 — VS Code Live Server
1. Install the **Live Server** extension
2. Right-click `index.html` → **Open with Live Server**

---

## 🏗️ How It Works

1. **User fills** the smart form — project idea, type, industry, optional roles, feature hints
2. **JavaScript logic** maps the inputs to domain-specific knowledge tables
3. **Generation engine** builds users, modules, features, and schema objects
4. **DOM renderer** formats and injects structured HTML into output cards
5. **Export handler** serialises the data into a formatted `.txt` document

No AI API is called. All generation is handled by a deterministic knowledge-base engine built in pure JavaScript — making it **fast, offline-capable, and free to host**.

---

## 🗄️ Supported Industries

| Industry | Domain-specific tables & modules |
|---|---|
| Education | Courses, Enrollments, Assignments |
| E-commerce | Products, Orders, Order Items |
| Finance | Accounts, Transactions |
| Healthcare | Patients, Appointments, Prescriptions |
| HR / Recruitment | Job Postings, Applicants, Interviews |
| Logistics | Shipments, Routes, Warehouse |
| Real Estate | Listings, Viewings, Deals |
| Other | Projects, Tasks (generic) |

---

## 🔮 Future Enhancements

- [ ] AI-powered generation via Claude / OpenAI API
- [ ] Export to PDF using `jsPDF`
- [ ] Export to Word (`.docx`) using `docx.js`
- [ ] SQL `CREATE TABLE` statement export
- [ ] Shareable link via URL-encoded state
- [ ] Dark / Light theme toggle
- [ ] Figma wireframe skeleton preview
- [ ] Multi-language output (Tamil, Hindi, etc.)
- [ ] Project history with LocalStorage versioning

---

## 📝 GitHub Repository Description

> Requirement Clarifier AI — A frontend-only SaaS tool that converts any raw project idea into a structured software requirement document with user roles, system modules, feature specifications, and a detailed database schema. Built with HTML5, CSS3, Bootstrap 5, and Vanilla JavaScript.

**Topics:** `html` `css` `javascript` `bootstrap` `system-analysis` `requirement-engineering` `portfolio-project` `campus-placement` `no-backend` `github-pages`

---

## 💼 Resume Bullet Points

Choose the most relevant for your resume:

```
• Developed "Requirement Clarifier AI", a client-side SaaS tool that auto-generates 
  structured software requirement documents (users, modules, features, DB schema) 
  from plain-text project ideas using a domain-aware JS knowledge engine.

• Built a production-quality dark-theme web application featuring glassmorphism UI, 
  Bootstrap 5 responsive grid, LocalStorage persistence, clipboard API, and .txt 
  file export — deployed on GitHub Pages with zero backend dependencies.

• Implemented a modular JavaScript generation engine covering 8 industries 
  (Education, E-commerce, Finance, Healthcare, etc.) producing tailored users, 
  modules, feature specs, and relational DB schemas with PK/FK references.
```

---

## 🗣️ Interview Explanation

**Q: Tell me about this project.**

> "Requirement Clarifier AI is a frontend-only tool I built to solve a real problem: junior developers and students often struggle to define system requirements before coding. The app takes a plain-English project idea and generates a structured SRS-style document — covering actors, modules, features, and a complete database schema.
>
> I built the entire generation engine in vanilla JavaScript using a domain-aware knowledge base that branches based on industry and project type. There's no backend — it all runs in the browser using the Clipboard API for copying, Blob API for file downloads, and LocalStorage for session persistence. The UI is a modern dark glassmorphism design built with CSS custom properties and Bootstrap 5."

**Q: Why no backend?**

> "Making it backend-free was a deliberate design choice. It runs offline, deploys instantly on GitHub Pages, and has zero running cost. The generation logic is deterministic and fast — there's no need for a round-trip."

**Q: How would you scale this?**

> "I'd integrate the Anthropic Claude API to replace the static knowledge base with AI-generated analysis for any domain. I'd add PDF export via jsPDF, SQL DDL export, and a shareable URL feature using URL-encoded state."

---

## 👩‍💻 Author

**Rabiyathul Fathima A** — B.Tech Information Technology  
Campus Placement Candidate | Java Full-Stack Developer

---

## 📄 License

MIT License — free to use, modify, and distribute.
