import React from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { apiErrorToast } from "@/lib/apiErrorToast";
import { Plus, Trash2, Edit3 } from "lucide-react";
import { Field, AdminPageHeader, SlidePanel } from "@/components/admin";

const empty = () => ({
  name: "", slug: "", description: "", profession: "developer",
  tool_slugs: [], workflow_steps: [], image_url: "",
});

export default function CareerPacksManagement() {
  const [packs, setPacks] = React.useState([]);
  const [tools, setTools] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState(empty());

  const load = () => api.get("/career-packs").then(r => setPacks(r.data));
  React.useEffect(() => { load(); api.get("/tools").then(r => setTools(r.data)); }, []);

  const startNew = () => { setEditing(null); setForm(empty()); setOpen(true); };
  const startEdit = (p) => { setEditing(p.slug); setForm({ ...p }); setOpen(true); };
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const toggleTool = (slug) => upd("tool_slugs", form.tool_slugs.includes(slug) ? form.tool_slugs.filter(x => x !== slug) : [...form.tool_slugs, slug]);
  const addStep = () => upd("workflow_steps", [...form.workflow_steps, { emoji: "✨", label: "New", tool: form.tool_slugs[0] || "" }]);
  const updStep = (i, key, val) => upd("workflow_steps", form.workflow_steps.map((s, idx) => idx===i ? { ...s, [key]: val } : s));
  const rmStep = (i) => upd("workflow_steps", form.workflow_steps.filter((_, idx) => idx !== i));

  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editing) { await api.put(`/career-packs/${editing}`, form); toast.success("Updated"); }
      else { await api.post("/career-packs", form); toast.success("Created"); }
      setOpen(false); load();
    } catch (e) { apiErrorToast(e); }
  };
  const del = async (slug) => {
    if (!window.confirm(`Delete ${slug}?`)) return;
    await api.delete(`/career-packs/${slug}`);
    toast.success("Deleted"); load();
  };

  return (
    <div data-testid="admin-packs">
      <AdminPageHeader overline="Content" title="Career Packs" count={packs.length}>
        <button data-testid="pack-new-btn" onClick={startNew} className="btn-primary"><Plus size={14}/> New Pack</button>
      </AdminPageHeader>

      <div className="grid md:grid-cols-2 gap-4">
        {packs.map(p => (
          <div key={p.slug} className="brutal-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="overline">For {p.profession}</div>
                <div className="font-display font-black text-2xl">{p.name}</div>
                <div className="font-mono text-xs text-[var(--text-muted)]">{p.slug}</div>
              </div>
              <div className="flex items-center gap-1">
                <button data-testid={`pack-edit-${p.slug}`} onClick={()=>startEdit(p)} className="border border-black p-1.5 hover:bg-black hover:text-white"><Edit3 size={12}/></button>
                <button data-testid={`pack-del-${p.slug}`} onClick={()=>del(p.slug)} className="border border-[var(--signal)] text-[var(--signal)] p-1.5 hover:bg-[var(--signal)] hover:text-white"><Trash2 size={12}/></button>
              </div>
            </div>
            <div className="mt-3 text-sm text-[var(--text-muted)] line-clamp-2">{p.description}</div>
            <div className="mt-4 flex flex-wrap gap-1">
              {(p.workflow_steps||[]).map((s, i) => (
                <span key={i} className="border border-black px-2 py-1 text-xs font-mono">{s.emoji} {s.label}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <SlidePanel open={open} onClose={() => setOpen(false)} title={editing || "New Pack"}>
        <form onSubmit={submit} className="p-6 space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Name"><input required className="brutal" value={form.name} onChange={e=>upd("name", e.target.value)}/></Field>
            <Field label="Slug"><input required disabled={!!editing} className="brutal" value={form.slug} onChange={e=>upd("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,"-"))}/></Field>
          </div>
          <Field label="Description"><textarea required className="brutal min-h-[80px]" value={form.description} onChange={e=>upd("description", e.target.value)}/></Field>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Profession"><input className="brutal" value={form.profession} onChange={e=>upd("profession", e.target.value)}/></Field>
            <Field label="Image URL"><input className="brutal" value={form.image_url} onChange={e=>upd("image_url", e.target.value)}/></Field>
          </div>

          <div>
            <div className="overline mb-2">Tools (pick 4–6)</div>
            <div className="max-h-40 overflow-y-auto border border-black/20 p-2 flex flex-wrap gap-1.5">
              {tools.map(t => (
                <button type="button" key={t.slug} onClick={()=>toggleTool(t.slug)}
                  className={`tag ${form.tool_slugs.includes(t.slug)?'bg-black text-white border-black':''}`}>{t.name}</button>
              ))}
            </div>
          </div>

          <div>
            <div className="overline mb-2 flex items-center justify-between">
              <span>Workflow Steps</span>
              <button type="button" onClick={addStep} className="border border-black px-2 py-0.5 text-[10px] font-mono uppercase">+ Add</button>
            </div>
            <div className="space-y-2">
              {form.workflow_steps.map((s, i) => (
                <div key={i} className="border border-black/30 p-2 grid grid-cols-[60px_1fr_1fr_36px] gap-2 items-center">
                  <input className="brutal py-1 text-lg text-center" value={s.emoji} onChange={e=>updStep(i, "emoji", e.target.value)}/>
                  <input placeholder="Label" className="brutal py-1" value={s.label} onChange={e=>updStep(i, "label", e.target.value)}/>
                  <select className="brutal py-1" value={s.tool} onChange={e=>updStep(i, "tool", e.target.value)}>
                    <option value="">—</option>
                    {form.tool_slugs.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <button type="button" onClick={()=>rmStep(i)} className="border border-[var(--signal)] text-[var(--signal)] p-1 justify-self-center"><Trash2 size={12}/></button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-black">
            <button type="submit" className="btn-primary">{editing?"Update":"Create"}</button>
            <button type="button" onClick={()=>setOpen(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </SlidePanel>
    </div>
  );
}
