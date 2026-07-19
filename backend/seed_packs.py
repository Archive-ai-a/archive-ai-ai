"""
50 Career Packs — complete data for seeding via POST /api/admin/reseed.
Loaded by seed_data.py; each pack maps to the Career_Packs_Monetization_FullGuide.docx.
"""
import json

# Compact definitions: (name, slug, description, profession, domain, difficulty, est_time, tools, workflow, image, money)
# workflow: [(emoji, label, tool_slug), ...]
# money: [(title, [step,..], [tool,..], price_range, where_to_sell), ...]

_P = lambda *a: a

# Shared monetization templates by domain
STUDENT_MONEY = [
    ("Notes-as-a-Product", ["Turn AI summaries into exam packs","Design with Canva","Bundle by subject","List with previews"], ["NotebookLM","ChatGPT","Canva"], "₹99–₹499/pack", "Instamojo, Gumroad, WhatsApp groups"),
    ("Tutoring with AI Leverage", ["Prep lesson plans with ChatGPT","Build Q&A banks","Offer 1:1/group sessions","Record & resell sessions"], ["ChatGPT","NotebookLM","Zoom"], "₹300–₹800/hr", "Superprof, Preply, Instagram DMs"),
]

DEV_MONEY = [
    ("Ship MVPs for Founders", ["Prototype UI in hours with AI","Wire backend with Supabase","Deploy on Vercel","Package as 'MVP in 7 days'"], ["Cursor","Supabase","Vercel","ChatGPT"], "$500–$3,000/MVP", "Upwork, Contra, LinkedIn DMs"),
    ("Sell Boilerplates & Templates", ["Build reusable SaaS starter","Document with Claude","Package as repo + video","List on storefronts"], ["Cursor","Claude","Loom"], "$29–$199/template", "Gumroad, GitHub Sponsors"),
    ("Landing Page Agency", ["Design with AI tools","Build with React/Tailwind","Optimize for mobile & SEO","Fixed-price packages"], ["v0","Figma AI","Cursor"], "$500–$2,000/page", "Fiverr, Upwork, direct outreach"),
]

CREATOR_MONEY = [
    ("Faceless YouTube Channel", ["Script with ChatGPT","Voice with ElevenLabs","Visuals with Midjourney","Edit in CapCut","Monetize AdSense + sponsors"], ["ChatGPT","ElevenLabs","Midjourney","CapCut"], "$1–$5 RPM + $200–$2,000/sponsor", "YouTube Partner Program, Aspire"),
    ("Video Editing as a Service", ["Offer 'idea to publish' pipeline","Charge per video or monthly retainer","Deliver via frame.io"], ["CapCut","ElevenLabs","Canva"], "₹1,500–₹8,000/video or ₹15,000+/mo", "Fiverr, Instagram outreach"),
]

DESIGN_MONEY = [
    ("AI-Assisted Logo/Brand Packages", ["Generate concepts in Midjourney","Refine in Canva/Figma","Package logo + guidelines + social kit","Deliver in 48 hours"], ["Midjourney","Looka","Canva","Figma"], "$50–$300/brand kit", "Fiverr, 99designs, Instagram"),
    ("UI Kits & Templates", ["Design UI kit with Figma AI","Prototype with Framer","List as downloadable asset"], ["Figma AI","Framer"], "$19–$99/kit", "Gumroad, UI8, Framer Marketplace"),
]

MARKETER_MONEY = [
    ("SEO Content-as-a-Service", ["Keyword research with AI","Draft with Claude","Optimize with Surfer","Sell monthly content packages"], ["Ahrefs AI","Surfer SEO","Claude"], "₹8,000–₹40,000/mo", "LinkedIn, cold email"),
    ("Social Media Management Retainer", ["Plan calendar with ChatGPT","Design in Canva","Schedule with Buffer","Report monthly"], ["ChatGPT","Canva","Buffer AI"], "₹10,000–₹50,000/mo", "Instagram, local business networks"),
]

FOUNDER_MONEY = [
    ("Fractional AI-Ops Service", ["Audit manual workflows","Automate with Make.com/Zapier","Charge setup + monthly retainer"], ["Make.com","Zapier","ChatGPT"], "$300–$1,500 setup + $200–$800/mo", "Cold outreach, Upwork"),
    ("Sell Productized SaaS", ["Build MVP with AI tools","Validate with landing page","Charge via Stripe"], ["v0","bolt.new","Stripe"], "$9–$99/mo subscription", "Product Hunt, X, cold outbound"),
]

FREELANCE_MONEY = [
    ("AI-Augmented Writing/Design", ["Use AI for first drafts","Human-edit for quality","Charge premium for speed","Upsell packages"], ["ChatGPT","Claude","Grammarly"], "$20–$150/piece", "Upwork, Fiverr, referrals"),
    ("Done-for-You Proposal System", ["Template proposals with Notion + ChatGPT","Auto-invoice with QuickBooks AI","Sell system to other freelancers"], ["Notion","ChatGPT","QuickBooks AI"], "₹999–₹2,999/template pack", "Gumroad, freelancer communities"),
]

BUSOPS_MONEY = [
    ("AI Recruiting/HR-as-a-Service", ["Screen resumes with ChatGPT","Auto-schedule interviews","Charge per hire or monthly"], ["ChatGPT","Calendly","LinkedIn Recruiter AI"], "₹5,000–₹20,000/hire", "LinkedIn, HR agency partnerships"),
    ("Customer Support Automation", ["Deploy AI chatbot for business","Train on their FAQs","Charge setup + monthly management"], ["Intercom Fin","Zendesk AI"], "$500 setup + $150–$500/mo", "Cold email to ecommerce/SaaS brands"),
]

REALEST_MONEY = [
    ("Lead Scoring Automation", ["Connect Make.com to CRM","Score leads with AI","Charge per-agent monthly"], ["Make.com","GoHighLevel","Wati","Airtable"], "₹15,000–₹50,000 setup + ₹3,000–₹8,000/mo", "Real estate agency outreach, WhatsApp"),
    ("Listing Content Service", ["Generate descriptions with ChatGPT","Design flyers in Canva","Sell monthly subscription"], ["ChatGPT","Canva"], "₹2,000–₹8,000/mo", "Local real estate networks"),
]

TEACH_MONEY = [
    ("AI-Built Online Course", ["Outline curriculum with ChatGPT","Build slides with Gamma","Host on Teachable","Market via email"], ["ChatGPT","Gamma","Teachable"], "$29–$199/course", "Teachable, Gumroad, YouTube funnel"),
    ("Resume & LinkedIn Optimization", ["Rewrite resume with ChatGPT","Design with Canva","Optimize LinkedIn profile","Offer interview prep upsells"], ["ChatGPT","Canva","Interview Warmup"], "₹499–₹2,999/package", "Fiverr, Instagram, campus communities"),
]

_IMG = lambda n: f"https://images.pexels.com/photos/{n}/pexels-photo-{n}.jpeg"


# ── 50 packs, 10 domains × 5 ──
RAW = [
    # ─── 1. STUDENTS & ACADEMICS (6) ───
    _P("Student Pack","student-pack","Ace every class — from lecture notes to polished presentations in half the time.","Student","Students & Academics","Beginner","1 afternoon setup; saves 10+ hrs/week",
       ["chatgpt","perplexity","notion-ai","gamma","canva-magic-studio"],
       [("💡","Idea","chatgpt"),("🔍","Research","perplexity"),("📝","Notes","notion-ai"),("📊","Slides","gamma"),("🗂","Organize","notion-ai")],
       _IMG(4144923), STUDENT_MONEY),
    _P("Exam Prep Pack","exam-prep-pack","Syllabus → flashcards → quiz → revision. Systematic prep that guarantees top marks.","Student","Students & Academics","Beginner","1 weekend to build; use all semester",
       ["chatgpt","perplexity","notion-ai"],
       [("📋","Syllabus","chatgpt"),("📖","Explain","chatgpt"),("🃏","Flashcards","chatgpt"),("📝","Quiz","chatgpt"),("🔄","Revise","notion-ai")],
       _IMG(3184332), STUDENT_MONEY),
    _P("Thesis & Research Pack","thesis-research-pack","Literature search → citation-ready draft. The complete academic writing pipeline.","Researcher","Students & Academics","Intermediate","2–3 days to master; saves months",
       ["perplexity","claude","chatgpt","notion-ai"],
       [("🔎","Search","perplexity"),("📚","Read","claude"),("📎","Cite","chatgpt"),("✍️","Draft","claude"),("✨","Polish","claude")],
       _IMG(3735711),
       [("Academic Editing Service",["Polish thesis drafts with AI","Check grammar with Grammarly","Format references properly","Per-page pricing"],["Claude","Grammarly","Zotero"],"$5–$15/page","Grad student networks, Fiverr"),
        ("Literature Review Service",["Run systematic searches","Synthesize findings","Deliver structured doc","Charge per topic"],["Perplexity","Elicit","Claude"],"$100–$500/review","ResearchGate, LinkedIn, universities")]),
    _P("Language Learning Pack","language-learning-pack","Learn any language from zero — AI conversation, pronunciation drills, and spaced repetition.","Student","Students & Academics","Beginner","Start speaking day 1",
       ["chatgpt","perplexity","notion-ai"],
       [("📖","Learn","chatgpt"),("🗣","Practice","chatgpt"),("🎙","Speak","chatgpt"),("✅","Correct","chatgpt"),("📊","Track","notion-ai")],
       _IMG(8613089),
       [("AI Language Coach",["Design custom conversation scenarios","Host AI-assisted speaking sessions","Track progress with Notion","Sell monthly subscriptions"],["ChatGPT","Notion","Zoom"],"$15–$40/session","Preply, iTalki, Instagram"),
        ("Language Study Kits",["Create vocabulary packs by topic","Generate practice dialogues","Design grammar cheat sheets","Sell as PDF bundles"],["ChatGPT","Canva","Notion"],"$9–$29/kit","Etsy, Gumroad, Teachers Pay Teachers")]),
    _P("PhD & Academic Writing Pack","phd-academic-writing-pack","Lit review → outline → draft → citations → submit. Research output at 3x speed.","Researcher","Students & Academics","Advanced","1 week to integrate; saves months",
       ["perplexity","claude","chatgpt"],
       [("📚","Lit Review","perplexity"),("📝","Outline","claude"),("✍️","Draft","claude"),("📎","Citations","chatgpt"),("✅","Submit","claude")],
       _IMG(5428833),
       [("Grant Proposal Writing",["Research funding calls","Draft proposals with Claude","Polish with academic tone","Deliver submission-ready"],["Perplexity","Claude","Grammarly"],"$500–$3,000/proposal","University networks, LinkedIn"),
        ("Academic Copy Editor",["Review manuscripts","Correct grammar and flow","Format citations","Return publication-ready"],["Claude","Grammarly","Zotero"],"$20–$50/hr","Fiverr, academic newsletters")]),
    _P("Study Notes & Flashcard Pack","study-notes-flashcard-pack","Lecture → transcribed → summarized → flashcards → review. Never miss a concept.","Student","Students & Academics","Beginner","30 min setup; use all semester",
       ["otter","chatgpt","notion-ai"],
       [("🎙","Lecture","otter"),("📝","Transcribe","otter"),("📋","Summarize","chatgpt"),("🃏","Flashcards","chatgpt"),("🔄","Review","notion-ai")],
       _IMG(4145190),
       [("Flashcard Marketplace",["Create Anki decks for popular subjects","Design with clean typography","Sell per-subject bundles","Offer free sample as lead magnet"],["ChatGPT","Anki","Canva"],"$5–$25/deck","Gumroad, Reddit r/Anki, campus groups"),
        ("Study Group Facilitator",["Organize virtual study groups","Provide AI discussion guides","Share curated flashcard sets","Charge monthly membership"],["ChatGPT","Notion","Zoom"],"$10–$25/mo","Campus groups, Discord, WhatsApp")]),

    # ─── 2. DEVELOPERS & ENGINEERS (6) ───
    _P("Solo Dev Pack","solo-dev-pack","Ship a full-stack app alone — AI design, scaffolding, coding, testing, and deployment.","Developer","Developers & Engineers","Intermediate","Idea to deployed in 2–7 days",
       ["cursor","v0","chatgpt","claude"],
       [("🎨","Design","claude"),("🖥","UI","v0"),("🏗","Scaffold","cursor"),("⌨️","Code","cursor"),("🧪","Test","cursor"),("🚀","Ship","chatgpt")],
       _IMG(89724), DEV_MONEY),
    _P("Frontend Developer Pack","frontend-dev-pack","Wireframe → component → style → preview → deploy. Build stunning UIs at speed.","Developer","Developers & Engineers","Intermediate","Ship UIs 3x faster",
       ["chatgpt","v0","cursor"],
       [("📐","Wireframe","chatgpt"),("🧩","Component","v0"),("🎨","Style","v0"),("👁","Preview","cursor"),("🚀","Deploy","chatgpt")],
       _IMG(577585), DEV_MONEY[:2]),
    _P("Backend & API Developer Pack","backend-api-dev-pack","Schema → endpoint → auth → test → deploy. Robust APIs with AI architecture.","Developer","Developers & Engineers","Intermediate","Production API in hours",
       ["claude","cursor","chatgpt"],
       [("🗄","Schema","claude"),("🔗","Endpoint","cursor"),("🔐","Auth","cursor"),("🧪","Test","cursor"),("🚀","Deploy","chatgpt")],
       _IMG(1181671),
       [("API-as-a-Service",["Design REST APIs for SMBs","Implement with Supabase/Cursor","Add auth, rate limiting, docs","Charge setup + maintenance"],["Cursor","Supabase","Postman AI"],"$500–$1,500 setup + $100–$400/mo","LinkedIn, Upwork, local companies"),
        ("Backend Audit & Optimization",["Review existing APIs","Suggest improvements","Implement optimizations","Charge per audit"],["Claude","Cursor","Railway"],"$200–$800/audit","Toptal, referrals, GitHub")]),
    _P("Mobile App Developer Pack","mobile-app-dev-pack","Idea → UI → build → test → publish. Cross-platform apps without a team.","Developer","Developers & Engineers","Intermediate","First build in 3–7 days",
       ["chatgpt","cursor"],
       [("💡","Idea","chatgpt"),("🎨","UI","chatgpt"),("🏗","Build","cursor"),("🧪","Test","cursor"),("📱","Publish","chatgpt")],
       _IMG(5082579),
       [("Mobile App MVP Service",["Design UI with AI tools","Build with React Native/Flutter","Test and deploy to stores","Fixed-price MVP delivery"],["ChatGPT","Cursor","Firebase"],"$1,000–$5,000/app","Upwork, Fiverr, Contra"),
        ("App Template Marketplace",["Build reusable app starters","Document setup process","Sell with video walkthrough","Offer customization as upsell"],["Cursor","Claude"],"$49–$299/template","Gumroad, CodeCanyon")]),
    _P("AI/ML Engineer Pack","ai-ml-engineer-pack","Data → model → train → evaluate → deploy. The end-to-end ML engineering pipeline.","Developer","Developers & Engineers","Advanced","First model deployed in 2–3 days",
       ["chatgpt","cursor","claude"],
       [("📊","Data","chatgpt"),("🧠","Model","claude"),("🏋","Train","cursor"),("📈","Evaluate","chatgpt"),("🚀","Deploy","cursor")],
       _IMG(373543),
       [("Custom ML Model Service",["Build tailored models for businesses","Use Hugging Face + fine-tuning","Deploy inference endpoints","Monthly maintenance"],["Hugging Face","Weights & Biases","Modal"],"$500–$3,000/model + $100–$500/mo","LinkedIn, Kaggle, company consulting"),
        ("AI Engineering Consultant",["Audit ML pipelines for efficiency","Optimize training/inference","Implement MLOps practices"],["Claude","Cursor","Modal"],"$100–$250/hr","Toptal, direct referrals")]),
    _P("DevOps & Deployment Pack","devops-deploy-pack","Build → containerize → CI/CD → monitor → scale. Production-grade DevOps for solo devs.","Developer","Developers & Engineers","Intermediate","Automated pipeline in 1 day",
       ["cursor","chatgpt"],
       [("🏗","Build","cursor"),("📦","Containerize","chatgpt"),("⚙","CI/CD","chatgpt"),("📊","Monitor","chatgpt"),("📈","Scale","cursor")],
       _IMG(1181295),
       [("DevOps Setup Service",["Configure CI/CD for startups","Set up monitoring and alerts","Infrastructure as Code","One-time setup + optional retainer"],["GitHub Actions","Docker","Datadog AI"],"$500–$2,000/setup","Upwork, Toptal, local startups"),
        ("Cloud Cost Optimization",["Audit AWS/GCP/Vercel spend","Recommend right-sizing","Implement auto-scaling","Charge % of savings or flat fee"],["Cursor","Claude"],"15–25% of savings","LinkedIn, company referrals")]),

    # ─── 3. CONTENT CREATORS (7) ───
    _P("Video Editor Pack","video-editor-pack","The full YouTube/short-form production stack — script to publish, all AI-powered.","Creator","Content Creators","Beginner","First video in 4 hours",
       ["chatgpt","canva-magic-studio","midjourney"],
       [("💡","Idea","chatgpt"),("📝","Script","chatgpt"),("🎙","Voice","chatgpt"),("🎬","Edit","canva-magic-studio"),("🖼","Thumbnail","midjourney"),("🚀","Publish","canva-magic-studio")],
       _IMG(26611985), CREATOR_MONEY),
    _P("YouTuber Pack","youtuber-pack","Research → script → record → edit → optimize → publish. Build a channel that grows.","Creator","Content Creators","Beginner","First video live in 1 day",
       ["perplexity","chatgpt","canva-magic-studio","midjourney"],
       [("🔍","Research","perplexity"),("📝","Script","chatgpt"),("🎙","Record","chatgpt"),("🎬","Edit","canva-magic-studio"),("📈","Optimize","perplexity"),("🚀","Publish","canva-magic-studio")],
       _IMG(2673502),
       [("YouTube Growth Agency",["Optimize titles/thumbnails with AI","SEO description writing","Content calendar management","Monthly retainer per channel"],["ChatGPT","vidIQ","TubeBuddy"],"$500–$3,000/mo","Social media outreach, referrals"),
        ("Thumbnail Design Service",["Design CTR-optimized thumbnails","A/B test concepts with Midjourney","Batch deliver for scheduled videos"],["Midjourney","Canva"],"$15–$50/thumbnail","Fiverr, creator networks")]),
    _P("Podcaster Pack","podcaster-pack","Outline → record → clean audio → clip → distribute. Launch a pro podcast solo.","Creator","Content Creators","Beginner","Episode live in 3 hours",
       ["chatgpt","canva-magic-studio"],
       [("📋","Outline","chatgpt"),("🎙","Record","chatgpt"),("🔇","Clean Audio","chatgpt"),("✂","Clip","canva-magic-studio"),("📤","Distribute","canva-magic-studio")],
       _IMG(5967386),
       [("Podcast Editing Agency",["Offer end-to-end production","Remove filler words, add intro/outro","Create short clips for social","Charge per episode or monthly"],["Descript","Adobe Podcast","Opus Clip"],"$300–$800/episode","Spotify for Podcasters, Fiverr"),
        ("Podcast Launch Kit",["Design cover art with Canva","Write episode templates","Create social media kit","One-time launch package"],["Canva","ChatGPT"],"$200–$500/launch","Fiverr, creator networks")]),
    _P("Faceless Content Pack","faceless-content-pack","Script → voice → visuals → animate → publish. Build a channel without showing your face.","Creator","Content Creators","Beginner","First video in 5 hours",
       ["chatgpt","midjourney","canva-magic-studio"],
       [("📝","Script","chatgpt"),("🎙","Voice","chatgpt"),("🖼","Visuals","midjourney"),("🎬","Animate","canva-magic-studio"),("🚀","Publish","canva-magic-studio")],
       _IMG(270348),
       [("Faceless Channel Portfolio",["Build 3–5 niche faceless channels","Automate with CapCut + AI","Monetize AdSense + sponsorships","Sell channels on marketplaces"],["ChatGPT","ElevenLabs","Runway","CapCut"],"AdSense $2–$8 RPM","Flippa, Microacquire, YouTube"),
        ("Faceless Content Service",["Create videos for businesses","White-label production","Monthly retainer per brand"],["ChatGPT","Midjourney","CapCut"],"$500–$2,000/mo","LinkedIn, direct outreach")]),
    _P("Instagram Reels Pack","insta-reels-pack","Hook → script → shoot → edit → caption → post. Viral-ready Reels every time.","Creator","Content Creators","Beginner","First Reel in 2 hours",
       ["chatgpt","canva-magic-studio","midjourney"],
       [("🪝","Hook","chatgpt"),("📝","Script","chatgpt"),("📱","Shoot","canva-magic-studio"),("🎬","Edit","canva-magic-studio"),("📋","Caption","chatgpt"),("📤","Post","chatgpt")],
       _IMG(5082572),
       [("Reels Management for Brands",["Create Reels calendar with AI","Produce and schedule Reels","Write captions and hashtags","Monthly retainer per brand"],["ChatGPT","CapCut","Later","Buffer AI"],"₹15,000–₹50,000/mo","Instagram outreach, D2C brands"),
        ("AI Faceless Reel Channel",["Generate concepts with ChatGPT","AI visuals with Midjourney","Edit with CapCut","Monetize with brand deals"],["ChatGPT","Midjourney","CapCut"],"₹5,000–₹30,000/post","Instagram creator marketplace")]),
    _P("Blogger & Writer Pack","blogger-writer-pack","Research → outline → draft → SEO → publish. 3,000-word articles that rank.","Creator","Content Creators","Intermediate","First post in 3 hours",
       ["perplexity","claude","chatgpt"],
       [("🔍","Research","perplexity"),("📝","Outline","claude"),("✍️","Draft","claude"),("🔎","SEO","chatgpt"),("🚀","Publish","chatgpt")],
       _IMG(1591055),
       [("SEO Blogging Agency",["Write 10–20 posts/month for clients","Optimize with Surfer/Ahrefs AI","Report traffic growth monthly","Per-word or per-post pricing"],["Surfer SEO","Claude","Grammarly"],"$50–$300/post","LinkedIn, cold email, agency directories"),
        ("Ghostwriting for Execs",["Interview subject matter experts","Draft thought-leadership articles","Pitch to publications","Monthly retainer"],["ChatGPT","Claude","Grammarly"],"$500–$3,000/article","LinkedIn, executive networks")]),
    _P("Newsletter Creator Pack","newsletter-creator-pack","Curate → write → design → send → grow. Build a newsletter business from scratch.","Creator","Content Creators","Beginner","First issue in 2 hours",
       ["perplexity","chatgpt","canva-magic-studio"],
       [("📰","Curate","perplexity"),("✍️","Write","chatgpt"),("🎨","Design","canva-magic-studio"),("📤","Send","chatgpt"),("📈","Grow","perplexity")],
       _IMG(6684484),
       [("Paid Newsletter",["Pick a profitable niche","Build with Beehiiv/ConvertKit","Grow via Twitter/LinkedIn","Monetize via subscriptions"],["ChatGPT","Beehiiv","Canva","ConvertKit"],"$5–$20/mo per subscriber","Beehiiv, ConvertKit, Sponsorships"),
        ("Newsletter Setup Service",["Design newsletter template","Set up email infrastructure","Write welcome sequence","One-time setup fee"],["ChatGPT","Canva","Beehiiv"],"$300–$1,000 setup","Fiverr, creator networks")]),

    # ─── 4. DESIGNERS (5) ───
    _P("UI/UX Designer Pack","uiux-designer-pack","Research → wireframe → UI → prototype → handoff. The full design-to-dev pipeline.","Designer","Designers","Intermediate","Design sprint in 1–2 days",
       ["chatgpt","v0","cursor"],
       [("🔍","Research","chatgpt"),("📐","Wireframe","chatgpt"),("🎨","UI","v0"),("🔄","Prototype","cursor"),("📤","Handoff","v0")],
       _IMG(196644), DESIGN_MONEY),
    _P("Graphic Designer & Branding Pack","graphic-branding-pack","Brief → moodboard → design → variants → export. Brand identity at AI speed.","Designer","Designers","Beginner","Complete brand kit in 4 hours",
       ["midjourney","canva-magic-studio","v0"],
       [("📋","Brief","canva-magic-studio"),("🎨","Moodboard","midjourney"),("🖼","Design","canva-magic-studio"),("🔄","Variants","midjourney"),("📤","Export","canva-magic-studio")],
       _IMG(196645),
       [("Brand Identity Packages",["Create complete brand kits","Logo + color palette + typography","Social media templates","48-hour delivery"],["Midjourney","Canva","Adobe Firefly"],"$100–$500/brand kit","Fiverr, Instagram, creative marketplaces"),
        ("Social Media Template Shop",["Design post/story/reel templates","Bundle by industry/niche","Sell as Canva template links","Passive income stream"],["Canva","ChatGPT"],"$15–$49/template pack","Etsy, Creative Market, Gumroad")]),
    _P("Logo & Brand Identity Pack","logo-brand-identity-pack","Concept → generate → refine → guidelines → deliver. Professional logos in hours.","Designer","Designers","Beginner","Logo ready in 2–4 hours",
       ["midjourney","canva-magic-studio"],
       [("💡","Concept","midjourney"),("🤖","Generate","midjourney"),("✨","Refine","canva-magic-studio"),("📋","Guidelines","canva-magic-studio"),("📤","Deliver","canva-magic-studio")],
       _IMG(1181244),
       [("Logo Design Service",["Generate logo concepts with AI","Refine top 3 options","Deliver in multiple formats","Fast turnaround premium"],["Midjourney","Looka","Brandmark"],"$50–$300/logo","Fiverr, 99designs, local businesses"),
        ("Brand-in-a-Box",["Logo + color system + fonts","Business card + letterhead","Social profile graphics","One-price brand bundle"],["Canva","Looka","Notion"],"$199–$499/package","Gumroad, Etsy, client referrals")]),
    _P("Interior Design Pack","interior-design-pack","Brief → moodboard → render → furnish → present. AI-powered interior concepts.","Designer","Designers","Intermediate","Room concept in 3 hours",
       ["chatgpt","midjourney"],
       [("📋","Brief","chatgpt"),("🎨","Moodboard","midjourney"),("🖼","Render","midjourney"),("🪑","Furnish","chatgpt"),("📊","Present","chatgpt")],
       _IMG(1571450),
       [("Interior Concept Service",["Generate AI room designs","Source furniture links","Deliver moodboard + renders","Per-room pricing"],["ChatGPT","Interior AI","RoomGPT","Planner 5D"],"$50–$200/room","Fiverr, Instagram, local real estate agents"),
        ("Virtual Staging Service",["Stage empty rooms with AI","Realistic furniture renders","For real estate listings","Bulk pricing for agents"],["RoomGPT","Midjourney","Canva"],"$10–$30/photo","Real estate agency networks")]),
    _P("Fashion & Product Design Pack","fashion-product-design-pack","Trend scan → sketch → render → prototype → pitch. From concept to runway.","Designer","Designers","Intermediate","Collection concept in 2 days",
       ["perplexity","midjourney","chatgpt"],
       [("🔎","Trend Scan","perplexity"),("✏","Sketch","midjourney"),("🖼","Render","midjourney"),("🧵","Prototype","chatgpt"),("📊","Pitch","chatgpt")],
       _IMG(994234),
       [("AI Fashion Design Service",["Generate trend reports","Create collection moodboards","Render designs on models","Seasonal retainers for brands"],["Perplexity","Midjourney","CLO3D AI"],"$300–$1,500/collection","Fashion brands, Instagram, LinkedIn"),
        ("Print-on-Demand Shop",["Design patterns with AI","Upload to Printful/Redbubble","Market on Instagram/TikTok","Passive royalty income"],["Midjourney","Canva","Printful"],"3–20% royalty","Redbubble, Printful, Society6")]),

    # ─── 5. MARKETERS (6) ───
    _P("Digital Marketer Pack","digital-marketer-pack","Research → strategy → content → launch → analyze. The full-stack marketing AI suite.","Marketer","Marketers","Intermediate","Campaign live in hours",
       ["perplexity","chatgpt","canva-magic-studio"],
       [("🔍","Research","perplexity"),("📊","Strategy","chatgpt"),("📝","Content","chatgpt"),("🚀","Launch","canva-magic-studio"),("📈","Analyze","chatgpt")],
       _IMG(6476192), MARKETER_MONEY),
    _P("SEO Specialist Pack","seo-specialist-pack","Keyword → outline → write → optimize → track. Content that wins Page 1.","Marketer","Marketers","Intermediate","First ranked article in 2–4 weeks",
       ["perplexity","claude","chatgpt"],
       [("🔑","Keyword","perplexity"),("📝","Outline","claude"),("✍️","Write","claude"),("🔧","Optimize","perplexity"),("📊","Track","chatgpt")],
       _IMG(270637),
       [("Local SEO Agency",["Audit local business listings","Optimize GMB profiles with AI","Build citation campaigns","Monthly retainer per location"],["Ahrefs AI","Surfer SEO","Claude"],"$300–$1,500/mo","Cold email, local business networks"),
        ("Content Gap Analysis",["Analyze competitor content","Identify ranking opportunities","Provide content roadmap","One-time audit + ongoing"],["Ahrefs AI","Perplexity","Search Console"],"$200–$800/audit","LinkedIn, SEO agency partnerships")]),
    _P("Social Media Manager Pack","social-media-manager-pack","Plan → create → caption → schedule → report. Run brand social at scale.","Marketer","Marketers","Beginner","Full-month calendar in 1 day",
       ["chatgpt","canva-magic-studio"],
       [("📅","Plan","chatgpt"),("🎨","Create","canva-magic-studio"),("📝","Caption","chatgpt"),("⏰","Schedule","chatgpt"),("📊","Report","chatgpt")],
       _IMG(267371),
       [("SMM for SMBs",["Manage 3–5 brand accounts","Create and schedule content","Monthly analytics reports","Per-brand retainer"],["ChatGPT","Canva","Buffer AI","Hootsuite OwlyWriter"],"₹10,000–₹50,000/mo","Instagram, LinkedIn, local business referrals"),
        ("Content Calendar as a Service",["Design 30-day content plan","AI-generated post ideas","Hashtag strategy","Sell as done-for-you package"],["ChatGPT","Canva","Notion"],"₹2,000–₹5,000/calendar","Gumroad, social media communities")]),
    _P("Email Marketing Pack","email-marketing-pack","Segment → write → design → send → optimize. Campaigns that convert.","Marketer","Marketers","Intermediate","First campaign in 3 hours",
       ["chatgpt","canva-magic-studio"],
       [("👥","Segment","chatgpt"),("✍️","Write","chatgpt"),("🎨","Design","canva-magic-studio"),("📤","Send","chatgpt"),("📈","Optimize","chatgpt")],
       _IMG(2592370),
       [("Ecommerce Email Agency",["Design abandoned cart flows","Create welcome/promo sequences","A/B test with AI copy","Revenue-share or retainer"],["ChatGPT","Klaviyo AI","Mailchimp","ActiveCampaign"],"$500–$2,000/mo + rev share","Shopify stores, ecommerce networks"),
        ("Email Template Shop",["Design conversion-focused templates","Industry-specific bundles","Mobile-optimized layout","Sell to small businesses"],["ChatGPT","Canva","Mailchimp"],"$29–$99/template pack","Etsy, Gumroad")]),
    _P("Performance Ads Pack","perf-ads-pack","Research → creative → copy → launch → optimize. Campaigns that hit ROAS targets.","Marketer","Marketers","Advanced","Campaign live in 2 hours",
       ["chatgpt","midjourney","canva-magic-studio"],
       [("🔍","Research","chatgpt"),("🎨","Creative","midjourney"),("📝","Copy","chatgpt"),("🚀","Launch","chatgpt"),("📈","Optimize","chatgpt")],
       _IMG(905163),
       [("Paid Ads Agency",["Manage Meta/Google/TikTok ads","AI creative generation and testing","Weekly optimization reports","Monthly retainer or % of ad spend"],["AdCreative.ai","Midjourney","ChatGPT","Smartly.io"],"$500–$3,000/mo or 10–20% of spend","Upwork, ecommerce brands, referrals"),
        ("Ad Creative Studio",["Design ad creative variations","A/B test concepts with AI","Batch deliver for campaigns","Per-creative or package pricing"],["Midjourney","AdCreative.ai","Canva"],"$50–$200/creative","Fiverr, DTC brand networks")]),
    _P("Affiliate Marketer Pack","affiliate-marketer-pack","Niche → content → funnel → traffic → track. Build passive affiliate income.","Marketer","Marketers","Beginner","First content live in 1 day",
       ["perplexity","chatgpt","canva-magic-studio"],
       [("🎯","Niche","perplexity"),("📝","Content","chatgpt"),("🌀","Funnel","chatgpt"),("🚦","Traffic","perplexity"),("📊","Track","chatgpt")],
       _IMG(4386449),
       [("Niche Affiliate Site",["Pick a low-competition niche","Write 50+ comparison posts with AI","Build email list for retargeting","Monetize via Amazon/ShareASale"],["Perplexity","ChatGPT","Beehiiv","Refersion"],"$500–$5,000/mo","Amazon Associates, ShareASale, CJ Affiliate"),
        ("Affiliate Content Service",["Write product roundups for brands","SEO-optimized comparison posts","Link building outreach","Per-post or monthly retainer"],["ChatGPT","Surfer SEO","Ahrefs AI"],"$100–$500/post","LinkedIn, brand partnerships")]),

    # ─── 6. FOUNDERS & ENTREPRENEURS (5) ───
    _P("Startup Founder Pack","startup-founder-pack","Idea → validate → plan → build → pitch. Zero to startup in one stack.","Founder","Founders & Entrepreneurs","Intermediate","MVP pitch-ready in 1–2 weeks",
       ["chatgpt","perplexity","gamma","notion-ai"],
       [("💡","Idea","chatgpt"),("✅","Validate","perplexity"),("📋","Plan","notion-ai"),("🏗","Build","chatgpt"),("📊","Pitch","gamma")],
       _IMG(3184291), FOUNDER_MONEY),
    _P("Pitch Deck & Fundraising Pack","pitch-deck-fundraising-pack","Story → data → design → deck → present. Decks that raise capital.","Founder","Founders & Entrepreneurs","Intermediate","Investor deck in 4 hours",
       ["chatgpt","perplexity","gamma"],
       [("📖","Story","chatgpt"),("📊","Data","perplexity"),("🎨","Design","gamma"),("📑","Deck","gamma"),("🎤","Present","chatgpt")],
       _IMG(3183197),
       [("Pitch Deck Designer",["Design investor-ready decks","Financial models with AI","Story coaching consult","Per-deck pricing"],["Gamma","Beautiful.ai","ChatGPT"],"$500–$2,000/deck","YC forums, LinkedIn, startup communities"),
        ("Fundraising Consultant",["Prepare data room with AI","Build financial projections","Practice pitch with GPT","Success fee or retainer"],["ChatGPT","Perplexity","Notion"],"$1,000–$5,000 or 2–5% of raise","AngelList, referrals, LinkedIn")]),
    _P("No-Code MVP Builder Pack","nocode-mvp-builder-pack","Idea → design → build → automate → launch. MVPs without writing code.","Founder","Founders & Entrepreneurs","Beginner","MVP live in 2–5 days",
       ["chatgpt","v0","cursor"],
       [("💡","Idea","chatgpt"),("🎨","Design","v0"),("🏗","Build","v0"),("⚙","Automate","chatgpt"),("🚀","Launch","cursor")],
       _IMG(8311882),
       [("MVP-as-a-Service Agency",["Validate ideas with AI research","Build MVPs with no-code tools","Automate backend with Zapier","Fixed-price packages"],["bolt.new","Framer AI","Zapier","Vercel"],"$1,000–$5,000/MVP","Product Hunt, Indie Hackers, X"),
        ("No-Code Course Creator",["Record MVP building process","Package as tutorial course","Sell with lifetime access","Build community around it"],["ChatGPT","Gamma","Teachable"],"$49–$199/course","Teachable, Gumroad, YouTube")]),
    _P("Ecommerce Founder Pack","ecommerce-founder-pack","Source → store → product photos → ads → fulfill. DTC brand in a box.","Founder","Founders & Entrepreneurs","Beginner","Store live in 3–5 days",
       ["chatgpt","midjourney","canva-magic-studio"],
       [("📦","Source","chatgpt"),("🏪","Store","chatgpt"),("📸","Product Photos","midjourney"),("📣","Ads","canva-magic-studio"),("🚚","Fulfill","chatgpt")],
       _IMG(5632371),
       [("DTC Brand Building",["Launch dropshipping/ecom brand","AI-generated product images","Run ads with AdCreative.ai","Build email flows with Klaviyo"],["ChatGPT","Shopify Magic","Adobe Firefly","Klaviyo"],"Monthly recurring from store","Shopify, Etsy, Amazon"),
        ("Ecom Product Photo Service",["Generate product photos with AI","Background removal/replacement","Model shots without models","Per-photo or bulk pricing"],["Adobe Firefly","Midjourney","Canva"],"$5–$30/photo","Fiverr, Shopify store networks")]),
    _P("SaaS Builder Pack","saas-builder-pack","Idea → PRD → UI → build → ship → support. SaaS from scratch to revenue.","Founder","Founders & Entrepreneurs","Advanced","MVP live in 1–3 weeks",
       ["claude","v0","cursor","chatgpt"],
       [("💡","Idea","claude"),("📋","PRD","claude"),("🎨","UI","v0"),("🏗","Build","cursor"),("🚀","Ship","chatgpt"),("🎧","Support","chatgpt")],
       _IMG(1181467),
       [("Micro-SaaS Portfolio",["Build 3–5 small SaaS products","Automate customer support with AI","Cross-sell across user base","Target $1k–$5k MRR each"],["bolt.new","Supabase","Vercel","Intercom Fin"],"$9–$99/mo subscription","Product Hunt, MicroConf, Indie Hackers"),
        ("SaaS MVP Agency",["Build founder MVPs on contract","Full-stack with AI acceleration","Hand off with documentation","Per-project pricing"],["bolt.new","Supabase","Cursor","Vercel"],"$3,000–$10,000/project","YC startups, LinkedIn, X")]),

    # ─── 7. FREELANCERS & SOLOPRENEURS (5) ───
    _P("Freelance Writer Pack","freelance-writer-pack","Pitch → research → draft → edit → deliver. Build a 6-figure writing business.","Freelancer","Freelancers & Solopreneurs","Beginner","First client in 1 week",
       ["chatgpt","perplexity","claude","notion-ai"],
       [("📩","Pitch","chatgpt"),("🔍","Research","perplexity"),("✍️","Draft","claude"),("✨","Edit","chatgpt"),("📤","Deliver","notion-ai")],
       _IMG(1591062), FREELANCE_MONEY),
    _P("Freelance Designer Pack","freelance-designer-pack","Brief → concept → design → revise → deliver. Profitable design freelancing.","Freelancer","Freelancers & Solopreneurs","Beginner","First client project in 3 days",
       ["midjourney","canva-magic-studio"],
       [("📋","Brief","chatgpt"),("💡","Concept","midjourney"),("🎨","Design","canva-magic-studio"),("🔄","Revise","canva-magic-studio"),("📤","Deliver","chatgpt")],
       _IMG(1181264),
       [("Design Subscription Service",["Offer unlimited design requests","Monthly flat rate","Quick turnaround with AI","3–5 concurrent clients"],["Canva","Midjourney","Figma AI","Adobe Firefly"],"$500–$2,000/mo per client","Instagram, design directories, LinkedIn"),
        ("Template Empire",["Create design templates by niche","Social media + presentations + docs","Sell as digital downloads","Build passive income stream"],["Canva","Adobe Firefly","Notion"],"$9–$49/template","Etsy, Gumroad, Creative Market")]),
    _P("Virtual Assistant Pack","virtual-assistant-pack","Inbox → schedule → docs → research → report. AI-powered VA services at scale.","Freelancer","Freelancers & Solopreneurs","Beginner","Serve first client in 1 day",
       ["chatgpt","perplexity","notion-ai"],
       [("📧","Inbox","chatgpt"),("📅","Schedule","chatgpt"),("📄","Docs","notion-ai"),("🔍","Research","perplexity"),("📊","Report","chatgpt")],
       _IMG(1181625),
       [("AI-Augmented VA Agency",["Manage multiple exec assistantships","Automate repetitive tasks with AI","Deliver daily summary reports","Per-exec retainer"],["ChatGPT","Notion AI","Google Workspace AI","Superhuman AI"],"$1,000–$3,000/mo per client","Upwork, executive networks, referrals"),
        ("Executive Briefing Service",["Daily news/inbox summaries","Meeting prep packages","Research briefs on demand","Premium retainer model"],["ChatGPT","Perplexity","Notion"],"$300–$800/mo","LinkedIn, executive assistants networks")]),
    _P("Proposal & Client Management Pack","proposal-client-mgmt-pack","Brief → proposal → contract → invoice → follow-up. Win and manage clients professionally.","Freelancer","Freelancers & Solopreneurs","Beginner","Set up in 2 hours",
       ["chatgpt","notion-ai"],
       [("📋","Brief","chatgpt"),("📄","Proposal","notion-ai"),("📝","Contract","chatgpt"),("💰","Invoice","chatgpt"),("📩","Follow-up","chatgpt")],
       _IMG(3183190),
       [("Client Onboarding System",["Design proposal templates in Notion","Auto-contract with DocuSign","Invoice automation with QuickBooks","Sell system to other freelancers"],["Notion","ChatGPT","QuickBooks AI","DocuSign"],"₹999–₹2,999/system","Gumroad, freelancer communities, Instagram"),
        ("Freelance Operations Coach",["1:1 sessions on client systems","Template setup and customization","Pricing strategy consulting","Monthly coaching retainer"],["ChatGPT","Notion","Calendly"],"$100–$300/session","Superpeer, social media, referrals")]),
    _P("Consultant Pack","consultant-pack","Diagnose → research → report → deck → present. High-value consulting delivered with AI.","Freelancer","Freelancers & Solopreneurs","Advanced","Engagement deliverable in 1–3 days",
       ["perplexity","claude","gamma","notion-ai"],
       [("🔍","Diagnose","perplexity"),("📚","Research","claude"),("📄","Report","claude"),("📊","Deck","gamma"),("🎤","Present","gamma")],
       _IMG(3184357),
       [("Fractional Strategy Consultant",["Diagnose business problems with AI","Deliver strategy decks","Implementation roadmap","Monthly retainer"],["Perplexity","Claude","NotebookLM","Gamma"],"$2,000–$8,000/mo","LinkedIn, industry referrals"),
        ("Market Research-as-a-Service",["Competitive analysis with Perplexity","Industry trend reports","Customer insight synthesis","Deliverable-driven pricing"],["Perplexity","Claude","Gamma"],"$500–$3,000/report","Upwork, company consulting gigs")]),

    # ─── 8. BUSINESS OPERATIONS (5) ───
    _P("HR & Recruiting Pack","hr-recruiting-pack","Job post → source → screen → interview → onboard. AI-powered hiring pipeline.","Operations","Business Operations","Intermediate","First hire pipeline in 1 day",
       ["chatgpt","notion-ai"],
       [("📋","Job Post","chatgpt"),("🔍","Source","chatgpt"),("📊","Screen","chatgpt"),("🎤","Interview","chatgpt"),("✅","Onboard","notion-ai")],
       _IMG(3184411), BUSOPS_MONEY),
    _P("Sales Pack","sales-pack","Prospect → outreach → pitch → follow-up → close. Modern AI sales stack.","Operations","Business Operations","Intermediate","Pipeline built in 1 day",
       ["chatgpt","notion-ai"],
       [("🔍","Prospect","chatgpt"),("📧","Outreach","chatgpt"),("🎤","Pitch","chatgpt"),("📩","Follow-up","chatgpt"),("🤝","Close","notion-ai")],
       _IMG(3182822),
       [("AI SDR as a Service",["Build prospecting lists with Clay","Write sequences with ChatGPT","Track engagement in CRM","Per-campaign or monthly"],["Clay","ChatGPT","HubSpot AI","Gong AI"],"$1,000–$5,000/mo","B2B company outreach, referrals"),
        ("Sales Playbook Creator",["Document winning sales process","AI-generated scripts and templates","Onboarding playbook","One-time deliverable"],["ChatGPT","Notion","Gong AI"],"$500–$2,000/playbook","B2B consulting, Gumroad")]),
    _P("Customer Support Pack","cust-support-pack","Ticket → triage → respond → resolve → report. AI-first support operations.","Operations","Business Operations","Beginner","Support system live in 1 day",
       ["chatgpt","notion-ai"],
       [("🎫","Ticket","chatgpt"),("⚖","Triage","chatgpt"),("💬","Respond","chatgpt"),("✅","Resolve","chatgpt"),("📊","Report","notion-ai")],
       _IMG(3181126),
       [("Support Automation Agency",["Deploy AI chatbot for businesses","Train on knowledge base","Set up triage and escalation","Monthly management fee"],["Zendesk AI","Intercom Fin","ChatGPT","Fireflies"],"$300–$1,000 setup + $100–$400/mo","Cold email to ecommerce/SaaS brands"),
        ("FAQ/Knowledge Base Builder",["Extract FAQs from tickets with AI","Write help center articles","Organize and tag content","Per-project pricing"],["ChatGPT","Notion","Intercom Fin"],"$200–$800/project","Fiverr, customer service networks")]),
    _P("Finance & Accounting Pack","finance-accounting-pack","Collect → categorize → reconcile → report → forecast. AI bookkeeping.","Operations","Business Operations","Intermediate","Monthly close in hours",
       ["chatgpt","notion-ai"],
       [("📥","Collect","chatgpt"),("🏷","Categorize","chatgpt"),("✅","Reconcile","chatgpt"),("📊","Report","notion-ai"),("🔮","Forecast","chatgpt")],
       _IMG(7305393),
       [("Virtual CFO Service",["Monthly financial reporting with AI","Cash flow forecasting","Budget planning and analysis","Retainer-based service"],["ChatGPT","QuickBooks AI","Excel Copilot"],"$500–$2,000/mo","LinkedIn, small business networks"),
        ("Bookkeeping Automation",["Automate categorization with AI tools","Reconciliation workflows","Monthly P&L delivery","Per-client pricing"],["QuickBooks AI","Zoho Books AI","Notion"],"$200–$500/mo","Upwork, local business referrals")]),
    _P("Legal Assistant Pack","legal-assistant-pack","Draft → review → redline → sign → store. AI-accelerated legal workflows.","Operations","Business Operations","Advanced","Contract turnaround in hours",
       ["claude","chatgpt","notion-ai"],
       [("📝","Draft","claude"),("🔍","Review","claude"),("🔴","Redline","chatgpt"),("✍️","Sign","chatgpt"),("📁","Store","notion-ai")],
       _IMG(5668473),
       [("Contract Review Service",["Review contracts with AI analysis","Identify risky clauses","Generate redlined versions","Per-contract pricing"],["Claude","Ironclad AI","Grammarly"],"$100–$500/contract","LinkedIn, startup networks, Fiverr"),
        ("Legal Doc Template Shop",["Create contract templates by type","NDA, service agreement, employment","State-specific versions","Sell as digital downloads"],["Claude","Notion","DocuSign"],"$29–$199/template","Gumroad, legal marketplace, Etsy")]),

    # ─── 9. REAL ESTATE & LOCAL BUSINESS (2) ───
    _P("Real Estate Agent Pack","realestate-agent-pack","Lead → qualify → listing → nurture → close. AI-powered agent stack.","Agent","Real Estate & Local Business","Beginner","Pipeline active in 2 days",
       ["chatgpt","canva-magic-studio","notion-ai"],
       [("🎯","Lead","chatgpt"),("✅","Qualify","chatgpt"),("📋","Listing","canva-magic-studio"),("💌","Nurture","chatgpt"),("🤝","Close","notion-ai")],
       _IMG(8162843), REALEST_MONEY),
    _P("Real Estate Automation Pack","realestate-automation-pack","Capture lead → score → route → follow-up → report. Full automation for brokerages.","Agent","Real Estate & Local Business","Advanced","Automation live in 3 days",
       ["chatgpt"],
       [("📥","Capture Lead","chatgpt"),("📊","Score","chatgpt"),("🔀","Route","chatgpt"),("📩","Follow-up","chatgpt"),("📈","Report","chatgpt")],
       _IMG(7310824),
       [("Real Estate CRM Automation",["Connect Make.com to GoHighLevel/Wati","Score leads with AI","Build follow-up sequences","Charge per-agent monthly"],["Make.com","GoHighLevel","Wati","Airtable","OpenAI API"],"₹15,000–₹50,000 setup + ₹3,000–₹8,000/mo","Real estate agency outreach, WhatsApp groups"),
        ("Property Marketing Service",["Generate listing descriptions with AI","Design social media flyers","Run targeted ads on Meta","Monthly content subscription"],["ChatGPT","Canva","AdCreative.ai"],"₹2,000–₹8,000/mo","Local real estate networks, referrals")]),

    # ─── 10. TEACHING, HEALTHCARE & CAREER (3) ───
    _P("Teacher & Course Creator Pack","teacher-course-creator-pack","Plan → content → slides → quiz → publish. Online education at scale.","Educator","Teaching, Healthcare & Career","Beginner","Course ready in 1 week",
       ["chatgpt","gamma","canva-magic-studio"],
       [("📋","Plan","chatgpt"),("📝","Content","chatgpt"),("📊","Slides","gamma"),("📝","Quiz","chatgpt"),("🚀","Publish","gamma")],
       _IMG(5212342), TEACH_MONEY),
    _P("Healthcare Admin Pack","healthcare-admin-pack","Notes → transcribe → summarize → code → file. AI clinical documentation.","Healthcare","Teaching, Healthcare & Career","Intermediate","Documentation time cut by 60%",
       ["chatgpt","notion-ai"],
       [("📝","Notes","chatgpt"),("🎙","Transcribe","chatgpt"),("📋","Summarize","chatgpt"),("🏷","Code","chatgpt"),("📁","File","notion-ai")],
       _IMG(4054594),
       [("Medical Transcription Service",["Transcribe clinical notes with AI","Summarize patient encounters","Code with ICD/CPT","Per-encounter or monthly pricing"],["Nuance DAX","Otter.ai","ChatGPT","Notion"],"$5–$15/encounter","Direct physician outreach, healthcare networks"),
        ("Clinical Documentation Audit",["Review existing documentation","Identify gaps and compliance issues","Provide improvement template","One-time audit + ongoing review"],["ChatGPT","Notion","Grammarly"],"$300–$1,000/audit","Healthcare consulting networks")]),
    _P("Job Seeker & Resume Pack","job-seeker-resume-pack","Resume → portfolio → cover letter → interview prep → apply. Land your dream job.","Career","Teaching, Healthcare & Career","Beginner","Application ready in 2 hours",
       ["chatgpt","canva-magic-studio"],
       [("📄","Resume","chatgpt"),("💼","Portfolio","canva-magic-studio"),("📝","Cover Letter","chatgpt"),("🎤","Interview Prep","chatgpt"),("📤","Apply","chatgpt")],
       _IMG(3760069),
       [("Career Coaching Service",["Optimize LinkedIn/A resume with AI","Mock interviews with GPT","Salary negotiation scripting","Per-session or package"],["ChatGPT","Canva","Teal AI","Interview Warmup"],"₹500–₹3,000/package","Fiverr, Instagram, campus communities, LinkedIn"),
        ("Resume Writing Agency",["Rewrite resumes for specific industries","ATS optimization","Cover letter + LinkedIn","Per-resume pricing"],["ChatGPT","Canva","Teal AI","LinkedIn AI"],"₹499–₹2,999/resume","Fiverr, LinkedIn, job seeker forums")]),
]


# ── Transform RAW tuples into CareerPack dicts ──
def build():
    packs = []
    for row in RAW:
        nm, slug, desc, prof, domain, diff, est, tools, wf, img, money = row
        mm = [{"title": m[0], "steps": m[1], "tools": m[2], "price_range": m[3], "where_to_sell": m[4]} for m in money]
        packs.append({
            "name": nm, "slug": slug, "description": desc,
            "profession": prof, "domain": domain,
            "difficulty": diff, "estimated_time": est,
            "tool_slugs": tools,
            "workflow_steps": [{"emoji": e, "label": l, "tool": t} for e, l, t in wf],
            "image_url": img,
            "make_money_methods": mm,
        })
    return packs

CAREER_PACKS_50 = build()
