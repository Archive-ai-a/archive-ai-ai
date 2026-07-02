import React from "react";
import { Link } from "react-router-dom";
import { DollarSign } from "lucide-react";
import { api } from "@/lib/api";

export default function MoneyGuides() {
  const [tools, setTools] = React.useState([]);
  React.useEffect(() => {
    api.get("/tools").then(r => setTools(r.data.filter(t => (t.make_money_module||[]).length > 0)));
  }, []);

  return (
    <div data-testid="money-page" className="max-w-7xl mx-auto px-6 md:px-12 py-12">
      <div className="border-b-2 border-black pb-6 mb-10">
        <div className="overline">Earn With AI</div>
        <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tighter mt-2">Make Money with AI</h1>
        <p className="text-[var(--text-muted)] mt-3 max-w-2xl">Concrete monetization strategies for every tool — pricing models, gigs, playbooks.</p>
      </div>

      <div className="space-y-12">
        {tools.map((t, idx) => (
          <section key={t.slug} data-testid={`money-tool-${t.slug}`}>
            <div className="flex items-end justify-between mb-4 border-b border-black pb-3">
              <div className="flex items-center gap-4">
                <div className="w-11 h-11 bg-black text-white flex items-center justify-center font-display font-black">{t.name[0]}</div>
                <div>
                  <div className="overline">{String(idx+1).padStart(2, "0")}</div>
                  <Link to={`/tools/${t.slug}`} className="font-display font-bold text-2xl link-underline">{t.name}</Link>
                </div>
              </div>
              <Link to={`/tools/${t.slug}`} className="font-mono text-xs uppercase tracking-widest link-underline whitespace-nowrap">Full Guide →</Link>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {t.make_money_module.map((m, i) => (
                <div key={i} className="brutal-card p-5">
                  <div className="w-9 h-9 bg-[var(--signal)] text-white flex items-center justify-center mb-3">
                    <DollarSign size={16}/>
                  </div>
                  <div className="font-display font-bold text-lg leading-tight">{m.title}</div>
                  <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed">{m.body}</p>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
