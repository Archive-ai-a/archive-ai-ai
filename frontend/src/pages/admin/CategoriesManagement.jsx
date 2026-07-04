import React from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { apiErrorToast } from "@/lib/apiErrorToast";
import { Plus, Trash2, Edit3 } from "lucide-react";
import { Field, AdminPageHeader, SlidePanel } from "@/components/admin";

const empty = () => ({ name: "", slug: "", description: "", icon: "Sparkles", parent_slug: "", sort: 100 });

export default function CategoriesManagement() {
  const [cats, setCats] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [form, setForm] = React.useState(empty());

  const load = () => api.get("/categories").then(r => setCats(r.data));
  React.useEffect(() => { load(); }, []);

  const parents = cats.filter(c => !c.parent_slug);
  const subsBy = (slug) => cats.filter(c => c.parent_slug === slug);

  const startNew = () => { setEditing(null); setForm(empty()); setOpen(true); };
  const startEdit = (c) => { setEditing(c.slug); setForm({ ...c, parent_slug: c.parent_slug || "" }); setOpen(true); };
  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form, parent_slug: form.parent_slug || null };
    try {
      if (editing) { await api.put(`/categories/${editing}`, payload); toast.success("Updated"); }
      else { await api.post("/categories", payload); toast.success("Created"); }
      setOpen(false); load();
    } catch (e) { apiErrorToast(e); }
  };
  const del = async (slug) => {
    if (!window.confirm(`Delete ${slug}?`)) return;
    await api.delete(`/categories/${slug}`);
    toast.success("Deleted"); load();
  };

  return (
    <div data-testid="admin-categories">
      <AdminPageHeader overline="Content" title="Categories" count={cats.length}>
        <button data-testid="cat-new-btn" onClick={startNew} className="btn-primary"><Plus size={14}/> New Category</button>
      </AdminPageHeader>

      <div className="space-y-6">
        {parents.map(p => (
          <div key={p.slug} className="border-2 border-black bg-white">
            <div className="p-4 border-b-2 border-black flex items-center justify-between bg-[var(--muted)]">
              <div>
                <div className="overline">Group</div>
                <div className="font-display font-black text-xl">{p.name}</div>
              </div>
              <div className="flex items-center gap-1">
                <button data-testid={`cat-edit-${p.slug}`} onClick={()=>startEdit(p)} className="border border-black p-1.5 hover:bg-black hover:text-white"><Edit3 size={12}/></button>
                <button data-testid={`cat-del-${p.slug}`} onClick={()=>del(p.slug)} className="border border-[var(--signal)] text-[var(--signal)] p-1.5 hover:bg-[var(--signal)] hover:text-white"><Trash2 size={12}/></button>
              </div>
            </div>
            <div className="p-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {subsBy(p.slug).map(s => (
                <div key={s.slug} className="border border-black/20 px-3 py-2 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-sm">{s.name}</div>
                    <div className="font-mono text-[10px] text-[var(--text-muted)]">{s.slug}</div>
                  </div>
                  <div className="flex items-center gap-1">
                    <button data-testid={`cat-edit-${s.slug}`} onClick={()=>startEdit(s)} className="border border-black p-1 hover:bg-black hover:text-white"><Edit3 size={10}/></button>
                    <button data-testid={`cat-del-${s.slug}`} onClick={()=>del(s.slug)} className="border border-[var(--signal)] text-[var(--signal)] p-1 hover:bg-[var(--signal)] hover:text-white"><Trash2 size={10}/></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <SlidePanel open={open} onClose={() => setOpen(false)} title={editing || "New Category"} maxWidth="max-w-lg">
        <form onSubmit={submit} className="p-6 space-y-4">
          <Field label="Name"><input required className="brutal" value={form.name} onChange={e=>upd("name", e.target.value)}/></Field>
          <Field label="Slug"><input required className="brutal" disabled={!!editing} value={form.slug} onChange={e=>upd("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}/></Field>
          <Field label="Description"><textarea className="brutal min-h-[70px]" value={form.description} onChange={e=>upd("description", e.target.value)}/></Field>
          <Field label="Icon (lucide-react name, e.g. Sparkles)"><input className="brutal" value={form.icon} onChange={e=>upd("icon", e.target.value)}/></Field>
          <Field label="Parent Category (leave empty for top-level)">
            <select className="brutal" value={form.parent_slug} onChange={e=>upd("parent_slug", e.target.value)}>
              <option value="">— top-level —</option>
              {parents.map(p => <option key={p.slug} value={p.slug}>{p.name}</option>)}
            </select>
          </Field>
          <Field label="Sort"><input type="number" className="brutal" value={form.sort} onChange={e=>upd("sort", parseInt(e.target.value)||100)}/></Field>
          <div className="flex gap-3 pt-4 border-t border-black">
            <button type="submit" className="btn-primary">{editing?"Update":"Create"}</button>
            <button type="button" onClick={()=>setOpen(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </SlidePanel>
    </div>
  );
}
