import apiClient from './apiClient'
import {
  firebaseAuth,
  googleProvider,
  isFirebaseConfigured,
} from '../config/firebase'
import { sendPasswordResetEmail, signInWithPopup, signOut } from 'firebase/auth'

export const loginUser = async (payload) => {
  const { email, password, expectedRole } = payload || {}
  const normalizedEmail = String(email || '').trim().toLowerCase()
  const normalizedPassword = String(password || '').trim()
  const endpoint = expectedRole === 'driver' ? '/api/auth/driver-login' : '/api/auth/login'
  const body = expectedRole === 'driver'
    ? { email: normalizedEmail, accessCode: normalizedPassword }
    : { email: normalizedEmail, password: normalizedPassword }
  const { data } = await apiClient.post(endpoint, body)
  return data
}

export const registerUser = async (payload) => {
  const { data } = await apiClient.post('/api/auth/register', payload)
  return data
}

export const loginAdminWithPassword = async (password) => {
  const { data } = await apiClient.post('/api/auth/admin-password-login', { password })
  return data
}

export const loginWithFirebaseProvider = async (providerType) => {
  if (!isFirebaseConfigured || !firebaseAuth) {
    throw new Error('Firebase is not configured. Add your Vite Firebase env variables first.')
  }

  if (providerType !== 'google') {
    throw new Error('Only Google sign-in is enabled.')
  }

  const result = await signInWithPopup(firebaseAuth, googleProvider)
  const idToken = await result.user.getIdToken()

  const { data } = await apiClient.post('/api/auth/firebase', {
    idToken,
    provider: providerType,
  })

  return data
}

export const logoutFromFirebase = async () => {
  if (!firebaseAuth) {
    return
  }

  await signOut(firebaseAuth)
}

export const requestFirebasePasswordReset = async (email) => {
  if (!email) {
    throw new Error('Please provide an email address.')
  }

  if (!isFirebaseConfigured || !firebaseAuth) {
    throw new Error('Firebase is not configured. Add your Vite Firebase env variables first.')
  }

  await sendPasswordResetEmail(firebaseAuth, email)
}
