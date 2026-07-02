# Archive/AI — Product Requirements Document

## Original Problem Statement
Palak is building an all-in-one AI tools discovery platform (Futurepedia-inspired). Users can:
- Discover all AI tools in one place with guides, categories, and use-case mapping
- Learn how to get started, best prompts per tool, and free alternatives
- See which tools are best for each profession (student, dev, marketer, freelancer, researcher, founder, designer)
- Learn how to make money with each tool or tool combo
- Access curated career packs (5-6 tools chained by workflow)
- Get personalized recommendations via AI chatbot
- (Admin) Manage the full catalog via a no-code CMS with RBAC & analytics

## Architecture
- **Backend**: FastAPI + MongoDB (motor async)
  - Auth: bcrypt + JWT (cookie + Bearer), super-admin seeded from `.env`, RBAC (super_admin / admin)
  - Models: Tool, Category (parent/sub), CareerPack, User, Activity, ChatMessage
  - AI: Claude Sonnet 4.5 via Emergent Universal Key with SSE streaming
- **Frontend**: React 19 + React Router v7 + Tailwind + shadcn/ui + Recharts
  - Neo-brutalist "Archive" design system: Outfit + Work Sans + Space Mono, black/white with red signal & blue archive accents
- **Auth Flow**: Cookie-based (`httponly access_token`) + fallback `Authorization: Bearer` header (localStorage)

## User Personas
- Curious learner / student — wants recommendations, prompts, free alternatives
- Practitioner (dev, marketer, freelancer) — wants career pack + monetization
- Founder — needs research/deck/MVP stack
- Admin / Palak — curates content, monitors activity, manages other admins

## What's Implemented (2026-02-07 → 2026-02-08)
### Public site
- Home: hero + marquee + career packs + featured + trending + new launches + categories CTA + money CTA
- Directory `/tools` — **124 tools** (27 curated + 97 imported from AI_Tools_Database.xlsx), category / pricing / profession filters + debounced live search
- Tool detail `/tools/:slug` — Start Here 3-step workflow, Best Use Cases, IRL Integration, Make Money module, Best Prompts (copy-to-clipboard), Pros/Cons, Related tools, sticky Visit CTA + **Save (bookmark)** button, free alternatives sidebar
- Categories `/categories` — 7 groups × ~40 sub-categories
- Career Packs `/packs` — 5 curated packs with emoji workflow diagrams
- **Compare** `/compare?tools=...` — side-by-side comparison table (2–4 tools) with picker modal
- Money Guides `/money` — monetization strategies grouped by tool
- Workflows / Prompts `/prompts` — prompts library
- Roadmap `/roadmap`
- FAQ accordion in every footer
- AI Chat widget (Claude Sonnet 4.5 streaming)
- **Public user auth** `/login` `/register` + **Bookmarks** `/bookmarks`

### Admin (`/admin/*`)
- Login screen w/ auth guard
- Dashboard — 4 stat cards + DAU 7-day line chart + Top viewed tools bar chart
- Tools management — table w/ search, pagination, drawer form (all fields), edit/delete + **Import Extras** button (bulk imports remaining Excel tools)
- Categories management (parent + sub)
- Career Packs management (pick tools + emoji workflow steps)
- Users management — list + click-through activity feed
- Admins management (super admin only) — invite, reset, delete

### Security
- **Rate-limited login** (5 fails / 15 min per email → 429)
- JWT auth via cookie + Bearer header

## Prioritized Backlog

### P1 (Next)
- Weekly digest email of new/trending tools (needs Resend or SendGrid integration)
- Admin bulk JSON upload from UI (endpoint exists as `/api/admin/bulk-import`, needs UI)
- Email verification on register

### P2 (Later)
- User-submitted prompts (moderated in admin)
- Affiliate/referral revenue tracking (attach ref params to Visit CTA)
- Course + certification track

## Credentials (seeded)
- Super Admin: `soumyaranjansrb9@gmail.com` / `Srb123@#`

## Notes
- All 3rd-party integrations go through Emergent LLM Key (Claude Sonnet 4.5)
- Testing: iteration_1 → 100% backend / ~85% frontend; iteration_2 → 100% frontend after fixes
