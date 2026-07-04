import React from "react";
import { Link } from "react-router-dom";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

export default function Prompts() {
  const [tools, setTools] = React.useState([]);
  const [filter, setFilter] = React.useState("");

  React.useEffect(() => { api.get("/tools").then(r => setTools(r.data.filter(t => (t.best_prompts||[]).length > 0))).catch(() => {}); }, []);

  const copy = (p) => { navigator.clipboard.writeText(p); toast.success("Copied to clipboard"); };
  const filtered = tools.filter(t =>
    !filter || t.name.toLowerCase().includes(filter.toLowerCase()) ||
    (t.best_prompts||[]).some(p => p.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div data-testid="prompts-page" className="max-w-7xl mx-auto px-6 md:px-12 py-12">
      <div className="border-b-2 border-black pb-6 mb-8">
        <div className="overline">Library</div>
        <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tighter mt-2">Prompts That Work</h1>
        <p className="text-[var(--text-muted)] mt-3 max-w-2xl">Battle-tested prompts grouped by tool. Copy, tweak, ship.</p>
      </div>

      <input data-testid="prompts-search" className="brutal mb-8 max-w-md" value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter prompts or tools..."/>

      <div className="space-y-10">
        {filtered.map(t => (
          <div key={t.slug} data-testid={`prompts-tool-${t.slug}`}>
            <div className="flex items-center justify-between border-b border-black pb-2 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-black text-white flex items-center justify-center font-display font-black">{t.name[0]}</div>
                <div>
                  <Link to={`/tools/${t.slug}`} className="font-display font-bold text-xl link-underline">{t.name}</Link>
                  <div className="overline">{t.category}</div>
                </div>
              </div>
              <Link to={`/tools/${t.slug}`} className="font-mono text-xs uppercase tracking-widest link-underline">View Tool →</Link>
            </div>
            <div className="space-y-2">
              {t.best_prompts.map((p, i) => (
                <div key={i} className="border-2 border-black bg-[var(--text)] text-[var(--bg)] p-4 font-mono text-sm relative group">
                  <button data-testid={`copy-${t.slug}-${i}`} onClick={() => copy(p)} className="absolute top-3 right-3 opacity-60 hover:opacity-100 hover:text-[var(--signal)]"><Copy size={14}/></button>
                  <span className="text-[var(--signal)]">$ </span>{p}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
