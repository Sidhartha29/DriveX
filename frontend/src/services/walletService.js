import apiClient from './apiClient'

export const getMyWallet = async () => {
  const { data } = await apiClient.get('/api/wallet/me')
  return data?.data || { walletBalance: 0, recentTransactions: [], lowBalanceAlert: null }
}

export const topUpWallet = async (amount, paymentReference) => {
  const { data } = await apiClient.post('/api/wallet/mock-topup', { amount, paymentReference })
  return data?.data || data
}

export const createMockTopUpOrder = async (amount, paymentReference) => {
  const { data } = await apiClient.post('/api/wallet/mock-topup/order', { amount, paymentReference })
  return data?.data || data
}

export const triggerMockTopUpCallback = async (orderId) => {
  const { data } = await apiClient.post('/api/wallet/mock-topup/callback', { orderId })
  return data?.data || data
}

export const getMockTopUpStatus = async (orderId) => {
  const { data } = await apiClient.get(`/api/wallet/mock-topup/${orderId}/status`)
  return data?.data || data
}

export const getMyWalletTransactions = async () => {
  const { data } = await apiClient.get('/api/wallet/transactions')
  return Array.isArray(data?.data) ? data.data : []
}

export default {
  getMyWallet,
  topUpWallet,
  createMockTopUpOrder,
  triggerMockTopUpCallback,
  getMockTopUpStatus,
  getMyWalletTransactions
}
