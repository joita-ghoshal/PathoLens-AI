import { useEffect, useState } from 'react';
import { speciesAPI } from '../api';
import { Link } from 'react-router-dom';
import { Dna, Search } from 'lucide-react';

export default function Species() {
  const [species, setSpecies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [gramFilter, setGramFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>({});

  const load = () => {
    setLoading(true);
    const params: any = { page, per_page: 12 };
    if (search) params.search = search;
    if (gramFilter) params.gram_stain = gramFilter;
    speciesAPI.list(params).then((r) => { setSpecies(r.data.data); setPagination(r.data.pagination); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(load, [page, gramFilter]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); load(); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Dna className="w-6 h-6" /> Species Database</h1>
        <p className="text-slate-500 text-sm mt-1">Browse and search bacterial species</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[300px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm" placeholder="Search species..." />
          </div>
          <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm hover:bg-primary-700">Search</button>
        </form>
        <select value={gramFilter} onChange={(e) => { setGramFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
          <option value="">All Gram Types</option>
          <option value="positive">Gram Positive</option>
          <option value="negative">Gram Negative</option>
          <option value="variable">Variable</option>
        </select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {species.map((s) => (
            <Link key={s.id} to={`/app/species/${s.id}`}
              className="bg-white rounded-xl border border-slate-200 p-5 hover:border-primary-200 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold italic text-slate-900 truncate">{s.scientific_name}</h3>
                  <p className="text-xs text-slate-500">{s.common_name}</p>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  s.is_pathogenic ? 'bg-red-100 text-red-700' : s.is_beneficial ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                }`}>{s.is_pathogenic ? 'Pathogenic' : s.is_beneficial ? 'Beneficial' : 'Commensal'}</span>
              </div>
              <div className="space-y-1 text-xs text-slate-600">
                <p><span className="text-slate-400">Gram:</span> {s.gram_stain || 'N/A'}</p>
                <p><span className="text-slate-400">Shape:</span> {s.shape || 'N/A'}</p>
                <p><span className="text-slate-400">Risk:</span> <span className={`font-medium ${
                  s.risk_level === 'critical' ? 'text-red-600' : s.risk_level === 'high' ? 'text-orange-600' : 'text-slate-700'
                }`}>{s.risk_level}</span></p>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-50">Prev</button>
          <span className="text-sm text-slate-600">Page {page} of {pagination.total_pages}</span>
          <button onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))} disabled={page >= pagination.total_pages}
            className="px-3 py-1.5 text-sm border border-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-50">Next</button>
        </div>
      )}
    </div>
  );
}
