import React from "react";
import { CheckCircle2, Loader, Circle } from "lucide-react";
import { api } from "@/lib/api";

const STATUS_ICON = {
  shipped: <CheckCircle2 size={20} className="text-green-700"/>,
  "in-progress": <Loader size={20} className="text-[var(--signal)]"/>,
  planned: <Circle size={20} className="text-[var(--text-muted)]"/>,
};

export default function Roadmap() {
  const [phases, setPhases] = React.useState([]);
  React.useEffect(() => { api.get("/roadmap").then(r => setPhases(r.data)).catch(() => {}); }, []);

  return (
    <div data-testid="roadmap-page" className="max-w-5xl mx-auto px-6 md:px-12 py-12">
      <div className="border-b-2 border-black pb-6 mb-12">
        <div className="overline">Roadmap</div>
        <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tighter mt-2">What&apos;s Next</h1>
        <p className="text-[var(--text-muted)] mt-3 max-w-2xl">The public build log. Track shipped, in-flight, and coming-soon features.</p>
      </div>
      <div className="space-y-10">
        {phases.map((p, i) => (
          <section key={i} data-testid={`roadmap-${p.status}`}>
            <div className="flex items-center gap-3 border-b-2 border-black pb-3 mb-5">
              {STATUS_ICON[p.status]}
              <h2 className="font-display font-black text-3xl tracking-tighter">{p.phase}</h2>
              <span className="tag ml-auto">{p.status}</span>
            </div>
            <ul className="space-y-2">
              {p.items.map((item, ii) => (
                <li key={ii} className="brutal-card p-4 flex items-start gap-3">
                  <span className="font-mono text-[var(--signal)]">→</span> {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
