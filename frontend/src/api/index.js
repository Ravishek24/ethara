import axios from 'axios'

// Hard-code local API base to avoid env misconfig issues during dev.
// Adjust to use VITE_API_URL again when deploying.
const api = axios.create({ baseURL: 'http://localhost:8000/api' })

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

