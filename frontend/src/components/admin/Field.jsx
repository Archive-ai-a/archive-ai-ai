import React from "react";

export default function Field({ label, children }) {
  return (
    <label className="block">
      <div className="overline mb-1">{label}</div>
      {children}
    </label>
  );
}
