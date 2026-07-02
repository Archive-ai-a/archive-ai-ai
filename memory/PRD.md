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

## What's Implemented (2026-02-07)
### Public site
- Home: hero + marquee + career packs + featured + trending + new launches + categories CTA + money CTA
- Directory `/tools` — 27 seeded tools, category / pricing / profession filters + debounced live search
- Tool detail `/tools/:slug` — Start Here 3-step workflow, Best Use Cases, IRL Integration, Make Money module, Best Prompts (copy-to-clipboard), Pros/Cons, Related tools, sticky Visit CTA, free alternatives sidebar
- Categories `/categories` — 7 groups × ~40 sub-categories (Personas, Business Ops, Industry Verticals, Technical, AI Agents, Automation, Core)
- Career Packs `/packs` — 5 curated packs with visual emoji workflow diagrams
- Money Guides `/money` — monetization strategies grouped by tool
- Workflows / Prompts `/prompts` — battle-tested prompts library
- Roadmap `/roadmap` — Now / Next / Later phases
- FAQ accordion in every footer
- AI Chat widget — Claude Sonnet 4.5 recommender with streaming SSE

### Admin (`/admin/*`)
- Login screen w/ auth guard
- Dashboard — 4 stat cards + DAU 7-day line chart + Top viewed tools bar chart
- Tools management — table w/ search, pagination, drawer form (all fields), edit/delete
- Categories management — grouped display, create/edit/delete (parent + sub)
- Career Packs management — pick tools, add emoji workflow steps
- Users management — list + click-through activity feed
- Admins management (super admin only) — invite, reset password, delete

## Prioritized Backlog

### P1 (Next)
- Public-user auth + bookmarks/save lists (JWT flow ready to enable)
- Weekly digest email of new/trending tools (SendGrid or Resend)
- Add JSON schema import to bulk-load 500+ tools via admin
- Add rate limiting + brute-force lockout on `/api/auth/login`

### P2 (Later)
- Comparison view (`/compare?tools=chatgpt,claude`) with side-by-side
- User-submitted prompts (moderated in admin)
- Course + certification track ("AI Money Bootcamp")
- Affiliate/referral revenue tracking

## Credentials (seeded)
- Super Admin: `soumyaranjansrb9@gmail.com` / `Srb123@#`

## Notes
- All 3rd-party integrations go through Emergent LLM Key (Claude Sonnet 4.5)
- Testing: iteration_1 → 100% backend / ~85% frontend; iteration_2 → 100% frontend after fixes
