import React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, DollarSign, Clock, Target, ExternalLink, TrendingUp, BookOpen, ChevronRight } from "lucide-react";
import { api } from "@/lib/api";
import ToolCard from "@/components/ToolCard";

export default function CareerPackDetail() {
  const { slug } = useParams();
  const [pack, setPack] = React.useState(null);
  const [tools, setTools] = React.useState([]);

  React.useEffect(() => {
    api.get(`/career-packs/${slug}`).then(r => {
      setPack(r.data);
      api.get("/tools").then(rr => {
        const map = new Map(rr.data.map(t => [t.slug, t]));
        setTools((r.data.tool_slugs || []).map(s => map.get(s)).filter(Boolean));
      });
    });
  }, [slug]);

  if (!pack) return <div className="max-w-7xl mx-auto px-6 py-12 font-mono">Loading...</div>;

  return (
    <div data-testid="pack-detail-page">
      {/* Hero */}
      <section className="border-b-2 border-black">
        <div className="aspect-[21/9] max-h-[500px] overflow-hidden border-b-2 border-black">
          <img src={pack.image_url} alt={pack.name} className="w-full h-full object-cover" />
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
          <Link to="/packs" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest link-underline mb-6">
            <ArrowLeft size={14} /> All Packs
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-3">
            <div className="overline">{pack.domain}</div>
            {pack.difficulty && (
              <span className={`tag ${pack.difficulty === 'Beginner' ? '' : pack.difficulty === 'Advanced' ? 'bg-black text-white' : 'bg-[var(--muted)]'}`}>
                {pack.difficulty}
              </span>
            )}
          </div>
          <h1 className="font-display font-black text-5xl sm:text-7xl tracking-tighter mt-3 leading-none">{pack.name}</h1>
          <p className="mt-6 text-xl text-[var(--text-muted)] max-w-3xl leading-relaxed">{pack.description}</p>
          {pack.estimated_time && (
            <div className="mt-4 flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <Clock size={14} />
              <span>{pack.estimated_time}</span>
            </div>
          )}
        </div>
      </section>

      {/* The Workflow */}
      <section className="bg-[var(--text)] text-[var(--bg)] border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
          <div className="overline opacity-60 border-b-2 border-white/20 pb-2 mb-8 flex items-center gap-2">
            <Target size={14} /> The Workflow
          </div>
          <div className="flex flex-wrap items-stretch gap-3">
            {pack.workflow_steps.map((s, i) => (
              <React.Fragment key={i}>
                <Link to={`/tools/${s.tool}`} className="flex-1 min-w-[130px] border-2 border-white p-4 hover:bg-[var(--signal)] hover:border-[var(--signal)] transition-colors group">
                  <div className="text-4xl">{s.emoji}</div>
                  <div className="font-display font-bold mt-2 text-xl">{s.label}</div>
                  <div className="font-mono text-[10px] uppercase tracking-widest opacity-60 mt-1 group-hover:opacity-100">via {s.tool}</div>
                </Link>
                {i < pack.workflow_steps.length - 1 && (
                  <div className="self-center text-[var(--signal)] text-3xl hidden sm:block">→</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* The Stack */}
      {tools.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 md:px-12 py-16">
          <div className="overline border-b-2 border-black pb-2 mb-8 flex items-center gap-2">
            <BookOpen size={14} /> The Stack ({tools.length} tools)
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {tools.map((t, i) => <ToolCard key={t.slug} tool={t} index={i} />)}
          </div>
        </section>
      )}

      {/* Make Money with This Pack */}
      {pack.make_money_methods && pack.make_money_methods.length > 0 && (
        <section className="border-t-2 border-black bg-white">
          <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
            <div className="overline border-b-2 border-black pb-2 mb-8 flex items-center gap-2">
              <DollarSign size={14} className="text-[var(--signal)]" /> Make Money with This Pack
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {pack.make_money_methods.map((m, i) => (
                <div key={i} className="border-2 border-black p-6 bg-white">
                  <div className="w-10 h-10 bg-[var(--signal)] text-white flex items-center justify-center mb-3 font-display font-black">
                    {String(i + 1).padStart(2, "0")}
                  </div>
                  <div className="font-display font-bold text-2xl leading-tight">{m.title}</div>

                  {/* Steps */}
                  <div className="mt-4 space-y-2">
                    <div className="font-mono text-xs uppercase tracking-widest text-[var(--text-muted)]">How It Works</div>
                    <ol className="space-y-1.5">
                      {m.steps.map((step, si) => (
                        <li key={si} className="flex items-start gap-2 text-sm">
                          <span className="text-[var(--signal)] font-bold mt-0.5">{si + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Tools used */}
                  {m.tools && m.tools.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {m.tools.map((t, ti) => (
                        <span key={ti} className="tag">{t}</span>
                      ))}
                    </div>
                  )}

                  {/* Pricing + Where */}
                  <div className="mt-4 pt-4 border-t border-black/10 grid grid-cols-2 gap-4">
                    {m.price_range && (
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1">Price Range</div>
                        <div className="font-display font-bold text-lg text-[var(--signal)]">{m.price_range}</div>
                      </div>
                    )}
                    {m.where_to_sell && (
                      <div>
                        <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)] mb-1">Where to Sell</div>
                        <div className="text-sm font-medium">{m.where_to_sell}</div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quick Start CTA */}
      <section className="bg-[var(--text)] text-[var(--bg)] border-t-2 border-black">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
          <div className="grid md:grid-cols-[1fr_auto] gap-6 items-center">
            <div>
              <div className="font-display font-black text-3xl sm:text-5xl tracking-tighter leading-tight">
                Ready to get started with {pack.name}?
              </div>
              <p className="mt-3 opacity-70 max-w-xl">Pick the first tool in the workflow above, follow the step-by-step, and you'll have your first result in no time.</p>
            </div>
            <Link to={`/tools/${pack.workflow_steps[0]?.tool}`} className="btn-secondary bg-transparent text-white border-white hover:bg-[var(--signal)] hover:border-[var(--signal)]">
              Start with {pack.workflow_steps[0]?.label} <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
