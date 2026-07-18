import { useAuthStore } from '../store/authStore';
import { User } from 'lucide-react';

export default function Profile() {
  const { user } = useAuthStore();
  if (!user) return null;

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2"><User className="w-6 h-6" /> Profile</h1>
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-2xl font-bold">
            {user.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <h2 className="text-xl font-semibold">{user.first_name} {user.last_name}</h2>
            <p className="text-slate-500 text-sm">{user.email}</p>
          </div>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            ['Username', user.username],
            ['Role', user.role],
            ['Institution', user.institution || 'Not set'],
            ['Department', user.department || 'Not set'],
          ].map(([k, v]) => (
            <div key={k} className="p-3 rounded-lg bg-slate-50">
              <p className="text-xs text-slate-500">{k}</p>
              <p className="text-sm font-medium text-slate-900">{v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
