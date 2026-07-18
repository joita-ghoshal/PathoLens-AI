import { useEffect, useState } from 'react';
import { speciesAPI } from '../api';
import { Link } from 'react-router-dom';
import { AlertTriangle, Search, Shield, Bug, Activity, ChevronLeft, ChevronRight } from 'lucide-react';

const SHAPE_OPTIONS = ['coccus', 'bacillus', 'spirochete', 'vibrio', 'coccobacillus', 'filamentous', 'pleomorphic'];
const RISK_OPTIONS = ['low', 'moderate', 'high', 'critical'];
const GRAM_OPTIONS = ['positive', 'negative', 'variable'];

export default function Pathogenic() {
  const [species, setSpecies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [gramFilter, setGramFilter] = useState('');
  const [shapeFilter, setShapeFilter] = useState('');
  const [riskFilter, setRiskFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>({});
  const [stats, setStats] = useState<any>(null);

  const load = () => {
    setLoading(true);
    const params: any = { page, per_page: 12, is_pathogenic: true };
    if (search) params.search = search;
    if (gramFilter) params.gram_stain = gramFilter;
    if (shapeFilter) params.shape = shapeFilter;
    if (riskFilter) params.risk_level = riskFilter;
    speciesAPI.list(params).then((r) => {
      setSpecies(r.data.data);
      setPagination(r.data.pagination);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  const loadStats = () => {
    speciesAPI.stats().then((r) => setStats(r.data)).catch(() => {});
  };

  useEffect(load, [page, gramFilter, shapeFilter, riskFilter]);
  useEffect(loadStats, []);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); load(); };

  const resetFilters = () => { setSearch(''); setGramFilter(''); setShapeFilter(''); setRiskFilter(''); setPage(1); };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <AlertTriangle className="w-6 h-6 text-red-500" /> Pathogenic Species
        </h1>
        <p className="text-slate-500 text-sm mt-1">Bacteria that cause disease — browse by risk, morphology, and mechanism</p>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                <Bug className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.pathogenic}</p>
                <p className="text-xs text-slate-500">Pathogenic</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center">
                <Activity className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.opportunistic}</p>
                <p className="text-xs text-slate-500">Opportunistic</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.by_risk?.critical || 0}</p>
                <p className="text-xs text-slate-500">Critical Risk</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-yellow-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stats.by_risk?.high || 0}</p>
                <p className="text-xs text-slate-500">High Risk</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-200 p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm" placeholder="Search pathogenic species..." />
          </div>
          <select value={gramFilter} onChange={(e) => { setGramFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
            <option value="">All Gram Types</option>
            {GRAM_OPTIONS.map(g => <option key={g} value={g}>Gram {g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
          </select>
          <select value={shapeFilter} onChange={(e) => { setShapeFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
            <option value="">All Shapes</option>
            {SHAPE_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
          <select value={riskFilter} onChange={(e) => { setRiskFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 border border-slate-300 rounded-lg text-sm">
            <option value="">All Risk Levels</option>
            {RISK_OPTIONS.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </select>
          <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">Search</button>
          <button type="button" onClick={resetFilters}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50">Reset</button>
        </form>
      </div>

      {/* Results count */}
      <div className="text-sm text-slate-500">
        {pagination.total ? `${pagination.total} pathogenic species found` : ''}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
        </div>
      ) : species.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p>No pathogenic species match your filters</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {species.map((s) => (
            <Link key={s.id} to={`/app/species/${s.id}`}
              className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-red-200 hover:shadow-lg hover:shadow-red-50 transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold italic text-slate-900 truncate group-hover:text-red-700 transition-colors">{s.scientific_name}</h3>
                  <p className="text-xs text-slate-500">{s.common_name}</p>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  s.risk_level === 'critical' ? 'bg-red-100 text-red-700' :
                  s.risk_level === 'high' ? 'bg-orange-100 text-orange-700' :
                  s.risk_level === 'moderate' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-slate-100 text-slate-700'
                }`}>{s.risk_level}</span>
              </div>
              <div className="space-y-1 text-xs text-slate-600">
                <p><span className="text-slate-400">Gram:</span> {s.gram_stain || 'N/A'}</p>
                <p><span className="text-slate-400">Shape:</span> {s.shape || 'N/A'}</p>
                <p><span className="text-slate-400">Oxygen:</span> {s.oxygen_requirement || 'N/A'}</p>
              </div>
              {s.description && (
                <p className="text-xs text-slate-500 mt-3 line-clamp-2">{s.description}</p>
              )}
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex gap-1">
                  {s.is_opportunistic && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-50 text-orange-600 font-medium">Opportunistic</span>}
                  {s.spore_formation && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-600 font-medium">Spore-forming</span>}
                </div>
                <span className="text-[10px] text-primary-600 font-medium group-hover:text-primary-700">View details →</span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="flex items-center gap-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-50">
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <span className="text-sm text-slate-600">Page {page} of {pagination.total_pages}</span>
          <button onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))} disabled={page >= pagination.total_pages}
            className="flex items-center gap-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-50">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
