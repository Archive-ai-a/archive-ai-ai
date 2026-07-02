import React from "react";
import { api } from "@/lib/api";
import { Users, Wrench, Layers, Package, TrendingUp, Eye } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, LineChart, Line } from "recharts";

export default function Dashboard() {
  const [data, setData] = React.useState(null);
  React.useEffect(() => { api.get("/admin/analytics").then(r => setData(r.data)); }, []);
  if (!data) return <div className="font-mono">Loading...</div>;

  const stats = [
    { label: "Total Users", val: data.totals.users, icon: Users },
    { label: "Total Tools", val: data.totals.tools, icon: Wrench },
    { label: "Categories", val: data.totals.categories, icon: Layers },
    { label: "Career Packs", val: data.totals.career_packs, icon: Package },
  ];

  const topTools = data.top_tools_all_time || [];

  return (
    <div data-testid="admin-dashboard">
      <div className="mb-8">
        <div className="overline">Overview</div>
        <h1 className="font-display font-black text-3xl sm:text-4xl tracking-tighter">Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} data-testid={`stat-${s.label.toLowerCase().replace(/ /g,'-')}`} className="brutal-card p-5">
            <div className="flex items-center justify-between">
              <s.icon size={18} className="text-[var(--signal)]"/>
              <span className="overline">Total</span>
            </div>
            <div className="font-display font-black text-4xl mt-3">{s.val}</div>
            <div className="text-xs text-[var(--text-muted)] mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <div className="brutal-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={16}/>
            <div className="overline">DAU / Events (Last 7 Days)</div>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={data.dau_series}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee"/>
                <XAxis dataKey="day" fontSize={10} stroke="#525252"/>
                <YAxis fontSize={10} stroke="#525252"/>
                <Tooltip contentStyle={{ border: "2px solid black", borderRadius: 0, fontFamily: "Space Mono" }}/>
                <Line type="monotone" dataKey="count" stroke="#FF3B30" strokeWidth={2} dot={{ fill: "#0A0A0A" }}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
          {data.dau_series.length === 0 && (
            <div className="text-center text-sm text-[var(--text-muted)] py-8">No activity events yet. Users viewing tools will show up here.</div>
          )}
        </div>

        <div className="brutal-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Eye size={16}/>
            <div className="overline">Most Viewed Tools (All-Time)</div>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={topTools} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eee"/>
                <XAxis type="number" fontSize={10} stroke="#525252"/>
                <YAxis type="category" dataKey="name" fontSize={10} width={80} stroke="#525252"/>
                <Tooltip contentStyle={{ border: "2px solid black", borderRadius: 0, fontFamily: "Space Mono" }}/>
                <Bar dataKey="view_count" fill="#0A0A0A"/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
