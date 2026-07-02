import React from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { X, Plus, ExternalLink, Check } from "lucide-react";
import { api } from "@/lib/api";

export default function Compare() {
  const [params, setParams] = useSearchParams();
  const [allTools, setAllTools] = React.useState([]);
  const [tools, setTools] = React.useState([]);
  const [picker, setPicker] = React.useState(false);
  const nav = useNavigate();

  const slugs = React.useMemo(() => (params.get("tools") || "").split(",").filter(Boolean), [params]);

  React.useEffect(() => { api.get("/tools").then(r => setAllTools(r.data)); }, []);

  React.useEffect(() => {
    if (!slugs.length) { setTools([]); return; }
    Promise.all(slugs.map(s => api.get(`/tools/${s}`).then(r => r.data).catch(() => null))).then(
      arr => setTools(arr.filter(Boolean))
    );
  }, [params]);

  const addSlug = (s) => {
    const next = [...new Set([...slugs, s])].slice(0, 4);
    setParams({ tools: next.join(",") });
    setPicker(false);
  };
  const remove = (s) => setParams({ tools: slugs.filter(x => x !== s).join(",") });

  const rows = [
    { key: "tagline", label: "Tagline" },
    { key: "pricing", label: "Pricing", render: (v) => <span className={`tag ${v}`}>{v}</span> },
    { key: "category", label: "Category" },
    { key: "use_cases", label: "Best For", render: (v) => (v || []).slice(0, 3).join(", ") },
    { key: "professions", label: "Professions", render: (v) => (v || []).join(", ") || "—" },
    { key: "pros", label: "Strengths", render: (v) => (v || []).length ? <ul className="text-xs space-y-1">{v.map((x, i) => <li key={i} className="flex gap-1"><Check size={12} className="mt-0.5 text-green-700 shrink-0"/> {x}</li>)}</ul> : "—" },
    { key: "cons", label: "Trade-offs", render: (v) => (v || []).length ? <ul className="text-xs space-y-1">{v.map((x, i) => <li key={i} className="flex gap-1"><X size={12} className="mt-0.5 text-[var(--signal)] shrink-0"/> {x}</li>)}</ul> : "—" },
    { key: "free_alternatives", label: "Free Alternatives", render: (v) => (v || []).join(", ") || "—" },
    { key: "view_count", label: "Views" },
  ];

  return (
    <div data-testid="compare-page" className="max-w-7xl mx-auto px-6 md:px-12 py-12">
      <div className="border-b-2 border-black pb-6 mb-8">
        <div className="overline">Utility</div>
        <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tighter mt-2">Compare Tools</h1>
        <p className="text-[var(--text-muted)] mt-3 max-w-2xl">Pick 2–4 tools and see them side-by-side.</p>
      </div>

      {/* Column headers */}
      <div className="grid gap-4 border-2 border-black bg-white" style={{ gridTemplateColumns: `200px repeat(${Math.max(tools.length, 1)}, minmax(200px, 1fr)) 200px` }}>
        <div className="p-4 border-r border-black/20 bg-[var(--muted)] flex items-center justify-center font-mono text-xs uppercase tracking-widest">Feature</div>
        {tools.map(t => (
          <div key={t.slug} className="p-4 border-r border-black/20 relative">
            <button data-testid={`compare-remove-${t.slug}`} onClick={() => remove(t.slug)} className="absolute top-2 right-2 border border-black p-1 hover:bg-black hover:text-white"><X size={10}/></button>
            <div className="w-9 h-9 bg-black text-white flex items-center justify-center font-display font-black">{t.name[0]}</div>
            <Link to={`/tools/${t.slug}`} className="font-display font-bold text-lg mt-2 block link-underline">{t.name}</Link>
            <a href={t.url} target="_blank" rel="noreferrer" className="text-xs font-mono uppercase tracking-widest text-[var(--text-muted)] hover:text-black flex items-center gap-1 mt-1">Visit <ExternalLink size={10}/></a>
          </div>
        ))}
        {tools.length < 4 && (
          <div className="p-4 flex items-center justify-center">
            <button data-testid="compare-add-btn" onClick={() => setPicker(true)} className="btn-secondary"><Plus size={14}/> Add Tool</button>
          </div>
        )}
      </div>

      {/* Rows */}
      {tools.length >= 1 && rows.map(row => (
        <div key={row.key} className="grid gap-4 border-x-2 border-b-2 border-black bg-white" style={{ gridTemplateColumns: `200px repeat(${Math.max(tools.length, 1)}, minmax(200px, 1fr)) 200px` }}>
          <div className="p-4 border-r border-black/20 bg-[var(--muted)] font-mono text-xs uppercase tracking-widest flex items-center">{row.label}</div>
          {tools.map(t => (
            <div key={t.slug} className="p-4 border-r border-black/20 text-sm">
              {row.render ? row.render(t[row.key]) : (t[row.key] || "—")}
            </div>
          ))}
          {tools.length < 4 && <div className="p-4"/>}
        </div>
      ))}

      {tools.length === 0 && (
        <div className="mt-6 border-2 border-dashed border-black/40 p-12 text-center">
          <div className="font-display font-bold text-2xl">Pick tools to compare</div>
          <p className="text-[var(--text-muted)] mt-2">Add at least 2 tools to see the comparison table.</p>
          <button onClick={() => setPicker(true)} className="btn-primary mt-4 inline-flex"><Plus size={14}/> Add First Tool</button>
        </div>
      )}

      {/* Picker modal */}
      {picker && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setPicker(false)}>
          <div className="w-full max-w-2xl bg-white border-2 border-black brutal-shadow-lg" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b-2 border-black flex items-center justify-between">
              <div className="font-display font-black text-xl">Add a tool</div>
              <button onClick={() => setPicker(false)} className="border-2 border-black p-1.5"><X size={12}/></button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2 grid sm:grid-cols-2 gap-2">
              {allTools.filter(t => !slugs.includes(t.slug)).map(t => (
                <button
                  key={t.slug}
                  data-testid={`compare-pick-${t.slug}`}
                  onClick={() => addSlug(t.slug)}
                  className="border-2 border-black p-3 text-left hover:bg-black hover:text-white"
                >
                  <div className="font-display font-bold">{t.name}</div>
                  <div className="text-xs opacity-70 line-clamp-1">{t.tagline}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
