import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, Menu, X, ChevronDown, Bookmark, LogOut, User } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import ChatWidget from "@/components/ChatWidget";

const NAV = [
  { to: "/tools", label: "AI Tools" },
  { to: "/categories", label: "Categories" },
  { to: "/packs", label: "Career Packs" },
  { to: "/compare", label: "Compare" },
  { to: "/money", label: "Make Money" },
  { to: "/roadmap", label: "Roadmap" },
];

export default function Layout({ children }) {
  const [open, setOpen] = React.useState(false);
  const [faq, setFaq] = React.useState([]);
  const { user, logout } = useAuth();
  const loc = useLocation();
  React.useEffect(() => { setOpen(false); }, [loc.pathname]);
  React.useEffect(() => { api.get("/faq").then(r => setFaq(r.data)).catch(() => {}); }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 bg-[var(--bg)]/95 backdrop-blur border-b-2 border-black">
        <div className="max-w-7xl mx-auto px-6 md:px-12 h-16 flex items-center justify-between">
          <Link to="/" data-testid="nav-logo" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-black text-white flex items-center justify-center font-display font-black text-lg group-hover:bg-[var(--signal)] transition-colors">A</div>
            <div className="font-display font-black text-lg tracking-tight">ARCHIVE/AI</div>
          </Link>
          <nav className="hidden lg:flex items-center gap-6">
            {NAV.map(n => (
              <Link key={n.to} to={n.to}
                data-testid={`nav-${n.label.toLowerCase().replace(/ /g,'-')}`}
                className={`font-mono text-[11px] uppercase tracking-widest link-underline ${loc.pathname.startsWith(n.to)?'text-[var(--signal)]':''}`}>
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/tools" data-testid="nav-search-btn" className="hidden md:inline-flex items-center gap-2 border-2 border-black px-3 py-1.5 font-mono text-xs uppercase tracking-wider hover:bg-black hover:text-white transition-colors">
              <Search size={14}/> Search
            </Link>
            {user && user.role === "user" ? (
              <>
                <Link to="/bookmarks" data-testid="nav-bookmarks" className="hidden md:inline-flex items-center gap-2 border-2 border-black px-3 py-1.5 font-mono text-xs uppercase tracking-wider hover:bg-black hover:text-white">
                  <Bookmark size={14}/> Saved
                </Link>
                <button data-testid="nav-logout" onClick={logout} className="hidden md:inline-flex border-2 border-black p-2 hover:bg-[var(--signal)] hover:text-white hover:border-[var(--signal)]" title={user.name}>
                  <LogOut size={14}/>
                </button>
              </>
            ) : (
              <Link to="/login" data-testid="nav-signin" className="hidden md:inline-flex items-center gap-2 border-2 border-black px-3 py-1.5 font-mono text-xs uppercase tracking-wider hover:bg-black hover:text-white">
                <User size={14}/> Sign In
              </Link>
            )}
            <button data-testid="nav-mobile-toggle" className="lg:hidden border-2 border-black p-2" onClick={() => setOpen(!open)}>
              {open ? <X size={18}/> : <Menu size={18}/>}
            </button>
          </div>
        </div>
        {open && (
          <div className="lg:hidden border-t-2 border-black bg-white">
            <div className="px-6 py-4 flex flex-col gap-3">
              {NAV.map(n => (
                <Link key={n.to} to={n.to} className="font-mono text-sm uppercase tracking-widest">{n.label}</Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">
        {children}
      </main>

      {/* FAQ */}
      <section className="bg-white border-t-2 border-black">
        <div className="max-w-5xl mx-auto px-6 md:px-12 py-20">
          <div className="overline">FAQ / Common Questions</div>
          <h2 className="font-display font-black text-3xl sm:text-5xl tracking-tighter mt-2">Everything you&apos;ll ask.</h2>
          <div className="mt-8 divide-y-2 divide-black border-y-2 border-black">
            {faq.map((f, i) => (
              <FaqItem key={i} q={f.q} a={f.a} index={i} />
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t-2 border-black bg-[var(--text)] text-[var(--bg)]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-12 grid md:grid-cols-3 gap-8">
          <div>
            <div className="font-display font-black text-2xl">ARCHIVE/AI</div>
            <p className="font-mono text-xs uppercase tracking-widest mt-2 opacity-60">The Index of AI Tools</p>
          </div>
          <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-6 text-sm">
            <div>
              <div className="overline opacity-60 mb-2">Browse</div>
              <Link to="/tools" className="block py-1 link-underline">Directory</Link>
              <Link to="/categories" className="block py-1 link-underline">Categories</Link>
              <Link to="/prompts" className="block py-1 link-underline">Workflows</Link>
            </div>
            <div>
              <div className="overline opacity-60 mb-2">Guides</div>
              <Link to="/packs" className="block py-1 link-underline">Career Packs</Link>
              <Link to="/money" className="block py-1 link-underline">Make Money</Link>
              <Link to="/roadmap" className="block py-1 link-underline">Roadmap</Link>
            </div>
            <div>
              <div className="overline opacity-60 mb-2">Admin</div>
              <Link to="/admin/login" className="block py-1 link-underline">Admin Login</Link>
            </div>
            <div>
              <div className="overline opacity-60 mb-2">Built by</div>
              <div className="py-1">Palak × Archive</div>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 px-6 md:px-12 py-4 font-mono text-xs uppercase tracking-widest opacity-60 max-w-7xl mx-auto">
          © {new Date().getFullYear()} ARCHIVE/AI — All tools © their respective owners.
        </div>
      </footer>

      <ChatWidget />
    </div>
  );
}

function FaqItem({ q, a, index }) {
  const [open, setOpen] = React.useState(false);
  return (
    <button
      onClick={() => setOpen(!open)}
      data-testid={`faq-${index}`}
      className="w-full text-left py-5 group"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className="font-mono text-sm text-[var(--text-muted)]">Q{String(index+1).padStart(2, "0")}</span>
          <span className="font-display font-bold text-xl leading-tight">{q}</span>
        </div>
        <ChevronDown size={20} className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}/>
      </div>
      {open && (
        <div className="mt-3 pl-10 text-[var(--text-muted)] leading-relaxed">{a}</div>
      )}
    </button>
  );
}
