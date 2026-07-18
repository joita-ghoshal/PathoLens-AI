import { useEffect, useState } from 'react';
import { analysisAPI } from '../api';
import { Link } from 'react-router-dom';
import { History, Trash2 } from 'lucide-react';

export default function AnalysisHistory() {
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    analysisAPI.history().then((r) => { setAnalyses(r.data); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(load, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this analysis?')) return;
    await analysisAPI.delete(id);
    setAnalyses((prev) => prev.filter((a) => a.id !== id));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><History className="w-6 h-6" /> Analysis History</h1>
        <p className="text-slate-500 text-sm mt-1">{analyses.length} analyses recorded</p>
      </div>
      {analyses.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
          <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 mb-4">No analyses yet</p>
          <Link to="/app/analysis" className="text-primary-600 text-sm font-medium hover:underline">Run your first analysis</Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Date</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Top Candidate</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Confidence</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Risk</th>
                <th className="text-left px-5 py-3 font-medium text-slate-600">Status</th>
                <th className="text-right px-5 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {analyses.map((a) => (
                <tr key={a.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-5 py-3 text-slate-600">{a.created_at}</td>
                  <td className="px-5 py-3 font-medium italic">{a.top_candidate || 'N/A'}</td>
                  <td className="px-5 py-3"><span className="font-medium text-primary-600">{a.confidence_score}%</span></td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      a.risk_level === 'critical' ? 'bg-red-100 text-red-700' :
                      a.risk_level === 'high' ? 'bg-orange-100 text-orange-700' :
                      'bg-green-100 text-green-700'
                    }`}>{a.risk_level}</span>
                  </td>
                  <td className="px-5 py-3 text-slate-500">{a.status}</td>
                  <td className="px-5 py-3 text-right">
                    <button onClick={() => handleDelete(a.id)} className="text-red-400 hover:text-red-600 ml-2">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
