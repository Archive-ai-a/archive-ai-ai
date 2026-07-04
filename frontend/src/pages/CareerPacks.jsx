import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { api } from "@/lib/api";

export default function CareerPacks() {
  const [packs, setPacks] = React.useState([]);
  React.useEffect(() => { api.get("/career-packs").then(r => setPacks(r.data)).catch(() => {}); }, []);

  return (
    <div data-testid="packs-page" className="max-w-7xl mx-auto px-6 md:px-12 py-12">
      <div className="border-b-2 border-black pb-6 mb-10">
        <div className="overline">Curated Stacks</div>
        <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tighter mt-2">Career Packs</h1>
        <p className="text-[var(--text-muted)] mt-3 max-w-2xl">5–6 tools chained together with a visual workflow — pick a role and hit the ground running.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {packs.map((p, i) => (
          <Link key={p.slug} to={`/packs/${p.slug}`} data-testid={`pack-${p.slug}`}
            className="brutal-card overflow-hidden group fade-up" style={{ animationDelay: `${i*40}ms`}}>
            <div className="aspect-[16/10] overflow-hidden border-b-2 border-black">
              <img src={p.image_url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"/>
            </div>
            <div className="p-6">
              <div className="overline">For {p.profession}</div>
              <div className="font-display font-black text-3xl mt-2 leading-tight">{p.name}</div>
              <p className="text-sm text-[var(--text-muted)] mt-3">{p.description}</p>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                {p.workflow_steps.map((s, si) => (
                  <React.Fragment key={si}>
                    <div className="inline-flex items-center gap-1.5 border-2 border-black px-2 py-1">
                      <span className="text-lg leading-none">{s.emoji}</span>
                      <span className="font-mono text-[10px] uppercase tracking-wider">{s.label}</span>
                    </div>
                    {si < p.workflow_steps.length - 1 && <span className="text-[var(--text-muted)]">→</span>}
                  </React.Fragment>
                ))}
              </div>
              <div className="mt-5 inline-flex items-center gap-1 font-mono text-xs uppercase tracking-widest">
                Open Pack <ArrowUpRight size={14}/>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
