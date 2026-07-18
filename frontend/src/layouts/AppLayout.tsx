import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Microscope, LayoutDashboard, FlaskConical, Dna, User, Shield, LogOut, History, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

const navItems = [
  { to: '/app', exact: true, icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/app/analysis', exact: true, icon: FlaskConical, label: 'New Analysis' },
  { to: '/app/analysis/history', exact: true, icon: History, label: 'History' },
  { to: '/app/species', exact: false, icon: Dna, label: 'Species Database' },
  { to: '/app/profile', exact: true, icon: User, label: 'Profile' },
];

function isActive(to: string, exact: boolean, pathname: string): boolean {
  if (exact) return pathname === to;
  return pathname === to || pathname.startsWith(to + '/');
}

function SidebarContent({ onNavigate }: { onNavigate: () => void }) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-6 h-16 shrink-0 border-b border-slate-200">
        <Microscope className="w-7 h-7 text-primary-600" />
        <span className="text-lg font-bold text-slate-900">PathoLens</span>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map(({ to, exact, icon: Icon, label }) => {
          const active = isActive(to, exact, location.pathname);
          return (
            <Link key={to} to={to} onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}>
              <Icon className="w-5 h-5" />
              {label}
            </Link>
          );
        })}
        {user?.role === 'super_admin' && (
          <Link to="/app/admin" onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              location.pathname === '/app/admin' ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'
            }`}>
            <Shield className="w-5 h-5" />
            Admin Panel
          </Link>
        )}
      </nav>
      <div className="p-4 shrink-0 border-t border-slate-200">
        <div className="flex items-center gap-3 px-3 py-2 mb-2">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-sm font-bold">
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">{user?.username}</p>
            <p className="text-xs text-slate-500 truncate">{user?.role}</p>
          </div>
        </div>
        <button onClick={() => { logout(); navigate('/'); }}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors">
          <LogOut className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const closeSidebar = () => setSidebarOpen(false);

  useEffect(() => { closeSidebar(); }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={closeSidebar} />
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-end p-2">
          <button onClick={closeSidebar} className="p-2 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <SidebarContent onNavigate={closeSidebar} />
      </div>

      {/* Desktop sidebar - fixed, full height, scrolls independently */}
      <div className="hidden lg:block fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 overflow-y-auto">
        <SidebarContent onNavigate={closeSidebar} />
      </div>

      {/* Page content - normal document flow, scrolls naturally */}
      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 flex items-center px-4 lg:px-6">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-600 hover:text-slate-900">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <span className="text-xs text-slate-400">PathoLens AI v1.0</span>
        </header>
        <main className="p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
