import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { UserPlus, LogIn } from "lucide-react";

export default function AuthPage({ mode }) {
  const { login, register, user, checked } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [name, setName] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const isRegister = mode === "register";

  React.useEffect(() => {
    if (checked && user && user.role === "user") nav("/bookmarks");
  }, [checked, user, nav]);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let signedIn;
      if (isRegister) {
        signedIn = await register(email.trim(), password, name);
        toast.success("Account created");
      } else {
        signedIn = await login(email.trim(), password);
        toast.success("Signed in");
      }
      // Route admins to admin console, everyone else to bookmarks
      if (signedIn?.role === "admin" || signedIn?.role === "super_admin") {
        nav("/admin");
      } else {
        nav("/bookmarks");
      }
    } catch (err) {
      const d = err.response?.data?.detail || err.message;
      toast.error(typeof d === "string" ? d : "Failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-md mx-auto px-6 py-16">
      <div className="brutal-shadow-lg border-2 border-black bg-white p-8" data-testid={isRegister ? "register-card" : "login-card"}>
        <div className="overline">{isRegister ? "Create Account" : "Welcome Back"}</div>
        <h1 className="font-display font-black text-4xl tracking-tighter mt-2">{isRegister ? "Sign Up" : "Sign In"}</h1>
        <p className="text-sm text-[var(--text-muted)] mt-2">Save tools you love, build custom stacks, and get personalized recommendations.</p>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {isRegister && (
            <label className="block">
              <div className="overline mb-1">Name</div>
              <input data-testid="auth-name" className="brutal" value={name} onChange={e => setName(e.target.value)}/>
            </label>
          )}
          <label className="block">
            <div className="overline mb-1">Email</div>
            <input data-testid="auth-email" required type="email" className="brutal" value={email} onChange={e => setEmail(e.target.value)}/>
          </label>
          <label className="block">
            <div className="overline mb-1">Password</div>
            <input data-testid="auth-password" required type="password" minLength={6} className="brutal" value={password} onChange={e => setPassword(e.target.value)}/>
          </label>
          <button data-testid="auth-submit" type="submit" disabled={loading} className="btn-primary w-full justify-center">
            {isRegister ? <UserPlus size={14}/> : <LogIn size={14}/>}
            {loading ? "Working..." : (isRegister ? "Create Account" : "Sign In")}
          </button>
        </form>

        <div className="mt-6 text-center text-sm font-mono">
          {isRegister ? (
            <>Have an account? <Link to="/login" className="link-underline text-[var(--signal)]">Sign In</Link></>
          ) : (
            <>New here? <Link to="/register" className="link-underline text-[var(--signal)]">Create Account</Link></>
          )}
        </div>
      </div>
    </div>
  );
}
