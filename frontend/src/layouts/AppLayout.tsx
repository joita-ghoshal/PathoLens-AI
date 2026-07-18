import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Microscope, LayoutDashboard, FlaskConical, Dna, User, Shield, LogOut, History, Menu, X, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';

const navItems = [
  { to: '/app', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/app/analysis', icon: FlaskConical, label: 'New Analysis', end: true },
  { to: '/app/analysis/history', icon: History, label: 'History' },
  { to: '/app/species', icon: Dna, label: 'Species Database' },
  { to: '/app/profile', icon: User, label: 'Profile' },
];

function SidebarContent({ onNavigate }: { onNavigate: () => void }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-6 h-16 shrink-0 border-b border-slate-200">
        <Microscope className="w-7 h-7 text-primary-600" />
        <span className="text-lg font-bold text-slate-900">PathoLens</span>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label, end }) => (
          <NavLink key={to} to={to} end={end} onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`
            }>
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
        {user?.role === 'super_admin' && (
          <NavLink to="/app/admin" onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50'
              }`
            }>
            <Shield className="w-5 h-5" />
            Admin Panel
          </NavLink>
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

function ScrollToButton() {
  const [show, setShow] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const scrollRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = document.querySelector<HTMLElement>('main');
    if (!el) return;
    scrollRef.current = el;

    const handleScroll = () => {
      const threshold = 20;
      const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
      setIsAtBottom(atBottom);
      const hasOverflow = el.scrollHeight > el.clientHeight + 10;
      setShow(hasOverflow);
    };

    el.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => el.removeEventListener('scroll', handleScroll);
  }, []);

  const scroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: isAtBottom ? 0 : el.scrollHeight, behavior: 'smooth' });
  };

  if (!show) return null;

  return (
    <button
      onClick={scroll}
      className="fixed bottom-8 right-6 z-30 p-3 rounded-full bg-white/80 backdrop-blur-sm border border-slate-200 shadow-lg text-slate-600 hover:text-primary-600 hover:shadow-xl transition-all duration-200 hover:scale-110"
      title={isAtBottom ? 'Scroll to top' : 'Scroll to bottom'}
    >
      {isAtBottom ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
    </button>
  );
}

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const closeSidebar = () => setSidebarOpen(false);

  useEffect(() => { closeSidebar(); }, [location.pathname]);

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      <header className="h-16 shrink-0 bg-white border-b border-slate-200 flex items-center px-4 lg:px-6">
        <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-600 hover:text-slate-900">
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex-1" />
        <span className="text-xs text-slate-400">PathoLens AI v1.0</span>
      </header>

      <div className="flex flex-1 min-h-0">
        <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 bg-white border-r border-slate-200">
          <SidebarContent onNavigate={closeSidebar} />
        </aside>

        <main className="flex-1 min-w-0 min-h-0 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={closeSidebar} />
      )}

      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-end p-2">
          <button onClick={closeSidebar} className="p-2 text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <SidebarContent onNavigate={closeSidebar} />
      </aside>

      <ScrollToButton />
    </div>
  );
}
