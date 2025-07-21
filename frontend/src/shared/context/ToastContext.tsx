import React, { createContext, useContext, useState, type ReactNode } from 'react'
import { Toast } from '../components/ui/Toast'

export interface ToastMessage {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface ToastContextType {
  showToast: (message: string, type: ToastMessage['type'], duration?: number) => void
  showSuccess: (message: string, duration?: number) => void
  showError: (message: string, duration?: number) => void
  showWarning: (message: string, duration?: number) => void
  showInfo: (message: string, duration?: number) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

interface ToastProviderProps {
  children: ReactNode
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const showToast = (message: string, type: ToastMessage['type'], duration = 5000) => {
    const id = Math.random().toString(36).substring(2, 9)
    const newToast: ToastMessage = { id, message, type, duration }
    
    setToasts(prev => [...prev, newToast])
  }

  const showSuccess = (message: string, duration?: number) => {
    showToast(message, 'success', duration)
  }

  const showError = (message: string, duration?: number) => {
    showToast(message, 'error', duration)
  }

  const showWarning = (message: string, duration?: number) => {
    showToast(message, 'warning', duration)
  }

  const showInfo = (message: string, duration?: number) => {
    showToast(message, 'info', duration)
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const contextValue: ToastContextType = {
    showToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    removeToast
  }

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Container pour tous les toasts */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            isVisible={true}
            onClose={() => removeToast(toast.id)}
            duration={toast.duration}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext)
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}