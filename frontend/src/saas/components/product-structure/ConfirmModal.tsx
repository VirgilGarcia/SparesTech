import React from 'react'
import { AlertCircle } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean
  onConfirm: () => Promise<void>
  onClose: () => void
  title: string
  message: string
  type?: 'warning' | 'danger'
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onClose,
  title,
  message,
  type = 'warning'
}) => {
  if (!isOpen) return null

  const colors = {
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-600',
      button: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
    },
    danger: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      button: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
    }
  }

  const currentColors = colors[type]

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${isOpen ? 'block' : 'hidden'}`}>
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className={`relative bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4 ${currentColors.bg} ${currentColors.border} border`}>
        <div className="flex items-center mb-4">
          <AlertCircle className={`w-6 h-6 mr-3 ${currentColors.icon}`} />
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        <p className="text-gray-700 mb-6">{message}</p>
        <div className="flex justify-center space-x-4 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 ${currentColors.button}`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmModal