import { useEffect, useState } from 'react';
import { dashboardAPI } from '../api';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { FlaskConical, Dna, Activity, ArrowRight, AlertTriangle } from 'lucide-react';

const COLORS = ['#3b82f6', '#22c55e', '#eab308', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899'];

export default function Dashboard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardAPI.overview().then((r) => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;
  if (!data) return <div className="text-center text-slate-500 py-12">Failed to load dashboard</div>;

  const statCards = [
    { icon: Dna, label: 'Total Species', value: data.total_species, color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: AlertTriangle, label: 'Pathogenic', value: data.pathogenic_count, color: 'text-red-600', bg: 'bg-red-50' },
    { icon: Activity, label: 'Beneficial', value: data.beneficial_count, color: 'text-green-600', bg: 'bg-green-50' },
    { icon: FlaskConical, label: 'Analyses Run', value: data.total_analyses, color: 'text-purple-600', bg: 'bg-purple-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">PathoLens AI overview and analytics</p>
        </div>
        <Link to="/app/analysis" className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
          <FlaskConical className="w-4 h-4" /> New Analysis
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ icon: Icon, label, value, color, bg }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 p-5">
            <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-900">{value}</p>
            <p className="text-sm text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Gram Stain Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.gram_distribution}>
              <XAxis dataKey="gram_stain" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Risk Level Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={data.risk_distribution} dataKey="count" nameKey="risk_level" cx="50%" cy="50%" outerRadius={90} label={({ name, value }: any) => `${name}: ${value}`}>
                {data.risk_distribution.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Diseases & Recent */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Top Disease Categories</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={data.top_diseases} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 12 }} />
              <YAxis dataKey="name" type="category" width={140} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="species_count" fill="#22c55e" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">Recent Analyses</h3>
            <Link to="/app/analysis/history" className="text-xs text-primary-600 hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {data.recent_analyses.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">No analyses yet. Run your first one!</p>
          ) : (
            <div className="space-y-3">
              {data.recent_analyses.slice(0, 5).map((a: any) => (
                <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
                  <div className={`w-2 h-2 rounded-full ${a.risk_level === 'critical' ? 'bg-red-500' : a.risk_level === 'high' ? 'bg-orange-500' : 'bg-green-500'}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{a.top_candidate || 'Pending'}</p>
                    <p className="text-xs text-slate-500">{a.created_at}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${a.risk_level === 'critical' ? 'bg-red-100 text-red-700' : a.risk_level === 'high' ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                    {a.confidence_score}%
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
