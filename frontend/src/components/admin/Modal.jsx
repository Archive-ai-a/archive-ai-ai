import React from "react";
import { X } from "lucide-react";

export default function Modal({ open, onClose, title, children }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="w-full max-w-md bg-white border-2 border-black brutal-shadow-lg" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b-2 border-black flex items-center justify-between">
          <div className="font-display font-black text-xl">{title}</div>
          <button onClick={onClose} className="border-2 border-black p-1.5"><X size={12} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
