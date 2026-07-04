import React from "react";
import { X } from "lucide-react";

export default function SlidePanel({ open, onClose, title, subtitle, maxWidth = "max-w-2xl", children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-end" onClick={onClose}>
      <div className={`w-full ${maxWidth} bg-white h-full overflow-y-auto border-l-2 border-black`} onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b-2 border-black flex items-center justify-between">
          <div>
            {subtitle && <div className="overline">{subtitle}</div>}
            <div className="font-display font-black text-2xl tracking-tighter">{title}</div>
          </div>
          <button onClick={onClose} className="border-2 border-black p-2"><X size={14} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
