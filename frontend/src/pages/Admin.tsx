import { useEffect, useState } from 'react';
import { adminAPI, speciesAPI } from '../api';
import { Shield, Dna, Plus, Pencil, Trash2, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';

const SHAPE_OPTIONS = ['coccus', 'bacillus', 'spirochete', 'vibrio', 'coccobacillus', 'filamentous', 'pleomorphic'];
const GRAM_OPTIONS = ['positive', 'negative', 'variable'];
const OXYGEN_OPTIONS = ['aerobic', 'anaerobic', 'facultative anaerobic', 'microaerophilic', 'capnophilic'];
const RISK_OPTIONS = ['low', 'moderate', 'high', 'critical'];

const emptySpecies = {
  scientific_name: '', common_name: '', kingdom: 'Bacteria', phylum: '', class_name: '', order_name: '',
  family: '', genus: '', species: '', gram_stain: '', shape: '', size_micrometers: '',
  arrangement: '', oxygen_requirement: '', motility: '', spore_formation: false,
  growth_temperature_optimal: 37.0, habitat: '', culture_media: '', biosafety_level: 1,
  risk_level: 'low', is_beneficial: false, is_pathogenic: false, is_opportunistic: false, description: '',
};

type Tab = 'users' | 'species';

export default function Admin() {
  const [tab, setTab] = useState<Tab>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (tab === 'users') {
      setLoading(true);
      adminAPI.users().then((r) => { setUsers(r.data); setLoading(false); }).catch(() => setLoading(false));
    }
  }, [tab]);

  const updateRole = async (userId: string, role: string) => {
    await adminAPI.updateRole(userId, role);
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role } : u));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Shield className="w-6 h-6" /> Admin Panel</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-200">
        <button onClick={() => setTab('users')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
            tab === 'users' ? 'border-primary-600 text-primary-700' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}>Users</button>
        <button onClick={() => setTab('species')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            tab === 'species' ? 'border-primary-600 text-primary-700' : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}><Dna className="w-4 h-4" /> Species Management</button>
      </div>

      {tab === 'users' ? <UsersTab users={users} loading={loading} updateRole={updateRole} /> : <SpeciesTab />}
    </div>
  );
}

function UsersTab({ users, loading, updateRole }: { users: any[]; loading: boolean; updateRole: (id: string, role: string) => void }) {
  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 border-b border-slate-200">
          <tr>
            <th className="text-left px-5 py-3 font-medium text-slate-600">User</th>
            <th className="text-left px-5 py-3 font-medium text-slate-600">Email</th>
            <th className="text-left px-5 py-3 font-medium text-slate-600">Institution</th>
            <th className="text-left px-5 py-3 font-medium text-slate-600">Role</th>
            <th className="text-left px-5 py-3 font-medium text-slate-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="px-5 py-3 font-medium">{u.username}</td>
              <td className="px-5 py-3 text-slate-600">{u.email}</td>
              <td className="px-5 py-3 text-slate-600">{u.institution || '-'}</td>
              <td className="px-5 py-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  u.role === 'super_admin' ? 'bg-red-100 text-red-700' : u.role === 'researcher' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700'
                }`}>{u.role}</span>
              </td>
              <td className="px-5 py-3">
                <select value={u.role} onChange={(e) => updateRole(u.id, e.target.value)}
                  className="px-2 py-1 border border-slate-300 rounded text-xs">
                  <option value="student">Student</option>
                  <option value="researcher">Researcher</option>
                  <option value="clinician">Clinician</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function SpeciesTab() {
  const [species, setSpecies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<any>({ ...emptySpecies });
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const load = () => {
    setLoading(true);
    const params: any = { page, per_page: 15 };
    if (search) params.search = search;
    speciesAPI.list(params).then((r) => { setSpecies(r.data.data); setPagination(r.data.pagination); setLoading(false); }).catch(() => setLoading(false));
  };
  useEffect(load, [page]);

  const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); load(); };

  const openCreate = () => { setEditId(null); setForm({ ...emptySpecies }); setModalOpen(true); };
  const openEdit = (s: any) => {
    setEditId(s.id);
    speciesAPI.detail(s.id).then((r) => {
      const d = r.data;
      setForm({
        scientific_name: d.scientific_name || '', common_name: d.common_name || '', kingdom: d.kingdom || 'Bacteria',
        phylum: d.phylum || '', class_name: d.class_name || '', order_name: d.order_name || '', family: d.family || '',
        genus: d.genus || '', species: d.species || '', gram_stain: d.gram_stain || '', shape: d.shape || '',
        size_micrometers: d.size_micrometers || '', arrangement: d.arrangement || '', oxygen_requirement: d.oxygen_requirement || '',
        motility: d.motility || '', spore_formation: d.spore_formation || false, growth_temperature_optimal: d.growth_temperature_optimal || 37,
        habitat: d.habitat || '', culture_media: d.culture_media || '', biosafety_level: d.biosafety_level || 1,
        risk_level: d.risk_level || 'low', is_beneficial: d.is_beneficial || false, is_pathogenic: d.is_pathogenic || false,
        is_opportunistic: d.is_opportunistic || false, description: d.description || '',
      });
      setModalOpen(true);
    });
  };

  const handleSave = async () => {
    if (!form.scientific_name.trim()) return;
    setSaving(true);
    try {
      if (editId) {
        await speciesAPI.update(editId, form);
      } else {
        await speciesAPI.create(form);
      }
      setModalOpen(false);
      load();
    } catch (e: any) {
      alert(e.response?.data?.detail || 'Error saving species');
    }
    setSaving(false);
  };

  const handleDelete = async (id: number) => {
    await speciesAPI.delete(id);
    setDeleteConfirm(null);
    load();
  };

  const setField = (field: string, value: any) => setForm((prev: any) => ({ ...prev, [field]: value }));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 min-w-[300px]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm" placeholder="Search species..." />
          </div>
          <button type="submit" className="px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700">Search</button>
        </form>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
          <Plus className="w-4 h-4" /> Add Species
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-48"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Scientific Name</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Common Name</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Gram</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Shape</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Risk</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Type</th>
                <th className="text-right px-4 py-3 font-medium text-slate-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {species.map((s) => (
                <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium italic">{s.scientific_name}</td>
                  <td className="px-4 py-3 text-slate-600">{s.common_name}</td>
                  <td className="px-4 py-3 text-slate-600">{s.gram_stain || '-'}</td>
                  <td className="px-4 py-3 text-slate-600">{s.shape || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-medium ${
                      s.risk_level === 'critical' ? 'text-red-600' : s.risk_level === 'high' ? 'text-orange-600' : 'text-slate-600'
                    }`}>{s.risk_level}</span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {s.is_pathogenic && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">Pathogenic</span>}
                      {s.is_beneficial && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-100 text-green-700">Beneficial</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(s)} className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      {deleteConfirm === s.id ? (
                        <div className="flex items-center gap-1">
                          <button onClick={() => handleDelete(s.id)} className="text-[10px] px-2 py-1 bg-red-600 text-white rounded font-medium">Delete</button>
                          <button onClick={() => setDeleteConfirm(null)} className="text-[10px] px-2 py-1 border border-slate-300 rounded font-medium">Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(s.id)} className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="flex items-center gap-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-50">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-slate-600">Page {page} of {pagination.total_pages}</span>
          <button onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))} disabled={page >= pagination.total_pages}
            className="flex items-center gap-1 px-3 py-1.5 text-sm border border-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-50">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-16 px-4 overflow-y-auto pb-8">
          <div className="bg-white rounded-2xl w-full max-w-3xl shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900">{editId ? 'Edit Species' : 'Add New Species'}</h2>
              <button onClick={() => setModalOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-4 max-h-[70vh] overflow-y-auto space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Scientific Name *" value={form.scientific_name} onChange={(v) => setField('scientific_name', v)} required />
                <Field label="Common Name" value={form.common_name} onChange={(v) => setField('common_name', v)} />
                <SelectField label="Gram Stain" value={form.gram_stain} onChange={(v) => setField('gram_stain', v)} options={GRAM_OPTIONS} />
                <SelectField label="Shape" value={form.shape} onChange={(v) => setField('shape', v)} options={SHAPE_OPTIONS} />
                <SelectField label="Oxygen Requirement" value={form.oxygen_requirement} onChange={(v) => setField('oxygen_requirement', v)} options={OXYGEN_OPTIONS} />
                <SelectField label="Risk Level" value={form.risk_level} onChange={(v) => setField('risk_level', v)} options={RISK_OPTIONS} />
                <Field label="Size (μm)" value={form.size_micrometers} onChange={(v) => setField('size_micrometers', v)} />
                <Field label="Arrangement" value={form.arrangement} onChange={(v) => setField('arrangement', v)} />
                <Field label="Motility" value={form.motility} onChange={(v) => setField('motility', v)} />
                <Field label="Optimal Temp (°C)" value={form.growth_temperature_optimal} onChange={(v) => setField('growth_temperature_optimal', Number(v))} type="number" />
                <Field label="Biosafety Level" value={form.biosafety_level} onChange={(v) => setField('biosafety_level', Number(v))} type="number" />
                <Field label="Habitat" value={form.habitat} onChange={(v) => setField('habitat', v)} />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Kingdom" value={form.kingdom} onChange={(v) => setField('kingdom', v)} />
                <Field label="Phylum" value={form.phylum} onChange={(v) => setField('phylum', v)} />
                <Field label="Class" value={form.class_name} onChange={(v) => setField('class_name', v)} />
                <Field label="Order" value={form.order_name} onChange={(v) => setField('order_name', v)} />
                <Field label="Family" value={form.family} onChange={(v) => setField('family', v)} />
                <Field label="Genus" value={form.genus} onChange={(v) => setField('genus', v)} />
              </div>
              <Field label="Culture Media" value={form.culture_media} onChange={(v) => setField('culture_media', v)} />
              <div>
                <label className="text-xs text-slate-500 mb-1 block">Description</label>
                <textarea value={form.description} onChange={(e) => setField('description', e.target.value)} rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
              </div>
              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={form.is_pathogenic} onChange={(e) => setField('is_pathogenic', e.target.checked)} className="rounded border-slate-300" />
                  Pathogenic
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={form.is_beneficial} onChange={(e) => setField('is_beneficial', e.target.checked)} className="rounded border-slate-300" />
                  Beneficial
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={form.is_opportunistic} onChange={(e) => setField('is_opportunistic', e.target.checked)} className="rounded border-slate-300" />
                  Opportunistic
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <input type="checkbox" checked={form.spore_formation} onChange={(e) => setField('spore_formation', e.target.checked)} className="rounded border-slate-300" />
                  Spore-forming
                </label>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button onClick={handleSave} disabled={saving || !form.scientific_name.trim()}
                className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50">
                {saving ? 'Saving...' : editId ? 'Update Species' : 'Create Species'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, type = 'text', required = false }: { label: string; value: any; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-xs text-slate-500 mb-1 block">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="text-xs text-slate-500 mb-1 block">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm">
        <option value="">Select...</option>
        {options.map(o => <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>)}
      </select>
    </div>
  );
}
