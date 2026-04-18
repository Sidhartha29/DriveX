/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROLE_DASHBOARD_ROUTE } from '../utils/constants'
import {
  loginUser,
  loginAdminWithPassword,
  loginWithFirebaseProvider,
  logoutFromFirebase,
  registerUser,
  requestFirebasePasswordReset,
} from '../services/authService'
import { useLocalStorage } from '../hooks/useLocalStorage'

const AuthContext = createContext(null)

const initialAuthState = {
  token: null,
  user: null,
}

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useLocalStorage('drivex_auth', initialAuthState)
  const navigate = useNavigate()

  const login = useCallback(async (payload) => {
    const response = await loginUser(payload)
    const expectedRole = payload?.expectedRole

    if (expectedRole && response?.user?.role !== expectedRole) {
      throw new Error(`Selected role is ${expectedRole}, but this account is ${response?.user?.role || 'unknown'}.`)
    }

    const nextState = {
      token: response.token,
      user: response.user,
    }

    setAuthState(nextState)
    navigate(ROLE_DASHBOARD_ROUTE[response.user.role] || '/', { replace: true })
    return response
  }, [setAuthState, navigate])

  const register = useCallback(async (payload) => {
    const response = await registerUser(payload)
    const nextState = {
      token: response.token,
      user: response.user,
    }

    setAuthState(nextState)
    navigate(ROLE_DASHBOARD_ROUTE[response.user.role] || '/', { replace: true })
    return response
  }, [setAuthState, navigate])

  const loginAdmin = useCallback(async (password) => {
    const response = await loginAdminWithPassword(password)
    const nextState = {
      token: response.token,
      user: response.user,
    }

    setAuthState(nextState)
    navigate(ROLE_DASHBOARD_ROUTE[response.user.role] || '/', { replace: true })
    return response
  }, [setAuthState, navigate])

  const loginWithSocial = useCallback(async (providerType) => {
    const response = await loginWithFirebaseProvider(providerType)
    const nextState = {
      token: response.token,
      user: response.user,
    }

    setAuthState(nextState)
    navigate(ROLE_DASHBOARD_ROUTE[response.user.role] || '/', { replace: true })
    return response
  }, [setAuthState, navigate])

  const logout = useCallback(async () => {
    try {
      await logoutFromFirebase()
    } finally {
      setAuthState(initialAuthState)
      navigate('/role-selection', { replace: true })
    }
  }, [setAuthState, navigate])

  const requestPasswordReset = useCallback(async (email) => {
    await requestFirebasePasswordReset(email)
  }, [])

  const updateCurrentUser = useCallback((patch) => {
    setAuthState((prev) => {
      if (!prev?.user) return prev
      return {
        ...prev,
        user: {
          ...prev.user,
          ...(typeof patch === 'function' ? patch(prev.user) : patch),
        },
      }
    })
  }, [setAuthState])

  const value = {
    token: authState.token,
    user: authState.user,
    isAuthenticated: Boolean(authState.token),
    login,
    loginAdmin,
    register,
    loginWithSocial,
    requestPasswordReset,
    updateCurrentUser,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider')
  }

  return context
}
