import React from "react";

export default function Pagination({ page, pages, onPageChange }) {
  if (pages <= 1) return null;
  return (
    <div className="mt-4 flex items-center justify-end gap-2 font-mono text-xs">
      {Array.from({ length: pages }, (_, i) => (
        <button
          key={i}
          onClick={() => onPageChange(i + 1)}
          className={`border-2 border-black w-8 h-8 ${page === i + 1 ? "bg-black text-white" : ""}`}
        >
          {i + 1}
        </button>
      ))}
    </div>
  );
}
