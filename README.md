# Archive/AI — The Index of AI Tools

> Discover, learn, and monetize AI. A curated directory of 124+ AI tools with 3-step start guides, career packs, money strategies, and an AI chat assistant.

## What Is This?

Archive/AI is a Futurepedia-style AI tools discovery platform. Users can:

- **Browse 124+ AI tools** across 50 categories — chat, image, video, audio, code, writing, agents, automation, and more
- **Get started fast** — every tool has a "3-Step Workflow" guide, best use cases, IRL integration tips, and copy-pasteable prompts
- **Compare tools** side-by-side — pick 2–4 tools and see features, pricing, pros/cons in a comparison table
- **Follow career packs** — 5–6 tools chained into a workflow for your profession (student, developer, marketer, freelancer, researcher, founder, designer)
- **Learn to earn** — concrete monetization strategies per tool: freelance gigs, productized services, agency plays
- **Save bookmarks** — create an account, save tools, build your personal AI stack
- **Chat with TOOLSCOUT** — AI assistant powered by Claude Sonnet 4.5 that recommends tools for your needs
- **Admin panel** — full CMS with dashboard analytics, CRUD for tools/categories/packs, user management, RBAC

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python FastAPI + MongoDB (Motor async driver) |
| Database | MongoDB Atlas |
| Frontend | React 19 + React Router v7 + Tailwind CSS + shadcn/ui |
| Charts | Recharts |
| AI Chat | Claude Sonnet 4.5 via Anthropic API (SSE streaming) |
| Auth | bcrypt + JWT (cookie + Bearer), rate-limited login, RBAC |

## Project Structure

```
archive-ai-ai/
├── backend/
│   ├── server.py           # FastAPI app — all routes
│   ├── auth_utils.py       # Password hashing, JWT, token extraction
│   ├── crud_utils.py       # Slug-based CRUD helpers
│   ├── seed_data.py        # Core curated tools, categories, career packs
│   ├── extra_tools.py      # 97 additional tools from AI_Tools_Database.xlsx
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── pages/          # Home, Directory, ToolDetail, Compare, Bookmarks, Careers, etc.
│   │   ├── components/     # Layout, ToolCard, ChatWidget
│   │   ├── lib/            # API client, auth context, utilities
│   │   └── constants/      # Test IDs
│   └── package.json
├── memory/
│   └── PRD.md              # Product requirements document
└── tests/                  # Backend pytest suite
```

## Getting Started

### Prerequisites

- Python 3.10+
- Node.js 18+
- Yarn
- MongoDB Atlas account (or local MongoDB)
- Anthropic API key (for AI chat widget)

### 1. Backend

```bash
cd backend
cp .env.example .env    # Edit .env with your values
pip install -r requirements.txt
uvicorn server:app --reload
```

Backend runs on `http://localhost:8000`.

### 2. Frontend

```bash
cd frontend
yarn install
# Set the backend URL (create a .env file in frontend/):
# REACT_APP_BACKEND_URL=http://localhost:8000
yarn start
```

Frontend runs on `http://localhost:3000`.

### 3. Environment Variables

**Backend** (`backend/.env`):

| Variable | Description |
|---|---|
| `MONGO_URL` | MongoDB Atlas connection string |
| `DB_NAME` | Database name (default: `archive_ai`) |
| `ANTHROPIC_API_KEY` | Anthropic API key for chat |
| `ADMIN_EMAIL` | Super admin email (seeded on startup) |
| `ADMIN_PASSWORD` | Super admin password |
| `CORS_ORIGINS` | Comma-separated allowed origins |

**Frontend** (`frontend/.env`):

| Variable | Description |
|---|---|
| `REACT_APP_BACKEND_URL` | Backend API base URL |

### 4. Database

On first startup, the backend auto-seeds:
- 27 core curated tools
- 97 additional tools (from Excel import)
- 50 categories (7 groups + 43 sub-categories)
- 5 career packs
- 1 super admin user

## Default Credentials

| Role | Email | Password |
|---|---|---|
| Super Admin | `soumyaranjansrb9@gmail.com` | Set via `ADMIN_PASSWORD` in `.env` |

## Features

### Public Site

- **Home** — hero with search, marquee, career packs, featured/trending/new tools, categories CTA, money CTA
- **Directory** `/tools` — 124 tools with category/pricing/profession filters + debounced live search
- **Tool Detail** `/tools/:slug` — full guide: 3-step workflow, use cases, IRL integration, make money module, best prompts (copy-to-clipboard), pros/cons, related tools, free alternatives sidebar, bookmark toggle
- **Categories** `/categories` — 7 groups × 43 sub-categories with tool counts
- **Career Packs** `/packs` — 5 curated packs with emoji workflow diagrams
- **Compare** `/compare?tools=...` — side-by-side comparison table (2–4 tools) with picker modal
- **Money Guides** `/money` — monetization strategies grouped by tool
- **Prompts** `/prompts` — battle-tested prompts library with copy-to-clipboard
- **Roadmap** `/roadmap` — public build log (shipped / in-progress / planned)
- **Auth** `/login` `/register` — account creation with auto-login
- **Bookmarks** `/bookmarks` — save tools to your personal stack
- **AI Chat** — floating TOOLSCOUT widget with Claude Sonnet 4.5 streaming
- **FAQ** — accordion in page footer

### Admin (`/admin/*`)

- Dashboard — 4 stat cards + DAU 7-day line chart + top viewed tools bar chart
- Tools CRUD — table with search, pagination, drawer form, edit/delete, bulk import
- Categories management — parent + sub categories
- Career Packs management — pick tools + emoji workflow steps
- Users management — list + click-through activity feed
- Admins management (super admin only) — invite, reset password, delete
- Analytics — DAU, tool views, category views

### Security

- Rate-limited login (5 fails / 15 min per email → 429)
- JWT auth via httpOnly cookie + Bearer header fallback
- RBAC: `super_admin` > `admin` > `user`
- Passwords hashed with bcrypt

## Design System

**"The Archive"** — neo-brutalist, function-first design:

- Typography: Outfit (headings) + Work Sans (body) + Space Mono (code/tags)
- Colors: black/white with Signal Red (#FF3B30) for action, Archive Blue (#0044FF) for metadata
- Borders: 2px solid black on all cards, buttons, inputs
- Cards: no border-radius, hover raise with shadow offset
- Testing: `data-testid` attributes on all interactive elements

See [design_guidelines.json](design_guidelines.json) for full specs.

## License

MIT
