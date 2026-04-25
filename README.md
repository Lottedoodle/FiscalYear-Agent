# 🤖 FiscalYear Agent — AI Financial Intelligence for Executives

> **Instant answers for executives · Real data from the database · Faster decision-making**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![LangChain](https://img.shields.io/badge/LangChain-0.3-green?logo=langchain)](https://langchain.com)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-orange?logo=openai)](https://openai.com)
[![Supabase](https://img.shields.io/badge/Supabase-pgvector-3ECF8E?logo=supabase)](https://supabase.com)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker)](https://docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📌 Overview

**FiscalYear Agent** is an AI Chatbot built for executives, enabling them to **instantly ask questions about financial statements, revenue, expenses, production costs, and electricity bills — all through natural language** — without waiting for reports or opening Excel.

The system pulls data directly from a live database (Supabase PostgreSQL) in real-time, ensuring executives always have the most up-to-date information and can make decisions with speed and confidence.

```
Executive: "What was the production volume for March 2025?"
  AI Agent: Querying the database...
  ✅ "March 2025 total production volume: 12,500 units
      Production cost: $45,200 USD
      Electricity cost: $3,800 USD"
```

---

## 🎯 Problems Solved

| Before | With FiscalYear Agent |
|--------|----------------------|
| Waiting for CFO or accounting team to compile reports | Ask anytime, instantly — available 24/7 |
| Data in Excel/reports lags behind reality | Pulls live data from the database in real-time |
| Opening multiple systems to compare numbers | Ask everything in one question — AI aggregates it all |
| Technical jargon is hard to understand | AI explains in plain, easy-to-understand language |
| Long time spent reaching a decision | Get answers in seconds |

---

## ✨ Key Features

### 💰 Financial Intelligence
- **📊 Production Volume** — View monthly and yearly production output
- **💡 Electricity Cost** — Track energy expenditure in USD
- **🏭 Production Cost** — Analyze manufacturing costs in USD
- **🗄️ Database Explorer** — AI can tell you exactly what data is available in the system

### 🤖 AI & Technology
- **Agent with Tool Calling** — AI automatically selects and invokes the right tool for each query
- **RAG (Retrieval-Augmented Generation)** — Search information from uploaded documents (PDF/CSV/TXT) via Vector Search
- **Streaming Response** — Answers appear in real-time; no waiting
- **Conversation Memory** — Remembers context so you can ask follow-up questions without repeating yourself
- **Smart Summarization** — Automatically compresses long conversations to save tokens

### 🔐 Security
- **Supabase Auth** — Enterprise-grade authentication system
- **Row-Level Security (RLS)** — Each user sees only their own data
- **Session Isolation** — Conversation history is isolated per individual user

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js 15 App                        │
│  ┌─────────────┐    ┌──────────────────────────────────┐ │
│  │  React 19   │    │        API Route /api/chat        │ │
│  │  Chat UI    │◄──►│                                  │ │
│  │  (Streaming)│    │  ┌─────────────────────────────┐ │ │
│  └─────────────┘    │  │   LangChain Agent Executor   │ │ │
│                     │  │                              │ │ │
│                     │  │  Tools:                      │ │ │
│                     │  │  ├─ get_production_volume    │ │ │
│                     │  │  ├─ get_electricity_cost     │ │ │
│                     │  │  ├─ get_production_cost      │ │ │
│                     │  │  └─ get_database_inventory   │ │ │
│                     │  └─────────────────────────────┘ │ │
│                     └──────────────────────────────────┘ │
└──────────────────────────────┬──────────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
     ┌────────────────┐ ┌──────────┐ ┌──────────────────┐
     │  Supabase DB   │ │  OpenAI  │ │ PostgreSQL Pool   │
     │  (pgvector)    │ │  GPT-4o  │ │ (Chat History &  │
     │  Documents     │ │   mini   │ │  Sessions)       │
     └────────────────┘ └──────────┘ └──────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js | 15.5.2 |
| **Language** | TypeScript | 5.x |
| **UI** | React + shadcn/ui + Tailwind CSS | 19.x / 4.x |
| **AI Orchestration** | LangChain.js | 0.3.x |
| **LLM** | OpenAI GPT-4o-mini | latest |
| **Embeddings** | OpenAI text-embedding-3-small | 1536 dim |
| **Vector Store** | Supabase pgvector | — |
| **Database** | PostgreSQL (via Supabase) | — |
| **Auth** | Supabase Auth | 2.x |
| **Chat Memory** | PostgresChatMessageHistory | — |
| **Token Counting** | js-tiktoken | 1.x |
| **Container** | Docker (multi-stage) | — |
| **CI/CD** | GitHub Actions | — |

---

## 🚀 Getting Started

### 5. Run Development Server

```bash
npm run dev
```

Open your browser at [http://localhost:3000](http://localhost:3000)

---

## 🐳 Deploy with Docker

### Build Image

```bash
docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co \
  --build-arg NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=<your-anon-key> \
  -t fiscalyear-agent:latest .
```

### Run Container

```bash
docker run -p 3000:3000 \
  -e OPENAI_API_KEY=sk-proj-... \
  -e DATABASE_URL=postgresql://... \
  fiscalyear-agent:latest
```

---

## 🔄 CI/CD Pipeline

This project uses **GitHub Actions** for automated builds:

```
Push to main/PR → Build Docker Image → Save as Artifact
```

Secrets required in your GitHub Repository:

| Secret Name | Description |
|------------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` | Supabase Anon Key |

---

---

## 🧠 How the AI Agent Works

```
1. User sends a question
       │
       ▼
2. Load Session + Summary from PostgreSQL (Parallel)
       │
       ▼
3. Fetch conversation history + Trim tokens (max 1,500 tokens)
       │
       ▼
4. Send to GPT-4o-mini with System Prompt + Chat History
       │
       ▼
5. Agent selects the appropriate Tool:
   ├─ get_production_volume  → Fetch production volume from Supabase
   ├─ get_electricity_cost   → Fetch electricity costs from Supabase
   ├─ get_production_cost    → Fetch production costs from Supabase
   └─ get_database_inventory → Inspect database schema
       │
       ▼
6. Stream response back to the UI
       │
       ▼
7. Save messages + Update Summary (Parallel)
```

### Token Management Strategy
- **Trim**: Retain only the most recent 1,500 tokens of conversation history
- **Summarize**: Automatically summarize older messages that exceed the token limit
- **Cache**: Use `CacheBackedEmbeddings` to reduce redundant OpenAI API calls

---

---

## 🗺️ Roadmap

- [x] Agent with Tool Calling (Production Volume, Cost, Electricity)
- [x] RAG with pgvector Document Search
- [x] Conversation Memory with PostgreSQL
- [x] Smart Token Trimming & Summarization
- [x] Supabase Auth + Session Management
- [x] Docker & GitHub Actions CI/CD
- [ ] Annual Fiscal Year Report
- [ ] Revenue & Expense Chart Dashboard
- [ ] Export data to PDF / Excel
- [ ] Full Thai NLP Support
- [ ] Multi-tenant support for multiple companies

---

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Credits

Built with ❤️ using:
- [Next.js](https://nextjs.org) — React Framework
- [LangChain.js](https://js.langchain.com) — AI Orchestration
- [Supabase](https://supabase.com) — Database & Auth
- [OpenAI](https://openai.com) — Language Model
- [shadcn/ui](https://ui.shadcn.com) — UI Components
