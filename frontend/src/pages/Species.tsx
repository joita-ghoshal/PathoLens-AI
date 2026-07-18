import { useEffect, useState } from 'react';
import { speciesAPI } from '../api';
import { Link } from 'react-router-dom';
import { Dna, Search, ChevronLeft, ChevronRight, Filter, X } from 'lucide-react';

const SHAPE_OPTIONS = ['coccus', 'bacillus', 'spirochete', 'vibrio', 'coccobacillus', 'filamentous', 'pleomorphic'];
const GRAM_OPTIONS = ['positive', 'negative', 'variable'];
const OXYGEN_OPTIONS = ['aerobic', 'anaerobic', 'facultative anaerobic', 'microaerophilic', 'capnophilic'];
const RISK_OPTIONS = ['low', 'moderate', 'high', 'critical'];

export default function Species() {
  const [species, setSpecies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [gramFilter, setGramFilter] = useState('');
  const [shapeFilter, setShapeFilter] = useState('');
  const [oxygenFilter, setOxygenFilter] = useState('');
  const [sporeFilter, setSporeFilter] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>({});
  const [showFilters, setShowFilters] = useState(false);

  const load = () => {
    setLoading(true);
    const params: any = { page, per_page: 12 };
    if (search) params.search = search;
    if (gramFilter) params.gram_stain = gramFilter;
    if (shapeFilter) params.shape = shapeFilter;
    if (oxygenFilter) params.oxygen_requirement = oxygenFilter;
    if (sporeFilter) params.spore_formation = sporeFilter === 'true';
    if (riskFilter) params.risk_level = riskFilter;
    speciesAPI.list(params).then((r) => { setSpecies(r.data.data); setPagination(r.data.pagination); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(load, [page, gramFilter, shapeFilter, oxygenFilter, sporeFilter, riskFilter]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); load(); };
  const resetFilters = () => { setSearch(''); setGramFilter(''); setShapeFilter(''); setOxygenFilter(''); setSporeFilter(''); setRiskFilter(''); setPage(1); };
  const activeFilterCount = [gramFilter, shapeFilter, oxygenFilter, sporeFilter, riskFilter].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Dna className="w-6 h-6" /> Species Database</h1>
          <p className="text-slate-500 text-sm mt-1">Browse and search all bacterial species</p>
        </div>
        <div className="flex gap-2">
          <Link to="/app/pathogenic" className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">Pathogenic</Link>
          <Link to="/app/beneficial" className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">Beneficial</Link>
        </div>
      </div>

      {/* Search & Filter Toggle */}
      <div className="flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[300px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm" placeholder="Search species..." />
          </div>
          <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">Search</button>
        </form>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showFilters ? 'bg-primary-100 text-primary-700' : 'border border-slate-300 text-slate-600 hover:bg-slate-50'
          }`}>
          <Filter className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 rounded-full bg-primary-600 text-white text-[10px] flex items-center justify-center">{activeFilterCount}</span>
          )}
        </button>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-slate-200 p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">Advanced Filters</h3>
            {activeFilterCount > 0 && (
              <button onClick={resetFilters} className="text-xs text-primary-600 hover:underline flex items-center gap-1">
                <X className="w-3 h-3" /> Clear all
              </button>
            )}
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Gram Stain</label>
              <select value={gramFilter} onChange={(e) => { setGramFilter(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                <option value="">All</option>
                {GRAM_OPTIONS.map(g => <option key={g} value={g}>Gram {g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Shape</label>
              <select value={shapeFilter} onChange={(e) => { setShapeFilter(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                <option value="">All</option>
                {SHAPE_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Oxygen Requirement</label>
              <select value={oxygenFilter} onChange={(e) => { setOxygenFilter(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                <option value="">All</option>
                {OXYGEN_OPTIONS.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Spore Formation</label>
              <select value={sporeFilter} onChange={(e) => { setSporeFilter(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                <option value="">All</option>
                <option value="true">Spore-forming</option>
                <option value="false">Non-spore-forming</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Risk Level</label>
              <select value={riskFilter} onChange={(e) => { setRiskFilter(e.target.value); setPage(1); }}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
                <option value="">All</option>
                {RISK_OPTIONS.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="text-sm text-slate-500">
        {pagination.total ? `${pagination.total} species found` : ''}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>
      ) : species.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          <Dna className="w-12 h-12 mx-auto mb-3 text-slate-300" />
          <p>No species match your filters</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {species.map((s) => (
            <Link key={s.id} to={`/app/species/${s.id}`}
              className="group bg-white rounded-xl border border-slate-200 p-5 hover:border-primary-200 hover:shadow-lg hover:shadow-primary-50 transition-all duration-200">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold italic text-slate-900 truncate group-hover:text-primary-700 transition-colors">{s.scientific_name}</h3>
                  <p className="text-xs text-slate-500">{s.common_name}</p>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  s.is_pathogenic ? 'bg-red-100 text-red-700' : s.is_beneficial ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-700'
                }`}>{s.is_pathogenic ? 'Pathogenic' : s.is_beneficial ? 'Beneficial' : 'Commensal'}</span>
              </div>
              <div className="space-y-1 text-xs text-slate-600">
                <p><span className="text-slate-400">Gram:</span> {s.gram_stain || 'N/A'}</p>
                <p><span className="text-slate-400">Shape:</span> {s.shape || 'N/A'}</p>
                <p><span className="text-slate-400">Oxygen:</span> {s.oxygen_requirement || 'N/A'}</p>
                <p><span className="text-slate-400">Risk:</span> <span className={`font-medium ${
                  s.risk_level === 'critical' ? 'text-red-600' : s.risk_level === 'high' ? 'text-orange-600' : 'text-slate-700'
                }`}>{s.risk_level}</span></p>
              </div>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div className="flex gap-1">
                  {s.spore_formation && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-50 text-purple-600 font-medium">Spore+</span>}
                  {s.is_opportunistic && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-orange-50 text-orange-600 font-medium">Opportunistic</span>}
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
