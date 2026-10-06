import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Intercepteur pour ajouter le token à chaque requête
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

// Auth
export const login = (credentials) => api.post('/admin/login', credentials);
export const logout = () => api.post('/admin/logout');
export const getUser = () => api.get('/admin/user');

// Dashboard
export const getDashboardStats = () => api.get('/dashboard');

// Teachers
export const getTeachers = () => api.get('/teachers');
export const getTeacher = (id) => api.get(`/teachers/${id}`);
export const createTeacher = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  return api.post('/teachers', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const updateTeacher = (id, data) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  formData.append('_method', 'PUT');
  return api.post(`/teachers/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const deleteTeacher = (id) => api.delete(`/teachers/${id}`);

// Pointage
export const lookupTeacher = (matricule) => api.post('/pointage/lookup', { matricule });
export const confirmPointage = (teacherId) => api.post('/pointage/confirm', { teacher_id: teacherId });
export const getTodayPointages = () => api.get('/pointages/today');
export const getPointages = (date) => api.get('/pointages', { params: { date } });

export default api;
