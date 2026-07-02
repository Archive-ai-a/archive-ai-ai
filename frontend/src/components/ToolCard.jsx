import React from "react";
import { Link } from "react-router-dom";
import { ExternalLink } from "lucide-react";

export default function ToolCard({ tool, index = 0 }) {
  return (
    <Link
      to={`/tools/${tool.slug}`}
      data-testid={`tool-card-${tool.slug}`}
      className="brutal-card p-5 flex flex-col gap-3 fade-up"
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-black text-white flex items-center justify-center font-display font-black">
            {tool.name[0]}
          </div>
          <div>
            <div className="font-display font-bold text-lg leading-tight">{tool.name}</div>
            <div className="overline">{tool.category}</div>
          </div>
        </div>
        <span className={`tag ${tool.pricing}`}>{tool.pricing}</span>
      </div>
      <p className="text-sm text-[var(--text-muted)] leading-relaxed line-clamp-3">{tool.tagline}</p>
      <div className="flex items-center justify-between pt-2 border-t border-black/10">
        <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">
          {(tool.use_cases || []).slice(0,2).join(" · ")}
        </div>
        <ExternalLink size={14} className="text-[var(--text-muted)]" />
      </div>
    </Link>
  );
}
