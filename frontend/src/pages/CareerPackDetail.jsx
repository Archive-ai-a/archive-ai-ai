import React from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api";
import ToolCard from "@/components/ToolCard";

export default function CareerPackDetail() {
  const { slug } = useParams();
  const [pack, setPack] = React.useState(null);
  const [tools, setTools] = React.useState([]);

  const [notFound, setNotFound] = React.useState(false);

  React.useEffect(() => {
    setNotFound(false);
    api.get(`/career-packs/${slug}`).then(r => {
      setPack(r.data);
      api.get("/tools").then(rr => {
        const map = new Map(rr.data.map(t => [t.slug, t]));
        setTools(r.data.tool_slugs.map(s => map.get(s)).filter(Boolean));
      }).catch(() => {});
    }).catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) return (
    <div className="max-w-3xl mx-auto px-6 py-24 text-center">
      <div className="font-display font-black text-4xl">Pack not found</div>
      <Link to="/packs" className="btn-primary mt-6 inline-flex">← Back to Career Packs</Link>
    </div>
  );
  if (!pack) return <div className="max-w-7xl mx-auto px-6 py-12 font-mono">Loading...</div>;

  return (
    <div data-testid="pack-detail-page">
      <section className="border-b-2 border-black">
        <div className="aspect-[21/9] max-h-[500px] overflow-hidden border-b-2 border-black">
          <img src={pack.image_url} alt={pack.name} className="w-full h-full object-cover"/>
        </div>
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12">
          <Link to="/packs" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest link-underline mb-6">
            <ArrowLeft size={14}/> All Packs
          </Link>
          <div className="overline">For {pack.profession}</div>
          <h1 className="font-display font-black text-5xl sm:text-7xl tracking-tighter mt-3 leading-none">{pack.name}</h1>
          <p className="mt-6 text-xl text-[var(--text-muted)] max-w-3xl leading-relaxed">{pack.description}</p>
        </div>
      </section>

      {/* Workflow diagram */}
      <section className="bg-[var(--text)] text-[var(--bg)] border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16">
          <div className="overline opacity-60 border-b-2 border-white/20 pb-2 mb-8">The Workflow</div>
          <div className="flex flex-wrap items-stretch gap-3">
            {pack.workflow_steps.map((s, i) => (
              <React.Fragment key={i}>
                <Link to={`/tools/${s.tool}`} className="flex-1 min-w-[140px] border-2 border-white p-4 hover:bg-[var(--signal)] hover:border-[var(--signal)] transition-colors group">
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

      {/* Stack */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-16">
        <div className="overline border-b-2 border-black pb-2 mb-8">The Stack</div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((t, i) => <ToolCard key={t.slug} tool={t} index={i}/>)}
        </div>
      </section>
    </div>
  );
}
