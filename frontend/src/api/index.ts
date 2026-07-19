import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
  register: (data: any) => api.post('/auth/register', data),
  me: () => api.get('/auth/me'),
};

export const speciesAPI = {
  list: (params?: any) => api.get('/species', { params }),
  detail: (id: number) => api.get(`/species/${id}`),
  stats: () => api.get('/species/stats'),
  create: (data: any) => api.post('/species', data),
  update: (id: number, data: any) => api.put(`/species/${id}`, data),
  delete: (id: number) => api.delete(`/species/${id}`),
};

export const analysisAPI = {
  analyze: (data: any) => api.post('/analysis/analyze', data),
  history: () => api.get('/analysis/history'),
  detail: (id: string) => api.get(`/analysis/${id}`),
  delete: (id: string) => api.delete(`/analysis/${id}`),
};

export const dashboardAPI = {
  overview: () => api.get('/dashboard/overview'),
};

export const diseasesAPI = {
  list: (params?: any) => api.get('/diseases', { params }),
};

export const symptomsAPI = {
  list: (params?: any) => api.get('/symptoms', { params }),
};

export const adminAPI = {
  users: () => api.get('/admin/users'),
  getUser: (id: string) => api.get(`/admin/users/${id}`),
  updateRole: (id: string, role: string) => api.put(`/admin/users/${id}/role`, { role }),
  updateUser: (id: string, data: any) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/admin/users/${id}`),
  toggleActivate: (id: string, is_active: boolean) => api.put(`/admin/users/${id}/activate`, { is_active }),
  changePassword: (id: string, password: string) => api.put(`/admin/users/${id}/password`, { password }),
  createUser: (data: any) => api.post('/admin/users', data),
};

export default api;
