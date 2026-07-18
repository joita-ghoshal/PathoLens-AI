import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useEffect, Suspense, lazy } from 'react';
import AppLayout from './layouts/AppLayout';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Analysis = lazy(() => import('./pages/Analysis'));
const AnalysisHistory = lazy(() => import('./pages/AnalysisHistory'));
const Species = lazy(() => import('./pages/Species'));
const SpeciesDetail = lazy(() => import('./pages/SpeciesDetail'));
const Pathogenic = lazy(() => import('./pages/Pathogenic'));
const Beneficial = lazy(() => import('./pages/Beneficial'));
const Profile = lazy(() => import('./pages/Profile'));
const Admin = lazy(() => import('./pages/Admin'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuthStore();
  if (loading) return <div className="flex items-center justify-center min-h-screen bg-slate-50"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;
  if (!token) return <Navigate to="/login" />;
  return <>{children}</>;
}

function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" />
    </div>
  );
}

export default function App() {
  const { fetchUser, token } = useAuthStore();
  useEffect(() => { if (token) fetchUser(); }, [token, fetchUser]);

  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/app" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<Dashboard />} />
            <Route path="analysis" element={<Analysis />} />
            <Route path="analysis/history" element={<AnalysisHistory />} />
            <Route path="species" element={<Species />} />
            <Route path="species/:id" element={<SpeciesDetail />} />
            <Route path="pathogenic" element={<Pathogenic />} />
            <Route path="beneficial" element={<Beneficial />} />
            <Route path="profile" element={<Profile />} />
            <Route path="admin" element={<Admin />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
