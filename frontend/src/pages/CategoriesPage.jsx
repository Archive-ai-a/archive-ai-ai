import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { api } from "@/lib/api";

export default function CategoriesPage() {
  const [cats, setCats] = React.useState([]);
  React.useEffect(() => { api.get("/categories").then(r => setCats(r.data)).catch(() => {}); }, []);

  const parents = cats.filter(c => !c.parent_slug);
  const subsBy = (slug) => cats.filter(c => c.parent_slug === slug);

  return (
    <div data-testid="categories-page" className="max-w-7xl mx-auto px-6 md:px-12 py-12">
      <div className="border-b-2 border-black pb-6 mb-10">
        <div className="overline">Taxonomy</div>
        <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tighter mt-2">Every Category</h1>
        <p className="text-[var(--text-muted)] mt-3 max-w-2xl">From Personas & Business Ops to AI Agents & Automation.</p>
      </div>

      <div className="space-y-16">
        {parents.map((p, i) => (
          <section key={p.slug} data-testid={`cat-group-${p.slug}`}>
            <div className="flex items-end justify-between border-b-2 border-black pb-3 mb-6">
              <div>
                <div className="overline">{String(i+1).padStart(2, "0")} / Group</div>
                <h2 className="font-display font-black text-3xl sm:text-5xl tracking-tighter mt-1">{p.name}</h2>
                <p className="text-[var(--text-muted)] mt-2 max-w-xl">{p.description}</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {subsBy(p.slug).map(s => (
                <Link key={s.slug} to={`/tools?category=${s.slug}`}
                  data-testid={`cat-${s.slug}`}
                  className="brutal-card p-4 flex items-center justify-between group">
                  <div>
                    <div className="font-display font-bold text-lg">{s.name}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-1">{s.description}</div>
                  </div>
                  <ArrowUpRight size={18} className="opacity-50 group-hover:opacity-100"/>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
