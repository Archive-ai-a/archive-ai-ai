import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ArrowRight, Sparkles, ArrowUpRight, TrendingUp, Zap, Star } from "lucide-react";
import { api } from "@/lib/api";
import ToolCard from "@/components/ToolCard";

export default function Home() {
  const [featured, setFeatured] = React.useState([]);
  const [trending, setTrending] = React.useState([]);
  const [newLaunch, setNewLaunch] = React.useState([]);
  const [packs, setPacks] = React.useState([]);
  const [q, setQ] = React.useState("");
  const nav = useNavigate();

  React.useEffect(() => {
    api.get("/tools?featured=true").then(r => setFeatured(r.data.slice(0, 6)));
    api.get("/tools?trending=true").then(r => setTrending(r.data.slice(0, 8)));
    api.get("/tools?new_launch=true").then(r => setNewLaunch(r.data.slice(0, 6)));
    api.get("/career-packs").then(r => setPacks(r.data));
  }, []);

  const onSearch = (e) => { e.preventDefault(); nav(`/tools?q=${encodeURIComponent(q)}`); };

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section className="relative border-b-2 border-black overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-60 pointer-events-none"/>
        <div className="relative max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="overline mb-6 flex items-center gap-3">
            <span className="w-8 h-px bg-black"/>
            Volume 01 / The Index of AI
          </div>
          <h1 className="font-display font-black tracking-tighter leading-[0.85] text-[3.5rem] sm:text-[5rem] md:text-[7rem]">
            EVERY AI TOOL.<br/>
            <span className="text-[var(--signal)]">ONE ARCHIVE.</span>
          </h1>
          <p className="mt-8 max-w-2xl text-lg md:text-xl text-[var(--text-muted)] leading-relaxed">
            Discover, learn, and monetize AI — a curated directory of tools with 3-step start guides, career packs, and money strategies.
          </p>

          <form onSubmit={onSearch} className="mt-10 flex flex-col sm:flex-row gap-3 max-w-2xl">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18}/>
              <input data-testid="hero-search-input" value={q} onChange={e=>setQ(e.target.value)}
                placeholder="Search tools — 'video editor', 'free image gen', 'sales agent'..."
                className="brutal pl-12 h-14 text-base"/>
            </div>
            <button data-testid="hero-search-submit" className="btn-primary h-14 px-6">Search <ArrowRight size={16}/></button>
          </form>

          <div className="mt-10 flex flex-wrap gap-2">
            {["chatgpt", "midjourney", "cursor", "perplexity", "suno", "manus", "devin"].map(s => (
              <Link key={s} to={`/tools/${s}`} data-testid={`hero-quick-${s}`} className="tag hover:bg-black hover:text-white transition-colors">{s}</Link>
            ))}
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee">
        <div className="marquee-track py-3 font-mono uppercase tracking-widest text-sm">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i} className="flex items-center">
              {["chatgpt", "claude", "midjourney", "cursor", "suno", "elevenlabs", "perplexity", "lovable", "ideogram", "runway", "v0", "gamma", "devin", "manus", "zapier"].map(t => (
                <span key={t} className="mx-8 inline-flex items-center gap-2">
                  <Sparkles size={12} className="text-[var(--signal)]"/> {t}
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      {/* CAREER PACKS */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-20">
        <div className="flex items-end justify-between mb-8 border-b-2 border-black pb-4">
          <div>
            <div className="overline">Section / 01</div>
            <h2 className="font-display font-black text-3xl sm:text-5xl tracking-tight mt-2">Career Packs</h2>
            <p className="text-[var(--text-muted)] mt-2 max-w-xl">5–6 tools chained into a workflow. Pick your role, get the exact stack.</p>
          </div>
          <Link to="/packs" className="font-mono text-xs uppercase tracking-widest link-underline">All Packs →</Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {packs.slice(0, 3).map((p, i) => (
            <Link key={p.slug} to={`/packs/${p.slug}`} data-testid={`home-pack-${p.slug}`}
              className="brutal-card overflow-hidden group fade-up" style={{ animationDelay: `${i*40}ms`}}>
              <div className="aspect-[4/3] overflow-hidden border-b-2 border-black">
                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
              </div>
              <div className="p-5">
                <div className="overline">For {p.profession}</div>
                <div className="font-display font-bold text-2xl mt-1">{p.name}</div>
                <div className="text-sm text-[var(--text-muted)] mt-2 line-clamp-2">{p.description}</div>
                <div className="mt-4 flex flex-wrap gap-1">
                  {p.workflow_steps.slice(0, 6).map((s, si) => (
                    <span key={si} className="text-lg">{s.emoji}</span>
                  ))}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      <section className="border-y-2 border-black bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-20">
          <div className="flex items-end justify-between mb-8 border-b-2 border-black pb-4">
            <div>
              <div className="overline flex items-center gap-2"><Star size={12}/> Section / 02</div>
              <h2 className="font-display font-black text-3xl sm:text-5xl tracking-tight mt-2">Featured Tools</h2>
            </div>
            <Link to="/tools" className="font-mono text-xs uppercase tracking-widest link-underline">View All →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {featured.map((t, i) => <ToolCard key={t.slug} tool={t} index={i} />)}
          </div>
        </div>
      </section>

      {/* Trending & New Launches — side by side */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-20 grid lg:grid-cols-2 gap-10">
        <div>
          <div className="flex items-end justify-between mb-6 border-b-2 border-black pb-3">
            <div className="flex items-center gap-3">
              <TrendingUp size={18}/>
              <h2 className="font-display font-black text-2xl sm:text-3xl tracking-tight">Trending This Week</h2>
            </div>
            <Link to="/tools?trending=true" className="font-mono text-xs uppercase tracking-widest link-underline">More →</Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {trending.map((t, i) => <ToolCard key={t.slug} tool={t} index={i}/>)}
          </div>
        </div>
        <div>
          <div className="flex items-end justify-between mb-6 border-b-2 border-black pb-3">
            <div className="flex items-center gap-3">
              <Zap size={18} className="text-[var(--signal)]"/>
              <h2 className="font-display font-black text-2xl sm:text-3xl tracking-tight">New Launches</h2>
            </div>
            <Link to="/tools?new_launch=true" className="font-mono text-xs uppercase tracking-widest link-underline">More →</Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {newLaunch.map((t, i) => <ToolCard key={t.slug} tool={t} index={i}/>)}
          </div>
        </div>
      </section>

      {/* CATEGORIES CTA */}
      <section className="border-t-2 border-black bg-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
          <div className="grid md:grid-cols-[2fr_1fr] gap-10 items-end">
            <div>
              <div className="overline">Section / 04</div>
              <h2 className="font-display font-black text-3xl sm:text-5xl tracking-tighter mt-2">Browse by Category</h2>
              <p className="text-[var(--text-muted)] mt-3 max-w-xl">Personas · Business Ops · Industry Verticals · AI Agents · Automation · Core Modalities.</p>
            </div>
            <Link to="/categories" className="btn-primary self-start md:self-end">Explore Categories <ArrowUpRight size={16}/></Link>
          </div>
        </div>
      </section>

      {/* MONEY CTA */}
      <section className="bg-[var(--text)] text-[var(--bg)] border-y-2 border-black">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <div className="overline opacity-60">Section / 05</div>
            <h2 className="font-display font-black text-4xl sm:text-6xl tracking-tighter mt-2 leading-none">Use AI to <span className="text-[var(--signal)]">earn</span>.</h2>
            <p className="mt-6 text-lg opacity-80 max-w-lg">Concrete strategies — freelance gigs, productized services, faceless channels, agency plays.</p>
            <Link to="/money" data-testid="money-cta" className="inline-flex mt-8 btn-secondary bg-transparent text-white border-white hover:bg-[var(--signal)] hover:border-[var(--signal)]">
              Explore Money Guides <ArrowRight size={14}/>
            </Link>
          </div>
          <div className="space-y-3 font-mono">
            {["$500-$2k/mo: AI ghostwriting on LinkedIn", "$2k-$5k retainers: Content-as-a-service", "$3k-$10k/project: MVPs with Lovable + Cursor", "$300-$800/episode: Podcast editing with Descript"].map((s, i) => (
              <div key={i} className="border border-white/20 px-4 py-3 text-sm flex items-center gap-3">
                <span className="text-[var(--signal)]">→</span> {s}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
