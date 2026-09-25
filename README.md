# 🛍️ PaytmGrowly
### The AI Business Partner for Every Paytm Merchant

**Track 1 — Merchant Growth AI** · Hackathon Prototype

> Most tools show a merchant their data. PaytmGrowly *understands* it, *notices* what matters, *explains* why, and *acts* — one click at a time.

---

## 🎯 The Problem

Paytm merchants — kirana stores, small retailers, service shops — run their business reactively. They see sales happen, but get no early warning before a bad day, a lost customer, or a stockout costs them money. Their POS, Soundbox, and UPI data quietly accumulate, unread, because nobody has time to analyze it between customers.

**Existing tools show data. They don't act on it.**

## 💡 The Solution

PaytmGrowly is an AI copilot that behaves like a smart shop assistant — always watching, never intrusive, and never a black box.

```
   UNDERSTAND  →   DECIDE   →   EXPLAIN   →    ACT
   reads live      detects       shows its      one-click
   POS / stock /   issues &      reasoning      execution,
   customer data   opportunities  in plain      merchant-
                                  language       approved
```

Every suggestion PaytmGrowly makes comes with a **"why AI suggested this"** reasoning trail — and every action is something it *does*, not just recommends.

---

## ✨ What's Actually Working (Not Just a Mockup)

This is a fully functional, end-to-end demo running against a realistic simulated merchant — **Gupta General Store, Sector 14, Gurugram** — not static screenshots.

| Capability | What it does |
|---|---|
| 📊 **Business Pulse Dashboard** | Live sales vs. target, repeat customer rate, 7-day sales trend with anomalies highlighted |
| 🔮 **Proactive Insight Engine** | Auto-detects stockouts, lapsed customers, sales dips, and revenue forecasts — with zero prompting |
| ⏱️ **Predictive Forecasting** | Calculates exact hours-to-stockout per SKU and projects month-end revenue from live trend data |
| ⚡ **One-Click Actions** | Reorder stock, send win-back offers, launch flash deals — every action visibly executes and logs to an activity feed |
| 💬 **AI Chat Copilot** | Free-form Q&A grounded entirely in the merchant's own data, powered by the Claude API |
| ✍️ **Auto-Generated Marketing Copy** | Context-specific WhatsApp/SMS drafts (with tone selector) — editable before sending, never generic templates |

### Real numbers from the working prototype
- **2 critical stockouts** caught with exact runway (Amul Butter: 17h left, Fortune Sunlite Oil: 19h left)
- **54% Tuesday afternoon sales dip** detected and turned into a scheduled recovery campaign
- **₹17,546** projected extra monthly revenue from AI-guided actions alone
- **2 lapsed high-value regulars** identified and re-engaged automatically

---

## 🧠 Why This Is Different

|  | Generic Dashboard | Generic Chatbot | **PaytmGrowly** |
|---|:---:|:---:|:---:|
| Notices problems on its own | ✕ | ✕ | ✅ |
| Takes real action, not just advice | ✕ | ✕ | ✅ |
| Explains its reasoning every time | ✕ | Sometimes | ✅ |
| Built for kirana-level simplicity | ✕ | ✕ | ✅ |

---

## 🏗️ Tech Stack

- **Frontend** — React 18 + Vite + Tailwind CSS
- **Backend** — Node.js + Express (single API layer for insights, forecasts, chat, and actions)
- **AI** — Anthropic Claude API, called server-side, grounded strictly in real merchant data — with an offline fallback so the demo never breaks live
- **Data** — Structured JSON mock data modeled on a real Paytm merchant schema (POS, Soundbox, UPI) — demo-ready today, integration-ready tomorrow

## 📁 Project Structure
```
/frontend        React dashboard, chat UI, insight cards, action modals
/backend         Express API + insight/forecasting engines + AI orchestration
/data            Realistic mock merchant, stock, customer & transaction data
/docs            PRD.md · AGENTS.md · PHASES.md
```

## 🚀 Getting Started
```bash
# Backend
cd backend
npm install
npm run dev        # → http://localhost:5000

# Frontend
cd frontend
npm install
npm run dev        # → http://localhost:3000
```
Set `ANTHROPIC_API_KEY` in `backend/.env` to enable live AI reasoning (a grounded fallback keeps the demo working without it).

---

## 🗺️ Where This Goes Next

| Phase | What it unlocks |
|---|---|
| **Phase 1 — Embedded, free** | Insights + reasoning ship inside Paytm for Business, driving daily engagement |
| **Phase 2 — Copilot Actions, paid** | Automation (auto-reorders, campaigns) via a small fee or per-action charge |
| **Phase 3 — Marketplace layer** | Supplier commissions + partner offers turn merchant insight into a two-sided revenue stream |

---

## 🎬 Design Language
Navy `#0B1F3A` · Gold `#E3982B` · Teal `#1B998B` · Fraunces (display) + Manrope (UI) — built to feel like a trusted shop assistant, not another SaaS dashboard.

---

**PaytmGrowly** — the AI business partner for every Paytm merchant. 🛒✨

<img width="1536" height="934" alt="dashboard" src="https://github.com/user-attachments/assets/ca4b6f86-f7ae-4e87-a277-3de787271f27" />


<img width="1536" height="949" alt="ai-insights" src="https://github.com/user-attachments/assets/5c3cf85a-e6df-4fc6-aef4-6665da8b12d0" />


<img width="1536" height="944" alt="ai-copilot" src="https://github.com/user-attachments/assets/6794e71d-8685-4414-a73f-65d1b9e425c5" />


