import React from "react";
import { useParams, Link } from "react-router-dom";
import { ExternalLink, Check, X, ArrowLeft, Copy, DollarSign, Sparkles, Coffee, Bookmark, BookmarkCheck } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export default function ToolDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [tool, setTool] = React.useState(null);
  const [related, setRelated] = React.useState([]);
  const [notFound, setNotFound] = React.useState(false);
  const [bookmarked, setBookmarked] = React.useState(false);

  React.useEffect(() => {
    setTool(null); setNotFound(false); setBookmarked(false);
    api.get(`/tools/${slug}`).then(r => {
      setTool(r.data);
      const cat = r.data.category;
      api.get(`/tools?category=${cat}`).then(rr => {
        setRelated(rr.data.filter(t => t.slug !== r.data.slug).slice(0, 4));
      });
    }).catch(() => setNotFound(true));
  }, [slug]);

  React.useEffect(() => {
    if (user && user.role === "user") {
      api.get("/bookmarks").then(r => setBookmarked(r.data.some(t => t.slug === slug))).catch(() => {});
    }
  }, [user, slug]);

  const toggleBookmark = async () => {
    if (!user || user.role !== "user") {
      toast.info("Sign in to save tools", { action: { label: "Sign In", onClick: () => window.location.assign("/login") } });
      return;
    }
    try {
      if (bookmarked) {
        await api.delete(`/bookmarks/${slug}`);
        setBookmarked(false); toast.success("Removed from bookmarks");
      } else {
        await api.post(`/bookmarks/${slug}`);
        setBookmarked(true); toast.success("Saved to bookmarks");
      }
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed to update bookmark");
    }
  };

  if (notFound) return (
    <div className="max-w-3xl mx-auto px-6 py-24 text-center">
      <div className="font-display font-black text-4xl">Tool not found</div>
      <Link to="/tools" className="btn-primary mt-6 inline-flex">← Back to Directory</Link>
    </div>
  );
  if (!tool) return <div className="max-w-7xl mx-auto px-6 py-12 font-mono">Loading...</div>;

  const copy = (p) => { navigator.clipboard.writeText(p); toast.success("Copied!"); };

  return (
    <div data-testid="tool-detail-page" className="max-w-7xl mx-auto px-6 md:px-12 py-10">
      <Link to="/tools" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest link-underline">
        <ArrowLeft size={14}/> Back to Directory
      </Link>

      <div className="grid lg:grid-cols-[1fr_360px] gap-12 mt-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="overline">{tool.category}</div>
            <span className={`tag ${tool.pricing}`}>{tool.pricing}</span>
            {tool.new_launch && <span className="tag" style={{ background: "#111", color: "#fff", borderColor: "#111" }}>NEW LAUNCH</span>}
            {tool.trending && <span className="tag" style={{ background: "var(--signal)", color: "#fff", borderColor: "var(--signal)" }}>TRENDING</span>}
          </div>
          <div className="flex items-center gap-4 mt-3">
            <div className="w-16 h-16 bg-black text-white flex items-center justify-center font-display font-black text-2xl">{tool.name[0]}</div>
            <h1 className="font-display font-black text-5xl tracking-tighter leading-none">{tool.name}</h1>
          </div>
          <p className="mt-6 text-xl text-[var(--text-muted)] leading-relaxed">{tool.tagline}</p>
          <p className="mt-4 text-base leading-relaxed">{tool.description}</p>

          {/* Start Here Workflow */}
          {tool.start_here_workflow?.length > 0 && (
            <Section title="Start Here — 3 Step Workflow" iconTint>
              <ol className="space-y-3">
                {tool.start_here_workflow.map((s, i) => (
                  <li key={i} className="brutal-card p-5 flex items-start gap-5">
                    <span className="font-display font-black text-4xl text-[var(--signal)] leading-none">{String(i+1).padStart(2,"0")}</span>
                    <p className="mt-1 text-lg leading-relaxed">{s}</p>
                  </li>
                ))}
              </ol>
            </Section>
          )}

          {/* Use cases */}
          {tool.use_cases?.length > 0 && (
            <Section title="Best Use Cases">
              <ul className="grid sm:grid-cols-2 gap-2">
                {tool.use_cases.map((u, i) => (
                  <li key={i} className="border-2 border-black px-4 py-3 font-mono text-sm flex items-center gap-2">
                    <span className="text-[var(--signal)]">→</span> {u}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {/* IRL */}
          {tool.irl_use_cases?.length > 0 && (
            <Section title="IRL Integration" icon={<Coffee size={16}/>}>
              <div className="grid sm:grid-cols-2 gap-3">
                {tool.irl_use_cases.map((u, i) => (
                  <div key={i} className="border-2 border-dashed border-black px-4 py-3 text-sm bg-white">
                    <span className="font-display font-bold text-[var(--signal)] mr-2">·</span> {u}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Make Money */}
          {tool.make_money_module?.length > 0 && (
            <Section title="Make Money With This" icon={<DollarSign size={16}/>}>
              <div className="grid sm:grid-cols-2 gap-4">
                {tool.make_money_module.map((m, i) => (
                  <div key={i} className="border-2 border-black p-5 bg-white">
                    <div className="w-9 h-9 bg-[var(--signal)] text-white flex items-center justify-center mb-3">
                      <DollarSign size={16}/>
                    </div>
                    <div className="font-display font-bold text-lg leading-tight">{m.title}</div>
                    <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed">{m.body}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Prompts */}
          {tool.best_prompts?.length > 0 && (
            <Section title="Best Prompts">
              <div className="space-y-3">
                {tool.best_prompts.map((p, i) => (
                  <div key={i} className="border-2 border-black bg-[var(--text)] text-[var(--bg)] p-4 font-mono text-sm relative group">
                    <button data-testid={`copy-prompt-${i}`} onClick={() => copy(p)} className="absolute top-3 right-3 opacity-60 hover:opacity-100 hover:text-[var(--signal)]">
                      <Copy size={14}/>
                    </button>
                    <span className="text-[var(--signal)]">$ </span>{p}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {(tool.pros?.length || tool.cons?.length) ? (
            <Section title="Pros & Cons">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="border-2 border-black p-5 bg-white">
                  <div className="overline mb-3">Strengths</div>
                  <ul className="space-y-2">{tool.pros.map((p, i) => <li key={i} className="flex items-start gap-2 text-sm"><Check size={16} className="text-green-700 mt-0.5"/> {p}</li>)}</ul>
                </div>
                <div className="border-2 border-black p-5 bg-white">
                  <div className="overline mb-3">Trade-offs</div>
                  <ul className="space-y-2">{tool.cons.map((p, i) => <li key={i} className="flex items-start gap-2 text-sm"><X size={16} className="text-[var(--signal)] mt-0.5"/> {p}</li>)}</ul>
                </div>
              </div>
            </Section>
          ) : null}

          {related.length > 0 && (
            <Section title="Related Tools">
              <div className="grid sm:grid-cols-2 gap-3">
                {related.map(r => (
                  <Link key={r.slug} to={`/tools/${r.slug}`} className="border-2 border-black p-4 hover:bg-black hover:text-white transition-colors">
                    <div className="font-display font-bold text-lg">{r.name}</div>
                    <div className="text-sm opacity-70 line-clamp-1">{r.tagline}</div>
                  </Link>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* Sticky panel */}
        <aside className="lg:sticky lg:top-24 self-start space-y-5">
          <div className="border-2 border-black bg-white p-5">
            <a data-testid="visit-tool-btn" href={tool.url} target="_blank" rel="noreferrer" className="btn-primary w-full justify-center">
              Visit {tool.name} <ExternalLink size={14}/>
            </a>
            <button
              data-testid="bookmark-btn"
              onClick={toggleBookmark}
              className={`w-full justify-center mt-3 border-2 border-black py-3 font-mono text-xs uppercase tracking-widest flex items-center gap-2 ${bookmarked ? 'bg-[var(--signal)] text-white border-[var(--signal)]' : 'hover:bg-black hover:text-white'}`}
            >
              {bookmarked ? <><BookmarkCheck size={14}/> Saved</> : <><Bookmark size={14}/> Save</>}
            </button>
            <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <Stat label="Pricing" value={<span className={`tag ${tool.pricing}`}>{tool.pricing}</span>}/>
              <Stat label="Views" value={<span className="font-mono">{tool.view_count || 0}</span>}/>
            </div>
            {tool.professions?.length > 0 && (
              <div className="mt-5">
                <div className="overline mb-2">Best For</div>
                <div className="flex flex-wrap gap-2">
                  {tool.professions.map(p => <Link key={p} to={`/tools?profession=${p}`} className="tag hover:bg-black hover:text-white">{p}</Link>)}
                </div>
              </div>
            )}
          </div>

          {tool.free_alternatives?.length > 0 && (
            <div className="border-2 border-black bg-white p-5">
              <div className="overline mb-3 flex items-center gap-2"><Sparkles size={12}/> Free Alternatives</div>
              <ul className="space-y-2">
                {tool.free_alternatives.map((a, i) => (
                  <li key={i} className="font-mono text-sm border-b border-black/10 py-2 last:border-b-0">→ {a}</li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <section className="mt-12">
      <div className="overline mb-4 border-b-2 border-black pb-2 flex items-center gap-2">
        {icon} {title}
      </div>
      {children}
    </section>
  );
}
function Stat({ label, value }) {
  return (
    <div>
      <div className="overline mb-1">{label}</div>
      <div className="font-display font-bold">{value}</div>
    </div>
  );
}
