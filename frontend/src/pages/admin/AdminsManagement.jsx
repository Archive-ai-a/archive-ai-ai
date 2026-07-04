import React from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { apiErrorToast } from "@/lib/apiErrorToast";
import { useAuth } from "@/lib/auth";
import { Plus, Trash2, KeyRound } from "lucide-react";
import { Field, AdminPageHeader, Modal } from "@/components/admin";

export default function AdminsManagement() {
  const { user } = useAuth();
  const [admins, setAdmins] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ email: "", password: "", name: "", role: "admin" });
  const [resetOpen, setResetOpen] = React.useState(null);
  const [resetPwd, setResetPwd] = React.useState("");

  const load = () => api.get("/admin/admins").then(r => setAdmins(r.data));
  React.useEffect(() => { load(); }, []);

  const create = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/admins", form);
      toast.success("Admin created");
      setOpen(false);
      setForm({ email: "", password: "", name: "", role: "admin" });
      load();
    } catch (e) { apiErrorToast(e); }
  };

  const doReset = async (email) => {
    if (!resetPwd) return;
    try {
      await api.post("/admin/admins/reset-password", { email, new_password: resetPwd });
      toast.success("Password reset");
      setResetOpen(null); setResetPwd("");
    } catch (e) { apiErrorToast(e); }
  };

  const del = async (a) => {
    if (!window.confirm(`Delete admin ${a.email}?`)) return;
    try {
      await api.delete(`/admin/admins/${a.id}`);
      toast.success("Deleted"); load();
    } catch (e) { apiErrorToast(e); }
  };

  return (
    <div data-testid="admin-admins">
      <AdminPageHeader overline="Access" title="Admin Management">
        {user?.role === "super_admin" && (
          <button data-testid="admin-invite-btn" onClick={()=>setOpen(true)} className="btn-primary"><Plus size={14}/> Invite Admin</button>
        )}
      </AdminPageHeader>
      <p className="text-sm text-[var(--text-muted)] -mt-4 mb-6">Only super admins can invite or delete admins.</p>

      <div className="border-2 border-black bg-white overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-black text-white font-mono text-xs uppercase">
            <tr>
              <th className="text-left px-3 py-2">Email</th>
              <th className="text-left px-3 py-2">Name</th>
              <th className="text-left px-3 py-2">Role</th>
              <th className="text-left px-3 py-2">Joined</th>
              <th className="text-right px-3 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map(a => (
              <tr key={a.id} className="border-t border-black/20">
                <td className="px-3 py-2">{a.email}</td>
                <td className="px-3 py-2">{a.name}</td>
                <td className="px-3 py-2"><span className={`tag`} style={a.role==='super_admin'?{background:'#111',color:'#fff',borderColor:'#111'}:{}}>{a.role}</span></td>
                <td className="px-3 py-2 font-mono text-xs">{(a.created_at||"").slice(0,10)}</td>
                <td className="px-3 py-2 text-right space-x-1">
                  <button data-testid={`admin-reset-${a.id}`} onClick={()=>setResetOpen(a.email)} className="border border-black p-1.5 hover:bg-black hover:text-white"><KeyRound size={12}/></button>
                  {user?.role === "super_admin" && user?.id !== a.id && (
                    <button data-testid={`admin-del-${a.id}`} onClick={()=>del(a)} className="border border-[var(--signal)] text-[var(--signal)] p-1.5 hover:bg-[var(--signal)] hover:text-white"><Trash2 size={12}/></button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invite modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Invite Admin">
        <form onSubmit={create} className="p-5 space-y-3">
          <Field label="Email"><input data-testid="invite-email" required type="email" className="brutal" value={form.email} onChange={e=>setForm({...form, email: e.target.value})}/></Field>
          <Field label="Name"><input data-testid="invite-name" className="brutal" value={form.name} onChange={e=>setForm({...form, name: e.target.value})}/></Field>
          <Field label="Temporary Password"><input data-testid="invite-password" required className="brutal" value={form.password} onChange={e=>setForm({...form, password: e.target.value})}/></Field>
          <Field label="Role">
            <select data-testid="invite-role" className="brutal" value={form.role} onChange={e=>setForm({...form, role: e.target.value})}>
              <option value="admin">admin</option>
              <option value="super_admin">super_admin</option>
            </select>
          </Field>
          <div className="pt-3 border-t border-black flex gap-2">
            <button type="submit" data-testid="invite-submit" className="btn-primary">Create</button>
            <button type="button" onClick={()=>setOpen(false)} className="btn-secondary">Cancel</button>
          </div>
        </form>
      </Modal>

      {/* Reset modal */}
      <Modal open={!!resetOpen} onClose={() => setResetOpen(null)} title="Reset Password">
        <div className="p-5 space-y-3">
          <div className="font-mono text-xs">{resetOpen}</div>
          <input data-testid="reset-new-password" className="brutal" placeholder="New password" value={resetPwd} onChange={e=>setResetPwd(e.target.value)}/>
          <div className="pt-3 border-t border-black flex gap-2">
            <button data-testid="reset-submit" onClick={()=>doReset(resetOpen)} className="btn-primary">Reset</button>
            <button onClick={()=>setResetOpen(null)} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
