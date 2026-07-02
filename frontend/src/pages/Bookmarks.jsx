import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { Bookmark, Trash2 } from "lucide-react";
import ToolCard from "@/components/ToolCard";

export default function Bookmarks() {
  const { user, checked } = useAuth();
  const [tools, setTools] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(() => {
    api.get("/bookmarks").then(r => setTools(r.data)).catch(() => setTools([])).finally(() => setLoading(false));
  }, []);
  React.useEffect(() => { if (user) load(); else if (checked) setLoading(false); }, [user, checked, load]);

  const remove = async (slug) => {
    await api.delete(`/bookmarks/${slug}`);
    toast.success("Removed");
    load();
  };

  if (!checked) return <div className="max-w-7xl mx-auto px-6 py-12 font-mono">Loading...</div>;
  if (!user || user.role !== "user") {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center">
        <Bookmark size={48} className="mx-auto text-[var(--signal)]"/>
        <div className="font-display font-black text-3xl mt-4">Sign in to bookmark</div>
        <p className="text-[var(--text-muted)] mt-2">Save tools you love and build your personal AI stack.</p>
        <div className="flex gap-3 justify-center mt-6">
          <Link to="/login" className="btn-primary">Sign In</Link>
          <Link to="/register" className="btn-secondary">Create Account</Link>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="bookmarks-page" className="max-w-7xl mx-auto px-6 md:px-12 py-12">
      <div className="border-b-2 border-black pb-6 mb-8">
        <div className="overline">My Stack</div>
        <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tighter mt-2">Bookmarks</h1>
        <p className="text-[var(--text-muted)] mt-3">{tools.length} saved tool{tools.length===1?'':'s'}</p>
      </div>

      {loading ? (
        <div className="font-mono">Loading...</div>
      ) : tools.length === 0 ? (
        <div className="border-2 border-dashed border-black/40 p-12 text-center">
          <Bookmark size={40} className="mx-auto text-[var(--text-muted)]"/>
          <div className="font-display font-bold text-2xl mt-3">No bookmarks yet</div>
          <p className="text-[var(--text-muted)] mt-2">Browse the directory and click the bookmark icon on any tool.</p>
          <Link to="/tools" className="btn-primary mt-4 inline-flex">Browse Tools</Link>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {tools.map((t, i) => (
            <div key={t.slug} className="relative">
              <ToolCard tool={t} index={i}/>
              <button data-testid={`bm-remove-${t.slug}`} onClick={(e) => { e.preventDefault(); remove(t.slug); }}
                className="absolute top-3 right-3 bg-white border-2 border-black p-1.5 hover:bg-[var(--signal)] hover:text-white hover:border-[var(--signal)]" title="Remove">
                <Trash2 size={12}/>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
