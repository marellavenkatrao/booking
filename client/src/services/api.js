import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to add JWT token & active role
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('nec_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    const userStr = localStorage.getItem('nec_user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u && u.role) {
          config.headers['x-active-role'] = u.role;
        }
      } catch (e) {}
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to catch 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If token expired, clear and allow relogin
      // but only if not checking auth
      if (!error.config.url.includes('/auth/me')) {
        localStorage.removeItem('nec_token');
        localStorage.removeItem('nec_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  demoLogin: (userId) => api.post('/auth/demo-login', { userId }),
  switchRole: (role) => api.post('/auth/switch-role', { role }),
  getMe: () => api.get('/auth/me'),
  getDemoUsers: () => api.get('/auth/demo-users'),
  getDirectory: () => api.get('/auth/directory')
};

// Seminar Hall endpoints
export const hallApi = {
  getHalls: () => api.get('/halls'),
  getAvailability: (date, hallId) => api.get('/halls/availability', { params: { date, hallId } }),
  getHallById: (id) => api.get(`/halls/${id}`)
};

// Booking endpoints
export const bookingApi = {
  create: (data) => api.post('/bookings', data),
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  updateStatus: (id, status, coordinatorRemarks) => 
    api.put(`/bookings/${id}/status`, { status, coordinatorRemarks }),
  acknowledgePass: (id) => api.put(`/bookings/${id}/acknowledge-pass`),
  cancel: (id, cancellationReason) => api.put(`/bookings/${id}/cancel`, { cancellationReason })
};

// Examiner Hospitality endpoints (HOD -> AO)
export const examinerApi = {
  create: (data) => api.post('/examiner-requests', data),
  getAll: (params) => api.get('/examiner-requests', { params }),
  getById: (id) => api.get(`/examiner-requests/${id}`),
  updateStatus: (id, status, aoRemarks, allocatedRoom) => 
    api.put(`/examiner-requests/${id}/status`, { status, aoRemarks, allocatedRoom })
};

// Department Stationary Requisition endpoints (Department / HOD -> AO)
export const stationaryApi = {
  create: (data) => api.post('/stationary-requests', data),
  getAll: (params) => api.get('/stationary-requests', { params }),
  getById: (id) => api.get(`/stationary-requests/${id}`),
  updateStatus: (id, status, aoRemarks, itemsSanctioned) => 
    api.put(`/stationary-requests/${id}/status`, { status, aoRemarks, itemsSanctioned }),
  delete: (id) => api.delete(`/stationary-requests/${id}`)
};

// Report endpoints
export const reportApi = {
  getCoordinatorUsage: (params) => api.get('/reports/coordinator/department-usage', { params }),
  getHodHallUsage: (params) => api.get('/reports/hod/hall-usage', { params }),
  getHodExaminerSanctions: (params) => api.get('/reports/hod/examiner-sanctions', { params }),
  getAoDepartmentSanctions: (params) => api.get('/reports/ao/department-sanctions', { params })
};

export default api;
