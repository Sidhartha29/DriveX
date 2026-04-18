import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://drivex-l06b.onrender.com',
  timeout: 12000,
})

// Request interceptor — inject JWT token
apiClient.interceptors.request.use((config) => {
  const authState = window.localStorage.getItem('drivex_auth')
  if (authState) {
    try {
      const { token } = JSON.parse(authState)
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch {
      // Invalid JSON in localStorage
    }
  }

  return config
})

// Response interceptor — handle 401 (expired/invalid token)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear stale auth and redirect to role selection
      window.localStorage.removeItem('drivex_auth')
      if (window.location.pathname !== '/role-selection') {
        window.location.href = '/role-selection'
      }
    }
    return Promise.reject(error)
  }
)

export default apiClient
