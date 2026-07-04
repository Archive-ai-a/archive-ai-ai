import React from "react";

export default function EmptyState({ message = "No items found.", colSpan }) {
  if (colSpan) {
    return (
      <tr>
        <td colSpan={colSpan} className="px-3 py-8 text-center text-[var(--text-muted)]">
          {message}
        </td>
      </tr>
    );
  }
  return (
    <div className="border-2 border-dashed border-black/40 p-12 text-center">
      <div className="font-display font-bold text-2xl">{message}</div>
    </div>
  );
}
