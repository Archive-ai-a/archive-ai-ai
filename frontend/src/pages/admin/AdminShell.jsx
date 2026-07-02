import React from "react";
import { NavLink, Route, Routes, useNavigate, Navigate } from "react-router-dom";
import { LayoutDashboard, Wrench, Layers, Package, Users, ShieldCheck, LogOut, Menu } from "lucide-react";
import { useAuth } from "@/lib/auth";
import Dashboard from "./Dashboard";
import ToolsManagement from "./ToolsManagement";
import CategoriesManagement from "./CategoriesManagement";
import CareerPacksManagement from "./CareerPacksManagement";
import UsersManagement from "./UsersManagement";
import AdminsManagement from "./AdminsManagement";

const LINKS = [
  { to: "/admin", label: "Dashboard", testid: "dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/tools", label: "Tools", testid: "tools", icon: Wrench },
  { to: "/admin/categories", label: "Categories", testid: "categories", icon: Layers },
  { to: "/admin/packs", label: "Career Packs", testid: "packs", icon: Package },
  { to: "/admin/users", label: "Users", testid: "users", icon: Users },
  { to: "/admin/admins", label: "Admins", testid: "admins", icon: ShieldCheck, superOnly: true },
];

export default function AdminShell() {
  const { user, checked, logout } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = React.useState(false);

  if (!checked) return <div className="p-12 font-mono">Loading...</div>;
  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return <Navigate to="/admin/login" replace />;
  }

  const doLogout = async () => { await logout(); nav("/admin/login"); };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[var(--bg)]">
      {/* Sidebar */}
      <aside className={`bg-[var(--text)] text-[var(--bg)] md:w-64 md:min-h-screen ${open?'block':'hidden'} md:block border-r-2 border-black`}>
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[var(--signal)] text-white flex items-center justify-center font-display font-black text-lg">A</div>
            <div>
              <div className="font-display font-black">ARCHIVE/AI</div>
              <div className="font-mono text-[10px] uppercase tracking-widest opacity-60">Admin Console</div>
            </div>
          </div>
        </div>
        <nav className="p-3 space-y-1">
          {LINKS.filter(l => !l.superOnly || user.role === "super_admin").map(l => (
            <NavLink key={l.to} to={l.to} end={l.end} data-testid={`admin-nav-${l.testid}`}
              className={({isActive}) => `flex items-center gap-3 px-3 py-2 font-mono text-xs uppercase tracking-widest ${isActive?'bg-[var(--signal)] text-white':'hover:bg-white/10'}`}>
              <l.icon size={16}/> {l.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <header className="border-b-2 border-black bg-[var(--bg)] px-4 md:px-8 h-14 flex items-center justify-between">
          <button className="md:hidden border-2 border-black p-1.5" onClick={() => setOpen(!open)}><Menu size={16}/></button>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="font-display font-bold text-sm">{user.name || user.email}</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-muted)]">{user.role}</div>
            </div>
            <div className="w-9 h-9 bg-black text-white flex items-center justify-center font-display font-black text-sm">
              {(user.name || user.email || "A")[0].toUpperCase()}
            </div>
            <button data-testid="admin-logout" onClick={doLogout} className="border-2 border-black p-2 hover:bg-black hover:text-white transition-colors">
              <LogOut size={14}/>
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 overflow-x-hidden">
          <Routes>
            <Route index element={<Dashboard/>}/>
            <Route path="tools" element={<ToolsManagement/>}/>
            <Route path="categories" element={<CategoriesManagement/>}/>
            <Route path="packs" element={<CareerPacksManagement/>}/>
            <Route path="users" element={<UsersManagement/>}/>
            <Route path="admins" element={<AdminsManagement/>}/>
            <Route path="*" element={<Navigate to="/admin" replace/>}/>
          </Routes>
        </main>
      </div>
    </div>
  );
}
