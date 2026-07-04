import React from "react";

export default function AdminPageHeader({ overline, title, count, children }) {
  return (
    <div className="flex items-end justify-between flex-wrap gap-3 mb-6 border-b-2 border-black pb-4">
      <div>
        <div className="overline">{overline}</div>
        <h1 className="font-display font-black text-3xl tracking-tighter">
          {title}{count != null ? ` (${count})` : ""}
        </h1>
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
