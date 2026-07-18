import { useEffect, useState } from 'react';
import { adminAPI } from '../api';
import { Shield } from 'lucide-react';

export default function Admin() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.users().then((r) => { setUsers(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const updateRole = async (userId: string, role: string) => {
    await adminAPI.updateRole(userId, role);
    setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role } : u));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><Shield className="w-6 h-6" /> Admin Panel</h1>
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
    </div>
  );
}
