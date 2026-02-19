import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({ baseURL: BASE_URL })

export const employeeAPI = {
  getAll: () => api.get('/employees/'),
  create: (data) => api.post('/employees/', data),
  delete: (id) => api.delete(`/employees/${id}/`),
}

export const attendanceAPI = {
  getAll: () => api.get('/attendance/'),
  getByEmployee: (employeeId) => api.get(`/attendance/employee/${employeeId}/`),
  create: (data) => api.post('/attendance/', data),
  filterByDate: (date) => api.get(`/attendance/?date=${date}`),
}

