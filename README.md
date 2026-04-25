# 🤖 FiscalYear Agent — AI Financial Intelligence for Executives

> **ผู้บริหารถามได้ทันที · ข้อมูลจริงจากฐานข้อมูล · ตัดสินใจได้เร็วขึ้น**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org)
[![LangChain](https://img.shields.io/badge/LangChain-0.3-green?logo=langchain)](https://langchain.com)
[![OpenAI](https://img.shields.io/badge/OpenAI-GPT--4o--mini-orange?logo=openai)](https://openai.com)
[![Supabase](https://img.shields.io/badge/Supabase-pgvector-3ECF8E?logo=supabase)](https://supabase.com)
[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker)](https://docker.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📌 ภาพรวม (Overview)

**FiscalYear Agent** คือระบบ AI Chatbot สำหรับผู้บริหาร ที่ช่วยให้สามารถ **ถามคำถามเกี่ยวกับงบการเงิน รายรับ รายจ่าย ต้นทุนการผลิต และค่าไฟฟ้า ได้ทันทีผ่านภาษาธรรมชาติ** โดยไม่ต้องรอรายงานหรือเปิด Excel

ระบบดึงข้อมูลจากฐานข้อมูลจริง (Supabase PostgreSQL) แบบ Real-time ทำให้ผู้บริหารได้รับข้อมูลที่เป็นปัจจุบันที่สุด และสามารถตัดสินใจได้อย่างรวดเร็วและมั่นใจ

```
ผู้บริหาร: "ยอดการผลิตเดือนมีนาคม 2025 เป็นเท่าไหร่?"
  AI Agent: ค้นหาข้อมูลจากฐานข้อมูล...
  ✅ "เดือนมีนาคม 2025 มียอดการผลิตรวม 12,500 หน่วย
      ต้นทุนการผลิต: $45,200 USD
      ค่าไฟฟ้า: $3,800 USD"
```

---

## 🎯 ปัญหาที่แก้ไขได้ (Problems Solved)

| ปัญหาเดิม | สิ่งที่ FiscalYear Agent ทำให้ |
|------------|-------------------------------|
| ต้องรอ CFO หรือทีมบัญชีสรุปรายงาน | ถามได้เองทันที ตลอด 24/7 |
| ข้อมูลใน Excel/รายงาน ล้าหลังความเป็นจริง | ดึงข้อมูลจากฐานข้อมูลจริงแบบ Real-time |
| ต้องเปิดหลายระบบเพื่อเปรียบเทียบตัวเลข | ถามรวมในคำถามเดียว AI รวบรวมให้ |
| ภาษาเทคนิค ยากต่อการเข้าใจ | AI อธิบายเป็นภาษาธรรมชาติที่เข้าใจง่าย |
| ใช้เวลานานในการตัดสินใจ | ได้คำตอบภายในไม่กี่วินาที |

---

## ✨ ความสามารถหลัก (Key Features)

### 💰 ด้านการเงิน (Financial Intelligence)
- **📊 ยอดการผลิต (Production Volume)** — ดูปริมาณผลผลิตรายเดือน รายปี
- **💡 ค่าไฟฟ้า (Electricity Cost)** — ติดตามค่าใช้จ่ายด้านพลังงาน (USD)
- **🏭 ต้นทุนการผลิต (Production Cost)** — วิเคราะห์ต้นทุนการผลิตสินค้า (USD)
- **🗄️ สำรวจฐานข้อมูล** — AI สามารถแจ้งได้ว่าข้อมูลใดมีในระบบบ้าง

### 🤖 ด้าน AI & เทคโนโลยี
- **Agent with Tool Calling** — AI เลือกและใช้ Tools ที่เหมาะสมโดยอัตโนมัติ
- **RAG (Retrieval-Augmented Generation)** — ค้นหาข้อมูลจากเอกสาร PDF/CSV/TXT ผ่าน Vector Search
- **Streaming Response** — แสดงคำตอบแบบ Real-time ไม่ต้องรอ
- **Conversation Memory** — จดจำบริบทการสนทนา ถามต่อเนื่องได้โดยไม่ต้องพูดซ้ำ
- **Smart Summarization** — สรุปบทสนทนายาวๆ อัตโนมัติ เพื่อประหยัด Token

### 🔐 ด้านความปลอดภัย
- **Supabase Auth** — ระบบ Authentication ระดับ Enterprise
- **Row-Level Security (RLS)** — แต่ละ User เห็นเฉพาะข้อมูลของตัวเอง
- **Session Isolation** — ประวัติการสนทนาแยกเป็นรายบุคคล

---

## 🏗️ สถาปัตยกรรมระบบ (Architecture)

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

## 🐳 Deploy ด้วย Docker

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
