# NLUYXL — Autonomous Business Operating System

> An enterprise-grade, YC-tier clone of Plyxl. The workspace that does the work.

---

## 🌟 Core Platform Architecture

NLUYXL is designed around five core capabilities:
1. **Adaptive Operating Canvas (`/home`)**: 12-column drag-and-drop grid with live communication widgets, folders, debounced synchronization (500ms), and browser `pagehide` beacon support (`keepalive: true`).
2. **Omnipresent Multi-Modal Agent (`@Plyxl` / `⌘J`)**: Global modal command bar streaming tokens in under 600ms via Server-Sent Events (SSE) across 9 discrete operational states.
3. **Human-in-the-Loop (HITL) Safety Barrier**: High-risk write actions (sending emails, modifying invoices) pause execution and surface interactive approval cards with diff previews.
4. **Autonomous Background Jobs (`/jobs`)**: Converts natural language into resilient 5-field cron routines running on Celery/Redis workers.
5. **Synthetic App Generator**: *"Say what you want to see, and the agent builds it"* — compiles custom mini-apps into sandboxed iframes.

---

## 🗄️ Database & Multi-Tenancy (Supabase)
Connected to production Supabase project `fmmliooyfkqhpbkwagxd` with PostgreSQL 17 + Row Level Security (RLS) enforcing strict workspace tenant isolation.

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Boot Python Backend with uv
cd backend
uv run uvicorn app.main:app --reload --port 8000

# 2. Run Backend Unit Tests
uv run --with pytest --with pytest-asyncio pytest tests/test_backend.py

# 3. Boot Next.js 15 Frontend
cd ../frontend
npm run dev
```

---

## ☁️ DigitalOcean Production Deployment

```bash
# SSH into your DigitalOcean Droplet and run:
curl -sSL https://raw.githubusercontent.com/heythisisarsh/nluyxl/main/deploy/digitalocean-setup.sh | bash
```
