import apiClient from './apiClient'

const normalizeUser = (user) => ({
  ...user,
  id: user.id || user._id,
  role: String(user.role || 'customer').toLowerCase(),
})

export const getUsers = async () => {
  try {
    const { data } = await apiClient.get('/api/admin/users')
    // Backend wraps in { success, data: [...] }
    const users = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []
    return users.map(normalizeUser)
  } catch {
    return [
      { _id: '1', name: 'Rajesh Kumar', email: 'rajesh@drivex.in', role: 'customer' },
      { _id: '2', name: 'Pooja Sharma', email: 'pooja@drivex.in', role: 'manager' },
      { _id: '3', name: 'Vikram Patel', email: 'vikram@drivex.in', role: 'admin' },
    ].map(normalizeUser)
  }
}

export const deleteUser = (id) => apiClient.delete(`/api/admin/users/${id}`)

export const updateUserRole = (id, role) =>
  apiClient.put(`/api/admin/users/${id}/role`, { role })
