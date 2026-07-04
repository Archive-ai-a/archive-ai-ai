import React from "react";
import { useSearchParams } from "react-router-dom";
import { Search, X } from "lucide-react";
import { api } from "@/lib/api";
import ToolCard from "@/components/ToolCard";

const PRICING = ["free", "freemium", "paid"];
const PROFESSIONS = ["student", "developer", "marketer", "freelancer", "researcher"];

export default function Directory() {
  const [params, setParams] = useSearchParams();
  const [tools, setTools] = React.useState([]);
  const [categories, setCategories] = React.useState([]);
  const [q, setQ] = React.useState(params.get("q") || "");

  const category = params.get("category") || "";
  const pricing = params.get("pricing") || "";
  const profession = params.get("profession") || "";

  React.useEffect(() => { api.get("/categories").then(r => setCategories(r.data)).catch(() => {}); }, []);

  React.useEffect(() => {
    const search = new URLSearchParams();
    if (category) search.set("category", category);
    if (pricing) search.set("pricing", pricing);
    if (profession) search.set("profession", profession);
    if (params.get("q")) search.set("q", params.get("q"));
    api.get(`/tools?${search.toString()}`).then(r => setTools(r.data)).catch(() => {});
  }, [category, pricing, profession, params]);

  const update = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value); else next.delete(key);
    setParams(next);
  };

  const onSearch = (e) => { e.preventDefault(); update("q", q); };
  React.useEffect(() => {
    const id = setTimeout(() => update("q", q), 300);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);
  const clearAll = () => setParams(new URLSearchParams());
  const hasFilters = category || pricing || profession || params.get("q");

  return (
    <div data-testid="directory-page" className="max-w-7xl mx-auto px-6 md:px-12 py-12">
      <div className="border-b-2 border-black pb-6 mb-8">
        <div className="overline">Directory</div>
        <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tighter mt-2">All Tools</h1>
        <p className="text-[var(--text-muted)] mt-3 max-w-2xl">Filter by category, pricing, profession. Click any tool to see its full guide.</p>
      </div>

      <div className="grid lg:grid-cols-[260px_1fr] gap-10">
        {/* Sidebar */}
        <aside className="space-y-8">
          <form onSubmit={onSearch}>
            <div className="overline mb-2">Search</div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={16} />
              <input data-testid="dir-search" className="brutal pl-10" value={q} onChange={e => setQ(e.target.value)} placeholder="Search..." />
            </div>
          </form>

          <div>
            <div className="overline mb-2">Category</div>
            <div className="space-y-1">
              {categories.map(c => (
                <button
                  key={c.slug}
                  data-testid={`filter-cat-${c.slug}`}
                  onClick={() => update("category", category === c.slug ? "" : c.slug)}
                  className={`w-full text-left px-3 py-2 border-2 text-sm font-mono uppercase tracking-wide ${category===c.slug?'bg-black text-white border-black':'border-transparent hover:border-black'}`}
                >{c.name}</button>
              ))}
            </div>
          </div>

          <div>
            <div className="overline mb-2">Pricing</div>
            <div className="flex flex-wrap gap-2">
              {PRICING.map(p => (
                <button key={p} data-testid={`filter-price-${p}`} onClick={() => update("pricing", pricing===p?"":p)}
                  className={`tag ${pricing===p?'bg-black text-white border-black':''}`}>{p}</button>
              ))}
            </div>
          </div>

          <div>
            <div className="overline mb-2">Profession</div>
            <div className="flex flex-wrap gap-2">
              {PROFESSIONS.map(p => (
                <button key={p} data-testid={`filter-prof-${p}`} onClick={() => update("profession", profession===p?"":p)}
                  className={`tag ${profession===p?'bg-black text-white border-black':''}`}>{p}</button>
              ))}
            </div>
          </div>

          {hasFilters && (
            <button data-testid="filter-clear" onClick={clearAll} className="btn-secondary w-full justify-center">
              <X size={14}/> Clear All
            </button>
          )}
        </aside>

        {/* Grid */}
        <div>
          <div className="flex items-center justify-between mb-4 font-mono text-xs uppercase tracking-widest text-[var(--text-muted)]">
            <span data-testid="dir-count">{tools.length} tool{tools.length===1?'':'s'} found</span>
          </div>
          {tools.length === 0 ? (
            <div className="border-2 border-dashed border-black/40 p-12 text-center">
              <div className="font-display font-bold text-2xl">No results</div>
              <p className="text-[var(--text-muted)] mt-2">Try clearing filters or different keywords.</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {tools.map((t, i) => <ToolCard key={t.slug} tool={t} index={i} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
