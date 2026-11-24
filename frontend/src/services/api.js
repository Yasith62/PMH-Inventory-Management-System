import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pmh_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message = err.response?.data?.message || err.message || 'Request failed';
    if (err.response?.status === 401 && !err.config?.url?.includes('/auth/login')) {
      localStorage.removeItem('pmh_token');
      localStorage.removeItem('pmh_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(new Error(message));
  }
);

export const authApi = {
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  getUsers: () => api.get('/auth/users'),
  register: (data) => api.post('/auth/register', data),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
};

export const productApi = {
  getAll: (params) => api.get('/products', { params }),
  getOne: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  getLowStock: () => api.get('/products/low-stock'),
};

export const supplierApi = {
  getAll: () => api.get('/suppliers'),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
};

export const purchaseApi = {
  getAll: () => api.get('/purchases'),
  getOne: (id) => api.get(`/purchases/${id}`),
  create: (data) => api.post('/purchases', data),
};

export const saleApi = {
  getAll: () => api.get('/sales'),
  getOne: (id) => api.get(`/sales/${id}`),
  create: (data) => api.post('/sales', data),
};

export const dashboardApi = {
  getStats: () => api.get('/dashboard/stats'),
};

export const reportApi = {
  dailySales: (params) => api.get('/reports/daily-sales', { params }),
  monthlyRevenue: (params) => api.get('/reports/monthly-revenue', { params }),
  profit: (params) => api.get('/reports/profit', { params }),
};

export default api;
