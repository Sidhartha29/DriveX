/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useRef, useState } from 'react'

const ToastContext = createContext(null)

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null)
  const timerRef = useRef(null)

  const showToast = useCallback((message, type = 'info', duration = 2600) => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setToast({ message, type })

    timerRef.current = window.setTimeout(() => {
      setToast(null)
    }, duration)
  }, [])

  const clearToast = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setToast(null)
  }, [])

  const value = { toast, showToast, clearToast }

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
}

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used inside ToastProvider')
  }

  return context
}
