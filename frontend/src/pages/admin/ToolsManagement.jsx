import React from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { Plus, Trash2, Edit3, Search, X } from "lucide-react";

const empty = () => ({
  name: "", slug: "", tagline: "", description: "",
  category: "", category_slugs: [], pricing: "freemium", url: "", logo_url: "",
  use_cases: [], free_alternatives: [], best_prompts: [], pros: [], cons: [], professions: [],
  start_here_workflow: [], make_money_module: [], irl_use_cases: [],
  featured: false, trending: false, new_launch: false, updated_recently: false,
});

const PROFS = ["student", "developer", "marketer", "freelancer", "researcher", "designer", "founder"];

export default function ToolsManagement() {
  const [tools, setTools] = React.useState([]);
  const [cats, setCats] = React.useState([]);
  const [q, setQ] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [editing, setEditing] = React.useState(null); // slug being edited
  const [form, setForm] = React.useState(empty());
  const [open, setOpen] = React.useState(false);
  const perPage = 10;

  const load = () => api.get("/tools").then(r => setTools(r.data)).catch(() => toast.error("Failed to load tools"));
  React.useEffect(() => { load(); api.get("/categories").then(r => setCats(r.data)).catch(() => {}); }, []);

  const filtered = tools.filter(t => !q || t.name.toLowerCase().includes(q.toLowerCase()) || t.slug.toLowerCase().includes(q.toLowerCase()));
  const pages = Math.max(1, Math.ceil(filtered.length / perPage));
  const view = filtered.slice((page-1)*perPage, page*perPage);

  const startNew = () => {
    setEditing(null);
    setForm({ ...empty(), category: cats[0]?.slug || "" });
    setOpen(true);
  };
  const startEdit = (t) => {
    setEditing(t.slug);
    setForm({ ...empty(), ...t, category_slugs: t.category_slugs || [], make_money_module: t.make_money_module || [] });
    setOpen(true);
  };

  const upd = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const updList = (k, v) => setForm(f => ({ ...f, [k]: v.split("\n").map(s => s.trim()).filter(Boolean) }));
  const updMoney = (v) => {
    const parsed = v.split("\n---\n").map(block => {
      const [title, ...rest] = block.split("\n");
      return { title: (title||"").trim(), body: rest.join("\n").trim() };
    }).filter(m => m.title);
    setForm(f => ({ ...f, make_money_module: parsed }));
  };
  const toggle = (arrKey, val) => setForm(f => ({ ...f, [arrKey]: f[arrKey].includes(val) ? f[arrKey].filter(x => x!==val) : [...f[arrKey], val] }));

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.slug) return toast.error("Name & slug required");
    const payload = { ...form };
    if (!payload.category && payload.category_slugs.length) payload.category = payload.category_slugs[0];
    try {
      if (editing) {
        await api.put(`/tools/${editing}`, payload);
        toast.success("Tool updated");
      } else {
        await api.post("/tools", payload);
        toast.success("Tool created");
      }
      setOpen(false); load();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Failed");
    }
  };
  const del = async (slug) => {
    if (!window.confirm(`Delete ${slug}?`)) return;
    try {
      await api.delete(`/tools/${slug}`);
      toast.success("Deleted"); load();
    } catch (e) { toast.error(e.response?.data?.detail || "Failed to delete"); }
  };

  const importExtras = async () => {
    if (!window.confirm("Import all extra tools from the AI Tools Database (skips existing slugs)?")) return;
    try {
      const { data } = await api.post("/admin/import-extras");
      toast.success(`Imported ${data.added} new tools`);
      load();
    } catch (e) { toast.error(e.response?.data?.detail || "Failed"); }
  };

  const moneyStr = (form.make_money_module || []).map(m => `${m.title}\n${m.body}`).join("\n---\n");

  return (
    <div data-testid="admin-tools">
      <div className="flex items-end justify-between flex-wrap gap-3 mb-6 border-b-2 border-black pb-4">
        <div>
          <div className="overline">Content</div>
          <h1 className="font-display font-black text-3xl tracking-tighter">Tools ({tools.length})</h1>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"/>
            <input data-testid="tools-search" className="brutal pl-9 h-10" placeholder="Search..." value={q} onChange={e=>{setQ(e.target.value); setPage(1);}}/>
          </div>
          <button data-testid="tools-import-btn" onClick={importExtras} className="btn-secondary h-10 py-0">Import Extras</button>
          <button data-testid="tools-new-btn" onClick={startNew} className="btn-primary h-10 py-0"><Plus size={14}/> New</button>
        </div>
      </div>

      {/* Table */}
      <div className="border-2 border-black bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-black text-white font-mono text-xs uppercase">
            <tr>
              <th className="text-left px-3 py-2">Name</th>
              <th className="text-left px-3 py-2">Slug</th>
              <th className="text-left px-3 py-2">Category</th>
              <th className="text-left px-3 py-2">Pricing</th>
              <th className="text-left px-3 py-2">Flags</th>
              <th className="text-left px-3 py-2">Views</th>
              <th className="text-right px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {view.map(t => (
              <tr key={t.slug} className="border-t border-black/20">
                <td className="px-3 py-2 font-display font-bold">{t.name}</td>
                <td className="px-3 py-2 font-mono text-xs">{t.slug}</td>
                <td className="px-3 py-2">{t.category}</td>
                <td className="px-3 py-2"><span className={`tag ${t.pricing}`}>{t.pricing}</span></td>
                <td className="px-3 py-2 space-x-1">
                  {t.featured && <span className="tag">FTR</span>}
                  {t.trending && <span className="tag" style={{background:'var(--signal)', color:'#fff', borderColor:'var(--signal)'}}>TRN</span>}
                  {t.new_launch && <span className="tag" style={{background:'#111', color:'#fff', borderColor:'#111'}}>NEW</span>}
                </td>
                <td className="px-3 py-2 font-mono">{t.view_count || 0}</td>
                <td className="px-3 py-2 text-right space-x-1">
                  <button data-testid={`tool-edit-${t.slug}`} onClick={()=>startEdit(t)} className="border border-black p-1.5 hover:bg-black hover:text-white"><Edit3 size={12}/></button>
                  <button data-testid={`tool-del-${t.slug}`} onClick={()=>del(t.slug)} className="border border-[var(--signal)] text-[var(--signal)] p-1.5 hover:bg-[var(--signal)] hover:text-white"><Trash2 size={12}/></button>
                </td>
              </tr>
            ))}
            {view.length === 0 && (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-[var(--text-muted)]">No tools found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="mt-4 flex items-center justify-end gap-2 font-mono text-xs">
          {Array.from({ length: pages }, (_, i) => (
            <button key={i} onClick={() => setPage(i+1)} className={`border-2 border-black w-8 h-8 ${page===i+1?'bg-black text-white':''}`}>{i+1}</button>
          ))}
        </div>
      )}

      {/* Drawer / Modal */}
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-end" onClick={()=>setOpen(false)}>
          <div className="w-full max-w-2xl bg-white h-full overflow-y-auto border-l-2 border-black" onClick={e=>e.stopPropagation()}>
            <div className="p-6 border-b-2 border-black flex items-center justify-between">
              <div>
                <div className="overline">{editing ? "Edit" : "Create"}</div>
                <div className="font-display font-black text-2xl tracking-tighter">{editing || "New Tool"}</div>
              </div>
              <button onClick={()=>setOpen(false)} className="border-2 border-black p-2"><X size={14}/></button>
            </div>
            <form onSubmit={submit} className="p-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Name"><input data-testid="form-name" required className="brutal" value={form.name} onChange={e=>upd("name", e.target.value)}/></Field>
                <Field label="Slug"><input data-testid="form-slug" required className="brutal" value={form.slug} onChange={e=>upd("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,"-"))} disabled={!!editing}/></Field>
              </div>
              <Field label="Tagline"><input required className="brutal" value={form.tagline} onChange={e=>upd("tagline", e.target.value)}/></Field>
              <Field label="Description"><textarea required className="brutal min-h-[100px]" value={form.description} onChange={e=>upd("description", e.target.value)}/></Field>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Primary Category">
                  <select className="brutal" value={form.category} onChange={e=>upd("category", e.target.value)}>
                    <option value="">—</option>
                    {cats.filter(c=>c.parent_slug).map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                  </select>
                </Field>
                <Field label="Pricing">
                  <select className="brutal" value={form.pricing} onChange={e=>upd("pricing", e.target.value)}>
                    <option>free</option><option>freemium</option><option>paid</option>
                  </select>
                </Field>
              </div>
              <Field label="URL"><input required className="brutal" value={form.url} onChange={e=>upd("url", e.target.value)}/></Field>
              <Field label="Logo URL (optional)"><input className="brutal" value={form.logo_url||""} onChange={e=>upd("logo_url", e.target.value)}/></Field>

              <div>
                <div className="overline mb-2">Associated Categories (multi)</div>
                <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto border border-black/20 p-2">
                  {cats.filter(c=>c.parent_slug).map(c => (
                    <button type="button" key={c.slug} onClick={()=>toggle("category_slugs", c.slug)}
                      className={`tag ${form.category_slugs.includes(c.slug)?'bg-black text-white border-black':''}`}>{c.name}</button>
                  ))}
                </div>
              </div>

              <Field label="Use Cases (one per line)"><textarea className="brutal min-h-[70px]" value={form.use_cases.join("\n")} onChange={e=>updList("use_cases", e.target.value)}/></Field>
              <Field label="Free Alternatives (one per line)"><textarea className="brutal min-h-[60px]" value={form.free_alternatives.join("\n")} onChange={e=>updList("free_alternatives", e.target.value)}/></Field>
              <Field label="Best Prompts (one per line)"><textarea className="brutal min-h-[80px]" value={form.best_prompts.join("\n")} onChange={e=>updList("best_prompts", e.target.value)}/></Field>
              <Field label="Start Here Workflow (3 steps, one per line)"><textarea className="brutal min-h-[80px]" value={form.start_here_workflow.join("\n")} onChange={e=>updList("start_here_workflow", e.target.value)}/></Field>
              <Field label={<span>Make Money Module (Title on line 1, body next lines, separate items with <code>---</code>)</span>}>
                <textarea className="brutal min-h-[100px] font-mono text-xs" value={moneyStr} onChange={e=>updMoney(e.target.value)}/>
              </Field>
              <Field label="IRL Use Cases (one per line)"><textarea className="brutal min-h-[60px]" value={form.irl_use_cases.join("\n")} onChange={e=>updList("irl_use_cases", e.target.value)}/></Field>
              <div className="grid sm:grid-cols-2 gap-3">
                <Field label="Pros (one per line)"><textarea className="brutal min-h-[60px]" value={form.pros.join("\n")} onChange={e=>updList("pros", e.target.value)}/></Field>
                <Field label="Cons (one per line)"><textarea className="brutal min-h-[60px]" value={form.cons.join("\n")} onChange={e=>updList("cons", e.target.value)}/></Field>
              </div>

              <div>
                <div className="overline mb-2">Best For (Professions)</div>
                <div className="flex flex-wrap gap-1.5">
                  {PROFS.map(p => (
                    <button type="button" key={p} onClick={()=>toggle("professions", p)}
                      className={`tag ${form.professions.includes(p)?'bg-black text-white border-black':''}`}>{p}</button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {["featured", "trending", "new_launch", "updated_recently"].map(k => (
                  <label key={k} className="flex items-center gap-2 font-mono text-xs uppercase tracking-wide">
                    <input type="checkbox" checked={form[k]} onChange={e=>upd(k, e.target.checked)}/> {k.replace("_", " ")}
                  </label>
                ))}
              </div>

              <div className="flex gap-3 pt-4 border-t border-black">
                <button data-testid="tool-submit" type="submit" className="btn-primary">{editing?"Update":"Create"} Tool</button>
                <button type="button" onClick={()=>setOpen(false)} className="btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="overline mb-1">{label}</div>
      {children}
    </label>
  );
}
