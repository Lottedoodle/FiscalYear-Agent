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

## 🚀 เริ่มต้นใช้งาน (Getting Started)

### ข้อกำหนดเบื้องต้น (Prerequisites)

- [Node.js](https://nodejs.org) v20 หรือสูงกว่า
- [npm](https://npmjs.com) v10 หรือสูงกว่า
- บัญชี [Supabase](https://supabase.com) (ฟรี)
- API Key ของ [OpenAI](https://platform.openai.com)

---

### 1. Clone Repository

```bash
git clone https://github.com/<your-org>/FiscalYear-Agent.git
cd FiscalYear-Agent
```

### 2. ติดตั้ง Dependencies

```bash
npm install
```

### 3. ตั้งค่า Environment Variables

คัดลอกและแก้ไขไฟล์ `.env`:

```bash
cp .env.example .env
```

แก้ไขค่าต่อไปนี้ใน `.env`:

```env
# ─── Supabase ────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=<your-anon-key>

# ─── OpenAI ──────────────────────────────────────────────
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL_NAME=gpt-4o-mini
OPENAI_EMBEDDING_MODEL_NAME=text-embedding-3-small

# ─── PostgreSQL (Supabase Transaction Pooler) ────────────
DATABASE_URL=postgresql://<user>:<password>@<host>:6543/postgres
# หรือกำหนดแยกตัวแปร:
PG_HOST=aws-x-xx-xxx-x.pooler.supabase.com
PG_PORT=6543
PG_USER=postgres.<project-ref>
PG_PASSWORD=<your-db-password>
PG_DATABASE=postgres
```

### 4. ตั้งค่าฐานข้อมูล Supabase

รัน SQL ต่อไปนี้ใน Supabase SQL Editor เพื่อสร้างตารางที่จำเป็น:

```sql
-- ตารางเก็บ Session การสนทนา
CREATE TABLE chat_sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT DEFAULT 'New Chat',
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ตารางเก็บประวัติข้อความ
CREATE TABLE chat_messages (
  id SERIAL PRIMARY KEY,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ตาราง Vector Store สำหรับเอกสาร RAG
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE documents (
  id BIGSERIAL PRIMARY KEY,
  content TEXT,
  metadata JSONB,
  embedding VECTOR(1536)
);

-- Function สำหรับ Vector Similarity Search
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding VECTOR(1536),
  match_count INT DEFAULT 5
) RETURNS TABLE (id BIGINT, content TEXT, metadata JSONB, similarity FLOAT)
LANGUAGE SQL STABLE AS $$
  SELECT id, content, metadata,
    1 - (embedding <=> query_embedding) AS similarity
  FROM documents
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;

-- ตารางข้อมูลทางการเงิน (ตัวอย่าง)
CREATE TABLE production_volume_sample (
  id SERIAL PRIMARY KEY,
  month TEXT NOT NULL,
  year INTEGER NOT NULL,
  total_output NUMERIC NOT NULL
);

CREATE TABLE electricity_cost_sample (
  id SERIAL PRIMARY KEY,
  month TEXT NOT NULL,
  year TEXT NOT NULL,
  cost NUMERIC NOT NULL
);

CREATE TABLE production_cost_sample (
  id SERIAL PRIMARY KEY,
  month TEXT NOT NULL,
  year TEXT NOT NULL,
  prod_cost NUMERIC NOT NULL
);

-- Function สำหรับดู Schema ฐานข้อมูล
CREATE OR REPLACE FUNCTION get_db_inventory()
RETURNS TABLE(table_name TEXT, columns TEXT)
LANGUAGE SQL STABLE AS $$
  SELECT
    t.table_name::TEXT,
    string_agg(c.column_name || ' (' || c.data_type || ')', ', ' ORDER BY c.ordinal_position) AS columns
  FROM information_schema.tables t
  JOIN information_schema.columns c ON t.table_name = c.table_name
  WHERE t.table_schema = 'public' AND t.table_type = 'BASE TABLE'
  GROUP BY t.table_name;
$$;
```

### 5. รัน Development Server

```bash
npm run dev
```

เปิดเบราว์เซอร์ที่ [http://localhost:3000](http://localhost:3000)

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

โปรเจคนี้ใช้ **GitHub Actions** สำหรับ Build อัตโนมัติ:

```
Push to main/PR → Build Docker Image → Save as Artifact
```

Secrets ที่ต้องตั้งใน GitHub Repository:

| Secret Name | คำอธิบาย |
|------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` | Supabase Anon Key |

---

## 📂 โครงสร้างโปรเจค (Project Structure)

```
FiscalYear-Agent/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── chat/
│   │   │       └── route.ts      # 🧠 Core Agent API — Tools + RAG + Streaming
│   │   ├── auth/                 # Authentication pages
│   │   ├── chat/                 # Chat interface page
│   │   ├── layout.tsx
│   │   └── page.tsx              # Landing page
│   ├── components/               # Reusable UI components (shadcn/ui)
│   ├── contexts/
│   │   └── chat-context.tsx      # Global chat state management
│   ├── hooks/                    # Custom React hooks
│   ├── lib/
│   │   ├── database.ts           # PostgreSQL connection pool (Singleton)
│   │   ├── server.ts             # Server-side Supabase client
│   │   ├── client.ts             # Client-side Supabase client
│   │   ├── middleware.ts         # Auth middleware helpers
│   │   └── utils.ts              # Utility functions
│   └── middleware.ts             # Next.js middleware (Auth guard)
├── .github/
│   └── workflows/
│       └── _build.yml            # CI/CD GitHub Actions
├── Dockerfile                    # Multi-stage Docker build
├── next.config.ts
├── package.json
└── README.md
```

---

## 🧠 วิธีการทำงานของ AI Agent

```
1. ผู้ใช้ส่งคำถาม
       │
       ▼
2. โหลด Session + Summary จาก PostgreSQL (Parallel)
       │
       ▼
3. ดึงประวัติการสนทนา + Trim Token (max 1,500 tokens)
       │
       ▼
4. ส่งให้ GPT-4o-mini พร้อม System Prompt + Chat History
       │
       ▼
5. Agent เลือก Tool ที่เหมาะสม:
   ├─ get_production_volume  → ดึงยอดผลิตจาก Supabase
   ├─ get_electricity_cost   → ดึงค่าไฟจาก Supabase
   ├─ get_production_cost    → ดึงต้นทุนจาก Supabase
   └─ get_database_inventory → ดูโครงสร้างฐานข้อมูล
       │
       ▼
6. ส่งคำตอบแบบ Streaming กลับ UI
       │
       ▼
7. บันทึกข้อความ + อัพเดต Summary (Parallel)
```

### Token Management Strategy
- **Trim**: เก็บเฉพาะ 1,500 token ล่าสุดของประวัติสนทนา
- **Summarize**: สรุปข้อความเก่าที่เกิน Limit โดยอัตโนมัติ
- **Cache**: ใช้ `CacheBackedEmbeddings` เพื่อลดการเรียก OpenAI API ซ้ำ

---

## 🔑 Environment Variables Reference

| Variable | Required | Default | คำอธิบาย |
|----------|----------|---------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | — | Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY` | ✅ | — | Supabase Anon Key |
| `OPENAI_API_KEY` | ✅ | — | OpenAI API Key |
| `OPENAI_MODEL_NAME` | ❌ | `gpt-4o-mini` | OpenAI Chat Model |
| `OPENAI_EMBEDDING_MODEL_NAME` | ❌ | `text-embedding-3-small` | Embedding Model |
| `DATABASE_URL` | ✅* | — | PostgreSQL Connection URL |
| `PG_HOST` | ✅* | — | DB Host (ถ้าไม่ใช้ DATABASE_URL) |
| `PG_PORT` | ✅* | `5432` | DB Port |
| `PG_USER` | ✅* | — | DB Username |
| `PG_PASSWORD` | ✅* | — | DB Password |
| `PG_DATABASE` | ✅* | — | DB Name |

> *ใช้ `DATABASE_URL` **หรือ** `PG_*` อย่างใดอย่างหนึ่ง

---

## 🗺️ Roadmap

- [x] Agent with Tool Calling (Production Volume, Cost, Electricity)
- [x] RAG with pgvector Document Search
- [x] Conversation Memory with PostgreSQL
- [x] Smart Token Trimming & Summarization
- [x] Supabase Auth + Session Management
- [x] Docker & GitHub Actions CI/CD
- [ ] รายงาน Fiscal Year ประจำปี (Annual Report)
- [ ] แดชบอร์ดกราฟรายได้-ค่าใช้จ่าย (Chart Dashboard)
- [ ] Export ข้อมูลเป็น PDF/Excel
- [ ] รองรับภาษาไทยเต็มรูปแบบ (Thai NLP)
- [ ] Multi-tenant สำหรับหลายบริษัท

---

## 🤝 Contributing

1. Fork repository นี้
2. สร้าง feature branch: `git checkout -b feature/your-feature`
3. Commit การเปลี่ยนแปลง: `git commit -m 'feat: add your feature'`
4. Push branch: `git push origin feature/your-feature`
5. เปิด Pull Request

---

## 📄 License

MIT License — ดูรายละเอียดใน [LICENSE](LICENSE)

---

## 🙏 Credits

สร้างด้วย ❤️ โดยใช้:
- [Next.js](https://nextjs.org) — React Framework
- [LangChain.js](https://js.langchain.com) — AI Orchestration
- [Supabase](https://supabase.com) — Database & Auth
- [OpenAI](https://openai.com) — Language Model
- [shadcn/ui](https://ui.shadcn.com) — UI Components
