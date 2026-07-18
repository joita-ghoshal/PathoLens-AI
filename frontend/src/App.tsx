import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useEffect } from 'react';
import AppLayout from './layouts/AppLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Analysis from './pages/Analysis';
import AnalysisHistory from './pages/AnalysisHistory';
import Species from './pages/Species';
import SpeciesDetail from './pages/SpeciesDetail';
import Profile from './pages/Profile';
import Admin from './pages/Admin';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuthStore();
  if (loading) return <div className="flex items-center justify-center h-full"><div className="animate-spin w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full" /></div>;
  if (!token) return <Navigate to="/login" />;
  return <>{children}</>;
}

export default function App() {
  const { fetchUser, token } = useAuthStore();
  useEffect(() => { if (token) fetchUser(); }, [token, fetchUser]);

  return (
    <BrowserRouter>
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
          <Route path="profile" element={<Profile />} />
          <Route path="admin" element={<Admin />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
