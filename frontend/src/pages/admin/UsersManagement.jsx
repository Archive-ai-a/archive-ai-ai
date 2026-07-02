import React from "react";
import { api } from "@/lib/api";
import { Search } from "lucide-react";

export default function UsersManagement() {
  const [users, setUsers] = React.useState([]);
  const [q, setQ] = React.useState("");
  const [selected, setSelected] = React.useState(null);
  const [activity, setActivity] = React.useState([]);

  React.useEffect(() => { api.get("/admin/users").then(r => setUsers(r.data)); }, []);

  const filtered = users.filter(u => !q || u.email.toLowerCase().includes(q.toLowerCase()) || (u.name||"").toLowerCase().includes(q.toLowerCase()));

  const open = async (u) => {
    setSelected(u);
    const { data } = await api.get(`/admin/users/${u.id}`);
    setActivity(data.activity || []);
  };

  return (
    <div data-testid="admin-users">
      <div className="flex items-end justify-between mb-6 border-b-2 border-black pb-4 flex-wrap gap-3">
        <div>
          <div className="overline">Users</div>
          <h1 className="font-display font-black text-3xl tracking-tighter">Users ({users.length})</h1>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"/>
          <input className="brutal pl-9 h-10" placeholder="Search email or name..." value={q} onChange={e=>setQ(e.target.value)}/>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-6">
        <div className="border-2 border-black bg-white overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-black text-white font-mono text-xs uppercase">
              <tr>
                <th className="text-left px-3 py-2">Email</th>
                <th className="text-left px-3 py-2">Name</th>
                <th className="text-left px-3 py-2">Role</th>
                <th className="text-left px-3 py-2">Joined</th>
                <th className="text-left px-3 py-2">Last Login</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} onClick={()=>open(u)} className={`border-t border-black/20 cursor-pointer ${selected?.id===u.id?'bg-[var(--muted)]':''} hover:bg-[var(--muted)]`}>
                  <td className="px-3 py-2">{u.email}</td>
                  <td className="px-3 py-2">{u.name}</td>
                  <td className="px-3 py-2"><span className="tag">{u.role}</span></td>
                  <td className="px-3 py-2 font-mono text-xs">{(u.created_at||"").slice(0,10)}</td>
                  <td className="px-3 py-2 font-mono text-xs">{u.last_login_at ? u.last_login_at.slice(0,16).replace("T"," ") : "—"}</td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5} className="px-3 py-6 text-center text-[var(--text-muted)]">No users.</td></tr>}
            </tbody>
          </table>
        </div>

        <aside className="border-2 border-black bg-white p-5 min-h-[300px]">
          {!selected ? (
            <div className="text-sm text-[var(--text-muted)]">Click a user to see their activity.</div>
          ) : (
            <div>
              <div className="overline">User Activity</div>
              <div className="font-display font-bold text-xl mt-1">{selected.name}</div>
              <div className="font-mono text-xs text-[var(--text-muted)]">{selected.email}</div>
              <div className="mt-5 space-y-1 max-h-[500px] overflow-y-auto">
                {activity.length === 0 ? (
                  <div className="text-sm text-[var(--text-muted)] py-4">No activity recorded yet.</div>
                ) : activity.map((a, i) => (
                  <div key={i} className="border border-black/20 px-3 py-2 text-xs font-mono">
                    <span className="text-[var(--signal)]">{a.type}</span> {a.slug || ""} — <span className="opacity-60">{(a.ts||"").slice(0,16).replace("T"," ")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
