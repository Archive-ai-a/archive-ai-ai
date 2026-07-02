import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { LogIn, ArrowLeft } from "lucide-react";

export default function AdminLogin() {
  const { login, user, checked } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (checked && user && (user.role === "admin" || user.role === "super_admin")) nav("/admin");
  }, [checked, user, nav]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const u = await login(email.trim(), password);
      if (u.role !== "admin" && u.role !== "super_admin") {
        toast.error("This account has no admin access.");
      } else {
        toast.success(`Welcome, ${u.name}`);
        nav("/admin");
      }
    } catch (err) {
      const msg = err.response?.data?.detail || err.message;
      toast.error(typeof msg === "string" ? msg : "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col">
      <header className="border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-9 h-9 bg-black text-white flex items-center justify-center font-display font-black text-lg">A</div>
            <div className="font-display font-black text-lg tracking-tight">ARCHIVE/AI</div>
          </Link>
          <Link to="/" className="font-mono text-xs uppercase tracking-widest link-underline"><ArrowLeft size={12} className="inline mr-1"/> Back to Site</Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md brutal-shadow-lg border-2 border-black bg-white p-8" data-testid="admin-login-card">
          <div className="overline">Admin Console</div>
          <h1 className="font-display font-black text-4xl tracking-tighter mt-2">Sign in</h1>
          <p className="text-sm text-[var(--text-muted)] mt-2">Access restricted to Archive/AI admins.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <label className="block">
              <div className="overline mb-1">Email</div>
              <input data-testid="admin-login-email" type="email" required className="brutal" value={email} onChange={e=>setEmail(e.target.value)}/>
            </label>
            <label className="block">
              <div className="overline mb-1">Password</div>
              <input data-testid="admin-login-password" type="password" required className="brutal" value={password} onChange={e=>setPassword(e.target.value)}/>
            </label>
            <button data-testid="admin-login-submit" type="submit" disabled={loading} className="btn-primary w-full justify-center">
              <LogIn size={14}/> {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
