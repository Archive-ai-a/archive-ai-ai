import React from "react";
import { Link } from "react-router-dom";
import { Search, ArrowUpRight, Filter, Clock, Users, X, CheckCircle2, PlayCircle, Circle } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function CareerPacks() {
  const { user } = useAuth();
  const [packs, setPacks] = React.useState([]);
  const [progress, setProgress] = React.useState({});
  const [search, setSearch] = React.useState("");
  const [domain, setDomain] = React.useState("");

  React.useEffect(() => { api.get("/career-packs").then(r => setPacks(r.data)); }, []);
  React.useEffect(() => {
    if (user && user.role === "user") {
      api.get("/pack-progress").then(r => setProgress(r.data || {})).catch(() => {});
    }
  }, [user]);

  const domains = React.useMemo(() => {
    const d = new Map();
    packs.forEach(p => {
      const dom = p.domain || "Other";
      d.set(dom, (d.get(dom) || 0) + 1);
    });
    return Array.from(d.entries()).sort((a, b) => b[1] - a[1]);
  }, [packs]);

  const filtered = React.useMemo(() => {
    return packs.filter(p => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.profession.toLowerCase().includes(search.toLowerCase());
      const matchDomain = !domain || p.domain === domain;
      return matchSearch && matchDomain;
    });
  }, [packs, search, domain]);

  return (
    <div data-testid="packs-page" className="max-w-7xl mx-auto px-6 md:px-12 py-12">
      <div className="border-b-2 border-black pb-6 mb-8">
        <div className="overline">Curated Stacks</div>
        <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tighter mt-2">Career Packs</h1>
        <p className="text-[var(--text-muted)] mt-3 max-w-2xl">50 career packs across 10 domains. Each pack chains 3–6 AI tools into a complete workflow — pick your role and hit the ground running.</p>
      </div>

      {/* Search + Filter bar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
          <input
            data-testid="packs-search"
            className="brutal pl-10 w-full"
            placeholder="Search packs — 'developer', 'video', 'founder'..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          {domains.map(([d, c]) => (
            <button
              key={d}
              data-testid={`pack-domain-${d.toLowerCase().replace(/[^a-z0-9]/g,'-')}`}
              onClick={() => setDomain(domain === d ? "" : d)}
              className={`tag whitespace-nowrap ${domain === d ? 'bg-black text-white border-black' : ''}`}
            >
              {d} ({c})
            </button>
          ))}
          {(search || domain) && (
            <button
              onClick={() => { setSearch(""); setDomain(""); }}
              className="border-2 border-black p-1.5 hover:bg-black hover:text-white"
              title="Clear filters"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="border-2 border-black bg-white p-6 mb-8 grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { icon: <Filter size={18} />, label: "Total Packs", value: packs.length },
          { icon: <Users size={18} />, label: "Domains", value: domains.length },
          { icon: <Clock size={18} />, label: "Beginner-Friendly", value: packs.filter(p => p.difficulty === "Beginner").length },
          { icon: <ArrowUpRight size={18} />, label: "Monetization Methods", value: packs.reduce((s, p) => s + (p.make_money_methods || []).length, 0) },
        ].map((s, i) => (
          <div key={i} className="text-center">
            <div className="text-[var(--text-muted)] mb-1 flex items-center justify-center gap-1">
              {s.icon} <span className="font-mono text-xs uppercase tracking-wider">{s.label}</span>
            </div>
            <div className="font-display font-black text-3xl">{s.value}</div>
          </div>
        ))}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between mb-6 font-mono text-xs uppercase tracking-widest text-[var(--text-muted)]">
        <span data-testid="packs-count">
          {filtered.length} pack{filtered.length === 1 ? '' : 's'}
          {(search || domain) ? ' found' : ''}
        </span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="border-2 border-dashed border-black/40 p-12 text-center">
          <div className="font-display font-bold text-2xl">No packs found</div>
          <p className="text-[var(--text-muted)] mt-2">Try different search terms or clear filters.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {filtered.map((p, i) => (
            <Link key={p.slug} to={`/packs/${p.slug}`} data-testid={`pack-${p.slug}`}
              className="brutal-card overflow-hidden group fade-up" style={{ animationDelay: `${i*30}ms` }}>
              <div className="aspect-[16/10] overflow-hidden border-b-2 border-black">
                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="overline">{p.domain}</span>
                  {p.difficulty && (
                    <span className={`tag ${p.difficulty === 'Beginner' ? '' : p.difficulty === 'Advanced' ? 'bg-black text-white' : 'bg-[var(--muted)]'}`}>
                      {p.difficulty}
                    </span>
                  )}
                </div>
                <div className="font-display font-black text-3xl mt-2 leading-tight">
                  {p.name}
                  {progress[p.slug] && (
                    <span className={`inline-flex items-center gap-1 ml-2 text-sm align-middle ${
                      progress[p.slug] === 'completed' ? 'text-green-700' : progress[p.slug] === 'in-progress' ? 'text-[var(--signal)]' : 'text-[var(--text-muted)]'
                    }`}>
                      {progress[p.slug] === 'completed' ? <CheckCircle2 size={16}/> : progress[p.slug] === 'in-progress' ? <PlayCircle size={16}/> : <Circle size={16}/>}
                    </span>
                  )}
                </div>
                <p className="text-sm text-[var(--text-muted)] mt-3 line-clamp-2">{p.description}</p>
                {/* Workflow */}
                <div className="mt-5 flex flex-wrap items-center gap-2">
                  {p.workflow_steps.slice(0, 5).map((s, si) => (
                    <React.Fragment key={si}>
                      <div className="inline-flex items-center gap-1.5 border-2 border-black px-2 py-1">
                        <span className="text-lg leading-none">{s.emoji}</span>
                        <span className="font-mono text-[10px] uppercase tracking-wider">{s.label}</span>
                      </div>
                      {si < Math.min(p.workflow_steps.length, 5) - 1 && <span className="text-[var(--text-muted)]">→</span>}
                    </React.Fragment>
                  ))}
                  {p.workflow_steps.length > 5 && <span className="font-mono text-xs text-[var(--text-muted)]">+{p.workflow_steps.length - 5} more</span>}
                </div>
                {/* Money preview */}
                {p.make_money_methods && p.make_money_methods.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-black/10">
                    <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--signal)] mb-2">Make Money</div>
                    <div className="flex flex-wrap gap-2">
                      {p.make_money_methods.slice(0, 2).map((m, mi) => (
                        <span key={mi} className="text-xs border border-black/20 px-2 py-1 rounded-sm font-mono">{m.title}</span>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-4 flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">{p.estimated_time || ""}</span>
                  <span className="inline-flex items-center gap-1 font-mono text-xs uppercase tracking-widest">
                    Open Pack <ArrowUpRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
